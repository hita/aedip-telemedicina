import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, UserPlus, UserMinus, AlertCircle } from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import { ClickableStatusBadge } from "@/components/clickable-status-badge";
import { CaseFilterBar } from "@/components/case-filter-bar";
import { UrgencyIndicator } from "@/components/urgency-indicator";
import { UnreadMessagesBadge } from "@/components/unread-messages-badge";
import { Case, STATUS_COLORS, sortCases } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);

  // Check authentication
  const { data: user, isLoading: userLoading } = useQuery<{user: {id: number, email: string, rol: string, nombre: string}}>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Get cases with polling
  const { data: cases = [], isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
    enabled: !!user,
    refetchInterval: 10000, // Poll every 10 seconds
    refetchIntervalInBackground: true,
  });

  // Initialize filtered cases when data loads
  useEffect(() => {
    if (cases.length > 0) {
      setFilteredCases(sortCases(cases));
    }
  }, [cases]);

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
              {filteredCases.length} casos
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

        {/* Filter Bar */}
        <CaseFilterBar 
          cases={cases}
          userRole={user?.user?.rol || ""}
          onFiltersChange={setFilteredCases}
        />

        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {cases.length === 0 ? "No hay casos" : "No hay casos que coincidan con los filtros"}
            </h3>
            <p className="text-secondary mb-6">
              {cases.length === 0 
                ? (user?.user?.rol === "experto" ? "No hay casos en el sistema" : "Crea tu primer caso médico para comenzar")
                : "Ajusta los filtros para ver más casos."
              }
            </p>
            {user?.user?.rol !== "experto" && cases.length === 0 && (
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
          <div className="space-y-4">
            {filteredCases.map((case_) => (
              <div
                key={case_.id}
                onClick={() => viewCaseDetail(case_.id)}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-lg hover:border-medical-blue/40 transition-all duration-300 group"
              >
                {/* Header with title and status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-medical-blue transition-colors">
                        {case_.title}
                      </h3>
                      <UnreadMessagesBadge case_={case_} userEmail={user?.user?.email || ""} />
                    </div>
                    <div className="flex items-center gap-3">
                      <UrgencyIndicator urgency={case_.urgency} />
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{formatDate(case_.createdAt)}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <ClickableStatusBadge case_={case_} userRole={user?.user?.rol || ""} />
                  </div>
                </div>

                {/* Metadata row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>Por {case_.creadoPor}</span>
                    {case_.expertoAsignado && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>Experto: {case_.expertoAsignado}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Expert actions and alerts */}
                {user?.user?.rol === "experto" && (
                  <div className="mt-4 flex items-center justify-between">
                    {/* Alert for unassigned cases */}
                    {!case_.expertoAsignado && case_.status === "Nuevo" && (
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Necesita atención de experto</span>
                      </div>
                    )}
                    
                    {/* Assignment button */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <TooltipProvider>
                        {!case_.expertoAsignado ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => assignMutation.mutate({ caseId: case_.id, action: "assign" })}
                                variant="outline"
                                size="sm"
                                disabled={assignMutation.isPending}
                                className="h-8 px-3 text-xs font-medium"
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Asignar
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
                                className="h-8 px-3 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <UserMinus className="h-3 w-3 mr-1" />
                                Desasignar
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Desasignarme de este caso</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : null}
                      </TooltipProvider>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
