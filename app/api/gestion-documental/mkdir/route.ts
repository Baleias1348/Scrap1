import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    if (!path) return NextResponse.json({ error: 'Falta path' }, { status: 400 });
    const folderPath = path.endsWith('/') ? path : path + '/';

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    // Crear carpeta subiendo un .keep
    const { error } = await supabase.storage.from(BUCKET).upload(`${folderPath}.keep`, new Blob([new Uint8Array()]), { upsert: true, contentType: 'application/octet-stream' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, path: folderPath });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error creando carpeta' }, { status: 500 });
  }
}
