import type { Express } from "express";
import { createServer, type Server } from "http";
import { InMemoryStorage } from "./storage";
import multer from "multer";
import { processDocumentWithAI, generateAISuggestions } from "./services/ai-processor";
import fs from "fs";
import path from "path";

const storage = new InMemoryStorage();

const upload = multer({ dest: "uploads/" });

export function registerRoutes(app: Express): Server {
  // Campaigns
  app.get("/api/campaigns", (req, res) => {
    try {
      const campaigns = storage.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  // Timeline Events
  app.get("/api/timeline/:campaignId", (req, res) => {
    try {
      const events = storage.getTimelineEvents(req.params.campaignId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timeline events" });
    }
  });

  app.delete("/api/timeline/:eventId", (req, res) => {
    try {
      const result = storage.deleteTimelineEvent(req.params.eventId);
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Event not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete timeline event" });
    }
  });

  // Characters
  app.get("/api/characters/:campaignId", (req, res) => {
    try {
      const characters = storage.getCharacters(req.params.campaignId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  // Plots
  app.get("/api/plots/:campaignId", (req, res) => {
    try {
      const plots = storage.getPlots(req.params.campaignId);
      res.json(plots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch plots" });
    }
  });

  // Document Upload and Processing
  app.post("/api/upload/:campaignId", upload.single('document'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    try {
      const doc = storage.createDocument({
        campaignId: req.params.campaignId,
        filename: req.file.originalname,
        content: fs.readFileSync(req.file.path, 'utf8'),
      });

      processDocumentWithAI(doc.id, req.file.path);
      
      res.status(202).json({ 
        message: "File uploaded and processing started.",
        documentId: doc.id 
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to process file upload" });
    }
  });

  // AI Suggestions
  app.get("/api/suggestions/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      const document = storage.getDocument(documentId);

      if (!document || !document.content) {
        return res.status(404).json({ error: "Document or document content not found" });
      }

      const characters = storage.getCharacters(document.campaignId);
      const plots = storage.getPlots(document.campaignId);
      
      const suggestions = await generateAISuggestions(
        document.content, 
        characters, 
        plots
      );
      res.json(suggestions);
    } catch (error) {
      console.error("AI suggestion error:", error);
      res.status(500).json({ error: "Failed to fetch AI suggestions" });
    }
  });
  
  // Audit Log
  app.get("/api/audit-log/:campaignId", (req, res) => {
    try {
      const logs = storage.getAuditLog(req.params.campaignId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit log" });
    }
  });

  const server = createServer(app);
  return server;
}