"use client";

import React, { useEffect, useMemo, useState } from "react";

interface TreeItem { name: string; path: string }
interface TreeResp { path: string; folders: TreeItem[]; files: (TreeItem & { size?: number|null, updated_at?: string|null })[] }

type FolderStatus = "red" | "yellow" | "green";

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
  const [statusMap, setStatusMap] = useState<Record<string, FolderStatus>>({});
  const [lastUpdatedMap, setLastUpdatedMap] = useState<Record<string, string | null>>({});
  const [readmeUrls, setReadmeUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string|null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalUrl, setModalUrl] = useState<string>("");

  const [thresholdDays, setThresholdDays] = useState<number>(30);

  useEffect(() => {
    const loadRoot = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/plantillas/tree?path=${encodeURIComponent("/")}`);
        if (!res.ok) throw new Error("No se pudo cargar carpetas");
        const data: TreeResp = await res.json();
        setFolders(data.folders);
        // Cargar conteo, timestamps y README por carpeta
        data.folders.forEach(async (f) => {
          try {
            const r = await fetch(`/api/plantillas/tree?path=${encodeURIComponent(f.path)}`);
            if (r.ok) {
              const dt: TreeResp = await r.json();
              // Excluir archivos de sistema y guía para estado/contador
              const userFiles = (dt.files || []).filter(x => !x.name.endsWith('.keep') && x.name !== 'README.md');
              setCounts(prev => ({ ...prev, [f.path]: userFiles.length }));

              // Calcular última actualización de archivos del usuario
              let lastUpdated: Date | null = null;
              for (const file of userFiles) {
                if (file.updated_at) {
                  const d = new Date(file.updated_at);
                  if (!isNaN(d.getTime())) {
                    if (!lastUpdated || d > lastUpdated) lastUpdated = d;
                  }
                }
              }
              setLastUpdatedMap(prev => ({ ...prev, [f.path]: lastUpdated ? lastUpdated.toISOString() : null }));

              // Obtener URL firmada al README.md si existe
              const tryPaths = [`${f.path}README.md`, `${f.path}README.pdf`];
              for (const p of tryPaths) {
                try {
                  const urlRes = await fetch(`/api/plantillas/file?path=${encodeURIComponent(p)}&expiresIn=600`);
                  if (urlRes.ok) {
                    const j = await urlRes.json();
                    if (j?.signedUrl) {
                      setReadmeUrls(prev => ({ ...prev, [f.path]: j.signedUrl }));
                      break;
                    }
                  }
                } catch {}
              }
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

  // Recalcular estado cuando cambie el umbral o los timestamps
  useEffect(() => {
    const newStatus: Record<string, FolderStatus> = {};
    for (const fp of Object.keys(counts)) {
      const n = counts[fp] ?? 0;
      const iso = lastUpdatedMap[fp];
      if (n === 0) {
        newStatus[fp] = 'red';
        continue;
      }
      if (!iso) {
        newStatus[fp] = 'yellow';
        continue;
      }
      const d = new Date(iso);
      const diffDays = (Date.now() - d.getTime()) / (1000*60*60*24);
      newStatus[fp] = diffDays <= thresholdDays ? 'green' : 'yellow';
    }
    setStatusMap(newStatus);
  }, [counts, lastUpdatedMap, thresholdDays]);

  const fmtDate = (iso?: string | null) => {
    if (!iso) return 'sin fecha';
    try { const d = new Date(iso); return d.toLocaleString(); } catch { return 'sin fecha'; }
  };

  const statusDot = (s?: FolderStatus, iso?: string | null) => {
    const color = s === 'green' ? 'bg-emerald-500' : s === 'yellow' ? 'bg-amber-400' : 'bg-red-500';
    const label = s === 'green' ? 'Actualizada' : s === 'yellow' ? 'Revisar' : 'Vacía';
    return (
      <div className="flex items-center gap-2" title={`Última actualización: ${fmtDate(iso)}`}>
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} aria-label={label}></span>
        <span className="text-xs text-white/70">{label}</span>
      </div>
    );
  };

  const openReadme = (folderPath: string, title: string) => {
    const url = readmeUrls[folderPath];
    if (!url) return; // opcional: toast
    setModalTitle(title);
    setModalUrl(url);
    setModalOpen(true);
  };

  const cards = useMemo(() => folders.map(f => {
    const base = f.name.replace(/\/$/, "");
    const key = base;
    const desc = DESCRIPTIONS[key] || "Carpeta con documentación relevante.";
    const n = counts[f.path] ?? 0;
    const s = statusMap[f.path] || 'red';
    const iso = lastUpdatedMap[f.path] ?? null;
    const hasGuide = !!readmeUrls[f.path];
    return (
      <div key={f.path} className="holo-card rounded-xl p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">{base}</h3>
          <FolderSVG />
        </div>
        <p className="text-sm text-white/70 mt-2">{desc}</p>
        <div className="mt-4 flex items-center justify-between">
          {statusDot(s, iso)}
          <span className="text-xs text-white/60">{n} documentos</span>
        </div>
        <div className="mt-auto flex items-center justify-end gap-2 pt-4">
          {hasGuide && (
            <button onClick={() => openReadme(f.path, base)} className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition">Ver guía</button>
          )}
          <a href={`/dashboard/gestion-documental?path=${encodeURIComponent(f.path)}`} className="text-xs px-3 py-1 rounded bg-[#ff6a00] text-white hover:bg-[#ff8a3b] transition">Abrir</a>
        </div>
      </div>
    );
  }), [folders, counts, statusMap, readmeUrls, lastUpdatedMap]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Documentación</h2>
          <p className="text-sm text-white/60">Vista general de tus carpetas de gestión documental</p>
          <p className="text-xs text-white/40 mt-1">{folders.length} carpetas encontradas</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/60">Umbral:</label>
          <select
            value={thresholdDays}
            onChange={(e) => setThresholdDays(Number(e.target.value))}
            className="bg-transparent border border-white/20 text-white text-xs rounded px-2 py-1 hover:border-white/40 focus:outline-none"
          >
            <option className="bg-[#0b0f1a]" value={15}>15 días</option>
            <option className="bg-[#0b0f1a]" value={30}>30 días</option>
            <option className="bg-[#0b0f1a]" value={60}>60 días</option>
          </select>
        </div>
      </div>
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="holo-card rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-4 w-1/3 bg-white/10 rounded"></div>
                <div className="h-6 w-6 bg-white/10 rounded"></div>
              </div>
              <div className="mt-3 h-3 w-2/3 bg-white/10 rounded"></div>
              <div className="mt-4 flex items-center justify-between">
                <div className="h-3 w-24 bg-white/10 rounded"></div>
                <div className="h-3 w-16 bg-white/10 rounded"></div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <div className="h-7 w-16 bg-white/10 rounded"></div>
                <div className="h-7 w-16 bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && folders.length === 0 && (
        <div className="text-white/60">No se encontraron carpetas en la raíz del bucket.</div>
      )}
      {!loading && !error && folders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[90vw] max-w-4xl bg-[#0b0f1a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold">Guía — {modalTitle}</h3>
              <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-0">
              {modalUrl ? (
                <iframe src={modalUrl} className="w-full h-[70vh]" />
              ) : (
                <div className="p-6 text-white/70">No se pudo cargar la guía.</div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
              <a href={modalUrl} target="_blank" rel="noreferrer" className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition">Abrir en nueva pestaña</a>
              <button onClick={() => setModalOpen(false)} className="text-xs px-3 py-1 rounded bg-[#ff6a00] text-white hover:bg-[#ff8a3b] transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
