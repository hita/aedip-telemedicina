interface UnreadMessagesBadgeProps {
  case_: {
    mensajesNoLeidos?: Record<string, number>;
  };
  userEmail: string;
}

export function UnreadMessagesBadge({ case_, userEmail }: UnreadMessagesBadgeProps) {
  const unreadCount = case_.mensajesNoLeidos?.[userEmail] || 0;
  
  if (unreadCount === 0) return null;
  
  return (
    <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
      {unreadCount > 9 ? "9+" : unreadCount}
    </div>
  );
}