import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (!code) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    // Redirigir al destino final con sesión persistida en cookie httpOnly
    return NextResponse.redirect(new URL(next, request.url));
  } catch (_err) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'exchange_failed');
    return NextResponse.redirect(loginUrl);
  }
}
