import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const SUPABASE_URL = process.env.SUPABASE_URL || null;
  const SUPABASE_KEY = process.env.SUPABASE_KEY || null;
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || null;

  return NextResponse.json({
    SUPABASE_URL: SUPABASE_URL ? 'OK' : 'MISSING',
    SUPABASE_KEY: SUPABASE_KEY ? 'OK' : 'MISSING',
    GOOGLE_API_KEY: GOOGLE_API_KEY ? 'OK' : 'MISSING',
    // Para mayor seguridad, no devolvemos los valores reales
  });
}
