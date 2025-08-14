import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Supabase Auth en cookies (httpOnly) para SSR/Edge
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/auth', '/api/auth', '/oauth-callback'];
  const isPublicPath = publicPaths.some(publicPath =>
    path === publicPath || path.startsWith(publicPath + '/')
  );
  const isAsset = path.startsWith('/_next') || path.startsWith('/static') || path.startsWith('/public') || path.startsWith('/images');

  // Proteger rutas privadas cuando no hay sesión
  if (!session && !isPublicPath && !isAsset) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya está autenticado y entra a /login, enviarlo al dashboard
  if (session && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return res;
}

// Configuración del middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
