export type PromptInputs = {
  question: string;
  constitution: string;
  metadata?: {
    principles?: string[];
    legal_focus?: string[];
  } | null;
  context?: string;
};

// Build a compact prompt: constitution (trimmed), metadata bullets, optional context, then question
export function buildPrompt({ question, constitution, metadata, context }: PromptInputs): string {
  const parts: string[] = [];
  parts.push('Eres el asistente A.R.I.A. Responde en español, de forma profesional, precisa y accionable.');
  parts.push(limitText(constitution?.trim() || '', 6000));

  const metaLines: string[] = [];
  if (metadata?.principles?.length) metaLines.push(`Principios: ${metadata.principles.join(', ')}`);
  if (metadata?.legal_focus?.length) metaLines.push(`Enfoque legal: ${metadata.legal_focus.join(', ')}`);
  if (metaLines.length) parts.push(metaLines.join('\n'));

  if (context) parts.push(`Contexto relevante:\n${limitText(context, 3000)}`);

  parts.push(`Pregunta del usuario:\n${question}`);
  parts.push('Responde citando fuentes normativas chilenas (BCN/Diario Oficial) cuando corresponda.');
  return parts.filter(Boolean).join('\n\n');
}

export function limitText(txt: string, maxChars: number): string {
  if (!txt) return '';
  if (txt.length <= maxChars) return txt;
  return txt.slice(0, maxChars - 20) + '\n[...]';
}
