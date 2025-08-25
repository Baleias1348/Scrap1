import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!url || !service) {
      const missing = [] as string[];
      if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!service) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      console.error('[api/organizaciones/create] missing env', missing);
      return NextResponse.json({ error: 'Supabase no configurado (variables faltantes)', missing }, { status: 500 });
    }

    const payload = await req.json();
    const { nombre_organizacion, extras } = payload || {};
    if (!nombre_organizacion || typeof nombre_organizacion !== 'string') {
      return NextResponse.json({ error: 'nombre_organizacion es requerido' }, { status: 400 });
    }

    const cookieStore = cookies();
    const authClient = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const admin = createClient(url, service, { auth: { persistSession: false } });

    const insertPayload: any = {
      user_id: userData.user.id,
      nombre_organizacion,
    };
    if (extras && typeof extras === 'object') {
      const allowedOptionalKeys = [
        'razon_social',
        'rut',
        'actividad_economica',
        'direccion',
        'encargado_nombre',
        'encargado_apellido',
      ] as const;
      for (const k of allowedOptionalKeys) {
        const v = (extras as any)[k];
        if (typeof v !== 'undefined' && v !== null && String(v).trim() !== '') {
          insertPayload[k] = v;
        }
      }
    }

    const { data, error } = await admin
      .from('organizaciones')
      .insert(insertPayload)
      .select('*')
      .limit(1);

    if (error) {
      console.error('[api/organizaciones/create] insert error:', { message: error.message, code: (error as any)?.code, details: (error as any)?.details, hint: (error as any)?.hint });
      return NextResponse.json({ error: error.message, code: (error as any)?.code, details: (error as any)?.details, hint: (error as any)?.hint }, { status: 400 });
    }

    return NextResponse.json({ data: data?.[0] || null }, { status: 200 });
  } catch (e: any) {
    console.error('[api/organizaciones/create] exception:', e);
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 });
  }
}
