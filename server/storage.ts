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
  createLoreEntry(entry: InsertLoreEntry): Promise<LoreEntry>;
  updateLoreEntry(id: string, updates: Partial<InsertLoreEntry>): Promise<LoreEntry | undefined>;
  deleteLoreEntry(id: string): Promise<boolean>;

  // Documents
  getDocuments(campaignId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  // Audit Logs
  getAuditLogs(campaignId: string): Promise<AuditLog[]>;
  recordAudit(
    campaignId: string,
    entity: 'campaign' | 'event' | 'character' | 'plot' | 'lore' | 'document',
    entityId: string,
    action: 'create' | 'update' | 'delete',
    oldValue: any,
    newValue: any,
    source?: 'manual' | 'import',
    importBatchId?: string,
    details?: string
  ): Promise<AuditLog>;

  // Rollback
  rollbackImportBatch(importBatchId: string): Promise<{ success: boolean, restoredCount: number, deletedCount: number }>;
  rollbackToTimestamp(campaignId: string, timestamp: Date): Promise<{ success: boolean, changesReverted: number }>;

  // Import Specific Helpers
  createCharacterFromImport(insertCharacter: InsertCharacter, importBatchId: string, filename: string): Promise<Character>;
  createTimelineEventFromImport(insertEvent: InsertTimelineEvent, importBatchId: string, filename: string): Promise<TimelineEvent>;
  createPlotFromImport(insertPlot: InsertPlot, importBatchId: string, filename: string): Promise<Plot>;
  createLoreEntryFromImport(insertLore: InsertLoreEntry, importBatchId: string, filename: string): Promise<LoreEntry>;
}


