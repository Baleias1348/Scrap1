"use client";
import React, { useState } from "react";

import { useRouter } from "next/navigation";

export default function LoginLocalPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { getSupabaseClient } = await import("../../src/lib/supabase");
      const supabase = getSupabaseClient();
      if (isRegister) {
        // Registro explícito
        if (!supabase.auth || typeof supabase.auth.signUp !== "function") {
          setError("Error: Supabase Auth no está correctamente inicializado o la función signUp no está disponible. Verifica la versión instalada de @supabase/supabase-js.");
          setLoading(false);
          return;
        }
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError("No se pudo registrar: " + signUpError.message);
        } else {
          setSuccess("Usuario registrado. Revisa tu correo para confirmar y luego inicia sesión.");
          setIsRegister(false);
        }
      } else {
        // Intentar login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          if (error.message.toLowerCase().includes("invalid login") || error.message.toLowerCase().includes("user not found")) {
            setError("Usuario o contraseña incorrectos. Si no tienes cuenta, regístrate.");
          } else {
            setError(error.message);
          }
        } else if (data?.user) {
          setSuccess("Login exitoso. Redirigiendo al dashboard...");
          localStorage.setItem("local_login", "1");
          setTimeout(() => router.replace("/dashboard"), 1200);
        } else {
          setError("No se pudo iniciar sesión. Intenta de nuevo.");
        }
      }
    } catch (err: any) {
      setError("Error inesperado: " + (err?.message || err));
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xs mx-auto mt-24 p-8 bg-white rounded shadow text-gray-900">
      <h1 className="text-2xl font-bold mb-6">{isRegister ? "Registro de Usuario" : "Login Local (Desarrollo)"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 text-white font-semibold"
          disabled={loading}
        >
          {loading ? (isRegister ? "Registrando..." : "Ingresando...") : (isRegister ? "Registrarse" : "Ingresar")}
        </button>
        <button
          type="button"
          className="w-full py-2 rounded bg-gray-300 text-gray-800 font-semibold mt-2"
          onClick={() => { setIsRegister(r => !r); setError(""); setSuccess(""); }}
          disabled={loading}
        >
          {isRegister ? "¿Ya tienes cuenta? Ingresar" : "¿No tienes cuenta? Regístrate"}
        </button>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      <p className="text-xs text-gray-400 mt-4">Este login utiliza Supabase Auth y permite registro local para pruebas.</p>
    </div>
  );
}
