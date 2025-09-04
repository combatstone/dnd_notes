import {
  type Campaign,
  type InsertCampaign,
  type TimelineEvent,
  type InsertTimelineEvent,
  type Character,
  type InsertCharacter,
  type Plot,
  type InsertPlot,
  type LoreEntry,
  type InsertLoreEntry,
  type Document,
  type InsertDocument,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Campaigns
  getCampaign(id: string): Campaign | undefined;
  createCampaign(campaign: InsertCampaign): Campaign;
  getAllCampaigns(): Campaign[];

  // Timeline Events
  getTimelineEvents(campaignId: string): TimelineEvent[];
  getTimelineEvent(id: string): TimelineEvent | undefined;
  createTimelineEvent(event: InsertTimelineEvent): TimelineEvent;
  updateTimelineEvent(
    id: string,
    updates: Partial<InsertTimelineEvent>
  ): TimelineEvent | undefined;
  deleteTimelineEvent(id: string): boolean;

  // Characters
  getCharacters(campaignId: string): Character[];
  getCharacter(id: string): Character | undefined;
  createCharacter(character: InsertCharacter): Character;
  updateCharacter(
    id: string,
    updates: Partial<InsertCharacter>
  ): Character | undefined;
  deleteCharacter(id: string): boolean;

  // Plots
  getPlots(campaignId: string): Plot[];
  getPlot(id: string): Plot | undefined;
  createPlot(plot: InsertPlot): Plot;
  updatePlot(id: string, updates: Partial<InsertPlot>): Plot | undefined;
  deletePlot(id: string): boolean;

  // Lore Entries
  getLoreEntries(campaignId: string): LoreEntry[];
  getLoreEntry(id: string): LoreEntry | undefined;
  createLoreEntry(entry: InsertLoreEntry): LoreEntry;
  updateLoreEntry(
    id: string,
    updates: Partial<InsertLoreEntry>
  ): LoreEntry | undefined;
  deleteLoreEntry(id: string): boolean;

  // Documents
  getDocument(id: string): Document | undefined;
  createDocument(document: InsertDocument): Document;

  // Audit Log
  recordAudit(
    campaignId: string,
    entityType: string,
    entityId: string,
    action: string,
    oldData: any,
    newData: any,
    source: string,
    importBatchId?: string,
    metadata?: string
  ): AuditLog;
  getAuditLog(campaignId: string): AuditLog[];
}

export class InMemoryStorage implements IStorage {
  private campaigns: Campaign[] = [];
  private timelineEvents: TimelineEvent[] = [];
  private characters: Character[] = [];
  private plots: Plot[] = [];
  private loreEntries: LoreEntry[] = [];
  private documents: Document[] = [];
  private auditLog: AuditLog[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    if (this.campaigns.length === 0) {
      const initialCampaign = this.createCampaign({
        name: "The Dragon's Demise",
        description: "A quest to slay the great dragon, Ignis.",
      });
      const campaignId = initialCampaign.id;

      this.createTimelineEvent({
        campaignId,
        title: "The Village of Oakhaven Attacked",
        description: "A fierce dragon attack left the village in ruins.",
        gameDate: "1st of Eleint, 1491 DR",
        eventType: "Event",
      });
      this.createCharacter({
        campaignId,
        name: "Sir Kael",
        bio: "A valiant knight.",
        isPlayerCharacter: true,
      });
      this.createPlot({
        campaignId,
        name: "The Dragon's Lair",
        description: "Find and defeat the dragon.",
      });
    }
  }

  // Campaigns
  getCampaign(id: string): Campaign | undefined {
    return this.campaigns.find((c) => c.id === id);
  }
  createCampaign(campaign: InsertCampaign): Campaign {
    const newCampaign: Campaign = {
      id: randomUUID(),
      name: campaign.name,
      description: campaign.description ?? null,
      currentSession: "1",
      partyLevel: "1",
      lastPlayed: new Date(),
    };
    this.campaigns.push(newCampaign);
    return newCampaign;
  }
  getAllCampaigns(): Campaign[] {
    return this.campaigns;
  }

  // Timeline Events
  getTimelineEvents(campaignId: string): TimelineEvent[] {
    return this.timelineEvents.filter((e) => e.campaignId === campaignId);
  }
  getTimelineEvent(id: string): TimelineEvent | undefined {
    return this.timelineEvents.find((e) => e.id === id);
  }
  createTimelineEvent(event: InsertTimelineEvent): TimelineEvent {
    const newEvent: TimelineEvent = {
      id: randomUUID(),
      campaignId: event.campaignId,
      title: event.title,
      description: event.description ?? null,
      gameDate: event.gameDate ?? null,
      realDate: new Date(),
      eventType: event.eventType,
      linkedCharacters: event.linkedCharacters ?? [],
      linkedPlots: event.linkedPlots ?? [],
      linkedLocations: event.linkedLocations ?? [],
    };
    this.timelineEvents.push(newEvent);
    return newEvent;
  }
  updateTimelineEvent(
    id: string,
    updates: Partial<InsertTimelineEvent>
  ): TimelineEvent | undefined {
    const eventIndex = this.timelineEvents.findIndex((e) => e.id === id);
    if (eventIndex === -1) return undefined;
    this.timelineEvents[eventIndex] = {
      ...this.timelineEvents[eventIndex],
      ...updates,
    };
    return this.timelineEvents[eventIndex];
  }
  deleteTimelineEvent(id: string): boolean {
    const initialLength = this.timelineEvents.length;
    this.timelineEvents = this.timelineEvents.filter((e) => e.id !== id);
    return this.timelineEvents.length < initialLength;
  }

