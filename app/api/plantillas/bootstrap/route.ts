import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

const FOLDERS = [
  '12_plantillas/',
  '12_plantillas/01_reglamentos/',
  '12_plantillas/02_procedimientos/',
  '12_plantillas/03_epp/',
  '12_plantillas/04_examenes_medicos/',
  '12_plantillas/05_capacitaciones/',
  '12_plantillas/06_inspecciones/',
  '12_plantillas/07_emergencias/',
  '12_plantillas/08_trabajadores/',
  '12_plantillas/09_contratistas/',
  '12_plantillas/10_comunicaciones/',
  '12_plantillas/11_reportes/',
];

export async function POST() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    for (const folder of FOLDERS) {
      const keepPath = folder + '.keep';
      // Upload empty .keep (upsert)
      await supabase.storage.from(BUCKET).upload(keepPath, new Blob([''], { type: 'text/plain' }), {
        upsert: true,
        contentType: 'text/plain',
      });
    }

    return NextResponse.json({ ok: true, created: FOLDERS.length }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error creando estructura de plantillas', details: err?.message || String(err) }, { status: 500 });
  }
}
