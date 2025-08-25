"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const { getSupabaseClient } = await import("../../src/lib/supabase");
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message || "No se pudo actualizar la contraseña.");
      } else {
        setSuccess("Contraseña actualizada correctamente. Redirigiendo al dashboard...");
        setTimeout(() => router.replace("/dashboard"), 1200);
      }
    } catch (e: any) {
      setError(e?.message || "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md glass-form rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Restablecer contraseña</h1>
        <p className="text-sm text-white/70 mb-4 text-center">
          Ingresa tu nueva contraseña.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/70">Nueva contraseña</label>
            <input
              type="password"
              className="form-input w-full mt-1 rounded-md p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Confirmar contraseña</label>
            <input
              type="password"
              className="form-input w-full mt-1 rounded-md p-2"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error && <div className="text-red-400 text-center">{error}</div>}
          {success && <div className="text-emerald-400 text-center">{success}</div>}
          <button
            type="submit"
            className="w-full bg-[#ff6a00] hover:bg-[#ff8129] text-white font-bold py-2 rounded-lg transition"
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
        <style jsx global>{`
          .glass-form { background: rgba(10,10,10,0.4); backdrop-filter: blur(16px); border: 1px solid rgba(255,106,0,0.2); }
          .form-input { background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
          .form-input:focus { outline: none; border-color: #ff6a00; box-shadow: 0 0 0 2px rgba(255,106,0,0.3); }
        `}</style>
      </div>
    </div>
  );
}
