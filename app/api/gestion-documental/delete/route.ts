import { NextRequest, NextResponse } from 'next/server';
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    if (isFolder) {
      const prefix = path.endsWith('/') ? path : path + '/';
      // Bloquear eliminación de carpetas base
      if (PROTECTED_FOLDERS.has(prefix)) {
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
      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error eliminando' }, { status: 500 });
  }
}
