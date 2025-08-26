import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { email, password, extra } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    if (!url || !anon) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
    }

    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    console.log(`[Signup] Attempting signup for: ${email}`);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: extra || {} },
    });

    if (error) {
      console.error(`[Signup] Error for ${email}:`, error);
      
      // Manejar errores específicos
      if (error.message.includes('User already registered')) {
        return NextResponse.json({ 
          error: 'Este email ya está registrado. Intenta iniciar sesión o usa la opción "¿Olvidaste tu contraseña?"',
          code: 'user_already_exists'
        }, { status: 400 });
      }
      
      if (error.message.includes('Password')) {
        return NextResponse.json({ 
          error: 'La contraseña debe tener al menos 6 caracteres',
          code: 'weak_password'
        }, { status: 400 });
      }
      
      if (error.message.includes('email')) {
        return NextResponse.json({ 
          error: 'El formato del email no es válido',
          code: 'invalid_email'
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: error.message,
        code: error.code || 'signup_error'
      }, { status: 400 });
    }

    console.log(`[Signup] Success for: ${email}`);
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    console.error('[Signup] Exception:', e);
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 });
  }
}
