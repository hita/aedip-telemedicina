import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  rol: text("rol").notNull().default("medico"),
  nombre: text("nombre").notNull(),
});

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  status: true,
  createdAt: true,
  creadoPor: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;
