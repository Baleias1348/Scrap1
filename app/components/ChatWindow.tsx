"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface Message {
  id: number;
  sender: "assistant" | "user";
  text: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "assistant",
      text: "Hola, Olivia. Estoy listo para ayudarte. ¿Qué necesitas hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: input.trim(),
    };
    setMessages([...messages, newMessage]);
    setInput("");

    // Simulación de respuesta del asistente (remplazar por API)
    setTimeout(() => {
      setMessages((prev: Message[]) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "assistant",
          text: "Procesando tu consulta... 🚀",
        },
      ]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-expand textarea hasta 4 líneas
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 4 * 24) + "px";
    }
  }, [input]);

  return (
    <div className="flex flex-col h-full w-full bg-black/40 backdrop-blur-lg rounded-2xl shadow-lg p-4">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* Avatar */}
            {msg.sender === "assistant" ? (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/70 border border-black/20 shadow-md text-[#ff6a00]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                  <path d="M20 2v4"></path>
                  <path d="M22 4h-4"></path>
                  <circle cx="4" cy="20" r="2"></circle>
                </svg>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#ff6a00] to-[#ff8c00] border border-orange-300 shadow-md">
                <span className="text-white font-bold">U</span>
              </div>
            )}
            {/* Burbujas */}
            <div
              className={`px-4 py-2 rounded-2xl text-base leading-relaxed shadow max-w-[70%] ${
                msg.sender === "assistant"
                  ? "bg-black/40 text-white"
                  : "bg-gradient-to-r from-[#ff6a00] to-[#ff8c00] text-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex items-end gap-2">
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none rounded-xl p-3 text-gray-900 text-base leading-relaxed border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu consulta..."
          style={{ maxHeight: 4 * 24 }}
        />
        <button
          onClick={handleSend}
          className="p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
