import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";
import { useLocation } from "wouter";

export default function AccessDenied() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Acceso Denegado
          </CardTitle>
          <CardDescription className="text-gray-600">
            No tienes permisos para acceder a esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 mb-6">
            Tu rol actual no permite el acceso a este recurso. Si crees que esto es un error, contacta con el administrador del sistema.
          </p>
          <Button 
            onClick={() => setLocation("/dashboard")}
            className="w-full"
          >
            Volver al Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}