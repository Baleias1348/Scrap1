import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { buildPrompt } from '../../../../src/lib/ai/promptBuilder';
import { selectModel } from '../../../../src/lib/ai/modelRouter';
import { fetchModelConfig, getModelForUseCase, normalizeModelName } from '../../../../src/lib/ai/modelConfig';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

async function obtenerConstitucionAgente(supabase: any, nombreAgente: string): Promise<{ constitucion: string, metadata?: any }>{
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
  const prev = await getPersistedSummary(supabase, sessionId);
  const summary = compactAppend(prev || '', newText, 4000);
  const { error } = await supabase
    .from('session_summaries')
    .upsert({ session_id: sessionId, summary }, { onConflict: 'session_id' });
  if (error) throw error;
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return new Response(JSON.stringify({ error: 'Faltan credenciales de Supabase (SUPABASE_URL/SUPABASE_KEY)' }), { status: 500 });
    }
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Falta OPENAI_API_KEY en el entorno' }), { status: 500 });
    }
    const { question, sessionId, useCase } = await req.json();
    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'Debe enviar una pregunta válida' }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { constitucion, metadata } = await obtenerConstitucionAgente(supabase, 'A.R.I.A.');

    const rolling = sessionId ? await getPersistedSummary(supabase, sessionId) : null;
    const context = rolling ? `Resumen previo:\n${rolling}` : '';

    const contextChars = (context || '').length;
    const config = await fetchModelConfig(supabase, 'aria');
    const uc = (useCase as string) || 'chat';
    const fallback = selectModel(question, contextChars).model;
    let { model } = getModelForUseCase(config, uc, fallback);
    model = normalizeModelName(model);
    const maxTokens = uc === 'chat' || uc === 'fast_interactions' ? 1024 : 2048;

    const prompt = buildPrompt({ question, constitution: constitucion, metadata, context });

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'Eres el asistente A.R.I.A. Responde en español, de forma profesional y precisa, usando formato Markdown (títulos, listas, tablas si corresponde).' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
      stream: false,
    });

    const text = completion.choices?.[0]?.message?.content || '';

    if (sessionId && text) {
      await upsertPersistedSummary(supabase, sessionId, `Q: ${question}\nA: ${text.slice(0, 1200)}`);
    }

    return new Response(JSON.stringify({ model, text }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Error inesperado' }), { status: 500 });
  }
}
