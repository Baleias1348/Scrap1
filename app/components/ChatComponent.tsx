"use client";
import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import ExportButtons from "./ExportButtons";
import RatingBox from "./RatingBox";
import DocumentoEditable from "./DocumentoEditable";
import markdownToHtml from "../utils/markdownToHtml";

const MarkdownRenderer = dynamic(() => import("./MarkdownRenderer"), { ssr: false });

interface Message {
  author: "user" | "ai";
  text: string;
  type?: "documento_editable" | "bienvenida";
  sources?: string[];
  details?: string;
}

function cleanMarkdown(text: string): string {
  // Elimina frases innecesarias
  text = text.replace(/\(Nota:.*?formato.*?\)/gi, '');
  text = text.replace(/puedes copiar la tabla a continuación utilizando el botón.*?\./gi, '');
  // Asegura saltos de línea dobles después de tablas y listas
  text = text.replace(/\|\n/g, '|\n');
  text = text.replace(/([*\-]) /g, '\n$1 ');
  // Asegura que los títulos estén en líneas separadas
  text = text.replace(/(\*\*.*?\*\*)/g, '\n$1\n');
  // Limpia espacios extra
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

// Demo: modelo de reglamento
const demoModeloReglamento = {
  nombre: "Reglamento Interno de Higiene y Seguridad - Construcción",
  descripcion: "Modelo adaptado a Ley 16.744, DS 40, DS 594, Código del Trabajo y normativas chilenas para empresas constructoras.",
  categoria: "Reglamentos",
  campos_editables: [
    { nombre: "NOMBRE_EMPRESA", tipo: "string", label: "Nombre de la Empresa" },
    { nombre: "RUT_EMPRESA", tipo: "string", label: "RUT de la Empresa" },
    { nombre: "DIRECCION_EMPRESA", tipo: "string", label: "Dirección Legal de la Empresa" },
    { nombre: "FECHA_VIGENCIA", tipo: "date", label: "Fecha de entrada en vigencia" },
    { nombre: "NOMBRE_GERENTE", tipo: "string", label: "Nombre Gerente General" },
    { nombre: "RUT_GERENTE", tipo: "string", label: "RUT Gerente General" },
    { nombre: "NOMBRE_JPREV", tipo: "string", label: "Nombre Jefe Prevención" },
    { nombre: "RUT_JPREV", tipo: "string", label: "RUT Jefe Prevención" }
  ],
  contenido_base: `🏗️ REGLAMENTO INTERNO DE HIGIENE Y SEGURIDAD\nEMPRESA CONSTRUCTORA [NOMBRE_EMPRESA]\n\nRUT: [RUT_EMPRESA]\nDirección: [DIRECCION_EMPRESA]\nAprobado por Gerencia General\nFecha de entrada en vigencia: [FECHA_VIGENCIA]\n... (contenido abreviado para demo)`
};

export default function ChatComponent() {
  const [exportHtmls, setExportHtmls] = useState<{[key:number]: string}>({});
  // Estado de mensajes
  const [messages, setMessages] = useState<Message[]>([]);
  // Estado para mostrar la bienvenida visual
  const [showBienvenida, setShowBienvenida] = useState(true);

  // Eliminar la bienvenida del flujo de mensajes, solo mostrar como texto inicial
  useEffect(() => {
    if (messages.length > 0) setShowBienvenida(false);
  }, [messages]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Convertir markdown a HTML para cada respuesta AI
  useEffect(() => {
    async function convertAll() {
      const newExportHtmls: {[key:number]: string} = {};
      await Promise.all(
        messages.map(async (msg, idx) => {
          if (msg.author === "ai") {
            newExportHtmls[idx] = await markdownToHtml(cleanMarkdown(msg.text));
          }
        })
      );
      setExportHtmls(newExportHtmls);
    }
    convertAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { author: "user", text: input };
    setMessages((prev) => {
      // Si el primer mensaje es la bienvenida y es el único, la reemplazamos
      if (prev.length === 1 && prev[0].type === "bienvenida") {
        return [userMessage];
      }
      return [...prev, userMessage];
    });
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      if (input.toLowerCase().includes("reglamento")) {
        setMessages(prev => [
          ...prev,
          { author: "ai", text: "", type: "documento_editable" }
        ]);
        setInput("");
        return;
      }
      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          { author: "ai", text: data.answer, sources: data.sources || [] },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { author: "ai", text: data.error || "Error inesperado.", sources: [], details: data.details },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { author: "ai", text: "Error de conexión con el backend.", sources: [] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ fontFamily: 'Inter, sans-serif', background: 'transparent' }}>
      <div id="chat-area" className="relative z-10 flex-1 overflow-y-auto pb-40 sm:pt-16 sm:pr-6 sm:pb-4 sm:pl-6 pt-[4.5rem] px-2 pb-16">
        {showBienvenida && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center mt-20">
            <div className="text-2xl font-semibold text-indigo-800 dark:text-indigo-200 mb-4">
              Hola soy la agente Ai de Preventi Flow, estoy aquí para ayudarte.
            </div>
            <div className="text-lg text-gray-700 dark:text-gray-200">
              ¿Hay algo en específico en lo que pueda ayudarte hoy? Por ejemplo, ¿necesitas un modelo de procedimiento, un protocolo de seguridad, o quizás información sobre alguna normativa general?
            </div>
          </div>
        )}
        {messages.map((msg, idx) => {
  // No renderizar la bienvenida si no es el primer mensaje
  if (msg.type === "bienvenida" && idx !== 0) return null;
  // No renderizar la bienvenida si ya hay mensajes del usuario
  if (msg.type === "bienvenida" && messages.find((m, i) => i < idx && m.author === "user")) return null;
  // Filtrar mensaje AI si el texto es exactamente igual a la bienvenida
  const bienvenidaText = "Hola soy la agente Ai de Preventi Flow, estoy aquí para ayudarte.\n\n¿Hay algo en específico en lo que pueda ayudarte hoy? Por ejemplo, ¿necesitas un modelo de procedimiento, un protocolo de seguridad, o quizás información sobre alguna normativa general?";
  if (msg.author === "ai" && msg.text.trim() === bienvenidaText.trim()) return null;
  // Filtrar mensajes AI que sean solo un saludo
  const saludosSimples = [
    "¡Hola! ¿En qué tema específico de prevención o gestión documental te puedo ayudar hoy?",
    "Hola! ¿En qué tema específico de prevención o gestión documental te puedo ayudar hoy?",
    "Hola, ¿en qué puedo ayudarte?",
    "¡Hola! ¿En qué puedo ayudarte?"
  ];
  if (msg.author === "ai" && saludosSimples.includes(msg.text.trim())) return null;
  return (
    <div
      key={idx}
      className={`flex ${msg.author === "user" ? "justify-end" : "justify-start"}`}
    >
      {msg.author === "ai" && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-950 via-fuchsia-950/30 to-transparent flex items-center justify-center mr-4 flex-shrink-0 shadow-lg shadow-indigo-900/20">
          <i data-lucide="bot" className="w-6 h-6 text-indigo-400"></i>
        </div>
      )}
      <div
        className={`rounded-lg max-w-3xl min-w-[120px] p-6 border shadow-none backdrop-blur text-[17px] leading-relaxed font-normal
          ${msg.author === "user"
            ? "bg-[#181b25]/85 text-gray-100 border-[#26273a] ml-auto"
            : "bg-[#23253a]/75 text-gray-100 border-[#272b38]"}
        `}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {msg.type === "documento_editable" ? (
          <DocumentoEditable
            contenidoBase={demoModeloReglamento.contenido_base}
            campos={demoModeloReglamento.campos_editables}
            onCompletar={(valores) => {
              setMessages(prev => [
                ...prev,
                { author: "ai", text: "Documento guardado correctamente. ¿Deseas descargarlo, enviarlo por correo o enviarlo a la bandeja 'Por Firmar'?" }
              ]);
            }}
          />
        ) : (
          <div className="relative group">
            <MarkdownRenderer content={cleanMarkdown(msg.text)} />
            {/* Solo mostrar botones de exportar en respuestas AI que sean documentos o descargables, nunca en preguntas del usuario */}
            {/* Solo mostrar botones de exportar si la respuesta AI es un documento, contiene tabla, lista estructurada o es extensa */}
            {/* Nunca mostrar botones de exportar en la bienvenida */}
            {msg.author === "ai" && msg.type !== "bienvenida" && (
              msg.type === "documento_editable" ||
              /modelo|protocolo|plantilla|documento|descargar en (word|pdf)/i.test(msg.text) ||
              /\|/.test(msg.text) || // contiene tabla
              /\n\s*[-*]\s/.test(msg.text) || // contiene lista con - o *
              /\n\s*\d+\./.test(msg.text) || // contiene lista numerada
              msg.text.length > 350 // texto largo tipo documento
            ) && (
              <ExportButtons
                html={`<html><head><meta charset='utf-8'/></head><body style='font-family:sans-serif'>${exportHtmls[idx] || ''}</body></html>`}
                filename={msg.text.slice(0,30).replace(/[^a-zA-Z0-9]/g, "_") || "documento"}
              />
            )}
            {msg.author === "ai" && msg.type !== "bienvenida" && (
              <React.Suspense fallback={null}>
                <RatingBox
                  messageIdx={idx}
                  onRated={async (rating: number) => {
                    await fetch('/api/rate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ messageIdx: idx, rating })
                    });
                  }}
                />
              </React.Suspense>
            )}
          </div>
        )}
      </div>
      {msg.author === "user" && (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center ml-4 flex-shrink-0 font-semibold bg-gradient-to-br from-[#23253a] via-indigo-900 to-fuchsia-900 text-indigo-300 border border-fuchsia-900/40 shadow-md">
          PF
        </div>
      )}
      {msg.author === "ai" && msg.sources && msg.sources.length > 0 && (
        <div className="mt-1 ml-2 text-xs text-gray-600 bg-gray-100 rounded p-2">
          <span className="font-semibold">Fuentes consultadas:</span>
          <ul className="list-disc list-inside">
            {msg.sources.map((src, i) => (
              <li key={i}>{src}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
})}
        {isLoading && (
  <div className="flex items-center justify-center w-full py-8">
    <div className="flex items-center gap-3 bg-gradient-to-br from-indigo-900/80 to-fuchsia-900/70 px-6 py-4 rounded-xl shadow-lg border border-indigo-900/30 animate-pulse">
      <svg className="animate-spin h-6 w-6 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <span className="text-lg font-semibold text-indigo-100 tracking-wide">Elaborando respuesta experta…</span>
    </div>
  </div>
)}
        <div ref={chatEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 sm:sticky sm:z-20 sm:bg-[#101014] sm:bg-opacity-95 sm:border-t sm:border-[rgba(255,255,255,0.1)] px-2 sm:px-6 py-2 bg-[#181824] border-t border-[rgba(255,255,255,0.1)]" style={{boxSizing:'border-box'}}>
        <form id="chat-form" className="bg-[#1E1E26] border border-[rgba(255,255,255,0.1)] rounded-lg p-2 transition-shadow duration-150 shadow-md hover:shadow-lg" onSubmit={e => {e.preventDefault();handleSend();}}>
          <textarea
            id="chat-input"
            className="w-full bg-transparent outline-none resize-none text-gray-300 placeholder-gray-500 transition-all duration-150 focus:bg-[#181824] focus:ring-2 focus:ring-[#5E6AD2]/40 rounded-md"
            placeholder="Escribe tu mensaje..."
            rows={2}
            style={{minHeight:'36px',maxHeight:'64px',marginBottom:0}}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onInput={e=>{/* habilitar/deshabilitar botón en tiempo real */}}
            disabled={isLoading}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();}}}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="flex space-x-2">
              <button type="button" className="p-2 rounded hover:bg-[#232337] transition-all duration-150" title="Adjuntar archivo" tabIndex={-1}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              </button>
              <button type="button" className="p-2 rounded hover:bg-[#232337] transition-all duration-150" title="Imágenes" tabIndex={-1}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </button>
              <button type="button" className="p-2 rounded hover:bg-[#232337] transition-all duration-150" title="Audio" tabIndex={-1}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </button>
            </div>
            <button type="submit" id="send-btn" className="bg-[#5E6AD2] hover:bg-[#7b85e2] transition-all duration-150 text-white py-2 px-4 rounded-md flex items-center shadow-sm hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/70" disabled={isLoading||!input.trim()}>
              <span>Enviar</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
