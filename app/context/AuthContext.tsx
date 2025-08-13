"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSupabaseClient } from "../../src/lib/supabase";

interface AuthContextProps {
  user: any;
  session: any;
  loading: boolean;
  org: any;
  setOrg: (org: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  // Detectar token en URL o localStorage
  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      let token = null;
      // 1. URL param
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        token = params.get("token");
        if (token) {
          localStorage.setItem("preventi_token", token);
        } else {
          token = localStorage.getItem("preventi_token");
        }
      }
      if (token) {
        // Set session from token
        await supabase.auth.setSession({ access_token: token, refresh_token: token });
      }
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      // Buscar organización activa
      if (session?.user) {
        const { data: orgs } = await supabase
          .from("organizaciones")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: true });
        setOrg(orgs?.[0] || null);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("preventi_token");
    setUser(null);
    setSession(null);
    setOrg(null);
    if (typeof window !== "undefined") {
      window.location.href = "https://preventiflow.com/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, org, setOrg, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
