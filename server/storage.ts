import { 
  type Campaign, type InsertCampaign,
  type TimelineEvent, type InsertTimelineEvent,
  type Character, type InsertCharacter,
  type Plot, type InsertPlot,
  type LoreEntry, type InsertLoreEntry,
  type Document, type InsertDocument,
  type AuditLog, type InsertAuditLog
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Campaigns
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getAllCampaigns(): Promise<Campaign[]>;
  
  // Timeline Events
  getTimelineEvents(campaignId: string): Promise<TimelineEvent[]>;
  getTimelineEvent(id: string): Promise<TimelineEvent | undefined>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  updateTimelineEvent(id: string, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteTimelineEvent(id: string): Promise<boolean>;
  
  // Characters
  getCharacters(campaignId: string): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, updates: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: string): Promise<boolean>;
  
  // Plots
  getPlots(campaignId: string): Promise<Plot[]>;
  getPlot(id: string): Promise<Plot | undefined>;
  createPlot(plot: InsertPlot): Promise<Plot>;
  updatePlot(id: string, updates: Partial<InsertPlot>): Promise<Plot | undefined>;
  deletePlot(id: string): Promise<boolean>;
  
  // Lore
  getLoreEntries(campaignId: string): Promise<LoreEntry[]>;
  getLoreEntry(id: string): Promise<LoreEntry | undefined>;
  createLoreEntry(lore: InsertLoreEntry): Promise<LoreEntry>;
  updateLoreEntry(id: string, updates: Partial<InsertLoreEntry>): Promise<LoreEntry | undefined>;
  deleteLoreEntry(id: string): Promise<boolean>;
  
  // Documents
  getDocuments(campaignId: string): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  
  // Import-specific methods with batch tracking
  createCharacterFromImport(character: InsertCharacter, importBatchId: string, filename: string): Promise<Character>;
  createTimelineEventFromImport(event: InsertTimelineEvent, importBatchId: string, filename: string): Promise<TimelineEvent>;
  createPlotFromImport(plot: InsertPlot, importBatchId: string, filename: string): Promise<Plot>;
  createLoreEntryFromImport(lore: InsertLoreEntry, importBatchId: string, filename: string): Promise<LoreEntry>;
  
  // Audit Log
  getAuditLog(campaignId: string, limit?: number): Promise<AuditLog[]>;
  getAuditLogForEntity(entityId: string): Promise<AuditLog[]>;
  getAuditLogForImportBatch(importBatchId: string): Promise<AuditLog[]>;
  createAuditEntry(entry: InsertAuditLog): Promise<AuditLog>;
  
  // Rollback
  rollbackImportBatch(importBatchId: string): Promise<{ success: boolean; restoredCount: number; deletedCount: number }>;
  rollbackToTimestamp(campaignId: string, timestamp: Date): Promise<{ success: boolean; changesReverted: number }>;
}

export class MemStorage implements IStorage {
  private campaigns: Map<string, Campaign>;
  private timelineEvents: Map<string, TimelineEvent>;
  private characters: Map<string, Character>;
  private plots: Map<string, Plot>;
  private loreEntries: Map<string, LoreEntry>;
  private documents: Map<string, Document>;
  private auditLog: Map<string, AuditLog>;

  constructor() {
    this.campaigns = new Map();
    this.timelineEvents = new Map();
    this.characters = new Map();
    this.plots = new Map();
    this.loreEntries = new Map();
    this.documents = new Map();
    this.auditLog = new Map();
    
    // Create a default campaign
    this.createDefaultCampaign();
  }

  private async createDefaultCampaign() {
    const defaultCampaign: Campaign = {
      id: "default-campaign",
      name: "The Lost Crown",
      description: "A high-fantasy adventure seeking the legendary Crown of Storms",
      currentSession: "12",
      partyLevel: "8",
      lastPlayed: new Date("2024-11-15"),
    };
    this.campaigns.set(defaultCampaign.id, defaultCampaign);
  }

  // Campaigns
  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = { 
      ...insertCampaign, 
      id,
      lastPlayed: new Date(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  // Timeline Events
  async getTimelineEvents(campaignId: string): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values())
      .filter(event => event.campaignId === campaignId)
      .sort((a, b) => new Date(b.realDate).getTime() - new Date(a.realDate).getTime());
  }

  async getTimelineEvent(id: string): Promise<TimelineEvent | undefined> {
    return this.timelineEvents.get(id);
  }

  async createTimelineEvent(insertEvent: InsertTimelineEvent): Promise<TimelineEvent> {
    const id = randomUUID();
    const event: TimelineEvent = { 
      ...insertEvent, 
      id,
      realDate: new Date(),
    };
    this.timelineEvents.set(id, event);
    
    // Record audit entry
    await this.recordAudit(
      insertEvent.campaignId,
      'event',
      id,
      'create',
      null,
      event,
      'manual'
    );
    
    return event;
  }

