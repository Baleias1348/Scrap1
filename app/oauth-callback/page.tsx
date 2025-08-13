"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Extraer el access_token del hash de la URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");
    if (token) {
      // Guardar el token en localStorage (ajusta la clave si tu contexto usa otra)
      localStorage.setItem("supabase.auth.token", token);
      // Opcional: fuerza recarga de sesión en contexto global si lo necesitas
      router.replace("/dashboard");
    } else {
      // Manejar error o redirigir a login
      router.replace("/login?error=oauth");
    }
  }, [router]);

  return <div>Procesando autenticación...</div>;
}
