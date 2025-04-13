import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNoteSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Notes API routes
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes();
      return res.json(notes);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:uuid", async (req, res) => {
    try {
      const note = await storage.getNoteByUuid(req.params.uuid);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      return res.json(note);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      return res.status(201).json(note);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put("/api/notes/:uuid", async (req, res) => {
    try {
      const updatedNote = await storage.updateNote(req.params.uuid, req.body);
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      return res.json(updatedNote);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:uuid", async (req, res) => {
    try {
      const success = await storage.deleteNote(req.params.uuid);
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