  async updateTimelineEvent(id: string, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const event = this.timelineEvents.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.timelineEvents.set(id, updatedEvent);
    
    // Record audit entry
    await this.recordAudit(
      event.campaignId,
      'event',
      id,
      'update',
      event,
      updatedEvent,
      'manual'
    );
    
    return updatedEvent;
  }

  async deleteTimelineEvent(id: string): Promise<boolean> {
    const event = this.timelineEvents.get(id);
    if (!event) return false;
    
    const deleted = this.timelineEvents.delete(id);
    if (deleted) {
      // Record audit entry
      await this.recordAudit(
        event.campaignId,
        'event',
        id,
        'delete',
        event,
        null,
        'manual'
      );
    }
    return deleted;
  }

  // Characters
  async getCharacters(campaignId: string): Promise<Character[]> {
    return Array.from(this.characters.values())
      .filter(char => char.campaignId === campaignId);
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = randomUUID();
    const character: Character = { 
      ...insertCharacter, 
      id,
      appearanceCount: "0",
    };
    this.characters.set(id, character);
    
    // Record audit entry
    await this.recordAudit(
      insertCharacter.campaignId,
      'character',
      id,
      'create',
      null,
      character,
      'manual'
    );
    
    return character;
  }

  async updateCharacter(id: string, updates: Partial<InsertCharacter>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;
    
    const updatedCharacter = { ...character, ...updates };
    this.characters.set(id, updatedCharacter);
    
    // Record audit entry
    await this.recordAudit(
      character.campaignId,
      'character',
      id,
      'update',
      character,
      updatedCharacter,
      'manual'
    );
    
    return updatedCharacter;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    const character = this.characters.get(id);
    if (!character) return false;
    
    const deleted = this.characters.delete(id);
    if (deleted) {
      // Record audit entry
      await this.recordAudit(
        character.campaignId,
        'character',
        id,
        'delete',
        character,
        null,
        'manual'
      );
    }
    return deleted;
  }

  // Plots
  async getPlots(campaignId: string): Promise<Plot[]> {
    return Array.from(this.plots.values())
      .filter(plot => plot.campaignId === campaignId);
  }

  async getPlot(id: string): Promise<Plot | undefined> {
    return this.plots.get(id);
  }

  async createPlot(insertPlot: InsertPlot): Promise<Plot> {
    const id = randomUUID();
    const plot: Plot = { 
      ...insertPlot, 
      id,
    };
    this.plots.set(id, plot);
    
    // Record audit entry
    await this.recordAudit(
      insertPlot.campaignId,
      'plot',
      id,
      'create',
      null,
      plot,
      'manual'
    );
    
    return plot;
  }

  async updatePlot(id: string, updates: Partial<InsertPlot>): Promise<Plot | undefined> {
    const plot = this.plots.get(id);
    if (!plot) return undefined;
    
    const updatedPlot = { ...plot, ...updates };
    this.plots.set(id, updatedPlot);
    
    // Record audit entry
    await this.recordAudit(
      plot.campaignId,
      'plot',
      id,
      'update',
      plot,
      updatedPlot,
      'manual'
    );
    
    return updatedPlot;
  }

  async deletePlot(id: string): Promise<boolean> {
    const plot = this.plots.get(id);
    if (!plot) return false;
    
    const deleted = this.plots.delete(id);
    if (deleted) {
      // Record audit entry
      await this.recordAudit(
        plot.campaignId,
        'plot',
        id,
        'delete',
        plot,
        null,
        'manual'
      );
    }
    return deleted;
  }

  // Lore
  async getLoreEntries(campaignId: string): Promise<LoreEntry[]> {
    return Array.from(this.loreEntries.values())
      .filter(lore => lore.campaignId === campaignId);
  }

  async getLoreEntry(id: string): Promise<LoreEntry | undefined> {
    return this.loreEntries.get(id);
  }

  async createLoreEntry(insertLore: InsertLoreEntry): Promise<LoreEntry> {
    const id = randomUUID();
    const lore: LoreEntry = { 
      ...insertLore, 
      id,
    };
    this.loreEntries.set(id, lore);
    
    // Record audit entry
    await this.recordAudit(
      insertLore.campaignId,
      'lore',
      id,
      'create',
      null,
      lore,
      'manual'
    );
    
    return lore;
  }

  async updateLoreEntry(id: string, updates: Partial<InsertLoreEntry>): Promise<LoreEntry | undefined> {
    const lore = this.loreEntries.get(id);
    if (!lore) return undefined;
    
    const updatedLore = { ...lore, ...updates };
    this.loreEntries.set(id, updatedLore);
    
    // Record audit entry
    await this.recordAudit(
      lore.campaignId,
      'lore',
      id,
      'update',
      lore,
      updatedLore,
      'manual'
    );
    
    return updatedLore;
  }

