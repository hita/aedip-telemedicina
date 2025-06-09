import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import aedipLogo from "@/assets/aedip-logo-oficial.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreateCaseData, SEX_OPTIONS, AGE_RANGE_OPTIONS, URGENCY_OPTIONS } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type CreateCaseFormData = CreateCaseData & {
  dataAnonymized: boolean;
};

const caseSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  sex: z.string().min(1, "El sexo es requerido"),
  ageRange: z.string().min(1, "El rango de edad es requerido"),
  description: z.string().optional(),
  query: z.string().min(1, "La consulta médica es obligatoria"),
  urgency: z.string().min(1, "El nivel de urgencia es requerido"),
  dataAnonymized: z.boolean().refine(val => val === true, {
    message: "Debe confirmar que ha anonimizado los datos del paciente",
  }),
});

export default function NewCase() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check authentication
  const { data: user } = useQuery<{user: {id: number, email: string, rol: string, nombre: string}}>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateCaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: "",
      sex: "",
      ageRange: "",
      description: "",
      query: "",
      urgency: "",
      dataAnonymized: false,
    },
  });

  const createCaseMutation = useMutation({
    mutationFn: async (data: CreateCaseData) => {
      const response = await apiRequest("POST", "/api/cases", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({
        title: "¡Caso Creado!",
        description: "El caso se ha guardado exitosamente",
      });
      reset();
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el caso",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCaseFormData) => {
    // Remove dataAnonymized field before sending to API
    const { dataAnonymized, ...caseData } = data;
    createCaseMutation.mutate(caseData);
  };

  const handleCancel = () => {
    setLocation("/dashboard");
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img 
              src={aedipLogo} 
              alt="AEDIP" 
              className="h-8 w-auto"
              style={{filter: 'brightness(0) saturate(100%) invert(21%) sepia(89%) saturate(1755%) hue-rotate(213deg) brightness(94%) contrast(97%)'}}
            />
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-light text-gray-900 tracking-tight">
              Nuevo Caso
            </h1>
          </div>
          {user?.user && <UserBadge user={user.user} />}
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-secondary">
              Título del Caso *
            </Label>
            <Input
              id="title"
              {...register("title")}
              className="mt-1"
              placeholder="Ej: Dolor abdominal persistente"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sex" className="text-secondary">
                Sexo del Paciente
              </Label>
              <Select
                value={watch("sex")}
                onValueChange={(value) => setValue("sex", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sex && (
                <p className="text-sm text-red-600 mt-1">{errors.sex.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ageRange" className="text-secondary">
                Rango de Edad
              </Label>
              <Select
                value={watch("ageRange")}
                onValueChange={(value) => setValue("ageRange", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ageRange && (
                <p className="text-sm text-red-600 mt-1">{errors.ageRange.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-secondary">
              Descripción del Caso
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              className="mt-1 resize-none"
              rows={3}
              placeholder="Describe los síntomas y contexto del caso..."
            />
          </div>

          <div>
            <Label htmlFor="query" className="text-secondary">
              Consulta Médica *
            </Label>
            <Textarea
              id="query"
              {...register("query")}
              className="mt-1 resize-none"
              rows={3}
              placeholder="¿Qué consulta específica deseas realizar?"
            />
            {errors.query && (
              <p className="text-sm text-red-600 mt-1">{errors.query.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="urgency" className="text-secondary">
              Nivel de Urgencia
            </Label>
            <Select
              value={watch("urgency")}
              onValueChange={(value) => setValue("urgency", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.urgency && (
              <p className="text-sm text-red-600 mt-1">{errors.urgency.message}</p>
            )}
          </div>

          {/* Data Anonymization Confirmation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="dataAnonymized"
                checked={watch("dataAnonymized")}
                onCheckedChange={(checked) => setValue("dataAnonymized", checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="dataAnonymized" className="text-amber-800 font-medium text-sm cursor-pointer">
                  Confirmación de anonimización de datos *
                </Label>
                <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                  Confirmo que he eliminado o anonimizado todos los datos personales del paciente 
                  (nombre, apellidos, número de historia clínica, fechas específicas, etc.) de la 
                  consulta médica. La información no contiene datos que permitan identificar al paciente.
                </p>
              </div>
            </div>
            {errors.dataAnonymized && (
              <p className="text-sm text-red-600 mt-2 ml-6">{errors.dataAnonymized.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={createCaseMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-medical-blue hover:bg-blue-700 text-white"
              disabled={createCaseMutation.isPending}
            >
              {createCaseMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
