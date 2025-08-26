import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Usar service role key para obtener estadísticas administrativas
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

    // Obtener total de usuarios
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('[Admin] Error getting users:', usersError);
      return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
    }

    // Contar usuarios activos (con email confirmado)
    const totalUsers = users.users.length;
    const activeUsers = users.users.filter(user => user.email_confirmed_at).length;

    // Obtener estadísticas de tablas (simulado - en producción usar queries reales)
    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        problematic: 0, // Se calculará dinámicamente
        growth: '+12%' // Simulado
      },
      database: {
        size: '45.2 MB',
        tables: 8,
        records: 1247,
        health: 'healthy'
      },
      system: {
        uptime: '99.9%',
        lastBackup: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      },
      activity: [
        {
          type: 'user_cleanup',
          description: 'Limpieza automática completada',
          details: '2 usuarios problemáticos resueltos',
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
        },
        {
          type: 'user_registered',
          description: 'Nuevo usuario registrado',
          details: 'baleias1348@gmail.com',
          timestamp: new Date(Date.now() - 7200000).toISOString() // 2 horas atrás
        },
        {
          type: 'database_maintenance',
          description: 'Mantenimiento de base de datos',
          details: 'Optimización de índices completada',
          timestamp: new Date(Date.now() - 14400000).toISOString() // 4 horas atrás
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Admin] Stats error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Error interno del servidor' 
    }, { status: 500 });
  }
}