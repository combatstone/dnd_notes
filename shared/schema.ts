import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  currentSession: text("current_session").default("1"),
  partyLevel: text("party_level").default("1"),
  lastPlayed: timestamp("last_played").defaultNow(),
});

export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  gameDate: text("game_date"),
  realDate: timestamp("real_date").defaultNow(),
  eventType: text("event_type").notNull(), // combat, roleplay, discovery, etc.
  linkedCharacters: text("linked_characters").array().default([]),
  linkedPlots: text("linked_plots").array().default([]),
  linkedLocations: text("linked_locations").array().default([]),
});

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  name: text("name").notNull(),
  race: text("race"),
  characterClass: text("character_class"),
  alignment: text("alignment"),
  isNPC: boolean("is_npc").default(false),
  biography: text("biography"),
  notes: text("notes"),
  appearanceCount: text("appearance_count").default("0"),
});

export const plots = pgTable("plots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, completed, on-hold
  plotType: text("plot_type").notNull().default("main"), // main, subplot, side-quest
  linkedCharacters: text("linked_characters").array().default([]),
  linkedEvents: text("linked_events").array().default([]),
});

export const loreEntries = pgTable("lore_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category").notNull(), // location, history, religion, culture, etc.
  isSecret: boolean("is_secret").default(false), // DM-only vs player-accessible
  tags: text("tags").array().default([]),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  filename: text("filename").notNull(),
  content: text("content"),
  uploadDate: timestamp("upload_date").defaultNow(),
  processed: boolean("processed").default(false),
});

export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  entityType: text("entity_type").notNull(), // 'character', 'event', 'plot', 'lore', 'document'
  entityId: varchar("entity_id").notNull(),
  action: text("action").notNull(), // 'create', 'update', 'delete'
  oldData: text("old_data"), // JSON string of previous state
  newData: text("new_data"), // JSON string of new state
  source: text("source").notNull(), // 'manual', 'import', 'ai-processing'
  importBatchId: varchar("import_batch_id"), // Groups changes from same import
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: text("metadata"), // Additional context (filename, user action, etc.)
});

// Insert schemas
export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  description: true,
  currentSession: true,
  partyLevel: true,
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).pick({
  campaignId: true,
  title: true,
  description: true,
  gameDate: true,
  eventType: true,
  linkedCharacters: true,
  linkedPlots: true,
  linkedLocations: true,
});

export const insertCharacterSchema = createInsertSchema(characters).pick({
  campaignId: true,
  name: true,
  race: true,
  characterClass: true,
  alignment: true,
  isNPC: true,
  biography: true,
  notes: true,
});

export const insertPlotSchema = createInsertSchema(plots).pick({
  campaignId: true,
  title: true,
  description: true,
  status: true,
  plotType: true,
  linkedCharacters: true,
  linkedEvents: true,
});

export const insertLoreEntrySchema = createInsertSchema(loreEntries).pick({
  campaignId: true,
  title: true,
  content: true,
  category: true,
  isSecret: true,
  tags: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  campaignId: true,
  filename: true,
  content: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLog).pick({
  campaignId: true,
  entityType: true,
  entityId: true,
  action: true,
  oldData: true,
  newData: true,
  source: true,
  importBatchId: true,
  metadata: true,
});

// Types
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

export type InsertPlot = z.infer<typeof insertPlotSchema>;
export type Plot = typeof plots.$inferSelect;

export type InsertLoreEntry = z.infer<typeof insertLoreEntrySchema>;
export type LoreEntry = typeof loreEntries.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLog.$inferSelect;
