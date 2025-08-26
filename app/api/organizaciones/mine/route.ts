import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!url || !service) {
      const missing = [] as string[];
      if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!service) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      console.error('[api/organizaciones/mine] missing env', missing);
      return NextResponse.json({ error: 'Supabase no configurado (variables faltantes)', missing }, { status: 500 });
    }
    const cookieStore = cookies();
    const authClient = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const admin = createClient(url, service, { auth: { persistSession: false } });
    const { data, error } = await admin
      .from('organizaciones')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: true })
      .limit(1);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const u = userData.user;
    const urlObj = new URL(req.url);
    const debug = urlObj.searchParams.get('debug');
    const payload: any = { data: data ?? [], user: { id: u.id, email: u.email } };
    if (debug === '1') {
      payload.filters = { user_id: u.id };
      payload.count = (data || []).length;
    }
    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 });
  }
}
