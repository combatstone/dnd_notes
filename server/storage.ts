import { 
  type Campaign, type InsertCampaign,
  type TimelineEvent, type InsertTimelineEvent,
  type Character, type InsertCharacter,
  type Plot, type InsertPlot,
  type LoreEntry, type InsertLoreEntry,
  type Document, type InsertDocument
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
}

export class MemStorage implements IStorage {
  private campaigns: Map<string, Campaign>;
  private timelineEvents: Map<string, TimelineEvent>;
  private characters: Map<string, Character>;
  private plots: Map<string, Plot>;
  private loreEntries: Map<string, LoreEntry>;
  private documents: Map<string, Document>;

  constructor() {
    this.campaigns = new Map();
    this.timelineEvents = new Map();
    this.characters = new Map();
    this.plots = new Map();
    this.loreEntries = new Map();
    this.documents = new Map();
    
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
    return event;
  }

  async updateTimelineEvent(id: string, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const event = this.timelineEvents.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.timelineEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteTimelineEvent(id: string): Promise<boolean> {
    return this.timelineEvents.delete(id);
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
    return character;
  }

  async updateCharacter(id: string, updates: Partial<InsertCharacter>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;
    
    const updatedCharacter = { ...character, ...updates };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    return this.characters.delete(id);
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
    return plot;
  }

  async updatePlot(id: string, updates: Partial<InsertPlot>): Promise<Plot | undefined> {
    const plot = this.plots.get(id);
    if (!plot) return undefined;
    
    const updatedPlot = { ...plot, ...updates };
    this.plots.set(id, updatedPlot);
    return updatedPlot;
  }

  async deletePlot(id: string): Promise<boolean> {
    return this.plots.delete(id);
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
    return lore;
  }

  async updateLoreEntry(id: string, updates: Partial<InsertLoreEntry>): Promise<LoreEntry | undefined> {
    const lore = this.loreEntries.get(id);
    if (!lore) return undefined;
    
    const updatedLore = { ...lore, ...updates };
    this.loreEntries.set(id, updatedLore);
    return updatedLore;
  }

  async deleteLoreEntry(id: string): Promise<boolean> {
    return this.loreEntries.delete(id);
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
}

export const storage = new MemStorage();
