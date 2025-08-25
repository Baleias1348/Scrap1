import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== 'string') {
      return new Response(JSON.stringify({ error: 'sessionId requerido' }), { status: 400 });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { error } = await supabase
      .from('session_summaries')
      .delete()
      .eq('session_id', sessionId);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Error inesperado' }), { status: 500 });
  }
}
