"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, loading, org, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (<div className="flex items-center justify-center h-screen">Cargando...</div>);
  }
  if (!user) {
    return null;
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-lg font-semibold mb-2">¡Bienvenido/a, {user.email}!</div>
        <div className="mb-4">Aún no tienes una organización. Por favor créala para continuar.</div>
        <button onClick={logout} className="px-4 py-2 bg-fuchsia-700 text-white rounded">Cerrar sesión</button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="font-bold text-xl">Preventi Flow Dashboard</span>
          <div className="text-sm text-gray-300">Organización activa: <span className="font-semibold">{org.nombre_organizacion || '(Sin nombre)'}</span></div>
        </div>
        <button onClick={logout} className="px-3 py-1 bg-fuchsia-700 text-white rounded">Cerrar sesión</button>
      </div>
      <div className="mt-8 text-gray-200">¡Tu sesión y organización están activas! Integra aquí tus componentes principales.</div>
    </div>
  );
}