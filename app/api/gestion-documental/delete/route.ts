import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

// Carpetas base protegidas: no se pueden eliminar
const PROTECTED_FOLDERS = new Set<string>([
  '01_reglamentos/',
  '02_afiliacion_y_seguros/',
  '03_comite_paritario/',
  '04_matriz_riesgos/',
  '05_capacitaciones/',
  '06_emergencias/',
  '07_accidentes_enfermedades/',
  '08_trabajadores/',
  // Subcarpetas protegidas dentro de trabajadores
  '08_trabajadores/trabajadores indirectos/',
  '09_epp/',
  '10_fiscalizaciones/',
  '11_equipos_mantenimiento/',
]);

export async function POST(req: NextRequest) {
  try {
    const { path, isFolder } = await req.json();
    if (!path) return NextResponse.json({ error: 'Falta path' }, { status: 400 });

    // Obtener usuario y organización
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
    const normalize = (p: string) => p.replace(/^\/+/, '');
    const joinOrg = (p: string) => (p.startsWith('orgs/') ? p : (basePrefix + normalize(p)));
    const fullInput = joinOrg(path);

    // Para proteger carpetas base comparamos contra la ruta relativa sin el prefijo org
    const relative = fullInput.startsWith(basePrefix) ? fullInput.slice(basePrefix.length) : fullInput;
    const relFolder = relative.endsWith('/') ? relative : (relative + (isFolder ? '/' : ''));

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    if (isFolder) {
      const prefix = fullInput.endsWith('/') ? fullInput : fullInput + '/';
      // Bloquear eliminación de carpetas base (comparando relativo)
      if (PROTECTED_FOLDERS.has(relFolder)) {
        return NextResponse.json({ error: 'Carpeta protegida: no se puede eliminar' }, { status: 403 });
      }
      const { data, error: listErr } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 });
      if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });
      const targets = (data || []).map((it: any) => (it.id === null ? prefix + it.name + '/' : prefix + it.name));
      // incluir el .keep si existe
      targets.push(prefix + '.keep');
      const { error: rmErr } = await supabase.storage.from(BUCKET).remove(targets);
      if (rmErr) return NextResponse.json({ error: rmErr.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    } else {
      const { error } = await supabase.storage.from(BUCKET).remove([fullInput]);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error eliminando' }, { status: 500 });
  }
}
