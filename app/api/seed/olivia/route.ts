import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role

// Seed endpoint: crea usuaria modelo "Olivia Martin" como si se hubiera registrado normalmente.
// Producción: habilitado. Opcionalmente puedes proteger con un secret query (?secret=...)
// Uso: POST /api/seed/olivia
// Body opcional: { email?: string, password?: string, metadata?: Record<string, any>, secret?: string }

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const body = await req.json().catch(() => ({}));

    const email = body.email || process.env.DEV_OLIVIA_EMAIL || 'example@example.com';
    const password = body.password || process.env.DEV_OLIVIA_PASSWORD || '1234';
    const metadata = body.metadata || { full_name: 'Olivia Martin', role: 'modelo' };

    // Opcional: simple guard con secret
    const secret = body.secret || new URL(req.url).searchParams.get('secret');
    if (process.env.SEED_SECRET && secret !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1) Intentar crear el usuario (idempotente por manejo de errores)
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    let user = created?.user || null;

    if (createErr) {
      // Si ya existe, intentamos localizarlo listando usuarios (búsqueda simple por email)
      // Nota: listUsers no filtra por email, paginamos primeras páginas por simplicidad
      // En proyectos con muchos usuarios, mejor implementar un endpoint dedicado o mantener una tabla public.profile.
      let found = null as any;
      let page = 1;
      const pageSize = 1000;
      for (let i = 0; i < 3 && !found; i++) {
        const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage: pageSize } as any);
        if (listErr) break;
        found = list?.users?.find((u: any) => (u?.email || '').toLowerCase() === String(email).toLowerCase());
        if (found) break;
        if (!list || !Array.isArray(list.users) || list.users.length < pageSize) break;
        page++;
      }
      user = found || null;

      if (!user) {
        // No se pudo crear ni encontrar; devolver el error original
        return NextResponse.json({ error: createErr.message }, { status: 400 });
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, created_at: user.created_at, user_metadata: user.user_metadata } }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error en seed de Olivia', details: err?.message || String(err) }, { status: 500 });
  }
}
