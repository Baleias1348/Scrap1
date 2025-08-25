"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LegalResponse {
  answer: string;
  context: string[];
}

export function useLegalQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askARIA = async (query: string): Promise<LegalResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      // 1) Recuperar contexto de Supabase (RAG)
      const { data: chunks, error: supaError } = await supabase.rpc(
        "match_legal_docs",
        {
          query_text: query,
          match_count: 5,
        }
      );

      if (supaError) throw supaError;

      const context = chunks?.map((c: any) => c.content) || [];

      // 2) Construir prompt con contexto
      const systemPrompt = `
Eres ARIA, una agente de apoyo legal y normativo.

Reglas:
1. Siempre prioriza la base de conocimiento en Supabase.
2. Si encuentras información relevante en context, responde SOLO con eso, citando la fuente.
3. Si context está vacío, dilo explícitamente y luego puedes complementar con conocimiento general, pero diferenciado.
4. Nunca contradigas las fuentes de Supabase. Si un decreto aparece vigente/derogado en Supabase, mantén ese estado siempre.
Responde en español y en formato Markdown.`;

      const userPrompt = {
        context,
        query,
      };

      // 3) Llamar al modelo ARIA
      const rawResponse = await fetch("/api/aria-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          user: userPrompt,
        }),
      });

      const result = await rawResponse.json();

      // 4) Validación de consistencia
      const validationResponse = await fetch("/api/aria-validator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          answer: result.answer,
        }),
      });

      const validated = await validationResponse.json();

      return {
        answer: validated.correctedAnswer || result.answer,
        context,
      };
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { askARIA, loading, error };
}
