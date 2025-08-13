import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import fs from 'fs';
import csv from 'csv-parser';

// Configuración desde variables de entorno
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const openaiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

const CSV_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '../codigos_actividad_economica_sii_chile.csv');

async function crearTabla() {
  await supabase.rpc('execute_sql', { sql: `
    CREATE TABLE IF NOT EXISTS public.codigos_actividad_economica_sii_chile (
      id SERIAL PRIMARY KEY,
      codigo VARCHAR(10) NOT NULL,
      descripcion TEXT NOT NULL,
      afecto_iva VARCHAR(10),
      categoria_tributaria VARCHAR(50),
      disponible_internet VARCHAR(10),
      embedding VECTOR(768)
    );
    CREATE INDEX IF NOT EXISTS idx_economic_codes_embedding ON public.codigos_actividad_economica_sii_chile USING ivfflat (embedding vector_cosine_ops);
  ` });
}

async function importarCSV() {
  const rows: any[] = [];
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        for (const row of rows) {
          await supabase.from('codigos_actividad_economica_sii_chile').insert({
            codigo: row['Código'],
            descripcion: row['Descripción'],
            afecto_iva: row['Afecto IVA'],
            categoria_tributaria: row['Categoría Tributaria'],
            disponible_internet: row['Disponible Internet']
          });
        }
        resolve();
      })
      .on('error', reject);
  });
}

async function vectorizar() {
  const { data, error } = await supabase
    .from('codigos_actividad_economica_sii_chile')
    .select('id, codigo, descripcion, afecto_iva, categoria_tributaria, disponible_internet')
    .is('embedding', null);
  if (error) throw error;
  for (const row of data) {
    const texto = `${row.codigo} ${row.descripcion} ${row.afecto_iva} ${row.categoria_tributaria} ${row.disponible_internet}`.replace(/undefined/g, '');
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texto
    });
    await supabase
      .from('codigos_actividad_economica_sii_chile')
      .update({ embedding: embedding.data[0].embedding })
      .eq('id', row.id);
  }
}

async function main() {
  await crearTabla();
  await importarCSV();
  await vectorizar();
  console.log('¡Tabla creada, datos importados y vectorizados!');
}

main().catch(console.error);
