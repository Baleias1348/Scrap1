"use client";
import React, { useRef, useEffect, useState } from "react";

interface Message {
  text: string;
  sender: "user" | "ai";
}

export default function ChatWidget({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, visible]);

  if (!visible) return null;

  return (
    <div id="chat-widget-preventi" style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 216,
      maxWidth: "95vw",
      height: 288,
      background: "transparent",
      borderRadius: "18px 18px 12px 12px",
      boxShadow: "none",
      fontFamily: "'Inter', 'Montserrat', Arial, sans-serif",
      fontSize: 15,
      color: "#f3f3f3",
      display: "flex",
      flexDirection: "column",
      overflow: "visible",
      zIndex: 99999,
      border: "none",
      transition: "box-shadow 0.2s",
      animation: "fadein 0.7s cubic-bezier(.4,1.3,.6,1)",
    }}>
      <div id="chat-header-preventi" style={{
        background: "linear-gradient(90deg, #23243a 60%, #1a1b23 100%)",
        color: "#fff",
        fontWeight: 600,
        fontSize: 12,
        borderRadius: "18px 18px 0 0",
        padding: "10px 14px",
        letterSpacing: "0.01em",
        textAlign: "left",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        Preventi AI
        <button onClick={onClose} aria-label="Cerrar chat" style={{background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer"}}>&times;</button>
      </div>
      <div id="chat-messages-preventi" style={{
        flex: 1,
        padding: "22px 18px 12px 18px",
        background: "rgba(24,24,36,0.94)",
        borderRadius: "0 0 0 0",
        overflowY: "auto",
        fontSize: 15
      }}>
        {messages.map((msg, i) => (
          <div key={i} className={msg.sender === "user" ? "user-msg" : "ai-msg"} style={{
            background: msg.sender === "user"
              ? "linear-gradient(90deg,#5eead4 60%,#60a5fa 100%)"
              : "#23263a",
            color: msg.sender === "user" ? "#23263a" : "#fff",
            padding: "9px 16px",
            borderRadius: msg.sender === "user"
              ? "16px 16px 4px 16px"
              : "16px 16px 16px 4px",
            marginBottom: 10,
            maxWidth: "85%",
            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            boxShadow: msg.sender === "user"
              ? "0 2px 8px 0 rgba(30,40,100,0.08)"
              : "0 2px 12px 0 rgba(30,40,100,0.09)",
            wordBreak: "break-word"
          }}>{msg.text}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form id="chat-input-area-preventi" style={{
        padding: 18,
        background: "rgba(24,24,36,0.97)",
        borderRadius: "0 0 12px 12px",
        display: "flex",
        gap: 12,
        alignItems: "center"
      }} onSubmit={e => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([...messages, { text: input, sender: "user" }]);
        setInput("");
        // Aquí puedes integrar la llamada al backend/AI
      }}>
        <input
          id="chat-input-preventi"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            borderRadius: 8,
            padding: "10px 14px",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: 15
          }}
        />
        <button type="submit" style={{
          background: "linear-gradient(90deg,#5eead4 60%,#60a5fa 100%)",
          color: "#23263a",
          fontWeight: 600,
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          cursor: "pointer"
        }}>Enviar</button>
      </form>
      <style jsx global>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
