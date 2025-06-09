import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import { Case, STATUS_COLORS } from "@/lib/types";

export default function Dashboard() {
  const [, setLocation] = useLocation();

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
          <span className="text-sm text-secondary">
            {cases.length} casos
          </span>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No hay casos</h3>
            <p className="text-secondary mb-6">
              Crea tu primer caso médico para comenzar
            </p>
            <Button
              onClick={() => setLocation("/nuevo-caso")}
              className="bg-medical-blue hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Caso
            </Button>
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
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      STATUS_COLORS[case_.status as keyof typeof STATUS_COLORS]
                    }`}
                  >
                    {case_.status}
                  </span>
                </div>
                <p className="text-sm text-secondary mb-3">
                  Creado: {formatDate(case_.createdAt)}
                </p>
                <Button
                  onClick={() => viewCaseDetail(case_.id)}
                  variant="link"
                  className="text-medical-blue p-0 h-auto font-medium hover:underline"
                >
                  Ver Detalles
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => setLocation("/nuevo-caso")}
          className="w-14 h-14 bg-medical-blue hover:bg-blue-700 text-white rounded-full shadow-lg"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </>
  );
}
