import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

const FOLDERS = [
  '01_reglamentos/',
  '02_afiliacion_y_seguros/',
  '03_comite_paritario/',
  '04_matriz_riesgos/',
  '05_capacitaciones/',
  '06_emergencias/',
  '07_accidentes_enfermedades/',
  '08_trabajadores/',
  '08_trabajadores/trabajadores indirectos/',
  '09_epp/',
  '10_fiscalizaciones/',
  '11_equipos_mantenimiento/',
];

const READMES: Record<string, string> = {
  '01_reglamentos': `# 01 Reglamentos

Objetivo: Mantener los reglamentos internos y políticas de la organización.
Cumplimiento: Normativa laboral y de seguridad aplicable.
Buenas prácticas: Versionar y mantener un responsable.
Checklist de uso:
- [ ] Reglamento interno vigente
- [ ] Políticas de seguridad y salud
- [ ] Registros de publicación y difusión
`,
  '02_afiliacion_y_seguros': `# 02 Afiliación y Seguros

Objetivo: Gestionar documentación asociada a mutualidades/seguro complementario.
Buenas prácticas: Mantener respaldos y certificados vigentes.
`,
  '03_comite_paritario': `# 03 Comité Paritario

Objetivo: Resguardar actas, constitución y plan de trabajo del comité paritario.
`,
  '04_matriz_riesgos': `# 04 Matriz de Riesgos

Objetivo: Identificar peligros y evaluar riesgos. Mantener controles.
`,
  '05_capacitaciones': `# 05 Capacitaciones

Objetivo: Registro de plan anual, asistentes, contenidos y evidencias.
`,
  '06_emergencias': `# 06 Emergencias

Objetivo: Planes de emergencia, simulacros y designación de brigadistas.
`,
  '07_accidentes_enfermedades': `# 07 Accidentes y Enfermedades

Objetivo: Investigación, reportabilidad y medidas correctivas.
`,
  '08_trabajadores': `# 08 Trabajadores

Objetivo: Contratos, anexos, certificados, evaluaciones médicas.
`,
  '09_epp': `# 09 EPP

Objetivo: Entrega de elementos de protección personal y control de stock.
`,
  '10_fiscalizaciones': `# 10 Fiscalizaciones

Objetivo: Requerimientos, respuestas y seguimiento de hallazgos.
`,
  '11_equipos_mantenimiento': `# 11 Equipos y Mantenimiento

Objetivo: Mantenciones, inspecciones y certificaciones de equipos.
`,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Crear carpetas con .keep
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
        // seguimos intentando las demás, pero si hay un error inesperado lo devolvemos
        return NextResponse.json({ error: `Error creando ${keepPath}: ${error.message}` }, { status: 500 });
      }

      // Crear README.md por carpeta (nivel base de la carpeta)
      const parts = folder.replace(/\/$/, '').split('/');
      const base = parts[parts.length - 1];
      const readmeContent = READMES[base] || `# ${base}\n\nGuía de uso de la carpeta ${base}.`;
      const readmePath = `${folder}README.md`;
      const { error: readmeErr } = await supabase
        .storage
        .from(BUCKET)
        .upload(readmePath, new Blob([readmeContent], { type: 'text/markdown; charset=utf-8' }), {
          upsert: false,
          contentType: 'text/markdown; charset=utf-8',
        });
      // Si ya existe, lo ignoramos para no sobreescribir contenido personalizado
      if (readmeErr && !String(readmeErr.message || '').includes('exists')) {
        return NextResponse.json({ error: `Error creando ${readmePath}: ${readmeErr.message}` }, { status: 500 });
      }
    }

    // Crear archivo lista_maestra_trabajadores.csv vacío si no existe
    const csvPath = '08_trabajadores/lista_maestra_trabajadores.csv';
    const { data: existsData } = await supabase
      .storage
      .from(BUCKET)
      .list('08_trabajadores', { search: 'lista_maestra_trabajadores.csv' });

    const already = (existsData || []).some(f => f.name === 'lista_maestra_trabajadores.csv');
    if (!already) {
      const { error: csvErr } = await supabase
        .storage
        .from(BUCKET)
        .upload(csvPath, new Blob(["rut,nombre,cargo,area\n"], { type: 'text/csv' }), {
          upsert: true,
          contentType: 'text/csv',
        });
      if (csvErr) {
        return NextResponse.json({ error: `Error creando ${csvPath}: ${csvErr.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, created: true, folders: FOLDERS }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error inesperado' }, { status: 500 });
  }
}
