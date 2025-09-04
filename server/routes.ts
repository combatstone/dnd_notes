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
  insertDocumentSchema 
} from "@shared/schema";
import fs from "fs";
import path from "path";

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
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  // Timeline Events
  app.get("/api/campaigns/:campaignId/timeline", async (req, res) => {
    try {
      const events = await storage.getTimelineEvents(req.params.campaignId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timeline events" });
    }
  });

  app.post("/api/campaigns/:campaignId/timeline", async (req, res) => {
    try {
      const eventData = insertTimelineEventSchema.parse({
        ...req.body,
        campaignId: req.params.campaignId
      });
      const event = await storage.createTimelineEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid timeline event data" });
    }
  });

  app.put("/api/timeline/:id", async (req, res) => {
    try {
      const updates = insertTimelineEventSchema.partial().parse(req.body);
      const event = await storage.updateTimelineEvent(req.params.id, updates);
      if (!event) {
        return res.status(404).json({ error: "Timeline event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/timeline/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTimelineEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Timeline event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete timeline event" });
    }
  });

  // Characters
  app.get("/api/campaigns/:campaignId/characters", async (req, res) => {
    try {
      const characters = await storage.getCharacters(req.params.campaignId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  app.post("/api/campaigns/:campaignId/characters", async (req, res) => {
    try {
      const characterData = insertCharacterSchema.parse({
        ...req.body,
        campaignId: req.params.campaignId
      });
      const character = await storage.createCharacter(characterData);
      res.status(201).json(character);
    } catch (error) {
      res.status(400).json({ error: "Invalid character data" });
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    try {
      const updates = insertCharacterSchema.partial().parse(req.body);
      const character = await storage.updateCharacter(req.params.id, updates);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCharacter(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete character" });
    }
  });

  // Plots
  app.get("/api/campaigns/:campaignId/plots", async (req, res) => {
    try {
      const plots = await storage.getPlots(req.params.campaignId);
      res.json(plots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch plots" });
    }
  });

  app.post("/api/campaigns/:campaignId/plots", async (req, res) => {
    try {
      const plotData = insertPlotSchema.parse({
        ...req.body,
        campaignId: req.params.campaignId
      });
      const plot = await storage.createPlot(plotData);
      res.status(201).json(plot);
    } catch (error) {
      res.status(400).json({ error: "Invalid plot data" });
    }
  });

  app.put("/api/plots/:id", async (req, res) => {
    try {
      const updates = insertPlotSchema.partial().parse(req.body);
      const plot = await storage.updatePlot(req.params.id, updates);
      if (!plot) {
        return res.status(404).json({ error: "Plot not found" });
      }
      res.json(plot);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/plots/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePlot(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Plot not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete plot" });
    }
  });

  // Lore
  app.get("/api/campaigns/:campaignId/lore", async (req, res) => {
    try {
      const lore = await storage.getLoreEntries(req.params.campaignId);
      res.json(lore);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lore entries" });
    }
  });

  app.post("/api/campaigns/:campaignId/lore", async (req, res) => {
    try {
      const loreData = insertLoreEntrySchema.parse({
        ...req.body,
        campaignId: req.params.campaignId
      });
      const lore = await storage.createLoreEntry(loreData);
      res.status(201).json(lore);
    } catch (error) {
      res.status(400).json({ error: "Invalid lore data" });
    }
  });

  app.put("/api/lore/:id", async (req, res) => {
    try {
      const updates = insertLoreEntrySchema.partial().parse(req.body);
      const lore = await storage.updateLoreEntry(req.params.id, updates);
      if (!lore) {
        return res.status(404).json({ error: "Lore entry not found" });
      }
      res.json(lore);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/lore/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLoreEntry(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Lore entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lore entry" });
    }
  });

  // Document Upload and AI Processing
  app.post("/api/campaigns/:campaignId/upload", upload.array('documents', 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const options = {
        extractCharacters: req.body.extractCharacters === 'true',
        extractEvents: req.body.extractEvents === 'true',
        extractPlots: req.body.extractPlots === 'true',
        extractLore: req.body.extractLore === 'true'
      };

      const results = [];

      for (const file of files) {
        try {
          // Read file content
          const content = fs.readFileSync(file.path, 'utf-8');
          
          // Store document
          const docData = insertDocumentSchema.parse({
            campaignId: req.params.campaignId,
            filename: file.originalname,
            content: content
          });
          const document = await storage.createDocument(docData);

          // Process with AI
          const extracted = await processDocumentWithAI(content, options);

          // Store extracted data
          const createdItems = {
            characters: [],
            events: [],
            plots: [],
            lore: []
          };

          // Create characters
          for (const char of extracted.characters) {
            const character = await storage.createCharacter({
              ...char,
              campaignId: req.params.campaignId
            });
            createdItems.characters.push(character);
          }

          // Create events
          for (const event of extracted.events) {
            const timelineEvent = await storage.createTimelineEvent({
              ...event,
              campaignId: req.params.campaignId
            });
            createdItems.events.push(timelineEvent);
          }

          // Create plots
          for (const plot of extracted.plots) {
            const plotEntry = await storage.createPlot({
              ...plot,
              campaignId: req.params.campaignId
            });
            createdItems.plots.push(plotEntry);
          }

          // Create lore
          for (const lore of extracted.lore) {
            const loreEntry = await storage.createLoreEntry({
              ...lore,
              campaignId: req.params.campaignId
            });
            createdItems.lore.push(loreEntry);
          }

          // Mark document as processed
          await storage.updateDocument(document.id, { processed: true });

          results.push({
            filename: file.originalname,
            documentId: document.id,
            extracted: createdItems
          });

          // Clean up uploaded file
          fs.unlinkSync(file.path);
        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
          // Clean up uploaded file on error
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      res.json({
        message: "Files processed successfully",
        results: results
      });
    } catch (error) {
      console.error("Upload processing error:", error);
      res.status(500).json({ error: "Failed to process uploaded files" });
    }
  });

  // AI Suggestions
  app.get("/api/campaigns/:campaignId/ai-suggestions", async (req, res) => {
    try {
      const events = await storage.getTimelineEvents(req.params.campaignId);
      const characters = await storage.getCharacters(req.params.campaignId);
      const plots = await storage.getPlots(req.params.campaignId);

      const suggestions = await generateAISuggestions(
        events.slice(0, 10).map(e => ({
          title: e.title,
          description: e.description || "",
          linkedCharacters: e.linkedCharacters || []
        })),
        characters.map(c => ({
          name: c.name,
          appearanceCount: c.appearanceCount || "0"
        })),
        plots.map(p => ({
          title: p.title,
          status: p.status
        }))
      );

      res.json(suggestions);
    } catch (error) {
      console.error("AI suggestions error:", error);
      res.status(500).json({ error: "Failed to generate AI suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
