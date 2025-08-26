import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    // Usar service role key para operaciones administrativas
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    if (action === 'cleanup') {
      console.log(`[Admin] Cleaning up user: ${email}`);
      
      // 1. Buscar usuario por email en auth.users
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('[Admin] Error listing users:', listError);
        return NextResponse.json({ error: 'Error al listar usuarios' }, { status: 500 });
      }

      const userToDelete = users.users.find(u => u.email === email);
      
      if (userToDelete) {
        console.log(`[Admin] Found user to delete: ${userToDelete.id}`);
        
        // 2. Eliminar de tablas relacionadas primero
        try {
          // Eliminar organizaciones del usuario
          await supabaseAdmin
            .from('organizaciones')
            .delete()
            .eq('user_id', userToDelete.id);
          
          // Eliminar interacciones del usuario
          await supabaseAdmin
            .from('interacciones')
            .delete()
            .eq('user_id', userToDelete.id);
          
          console.log(`[Admin] Cleaned up related data for user: ${userToDelete.id}`);
        } catch (cleanupError) {
          console.warn('[Admin] Warning during cleanup:', cleanupError);
          // Continuar aunque haya errores en limpieza
        }
        
        // 3. Eliminar usuario de auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
        
        if (deleteError) {
          console.error('[Admin] Error deleting user:', deleteError);
          return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }
        
        console.log(`[Admin] Successfully deleted user: ${email}`);
        return NextResponse.json({ 
          message: 'Usuario eliminado completamente',
          deletedUserId: userToDelete.id 
        });
      } else {
        console.log(`[Admin] User not found in auth: ${email}`);
        return NextResponse.json({ 
          message: 'Usuario no encontrado en auth',
          email 
        });
      }
    }

    if (action === 'check') {
      // Verificar estado del usuario
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        return NextResponse.json({ error: 'Error al verificar usuarios' }, { status: 500 });
      }

      const userExists = users.users.find(u => u.email === email);
      
      return NextResponse.json({ 
        exists: !!userExists,
        user: userExists ? {
          id: userExists.id,
          email: userExists.email,
          created_at: userExists.created_at,
          email_confirmed_at: userExists.email_confirmed_at
        } : null
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    
  } catch (e: any) {
    console.error('[Admin] Error:', e);
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 });
  }
}