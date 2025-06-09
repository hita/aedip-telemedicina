import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, AlertCircle } from "lucide-react";
import { Case } from "@/lib/types";

interface CaseFilterBarProps {
  cases: Case[];
  userRole: string;
  onFiltersChange: (filteredCases: Case[]) => void;
}

export function CaseFilterBar({ cases, userRole, onFiltersChange }: CaseFilterBarProps) {
  const [visibleStatuses, setVisibleStatuses] = useState<string[]>([
    "Nuevo", "En revisión", "Resuelto", "Cancelado"
  ]);

  const statusOptions = [
    { value: "Nuevo", label: "Nuevo", color: "bg-blue-100 text-blue-700" },
    { value: "En revisión", label: "En revisión", color: "bg-yellow-100 text-yellow-700" },
    { value: "Resuelto", label: "Resuelto", color: "bg-green-100 text-green-700" },
    { value: "Cancelado", label: "Cancelado", color: "bg-red-100 text-red-700" }
  ];

  // Count unassigned new cases (only for experts)
  const unassignedNewCases = userRole === "experto" 
    ? cases.filter(case_ => case_.status === "Nuevo" && !case_.expertoAsignado).length 
    : 0;

  const handleStatusToggle = (status: string, checked: boolean) => {
    let newVisibleStatuses: string[];
    
    if (checked) {
      newVisibleStatuses = [...visibleStatuses, status];
    } else {
      newVisibleStatuses = visibleStatuses.filter(s => s !== status);
    }
    
    setVisibleStatuses(newVisibleStatuses);
    
    // Filter cases based on visible statuses
    const filteredCases = cases.filter(case_ => 
      newVisibleStatuses.includes(case_.status)
    );
    
    onFiltersChange(filteredCases);
  };

  const resetFilters = () => {
    const allStatuses = ["Nuevo", "En revisión", "Resuelto", "Cancelado"];
    setVisibleStatuses(allStatuses);
    onFiltersChange(cases);
  };

  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
              {visibleStatuses.length < 4 && (
                <Badge variant="secondary" className="ml-1">
                  {visibleStatuses.length}/4
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Estados visibles</h4>
              <div className="space-y-2">
                {statusOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={visibleStatuses.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleStatusToggle(option.value, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={option.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <span className={`px-2 py-1 rounded-full text-xs ${option.color}`}>
                        {option.label}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="w-full"
                >
                  Mostrar todos
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Show active filters */}
        {visibleStatuses.length < 4 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Mostrando:</span>
            {visibleStatuses.map(status => {
              const option = statusOptions.find(opt => opt.value === status);
              return (
                <span 
                  key={status}
                  className={`px-2 py-1 rounded-full text-xs ${option?.color}`}
                >
                  {status}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Unassigned cases notification (experts only) */}
      {userRole === "experto" && unassignedNewCases > 0 && (
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {unassignedNewCases} caso{unassignedNewCases > 1 ? 's' : ''} sin asignar
          </span>
        </div>
      )}
    </div>
  );
}