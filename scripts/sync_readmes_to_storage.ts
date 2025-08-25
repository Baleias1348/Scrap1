import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string; // service role
const BUCKET = 'prevencion2';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY');
  process.exit(1);
}

const baseDir = path.resolve(process.cwd(), 'app/dashboard/gestion-documental');

const folders = [
  '01_reglamentos',
  '02_afiliacion_y_seguros',
  '03_comite_paritario',
  '04_matriz_riesgos',
  '05_capacitaciones',
  '06_emergencias',
  '07_accidentes_enfermedades',
  '08_trabajadores',
  '09_epp',
  '10_fiscalizaciones',
  '11_equipos_mantenimiento',
];

(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  let ok = 0, fail = 0;
  for (const folder of folders) {
    const readmeLocal = path.join(baseDir, folder, 'README.md');
    if (!fs.existsSync(readmeLocal)) {
      console.warn(`No existe README.md local en ${readmeLocal}, se omite`);
      continue;
    }
    const content = fs.readFileSync(readmeLocal, 'utf8');
    const storagePath = `${folder}/README.md`;
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, new Blob([content], { type: 'text/markdown; charset=utf-8' }), {
      upsert: true,
      contentType: 'text/markdown; charset=utf-8',
    } as any);
    if (error) {
      console.error(`Error subiendo ${storagePath}:`, error.message);
      fail++;
    } else {
      console.log(`OK -> ${storagePath}`);
      ok++;
    }
  }
  console.log(`Completado. OK=${ok}, FAIL=${fail}`);
})();
