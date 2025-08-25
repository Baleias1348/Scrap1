"use client";
import { useEffect, useMemo, useState, useCallback, useContext } from "react";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";
import { ModelConfigContext } from "./ModelConfigProvider";

export type ModelRouterContext = "chat" | "fast_interactions" | "compliance" | "documents" | string;

export type ModelRouterEntry = {
  model: string;
  mode?: "standard" | "streaming";
  description?: string;
};

export type ModelRouterConfig = {
  [k: string]: ModelRouterEntry | undefined;
};

export type UseModelRouterResult = ModelRouterEntry & {
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const DEFAULT_MODEL: ModelRouterEntry = {
  model: "gpt-4.1-turbo",
  mode: "streaming",
  description: "Default model when configuration is unavailable.",
};

export function useModelRouter(context: ModelRouterContext = "chat", agentId = "aria"): UseModelRouterResult {
  // Try to use global provider cache if present
  const ctx = useContext(ModelConfigContext);
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
    if (ctx) {
      // Consume provider values
      setConfig(ctx.config);
      setIsLoading(ctx.isLoading);
      setError(ctx.error);
      return; // Provider will manage refresh
    }
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, ctx?.config, ctx?.isLoading, ctx?.error]);

  const entry: ModelRouterEntry = useMemo(() => {
    const fallback = DEFAULT_MODEL;
    const cfg = config;
    if (!cfg) return fallback;
    const ctx = context || "chat";
    const e = cfg[ctx];
    if (!e || !e.model) return fallback;
    return {
      model: e.model,
      mode: e.mode || fallback.mode,
      description: e.description,
    };
  }, [config, context]);

  return {
    ...entry,
    isLoading: ctx ? ctx.isLoading : isLoading,
    error: ctx ? ctx.error : error,
    refresh: ctx ? ctx.refresh : fetchConfig,
  };
}
