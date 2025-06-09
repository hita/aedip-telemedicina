import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText } from "lucide-react";
import { authApi, type LoginCredentials } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "doctor@hospital.com",
      password: "1234",
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      setLocation("/dashboard");
    },
    onError: () => {
      setError("Credenciales incorrectas");
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    setError("");
    loginMutation.mutate(data);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-medical-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-primary mb-2">
            Consultas Médicas
          </h1>
          <p className="text-secondary">Plataforma de consultas anónimas</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-secondary">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1"
              placeholder="doctor@hospital.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-secondary">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              className="mt-1"
              placeholder="1234"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-medical-blue hover:bg-blue-700 text-white"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        {/* Usuarios de prueba */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2 font-medium">Usuarios de prueba:</p>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-medium">Médico:</span> doctor@hospital.com / 1234
            </div>
            <div>
              <span className="font-medium">Experto:</span> experto@hospital.com / 1234
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
