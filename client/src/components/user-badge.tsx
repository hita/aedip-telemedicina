import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, LogOut, Stethoscope } from "lucide-react";
import { authApi } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

interface UserBadgeProps {
  user: {
    id: number;
    email: string;
    rol: string;
    nombre: string;
  };
}

export function UserBadge({ user }: UserBadgeProps) {
  const [, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserType = () => {
    switch (user.rol) {
      case "experto": return "Experto";
      case "coordinador": return "Coordinador";
      default: return "Médico";
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
        <div className="text-xs text-gray-500">{getUserType()}</div>
      </div>
      <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
        <Stethoscope className="w-4 h-4 text-white" />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg"
          >
            <User className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="end">
          <div className="space-y-2">
            <div className="text-sm font-medium">{user.nombre}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
            <div className="text-xs text-muted-foreground">{getUserType()}</div>
            <hr />
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? "Cerrando..." : "Cerrar Sesión"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}