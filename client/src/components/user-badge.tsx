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
    return user.rol === "experto" ? "Experto" : "Médico";
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">{user.nombre}</span>
          <Badge variant="secondary" className="text-xs w-fit">
            {getUserType()}
          </Badge>
        </div>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700 p-2"
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