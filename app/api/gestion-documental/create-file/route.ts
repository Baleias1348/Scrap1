import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

export async function POST(req: NextRequest) {
  try {
    const { path, content, contentType } = await req.json();
    if (!path) return NextResponse.json({ error: 'Falta path' }, { status: 400 });

    // Obtener sesión y organización del usuario
    const routeClient = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userErr } = await routeClient.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    // Buscar/crear organización por defecto
    let orgId: string | null = null;
    const { data: orgs, error: orgErr } = await routeClient
      .from('organizaciones')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 500 });
    if (!orgs || orgs.length === 0) {
      const { data: inserted, error: insErr } = await routeClient
        .from('organizaciones')
        .insert({ nombre_organizacion: 'Organización 1', user_id: user.id })
        .select('*')
        .limit(1);
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
      orgId = inserted?.[0]?.id || null;
    } else {
      orgId = orgs[0].id;
    }
    if (!orgId) return NextResponse.json({ error: 'No se pudo determinar organización' }, { status: 500 });

    const basePrefix = `orgs/${orgId}/`;
    const fullPath = path.startsWith('orgs/') ? path : (basePrefix + path.replace(/^\/+/, ''));

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const dataToUpload = typeof content === 'string' ? new Blob([content], { type: contentType || 'text/plain; charset=utf-8' }) : new Blob([new Uint8Array()], { type: 'application/octet-stream' });

    const { error } = await supabase.storage.from(BUCKET).upload(fullPath, dataToUpload, { upsert: true, contentType: contentType || 'text/plain' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, path: fullPath });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error creando archivo' }, { status: 500 });
  }
}
