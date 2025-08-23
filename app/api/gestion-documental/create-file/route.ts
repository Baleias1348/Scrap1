import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

export async function POST(req: NextRequest) {
  try {
    const { path, content, contentType } = await req.json();
    if (!path) return NextResponse.json({ error: 'Falta path' }, { status: 400 });
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const dataToUpload = typeof content === 'string' ? new Blob([content], { type: contentType || 'text/plain; charset=utf-8' }) : new Blob([new Uint8Array()], { type: 'application/octet-stream' });

    const { error } = await supabase.storage.from(BUCKET).upload(path, dataToUpload, { upsert: true, contentType: contentType || 'text/plain' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, path });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error creando archivo' }, { status: 500 });
  }
}
