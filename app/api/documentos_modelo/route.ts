import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// URL y KEY del proyecto correcto de Supabase (PreventiFlow)
const SUPABASE_URL = 'https://zaidbrwtevakbuaowfrw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// POST: Crear un nuevo documento modelo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, descripcion, categoria, campos_editables, contenido_base, estilos, creador, version, validado } = body;
    const { data, error } = await supabase.from('modelos_documento').insert([
      { nombre, descripcion, categoria, campos_editables, contenido_base, estilos, creador, version, validado }
    ]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ documento: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// GET: Listar todos los documentos modelo
// GET: Listar todos los documentos modelo o uno específico por id
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    if (id) {
      const { data, error } = await supabase.from('modelos_documento').select('*').eq('id', id).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json({ documento: data });
    } else {
      const { data, error } = await supabase.from('modelos_documento').select('*').order('fecha_actualizacion', { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ documentos: data });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
