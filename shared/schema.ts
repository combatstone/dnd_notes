import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// -- TABLES --

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
  eventType: text("event_type").notNull(),
  linkedCharacters: text("linked_characters").array().default([]),
  linkedPlots: text("linked_plots").array().default([]),
  linkedLocations: text("linked_locations").array().default([]),
});

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  isPlayerCharacter: boolean("is_player_character").default(false),
  linkedEvents: text("linked_events").array().default([]),
  linkedPlots: text("linked_plots").array().default([]),
});

export const plots = pgTable("plots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  plotType: text("plot_type"), // Main plot, side quest, etc.
  linkedCharacters: text("linked_characters").array().default([]),
  linkedEvents: text("linked_events").array().default([]),
});

export const loreEntries = pgTable("lore_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category"), // People, places, history, etc.
  isSecret: boolean("is_secret").default(false),
  tags: text("tags").array().default([]),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  filename: text("filename").notNull(),
  content: text("content"),
});

export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  entityType: text("entity_type"), // e.g., 'character', 'plot'
  entityId: text("entity_id"),
  action: text("action"), // e.g., 'create', 'update', 'delete'
  oldData: text("old_data"),
  newData: text("new_data"),
  source: text("source"), // e.g., 'manual', 'document_import'
  importBatchId: text("import_batch_id"),
  metadata: text("metadata"),
});

// -- ZOD SCHEMAS --

// Select Schemas (for reading from DB)
export const campaignSchema = createSelectSchema(campaigns);
export const timelineEventSchema = createSelectSchema(timelineEvents, {
  // Coerce the date string from the API back into a Date object
  realDate: z.coerce.date(),
});
export const characterSchema = createSelectSchema(characters);
export const plotSchema = createSelectSchema(plots);
export const loreEntrySchema = createSelectSchema(loreEntries);
export const documentSchema = createSelectSchema(documents);
export const auditLogSchema = createSelectSchema(auditLog, {
  timestamp: z.coerce.date(),
});

// Insert Schemas (for writing to DB)
export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  description: true,
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).pick(
  {
    campaignId: true,
    title: true,
    description: true,

    gameDate: true,
    eventType: true,
    linkedCharacters: true,
    linkedPlots: true,
    linkedLocations: true,
  }
);

export const insertCharacterSchema = createInsertSchema(characters).pick({
  campaignId: true,
  name: true,
  bio: true,
  isPlayerCharacter: true,
  linkedEvents: true,
  linkedPlots: true,
});

export const insertPlotSchema = createInsertSchema(plots).pick({
  campaignId: true,
  name: true,
  description: true,
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

// -- TYPES --

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