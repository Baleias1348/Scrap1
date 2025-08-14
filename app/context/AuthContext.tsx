"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';

interface Organization {
  id: string;
  nombre_organizacion: string;
  user_id: string;
  created_at: string;
  // Agrega más campos según sea necesario
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  org: Organization | null;
  setOrg: (org: Organization | null) => void;
  logout: () => Promise<void>;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  signUp: (email: string, password: string, extra?: Record<string, any>) => Promise<{ error: any } | { data: any }>;
  loginWithPassword: (email: string, password: string) => Promise<{ error: any } | { data: any }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Inicializar autenticación
  useEffect(() => {
    // Obtener la sesión actual
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          try {
            // Buscar organización activa
            const { data: orgs, error } = await supabase
              .from("organizaciones")
              .select("*")
              .eq("user_id", currentSession.user.id)
              .order("created_at", { ascending: true });
            
            if (error) throw error;
            
            setOrg(orgs?.[0] || null);
            
            // Guardar token en localStorage para compatibilidad
            if (currentSession.access_token) {
              localStorage.setItem('preventi_token', currentSession.access_token);
            }
          } catch (error) {
            console.error('Error al cargar la organización:', error);
            setOrg(null);
          }
        } else {
          setOrg(null);
          localStorage.removeItem('preventi_token');
        }
        
        setLoading(false);
      }
    );

    // Verificar sesión actual
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Cargar organización si existe
          const { data: orgs, error: orgError } = await supabase
            .from("organizaciones")
            .select("*")
            .eq("user_id", currentSession.user.id)
            .order("created_at", { ascending: true });
            
          if (!orgError && orgs?.[0]) {
            setOrg(orgs[0]);
          }
        } else {
          setSession(null);
          setUser(null);
          setOrg(null);
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Limpiar suscripción al desmontar
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase.auth]);

  // Registro con email/password
  const signUp = async (email: string, password: string, extra?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: extra || {},
        },
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  // Login con email/password
  const loginWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  // Iniciar sesión con Google
  const loginWithGoogle = async (redirectTo: string = '/dashboard'): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('preventi_token');
      setUser(null);
      setSession(null);
      setOrg(null);
      
      // Redirigir a la landing
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  const value: AuthContextProps = {
    user,
    session,
    loading,
    org,
    setOrg,
    logout,
    loginWithGoogle,
    signUp,
    loginWithPassword,
  };


  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextProps {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
