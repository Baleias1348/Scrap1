import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('preventi_token')?.value;
  
  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/auth', '/api/auth'];
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + '/')
  );

  // Si el usuario no está autenticado y está intentando acceder a una ruta protegida
  if (!token && !isPublicPath && !path.startsWith('/_next') && !path.startsWith('/static')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está autenticado y está en la página de login, redirigir al dashboard
  if (token && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configuración del middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
