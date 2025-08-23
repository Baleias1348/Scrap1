"use client";

import React, { useEffect, useMemo, useState } from "react";

interface TreeItem { name: string; path: string }
interface TreeResp { path: string; folders: TreeItem[]; files: (TreeItem & { size?: number|null, updated_at?: string|null })[] }

// Mapeo simple de descripciones por carpeta conocida
const DESCRIPTIONS: Record<string, string> = {
  "01_reglamentos": "Reglamentos internos y políticas clave.",
  "02_afiliacion_y_seguros": "Afiliación, seguros y cotizaciones.",
  "03_comite_paritario": "Comité paritario y actas.",
  "04_matriz_riesgos": "Identificación de peligros y matrices.",
  "05_capacitaciones": "Plan y registros de capacitación.",
  "06_emergencias": "Planes y procedimientos de emergencia.",
  "07_accidentes_enfermedades": "Investigaciones y reportes de incidentes.",
  "08_trabajadores": "Documentos del personal y contratos.",
  "09_epp": "Entrega y control de EPP.",
  "10_fiscalizaciones": "Fiscalizaciones y respuestas.",
  "11_equipos_mantenimiento": "Mantenimiento de equipos e inspecciones.",
};

function FolderSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff6a00]">
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>
    </svg>
  );
}

export default function Documentacion() {
  const [folders, setFolders] = useState<TreeItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    const loadRoot = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/plantillas/tree?path=${encodeURIComponent("")}`);
        if (!res.ok) throw new Error("No se pudo cargar carpetas");
        const data: TreeResp = await res.json();
        setFolders(data.folders);
        // Cargar conteo de archivos por carpeta
        data.folders.forEach(async (f) => {
          try {
            const r = await fetch(`/api/plantillas/tree?path=${encodeURIComponent(f.path)}`);
            if (r.ok) {
              const dt: TreeResp = await r.json();
              setCounts(prev => ({ ...prev, [f.path]: dt.files.length }));
            }
          } catch {}
        });
      } catch (e: any) {
        setError(e?.message || "Error al cargar");
      } finally {
        setLoading(false);
      }
    };
    loadRoot();
  }, []);

  const cards = useMemo(() => folders.map(f => {
    const base = f.name.replace(/\/$/, "");
    const key = base;
    const desc = DESCRIPTIONS[key] || "Carpeta con documentación relevante.";
    const n = counts[f.path] ?? 0;
    return (
      <div key={f.path} className="holo-card rounded-xl p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">{base}</h3>
          <FolderSVG />
        </div>
        <p className="text-sm text-white/70 mt-2">{desc}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xs text-white/60">{n} documentos</span>
          <a href={`/dashboard/gestion-documental?path=${encodeURIComponent(f.path)}`} className="text-xs px-3 py-1 rounded bg-[#ff6a00] text-white hover:bg-[#ff8a3b] transition">Abrir</a>
        </div>
      </div>
    );
  }), [folders, counts]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Documentación</h2>
          <p className="text-sm text-white/60">Vista general de tus carpetas de gestión documental</p>
        </div>
      </div>
      {loading && <div className="text-white/70">Cargando…</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards}
        </div>
      )}
    </div>
  );
}
