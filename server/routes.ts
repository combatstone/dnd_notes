import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { processDocumentWithAI, generateAISuggestions } from "./services/ai-processor";
import {
  insertTimelineEventSchema,
  insertCharacterSchema,
  insertPlotSchema,
  insertLoreEntrySchema,
  insertDocumentSchema,
  type AuditLog
} from "@shared/schema";
import fs from "fs";
import path from "path";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, DOC, DOCX files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Campaigns
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (campaign) {
        res.json(campaign);
      } else {
        res.status(404).json({ error: "Campaign not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Campaign name is required" });
      }
      const newCampaign = await storage.createCampaign({ name });
      res.status(201).json(newCampaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  // Timeline
  app.get("/api/timeline/:campaignId", async (req, res) => {
    try {
      const events = await storage.getTimelineEvents(req.params.campaignId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timeline events" });
    }
  });

  app.post("/api/timeline", async (req, res) => {
    try {
      const validatedEvent = insertTimelineEventSchema.parse(req.body);
      const newEvent = await storage.createTimelineEvent(validatedEvent);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create timeline event" });
    }
  });

  app.put("/api/timeline/:id", async (req, res) => {
  try {
    const validatedUpdates = insertTimelineEventSchema.partial().parse(req.body);
    const updatedEvent = await storage.updateTimelineEvent(req.params.id, validatedUpdates);
    if (updatedEvent) {
      res.json(updatedEvent);
    } else {
      res.status(404).json({ error: "Timeline event not found" });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to update timeline event" });
  }
});


  app.delete("/api/timeline/:id", async (req, res) => {
    try {
      const success = await storage.deleteTimelineEvent(req.params.id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Timeline event not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete timeline event" });
    }
  });

  // Characters
  app.get("/api/characters/:campaignId", async (req, res) => {
    try {
      const characters = await storage.getCharacters(req.params.campaignId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const validatedChar = insertCharacterSchema.parse(req.body);
      const newCharacter = await storage.createCharacter(validatedChar);
      res.status(201).json(newCharacter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create character" });
    }
  });

  // Add this new route for updating a character
  app.put("/api/characters/:id", async (req, res) => {
    try {
      const validatedUpdates = insertCharacterSchema.partial().parse(req.body);
      const updatedCharacter = await storage.updateCharacter(req.params.id, validatedUpdates);
      if (updatedCharacter) {
        res.json(updatedCharacter);
      } else {
        res.status(404).json({ error: "Character not found" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update character" });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const success = await storage.deleteCharacter(req.params.id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Character not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete character" });
    }
  });

  // Plots
  app.get("/api/plots/:campaignId", async (req, res) => {
    try {
      const plots = await storage.getPlots(req.params.campaignId);
      res.json(plots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch plots" });
    }
  });

  app.post("/api/plots", async (req, res) => {
    try {
      const validatedPlot = insertPlotSchema.parse(req.body);
      const newPlot = await storage.createPlot(validatedPlot);
      res.status(201).json(newPlot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create plot" });
    }
  });

  app.put("/api/plots/:id", async (req, res) => {
  try {
    const validatedUpdates = insertPlotSchema.partial().parse(req.body);
    const updatedPlot = await storage.updatePlot(req.params.id, validatedUpdates);
    if (updatedPlot) {
      res.json(updatedPlot);
    } else {
      res.status(404).json({ error: "Plot not found" });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to update plot" });
  }
});

  app.delete("/api/plots/:id", async (req, res) => {
    try {
      const success = await storage.deletePlot(req.params.id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Plot not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete plot" });
    }
  });

  // Lore
  app.get("/api/lore/:campaignId", async (req, res) => {
    try {
      const lore = await storage.getLoreEntries(req.params.campaignId);
      res.json(lore);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lore entries" });
    }
  });

  app.post("/api/lore", async (req, res) => {
    try {
      const validatedLore = insertLoreEntrySchema.parse(req.body);
      const newLore = await storage.createLoreEntry(validatedLore);
      res.status(201).json(newLore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create lore entry" });
    }
  });

  app.delete("/api/lore/:id", async (req, res) => {
    try {
      const success = await storage.deleteLoreEntry(req.params.id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Lore entry not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lore entry" });
    }
  });



  // AI Service Routes
  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { text, type } = req.body;
      const suggestions = await generateAISuggestions(text, type, []);
      res.json(suggestions);
    } catch (error) {
      console.error("AI suggestion error:", error);
      res.status(500).json({ error: "Failed to get AI suggestions" });
    }
  });

  // Document Handling and Processing
  app.post("/api/documents/:campaignId", upload.single('document'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    try {
      const docData = {
        campaignId: req.params.campaignId,
        filename: req.file.originalname,
        content: '', // Content will be extracted by AI processor
      };
      
      const validatedDoc = insertDocumentSchema.parse(docData);
      const newDocument = await storage.createDocument(validatedDoc);
      
      processDocumentWithAI(newDocument.id, {
        extractCharacters: true,
        extractEvents: true,
        extractPlots: true,
        extractLore: true,
      });

      res.status(202).json({ message: "File uploaded and processing started.", document: newDocument });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Document upload error:", error);
      res.status(500).json({ error: "Failed to process document upload" });
    }
  });
  
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const success = await storage.deleteDocument(req.params.id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Audit Log Routes
  app.get("/api/audit-log/:campaignId", async (req, res) => {
    try {
      const logs = await storage.getAuditLogs(req.params.campaignId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit log" });
    }
  });
  
  // Rollback Routes
  app.post("/api/rollback/import/:importBatchId", async (req, res) => {
    try {
      const result = await storage.rollbackImportBatch(req.params.importBatchId);
      if (result.success) {
        res.json({
          message: "Rollback completed successfully",
          restoredCount: result.restoredCount,
          deletedCount: result.deletedCount
        });
      } else {
        res.status(500).json({ error: "Rollback failed" });
      }
    } catch (error) {
      console.error("Import rollback error:", error);
      res.status(500).json({ error: "Failed to rollback import" });
    }
  });

  app.post("/api/rollback/timestamp/:campaignId", async (req, res) => {
    try {
      const timestamp = new Date(req.body.timestamp);
      if (isNaN(timestamp.getTime())) {
        return res.status(400).json({ error: "Invalid timestamp format" });
      }
      
      const result = await storage.rollbackToTimestamp(req.params.campaignId, timestamp);
      if (result.success) {
        res.json({
          message: "Rollback completed successfully",
          changesReverted: result.changesReverted
        });
      } else {
        res.status(500).json({ error: "Rollback failed" });
      }
    } catch (error) {
      console.error("Timestamp rollback error:", error);
      res.status(500).json({ error: "Failed to rollback to timestamp" });
    }
  });

  const server = createServer(app);
  return server;
}
