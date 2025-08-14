"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Página legacy no usada con el flujo actual (PKCE + /auth/callback).
// Mantener solo como compatibilidad por si un proveedor antiguo redirige con hash.
export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    // Si llegan tokens en el hash desde un flujo implícito, redirigir al login moderno.
    if (params.get("access_token") || params.get("refresh_token")) {
      router.replace("/login?error=deprecated_flow");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return <div>Redirigiendo...</div>;
}
