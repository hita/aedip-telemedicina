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
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, Clock, Users } from "lucide-react";
import { authApi, type LoginCredentials } from "@/lib/auth";
import aedipLogo from "@/assets/aedip-logo-oficial.png";

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        {/* Header with AEDIP Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src={aedipLogo} 
              alt="AEDIP - Asociación Española de Inmunodeficiencias Primarias" 
              className="h-20 w-auto filter brightness-0 saturate-0"
              style={{filter: 'brightness(0) saturate(100%) invert(21%) sepia(89%) saturate(1755%) hue-rotate(213deg) brightness(94%) contrast(97%)'}}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Plataforma de Consultas
          </h1>
          <p className="text-gray-600 text-sm">
            Sistema especializado en inmunodeficiencias primarias
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="doctor@hospital.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="1234"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-colors"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information for Healthcare Professionals */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Necesitas acceso como profesional sanitario?
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Si eres un profesional sanitario y necesitas acceso directo a nuestros expertos 
                  en inmunodeficiencias primarias, contáctanos para obtener credenciales de acceso inmediato.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 text-xs font-medium mb-1">🔒 Anonimato Garantizado</p>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    AEDIP actúa como intermediario para proteger tu identidad. Los expertos no pueden 
                    ver tu nombre, email ni datos personales. Todas las consultas son completamente anónimas.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pl-13">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Horario:</span> Lunes a viernes, 15:00 - 17:00h
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <a 
                  href="tel:913923855" 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  91 392 38 55
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <a 
                  href="mailto:expertos@aedip.com" 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  expertos@aedip.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Users */}
        <Card className="mt-4 bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-3 font-medium">Usuarios de prueba:</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div>
                <span className="font-medium text-gray-800">Médico:</span> doctor@hospital.com / 1234
              </div>
              <div>
                <span className="font-medium text-gray-800">Experto:</span> experto@hospital.com / 1234
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
