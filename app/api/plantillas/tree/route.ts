import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

// Predefined intelligent folders and minimal README contents
const FOLDERS = [
  '01_reglamentos/',
  '02_afiliacion_y_seguros/',
  '03_comite_paritario/',
  '04_matriz_riesgos/',
  '05_capacitaciones/',
  '06_emergencias/',
  '07_accidentes_enfermedades/',
  '08_trabajadores/',
  '08_trabajadores/empleados_directos/',
  '08_trabajadores/empleados_indirectos/',
  '09_epp/',
  '10_fiscalizaciones/',
  '11_equipos_mantenimiento/',
];

const READMES: Record<string, string> = {
  '01_reglamentos': `# 01 Reglamentos\n\nObjetivo: Mantener los reglamentos internos y políticas de la organización.\nCumplimiento: Normativa laboral y de seguridad aplicable.\nBuenas prácticas: Versionar y mantener un responsable.\nChecklist de uso:\n- [ ] Reglamento interno vigente\n- [ ] Políticas de seguridad y salud\n- [ ] Registros de publicación y difusión\n`,
  '02_afiliacion_y_seguros': `# 02 Afiliación y Seguros\n\nObjetivo: Gestionar documentación asociada a mutualidades/seguro complementario.\nBuenas prácticas: Mantener respaldos y certificados vigentes.\n`,
  '03_comite_paritario': `# 03 Comité Paritario\n\nObjetivo: Resguardar actas, constitución y plan de trabajo del comité paritario.\n`,
  '04_matriz_riesgos': `# 04 Matriz de Riesgos\n\nObjetivo: Identificar peligros y evaluar riesgos. Mantener controles.\n`,
  '05_capacitaciones': `# 05 Capacitaciones\n\nObjetivo: Registro de plan anual, asistentes, contenidos y evidencias.\n`,
  '06_emergencias': `# 06 Emergencias\n\nObjetivo: Planes de emergencia, simulacros y designación de brigadistas.\n`,
  '07_accidentes_enfermedades': `# 07 Accidentes y Enfermedades\n\nObjetivo: Investigación, reportabilidad y medidas correctivas.\n`,
  '08_trabajadores': `# 08 Trabajadores\n\nObjetivo: Contratos, anexos, certificados, evaluaciones médicas.\n`,
  '09_epp': `# 09 EPP\n\nObjetivo: Entrega de elementos de protección personal y control de stock.\n`,
  '10_fiscalizaciones': `# 10 Fiscalizaciones\n\nObjetivo: Requerimientos, respuestas y seguimiento de hallazgos.\n`,
  '11_equipos_mantenimiento': `# 11 Equipos y Mantenimiento\n\nObjetivo: Mantenciones, inspecciones y certificaciones de equipos.\n`,
};

async function ensureStructure(supabase: ReturnType<typeof createClient>) {
  for (const folder of FOLDERS) {
    const keepPath = `${folder}.keep`;
    const { error } = await supabase
      .storage
      .from(BUCKET)
      .upload(keepPath, new Blob(["keep"], { type: 'text/plain' }), {
        upsert: true,
        contentType: 'text/plain',
      });
    if (error && !String(error.message || '').includes('exists')) {
      throw new Error(`Error creando ${keepPath}: ${error.message}`);
    }

    const parts = folder.replace(/\/$/, '').split('/');
    const base = parts[parts.length - 1];
    const readmeContent = READMES[base] || `# ${base}\n\nGuía de uso de la carpeta ${base}.`;
    const readmePath = `${folder}README.md`;
    const { error: readmeErr } = await supabase
      .storage
      .from(BUCKET)
      .upload(readmePath, new Blob([readmeContent], { type: 'text/markdown; charset=utf-8' }), {
        upsert: true,
        contentType: 'text/markdown; charset=utf-8',
      });
    if (readmeErr && !String(readmeErr.message || '').includes('exists')) {
      throw new Error(`Error creando ${readmePath}: ${readmeErr.message}`);
    }
  }

  // Minimal default file example (kept from bootstrap behavior)
  const csvPath = '08_trabajadores/lista_maestra_trabajadores.csv';
  const { data: existsData } = await supabase
    .storage
    .from(BUCKET)
    .list('08_trabajadores', { search: 'lista_maestra_trabajadores.csv' as any });
  const already = (existsData || []).some((f: any) => f.name === 'lista_maestra_trabajadores.csv');
  if (!already) {
    const { error: csvErr } = await supabase
      .storage
      .from(BUCKET)
      .upload(csvPath, new Blob(["rut,nombre,cargo,area\n"], { type: 'text/csv' }), {
        upsert: true,
        contentType: 'text/csv',
      });
    if (csvErr) throw new Error(`Error creando ${csvPath}: ${csvErr.message}`);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Respect empty path if provided to allow bucket root listing
  const hasPath = searchParams.has('path');
  let path = hasPath ? (searchParams.get('path') || '') : '12_plantillas/';
  if (path === '/') path = '';
  const includeKeeps = (searchParams.get('includeKeeps') || 'false').toLowerCase() === 'true';

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    let { data, error } = await supabase.storage.from(BUCKET).list(path, { limit: 1000 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const folders: { name: string; path: string }[] = [];
    const files: { name: string; path: string; size?: number | null; updated_at?: string | null; icon?: string }[] = [];

    for (const item of data || []) {
      if (item.name === '.keep' && !includeKeeps) continue;
      const base = path ? (path.endsWith('/') ? path : path + '/') : '';
      const itemPath = base + item.name;
      if (item.id === null) {
        // folder
        folders.push({ name: item.name, path: itemPath + '/' });
      } else {
        files.push({ name: item.name, path: itemPath, size: (item as any).metadata?.size ?? null, updated_at: (item as any).updated_at ?? null });
      }
    }

    // Auto-bootstrap when listing the bucket root and nothing exists yet
    const isRoot = (path || '') === '';
    if (isRoot && folders.length === 0 && files.length === 0) {
      try {
        await ensureStructure(supabase);
        // Re-list after creating structure
        const relist = await supabase.storage.from(BUCKET).list('', { limit: 1000 });
        if (relist.error) throw relist.error;
        const folders2: { name: string; path: string }[] = [];
        const files2: { name: string; path: string; size?: number | null; updated_at?: string | null; icon?: string }[] = [];
        for (const item of relist.data || []) {
          if (item.name === '.keep' && !includeKeeps) continue;
          const itemPath = item.name;
          if ((item as any).id === null) {
            folders2.push({ name: item.name, path: itemPath + '/' });
          } else {
            files2.push({ name: item.name, path: itemPath, size: (item as any).metadata?.size ?? null, updated_at: (item as any).updated_at ?? null });
          }
        }
        return NextResponse.json({ path: '', folders: folders2, files: files2 }, { status: 200 });
      } catch (bootErr: any) {
        // If boot fails, still return the original (empty) listing with an advisory message
        return NextResponse.json({ path: '', folders, files, note: 'Auto-bootstrap failed', details: String(bootErr?.message || bootErr) }, { status: 200 });
      }
    }

    return NextResponse.json({ path: path || '', folders, files }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error listando árbol', details: err?.message || String(err) }, { status: 500 });
  }
}
