import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string; // service role
const BUCKET = process.env.BUCKET_NAME || 'prevencion2';

async function main() {
  const folderArg = process.argv.slice(2).join(' ');
  if (!folderArg) {
    console.error('Uso: tsx scripts/create_storage_folder.ts "ruta/de/carpeta/"');
    process.exit(1);
  }
  const prefix = folderArg.endsWith('/') ? folderArg : folderArg + '/';
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Faltan SUPABASE_URL o SUPABASE_KEY en variables de entorno.');
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const path = `${prefix}.keep`;
  const { error } = await supabase
    .storage
    .from(BUCKET)
    .upload(path, new ArrayBuffer(0), { upsert: true, contentType: 'text/plain' });
  if (error) {
    console.error('Error creando carpeta:', error.message);
    process.exit(1);
  }
  console.log('Carpeta creada (placeholder .keep):', prefix);
}

main().catch((e) => { console.error(e); process.exit(1); });
