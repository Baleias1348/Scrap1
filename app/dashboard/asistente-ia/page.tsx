"use client";

import React, { useState } from "react";
import ChatWindow from "../../components/ChatWindow";

export default function AsistenteIAPage() {
  const [showChat, setShowChat] = useState(true);

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
            <ChatWindow />
          </div>
        </div>
      )}
    </main>
  );
}
