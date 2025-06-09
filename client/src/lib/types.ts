export interface Case {
  id: number;
  title: string;
  sex: string;
  ageRange: string;
  description?: string;
  query: string;
  urgency: string;
  status: string;
  expertoAsignado?: string | null;
  creadoPor: string;
  razonCambio?: string | null;
  reabierto?: boolean;
  historialEstados?: any[];
  ultimoMensaje?: {
    fecha: string;
    autor: string;
    preview: string;
  } | null;
  mensajesNoLeidos?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  caseId: number;
  autorNombre: string;
  autorRol: string;
  contenido: string;
  fechaEnvio: string;
  leido: boolean;
}

export interface CreateMessageData {
  contenido: string;
}

export interface CreateCaseData {
  title: string;
  sex: string;
  ageRange: string;
  description?: string;
  query: string;
  urgency: string;
}

export const SEX_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "Otro", label: "Otro" },
];

export const AGE_RANGE_OPTIONS = [
  { value: "0-18", label: "0-18 años" },
  { value: "19-35", label: "19-35 años" },
  { value: "36-50", label: "36-50 años" },
  { value: "51-65", label: "51-65 años" },
  { value: "65+", label: "65+ años" },
];

export const URGENCY_OPTIONS = [
  { value: "Baja", label: "Baja" },
  { value: "Media", label: "Media" },
  { value: "Alta", label: "Alta" },
];

export const STATUS_COLORS = {
  "Nuevo": "bg-blue-100 text-blue-700",
  "En revisión": "bg-yellow-100 text-yellow-700", 
  "Resuelto": "bg-green-100 text-green-700",
  "Cancelado": "bg-red-100 text-red-700",
};

// Predefined reasons for status changes
export const RAZONES_MEDICO = {
  resuelto: [
    'Caso resuelto por médico de cabecera',
    'Paciente derivado a otro especialista',
    'Diagnóstico confirmado por otras pruebas',
    'Tratamiento iniciado con éxito',
    'Segunda opinión ya no necesaria'
  ],
  cancelado: [
    'Paciente falleció',
    'Paciente trasladado a otro centro',
    'Paciente abandonó seguimiento',
    'Caso duplicado',
    'Información insuficiente para continuar',
    'Familia decidió no continuar'
  ]
};

export const RAZONES_EXPERTO = {
  resuelto: [
    'Diagnóstico confirmado y recomendaciones dadas',
    'Plan de tratamiento establecido',
    'Derivación a subespecialista completada',
    'Consulta resuelta satisfactoriamente',
    'No requiere seguimiento adicional'
  ],
  cancelado: [
    'Información clínica insuficiente',
    'Caso fuera de mi especialidad',
    'Requiere evaluación presencial urgente',
    'Datos contradictorios o incompletos',
    'Caso requiere otro tipo de especialista'
  ],
  "en revisión": [
    'Nueva información clínica disponible',
    'Requiere segunda evaluación inmunológica',
    'Resultados de laboratorio adicionales recibidos',
    'Evolución clínica inesperada del paciente',
    'Solicitud de médico tratante para reevaluación',
    'Caso marcado incorrectamente como cerrado',
    'Aparición de nuevos síntomas relacionados'
  ]
};

// Status transitions allowed by role
export const STATUS_TRANSITIONS = {
  medico: {
    "Nuevo": ["Cancelado", "Resuelto"],
    "En revisión": ["Cancelado", "Resuelto"],
    "Resuelto": [],
    "Cancelado": []
  },
  experto: {
    "Nuevo": [],
    "En revisión": ["Resuelto", "Cancelado"],
    "Resuelto": ["En revisión"],
    "Cancelado": ["En revisión"]
  }
};

// Ordering functions
export const getStatusPriority = (status: string): number => {
  switch (status) {
    case "Nuevo": return 1;
    case "En revisión": return 2;
    case "Resuelto": return 3;
    case "Cancelado": return 3;
    default: return 4;
  }
};

export const getUrgencyPriority = (urgency: string): number => {
  switch (urgency) {
    case "Alta": return 1;
    case "Media": return 2;
    case "Baja": return 3;
    default: return 4;
  }
};

export const sortCases = (cases: Case[]): Case[] => {
  return [...cases].sort((a, b) => {
    // First: Status priority (Nuevo > En revisión > Resuelto/Cancelado)
    const statusDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
    if (statusDiff !== 0) return statusDiff;
    
    // Second: Urgency priority (Alta > Media > Baja)
    const urgencyDiff = getUrgencyPriority(a.urgency) - getUrgencyPriority(b.urgency);
    if (urgencyDiff !== 0) return urgencyDiff;
    
    // Third: Most recently updated first
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};
