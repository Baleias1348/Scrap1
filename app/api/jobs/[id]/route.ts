// API stub for job detail to progress towards functional flows pre-DB.
// Temporary until deps installed and Supabase is configured.
declare const Request: any;
declare const Response: any;

type Job = {
  id: string;
  created_at: string;
  source: string;
  items: number;
  status: "queued" | "running" | "done" | "error";
};

// In-memory mirror (will not persist across server restarts). In real impl use Supabase.
const MEMORY_JOBS_REF: { current: Job[] } = { current: [] };

// Helper to sync with top-level jobs store if running in same process (Next server).
// This tries to import the list from the parent route module if available.
async function getJobsArray(): Promise<Job[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const parent = require("../route");
    // If parent exposes MEMORY_JOBS, use it; otherwise fall back to local ref.
    if (parent && Array.isArray(parent.MEMORY_JOBS)) {
      MEMORY_JOBS_REF.current = parent.MEMORY_JOBS as Job[];
    }
  } catch {
    // ignore require error in editor before deps
  }
  return MEMORY_JOBS_REF.current;
}

export async function GET(_req: any, ctx: any) {
  const { id } = ctx?.params || {};
  const jobs = await getJobsArray();
  const job = jobs.find((j) => j.id === id);
  if (!job) {
    return new Response(JSON.stringify({ error: "not found" }), {
      headers: { "content-type": "application/json" },
      status: 404
    });
  }
  return new Response(JSON.stringify({ data: job }), {
    headers: { "content-type": "application/json" }
  });
}

export async function PATCH(req: any, ctx: any) {
  const { id } = ctx?.params || {};
  const payload = await req.json().catch(() => ({}));
  const jobs = await getJobsArray();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) {
    return new Response(JSON.stringify({ error: "not found" }), {
      headers: { "content-type": "application/json" },
      status: 404
    });
    }
  const prev = jobs[idx];
  const next = {
    ...prev,
    ...payload,
    id: prev.id
  } as Job;
  jobs[idx] = next;
  return new Response(JSON.stringify({ data: next }), {
    headers: { "content-type": "application/json" }
  });
}