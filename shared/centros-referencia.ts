import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const centrosReferencia = pgTable("centros_referencia", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull().unique(),
  activo: text("activo").notNull().default("true"),
});

export type CentroReferencia = typeof centrosReferencia.$inferSelect;

// Default centers data
export const DEFAULT_CENTROS = [
  { nombre: "Sevilla" },
  { nombre: "Barcelona" },
  { nombre: "La Paz" },
  { nombre: "Gregorio Marañón" },
];