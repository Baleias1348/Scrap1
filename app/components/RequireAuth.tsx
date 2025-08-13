"use client";
import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "../../src/lib/supabase";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setAuthed(true);
      } else {
        setAuthed(false);
        router.replace("/login-local");
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="text-center py-24">Verificando autenticación...</div>;
  }
  if (!authed) {
    return null;
  }
  return <>{children}</>;
}
