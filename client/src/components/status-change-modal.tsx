import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Case, STATUS_COLORS, STATUS_TRANSITIONS, RAZONES_MEDICO, RAZONES_EXPERTO } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ newStatus, razon }: { newStatus: string; razon: string }) => {
      return await apiRequest("PATCH", `/api/cases/${case_.id}/status`, { newStatus, razon });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${case_.id}`] });
      toast({
        title: "Estado actualizado",
        description: `El caso ha sido marcado como "${selectedStatus}"`
      });
      onClose();
      setSelectedStatus("");
      setSelectedReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!selectedStatus || !selectedReason) {
      toast({
        title: "Campos requeridos",
        description: "Debes seleccionar un estado y una razón",
        variant: "destructive"
      });
      return;
    }

    updateStatusMutation.mutate({
      newStatus: selectedStatus,
      razon: selectedReason
    });
  };

  const availableStatuses = STATUS_TRANSITIONS[userRole as keyof typeof STATUS_TRANSITIONS][case_.status as keyof typeof STATUS_TRANSITIONS.medico] || [];
  const reasonsKey = selectedStatus?.toLowerCase() as keyof typeof RAZONES_MEDICO;
  const reasons = userRole === "medico" 
    ? RAZONES_MEDICO[reasonsKey] || []
    : RAZONES_EXPERTO[reasonsKey] || [];

  const handleClose = () => {
    setSelectedStatus("");
    setSelectedReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Caso</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Estado actual:</p>
            <Badge className={STATUS_COLORS[case_.status as keyof typeof STATUS_COLORS]}>
              {case_.status}
            </Badge>
            {case_.reabierto && (
              <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
                Reabierto
              </Badge>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Nuevo estado:</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStatus && (
            <div>
              <label className="text-sm font-medium">Razón del cambio:</label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar razón" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedStatus || !selectedReason || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Actualizando..." : "Actualizar Estado"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}