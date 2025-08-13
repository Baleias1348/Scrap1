"use client";
import { useEffect } from "react";

import { useAuth } from "../context/AuthContext";

export default function DashboardStatic() {
  const { user, loading, org, logout } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  if (!user) {
    // Redirigir a login si no hay sesión
    if (typeof window !== "undefined") {
      window.location.href = "https://preventiflow.com/";
    }
    return <div>Redirigiendo a login...</div>;
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