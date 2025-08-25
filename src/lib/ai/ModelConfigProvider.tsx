"use client";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";
import type { ModelRouterConfig } from "./useModelRouter";

export type ModelConfigContextValue = {
  config: ModelRouterConfig | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const ModelConfigContext = createContext<ModelConfigContextValue | null>(null);

export function ModelConfigProvider({ agentId = "aria", children }: { agentId?: string; children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [config, setConfig] = useState<ModelRouterConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error }: PostgrestSingleResponse<{ config: ModelRouterConfig }[]> = await supabase
        .from("model_config")
        .select("config")
        .eq("id", agentId)
        .limit(1);
      if (error) throw error;
      if (!data || data.length === 0 || !data[0]?.config) {
        setConfig(null);
      } else {
        setConfig(data[0].config);
      }
    } catch (e: any) {
      setError(e?.message || "Error al cargar configuración de modelos");
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, agentId]);

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const value: ModelConfigContextValue = useMemo(() => ({ config, isLoading, error, refresh: fetchConfig }), [config, isLoading, error, fetchConfig]);

  return <ModelConfigContext.Provider value={value}>{children}</ModelConfigContext.Provider>;
}
