"use client";

import React, { useEffect, useState } from "react";

interface TreeItem { name: string; path: string; }
interface TreeResp { path: string; folders: TreeItem[]; files: (TreeItem & { size?: number|null, updated_at?: string|null })[] }

export default function GestionDocumentalPage() {
  const [path, setPath] = useState<string>("");
  const [folders, setFolders] = useState<TreeItem[]>([]);
  const [files, setFiles] = useState<(TreeItem & { size?: number|null, updated_at?: string|null })[]>([]);
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string| null>(null);

  const loadTree = async (p: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/plantillas/tree?path=${encodeURIComponent(p)}`);
      if (!res.ok) throw new Error("No se pudo cargar el árbol");
      const data: TreeResp = await res.json();
      setPath(data.path);
      setFolders(data.folders);
      setFiles(data.files);
    } catch (e: any) {
      setError(e?.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  const previewFile = async (p: string) => {
    setSignedUrl("");
    try {
      const res = await fetch(`/api/plantillas/file?path=${encodeURIComponent(p)}&expiresIn=600`);
      if (!res.ok) throw new Error("No se pudo crear signed URL");
      const data = await res.json();
      setSignedUrl(data.signedUrl);
    } catch (e) {
      setSignedUrl("");
    }
  };

  useEffect(() => {
    // Carga inicial en la raíz del bucket para listar todas las carpetas top-level
    loadTree(path);
  }, []);

  const roots: { value: string; label: string }[] = [
    { value: '', label: 'Todas (raíz)' },
    { value: '01_reglamentos/', label: '01_reglamentos/' },
    { value: '02_afiliacion_y_seguros/', label: '02_afiliacion_y_seguros/' },
    { value: '03_comite_paritario/', label: '03_comite_paritario/' },
    { value: '04_matriz_riesgos/', label: '04_matriz_riesgos/' },
    { value: '05_capacitaciones/', label: '05_capacitaciones/' },
    { value: '06_emergencias/', label: '06_emergencias/' },
    { value: '07_accidentes_enfermedades/', label: '07_accidentes_enfermedades/' },
    { value: '08_trabajadores/', label: '08_trabajadores/' },
    { value: '09_epp/', label: '09_epp/' },
    { value: '10_fiscalizaciones/', label: '10_fiscalizaciones/' },
    { value: '11_equipos_mantenimiento/', label: '11_equipos_mantenimiento/' },
  ];

  const crumbs = path.split("/").filter(Boolean);
  const breadcrumb = crumbs.map((c, i) => {
    const seg = crumbs.slice(0, i + 1).join("/") + "/";
    return (
      <span key={seg} className="text-sm">
        {i > 0 && <span className="mx-1 text-gray-400">/</span>}
        <button className="text-blue-700 hover:underline" onClick={() => loadTree(seg)}>{c}</button>
      </span>
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-blue-900">📁 Gestión Documental</h1>
            <p className="text-gray-700">Explora y gestiona los documentos de tu organización por categorías. Usa el selector para cambiar de raíz.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">Raíz:</span>
          <select className="border rounded px-2 py-1" value={path} onChange={(e) => loadTree(e.target.value)}>
            {roots.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <div className="ml-3 text-sm">{breadcrumb}</div>
        </div>

        {loading && <div className="text-gray-500">Cargando…</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 bg-white rounded shadow p-3">
              <h2 className="font-semibold text-blue-900 mb-2">Carpetas</h2>
              <ul className="space-y-1">
                {folders.map((fo) => (
                  <li key={fo.path}>
                    <button className="flex items-center gap-2 text-left hover:bg-blue-50 rounded px-2 py-1" onClick={() => loadTree(fo.path + "/") }>
                      <span>📁</span>
                      <span>{fo.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-1 bg-white rounded shadow p-3">
              <h2 className="font-semibold text-blue-900 mb-2">Archivos</h2>
              <ul className="space-y-1">
                {files.map((fi) => (
                  <li key={fi.path} className="flex items-center justify-between gap-2">
                    <button className="flex items-center gap-2 text-left hover:bg-blue-50 rounded px-2 py-1" onClick={() => previewFile(fi.path)}>
                      <span>📄</span>
                      <span>{fi.name}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button className="text-xs px-2 py-1 border rounded hover:bg-gray-50" onClick={() => previewFile(fi.path)}>Preview</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-1 bg-white rounded shadow p-3">
              <h2 className="font-semibold text-blue-900 mb-2">Previsualización</h2>
              {signedUrl ? (
                <iframe src={signedUrl} className="w-full h-96 border rounded" />
              ) : (
                <div className="text-gray-500">Selecciona un archivo para previsualizar</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
