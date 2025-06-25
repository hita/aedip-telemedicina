import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User } from "@/lib/auth";
import { useEffect } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RouteGuard({ children, allowedRoles, redirectTo = "/acceso-denegado" }: RouteGuardProps) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && user?.user) {
      const userRole = user.user.rol;
      if (!allowedRoles.includes(userRole)) {
        setLocation(redirectTo);
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-medical-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-secondary">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user?.user || !allowedRoles.includes(user.user.rol)) {
    return null;
  }

  return <>{children}</>;
}