export interface Case {
  id: number;
  title: string;
  sex: string;
  ageRange: string;
  description?: string;
  query: string;
  urgency: string;
  status: string;
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
};
