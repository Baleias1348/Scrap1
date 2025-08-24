// --- util: fetch con timeout ---
async function fetchWithTimeout(url: string, init: RequestInit, ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error(`Timeout de ${ms}ms al llamar a ${url}`);
    throw e;
  } finally {
    clearTimeout(id);
  }
}

// --- DEEPSEEK EMBEDDING ---
export async function getDeepseekEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  // URL específica para embeddings (NO usar NEXT_PUBLIC_DEEPSEEK_API_URL porque el usuario puede apuntarla a chat)
  const apiUrl = process.env.NEXT_PUBLIC_DEEPSEEK_EMBED_URL || process.env.DEEPSEEK_EMBED_URL || 'https://api.deepseek.com/v1/embeddings';
  const model = process.env.NEXT_PUBLIC_DEEPSEEK_EMBED_MODEL || process.env.DEEPSEEK_EMBED_MODEL || 'deepseek-embedding';
  if (!apiKey) throw new Error('Falta la variable de entorno NEXT_PUBLIC_DEEPSEEK_API_KEY');

  const body = {
    model,
    input: text
  };
  const res = await fetchWithTimeout(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, 8000);
  if (!res.ok) {
    let errText: string;
    try { errText = JSON.stringify(await res.json()); } catch { errText = await res.text(); }
    throw new Error(`DeepSeek embedding error: ${errText}`);
  }
  const data = await res.json();
  if (data.data && data.data[0]?.embedding) {
    return data.data[0].embedding;
  }
  throw new Error('Respuesta de embedding inesperada de DeepSeek: ' + JSON.stringify(data));
}

// --- DEEPSEEK GENERATE (Chat/Completion) ---
export async function getDeepseekChatCompletion(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_DEEPSEEK_CHAT_URL || 'https://api.deepseek.com/v1/chat/completions';
  // Modelo configurable (permite deepseek-reasoner)
  const model = process.env.NEXT_PUBLIC_DEEPSEEK_CHAT_MODEL || process.env.DEEPSEEK_CHAT_MODEL || 'deepseek-chat';
  const RAW_MODE = (process.env.DEEPSEEK_RAW_MODE || 'false').toLowerCase() === 'true';
  if (!apiKey) throw new Error('Falta la variable de entorno NEXT_PUBLIC_DEEPSEEK_API_KEY');

  const temperature = RAW_MODE && process.env.DEEPSEEK_TEMPERATURE === undefined
    ? undefined
    : Number(process.env.DEEPSEEK_TEMPERATURE ?? 0.2);
  const top_p = RAW_MODE && process.env.DEEPSEEK_TOP_P === undefined
    ? undefined
    : Number(process.env.DEEPSEEK_TOP_P ?? 0.9);
  const frequency_penalty = RAW_MODE && process.env.DEEPSEEK_FREQUENCY_PENALTY === undefined
    ? undefined
    : Number(process.env.DEEPSEEK_FREQUENCY_PENALTY ?? 0.1);
  const presence_penalty = RAW_MODE && process.env.DEEPSEEK_PRESENCE_PENALTY === undefined
    ? undefined
    : Number(process.env.DEEPSEEK_PRESENCE_PENALTY ?? 0);
  const systemPrompt = process.env.DEEPSEEK_SYSTEM_PROMPT || (
    'Eres un asistente experto en normativa laboral y prevención de riesgos en Chile. '
    + 'Responde SIEMPRE en español, de forma concreta y verificable. No te presentes ni saludes. '
    + 'Cita leyes/decretos chilenos cuando corresponda. Si no tienes certeza, di claramente "no tengo información suficiente" y sugiere cómo verificar. '
    + 'Evita inventar datos, nombres o artículos. Formatea con viñetas cuando ayude a la claridad.'
  );

  // Construir payload respetando RAW_MODE
  const messages = RAW_MODE
    ? [ { role: 'user', content: prompt } ]
    : [ { role: 'system', content: systemPrompt }, { role: 'user', content: prompt } ];

  const body: any = { model, messages };
  if (temperature !== undefined) body.temperature = temperature;
  if (top_p !== undefined) body.top_p = top_p;
  if (frequency_penalty !== undefined) body.frequency_penalty = frequency_penalty;
  if (presence_penalty !== undefined) body.presence_penalty = presence_penalty;
  // max_tokens solo si se define o si no estamos en RAW_MODE
  const maxTokensEnv = process.env.DEEPSEEK_MAX_TOKENS;
  if (!RAW_MODE) {
    body.max_tokens = Number(maxTokensEnv || 2000);
  } else if (maxTokensEnv !== undefined) {
    body.max_tokens = Number(maxTokensEnv);
  }
  const timeoutMs = Number(process.env.DEEPSEEK_CHAT_TIMEOUT_MS || (model.includes('reasoner') ? 20000 : 12000));
  const res = await fetchWithTimeout(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, timeoutMs);
  if (!res.ok) {
    let errText: string;
    try { errText = JSON.stringify(await res.json()); } catch { errText = await res.text(); }
    throw new Error(`DeepSeek chat error: ${errText}`);
  }
  const data = await res.json();
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content.trim();
  }
  throw new Error('Respuesta inesperada de DeepSeek chat: ' + JSON.stringify(data));
}
