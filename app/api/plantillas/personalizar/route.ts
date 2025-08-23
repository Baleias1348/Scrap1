import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDeepseekChatCompletion } from '../../../../utils/deepseek';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

interface Body {
  template_path?: string; // storage path to txt/md
  base_text?: string;     // raw text
  empresa?: { rubro?: string; tamano?: string; region?: string };
  extra_requisitos?: string;
  save?: boolean;
  id_trabajador?: number;
  tipo_documento?: string;
  metadatos?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const { template_path, base_text, empresa, extra_requisitos, save, id_trabajador, tipo_documento, metadatos } = body;

    if (!template_path && !base_text) {
      return NextResponse.json({ error: 'Debe proveer template_path o base_text' }, { status: 400 });
    }

    let plantillaTexto = base_text || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    if (template_path) {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(template_path, 120);
      if (error || !data?.signedUrl) return NextResponse.json({ error: 'No se pudo obtener signed URL de plantilla' }, { status: 500 });
      const resp = await fetch(data.signedUrl);
      if (!resp.ok) return NextResponse.json({ error: 'No se pudo leer plantilla' }, { status: 500 });
      plantillaTexto = await resp.text();
    }

    const prompt = `Eres un experto en prevención de riesgos laborales en Chile. Adapta el siguiente contenido a la realidad de la empresa.\n\nContexto empresa: ${JSON.stringify(empresa || {})}\nRequisitos adicionales: ${extra_requisitos || 'N/A'}\n\nContenido base:\n${plantillaTexto}\n\nDevuelve primero el texto adaptado (listo para usar) y luego una lista de recomendaciones de cumplimiento y seguimiento para el Prevencionista.`;

    const aiText = await getDeepseekChatCompletion(prompt);

    // separar recomendaciones si vienen después de un separador simple
    const adapted_text = aiText;
    const recommendations = [] as string[];

    // Guardado opcional
    let savedPath: string | null = null;
    let dbRecord: any = null;

    if (save) {
      const now = new Date().toISOString().replace(/[:.]/g, '-');
      const baseName = (template_path?.split('/').pop() || 'documento_adaptado.txt').replace(/\.(md|txt)$/i, '');
      if (id_trabajador && tipo_documento) {
        // guardar bajo trabajadores
        savedPath = `08_trabajadores/${id_trabajador}/${baseName}_${now}.md`;
        await supabase.storage.from(BUCKET).upload(savedPath, new Blob([adapted_text], { type: 'text/markdown' }), { upsert: true, contentType: 'text/markdown' });
        const { data: inserted, error: dbErr } = await supabase.from('documentos_sst').insert({
          id_trabajador,
          tipo_documento,
          storage_path: savedPath,
          metadatos: metadatos || null,
        }).select('*').single();
        if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
        dbRecord = inserted;
        if (metadatos) {
          const metaPath = savedPath + '.meta.json';
          await supabase.storage.from(BUCKET).upload(metaPath, new Blob([JSON.stringify({ ...metadatos, empresa, extra_requisitos }, null, 2)], { type: 'application/json' }), { upsert: true, contentType: 'application/json' });
        }
      } else {
        // guardar bajo plantillas internas
        savedPath = `12_plantillas/_generados/${baseName}_${now}.md`;
        await supabase.storage.from(BUCKET).upload(savedPath, new Blob([adapted_text], { type: 'text/markdown' }), { upsert: true, contentType: 'text/markdown' });
        if (metadatos) {
          const metaPath = savedPath + '.meta.json';
          await supabase.storage.from(BUCKET).upload(metaPath, new Blob([JSON.stringify({ ...metadatos, empresa, extra_requisitos }, null, 2)], { type: 'application/json' }), { upsert: true, contentType: 'application/json' });
        }
      }
    }

    return NextResponse.json({ adapted_text, recommendations, savedPath, dbRecord }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error personalizando plantilla', details: err?.message || String(err) }, { status: 500 });
  }
}
