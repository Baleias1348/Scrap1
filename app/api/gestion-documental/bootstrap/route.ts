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
  '08_trabajadores/empleados_directos/',
  '08_trabajadores/empleados_indirectos/',
  '09_epp/',
  '10_fiscalizaciones/',
  '11_equipos_mantenimiento/',
];

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
