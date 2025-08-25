import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
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

    // Obtener sesión/organización
    const routeClient = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userErr } = await routeClient.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

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
        .insert({ nombre: 'Organización 1', user_id: user.id })
        .select('*')
        .limit(1);
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
      orgId = inserted?.[0]?.id || null;
    } else {
      orgId = orgs[0].id;
    }
    if (!orgId) return NextResponse.json({ error: 'No se pudo determinar organización' }, { status: 500 });

    const basePrefix = `orgs/${orgId}/`;
    const base = targetPath ? (targetPath.endsWith('/') ? targetPath : targetPath + '/') : '';
    const orgBase = base.startsWith('orgs/') ? base : (basePrefix + base.replace(/^\/+/, ''));
    const fileName = (file as File).name;
    const fullPath = orgBase + fileName;

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
