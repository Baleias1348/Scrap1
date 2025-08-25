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
  requiresOrgSetup: boolean;
  createOrganization: (payload: { nombre_organizacion: string; extras?: Record<string, any> }) => Promise<Organization | null>;
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
  const [requiresOrgSetup, setRequiresOrgSetup] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Normaliza RUT: quita puntos/guiones y convierte DV a mayúscula.
  const normalizeRut = (rut: string): string => {
    try {
      return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    } catch {
      return rut;
    }
  };

  // Inicializar autenticación
  useEffect(() => {
    // Obtener la sesión actual
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        // Persistir trazabilidad del último usuario para depuración/aislamiento
        try {
          if (typeof window !== 'undefined') {
            if (currentSession?.user) {
              localStorage.setItem('preventi_last_user_id', currentSession.user.id);
              localStorage.setItem('preventi_last_user_email', currentSession.user.email || '');
            } else {
              localStorage.removeItem('preventi_last_user_id');
              localStorage.removeItem('preventi_last_user_email');
            }
          }
        } catch {}
        
        if (currentSession?.user) {
          try {
            // Buscar organización activa
            const { data: orgs, error } = await supabase
              .from("organizaciones")
              .select("*")
              .eq("user_id", currentSession.user.id)
              .order("created_at", { ascending: true });
            
            if (error) throw error;
            
            // Si no hay organizaciones, forzar creación vía UI (modal)
            if (!orgs || orgs.length === 0) {
              setOrg(null);
              setRequiresOrgSetup(true);
            } else {
              setOrg(orgs?.[0] || null);
              setRequiresOrgSetup(false);
            }
            
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
            
          if (!orgError) {
            if (!orgs || orgs.length === 0) {
              setOrg(null);
              setRequiresOrgSetup(true);
            } else {
              setOrg(orgs[0]);
              setRequiresOrgSetup(false);
            }
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

  // Autologin de desarrollo REMOVIDO: Olivia debe iniciar sesión manualmente (email/contraseña)

  // Registro con email/password
  const signUp = async (email: string, password: string, extra?: Record<string, any>) => {
    try {
      // Asegurar que no quede una sesión previa (p.ej. Olivia) antes de registrar
      try { await supabase.auth.signOut(); } catch {}
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
      setRequiresOrgSetup(false);
      
      // Redirigir a la landing
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  // Crear organización explícitamente (primera vez)
  const createOrganization = async ({ nombre_organizacion, extras }: { nombre_organizacion: string; extras?: Record<string, any> }): Promise<Organization | null> => {
    if (!user) return null;
    try {
      const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : undefined;
      const payload: any = {
        user_id: user.id,
        nombre_organizacion,
      };
      if (id) payload.id = id;
      // Incluir campos opcionales conocidos si vienen en extras
      const allowedOptionalKeys = [
        'razon_social',
        'rut',
        'actividad_economica',
        'direccion',
        'encargado_nombre',
        'encargado_apellido',
      ] as const;
      if (extras && typeof extras === 'object') {
        for (const k of allowedOptionalKeys) {
          const v = (extras as any)[k];
          if (typeof v !== 'undefined' && v !== null && String(v).trim() !== '') {
            if (k === 'rut') {
              (payload as any)[k] = normalizeRut(String(v));
            } else {
              (payload as any)[k] = v;
            }
          }
        }
      }
      const { data, error } = await supabase
        .from('organizaciones')
        .insert(payload)
        .select('*')
        .limit(1);
      if (error) throw error;
      const created = data?.[0] || null;
      setOrg(created);
      setRequiresOrgSetup(false);
      return created;
    } catch (e) {
      console.error('Error creando organización:', e);
      throw e;
    }
  };

  const value: AuthContextProps = {
    user,
    session,
    loading,
    org,
    setOrg,
    requiresOrgSetup,
    createOrganization,
    logout,
    loginWithGoogle,
    signUp,
    loginWithPassword,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextProps {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