  async deleteLoreEntry(id: string): Promise<boolean> {
    const lore = this.loreEntries.get(id);
    if (!lore) return false;
    
    const deleted = this.loreEntries.delete(id);
    if (deleted) {
      // Record audit entry
      await this.recordAudit(
        lore.campaignId,
        'lore',
        id,
        'delete',
        lore,
        null,
        'manual'
      );
    }
    return deleted;
  }

  // Documents
  async getDocuments(campaignId: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.campaignId === campaignId);
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const doc: Document = { 
      ...insertDoc, 
      id,
      uploadDate: new Date(),
      processed: false,
    };
    this.documents.set(id, doc);
    return doc;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    
    const updatedDoc = { ...doc, ...updates };
    this.documents.set(id, updatedDoc);
    return updatedDoc;
  }

  // Helper method to create audit entries
  private async recordAudit(
    campaignId: string,
    entityType: string,
    entityId: string,
    action: 'create' | 'update' | 'delete',
    oldData: any,
    newData: any,
    source: 'manual' | 'import' | 'ai-processing',
    importBatchId?: string,
    metadata?: string
  ): Promise<void> {
    const auditEntry: AuditLog = {
      id: randomUUID(),
      campaignId,
      entityType,
      entityId,
      action,
      oldData: oldData ? JSON.stringify(oldData) : null,
      newData: newData ? JSON.stringify(newData) : null,
      source,
      importBatchId: importBatchId || null,
      timestamp: new Date(),
      metadata: metadata || null,
    };
    this.auditLog.set(auditEntry.id, auditEntry);
  }

  // Audit Log Methods
  async getAuditLog(campaignId: string, limit = 100): Promise<AuditLog[]> {
    return Array.from(this.auditLog.values())
      .filter(entry => entry.campaignId === campaignId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getAuditLogForEntity(entityId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLog.values())
      .filter(entry => entry.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getAuditLogForImportBatch(importBatchId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLog.values())
      .filter(entry => entry.importBatchId === importBatchId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createAuditEntry(entry: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const auditEntry: AuditLog = {
      ...entry,
      id,
      timestamp: new Date(),
    };
    this.auditLog.set(id, auditEntry);
    return auditEntry;
  }

  // Rollback Methods
  async rollbackImportBatch(importBatchId: string): Promise<{ success: boolean; restoredCount: number; deletedCount: number }> {
    try {
      const batchEntries = await this.getAuditLogForImportBatch(importBatchId);
      let restoredCount = 0;
      let deletedCount = 0;

      // Process in reverse chronological order to undo changes properly
      for (const entry of batchEntries.reverse()) {
        if (entry.action === 'create') {
          // Delete the created item
          switch (entry.entityType) {
            case 'character':
              if (this.characters.delete(entry.entityId)) deletedCount++;
              break;
            case 'event':
              if (this.timelineEvents.delete(entry.entityId)) deletedCount++;
              break;
            case 'plot':
              if (this.plots.delete(entry.entityId)) deletedCount++;
              break;
            case 'lore':
              if (this.loreEntries.delete(entry.entityId)) deletedCount++;
              break;
            case 'document':
              if (this.documents.delete(entry.entityId)) deletedCount++;
              break;
          }
        } else if (entry.action === 'update' && entry.oldData) {
          // Restore the old data
          try {
            const oldData = JSON.parse(entry.oldData);
            switch (entry.entityType) {
              case 'character':
                this.characters.set(entry.entityId, oldData);
                restoredCount++;
                break;
              case 'event':
                this.timelineEvents.set(entry.entityId, oldData);
                restoredCount++;
                break;
              case 'plot':
                this.plots.set(entry.entityId, oldData);
                restoredCount++;
                break;
              case 'lore':
                this.loreEntries.set(entry.entityId, oldData);
                restoredCount++;
                break;
              case 'document':
                this.documents.set(entry.entityId, oldData);
                restoredCount++;
                break;
            }
          } catch (error) {
            console.error('Failed to restore data from audit log:', error);
          }
        }
      }

      return { success: true, restoredCount, deletedCount };
    } catch (error) {
      console.error('Rollback failed:', error);
      return { success: false, restoredCount: 0, deletedCount: 0 };
    }
  }

  async rollbackToTimestamp(campaignId: string, timestamp: Date): Promise<{ success: boolean; changesReverted: number }> {
    try {
      const entriesToRollback = Array.from(this.auditLog.values())
        .filter(entry => 
          entry.campaignId === campaignId && 
          new Date(entry.timestamp) > timestamp
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      let changesReverted = 0;

      for (const entry of entriesToRollback) {
        if (entry.action === 'create') {
          // Delete the created item
          switch (entry.entityType) {
            case 'character':
              if (this.characters.delete(entry.entityId)) changesReverted++;
              break;
            case 'event':
              if (this.timelineEvents.delete(entry.entityId)) changesReverted++;
              break;
            case 'plot':
              if (this.plots.delete(entry.entityId)) changesReverted++;
              break;
            case 'lore':
              if (this.loreEntries.delete(entry.entityId)) changesReverted++;
              break;
            case 'document':
              if (this.documents.delete(entry.entityId)) changesReverted++;
              break;
          }
        } else if (entry.action === 'update' && entry.oldData) {
          // Restore the old data
          try {
            const oldData = JSON.parse(entry.oldData);
            switch (entry.entityType) {
              case 'character':
                this.characters.set(entry.entityId, oldData);
                changesReverted++;
                break;
              case 'event':
                this.timelineEvents.set(entry.entityId, oldData);
                changesReverted++;
                break;
              case 'plot':
                this.plots.set(entry.entityId, oldData);
                changesReverted++;
                break;
              case 'lore':
                this.loreEntries.set(entry.entityId, oldData);
                changesReverted++;
                break;
              case 'document':
                this.documents.set(entry.entityId, oldData);
                changesReverted++;
                break;
            }
          } catch (error) {
            console.error('Failed to restore data from audit log:', error);
          }
        } else if (entry.action === 'delete' && entry.oldData) {
          // Restore the deleted item
          try {
            const oldData = JSON.parse(entry.oldData);
            switch (entry.entityType) {
              case 'character':
                this.characters.set(entry.entityId, oldData);
                changesReverted++;
                break;
              case 'event':
                this.timelineEvents.set(entry.entityId, oldData);
                changesReverted++;
                break;
              case 'plot':
                this.plots.set(entry.entityId, oldData);
                changesReverted++;
                break;
              case 'lore':
                this.loreEntries.set(entry.entityId, oldData);
                changesReverted++;
                break;
              case 'document':
                this.documents.set(entry.entityId, oldData);
                changesReverted++;
                break;
            }
          } catch (error) {
            console.error('Failed to restore deleted data from audit log:', error);
          }
        }
      }

      return { success: true, changesReverted };
    } catch (error) {
      console.error('Timestamp rollback failed:', error);
      return { success: false, changesReverted: 0 };
    }
  }

  // Import-specific methods with batch tracking
  async createCharacterFromImport(insertCharacter: InsertCharacter, importBatchId: string, filename: string): Promise<Character> {
    const id = randomUUID();
    const character: Character = { 
      ...insertCharacter, 
      id,
      appearanceCount: "0",
    };
    this.characters.set(id, character);
    
    // Record audit entry with import tracking
    await this.recordAudit(
      insertCharacter.campaignId,
      'character',
      id,
      'create',
      null,
      character,
      'import',
      importBatchId,
      `Imported from ${filename}`
    );
    
    return character;
  }

  async createTimelineEventFromImport(insertEvent: InsertTimelineEvent, importBatchId: string, filename: string): Promise<TimelineEvent> {
    const id = randomUUID();
    const event: TimelineEvent = { 
      ...insertEvent, 
      id,
      realDate: new Date(),
    };
    this.timelineEvents.set(id, event);
    
    // Record audit entry with import tracking
    await this.recordAudit(
      insertEvent.campaignId,
      'event',
      id,
      'create',
      null,
      event,
      'import',
      importBatchId,
      `Imported from ${filename}`
    );
    
    return event;
  }

  async createPlotFromImport(insertPlot: InsertPlot, importBatchId: string, filename: string): Promise<Plot> {
    const id = randomUUID();
    const plot: Plot = { 
      ...insertPlot, 
      id,
    };
    this.plots.set(id, plot);
    
    // Record audit entry with import tracking
    await this.recordAudit(
      insertPlot.campaignId,
      'plot',
      id,
      'create',
      null,
      plot,
      'import',
      importBatchId,
      `Imported from ${filename}`
    );
    
    return plot;
  }

  async createLoreEntryFromImport(insertLore: InsertLoreEntry, importBatchId: string, filename: string): Promise<LoreEntry> {
    const id = randomUUID();
    const lore: LoreEntry = { 
      ...insertLore, 
      id,
    };
    this.loreEntries.set(id, lore);
    
    // Record audit entry with import tracking
    await this.recordAudit(
      insertLore.campaignId,
      'lore',
      id,
      'create',
      null,
      lore,
      'import',
      importBatchId,
      `Imported from ${filename}`
    );
    
    return lore;
  }
}

export const storage = new MemStorage();
