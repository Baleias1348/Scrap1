"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { useModelRouter } from "../../src/lib/ai/useModelRouter";
import { useAuth } from "../context/AuthContext";

interface Message {
  id: number;
  sender: "assistant" | "user";
  text: string;
}

export default function ChatWindow() {
  const { user, org } = useAuth();
  const [chatContext, setChatContext] = useState<"chat" | "fast_interactions" | "compliance" | "documents">("chat");
  const { model, mode, isLoading: modelLoading, error: modelError } = useModelRouter(chatContext);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "assistant",
      text: "Hola, estoy listo para ayudarte. ¿Qué necesitas hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);

  // Normalize Markdown for display (do not mutate stored text)
  const normalizeMarkdown = (text: string) => {
    if (!text) return text;
    let t = text;
    // Ensure headings start at line-begin
    t = t.replace(/([^\n])\s*(#{1,6}\s)/g, "$1\n\n$2");
    // Ensure list markers start on new line
    t = t.replace(/([^\n])\s*(-\s)/g, "$1\n$2");
    t = t.replace(/([^\n])\s*(\d+\.\s)/g, "$1\n$2");
    return t;
  };

  const resetToInitial = () => {
    setMessages([
      {
        id: 1,
        sender: "assistant",
        text: "Hola, estoy listo para ayudarte. ¿Qué necesitas hoy?",
      },
    ]);
  };

  const handleReset = async () => {
    try {
      abortRef.current?.abort();
      setLoading(false);
      await fetch("/api/chat/reset-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "dashboard" }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      resetToInitial();
    }
  };

  // Auto scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: input.trim(),
    };
    setMessages((prev) => [...prev, newMessage, { id: newMessage.id + 1, sender: "assistant", text: "" }]);
    setInput("");

    // Endpoint switch: streaming vs standard
    try {
      setLoading(true);
      if ((mode || "streaming") === "streaming") {
        // Streaming SSE desde /api/ask/stream
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const res = await fetch("/api/ask/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: newMessage.text, sessionId: "dashboard", useCase: chatContext }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error("No stream body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const appendToAssistant = (chunk: string) => {
          setMessages((prev) => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            copy[lastIdx] = { ...copy[lastIdx], text: copy[lastIdx].text + chunk };
            return copy;
          });
        };
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";
          for (const part of parts) {
            if (part.startsWith("event: chunk")) {
              const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
              if (!dataLine) continue;
              let payload = dataLine.slice(5); // after 'data:'
              if (payload.startsWith(' ')) payload = payload.slice(1);
              let chunkStr = payload;
              // Support JSON payloads: { chunk: "..." }
              if (payload.startsWith('{')) {
                try {
                  const obj = JSON.parse(payload);
                  if (typeof obj?.chunk === 'string') chunkStr = obj.chunk;
                } catch {}
              }
              appendToAssistant(chunkStr);
            }
            else if (part.startsWith("event: error")) {
              const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
              if (!dataLine) continue;
              let payload = dataLine.slice(5);
              if (payload.startsWith(' ')) payload = payload.slice(1);
              let errText = 'Error desconocido';
              try {
                const obj = JSON.parse(payload);
                errText = obj?.error || errText;
              } catch {
                errText = payload;
              }
              appendToAssistant(`\n\n[Error] ${errText}`);
            }
          }
        }
      } else {
        // Non-streaming
        const res = await fetch("/api/ask/standard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: newMessage.text, sessionId: "dashboard", useCase: chatContext }),
        });
        if (!res.ok) {
          const text = await res.text();
          setMessages((prev) => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            copy[lastIdx] = { ...copy[lastIdx], text: `Error: ${text || res.status}` };
            return copy;
          });
          return;
        }
        const data = await res.json();
        const text = data?.text || "";
        setMessages((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          copy[lastIdx] = { ...copy[lastIdx], text };
          return copy;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
              (
                (user?.user_metadata as any)?.avatar_url || (user as any)?.picture ? (
                  <img
                    src={(user?.user_metadata as any)?.avatar_url || (user as any)?.picture}
                    alt="Tu avatar"
                    className="w-10 h-10 rounded-full border border-orange-300 shadow-md object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#ff6a00] to-[#ff8c00] border border-orange-300 shadow-md">
                    <span className="text-white font-bold">
                      {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )
              )
            )}
            {/* Burbujas */}
            <div
              className={`group relative px-4 py-2 rounded-2xl text-base leading-relaxed shadow max-w-[70%] whitespace-pre-wrap break-words ${
                msg.sender === "assistant"
                  ? "bg-black/40 text-white"
                  : "bg-gradient-to-r from-[#ff6a00] to-[#ff8c00] text-white"
              }`}
            >
              {msg.sender === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                      pre: (p: any) => (
                        <pre className="max-h-[50vh] overflow-auto rounded-md" {...p} />
                      ),
                      code: (p: any) => {
                        const { inline, className, children, ...rest } = p || {};
                        return (
                          <code className={`${className || ''} ${inline ? '' : 'block'} break-words`} {...rest}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {normalizeMarkdown(msg.text)}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
              {msg.sender === "assistant" && (
                <button
                  title="Copiar respuesta"
                  onClick={() => navigator.clipboard.writeText(msg.text)}
                  className="hidden group-hover:flex absolute -top-3 -right-3 items-center gap-1 px-2 py-1 rounded-md text-xs bg-white/80 text-gray-800 border border-gray-300 hover:bg-white"
                >
                  <Copy className="w-3 h-3" /> Copiar
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex items-end gap-2">
        <select
          className="px-2 py-2 rounded-xl border border-gray-300 bg-white text-gray-800"
          value={chatContext}
          onChange={(e) => setChatContext(e.target.value as any)}
        >
          <option value="chat">Chat</option>
          <option value="fast_interactions">Interacciones rápidas</option>
          <option value="compliance">Compliance</option>
          <option value="documents">Documentos</option>
        </select>
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none rounded-xl p-3 text-gray-900 placeholder-gray-600 text-base leading-relaxed border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-[#FFF1E6]"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu consulta..."
          style={{ maxHeight: 4 * 24, backgroundColor: '#FFF1E6' }}
        />
        <button
          onClick={handleSend}
          className="p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition"
        >
          <Send className="w-5 h-5" />
        </button>
        {loading && (
          <button
            onClick={() => { abortRef.current?.abort(); setLoading(false); }}
            className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700"
        >
          Reset contexto
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-300">
        {modelLoading ? "Cargando configuración de modelo..." : (
          modelError ? `Modo: streaming (fallback) — error: ${modelError}` : `Contexto: ${chatContext} — Modelo: ${model} — Modo: ${mode || 'streaming'}`
        )}
      </div>
    </div>
  );
}
