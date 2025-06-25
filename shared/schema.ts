import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { centrosReferencia } from "./centros-referencia";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  rol: text("rol").notNull().default("medico"),
  nombre: text("nombre").notNull(),
  nicknameAnonimo: text("nickname_anonimo"),
  centroReferencia: text("centro_referencia"),
});

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  hashId: text("hash_id").notNull().unique(),
  title: text("title").notNull(),
  sex: text("sex").notNull(),
  ageRange: text("age_range").notNull(),
  description: text("description"),
  query: text("query").notNull(),
  urgency: text("urgency").notNull(),
  status: text("status").notNull().default("Nuevo"),
  expertoAsignado: text("experto_asignado"),
  creadoPor: text("creado_por").notNull(),
  razonCambio: text("razon_cambio"),
  reabierto: boolean("reabierto").default(false),
  historialEstados: jsonb("historial_estados").default([]),
  ultimoMensaje: jsonb("ultimo_mensaje"),
  mensajesNoLeidos: jsonb("mensajes_no_leidos").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  autorNombre: text("autor_nombre").notNull(),
  autorRol: text("autor_rol").notNull(),
  contenido: text("contenido").notNull(),
  fechaEnvio: timestamp("fecha_envio").defaultNow().notNull(),
  leido: boolean("leido").default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  hashId: true,
  status: true,
  createdAt: true,
  creadoPor: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  fechaEnvio: true,
  leido: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Export centros de referencia
export { centrosReferencia } from "./centros-referencia";
export type { CentroReferencia } from "./centros-referencia";
