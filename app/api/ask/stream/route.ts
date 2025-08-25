import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { buildPrompt } from '../../../../src/lib/ai/promptBuilder';
import { selectModel } from '../../../../src/lib/ai/modelRouter';
import { fetchModelConfig, getModelForUseCase, normalizeModelName } from '../../../../src/lib/ai/modelConfig';
// Persisted summaries will be stored in Supabase (table: public.session_summaries)

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

async function obtenerConstitucionAgente(supabase: any, nombreAgente: string): Promise<{ constitucion: string; metadata?: any }>{
  const { data, error } = await supabase
    .from('constituciones_agente')
    .select('constitucion, metadata')
    .eq('nombre_agente', nombreAgente)
    .order('fecha_actualizacion', { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) {
    throw new Error('No se encontró la constitución del agente en la base de datos.');
  }
  return { constitucion: data[0].constitucion, metadata: (data[0] as any).metadata };
}

async function getPersistedSummary(supabase: any, sessionId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('session_summaries')
    .select('summary')
    .eq('session_id', sessionId)
    .limit(1);
  if (error) return null;
  if (!data || data.length === 0) return null;
  return (data[0] as any).summary as string;
}

function compactAppend(prev: string, addition: string, maxChars = 4000): string {
  const merged = (prev ? prev + '\n' : '') + addition;
  if (merged.length <= maxChars) return merged;
  return merged.slice(merged.length - maxChars);
}

async function upsertPersistedSummary(supabase: any, sessionId: string, newText: string) {
  // Read existing
  const prev = await getPersistedSummary(supabase, sessionId);
  const summary = compactAppend(prev || '', newText, 4000);
  // Upsert
  const { error } = await supabase
    .from('session_summaries')
    .upsert({ session_id: sessionId, summary }, { onConflict: 'session_id' });
  if (error) throw error;
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  try {
    // Guardas de variables de entorno para evitar 500 silenciosos
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return new Response('event: error\ndata: {"error":"Faltan credenciales de Supabase (SUPABASE_URL/SUPABASE_KEY)"}\n\n', {
        status: 500,
        headers: { 'Content-Type': 'text/event-stream' }
      });
    }
    if (!OPENAI_API_KEY) {
      return new Response('event: error\ndata: {"error":"Falta OPENAI_API_KEY en el entorno"}\n\n', {
        status: 500,
        headers: { 'Content-Type': 'text/event-stream' }
      });
    }
    const { question, sessionId, useCase } = await req.json();
    if (!question || typeof question !== 'string') {
      return new Response('event: error\ndata: {"error":"Debe enviar una pregunta válida"}\n\n', {
        status: 400,
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { constitucion, metadata } = await obtenerConstitucionAgente(supabase, 'A.R.I.A.');

    // Lightweight context: include last rolling summary
    const rolling = sessionId ? await getPersistedSummary(supabase, sessionId) : null;
    const context = rolling ? `Resumen previo:\n${rolling}` : '';

    // Model routing by use-case with fallback to heuristic
    const contextChars = (context || '').length;
    const config = await fetchModelConfig(supabase, 'aria');
    const uc = (useCase as string) || 'chat';
    let model = getModelForUseCase(config, uc, selectModel(question, contextChars).model).model;
    model = normalizeModelName(model);
    // Default max tokens depending on type
    const isFast = uc === 'chat' || uc === 'fast_interactions';
    const maxTokens = isFast ? 1024 : 2048;

    const prompt = buildPrompt({
      question,
      constitution: constitucion,
      metadata,
      context,
    });

    // SSE stream
    const stream = new ReadableStream<Uint8Array>({
      start: async (controller) => {
        function send(data: any, event?: string) {
          const e = event ? `event: ${event}\n` : '';
          controller.enqueue(encoder.encode(`${e}data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`));
        }
        // Warmup event
        send({ status: 'started', model });

        try {
          const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
          let finalText = '';
          const completion = await openai.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: 'Eres el asistente A.R.I.A. Responde en español, de forma profesional y precisa, usando formato Markdown (títulos, listas, tablas si corresponde).' },
              { role: 'user', content: prompt },
            ],
            stream: true,
            max_tokens: maxTokens,
            temperature: 0.2,
          });

          for await (const chunk of completion) {
            const part = (chunk as any).choices?.[0]?.delta?.content || '';
            if (part) {
              finalText += part;
              // Send as JSON to avoid breaking SSE framing with raw newlines
              send({ chunk: part }, 'chunk');
            }
          }

          // Update session summary with compact slice of finalText
          if (sessionId && finalText) {
            await upsertPersistedSummary(supabase, sessionId, `Q: ${question}\nA: ${finalText.slice(0, 1200)}`);
          }

          send({ done: true }, 'done');
          controller.close();
        } catch (err: any) {
          send({ error: err?.message || 'Error generando respuesta' }, 'error');
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (e: any) {
    return new Response(`event: error\ndata: {"error":"${e?.message || 'Error inesperado'}"}\n\n`, {
      status: 500,
      headers: { 'Content-Type': 'text/event-stream' }
    });
  }
}
