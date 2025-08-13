import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { messageIdx, rating } = await req.json();
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Calificación inválida.' }, { status: 400 });
    }
    // Puedes agregar más contexto aquí si lo necesitas (por ejemplo, id de usuario, mensaje, etc.)
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { error } = await supabase.from('calificaciones_respuestas').insert([
      {
        message_idx: messageIdx,
        rating,
        created_at: new Date().toISOString(),
        // Agrega más campos si es necesario (usuario, id_respuesta, etc.)
      }
    ]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || err?.toString() }, { status: 500 });
  }
}
