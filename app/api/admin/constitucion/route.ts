import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Protegido por header x-admin-key que debe coincidir con ADMIN_API_KEY
export async function POST(req: NextRequest) {
  try {
    const adminKeyHeader = req.headers.get('x-admin-key');
    const adminKeyEnv = process.env.ADMIN_API_KEY;
    if (!adminKeyEnv) {
      return NextResponse.json({ error: 'ADMIN_API_KEY no configurado en el servidor' }, { status: 500 });
    }
    if (adminKeyHeader !== adminKeyEnv) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { nombre_agente, constitucion, metadata } = await req.json();
    if (!nombre_agente || !constitucion) {
      return NextResponse.json({ error: 'Faltan campos requeridos: nombre_agente, constitucion' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role recomendado
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: 'Variables de entorno SUPABASE_URL/SUPABASE_KEY faltantes' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const payload = {
      nombre_agente,
      constitucion,
      metadata: metadata ?? null,
      fecha_actualizacion: new Date().toISOString(),
    } as any;

    // upsert por nombre_agente
    const { data, error } = await supabase
      .from('constituciones_agente')
      .upsert(payload, { onConflict: 'nombre_agente' })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, record: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error inesperado' }, { status: 500 });
  }
}
