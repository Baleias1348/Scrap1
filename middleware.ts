import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Supabase Auth en cookies (httpOnly) para SSR/Edge
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // Solo proteger rutas privadas (ejemplo: dashboard)
  const isDashboard = path.startsWith('/dashboard');
  const isAsset = path.startsWith('/_next') || path.startsWith('/static') || path.startsWith('/public') || path.startsWith('/images');

  // Si no hay sesión y es dashboard, redirigir a landing
  if (!session && isDashboard && !isAsset) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return res;
}

// Configuración del middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
