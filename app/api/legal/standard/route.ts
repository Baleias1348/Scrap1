import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { fetchModelConfig, getModelForUseCase, normalizeModelName } from '../../../../src/lib/ai/modelConfig';

export const runtime = 'nodejs';

type Frag = { id?: string | number; content: string; source?: string; meta?: any };

type RetrievalResult = { fragments: Frag[] };

async function retrieveFromSupabase(supabase: any, query: string, n = 5): Promise<RetrievalResult> {
  // Best-effort retrieval: tries common corpora; falls back to empty if tables do not exist.
  // You can adapt to your actual schema (e.g., pgvector similarity search, RPC, etc.)
  const results: Frag[] = [];

  const tryTable = async (table: string, fields = 'id, content, source, meta') => {
    try {
      // naive fallback: ilike with first significant token
      const token = query.split(/\s+/).filter(Boolean)[0] || '';
      const { data } = await supabase
        .from(table)
        .select(fields)
        .ilike('content', `%${token}%`)
        .limit(n);
      if (data && Array.isArray(data)) {
        for (const row of data) {
          if (row?.content) results.push({ id: row.id, content: row.content, source: row.source, meta: row.meta });
        }
      }
    } catch {}
  };

  await tryTable('legal_corpus');
  if (results.length < n) await tryTable('documents');
  if (results.length < n) await tryTable('normas_textos');

  return { fragments: results.slice(0, n) };
}

function buildSystemPrompt() {
  return (
    'Eres ARIA, una agente de apoyo legal y normativo.\n' +
    'Reglas fundamentales:\n' +
    '1) Para toda consulta legal/normativa, consulta primero y exclusivamente la base legal en Supabase.\n' +
    '2) Si hay información relevante en el contexto, responde únicamente con esa información citando la fuente precisa (ej: "DS 40, Artículo 5").\n' +
    '3) Si no hay información en el contexto, declara: "No encontré referencia en la base legal interna." y, separado, puedes agregar conocimiento general como: "Según información general (fuera de Supabase)...".\n' +
    '4) Nunca contradigas las fuentes del contexto; mantén consistencia.\n' +
    '5) Respeta el estado vigente/derogado indicado en el contexto.\n' +
    'Responde en español y en formato Markdown.'
  );
}

function buildUserPayload(fragments: Frag[], query: string) {
  // JSON-structured payload as requested
  const context = fragments.map(f => f.source ? `${f.content}\n[FUENTE: ${f.source}]` : f.content);
  const payload = {
    context,
    query,
    instruction:
      "Responde únicamente con la información en 'context' si está relacionada con leyes, normas o decretos. Si 'context' está vacío, aplica la regla de transparencia y luego puedes complementar con conocimiento general fuera de Supabase, siempre separándolo explícitamente.",
  };
  return JSON.stringify(payload, null, 2);
}

async function verifyConsistency(openai: OpenAI, model: string, draft: string, fragments: Frag[]): Promise<string> {
  const contextJoined = fragments.map((f, i) => `# Frag ${i + 1}${f.source ? ` — ${f.source}` : ''}\n${f.content}`).join('\n\n');
  const verifierPrompt = [
    {
      role: 'system' as const,
      content:
        'Eres un verificador de coherencia. Verifica si la respuesta contradice o se desvía del CONTEXTO. Si contradice, reescribe la respuesta basándote SOLO en el CONTEXTO. Si no hay contradicción, devuelve exactamente la respuesta original.'
    },
    {
      role: 'user' as const,
      content:
        `CONTEXTO:\n${contextJoined || '(vacío)'}\n\nRESPUESTA_PROPUESTA:\n${draft}\n\nDEVUELVE: la versión validada (idéntica si no hay contradicción). Responde en español y Markdown.`
    }
  ];

  const completion = await openai.chat.completions.create({
    model,
    messages: verifierPrompt,
    temperature: 0.0,
  });
  return completion.choices?.[0]?.message?.content || draft;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') return Response.json({ error: 'query requerido' }, { status: 400 });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
      return Response.json({ error: 'Faltan credenciales en el entorno' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Retrieval n=5
    const { fragments } = await retrieveFromSupabase(supabase, query, 5);

    // Select model from config (use compliance use-case by default)
    const config = await fetchModelConfig(supabase, 'aria');
    let { model } = getModelForUseCase(config, 'compliance', { provider: 'openai', model: 'gpt-4o' } as any);
    model = normalizeModelName(model);

    const system = buildSystemPrompt();
    const user = buildUserPayload(fragments, query);

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.2,
      max_tokens: 1200,
      stream: false,
    });

    const draft = completion.choices?.[0]?.message?.content || '';

    // Consistency verifier with a smaller model
    const verifierModel = normalizeModelName('gpt-4o-mini');
    const validated = await verifyConsistency(openai, verifierModel, draft, fragments);

    const transparency = fragments.length > 0 ? 'from_supabase' : 'no_internal_context';

    const usedContext: Frag[] = fragments.map(f => ({ id: f.id, content: f.content, source: f.source, meta: f.meta }));

    return Response.json({ text: validated, usedContext, transparency });
  } catch (e: any) {
    return Response.json({ error: e?.message || 'Error inesperado' }, { status: 500 });
  }
}
