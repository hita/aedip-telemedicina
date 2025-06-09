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
  createdAt: string;
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
