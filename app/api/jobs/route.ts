// API stub for jobs listing/creation to move UI flows forward before real DB wiring.
// Temporary until deps installed and Supabase is configured.
declare const Request: any;
declare const Response: any;

let MEMORY_JOBS: any[] = [];

export async function GET() {
  return new Response(JSON.stringify({ data: MEMORY_JOBS }), {
    headers: { "content-type": "application/json" }
  });
}

export async function POST(req: any) {
  try {
    const body = await req.json();
    const id = `job_${Math.random().toString(36).slice(2, 8)}`;
    const job = {
      id,
      created_at: new Date().toISOString(),
      source: body?.source || "manual",
      items: 0,
      status: "queued"
    };
    MEMORY_JOBS.unshift(job);
    return new Response(JSON.stringify({ data: job }), {
      headers: { "content-type": "application/json" },
      status: 201
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "invalid json" }), {
      headers: { "content-type": "application/json" },
      status: 400
    });
  }
}