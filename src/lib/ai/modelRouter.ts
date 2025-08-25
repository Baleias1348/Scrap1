export type ModelChoice = {
  model: string; // OpenAI model id
  maxTokens?: number;
};

// Simple heuristic: choose a fast model for short/FAQ queries, deeper model otherwise
export function selectModel(question: string, contextChars: number): ModelChoice {
  const qLen = question.trim().length;
  const isShort = qLen < 180 && contextChars < 4000;
  const hasDocKeywords = /(documento|protocolo|plantilla|informe|matriz|plan de emergencia|anexo)/i.test(question);
  const hasLegalDeepDive = /(análisis|comparativo|jurisprudencia|derogación|concordancias|profund|extensivo)/i.test(question);

  if (!hasDocKeywords && !hasLegalDeepDive && isShort) {
    // Fast path (cheap and quick)
    return { model: 'gpt-4o-mini', maxTokens: 1024 };
  }
  // Deep path
  return { model: 'gpt-4o', maxTokens: 2048 };
}
