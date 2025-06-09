import { users, cases, messages, type User, type InsertUser, type Case, type InsertCase, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { AuthUtils } from "./auth";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUserPassword(email: string, password: string): Promise<User | null>;
  getCases(): Promise<Case[]>;
  getCasesByCreator(creatorName: string): Promise<Case[]>;
  getCaseById(id: number): Promise<Case | undefined>;
  createCase(case_: InsertCase, creadoPor: string): Promise<Case>;
  assignExpertToCase(caseId: number, expertName: string | null): Promise<Case | undefined>;
  updateCaseStatus(caseId: number, newStatus: string, razon?: string): Promise<Case | undefined>;
  getMessagesByCaseId(caseId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(caseId: number, userEmail: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cases: Map<number, Case>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentCaseId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.cases = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentCaseId = 1;
    this.currentMessageId = 1;

    // Initialize with hardcoded users with hashed passwords
    this.initializeUsers();
  }

  private async initializeUsers() {
    const { medico: medicoPasswordHash, experto: expertoPasswordHash } = await AuthUtils.generateDefaultPasswords();
    
    const medico: User = {
      id: 1,
      email: "doctor@hospital.com",
      password: medicoPasswordHash,
      rol: "medico",
      nombre: "Dr. García",
      nicknameAnonimo: AuthUtils.generateAnonymousNickname("Dr. García", "doctor@hospital.com")
    };
    
    const experto: User = {
      id: 2,
      email: "experto@hospital.com",
      password: expertoPasswordHash,
      rol: "experto",
      nombre: "Dr. María Rodríguez",
      nicknameAnonimo: null
    };
    
    this.users.set(1, medico);
    this.users.set(2, experto);
    this.currentUserId = 3;

    // Initialize with sample cases
    const sampleCases: Case[] = [
      {
        id: 1,
        title: "Dolor abdominal persistente",
        sex: "M",
        ageRange: "36-50",
        description: "Paciente presenta dolor abdominal en cuadrante superior derecho con irradiación a espalda. Síntomas iniciaron hace 3 días con intensidad progresiva.",
        query: "¿Qué estudios diagnósticos recomendarían para descartar patología biliar? ¿Es necesario manejo ambulatorio u hospitalización?",
        urgency: "Media",
        status: "Nuevo",
        expertoAsignado: null,
        creadoPor: "Dr. García",
        razonCambio: null,
        reabierto: false,
        historialEstados: [],
        ultimoMensaje: null,
        mensajesNoLeidos: {},
        createdAt: new Date("2024-11-15"),
        updatedAt: new Date("2024-11-15")
      },
      {
        id: 2,
        title: "Cefalea recurrente",
        sex: "F",
        ageRange: "19-35",
        description: "Cefalea de características tensionales, bilateral, de 6 meses de evolución.",
        query: "¿Qué protocolo de estudio recomiendan para cefalea crónica en paciente joven?",
        urgency: "Baja",
        status: "En revisión",
        expertoAsignado: "Dr. María Rodríguez",
        creadoPor: "Dr. García",
        razonCambio: null,
        reabierto: false,
        historialEstados: [],
        ultimoMensaje: null,
        mensajesNoLeidos: {},
        createdAt: new Date("2024-11-14"),
        updatedAt: new Date("2024-11-14")
      },
      {
        id: 3,
        title: "Evaluación cardiológica",
        sex: "M",
        ageRange: "51-65",
        description: "Paciente con antecedentes de hipertensión arterial, solicita evaluación cardiológica preventiva.",
        query: "¿Qué estudios cardiológicos básicos recomiendan para screening en paciente hipertenso?",
        urgency: "Baja",
        status: "Resuelto",
        expertoAsignado: "Dr. María Rodríguez",
        creadoPor: "Dr. García",
        razonCambio: "Diagnóstico confirmado y recomendaciones dadas",
        reabierto: false,
        historialEstados: [],
        ultimoMensaje: null,
        mensajesNoLeidos: {},
        createdAt: new Date("2024-11-12"),
        updatedAt: new Date("2024-11-12")
      },
      {
        id: 4,
        title: "Caso cancelado por duplicado",
        sex: "F",
        ageRange: "19-35",
        description: "Caso duplicado, se cancela para evitar confusión.",
        query: "Consulta duplicada",
        urgency: "Baja",
        status: "Cancelado",
        expertoAsignado: null,
        creadoPor: "Dr. García",
        razonCambio: "Caso duplicado",
        reabierto: false,
        historialEstados: [],
        ultimoMensaje: null,
        mensajesNoLeidos: {},
        createdAt: new Date("2024-11-13"),
        updatedAt: new Date("2024-11-13")
      }
    ];

    sampleCases.forEach(case_ => {
      this.cases.set(case_.id, case_);
    });
    this.currentCaseId = 5;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(parseInt(id));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async verifyUserPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }
    
    const isValid = await AuthUtils.verifyPassword(password, user.password);
    return isValid ? user : null;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    // Hash the password before storing
    const hashedPassword = await AuthUtils.hashPassword(insertUser.password);
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
      rol: insertUser.rol || "medico"
    };
    this.users.set(id, user);
    return user;
  }

  async getCases(): Promise<Case[]> {
    return Array.from(this.cases.values()).sort((a, b) => {
      // Priority order: Nuevo > En revisión > Resuelto/Cancelado
      const statusPriority = { "Nuevo": 3, "En revisión": 2, "Resuelto": 1, "Cancelado": 1 };
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 0;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Within same priority, sort by updatedAt (most recent first)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  async getCasesByCreator(creatorName: string): Promise<Case[]> {
    return Array.from(this.cases.values())
      .filter(case_ => case_.creadoPor === creatorName)
      .sort((a, b) => {
        // Same priority logic as getCases
        const statusPriority = { "Nuevo": 3, "En revisión": 2, "Resuelto": 1, "Cancelado": 1 };
        const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 0;
        const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }



  async getCaseById(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async createCase(insertCase: InsertCase, creadoPor: string): Promise<Case> {
    const id = this.currentCaseId++;
    const case_: Case = { 
      id, 
      title: insertCase.title,
      sex: insertCase.sex,
      ageRange: insertCase.ageRange,
      description: insertCase.description || null,
      query: insertCase.query,
      urgency: insertCase.urgency,
      status: "Nuevo",
      expertoAsignado: null,
      creadoPor,
      razonCambio: null,
      reabierto: false,
      historialEstados: [],
      ultimoMensaje: null,
      mensajesNoLeidos: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cases.set(id, case_);
    return case_;
  }

  async updateCaseStatus(caseId: number, newStatus: string, razon?: string): Promise<Case | undefined> {
    const case_ = this.cases.get(caseId);
    if (case_) {
      const oldStatus = case_.status;
      case_.status = newStatus;
      case_.razonCambio = razon || null;
      case_.updatedAt = new Date();
      
      // Add to history
      const historyEntry = {
        estadoAnterior: oldStatus,
        estadoNuevo: newStatus,
        razon: razon || null,
        fecha: new Date().toISOString()
      };
      case_.historialEstados = Array.isArray(case_.historialEstados) 
        ? [...case_.historialEstados, historyEntry]
        : [historyEntry];
      
      // Set reabierto flag if reopening a closed case
      if ((oldStatus === "Resuelto" || oldStatus === "Cancelado") && newStatus === "En revisión") {
        case_.reabierto = true;
      }
      
      this.cases.set(caseId, case_);
      return case_;
    }
    return undefined;
  }

  async assignExpertToCase(caseId: number, expertName: string | null): Promise<Case | undefined> {
    const case_ = this.cases.get(caseId);
    if (case_) {
      case_.expertoAsignado = expertName;
      case_.updatedAt = new Date();
      // Auto-change status when expert is assigned/unassigned
      if (expertName && case_.status === "Nuevo") {
        case_.status = "En revisión";
        case_.razonCambio = "Experto asignado automáticamente";
      } else if (!expertName && case_.status === "En revisión") {
        case_.status = "Nuevo";
        case_.razonCambio = null;
      }
      this.cases.set(caseId, case_);
      return case_;
    }
    return undefined;
  }

  async getMessagesByCaseId(caseId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.caseId === caseId)
      .sort((a, b) => new Date(a.fechaEnvio).getTime() - new Date(b.fechaEnvio).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      id,
      caseId: insertMessage.caseId,
      autorNombre: insertMessage.autorNombre,
      autorRol: insertMessage.autorRol,
      contenido: insertMessage.contenido,
      fechaEnvio: new Date(),
      leido: false
    };
    
    this.messages.set(id, message);
    
    // Update case with last message info and unread counts
    const case_ = this.cases.get(insertMessage.caseId);
    if (case_) {
      const preview = insertMessage.contenido.length > 50 
        ? insertMessage.contenido.substring(0, 50) + "..." 
        : insertMessage.contenido;
      
      case_.ultimoMensaje = {
        fecha: message.fechaEnvio.toISOString(),
        autor: insertMessage.autorNombre,
        preview
      };
      
      // Initialize or update unread message counts
      const currentCounts = (case_.mensajesNoLeidos as Record<string, number>) || {};
      
      // Get all users who should be notified (creator and assigned expert)
      const usersToNotify = [];
      if (case_.creadoPor !== insertMessage.autorNombre) {
        // Find creator's email
        const creator = Array.from(this.users.values()).find(u => u.nombre === case_.creadoPor);
        if (creator) usersToNotify.push(creator.email);
      }
      if (case_.expertoAsignado && case_.expertoAsignado !== insertMessage.autorNombre) {
        // Find expert's email
        const expert = Array.from(this.users.values()).find(u => u.nombre === case_.expertoAsignado);
        if (expert) usersToNotify.push(expert.email);
      }
      
      // Increment unread count for notified users
      usersToNotify.forEach(email => {
        currentCounts[email] = (currentCounts[email] || 0) + 1;
      });
      
      case_.mensajesNoLeidos = currentCounts;
      
      case_.updatedAt = new Date();
      this.cases.set(insertMessage.caseId, case_);
    }
    
    return message;
  }

  async markMessagesAsRead(caseId: number, userEmail: string): Promise<void> {
    const case_ = this.cases.get(caseId);
    if (case_) {
      const currentCounts: Record<string, number> = (case_.mensajesNoLeidos as Record<string, number>) || {};
      currentCounts[userEmail] = 0;
      case_.mensajesNoLeidos = currentCounts;
      this.cases.set(caseId, case_);
    }
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async verifyUserPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }
    
    const isValid = await AuthUtils.verifyPassword(password, user.password);
    return isValid ? user : null;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await AuthUtils.hashPassword(insertUser.password);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword
      })
      .returning();
    return user;
  }

  async getCases(): Promise<Case[]> {
    const allCases = await db.select().from(cases);
    return allCases.sort((a, b) => {
      // Priority order: Nuevo > En revisión > Resuelto/Cancelado
      const statusPriority = { "Nuevo": 3, "En revisión": 2, "Resuelto": 1, "Cancelado": 1 };
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 0;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Within same priority, sort by updatedAt (most recent first)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  async getCasesByCreator(creatorName: string): Promise<Case[]> {
    const userCases = await db.select().from(cases).where(eq(cases.creadoPor, creatorName));
    return userCases.sort((a, b) => {
      // Same priority logic as getCases
      const statusPriority = { "Nuevo": 3, "En revisión": 2, "Resuelto": 1, "Cancelado": 1 };
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 0;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  async getCaseById(id: number): Promise<Case | undefined> {
    const [case_] = await db.select().from(cases).where(eq(cases.id, id));
    return case_ || undefined;
  }

  async createCase(insertCase: InsertCase, creadoPor: string): Promise<Case> {
    const [case_] = await db
      .insert(cases)
      .values({
        ...insertCase,
        creadoPor,
        expertoAsignado: null,
        status: "Nuevo"
      })
      .returning();
    return case_;
  }

  async assignExpertToCase(caseId: number, expertName: string | null): Promise<Case | undefined> {
    const [updatedCase] = await db
      .update(cases)
      .set({ 
        expertoAsignado: expertName,
        status: expertName ? "En revisión" : "Nuevo",
        razonCambio: expertName ? "Experto asignado automáticamente" : null,
        updatedAt: new Date()
      })
      .where(eq(cases.id, caseId))
      .returning();
    return updatedCase || undefined;
  }

  async updateCaseStatus(caseId: number, newStatus: string, razon?: string): Promise<Case | undefined> {
    const [updatedCase] = await db
      .update(cases)
      .set({ 
        status: newStatus,
        razonCambio: razon || null,
        reabierto: newStatus === "En revisión" ? true : undefined,
        updatedAt: new Date()
      })
      .where(eq(cases.id, caseId))
      .returning();
    return updatedCase || undefined;
  }

  async getMessagesByCaseId(caseId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.caseId, caseId))
      .orderBy(messages.fechaEnvio);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    
    // Update case with last message info and unread counts
    const [case_] = await db.select().from(cases).where(eq(cases.id, insertMessage.caseId));
    if (case_) {
      const preview = insertMessage.contenido.length > 50 
        ? insertMessage.contenido.substring(0, 50) + "..." 
        : insertMessage.contenido;
      
      const ultimoMensaje = {
        fecha: message.fechaEnvio.toISOString(),
        autor: insertMessage.autorNombre,
        preview
      };
      
      // Get current unread counts and increment for relevant users
      const currentCounts = case_.mensajesNoLeidos as Record<string, number> || {};
      
      // Get users who should be notified
      const usersToNotify = [];
      if (case_.creadoPor !== insertMessage.autorNombre) {
        const [creator] = await db.select().from(users).where(eq(users.nombre, case_.creadoPor));
        if (creator) usersToNotify.push(creator.email);
      }
      if (case_.expertoAsignado && case_.expertoAsignado !== insertMessage.autorNombre) {
        const [expert] = await db.select().from(users).where(eq(users.nombre, case_.expertoAsignado));
        if (expert) usersToNotify.push(expert.email);
      }
      
      // Update unread counts
      usersToNotify.forEach(email => {
        currentCounts[email] = (currentCounts[email] || 0) + 1;
      });
      
      await db
        .update(cases)
        .set({ 
          ultimoMensaje: ultimoMensaje,
          mensajesNoLeidos: currentCounts,
          updatedAt: new Date()
        })
        .where(eq(cases.id, insertMessage.caseId));
    }
    
    return message;
  }

  async markMessagesAsRead(caseId: number, userEmail: string): Promise<void> {
    const [case_] = await db.select().from(cases).where(eq(cases.id, caseId));
    if (case_) {
      const currentCounts = case_.mensajesNoLeidos as Record<string, number> || {};
      currentCounts[userEmail] = 0;
      
      await db
        .update(cases)
        .set({ mensajesNoLeidos: currentCounts })
        .where(eq(cases.id, caseId));
    }
  }
}

export const storage = new DatabaseStorage();
