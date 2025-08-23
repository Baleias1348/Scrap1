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
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  // Modal Personalizar con AI
  const [openAIModal, setOpenAIModal] = useState(false);
  const [empresaRubro, setEmpresaRubro] = useState("");
  const [empresaTamano, setEmpresaTamano] = useState("");
  const [empresaRegion, setEmpresaRegion] = useState("");
  const [extraReq, setExtraReq] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string>("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSave, setAiSave] = useState(false);
  const [aiIdTrabajador, setAiIdTrabajador] = useState<string>("");
  const [aiTipoDocumento, setAiTipoDocumento] = useState<string>("");
  // Modal Guardar en mi empresa
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [saveIdTrabajador, setSaveIdTrabajador] = useState<string>("");
  const [saveTipoDocumento, setSaveTipoDocumento] = useState<string>("");
  const [saveDestPath, setSaveDestPath] = useState<string>("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const openAIModalFor = (p: string) => {
    setSelectedFile(p);
    setAiError(null);
    setAiText("");
    setOpenAIModal(true);
  };

  const runPersonalizarAI = async () => {
    if (!selectedFile) return;
    setAiLoading(true);
    setAiError(null);
    setAiText("");
    try {
      const body: any = {
        template_path: selectedFile,
        empresa: { rubro: empresaRubro || undefined, tamano: empresaTamano || undefined, region: empresaRegion || undefined },
        extra_requisitos: extraReq || undefined,
        save: aiSave || undefined,
      };
      if (aiSave && aiIdTrabajador && aiTipoDocumento) {
        body.id_trabajador = Number(aiIdTrabajador);
        body.tipo_documento = aiTipoDocumento;
      }
      const res = await fetch('/api/plantillas/personalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error en personalización');
      setAiText(data.adapted_text || '');
    } catch (err: any) {
      setAiError(err?.message || 'Error al personalizar');
    } finally {
      setAiLoading(false);
    }
  };

  const openSaveModalFor = (p: string) => {
    setSelectedFile(p);
    setSaveError(null);
    setOpenSaveModal(true);
  };

  const runGuardarCopia = async () => {
    if (!selectedFile) return;
    setSaveLoading(true);
    setSaveError(null);
    try {
      const body: any = { template_path: selectedFile };
      if (saveDestPath) body.dest_path = saveDestPath;
      if (saveIdTrabajador) body.id_trabajador = Number(saveIdTrabajador);
      if (saveTipoDocumento) body.tipo_documento = saveTipoDocumento;
      const res = await fetch('/api/plantillas/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error al guardar copia');
      setOpenSaveModal(false);
    } catch (err: any) {
      setSaveError(err?.message || 'Error al guardar');
    } finally {
      setSaveLoading(false);
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
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-black">📁 Plantillas y Buenas Prácticas</h1>
            <div className="mb-2">{breadcrumb}</div>
            <p className="text-black">Navega las carpetas y previsualiza archivos. Puedes personalizar con AI o copiar a tus carpetas.</p>
          </div>
          <a href="/dashboard/documentos-modelo" className="px-3 py-2 bg-white border rounded hover:bg-blue-50 text-blue-700">Documentos Modelo →</a>
        </div>

        {loading && <div className="text-black">Cargando...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 bg-white rounded shadow p-3">
              <h2 className="font-semibold text-black mb-2">Carpetas</h2>
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
              <h2 className="font-semibold text-black mb-2">Archivos</h2>
              <ul className="space-y-1">
                {files.map((fi) => (
                  <li key={fi.path} className="flex items-center justify-between gap-2">
                    <button className="flex items-center gap-2 text-left hover:bg-blue-50 rounded px-2 py-1" onClick={() => { setSelectedFile(fi.path); previewFile(fi.path); }}>
                      <span>📄</span>
                      <span>{fi.name}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button className="text-xs px-2 py-1 border rounded hover:bg-gray-50" onClick={() => previewFile(fi.path)}>Preview</button>
                      <button className="text-xs px-2 py-1 border rounded hover:bg-gray-50" onClick={() => openAIModalFor(fi.path)}>AI</button>
                      <button className="text-xs px-2 py-1 border rounded hover:bg-gray-50" onClick={() => openSaveModalFor(fi.path)}>Guardar</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-1 bg-white rounded shadow p-3">
              <h2 className="font-semibold text-black mb-2">Previsualización</h2>
              {signedUrl ? (
                <iframe src={signedUrl} className="w-full h-96 border rounded" />
              ) : (
                <div className="text-black">Selecciona un archivo para previsualizar</div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Personalizar con AI */}
        <Modal open={openAIModal} onClose={() => setOpenAIModal(false)} title="Personalizar con AI">
          <div className="space-y-3 text-black">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label className="text-sm">
                Rubro
                <input className="mt-1 w-full border rounded px-2 py-1" value={empresaRubro} onChange={e => setEmpresaRubro(e.target.value)} placeholder="Ej: Construcción" />
              </label>
              <label className="text-sm">
                Tamaño
                <input className="mt-1 w-full border rounded px-2 py-1" value={empresaTamano} onChange={e => setEmpresaTamano(e.target.value)} placeholder="Ej: PyME" />
              </label>
              <label className="text-sm">
                Región
                <input className="mt-1 w-full border rounded px-2 py-1" value={empresaRegion} onChange={e => setEmpresaRegion(e.target.value)} placeholder="Ej: RM" />
              </label>
            </div>
            <label className="text-sm block">
              Requisitos extra
              <textarea className="mt-1 w-full border rounded px-2 py-1" rows={3} value={extraReq} onChange={e => setExtraReq(e.target.value)} placeholder="Puntos específicos a considerar" />
            </label>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={aiSave} onChange={e => setAiSave(e.target.checked)} /> Guardar como documento del trabajador
              </label>
              <input className="border rounded px-2 py-1 text-sm" style={{width:'10rem'}} placeholder="ID Trabajador" value={aiIdTrabajador} onChange={e => setAiIdTrabajador(e.target.value)} disabled={!aiSave} />
              <input className="border rounded px-2 py-1 text-sm" style={{width:'12rem'}} placeholder="Tipo documento" value={aiTipoDocumento} onChange={e => setAiTipoDocumento(e.target.value)} disabled={!aiSave} />
            </div>

            {aiError && <div className="text-sm text-red-600">{aiError}</div>}
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-blue-700 text-white rounded disabled:opacity-60" onClick={runPersonalizarAI} disabled={aiLoading}>
                {aiLoading ? 'Generando…' : 'Personalizar'}
              </button>
              <button className="px-3 py-1 border rounded" onClick={() => setOpenAIModal(false)}>Cerrar</button>
            </div>

            {aiText && (
              <div>
                <h4 className="font-semibold text-sm text-black mb-1">Resultado</h4>
                <textarea className="w-full h-56 border rounded px-2 py-1 text-sm" value={aiText} readOnly />
              </div>
            )}
          </div>
        </Modal>

        {/* Modal: Guardar en mi empresa */}
        <Modal open={openSaveModal} onClose={() => setOpenSaveModal(false)} title="Guardar en mi empresa">
          <div className="space-y-3 text-black">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label className="text-sm">
                ID Trabajador
                <input className="mt-1 w-full border rounded px-2 py-1" value={saveIdTrabajador} onChange={e => setSaveIdTrabajador(e.target.value)} placeholder="Ej: 123" />
              </label>
              <label className="text-sm">
                Tipo documento
                <input className="mt-1 w-full border rounded px-2 py-1" value={saveTipoDocumento} onChange={e => setSaveTipoDocumento(e.target.value)} placeholder="Ej: Reglamento Interno" />
              </label>
              <label className="text-sm">
                Destino (opcional)
                <input className="mt-1 w-full border rounded px-2 py-1" value={saveDestPath} onChange={e => setSaveDestPath(e.target.value)} placeholder="Ej: 08_trabajadores/123/docs/" />
              </label>
            </div>

            {saveError && <div className="text-sm text-red-600">{saveError}</div>}
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-blue-700 text-white rounded disabled:opacity-60" onClick={runGuardarCopia} disabled={saveLoading}>
                {saveLoading ? 'Guardando…' : 'Guardar'}
              </button>
              <button className="px-3 py-1 border rounded" onClick={() => setOpenSaveModal(false)}>Cerrar</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

// Modales simples embebidos
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-blue-900">{title}</h3>
          <button className="text-sm text-gray-600" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Inyectar modales dentro del árbol JSX principal con Portals sería ideal; por simplicidad se añaden al final del archivo.
