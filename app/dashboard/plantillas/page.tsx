"use client";
import React, { useEffect, useState } from "react";

interface TreeItem { name: string; path: string; }
interface TreeResp { path: string; folders: TreeItem[]; files: (TreeItem & { size?: number|null, updated_at?: string|null })[] }

export default function PlantillasPage() {
  const [path, setPath] = useState<string>("12_plantillas/");
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
      setError(e?.message || "Error cargando árbol");
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

  useEffect(() => { loadTree(path); }, []);

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-blue-900">📁 Plantillas y Buenas Prácticas</h1>
            <div className="mb-2">{breadcrumb}</div>
            <p className="text-gray-700">Navega las carpetas y previsualiza archivos. Puedes personalizar con AI o copiar a tus carpetas.</p>
          </div>
          <a href="/dashboard/documentos-modelo" className="px-3 py-2 bg-white border rounded hover:bg-blue-50 text-blue-700">Documentos Modelo →</a>
        </div>

        {loading && <div className="text-gray-500">Cargando...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 bg-white rounded shadow p-3">
              <h2 className="font-semibold text-blue-900 mb-2">Carpetas</h2>
              <ul className="space-y-1">
                {folders.map((f) => (
                  <li key={f.path}>
                    <button className="flex items-center gap-2 text-left w-full hover:bg-blue-50 rounded px-2 py-1" onClick={() => loadTree(f.path)}>
                      <span>📂</span>
                      <span>{f.name}</span>
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
