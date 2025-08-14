"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="text-center py-24">Verificando autenticación...</div>;
  }

  if (!user) {
    if (typeof window !== "undefined") {
      router.replace("/login");
    }
    return null;
  }

  return <>{children}</>;
}
