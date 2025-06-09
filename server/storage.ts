import { users, cases, type User, type InsertUser, type Case, type InsertCase } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCases(): Promise<Case[]>;
  getCaseById(id: number): Promise<Case | undefined>;
  createCase(case_: InsertCase, creadoPor: string): Promise<Case>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cases: Map<number, Case>;
  private currentUserId: number;
  private currentCaseId: number;

  constructor() {
    this.users = new Map();
    this.cases = new Map();
    this.currentUserId = 1;
    this.currentCaseId = 1;

    // Initialize with hardcoded users
    const medico: User = {
      id: 1,
      email: "doctor@hospital.com",
      password: "1234",
      rol: "medico",
      nombre: "Dr. García"
    };
    
    const experto: User = {
      id: 2,
      email: "experto@hospital.com",
      password: "1234",
      rol: "experto",
      nombre: "Dr. María Rodríguez"
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
        createdAt: new Date("2024-11-15")
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
        createdAt: new Date("2024-11-14")
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
        createdAt: new Date("2024-11-12")
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
        createdAt: new Date("2024-11-13")
      }
    ];

    sampleCases.forEach(case_ => {
      this.cases.set(case_.id, case_);
    });
    this.currentCaseId = 5;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      rol: insertUser.rol || "medico"
    };
    this.users.set(id, user);
    return user;
  }

  async getCases(): Promise<Case[]> {
    return Array.from(this.cases.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
      createdAt: new Date()
    };
    this.cases.set(id, case_);
    return case_;
  }
}

export const storage = new MemStorage();
