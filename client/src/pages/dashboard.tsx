import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, UserPlus, UserMinus, AlertCircle } from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import { ClickableStatusBadge } from "@/components/clickable-status-badge";
import { Case, STATUS_COLORS } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check authentication
  const { data: user, isLoading: userLoading } = useQuery<{user: {id: number, email: string, rol: string, nombre: string}}>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Get cases
  const { data: cases = [], isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
    enabled: !!user,
  });

  // Assignment mutation for experts
  const assignMutation = useMutation({
    mutationFn: async ({ caseId, action }: { caseId: number; action: "assign" | "unassign" }) => {
      const response = await apiRequest("PATCH", `/api/cases/${caseId}/assign`, { action });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({
        title: "Caso actualizado",
        description: "La asignación se ha actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la asignación del caso",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const viewCaseDetail = (caseId: number) => {
    setLocation(`/caso/${caseId}`);
  };

  if (userLoading || casesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-medical-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-medical-blue text-white px-6 py-4">
        <div className="mb-2">
          <h1 className="text-xl font-semibold">
            {user?.user?.rol === "experto" ? "Panel de Experto" : "Panel de Casos"}
          </h1>
        </div>
        {user?.user && <UserBadge user={user.user} />}
      </div>

      {/* Cases List */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">
            {user?.user?.rol === "experto" ? "Todos los Casos del Sistema" : "Mis Casos"}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary">
              {cases.length} casos
            </span>
            {user?.user?.rol !== "experto" && (
              <Button
                onClick={() => setLocation("/nuevo-caso")}
                className="bg-medical-blue hover:bg-blue-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Caso
              </Button>
            )}
          </div>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No hay casos</h3>
            <p className="text-secondary mb-6">
              {user?.user?.rol === "experto" ? "No hay casos en el sistema" : "Crea tu primer caso médico para comenzar"}
            </p>
            {user?.user?.rol !== "experto" && (
              <Button
                onClick={() => setLocation("/nuevo-caso")}
                className="bg-medical-blue hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Caso
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((case_) => (
              <div
                key={case_.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-primary">{case_.title}</h3>
                  <ClickableStatusBadge case_={case_} userRole={user?.user?.rol || ""} />
                </div>
                <div className="text-sm text-secondary mb-3 space-y-1">
                  <p>Creado por: {case_.creadoPor}</p>
                  <p>Fecha: {formatDate(case_.createdAt)}</p>
                  {case_.expertoAsignado && (
                    <p>Experto: {case_.expertoAsignado}</p>
                  )}
                </div>

                {/* Alert for experts when case is unassigned and needs attention */}
                {user?.user?.rol === "experto" && !case_.expertoAsignado && case_.status === "Nuevo" && (
                  <Alert className="mb-3 border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      Este caso necesita ser atendido por un experto
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => viewCaseDetail(case_.id)}
                    variant="link"
                    className="text-medical-blue p-0 h-auto font-medium hover:underline"
                  >
                    Ver Detalles
                  </Button>

                  {/* Assignment buttons for experts */}
                  {user?.user?.rol === "experto" && (
                    <TooltipProvider>
                      {!case_.expertoAsignado ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => assignMutation.mutate({ caseId: case_.id, action: "assign" })}
                              variant="outline"
                              size="sm"
                              disabled={assignMutation.isPending}
                              className="h-8 w-8 p-0"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Asignármelo a mis casos</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : case_.expertoAsignado === user?.user?.nombre ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => assignMutation.mutate({ caseId: case_.id, action: "unassign" })}
                              variant="outline"
                              size="sm"
                              disabled={assignMutation.isPending}
                              className="h-8 w-8 p-0"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Desasignarme de este caso</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </TooltipProvider>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
