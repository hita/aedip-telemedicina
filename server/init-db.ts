import { db } from "./db";
import { users, cases, messages } from "@shared/schema";
import { AuthUtils } from "./auth";
import { eq } from "drizzle-orm";

/**
 * Initialize database with secure default users and sample data
 */
export async function initializeDatabase() {
  try {
    // Clean up existing data for fresh start
    await db.delete(messages);
    await db.delete(cases);
    await db.delete(users);

    // Generate secure password hashes for default users
    const { medico: medicoPasswordHash, experto: expertoPasswordHash, medico2: medico2PasswordHash } = 
      await AuthUtils.generateDefaultPasswords();

    // Generate anonymous nicknames
    const medicoNickname = AuthUtils.generateAnonymousNickname("Dr. García", "doctor@hospital.com");
    const medico2Nickname = AuthUtils.generateAnonymousNickname("Dr. López", "doctor2@hospital.com");

    // Insert default users with hashed passwords and anonymous nicknames
    const insertedUsers = await db.insert(users).values([
      {
        email: "doctor@hospital.com",
        password: medicoPasswordHash,
        rol: "medico",
        nombre: "Dr. García",
        nicknameAnonimo: medicoNickname
      },
      {
        email: "experto@hospital.com", 
        password: expertoPasswordHash,
        rol: "experto",
        nombre: "Dr. María Rodríguez",
        nicknameAnonimo: null
      },
      {
        email: "doctor2@hospital.com",
        password: medico2PasswordHash,
        rol: "medico", 
        nombre: "Dr. López",
        nicknameAnonimo: medico2Nickname
      }
    ]).returning();

    // Create realistic immunodeficiency cases
    const casesData = [
      {
        title: "Infecciones respiratorias recurrentes",
        sex: "M",
        ageRange: "19-35",
        description: "Paciente de 28 años con historial de neumonías de repetición (4 episodios en el último año). Bronquiectasias en TC torácico. Padres consanguíneos.",
        query: "¿Qué estudios inmunológicos básicos recomiendan? ¿Debo solicitar inmunoglobulinas y subclases de IgG? El paciente ya ha recibido múltiples antibióticos.",
        urgency: "Media",
        status: "Nuevo",
        expertoAsignado: null,
        creadoPor: medicoNickname,
        razonCambio: null,
        reabierto: false,
        historialEstados: [],
        ultimoMensaje: null,
        mensajesNoLeidos: {}
      },
      {
        title: "Sospecha de inmunodeficiencia combinada",
        sex: "F", 
        ageRange: "0-5",
        description: "Lactante de 8 meses con infecciones graves recurrentes desde los 3 meses. Candidiasis oral persistente, diarrea crónica y retraso pondoestatural. Linfopenia severa en hemograma.",
        query: "Requiero orientación urgente. Sospecho inmunodeficiencia combinada severa. ¿Qué estudios solicitar de forma prioritaria? ¿Debo aislar al paciente?",
        urgency: "Alta",
        status: "En revisión",
        expertoAsignado: "Dr. María Rodríguez",
        creadoPor: medico2Nickname,
        razonCambio: null,
        reabierto: false,
        historialEstados: [],
        ultimoMensaje: {
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          autor: "Dr. María Rodríguez",
          preview: "Correcto, necesitamos aislar al paciente inmediatamente..."
        },
        mensajesNoLeidos: {
          [medico2Nickname]: 1
        }
      },
      {
        title: "Déficit de complemento sospechado",
        sex: "M",
        ageRange: "6-18", 
        description: "Adolescente de 15 años con meningitis meningocócica recurrente (2 episodios). Antecedente familiar de infecciones por Neisseria. Sin otras infecciones significativas.",
        query: "Sospecho déficit de complemento terminal. ¿Cómo proceder con el estudio? ¿Qué profilaxis antibiótica recomiendan mientras se estudia?",
        urgency: "Media",
        status: "Resuelto",
        expertoAsignado: "Dr. María Rodríguez",
        creadoPor: medicoNickname,
        razonCambio: "Estudio completado y paciente derivado a inmunología",
        reabierto: false,
        historialEstados: [],
        ultimoMensaje: {
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          autor: "Dr. García", 
          preview: "Perfecto, muchas gracias por la orientación..."
        },
        mensajesNoLeidos: {}
      },
      {
        title: "Hipogammaglobulinemia y autoimmunidad",
        sex: "F",
        ageRange: "36-50",
        description: "Mujer de 42 años con hipogammaglobulinemia (IgG 4.2 g/L), artritis reumatoide y tiroiditis autoinmune. Infecciones sinopulmonares de repetición.",
        query: "¿Es candidata a reemplazo con inmunoglobulinas? ¿Cómo manejar la inmunosupresión para la artritis en este contexto? ¿Sospecha de CVID?",
        urgency: "Baja",
        status: "En revisión", 
        expertoAsignado: "Dr. María Rodríguez",
        creadoPor: medico2Nickname,
        razonCambio: null,
        reabierto: false,
        historialEstados: [],
        ultimoMensaje: {
          fecha: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          autor: medico2Nickname,
          preview: "Adjunto los resultados de subclases de IgG..."
        },
        mensajesNoLeidos: {
          "experto@hospital.com": 1
        }
      }
    ];

    const insertedCases = await db.insert(cases).values(casesData).returning();

    // Create realistic chat messages for some cases
    const messagesData = [
      // Messages for case 2 (SCID suspicion)
      {
        caseId: insertedCases[1].id,
        autorNombre: medico2Nickname,
        autorRol: "medico",
        contenido: "Buenos días. Tengo una lactante de 8 meses con un cuadro que me preocupa mucho. Desde los 3 meses ha tenido infecciones graves recurrentes: neumonía por P. jirovecii, candidiasis oral que no responde a antifúngicos, diarrea crónica con rotavirus persistente. El hemograma muestra linfopenia severa (500/μL). Los padres no son consanguíneos pero sí del mismo pueblo pequeño. ¿Podría ser una inmunodeficiencia combinada severa?"
      },
      {
        caseId: insertedCases[1].id,
        autorNombre: "Dr. María Rodríguez",
        autorRol: "experto", 
        contenido: "Buenos días. El cuadro que describe es muy sugestivo de inmunodeficiencia combinada severa (SCID). La combinación de infecciones oportunistas (P. jirovecii), candidiasis persistente, diarrea crónica y linfopenia severa en un lactante es prácticamente patognomónica. ACCIÓN INMEDIATA: 1) Aislar al paciente (habitación individual, flujo laminar si está disponible), 2) Suspender vacunas vivas, 3) Solo productos sanguíneos irradiados, 4) Solicitar urgente: subpoblaciones linfocitarias por citometría, proliferación linfocitaria, inmunoglobulinas. ¿Tienen acceso a citometría de flujo?"
      },
      {
        caseId: insertedCases[1].id,
        autorNombre: medico2Nickname,
        autorRol: "medico",
        contenido: "Perfecto, ya procedimos con el aislamiento. Sí tenemos citometría. Los resultados preliminares muestran: CD3+ <100/μL, CD4+ <50/μL, CD8+ <50/μL, CD19+ <10/μL, NK normales. Las inmunoglobulinas están muy bajas. ¿Siguiente paso?"
      },
      {
        caseId: insertedCases[1].id,
        autorNombre: "Dr. María Rodríguez", 
        autorRol: "experto",
        contenido: "Correcto, necesitamos aislar al paciente inmediatamente. Los valores confirman SCID típica (T-B-NK+). Contacten urgentemente con centro de trasplante de médula ósea pediátrico. Mientras tanto: 1) Gammaglobulina IV (400-600 mg/kg cada 3-4 semanas), 2) Profilaxis antimicrobiana (cotrimoxazol, fluconazol), 3) Soporte nutricional intensivo. ¿La familia tiene hermanos que puedan ser donantes potenciales?"
      },

      // Messages for case 3 (Resolved complement deficiency)
      {
        caseId: insertedCases[2].id,
        autorNombre: medicoNickname,
        autorRol: "medico",
        contenido: "Consulto por adolescente con segundo episodio de meningitis meningocócica. El primero fue hace 2 años (N. meningitidis serogrupo B), ahora nuevamente meningitis por N. meningitidis serogrupo C. Antecedente familiar: tío materno falleció por meningitis en la adolescencia. Resto de infecciones normales para su edad. ¿Cómo estudio el complemento?"
      },
      {
        caseId: insertedCases[2].id,
        autorNombre: "Dr. María Rodríguez",
        autorRol: "experto",
        contenido: "Clásico déficit de complemento terminal (C5-C9). El antecedente familiar refuerza la sospecha. Solicita: CH50 (actividad hemolítica total), C3, C4, y si están normales, solicitar C5-C9 individual (algunos laboratorios tienen panel de complemento terminal). Profilaxis inmediata con penicilina V 250mg cada 12h hasta tener resultados. Vacunar contra meningococo (todas las cepas disponibles). ¿El paciente está completamente recuperado de este episodio?"
      },
      {
        caseId: insertedCases[2].id,
        autorNombre: medicoNickname,
        autorRol: "medico",
        contenido: "Sí, recuperación completa sin secuelas. Ya solicité los estudios. CH50 indetectable, C3 y C4 normales. El laboratorio confirmó déficit de C7. Iniciamos profilaxis y completamos esquema de vacunación. ¿Requiere seguimiento especial a largo plazo?"
      },
      {
        caseId: insertedCases[2].id,
        autorNombre: "Dr. María Rodríguez",
        autorRol: "experto",
        contenido: "Excelente manejo. Déficit de C7 confirmado. A largo plazo: 1) Profilaxis antibiótica de por vida (penicilina V), 2) Revacunación antimeningocócica cada 5 años, 3) Educación sobre signos de alarma, 4) Estudio familiar (padres y hermanos). Con profilaxis adecuada el pronóstico es excelente. Deriven a inmunología para seguimiento."
      },
      {
        caseId: insertedCases[2].id,
        autorNombre: medicoNickname,
        autorRol: "medico",
        contenido: "Perfecto, muchas gracias por la orientación. Ya lo derivamos a inmunología y educamos a la familia. Los padres también se van a estudiar. ¡Excelente apoyo como siempre!"
      },

      // Messages for case 4 (CVID with autoimmunity)
      {
        caseId: insertedCases[3].id,
        autorNombre: medico2Nickname,
        autorRol: "medico",
        contenido: "Paciente de 42 años con cuadro complejo. Hipogammaglobulinemia (IgG 4.2 g/L, IgA <0.5 g/L, IgM 0.3 g/L), artritis reumatoide diagnosticada hace 3 años en tratamiento con metotrexato, tiroiditis de Hashimoto. Último año: 3 sinusitis, 2 neumonías. ¿Es CVID? ¿Cómo manejar la inmunosupresión?"
      },
      {
        caseId: insertedCases[3].id,
        autorNombre: "Dr. María Rodríguez",
        autorRol: "experto",
        contenido: "Muy probablemente CVID con manifestaciones autoinmunes (presente en 20-30% de casos). Antes de confirmar necesito: 1) Subclases de IgG, 2) Respuesta a vacunas (neumocócica polisacárida), 3) Subpoblaciones linfocitarias, 4) Descartar causas secundarias. Respecto al metotrexato: SUSPENDER temporalmente hasta optimizar la inmunidad. La gammaglobulina IV puede mejorar tanto las infecciones como la artritis."
      },
      {
        caseId: insertedCases[3].id,
        autorNombre: medico2Nickname,
        autorRol: "medico",
        contenido: "Adjunto los resultados de subclases de IgG: IgG1 2.1 g/L (bajo), IgG2 0.8 g/L (bajo), IgG3 0.2 g/L (bajo), IgG4 normal. Subpoblaciones: CD19+ bajos (3%), memoria B casi ausentes. Respuesta a neumocócica muy pobre. ¿Iniciamos gammaglobulina?"
      }
    ];

    await db.insert(messages).values(messagesData);

    console.log("Database initialized with secure users and immunodeficiency cases");
    console.log("Default credentials:");
    console.log("- doctor@hospital.com / 1234 (nickname: " + medicoNickname + ")");
    console.log("- experto@hospital.com / 1234");
    console.log("- doctor2@hospital.com / 1234 (nickname: " + medico2Nickname + ")");
    
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}