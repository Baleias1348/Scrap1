import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

export async function GET(req: NextRequest) {
  // Permite filtrar por validada, categoria_usuario, etc.
  const url = new URL(req.url!);
  const validada = url.searchParams.get('validada');
  const categoria = url.searchParams.get('categoria_usuario');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  let query = supabase.from('interacciones').select('*').order('fecha', { ascending: false });
  if (validada !== null) query = query.eq('validada', validada === 'true');
  if (categoria) query = query.eq('categoria_usuario', categoria);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  // Permite validar/editar una interacción
  const body = await req.json();
  const { id, respuesta, validada, experto_validador } = body;
  if (!id) return NextResponse.json({ error: 'Falta id de interacción' }, { status: 400 });
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const updates: any = { validada };
  if (respuesta) updates.respuesta = respuesta;
  if (experto_validador) updates.experto_validador = experto_validador;
  if (validada) updates.fecha_validacion = new Date().toISOString();
  const { error } = await supabase.from('interacciones').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
