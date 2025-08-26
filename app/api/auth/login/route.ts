import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    console.log(`[Login] Attempting login for: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error(`[Login] Error for ${email}:`, error);
      
      // Manejar errores específicos
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json({ 
          error: 'Email o contraseña incorrectos. Verifica tus credenciales e intenta nuevamente.',
          code: 'invalid_credentials'
        }, { status: 400 });
      }
      
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json({ 
          error: 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.',
          code: 'email_not_confirmed'
        }, { status: 400 });
      }
      
      if (error.message.includes('Too many requests')) {
        return NextResponse.json({ 
          error: 'Demasiados intentos fallidos. Espera unos minutos antes de intentar nuevamente.',
          code: 'too_many_requests'
        }, { status: 429 });
      }
      
      return NextResponse.json({ 
        error: error.message, 
        code: (error as any)?.code || 'login_error'
      }, { status: 400 });
    }

    console.log(`[Login] Success for: ${email}`);
    // data.session contiene access_token/refresh_token; cookies se setean vía helper
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    console.error('[Login] Exception:', e);
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 });
  }
}
