"use client";
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
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
  const [requiresOrgSetup, setRequiresOrgSetup] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();
  // Flags para evitar envíos duplicados y control de cancelación
  const signupInFlight = useRef(false);
  const signupAbortRef = useRef<AbortController | null>(null);
  const loginInFlight = useRef(false);
  const loginAbortRef = useRef<AbortController | null>(null);

  // Normaliza RUT: quita puntos/guiones y convierte DV a mayúscula.
  const normalizeRut = (rut: string): string => {
    try {
      return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    } catch {
      return rut;
    }
  };

  // Helper: timeout para evitar quedarse colgado si una promesa no resuelve
  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        console.error(`[timeout] ${label} excedió ${ms}ms`);
        reject(new Error(`Timeout ${label}`));
      }, ms);
      promise
        .then((val) => { clearTimeout(timer); resolve(val); })
        .catch((err) => { clearTimeout(timer); reject(err); });
    });
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
          // Hasta confirmar org, exigir setup por defecto
          setRequiresOrgSetup(true);
          try {
            // Buscar organización activa vía API interna (usa service role)
            const resp = await withTimeout(
              fetch('/api/organizaciones/mine', { method: 'GET', credentials: 'include' }),
              12000,
              'api/organizaciones/mine'
            );
            const json = await resp.json().catch(() => ({}));
            if (!resp.ok) throw new Error(json?.error || 'No se pudo obtener organizaciones');

            const orgs = Array.isArray(json?.data) ? json.data : [];
            if (!orgs || orgs.length === 0) {
              setOrg(null);
              setRequiresOrgSetup(true);
            } else {
              setOrg(orgs[0] || null);
              setRequiresOrgSetup(false);
            }

            // Guardar token en localStorage para compatibilidad
            if (currentSession.access_token) {
              localStorage.setItem('preventi_token', currentSession.access_token);
            }
          } catch (error) {
            console.error('Error al cargar la organización (API):', error);
            setOrg(null);
            // En caso de error, mantener bloqueo
            setRequiresOrgSetup(true);
          }
        } else {
          setOrg(null);
          localStorage.removeItem('preventi_token');
          // Sin usuario autenticado, no exigimos org
          setRequiresOrgSetup(false);
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
          // Hasta confirmar org en init, exigir setup
          setRequiresOrgSetup(true);
          
          // Cargar organización si existe vía API interna
          try {
            const resp = await withTimeout(
              fetch('/api/organizaciones/mine', { method: 'GET', credentials: 'include' }),
              12000,
              'api/organizaciones/mine:init'
            );
            const json = await resp.json().catch(() => ({}));
            if (resp.ok) {
              const orgs = Array.isArray(json?.data) ? json.data : [];
              if (!orgs || orgs.length === 0) {
                setOrg(null);
                setRequiresOrgSetup(true);
              } else {
                setOrg(orgs[0] || null);
                setRequiresOrgSetup(false);
              }
            }
          } catch (e) {
            console.warn('Init: organizaciones no disponibles todavía:', e);
            // En caso de error, mantener bloqueo
            setRequiresOrgSetup(true);
          }
        } else {
          setSession(null);
          setUser(null);
          setOrg(null);
          setRequiresOrgSetup(false);
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
      // Cancelar cualquier request pendiente en desmontaje
      try { signupAbortRef.current?.abort(); } catch {}
      try { loginAbortRef.current?.abort(); } catch {}
    };
  }, [supabase.auth]);

  // Autologin de desarrollo REMOVIDO: Olivia debe iniciar sesión manualmente (email/contraseña)

  // Registro con email/password
  const signUp = async (email: string, password: string, extra?: Record<string, any>) => {
    try {
      console.log('[Auth] signUp:start', { email });
      if (signupInFlight.current) {
        return { error: { message: 'Operación en curso' } } as any;
      }
      signupInFlight.current = true;
      // Cancelar intento previo si existe
      try { signupAbortRef.current?.abort(); } catch {}
      signupAbortRef.current = new AbortController();
      // Usar API interna para evitar bloqueos del navegador/extensiones
      const resp = await withTimeout(
        fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, extra: extra || {} }),
          signal: signupAbortRef.current.signal,
        }),
        15000,
        'api/auth/signup'
      );
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error('[Auth] signUp:end error', json);
        return { error: { message: json?.error || 'No se pudo registrar.' } } as any;
      }
      console.log('[Auth] signUp:end ok');
      return { data: json?.data, error: null } as any;
    } catch (error) {
      console.error('[Auth] signUp:error', error);
      return { error };
    }
    finally {
      signupInFlight.current = false;
      signupAbortRef.current = null;
    }
  };

  // Login con email/password
  const loginWithPassword = async (email: string, password: string) => {
    try {
      console.log('[Auth] login:start', { email });
      if (loginInFlight.current) {
        return { error: { message: 'Operación en curso' } } as any;
      }
      loginInFlight.current = true;
      // Cancelar intento previo si existe
      try { loginAbortRef.current?.abort(); } catch {}
      loginAbortRef.current = new AbortController();
      const resp = await withTimeout(
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          signal: loginAbortRef.current.signal,
        }),
        15000,
        'api/auth/login'
      );
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error('[Auth] login:end error', { status: resp.status, message: json?.error, code: json?.code });
        return { error: { message: json?.error || 'No se pudo iniciar sesión', code: json?.code } } as any;
      }
      console.log('[Auth] login:end ok');
      return { data: json?.data, error: null } as any;
    } catch (error: any) {
      console.error('[Auth] login:exception', error);
      return { error };
    }
    finally {
      // Mantener un pequeño lock; lo liberamos tras un tick por si el UI intenta reintentar de inmediato
      setTimeout(() => { loginInFlight.current = false; }, 1000);
      loginAbortRef.current = null;
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
      const body: any = { nombre_organizacion, extras: { ...(extras || {}) } };
      if (body.extras?.rut) {
        body.extras.rut = normalizeRut(String(body.extras.rut));
      }
      console.log('[Auth] createOrganization:start', { nombre_organizacion, extras: Object.keys(body.extras || {}) });
      const resp = await withTimeout(
        fetch('/api/organizaciones/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        }),
        15000,
        'api/organizaciones/create'
      );
      console.log('[Auth] createOrganization:resp', { status: resp.status });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const msg = json?.error || 'No se pudo crear la organización';
        console.error('[Auth] createOrganization:error', { status: resp.status, code: json?.code, details: json?.details, hint: json?.hint, msg });
        throw new Error(`${msg} (HTTP ${resp.status}${json?.code ? `, code ${json.code}` : ''})`);
      }
      const created = json?.data || null;
      setOrg(created);
      setRequiresOrgSetup(false);
      console.log('[Auth] createOrganization:ok', { id: created?.id });
      return created;
    } catch (e) {
      console.error('Error creando organización (API):', e);
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
