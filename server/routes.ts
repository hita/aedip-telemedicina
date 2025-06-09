import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCaseSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
      }

      // Use the new secure password verification
      const user = await storage.verifyUserPassword(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }

      // Store user ID in session
      req.session.userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  app.get("/api/auth/me", async (req: any, res) => {
    try {
      if (!(req.session as any)?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      res.json({ user: { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre } });
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Cases
  app.get("/api/cases", async (req: any, res) => {
    try {
      if (!(req.session as any)?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      let cases;
      if (user.rol === "experto") {
        // Expertos ven todos los casos con nicknames anónimos
        cases = await storage.getCases();
      } else {
        // Médicos solo ven sus casos - usar nickname anónimo para buscar
        const searchName = user.nicknameAnonimo || user.nombre;
        cases = await storage.getCasesByCreator(searchName);
      }
      
      res.json(cases);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener casos" });
    }
  });

  app.get("/api/cases/:id", async (req: any, res) => {
    try {
      if (!(req.session as any)?.userId) {
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

  app.post("/api/cases", async (req: any, res) => {
    try {
      if (!(req.session as any)?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      const validatedData = insertCaseSchema.parse(req.body);
      // Use anonymous nickname for medicos when creating cases
      const creatorName = user.nicknameAnonimo || user.nombre;
      const case_ = await storage.createCase(validatedData, creatorName);
      
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

  // Expert assignment route
  app.patch("/api/cases/:id/assign", async (req: any, res) => {
    try {
      if (!(req.session as any)?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user || user.rol !== "experto") {
        return res.status(403).json({ message: "Solo expertos pueden asignar casos" });
      }

      const caseId = parseInt(req.params.id);
      const { action } = req.body; // "assign" or "unassign"
      
      const expertName = action === "assign" ? user.nombre : null;
      const updatedCase = await storage.assignExpertToCase(caseId, expertName);
      
      if (!updatedCase) {
        return res.status(404).json({ message: "Caso no encontrado" });
      }

      res.json(updatedCase);
    } catch (error) {
      res.status(500).json({ message: "Error al asignar caso" });
    }
  });

  // Update case status
  app.patch("/api/cases/:id/status", async (req: any, res) => {
    try {
      if (!(req.session as any)?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      const caseId = parseInt(req.params.id);
      const { newStatus, razon } = req.body;
      
      if (!newStatus || !razon) {
        return res.status(400).json({ message: "Estado y razón son requeridos" });
      }

      const updatedCase = await storage.updateCaseStatus(caseId, newStatus, razon);
      
      if (!updatedCase) {
        return res.status(404).json({ message: "Caso no encontrado" });
      }

      res.json(updatedCase);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar estado del caso" });
    }
  });

  // Get messages for a case
  app.get("/api/cases/:id/messages", async (req: any, res) => {
    try {
      if (!(req.session as any)?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      const caseId = parseInt(req.params.id);
      
      // Verify user has access to this case
      const case_ = await storage.getCaseById(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Caso no encontrado" });
      }

      // Check if user is creator or assigned expert
      const userIdentifier = user.nicknameAnonimo || user.nombre;
      const hasAccess = case_.creadoPor === userIdentifier || case_.expertoAsignado === user.nombre;
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este caso" });
      }

      const messages = await storage.getMessagesByCaseId(caseId);
      
      // Mark messages as read for this user
      await storage.markMessagesAsRead(caseId, user.email);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener mensajes" });
    }
  });

  // Create a new message
  app.post("/api/cases/:id/messages", async (req: any, res) => {
    try {
      if (!(req.session as any)?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      const caseId = parseInt(req.params.id);
      
      // Verify user has access to this case
      const case_ = await storage.getCaseById(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Caso no encontrado" });
      }

      // Check if user is creator or assigned expert
      const userIdentifier = user.nicknameAnonimo || user.nombre;
      const hasAccess = case_.creadoPor === userIdentifier || case_.expertoAsignado === user.nombre;
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este caso" });
      }

      const { contenido } = req.body;
      
      if (!contenido?.trim()) {
        return res.status(400).json({ message: "El contenido del mensaje es requerido" });
      }

      const messageData = insertMessageSchema.parse({
        caseId,
        autorNombre: userIdentifier,
        autorRol: user.rol,
        contenido: contenido.trim()
      });

      const newMessage = await storage.createMessage(messageData);
      res.json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al crear mensaje" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
