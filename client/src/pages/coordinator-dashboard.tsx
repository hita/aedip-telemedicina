import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserBadge } from "@/components/user-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, UserPlus, KeyRound, Search, Filter } from "lucide-react";
import { Case } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { RouteGuard } from "@/components/route-guard";
// Use same logo approach as dashboard

interface CoordinatorUser extends User {
  centroReferencia?: string | null;
}

interface CentroReferencia {
  id: number;
  nombre: string;
  activo: string;
}

interface CreateUserData {
  email: string;
  password: string;
  rol: string;
  nombre: string;
  centroReferencia?: string;
}

function CoordinatorDashboardContent() {
  const [searchUser, setSearchUser] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [searchCase, setSearchCase] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CoordinatorUser | null>(null);
  const [newUserData, setNewUserData] = useState<CreateUserData>({
    email: "",
    password: "",
    rol: "medico",
    nombre: "",
    centroReferencia: ""
  });
  const { toast } = useToast();

  // Fetch current user
  const { data: currentUser } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<CoordinatorUser[]>({
    queryKey: ["/api/coordinator/users"],
  });

  // Fetch all cases
  const { data: cases = [], isLoading: casesLoading, refetch: refetchCases } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  // Fetch centros de referencia
  const { data: centros = [] } = useQuery<CentroReferencia[]>({
    queryKey: ["/api/centros-referencia"],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await apiRequest("POST", "/api/coordinator/users", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado correctamente",
      });
      setIsCreateUserOpen(false);
      setNewUserData({ email: "", password: "", rol: "medico", nombre: "", centroReferencia: "" });
      refetchUsers();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CoordinatorUser> }) => {
      const response = await apiRequest("PUT", `/api/coordinator/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario se han actualizado correctamente",
      });
      setEditingUser(null);
      refetchUsers();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/coordinator/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado correctamente",
      });
      refetchUsers();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: number; newPassword: string }) => {
      const response = await apiRequest("POST", `/api/coordinator/users/${id}/reset-password`, { newPassword });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contraseña reseteada",
        description: "La contraseña se ha reseteado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo resetear la contraseña",
        variant: "destructive",
      });
    },
  });

  // Assign expert mutation
  const assignExpertMutation = useMutation({
    mutationFn: async ({ caseId, expertName }: { caseId: number; expertName: string }) => {
      const response = await apiRequest("POST", `/api/cases/${caseId}/assign`, { expertName });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Experto asignado",
        description: "El experto se ha asignado al caso correctamente",
      });
      refetchCases();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo asignar el experto",
        variant: "destructive",
      });
    },
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchUser.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole = filterRole === "all" || user.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  // Filter cases
  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchCase.toLowerCase()) ||
                         case_.hashId.toLowerCase().includes(searchCase.toLowerCase());
    const matchesStatus = filterStatus === "all" || case_.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get experts for assignment
  const experts = users.filter(user => user.rol === "experto");

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case "medico": return "bg-blue-100 text-blue-700";
      case "experto": return "bg-green-100 text-green-700";
      case "coordinador": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (usersLoading || casesLoading) {
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
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="h-8 w-12 bg-medical-blue rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">AEDIP</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-light text-gray-900 tracking-tight">
              Panel de Coordinador
            </h1>
          </div>
          {currentUser?.user && <UserBadge user={currentUser.user} />}
        </div>
      </div>

      <div className="w-full px-6 py-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
            <TabsTrigger value="cases">Gestión de Casos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Usuarios del Sistema</CardTitle>
                    <CardDescription>
                      Gestiona médicos, expertos y coordinadores
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                          Completa los datos del nuevo usuario
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                            placeholder="usuario@hospital.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Contraseña</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUserData.password}
                            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="nombre">Nombre</Label>
                          <Input
                            id="nombre"
                            value={newUserData.nombre}
                            onChange={(e) => setNewUserData({ ...newUserData, nombre: e.target.value })}
                            placeholder="Dr. Juan Pérez"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rol">Rol</Label>
                          <Select value={newUserData.rol} onValueChange={(value) => {
                          const updates = { ...newUserData, rol: value };
                          // Clear centro de referencia if not experto
                          if (value !== "experto") {
                            updates.centroReferencia = "";
                          }
                          setNewUserData(updates);
                        }}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medico">Médico</SelectItem>
                              <SelectItem value="experto">Experto</SelectItem>
                              <SelectItem value="coordinador">Coordinador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {newUserData.rol === "experto" && (
                          <div>
                            <Label htmlFor="centro">Centro de Referencia</Label>
                            <Select 
                              value={newUserData.centroReferencia} 
                              onValueChange={(value) => setNewUserData({ ...newUserData, centroReferencia: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un centro" />
                              </SelectTrigger>
                              <SelectContent>
                                {centros.map(centro => (
                                  <SelectItem key={centro.id} value={centro.nombre}>
                                    {centro.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            onClick={() => createUserMutation.mutate(newUserData)}
                            disabled={createUserMutation.isPending}
                          >
                            Crear Usuario
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nombre o email..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="medico">Médicos</SelectItem>
                      <SelectItem value="experto">Expertos</SelectItem>
                      <SelectItem value="coordinador">Coordinadores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{user.nombre}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <Badge className={getRoleBadgeColor(user.rol)}>
                            {user.rol}
                          </Badge>
                          {user.rol === "experto" && user.centroReferencia && (
                            <Badge variant="outline">
                              {user.centroReferencia}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetPasswordMutation.mutate({ id: user.id, newPassword: "1234" })}
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Casos</CardTitle>
                <CardDescription>
                  Visualiza y gestiona todos los casos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Case Filters */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por título o ID..."
                        value={searchCase}
                        onChange={(e) => setSearchCase(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Nuevo">Nuevo</SelectItem>
                      <SelectItem value="En revisión">En revisión</SelectItem>
                      <SelectItem value="Resuelto">Resuelto</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cases List */}
                <div className="space-y-2">
                  {filteredCases.map(case_ => (
                    <div key={case_.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{case_.title}</h3>
                            <Badge className="text-xs">
                              {case_.hashId}
                            </Badge>
                            <Badge className={
                              case_.status === "Nuevo" ? "bg-blue-100 text-blue-700" :
                              case_.status === "En revisión" ? "bg-yellow-100 text-yellow-700" :
                              case_.status === "Resuelto" ? "bg-green-100 text-green-700" :
                              "bg-red-100 text-red-700"
                            }>
                              {case_.status}
                            </Badge>
                            <Badge variant="outline">
                              {case_.urgency}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{case_.query}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Creado por: {case_.creadoPor}</span>
                            {case_.expertoAsignado && (
                              <span>Experto: {case_.expertoAsignado}
                                {(() => {
                                  const expert = experts.find(e => e.nombre === case_.expertoAsignado);
                                  return expert?.centroReferencia ? ` (${expert.centroReferencia})` : '';
                                })()}
                              </span>
                            )}
                            <span>Fecha: {new Date(case_.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!case_.expertoAsignado && case_.status === "Nuevo" && (
                            <Select onValueChange={(expertName) => 
                              assignExpertMutation.mutate({ caseId: case_.id, expertName })
                            }>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Asignar experto" />
                              </SelectTrigger>
                              <SelectContent>
                                {experts.map(expert => (
                                  <SelectItem key={expert.id} value={expert.nombre}>
                                    {expert.nombre} {expert.centroReferencia && `(${expert.centroReferencia})`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Modifica los datos del usuario
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-rol">Rol</Label>
                <Select value={editingUser.rol} onValueChange={(value) => {
                  const updates = { ...editingUser, rol: value };
                  // Clear centro de referencia if not experto
                  if (value !== "experto") {
                    updates.centroReferencia = null;
                  }
                  setEditingUser(updates);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medico">Médico</SelectItem>
                    <SelectItem value="experto">Experto</SelectItem>
                    <SelectItem value="coordinador">Coordinador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingUser.rol === "experto" && (
                <div>
                  <Label htmlFor="edit-centro">Centro de Referencia</Label>
                  <Select value={editingUser.centroReferencia || ""} onValueChange={(value) => setEditingUser({ ...editingUser, centroReferencia: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un centro" />
                    </SelectTrigger>
                    <SelectContent>
                      {centros.map(centro => (
                        <SelectItem key={centro.id} value={centro.nombre}>
                          {centro.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => updateUserMutation.mutate({ 
                    id: editingUser.id, 
                    data: {
                      email: editingUser.email,
                      nombre: editingUser.nombre,
                      rol: editingUser.rol,
                      centroReferencia: editingUser.centroReferencia
                    }
                  })}
                  disabled={updateUserMutation.isPending}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default function CoordinatorDashboard() {
  return (
    <RouteGuard allowedRoles={["coordinador"]}>
      <CoordinatorDashboardContent />
    </RouteGuard>
  );
}