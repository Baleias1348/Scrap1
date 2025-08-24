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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [editorPath, setEditorPath] = useState<string>("");
  const [editorContent, setEditorContent] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

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

  const isFolderPath = (p: string | null) => !!p && folders.some(f => f.path === p);
  const isFilePath = (p: string | null) => !!p && files.some(f => f.path === p);

  const handleOpen = async () => {
    if (!selected) return;
    if (isFolderPath(selected)) return loadTree(selected);
    if (isFilePath(selected)) return previewFile(selected);
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm('¿Eliminar el elemento seleccionado?')) return;
    const res = await fetch('/api/gestion-documental/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: selected, isFolder: isFolderPath(selected) })
    });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || 'Error eliminando'); return; }
    setSelected(null);
    loadTree(path);
  };

  const handleNewFolder = async () => {
    const name = prompt('Nombre de la carpeta');
    if (!name) return;
    const base = path ? (path.endsWith('/') ? path : path + '/') : '';
    const res = await fetch('/api/gestion-documental/mkdir', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: base + name })
    });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || 'Error creando carpeta'); return; }
    loadTree(path);
  };

  const openEditor = async (targetPath: string) => {
    setEditorPath(targetPath);
    setEditorContent('');
    // Para edición, intentamos descargar el contenido si existe
    try {
      const res = await fetch(`/api/plantillas/file?path=${encodeURIComponent(targetPath)}&expiresIn=300`);
      if (res.ok) {
        const { signedUrl } = await res.json();
        const text = await fetch(signedUrl).then(r => r.text());
        setEditorContent(text);
      }
    } catch {}
    setShowEditor(true);
  };

  const handleNewFile = async () => {
    const name = prompt('Nombre del archivo (ej: notas.txt)');
    if (!name) return;
    const base = path ? (path.endsWith('/') ? path : path + '/') : '';
    const full = base + name;
    setEditorPath(full);
    setEditorContent('');
    setShowEditor(true);
  };

  const handleSaveEditor = async () => {
    const res = await fetch('/api/gestion-documental/create-file', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: editorPath, content: editorContent, contentType: 'text/plain; charset=utf-8' })
    });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || 'Error guardando archivo'); return; }
    setShowEditor(false);
    previewFile(editorPath);
    loadTree(path);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('path', path || '');
      form.append('file', file);
      const res = await fetch('/api/gestion-documental/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) { alert(data?.error || 'Error subiendo'); return; }
      loadTree(path);
    } finally {
      setUploading(false);
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

  // Estructura se crea automáticamente en el API si la raíz está vacía

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

  const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" className="text-blue-500"><path fill="currentColor" d="M10 4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h6z"/></svg>
  );
  const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" className="text-gray-500"><path fill="currentColor" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path fill="#fff" d="M14 2v6h6"/></svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-black">📁 Gestión Documental</h1>
            <p className="text-black">Explora y gestiona los documentos de tu organización por categorías. Usa el selector para cambiar de raíz.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-black">Raíz:</span>
          <select className="border rounded px-2 py-1" value={path} onChange={(e) => loadTree(e.target.value)}>
            {roots.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <div className="ml-3 text-sm">{breadcrumb}</div>
          <div className="ml-auto" />
          <div className="ml-4 flex items-center gap-1">
            <button className={`px-2 py-1 border rounded text-sm ${viewMode==='grid' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`} onClick={() => setViewMode('grid')}>Grid</button>
            <button className={`px-2 py-1 border rounded text-sm ${viewMode==='list' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`} onClick={() => setViewMode('list')}>Lista</button>
          </div>
        </div>

        {/* Toolbar dentro de carpeta */}
        <div className="flex items-center gap-2 mb-3 bg-white rounded border p-2">
          <button className="px-3 py-1 border rounded text-sm bg-white hover:bg-blue-50" onClick={handleOpen} disabled={!selected}>Abrir</button>
          <button className="px-3 py-1 border rounded text-sm bg-white hover:bg-blue-50" onClick={() => { if (selected && isFilePath(selected)) openEditor(selected); }} disabled={!selected || !isFilePath(selected)}>Editar</button>
          <button className="px-3 py-1 border rounded text-sm bg-white hover:bg-red-50" onClick={handleDelete} disabled={!selected}>Eliminar</button>
          <div className="mx-2 w-px h-6 bg-gray-200" />
          <button className="px-3 py-1 border rounded text-sm bg-white hover:bg-blue-50" onClick={handleNewFolder}>Nueva carpeta</button>
          <button className="px-3 py-1 border rounded text-sm bg-white hover:bg-blue-50" onClick={handleNewFile}>Nuevo archivo</button>
          <label className="px-3 py-1 border rounded text-sm bg-white hover:bg-blue-50 cursor-pointer">
            Subir archivo
            <input type="file" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) handleUpload(f); e.currentTarget.value=''; }} />
          </label>
          {uploading && <span className="text-sm text-gray-500">Subiendo…</span>}
        </div>

        {loading && <div className="text-gray-500">Cargando…</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white rounded shadow p-3">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {folders.map((fo) => (
                    <div key={fo.path}
                      className={`flex flex-col items-center p-3 rounded cursor-pointer select-none ${selected===fo.path? 'bg-blue-50 ring-2 ring-blue-300' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelected(fo.path)}
                      onDoubleClick={() => loadTree(fo.path)}
                      title={fo.name}
                    >
                      <FolderIcon />
                      <div className="mt-2 text-xs text-center break-words max-w-[120px]">{fo.name}</div>
                    </div>
                  ))}
                  {files.map((fi) => (
                    <div key={fi.path}
                      className={`flex flex-col items-center p-3 rounded cursor-pointer select-none ${selected===fi.path? 'bg-blue-50 ring-2 ring-blue-300' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelected(fi.path)}
                      onDoubleClick={() => previewFile(fi.path)}
                      title={fi.name}
                    >
                      <FileIcon />
                      <div className="mt-2 text-xs text-center break-words max-w-[120px]">{fi.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h2 className="font-semibold text-black mb-2">Carpetas</h2>
                    <ul className="space-y-1">
                      {folders.map((fo) => (
                        <li key={fo.path}>
                          <button className="flex items-center gap-2 text-left hover:bg-blue-50 rounded px-2 py-1 w-full" onClick={() => loadTree(fo.path)}>
                            <span>📁</span>
                            <span>{fo.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="font-semibold text-black mb-2">Archivos</h2>
                    <ul className="space-y-1">
                      {files.map((fi) => (
                        <li key={fi.path} className="flex items-center justify-between gap-2">
                          <button className="flex items-center gap-2 text-left hover:bg-blue-50 rounded px-2 py-1" onClick={() => { setSelected(fi.path); previewFile(fi.path); }}>
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
                </div>
              )}
            </div>
            <div className="md:col-span-1 bg-white rounded shadow p-3">
              <h2 className="font-semibold text-black mb-2">Previsualización</h2>
              {signedUrl ? (
                <iframe src={signedUrl} className="w-full h-96 border rounded" />
              ) : (
                <div className="text-gray-500">Selecciona un archivo para previsualizar</div>
              )}
            </div>
          </div>
        )}

        {/* Modal Editor de texto */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg w-full max-w-3xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900">Editar: {editorPath}</h3>
                <button onClick={()=>setShowEditor(false)} className="text-sm px-2 py-1 border rounded">Cerrar</button>
              </div>
              <textarea value={editorContent} onChange={(e)=>setEditorContent(e.target.value)} className="w-full h-72 border rounded p-2 font-mono text-sm" />
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={()=>setShowEditor(false)} className="px-3 py-1 border rounded">Cancelar</button>
                <button onClick={handleSaveEditor} className="px-3 py-1 border rounded bg-blue-600 text-white">Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
