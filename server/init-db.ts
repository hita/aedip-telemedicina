import { db } from "./db";
import { users } from "@shared/schema";
import { AuthUtils } from "./auth";
import { eq } from "drizzle-orm";

/**
 * Initialize database with secure default users
 */
export async function initializeDatabase() {
  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      console.log("Database already initialized with users");
      return;
    }

    // Generate secure password hashes for default users
    const { medico: medicoPasswordHash, experto: expertoPasswordHash } = 
      await AuthUtils.generateDefaultPasswords();

    // Insert default users with hashed passwords
    await db.insert(users).values([
      {
        email: "doctor@hospital.com",
        password: medicoPasswordHash,
        rol: "medico",
        nombre: "Dr. García"
      },
      {
        email: "experto@hospital.com", 
        password: expertoPasswordHash,
        rol: "experto",
        nombre: "Dr. María Rodríguez"
      }
    ]);

    console.log("Database initialized with secure default users");
    console.log("Default credentials:");
    console.log("- doctor@hospital.com / 1234");
    console.log("- experto@hospital.com / 1234");
    
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}