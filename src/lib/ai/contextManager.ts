// Minimal in-memory context manager with rolling summaries per session
// NOTE: For serverless environments this is ephemeral; replace with Redis/Supabase KV for persistence.

type SessionState = {
  summary: string; // rolling summary of prior turns
  lastUpdated: number;
};

const SESSIONS = new Map<string, SessionState>();

export function getSessionSummary(sessionId: string): string | null {
  const s = SESSIONS.get(sessionId);
  return s?.summary || null;
}

export function updateSessionSummary(sessionId: string, newText: string) {
  const prev = SESSIONS.get(sessionId)?.summary || '';
  const merged = (prev + '\n' + newText).trim();
  const compact = limitText(merged, 4000); // keep short for speed
  SESSIONS.set(sessionId, { summary: compact, lastUpdated: Date.now() });
}

export function setSessionSummary(sessionId: string, summary: string) {
  SESSIONS.set(sessionId, { summary: limitText(summary, 4000), lastUpdated: Date.now() });
}

function limitText(txt: string, maxChars: number): string {
  if (!txt) return '';
  return txt.length <= maxChars ? txt : txt.slice(-maxChars);
}
