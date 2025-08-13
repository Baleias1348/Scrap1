// Netlify Function (TypeScript) stub for scraping with Puppeteer.
// Keeps app functional flow; real scraping to be plugged later.
// Temporary until deps installed.

export const config = {
  path: "/.netlify/functions/scrape"
};

type Event = { httpMethod: string; body?: string | null; headers?: Record<string, string> };
type Context = any;

function json(statusCode: number, data: unknown) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data)
  };
}

export async function handler(event: Event, _context: Context) {
  if (event.httpMethod === "GET") {
    return json(200, { ok: true, fn: "scrape", ts: Date.now() });
  }

  if (event.httpMethod === "POST") {
    let payload: any = {};
    try {
      payload = event.body ? JSON.parse(event.body) : {};
    } catch {
      return json(400, { error: "invalid json" });
    }

    // Placeholder execution – simulate a short job and return mocked items.
    const { urls = [], rateMs = 1500 } = payload as { urls: string[]; rateMs?: number };

    // Simulate sequencing with a small delay to mimic respectful scraping pacing
    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const results: Array<{ url: string; ok: boolean; content: string }> = [];

    for (const url of urls.slice(0, 5)) {
      await wait(Math.min(Math.max(rateMs, 200), 2500));
      results.push({
        url,
        ok: true,
        content: `Contenido extraído (simulado) de: ${url}`.repeat(1)
      });
    }

    const id = `job_${Math.random().toString(36).slice(2, 8)}`;
    return json(201, {
      id,
      count: results.length,
      results
    });
  }

  return json(405, { error: "method not allowed" });
}