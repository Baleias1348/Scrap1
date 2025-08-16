"// Archivo eliminado para evitar conflicto con el nuevo dashboard";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

import ChatWindow from "./ChatWindow";

const initialMessages = [
  {
    id: "1",
    sender: "assistant" as const,
    name: "Asistente Preventi Flow",
    avatarUrl: "/assistant-avatar.png",
    content: "Hola, Olivia. Estoy listo para ayudar. Puedo analizar informes, generar resúmenes de seguridad o encontrar datos de inspección. ¿Qué necesitas hoy?",
  },
  {
    id: "2",
    sender: "user" as const,
    name: "Olivia Martin",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    content: "Genera un resumen de los incidentes de seguridad reportados en la 'Empresa 2' en el último trimestre.",
  },
  {
    id: "3",
    sender: "assistant" as const,
    name: "Asistente Preventi Flow",
    avatarUrl: "/assistant-avatar.png",
    content: "Claro. Analizando los datos de la 'Empresa 2' para el último trimestre... Un momento.",
  },
];

export default function StandaloneDashboardWithChat() {
  const pathname = usePathname();
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Si la ruta es /dashboard/asistente-ia, renderiza el dashboard con el chat
  if (pathname === "/dashboard/asistente-ia") {
    return (
      <div>
        {/* Aquí iba el dashboard de ejemplo, eliminado por limpieza */}
        <ChatWindow
          messages={messages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={() => {
            if (!inputValue.trim()) return;
            setMessages([
              ...messages,
              {
                id: (messages.length + 1).toString(),
                sender: "user" as const,
                name: "Olivia Martin",
                avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
                content: inputValue,
              },
              {
                id: (messages.length + 2).toString(),
                sender: "assistant" as const,
                name: "Asistente Preventi Flow",
                avatarUrl: "/assistant-avatar.png",
                content: "(Simulación) Estoy procesando tu consulta...",
              },
            ]);
            setInputValue("");
          }}
          loading={loading}
        />
      </div>
    );
  }
  // En cualquier otra ruta, dashboard clásico
  return <div />;
}
