import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Leer el form-data con el archivo y los metadatos
    const formData = await req.formData();
    const file = formData.get('file');
    const orgId = formData.get('orgId');
    const userId = formData.get('userId');
    const nombre = formData.get('nombre');
    const extension = formData.get('extension') || 'docx';
    if (!file || !orgId || !userId || !nombre) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }
    // Guardar en bucket "documentos_organizacion/{orgId}/nombre.ext"
    const bucket = 'documentos_organizacion';
    const path = `${orgId}/${nombre}.${extension}`;
    let contentType = 'application/octet-stream';
    if (file instanceof File) {
      contentType = file.type || contentType;
    }
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Registrar en la tabla documentos_modelo
    const { error: dbError } = await supabase.from('documentos_modelo').insert([
      {
        nombre,
        organizacion_id: orgId,
        usuario_id: userId,
        ruta_archivo: path,
        extension,
        fecha_subida: new Date().toISOString(),
      },
    ]);
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
    return NextResponse.json({ ok: true, path });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error inesperado.' }, { status: 500 });
  }
}
