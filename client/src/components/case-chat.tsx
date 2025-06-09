import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Message, CreateMessageData } from "@/lib/types";

interface CaseChatProps {
  caseId: number;
  userRole: string;
  userName: string;
}

export function CaseChat({ caseId, userRole, userName }: CaseChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch messages with polling for real-time updates
  const { data: messages = [], isLoading, refetch } = useQuery<Message[]>({
    queryKey: [`/api/cases/${caseId}/messages`],
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: CreateMessageData) => {
      const response = await apiRequest("POST", `/api/cases/${caseId}/messages`, data);
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}/messages`] });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] }); // Update case list for unread counts
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje se ha enviado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      contenido: newMessage.trim()
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  };

  const getRoleDisplayName = (rol: string) => {
    return rol === "medico" ? "Médico" : "Experto";
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-medical-blue" />
          <h3 className="text-lg font-semibold">Conversación</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-6 h-6 border-2 border-medical-blue border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Chat Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <MessageCircle className="w-5 h-5 text-medical-blue" />
        <h3 className="text-lg font-semibold">Conversación</h3>
        {messages.length > 0 && (
          <span className="text-sm text-secondary ml-auto">
            {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Messages Area */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-secondary py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No hay mensajes aún</p>
            <p className="text-sm">Inicia la conversación enviando un mensaje</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.autorNombre === userName ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.autorNombre === userName
                    ? "bg-medical-blue text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {message.autorNombre} ({getRoleDisplayName(message.autorRol)})
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.contenido}
                </p>
                <div className="text-xs opacity-75 mt-2">
                  {formatMessageDate(message.fechaEnvio)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-medical-blue hover:bg-blue-700 text-white px-4"
          >
            {sendMessageMutation.isPending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-secondary mt-2">
          Presiona Enter para enviar, Shift + Enter para nueva línea
        </p>
      </div>
    </div>
  );
}