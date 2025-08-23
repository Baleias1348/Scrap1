import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

interface Body {
  template_path: string;
  dest_path?: string; // if not provided and id_trabajador exists, will default to  "08_trabajadores/{id_trabajador}/" + filename
  id_trabajador?: number;
  tipo_documento?: string;
  metadatos?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const { template_path, dest_path, id_trabajador, tipo_documento, metadatos } = body;
    if (!template_path) return NextResponse.json({ error: 'Falta template_path' }, { status: 400 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch template
    const { data: urlData, error: urlErr } = await supabase.storage.from(BUCKET).createSignedUrl(template_path, 60);
    if (urlErr || !urlData?.signedUrl) return NextResponse.json({ error: 'No se pudo firmar template' }, { status: 500 });
    const fileResp = await fetch(urlData.signedUrl);
    if (!fileResp.ok) return NextResponse.json({ error: 'No se pudo descargar template' }, { status: 500 });
    const fileBuf = await fileResp.arrayBuffer();

    const fileName = template_path.split('/').pop() || 'archivo';
    let destination = dest_path;

    if (!destination && id_trabajador) {
      destination = `08_trabajadores/${id_trabajador}/${fileName}`;
    }
    if (!destination) return NextResponse.json({ error: 'Falta dest_path o id_trabajador' }, { status: 400 });

    // Upload copy (upsert)
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(destination, new Blob([fileBuf]), { upsert: true });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    // If saving under trabajadores and metadata provided, insert into documentos_sst
    let dbRecord: any = null;
    if (destination.startsWith('08_trabajadores/') && id_trabajador && tipo_documento) {
      const client = createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'public' } });
      const { data: inserted, error: dbErr } = await client.from('documentos_sst').insert({
        id_trabajador,
        tipo_documento,
        storage_path: destination,
        metadatos: metadatos || null,
      }).select('*').single();
      if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
      dbRecord = inserted;

      if (metadatos) {
        const metaPath = destination + '.meta.json';
        await supabase.storage.from(BUCKET).upload(metaPath, new Blob([JSON.stringify(metadatos, null, 2)], { type: 'application/json' }), { upsert: true, contentType: 'application/json' });
      }
    }

    return NextResponse.json({ ok: true, destination, dbRecord }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error usando plantilla', details: err?.message || String(err) }, { status: 500 });
  }
}
