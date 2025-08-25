"use client";
import React, { useRef, useState } from "react";

export default function StreamChatDemo() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  async function onAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setAnswer("");
    setLoading(true);
    setModel(null);

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch("/api/ask/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sessionId: "demo" }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error("No stream body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      function handleEvent(event: string | null, data: string) {
        if (event === "chunk" || event === null) {
          setAnswer((prev) => prev + data);
        } else if (event === "done") {
          // finished
        } else if (event === "error") {
          console.error("SSE error:", data);
        } else if (event === "message") {
          // ignore
        }
      }

      // SSE parser (very simple)
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const packet = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const lines = packet.split("\n");
          let event: string | null = null;
          let data = "";
          for (const line of lines) {
            if (line.startsWith("event:")) {
              event = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              data += line.slice(5).trim();
            }
          }
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed?.status === "started" && parsed?.model) setModel(parsed.model);
              if (parsed?.done) {
                // no-op
              } else if (parsed?.error) {
                handleEvent("error", parsed.error);
              } else if (typeof parsed === "string") {
                handleEvent(event, parsed);
              } else {
                // ignore unknown objects
              }
            } catch {
              handleEvent(event, data);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function onCancel() {
    controllerRef.current?.abort();
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <form onSubmit={onAsk} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Escribe tu pregunta..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Consultando..." : "Preguntar"}
        </button>
        {loading && (
          <button type="button" className="px-3 py-2 border rounded" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </form>
      {model && (
        <div className="text-sm text-gray-500">Modelo seleccionado: {model}</div>
      )}
      <div className="border rounded p-3 min-h-[160px] whitespace-pre-wrap bg-white">
        {answer || (loading ? "Esperando respuesta..." : "")}
      </div>
    </div>
  );
}
