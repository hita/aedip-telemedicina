import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import aedipLogo from "@/assets/aedip-logo-oficial.png";
import { ClickableStatusBadge } from "@/components/clickable-status-badge";
import { UrgencyIndicator } from "@/components/urgency-indicator";
import { CaseChat } from "@/components/case-chat";
import { Case, STATUS_COLORS, SEX_OPTIONS, AGE_RANGE_OPTIONS } from "@/lib/types";

export default function CaseDetail() {
  const [, setLocation] = useLocation();
  const { id } = useParams();

  const { data: case_, isLoading, error } = useQuery<Case>({
    queryKey: [`/api/cases/${id}`],
    enabled: !!id,
  });

  const { data: user } = useQuery<{user: {id: number, email: string, rol: string, nombre: string}}>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  const handleBack = () => {
    setLocation("/dashboard");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getSexLabel = (sex: string) => {
    const option = SEX_OPTIONS.find(opt => opt.value === sex);
    return option?.label || sex;
  };

  const getAgeRangeLabel = (ageRange: string) => {
    const option = AGE_RANGE_OPTIONS.find(opt => opt.value === ageRange);
    return option?.label || ageRange;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-medical-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-secondary">Cargando caso...</p>
        </div>
      </div>
    );
  }

  if (error || !case_) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Caso no encontrado</h2>
          <p className="text-secondary mb-6">
            El caso que buscas no existe o no tienes permisos para verlo.
          </p>
          <Button
            onClick={handleBack}
            className="bg-medical-blue hover:bg-blue-700 text-white"
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button
              onClick={handleBack}
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
              Detalle del Caso
            </h1>
          </div>
          {user?.user && <UserBadge user={user.user} />}
        </div>
      </div>

      {/* Case Detail Content */}
      <div className="px-6 py-4 space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{case_.title}</h2>
              <UrgencyIndicator urgency={case_.urgency} />
            </div>
            <ClickableStatusBadge case_={case_} userRole={user?.user?.rol || ""} />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary">Sexo del Paciente</p>
                <p className="font-medium">{getSexLabel(case_.sex)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary">Rango de Edad</p>
                <p className="font-medium">{getAgeRangeLabel(case_.ageRange)}</p>
              </div>
            </div>

            {case_.description && (
              <div>
                <p className="text-sm text-secondary mb-1">Descripción del Caso</p>
                <p className="text-primary">{case_.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-secondary mb-1">Consulta Médica</p>
              <p className="text-primary">{case_.query}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary">Creado por</p>
                <p className="font-medium">
                  {user?.user?.rol === "experto" ? "Médico Anónimo" : case_.creadoPor}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">Fecha de Creación</p>
                <p className="font-medium">{formatDate(case_.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary">Experto Asignado</p>
                <p className="font-medium">{case_.expertoAsignado || "Sin asignar"}</p>
              </div>
              <div>
                <p className="text-sm text-secondary">Última Actualización</p>
                <p className="font-medium">{formatDate(case_.updatedAt)}</p>
              </div>
            </div>

            {/* Show reason for status change when case is resolved or canceled */}
            {(case_.status === "Resuelto" || case_.status === "Cancelado") && case_.razonCambio && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-secondary mb-1">
                  {case_.status === "Resuelto" ? "Motivo de resolución:" : "Motivo de cancelación:"}
                </p>
                <p className="text-sm font-medium">{case_.razonCambio}</p>
                {case_.reabierto && (
                  <p className="text-xs text-orange-600 mt-1">
                    Este caso ha sido reabierto
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <CaseChat 
          caseId={case_.id} 
          userRole={user?.user?.rol || ""} 
          userName={user?.user?.nombre || ""} 
        />
      </div>
    </>
  );
}
