// Minimal API route placeholders to make app functional before real persistence/scraping.
// Temporary until deps installed
declare const Request: any;
declare const Response: any;

export async function GET() {
  // Health check / ping endpoint
  return new Response(JSON.stringify({ ok: true, service: "scraping-hub", ts: Date.now() }), {
    headers: { "content-type": "application/json" }
  });
}

export async function POST(req: any) {
  // Accepts a job creation payload (stub)
  try {
    const data = await req.json();
    const id = `job_${Math.random().toString(36).slice(2, 8)}`;
    return new Response(JSON.stringify({ id, received: data, status: "queued" }), {
      headers: { "content-type": "application/json" },
      status: 201
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "invalid json" }), { status: 400 });
  }
}