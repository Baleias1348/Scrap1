// Client-side helper to invoke Netlify scraping function and Next API stubs.
// Temporary until real integration with Supabase and server actions.

export async function createJobStub(payload: any) {
  const res = await fetch("/api/jobs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload || {})
  });
  if (!res.ok) throw new Error("No se pudo crear el trabajo");
  return res.json();
}

export async function listJobsStub() {
  const res = await fetch("/api/jobs", { method: "GET" });
  if (!res.ok) throw new Error("No se pudo listar trabajos");
  return res.json();
}

export async function callScrapeFn(urls: string[], rateMs = 1500) {
  const endpoint = "/.netlify/functions/scrape";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ urls, rateMs })
  });
  if (!res.ok) throw new Error("Fallo la función de scraping");
  return res.json();
}