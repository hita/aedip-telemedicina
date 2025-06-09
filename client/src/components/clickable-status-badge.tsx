import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusChangeModal } from "./status-change-modal";
import { Case, STATUS_COLORS, STATUS_TRANSITIONS } from "@/lib/types";

interface ClickableStatusBadgeProps {
  case_: Case;
  userRole: string;
}

export function ClickableStatusBadge({ case_, userRole }: ClickableStatusBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const availableTransitions = STATUS_TRANSITIONS[userRole as keyof typeof STATUS_TRANSITIONS][case_.status as keyof typeof STATUS_TRANSITIONS.medico] || [];
  const isClickable = availableTransitions.length > 0;

  const handleClick = () => {
    if (isClickable) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div 
        className={`inline-flex items-center gap-1 ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
        onClick={handleClick}
      >
        <Badge className={STATUS_COLORS[case_.status as keyof typeof STATUS_COLORS]}>
          {case_.status}
        </Badge>
        {isClickable && (
          <ChevronDown className="w-3 h-3 text-gray-500" />
        )}
      </div>
      
      {case_.reabierto && (
        <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
          Reabierto
        </Badge>
      )}

      <StatusChangeModal
        case_={case_}
        userRole={userRole}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}