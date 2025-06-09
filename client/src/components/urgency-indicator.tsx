import { Cross } from "lucide-react";

interface UrgencyIndicatorProps {
  urgency: string;
  className?: string;
}

export function UrgencyIndicator({ urgency, className = "" }: UrgencyIndicatorProps) {
  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case "Alta":
        return {
          color: "text-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          label: "Urgencia Alta"
        };
      case "Media":
        return {
          color: "text-orange-500",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          label: "Urgencia Media"
        };
      case "Baja":
        return {
          color: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          label: "Urgencia Baja"
        };
      default:
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          label: "Sin urgencia"
        };
    }
  };

  const config = getUrgencyConfig(urgency);

  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor} ${className}`}
      title={config.label}
    >
      <Cross className={`w-3 h-3 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color}`}>
        {urgency}
      </span>
    </div>
  );
}