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
  const isAsset =
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.startsWith('/public') ||
    path.startsWith('/images');

  // Debug (no expone tokens). Útil para verificar cookies en Netlify
  const hasSbAccess = request.cookies.get('sb-access-token') !== undefined;
  const hasSbRefresh = request.cookies.get('sb-refresh-token') !== undefined;
  const debugStr = `p=${path}; session=${!!session}; cA=${hasSbAccess ? '1' : '0'}; cR=${hasSbRefresh ? '1' : '0'}`;
  try { console.log('[MW]', debugStr); } catch {}
  res.headers.set('x-debug-auth', debugStr);

  // [DEV ONLY] Protección de autenticación desactivada para pruebas locales.
  // if (!session && isDashboard && !isAsset) {
  //   const url = new URL('/', request.url);
  //   const redirectRes = NextResponse.redirect(url);
  //   redirectRes.headers.set('x-debug-auth', debugStr);
  //   return redirectRes;
  // }

  return res;
}

// Configuración del middleware
export const config = {
  // Limitar el middleware solo al dashboard para evitar efectos colaterales
  matcher: ['/dashboard/:path*'],
};
