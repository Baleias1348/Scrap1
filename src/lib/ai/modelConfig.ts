export type UseCaseKey = 'chat' | 'fast_interactions' | 'compliance' | 'documents' | string;

export type ModelConfig = {
  [k in UseCaseKey]?: {
    model: string;
    mode?: 'streaming' | 'standard';
    description?: string;
  }
};

export async function fetchModelConfig(supabase: any, agentId = 'aria'): Promise<ModelConfig | null> {
  const { data, error } = await supabase
    .from('model_config')
    .select('config')
    .eq('id', agentId)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return (data[0] as any).config as ModelConfig;
}

export function getModelForUseCase(config: ModelConfig | null, useCase: UseCaseKey, fallbackModel: string): { model: string; mode?: 'streaming' | 'standard' } {
  if (config && config[useCase]?.model) {
    const entry = config[useCase]!;
    return { model: entry.model, mode: entry.mode };
  }
  return { model: fallbackModel, mode: 'streaming' };
}

// Map deprecated/legacy model names to currently available OpenAI models
export function normalizeModelName(name: string): string {
  const n = (name || '').toLowerCase();
  const map: Record<string, string> = {
    'gpt-4.1-turbo': 'gpt-4o',
    'gpt-4.1': 'gpt-4o',
    'gpt-4.1-mini': 'gpt-4o-mini',
    'gpt-4-turbo': 'gpt-4o',
    'gpt-4': 'gpt-4o',
    'gpt-o1-mini': 'o3-mini',
    'o1-mini': 'o3-mini'
  };
  return map[n] || name;
}
