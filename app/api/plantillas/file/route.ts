import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  const expiresIn = Number(searchParams.get('expiresIn') || 600);
  if (!path) return NextResponse.json({ error: 'Falta path' }, { status: 400 });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ signedUrl: data?.signedUrl }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error creando signed URL', details: err?.message || String(err) }, { status: 500 });
  }
}
