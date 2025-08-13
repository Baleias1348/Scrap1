"use client";
import React, { useState, FormEvent } from "react";

const STRATEGIES = [
  { value: "universal", label: "Universal" },
  { value: "leychile", label: "LeyChile (ejemplo)" },
];

export default function ScraperForm() {
  const [urls, setUrls] = useState("");
  const [strategy, setStrategy] = useState("universal");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");
    setError("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy,
          urls: urls.split("\n").map((u) => u.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOutput(data.output);
      } else {
        setError(data.error || "Error al ejecutar el scraping");
        setOutput(data.output || "");
      }
    } catch (err) {
      setError("Error de conexión con el backend");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto">
      {loading && (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-blue-600 font-medium">Procesando scraping...</span>
        </div>
      )}
      {output && !loading && (
        <div className="bg-green-100 text-green-800 rounded p-2 mb-2 text-sm">Scraping finalizado correctamente.</div>
      )}
      {error && !loading && (
        <div className="bg-red-100 text-red-800 rounded p-2 mb-2 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded space-y-4">
      <h2 className="text-lg font-bold">Lanzar Scraping</h2>
      <div>
        <label className="block font-medium">URLs (una por línea)</label>
        <textarea
          className="w-full border rounded p-2"
          rows={4}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium">Estrategia</label>
        <select
          className="w-full border rounded p-2"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
        >
          {STRATEGIES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Procesando..." : "Lanzar Scraping"}
      </button>
      {output && (
        <pre className="bg-gray-100 p-2 rounded text-sm mt-2">{output}</pre>
      )}
      {error && (
        <div className="text-red-600 mt-2">{error}</div>
      )}
    </form>
  </div>
  );
}