export class InMemoryStorage implements IStorage {
  private campaigns = new Map<string, Campaign>();
  private timelineEvents = new Map<string, TimelineEvent>();
  private characters = new Map<string, Character>();
  private plots = new Map<string, Plot>();
  private loreEntries = new Map<string, LoreEntry>();
  private documents = new Map<string, Document>();
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    this.createCampaign({ name: 'The Lost Mines of Phandelver' }).then(campaign => {
        this.createCharacter({
            campaignId: campaign.id,
            name: 'Gundren Rockseeker',
            race: 'Dwarf',
            characterClass: 'Patron',
            isNPC: true,
            biography: 'A jovial dwarf and the quest giver for the main adventure.',
        });

        this.createTimelineEvent({
            campaignId: campaign.id,
            title: 'Ambush on the Triboar Trail',
            description: 'The party is ambushed by goblins on their way to Phandalin.',
            eventType: 'Encounter',
        });
    });
  }

  // Campaigns
  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const newCampaign: Campaign = {
      id,
      name: campaign.name,
      description: campaign.description ?? null,
      currentSession: campaign.currentSession ?? null,
      partyLevel: campaign.partyLevel ?? null,
      lastPlayed: new Date(),
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }
  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  // Timeline Events
  async getTimelineEvents(campaignId: string): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values()).filter(e => e.campaignId === campaignId);
  }
  async getTimelineEvent(id: string): Promise<TimelineEvent | undefined> {
    return this.timelineEvents.get(id);
  }
  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const id = randomUUID();
    const newEvent: TimelineEvent = {
      id,
      campaignId: event.campaignId,
      title: event.title,
      eventType: event.eventType,
      description: event.description ?? null,
      linkedCharacters: event.linkedCharacters ?? null,
      gameDate: event.gameDate ?? null,
      realDate: new Date(),
      linkedPlots: event.linkedPlots ?? null,
      linkedLocations: event.linkedLocations ?? null,
    };
    this.timelineEvents.set(id, newEvent);
    return newEvent;
  }
  async updateTimelineEvent(id: string, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const event = this.timelineEvents.get(id);
    if (event) {
      const updatedEvent = { ...event, ...updates };
      this.timelineEvents.set(id, updatedEvent);
      return updatedEvent;
    }
    return undefined;
  }
  async deleteTimelineEvent(id: string): Promise<boolean> {
    return this.timelineEvents.delete(id);
  }

  // Characters
  async getCharacters(campaignId: string): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(c => c.campaignId === campaignId);
  }
  async getCharacter(id: string): Promise<Character | undefined> {
    return this.characters.get(id);
  }
  async createCharacter(character: InsertCharacter): Promise<Character> {
    const id = randomUUID();
    const newCharacter: Character = {
      id,
      campaignId: character.campaignId,
      name: character.name,
      race: character.race ?? null,
      characterClass: character.characterClass ?? null,
      alignment: character.alignment ?? null,
      isNPC: character.isNPC ?? null,
      biography: character.biography ?? null,
      notes: character.notes ?? null,
      appearanceCount: null,
    };
    this.characters.set(id, newCharacter);
    return newCharacter;
  }
  async updateCharacter(id: string, updates: Partial<InsertCharacter>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (character) {
      const updatedCharacter = { ...character, ...updates };
      this.characters.set(id, updatedCharacter);
      return updatedCharacter;
    }
    return undefined;
  }
  async deleteCharacter(id: string): Promise<boolean> {
    return this.characters.delete(id);
  }

  // Plots
  async getPlots(campaignId: string): Promise<Plot[]> {
    return Array.from(this.plots.values()).filter(p => p.campaignId === campaignId);
  }
  async getPlot(id: string): Promise<Plot | undefined> {
    return this.plots.get(id);
  }
  async createPlot(plot: InsertPlot): Promise<Plot> {
    const id = randomUUID();
    const newPlot: Plot = {
      id,
      campaignId: plot.campaignId,
      title: plot.title,
      description: plot.description ?? null,
      status: plot.status ?? 'active',
      plotType: plot.plotType ?? 'main',
      linkedCharacters: plot.linkedCharacters ?? null,
      linkedEvents: plot.linkedEvents ?? null,
    };
    this.plots.set(id, newPlot);
    return newPlot;
  }
  async updatePlot(id: string, updates: Partial<InsertPlot>): Promise<Plot | undefined> {
    const plot = this.plots.get(id);
    if (plot) {
      const updatedPlot = { ...plot, ...updates };
      this.plots.set(id, updatedPlot);
      return updatedPlot;
    }
    return undefined;
  }
  async deletePlot(id: string): Promise<boolean> {
    return this.plots.delete(id);
  }

  // Lore
  async getLoreEntries(campaignId: string): Promise<LoreEntry[]> {
    return Array.from(this.loreEntries.values()).filter(l => l.campaignId === campaignId);
  }
  async getLoreEntry(id: string): Promise<LoreEntry | undefined> {
    return this.loreEntries.get(id);
  }
  async createLoreEntry(entry: InsertLoreEntry): Promise<LoreEntry> {
    const id = randomUUID();
    const newEntry: LoreEntry = {
      id,
      campaignId: entry.campaignId,
      title: entry.title,
      category: entry.category,
      content: entry.content ?? null,
      isSecret: entry.isSecret ?? null,
      tags: entry.tags ?? null,
    };
    this.loreEntries.set(id, newEntry);
    return newEntry;
  }
  async updateLoreEntry(id: string, updates: Partial<InsertLoreEntry>): Promise<LoreEntry | undefined> {
    const entry = this.loreEntries.get(id);
    if (entry) {
      const updatedEntry = { ...entry, ...updates };
      this.loreEntries.set(id, updatedEntry);
      return updatedEntry;
    }
    return undefined;
  }
  async deleteLoreEntry(id: string): Promise<boolean> {
    return this.loreEntries.delete(id);
  }

  // Documents
  async getDocuments(campaignId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(d => d.campaignId === campaignId);
  }
  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const newDoc: Document = {
      id,
      campaignId: doc.campaignId,
      filename: doc.filename,
      content: doc.content ?? null,
      uploadDate: new Date(),
      processed: false,
    };
    this.documents.set(id, newDoc);
    return newDoc;
  }
  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const doc = this.documents.get(id);
    if (doc) {
      const updatedDoc = { ...doc, ...updates };
      this.documents.set(id, updatedDoc);
      return updatedDoc;
    }
    return undefined;
  }
  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Audit Logs
  async getAuditLogs(campaignId: string): Promise<AuditLog[]> {
    return this.auditLogs.filter(log => log.campaignId === campaignId);
  }

  async recordAudit(
    campaignId: string,
    entity: 'campaign' | 'event' | 'character' | 'plot' | 'lore' | 'document',
    entityId: string,
    action: 'create' | 'update' | 'delete',
    oldValue: any,
    newValue: any,
    source: 'manual' | 'import' = 'manual',
    importBatchId?: string,
    details?: string
  ): Promise<AuditLog> {
    const logEntry: AuditLog = {
      id: randomUUID(),
      campaignId,
      entityType: entity,
      entityId,
      action,
      timestamp: new Date(),
      oldData: JSON.stringify(oldValue),
      newData: JSON.stringify(newValue),
      source,
      importBatchId: importBatchId ?? null,
      metadata: details ?? null,
    };
    this.auditLogs.push(logEntry);
    return logEntry;
  }

  // Rollback
  async rollbackImportBatch(importBatchId: string): Promise<{ success: boolean; restoredCount: number; deletedCount: number; }> {
    console.log(`Rolling back import batch: ${importBatchId}`);
    return { success: true, restoredCount: 0, deletedCount: 0 };
  }

  async rollbackToTimestamp(campaignId: string, timestamp: Date): Promise<{ success: boolean; changesReverted: number; }> {
    console.log(`Rolling back campaign ${campaignId} to timestamp: ${timestamp}`);
    return { success: true, changesReverted: 0 };
  }

  // Import Specific Helpers
  async createCharacterFromImport(insertCharacter: InsertCharacter, importBatchId: string, filename: string): Promise<Character> {
    const character = await this.createCharacter(insertCharacter);
    await this.recordAudit(
      insertCharacter.campaignId,
      'character',
      character.id,
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
    const event = await this.createTimelineEvent(insertEvent);
    await this.recordAudit(
      insertEvent.campaignId,
      'event',
      event.id,
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
    const plot = await this.createPlot(insertPlot);
    await this.recordAudit(
      insertPlot.campaignId,
      'plot',
      plot.id,
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
    const lore = await this.createLoreEntry(insertLore);
    await this.recordAudit(
      insertLore.campaignId,
      'lore',
      lore.id,
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

export const storage: IStorage = new InMemoryStorage();