  // Characters
  getCharacters(campaignId: string): Character[] {
    return this.characters.filter((c) => c.campaignId === campaignId);
  }
  getCharacter(id: string): Character | undefined {
    return this.characters.find((c) => c.id === id);
  }
  createCharacter(character: InsertCharacter): Character {
    const newCharacter: Character = {
      id: randomUUID(),
      campaignId: character.campaignId,
      name: character.name,
      bio: character.bio ?? null,
      isPlayerCharacter: character.isPlayerCharacter ?? false,
      linkedEvents: character.linkedEvents ?? [],
      linkedPlots: character.linkedPlots ?? [],
    };
    this.characters.push(newCharacter);
    return newCharacter;
  }
  updateCharacter(
    id: string,
    updates: Partial<InsertCharacter>
  ): Character | undefined {
    const charIndex = this.characters.findIndex((c) => c.id === id);
    if (charIndex === -1) return undefined;
    this.characters[charIndex] = { ...this.characters[charIndex], ...updates };
    return this.characters[charIndex];
  }
  deleteCharacter(id: string): boolean {
    const initialLength = this.characters.length;
    this.characters = this.characters.filter((c) => c.id !== id);
    return this.characters.length < initialLength;
  }

  // Plots
  getPlots(campaignId: string): Plot[] {
    return this.plots.filter((p) => p.campaignId === campaignId);
  }
  getPlot(id: string): Plot | undefined {
    return this.plots.find((p) => p.id === id);
  }
  createPlot(plot: InsertPlot): Plot {
    const newPlot: Plot = {
      id: randomUUID(),
      campaignId: plot.campaignId,
      name: plot.name,
      description: plot.description ?? null,
      plotType: plot.plotType ?? null,
      linkedCharacters: plot.linkedCharacters ?? [],
      linkedEvents: plot.linkedEvents ?? [],
    };
    this.plots.push(newPlot);
    return newPlot;
  }
  updatePlot(
    id: string,
    updates: Partial<InsertPlot>
  ): Plot | undefined {
    const plotIndex = this.plots.findIndex((p) => p.id === id);
    if (plotIndex === -1) return undefined;
    this.plots[plotIndex] = { ...this.plots[plotIndex], ...updates };
    return this.plots[plotIndex];
  }
  deletePlot(id: string): boolean {
    const initialLength = this.plots.length;
    this.plots = this.plots.filter((p) => p.id !== id);
    return this.plots.length < initialLength;
  }

  // Lore Entries
  getLoreEntries(campaignId: string): LoreEntry[] {
    return this.loreEntries.filter((l) => l.campaignId === campaignId);
  }
  getLoreEntry(id: string): LoreEntry | undefined {
    return this.loreEntries.find((l) => l.id === id);
  }
  createLoreEntry(entry: InsertLoreEntry): LoreEntry {
    const newEntry: LoreEntry = {
      id: randomUUID(),
      campaignId: entry.campaignId,
      title: entry.title,
      content: entry.content ?? null,
      category: entry.category ?? null,
      isSecret: entry.isSecret ?? false,
      tags: entry.tags ?? [],
    };
    this.loreEntries.push(newEntry);
    return newEntry;
  }
  updateLoreEntry(
    id: string,
    updates: Partial<InsertLoreEntry>
  ): LoreEntry | undefined {
    const entryIndex = this.loreEntries.findIndex((l) => l.id === id);
    if (entryIndex === -1) return undefined;
    this.loreEntries[entryIndex] = {
      ...this.loreEntries[entryIndex],
      ...updates,
    };
    return this.loreEntries[entryIndex];
  }
  deleteLoreEntry(id: string): boolean {
    const initialLength = this.loreEntries.length;
    this.loreEntries = this.loreEntries.filter((l) => l.id !== id);
    return this.loreEntries.length < initialLength;
  }

  // Documents
  getDocument(id: string): Document | undefined {
    return this.documents.find((d) => d.id === id);
  }
  createDocument(document: InsertDocument): Document {
    const newDocument: Document = {
      id: randomUUID(),
      campaignId: document.campaignId,
      filename: document.filename,
      content: document.content ?? null,
    };
    this.documents.push(newDocument);
    return newDocument;
  }

  // Audit Log
  recordAudit(
    campaignId: string,
    entityType: string,
    entityId: string,
    action: string,
    oldData: any,
    newData: any,
    source: string,
    importBatchId?: string,
    metadata?: string
  ): AuditLog {
    const newLog: AuditLog = {
      id: randomUUID(),
      campaignId,
      timestamp: new Date(),
      entityType,
      entityId,
      action,
      oldData: JSON.stringify(oldData),
      newData: JSON.stringify(newData),
      source,
      importBatchId: importBatchId ?? null,
      metadata: metadata ?? null,
    };
    this.auditLog.push(newLog);
    return newLog;
  }
  getAuditLog(campaignId: string): AuditLog[] {
    return this.auditLog.filter((l) => l.campaignId === campaignId);
  }
}