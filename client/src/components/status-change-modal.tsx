import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Case, STATUS_COLORS, STATUS_TRANSITIONS, RAZONES_MEDICO, RAZONES_EXPERTO } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StatusChangeModalProps {
  case_: Case;
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StatusChangeModal({ case_, userRole, isOpen, onClose }: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedExpert, setSelectedExpert] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isExpert = userRole === "experto";
  const isCoordinator = userRole === "coordinador";

  // Fetch experts for coordinator reassignment
  const { data: experts = [] } = useQuery<any[]>({
    queryKey: ["/api/coordinator/users"],
    enabled: isCoordinator,
  });

  const availableTransitions = STATUS_TRANSITIONS[case_.status as keyof typeof STATUS_TRANSITIONS] || [];
  const reasonsConfig = isExpert ? RAZONES_EXPERTO : RAZONES_MEDICO;

  const mutation = useMutation({
    mutationFn: async () => {
      if (isCoordinator && selectedExpert !== "") {
        // For coordinators, update expert assignment
        const response = await apiRequest("PUT", `/api/coordinator/cases/${case_.id}`, {
          expertoAsignado: selectedExpert === "none" ? null : selectedExpert
        });
        return response.json();
      } else {
        // For experts/doctors, update status
        const data: any = {
          status: selectedStatus,
        };
        
        if (selectedReason) {
          data.razonCambio = selectedReason;
        }

        const response = await apiRequest("PUT", `/api/cases/${case_.id}/status`, data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${case_.id}`] });
      toast({
        title: isCoordinator ? "Experto asignado" : "Estado actualizado",
        description: isCoordinator 
          ? "El experto ha sido asignado al caso" 
          : `El caso ha sido marcado como ${selectedStatus}`,
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedStatus("");
    setSelectedReason("");
    setSelectedExpert("");
    onClose();
  };

  const canSubmit = isCoordinator 
    ? selectedExpert !== "" 
    : selectedStatus && (!reasonsConfig[selectedStatus] || selectedReason);

  const handleSubmit = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCoordinator ? "Asignar Experto" : "Cambiar Estado del Caso"}
          </DialogTitle>
          <DialogDescription>
            Caso: {case_.title} ({case_.hashId})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isCoordinator ? (
            <div>
              <Label>Asignar Experto</Label>
              <Select value={selectedExpert} onValueChange={setSelectedExpert}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un experto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {experts
                    .filter(user => user.rol === "experto")
                    .map((expert) => (
                      <SelectItem key={expert.id} value={expert.nombre}>
                        {expert.nombre} ({expert.centroReferencia || "Sin centro"})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {case_.expertoAsignado && (
                <p className="text-sm text-gray-600 mt-2">
                  Actualmente asignado a: {case_.expertoAsignado}
                </p>
              )}
            </div>
          ) : (
            <>
              <div>
                <Label>Nuevo Estado</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTransitions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStatus && reasonsConfig[selectedStatus] && (
                <div>
                  <Label>Razón del Cambio</Label>
                  <Select value={selectedReason} onValueChange={setSelectedReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una razón" />
                    </SelectTrigger>
                    <SelectContent>
                      {reasonsConfig[selectedStatus].map((reason: string) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending 
              ? "Actualizando..." 
              : isCoordinator 
                ? "Asignar" 
                : "Actualizar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}