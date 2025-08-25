import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar las variables alineadas con el proyecto
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const BUCKET = 'prevencion2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  const expiresIn = Number(searchParams.get('expiresIn') || 600);
  if (!path) return NextResponse.json({ error: 'Falta path' }, { status: 400 });

  if (!SUPABASE_URL) {
    return NextResponse.json({ error: 'Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_URL en env' }, { status: 500 });
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY en env' }, { status: 500 });
  }

  // Normalizar path (sin prefijo /)
  const normalizedPath = path.replace(/^\/+/, '');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(normalizedPath, expiresIn);
    if (error) {
      return NextResponse.json({ error: error.message, path: normalizedPath, bucket: BUCKET }, { status: 500 });
    }
    const res = NextResponse.json({ signedUrl: data?.signedUrl }, { status: 200 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error creando signed URL', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
