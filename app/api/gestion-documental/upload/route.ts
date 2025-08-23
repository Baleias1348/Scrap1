import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const targetPath = String(form.get('path') || ''); // folder path, may be '' or '08_trabajadores/'
    const file = form.get('file');
    if (!file || typeof file === 'string') return NextResponse.json({ error: 'Falta archivo' }, { status: 400 });

    const base = targetPath ? (targetPath.endsWith('/') ? targetPath : targetPath + '/') : '';
    const fileName = (file as File).name;
    const fullPath = base + fileName;

    const arrayBuf = await (file as File).arrayBuffer();
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fullPath, new Blob([arrayBuf], { type: (file as File).type || 'application/octet-stream' }), { upsert: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, path: fullPath });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error subiendo archivo' }, { status: 500 });
  }
}
