import { useState, useCallback } from 'react';

export interface LegalFragment {
  id?: string | number;
  content: string;
  source?: string; // e.g., "DS 40, Artículo 5"
  meta?: Record<string, any>;
}

export interface LegalResponse {
  text: string;
  usedContext: LegalFragment[];
  transparency: 'from_supabase' | 'no_internal_context' | 'general_only';
}

export function useLegalQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (query: string): Promise<LegalResponse> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/legal/standard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return data as LegalResponse;
    } catch (e: any) {
      setError(e?.message || 'Error');
      return { text: `Error: ${e?.message || 'Error'}`, usedContext: [], transparency: 'general_only' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { ask, loading, error };
}
