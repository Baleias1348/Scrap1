"use client";

import React, { useState } from "react";
import ChatWindow from "../../components/ChatWindow";

type Message = {
  id: string;
  sender: "user" | "assistant" | "loading";
  name: string;
  avatarUrl: string;
  content: string;
};

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "assistant",
    name: "Asistente Preventi Flow",
    avatarUrl: "/assistant-avatar.png",
    content: "Hola, Olivia. Estoy listo para ayudar. Puedo analizar informes, generar resúmenes de seguridad o encontrar datos de inspección. ¿Qué necesitas hoy?",
  },
  {
    id: "2",
    sender: "user",
    name: "Olivia Martin",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    content: "Genera un resumen de los incidentes de seguridad reportados en la 'Empresa 2' en el último trimestre.",
  },
  {
    id: "3",
    sender: "assistant",
    name: "Asistente Preventi Flow",
    avatarUrl: "/assistant-avatar.png",
    content: "Claro. Analizando los datos de la 'Empresa 2' para el último trimestre... Un momento.",
  },
];

export default function AsistenteIAPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages([
      ...messages,
      {
        id: (messages.length + 1).toString(),
        sender: "user",
        name: "Olivia Martin",
        avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        content: inputValue,
      },
      {
        id: (messages.length + 2).toString(),
        sender: "assistant",
        name: "Asistente Preventi Flow",
        avatarUrl: "/assistant-avatar.png",
        content: "(Simulación) Estoy procesando tu consulta...",
      },
    ]);
    setInputValue("");
  };

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-transparent p-8">
      <h1 className="text-3xl font-bold text-white font-orbitron mb-1">Asistente IA</h1>
      <p className="text-white/70 mb-8">Haz una pregunta para comenzar.</p>
      {/* Botón flotante para abrir el chat si está cerrado */}
      {!showChat && (
        <button
          className="fixed bottom-6 right-6 z-[998] bg-[#ff6a00] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-[#ff8a3b] focus:outline-none"
          onClick={() => setShowChat(true)}
          title="Abrir chat"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="12" cy="12" r="4"/></svg>
        </button>
      )}
      {/* Overlay de chat flotante */}
      {showChat && (
        <div className="fixed bottom-6 right-6 z-[999] max-w-md w-full">
          <div className="relative">
            <button
              className="absolute -top-3 -right-3 bg-[#ff6a00] text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white/70 z-10"
              onClick={() => setShowChat(false)}
              title="Cerrar chat"
            >
              ×
            </button>
            <ChatWindow
              messages={messages}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={handleSend}
              loading={loading}
            />
          </div>
        </div>
      )}
    </main>
  );
}
