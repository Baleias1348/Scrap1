"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Crear cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Evitar prerenderizado estático
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, loading, org, logout, session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const handleTokenAuth = async () => {
      if (token && !user) {
        try {
          // Guardar el token en localStorage para que el AuthContext lo detecte
          localStorage.setItem('preventi_token', token);
          
          // Forzar recarga para que el AuthContext procese el token
          window.location.href = '/dashboard-index';
          return;
        } catch (error) {
          console.error('Error al procesar token:', error);
          router.push('/login');
          return;
        }
      }
      
      // Si no hay token pero tampoco hay usuario, redirigir a login
      if (!user) {
        router.push('/login');
      }
    };

    handleTokenAuth();
  }, [token, user, router]);
  
  // Renderizar solo en el cliente
  if (!isClient) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (loading || !isClient) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  
  if (!user) {
    // Usar window.location para redirección segura en el cliente
    if (typeof window !== 'undefined') {
      window.location.href = 'https://preventiflow.com/';
      return <div>Redirigiendo a login...</div>;
    }
    return null;
  }
  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-lg font-semibold mb-2">¡Bienvenido/a, {user.email}!</div>
        <div className="mb-4">Aún no tienes una organización. Por favor créala para continuar.</div>
        {/* Aquí puedes agregar un formulario o componente para crear/seleccionar organización */}
        <button onClick={logout} className="px-4 py-2 bg-fuchsia-700 text-white rounded">Cerrar sesión</button>
      </div>
    );
  }

  // Si todo está OK, mostrar dashboard real (aquí va tu contenido React)
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="font-bold text-xl">Preventi Flow Dashboard</span>
          <div className="text-sm text-gray-300">Organización activa: <span className="font-semibold">{org.nombre || org.razon_social || '(Sin nombre)'}</span></div>
        </div>
        <button onClick={logout} className="px-3 py-1 bg-fuchsia-700 text-white rounded">Cerrar sesión</button>
      </div>
      {/* Aquí puedes renderizar el resto del dashboard, chat, menús, etc. */}
      <div className="mt-8 text-gray-200">¡Tu sesión y organización están activas! Integra aquí tus componentes principales.</div>
    </div>
  );
}