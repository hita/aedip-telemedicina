import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCaseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }

      // Simple session - in production, use proper session management
      req.session = { userId: user.id };
      
      res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ message: "Sesión cerrada exitosamente" });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Cases
  app.get("/api/cases", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const cases = await storage.getCases();
      res.json(cases);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener casos" });
    }
  });

  app.get("/api/cases/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de caso inválido" });
      }

      const case_ = await storage.getCaseById(id);
      if (!case_) {
        return res.status(404).json({ message: "Caso no encontrado" });
      }

      res.json(case_);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener caso" });
    }
  });

  app.post("/api/cases", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const validatedData = insertCaseSchema.parse(req.body);
      const case_ = await storage.createCase(validatedData);
      
      res.status(201).json(case_);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos inválidos", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error al crear caso" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
