"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { useAuth } from "../context/AuthContext";

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
  const { org } = useAuth();
  // Aislar documentación bajo orgs/<orgId>/ (las carpetas 01_..11_ viven aquí)
  const basePrefix = org?.id ? `orgs/${org.id}/` : '';
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
  const [modalText, setModalText] = useState<string>("");
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const [thresholdDays, setThresholdDays] = useState<number>(30);

  // Estado para abrir carpeta dentro del canvas
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null);
  const [selectedFolderTitle, setSelectedFolderTitle] = useState<string>("");
  const [folderFiles, setFolderFiles] = useState<(TreeItem & { size?: number|null, updated_at?: string|null })[]>([]);
  const [childFolders, setChildFolders] = useState<TreeItem[]>([]);
  const [loadingFolder, setLoadingFolder] = useState<boolean>(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [previewingFile, setPreviewingFile] = useState<TreeItem & { size?: number|null, updated_at?: string|null } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string>("");
  const [previewRetry, setPreviewRetry] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<TreeItem | null>(null);
  // Estado de preview Excel (solo lectura)
  const [xlsRows, setXlsRows] = useState<any[] | null>(null);
  const [xlsSheetName, setXlsSheetName] = useState<string | null>(null);
  const [xlsAllSheets, setXlsAllSheets] = useState<string[] | null>(null);

  useEffect(() => {
    const loadRoot = async () => {
      setLoading(true); setError(null);
      try {
        const url = basePrefix
          ? `/api/plantillas/tree?basePrefix=${encodeURIComponent(basePrefix)}`
          : `/api/plantillas/tree?path=${encodeURIComponent("")}`; // listar raíz del bucket cuando no hay organización
        const res = await fetch(url);
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

  const isImage = (nameOrUrl?: string | null) => {
    if (!nameOrUrl) return false;
    const n = nameOrUrl.toLowerCase();
    return n.endsWith('.png') || n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.webp') || n.endsWith('.gif');
  };

  const isPdf = (nameOrUrl?: string | null) => {
    if (!nameOrUrl) return false;
    return nameOrUrl.toLowerCase().endsWith('.pdf');
  };

  const isVideo = (nameOrUrl?: string | null) => {
    if (!nameOrUrl) return false;
    const n = nameOrUrl.toLowerCase();
    return n.endsWith('.mp4') || n.endsWith('.webm') || n.endsWith('.ogg');
  };

  const isAudio = (nameOrUrl?: string | null) => {
    if (!nameOrUrl) return false;
    const n = nameOrUrl.toLowerCase();
    return n.endsWith('.mp3') || n.endsWith('.wav') || n.endsWith('.ogg');
  };
    loadRoot();
  }, [basePrefix]);

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

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    try {
      const res = await fetch('/api/gestion-documental/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: (fileToDelete as any).path, isFolder: false })
      });
      if (!res.ok) throw new Error('No se pudo eliminar el archivo');
      // refrescar lista
      await openFolderInCanvas(selectedFolderPath!, selectedFolderTitle);
      // limpiar preview si era el archivo eliminado
      if (previewingFile && previewingFile.path === (fileToDelete as any).path) {
        setPreviewingFile(null);
        setPreviewUrl("");
        setPreviewText("");
        setIsEditing(false);
      }
      setConfirmDeleteOpen(false);
      setFileToDelete(null);
    } catch (e: any) {
      setFolderError(e?.message || 'Error eliminando archivo');
    }
  };

  const goBack = async () => {
    if (!selectedFolderPath) { setSelectedFolderPath(null); return; }
    const trimmed = selectedFolderPath.replace(/\/$/, '');
    const parts = trimmed.split('/');
    parts.pop(); // remove current folder
    if (parts.length === 0) {
      // back to root
      setSelectedFolderPath(null);
      setPreviewingFile(null);
      setIsEditing(false);
      return;
    }
    const parentPath = parts.join('/') + '/';
    const parentTitle = parts[parts.length - 1] || '';
    // Si el padre coincide con basePrefix (orgs/<id>/), volvemos a la vista raíz (tarjetas)
    if (basePrefix && parentPath === basePrefix) {
      setSelectedFolderPath(null);
      setPreviewingFile(null);
      setIsEditing(false);
      return;
    }
    await openFolderInCanvas(parentPath, parentTitle);
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

  const openReadme = async (folderPath: string, title: string) => {
    setModalTitle(title);
    setModalText("");
    setModalLoading(true);
    setModalOpen(true);
    try {
      // Siempre obtener una URL firmada fresca para evitar caché
      let freshUrl = "";
      const tryPaths = [`${folderPath}README.md`, `${folderPath}README.pdf`, `${folderPath}README.txt`];
      for (const p of tryPaths) {
        try {
          const urlRes = await fetch(`/api/plantillas/file?path=${encodeURIComponent(p)}&expiresIn=600&_=${Date.now()}`, { cache: 'no-store' });
          if (urlRes.ok) {
            const j = await urlRes.json();
            if (j?.signedUrl) { freshUrl = j.signedUrl; break; }
          }
        } catch {}
      }
      // Si no existe README aún, forzamos auto-bootstrap por organización y reintentamos una vez
      if (!freshUrl) {
        try {
          const bp = basePrefix || '';
          if (bp) {
            await fetch(`/api/plantillas/tree?basePrefix=${encodeURIComponent(bp)}`, { cache: 'no-store' }).catch(() => {});
            for (const p of tryPaths) {
              try {
                const urlRes = await fetch(`/api/plantillas/file?path=${encodeURIComponent(p)}&expiresIn=600&_=${Date.now()}`, { cache: 'no-store' });
                if (urlRes.ok) {
                  const j = await urlRes.json();
                  if (j?.signedUrl) { freshUrl = j.signedUrl; break; }
                }
              } catch {}
            }
          }
        } catch {}
      }
      setModalUrl(freshUrl || "");
      if (!freshUrl) {
        setModalText("");
        return;
      }
      // Si es markdown o texto, lo cargamos y renderizamos con MarkdownRenderer
      const lower = freshUrl.toLowerCase();
      const isMd = lower.includes('readme.md');
      const isTxt = lower.endsWith('.txt');
      if (isMd || isTxt) {
        const resp = await fetch(`${freshUrl}${freshUrl.includes('?') ? '&' : '?'}cb=${Date.now()}`, { cache: 'no-store' });
        const txt = await resp.text();
        setModalText(txt);
      } else {
        setModalText("");
      }
    } catch {
      setModalText("");
    } finally {
      setModalLoading(false);
    }
  };

  // Abrir carpeta dentro del canvas
  const openFolderInCanvas = async (folderPath: string, title: string) => {
    setSelectedFolderPath(folderPath);
    setSelectedFolderTitle(title);
    setPreviewingFile(null);
    setPreviewUrl("");
    setIsEditing(false);
    setEditingContent("");
    setFolderError(null);
    setLoadingFolder(true);
    try {
      // Forzar auto-bootstrap inteligente por organización invocando el árbol raíz (idempotente)
      if (basePrefix) {
        await fetch(`/api/plantillas/tree?basePrefix=${encodeURIComponent(basePrefix)}`, { cache: 'no-store' }).catch(() => {});
      }
      // Listar archivos de la carpeta
      const r = await fetch(`/api/plantillas/tree?path=${encodeURIComponent(folderPath)}`);
      if (!r.ok) throw new Error('No se pudo listar la carpeta');
      const dt: TreeResp = await r.json();
      // Carpetas hijas
      setChildFolders(dt.folders || []);
      // Excluir .keep
      const files = (dt.files || []).filter(x => x.name !== '.keep');
      setFolderFiles(files);
    } catch (e: any) {
      setFolderError(e?.message || 'Error al abrir la carpeta');
    } finally {
      setLoadingFolder(false);
    }
  };

  const getSignedUrl = async (path: string, expiresIn = 600) => {
    const urlRes = await fetch(`/api/plantillas/file?path=${encodeURIComponent(path)}&expiresIn=${expiresIn}&_=${Date.now()}`, { cache: 'no-store' });
    if (!urlRes.ok) throw new Error('No se pudo obtener URL firmada');
    const j = await urlRes.json();
    return j?.signedUrl as string;
  };

  const handleFileClick = async (file: TreeItem & { size?: number|null, updated_at?: string|null }) => {
    try {
      setPreviewError(null);
      setPreviewingFile(file);
      setIsEditing(false);
      setEditingContent("");
      setPreviewText("");
      setXlsRows(null); setXlsSheetName(null); setXlsAllSheets(null);
      // Reiniciar contador de reintento de preview
      setPreviewRetry(0);
      // Priorizar visores tabulares (Excel/CSV) para un clic
      if (isExcel(file.name)) {
        const sUrl = await getSignedUrl(file.path, 900);
        const resp = await fetch(sUrl);
        const ab = await resp.arrayBuffer();
        const XLSX = await import('xlsx');
        const wb = XLSX.read(ab, { type: 'array' });
        const first = wb.SheetNames[0];
        const sheet = wb.Sheets[first];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        setPreviewUrl("");
        setXlsAllSheets(wb.SheetNames);
        setXlsSheetName(first);
        setXlsRows(rows as any[]);
      } else if (isCsv(file.name)) {
        const sUrl = await getSignedUrl(file.path, 900);
        const resp = await fetch(sUrl);
        const ab = await resp.arrayBuffer();
        const XLSX = await import('xlsx');
        const wb = XLSX.read(ab, { type: 'array' });
        const first = wb.SheetNames[0];
        const sheet = wb.Sheets[first];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        setPreviewUrl("");
        setXlsAllSheets(wb.SheetNames);
        setXlsSheetName(first);
        setXlsRows(rows as any[]);
      } else if (isEditable(file.name)) {
        const sUrl = await getSignedUrl(file.path, 900);
        const resp = await fetch(sUrl);
        const text = await resp.text();
        setPreviewUrl("");
        setPreviewText(text);
      } else {
        const sUrl = await getSignedUrl(file.path);
        setPreviewUrl(sUrl);
      }
    } catch (e: any) {
      console.error('Preview error:', e);
      setFolderError(`No se pudo previsualizar el archivo${e?.message ? `: ${e.message}` : ''}`);
    }
  };

  const isEditable = (name: string) => {
    const lower = name.toLowerCase();
    return ['.md', '.txt', '.csv', '.json', '.html', '.css', '.js', '.ts'].some(ext => lower.endsWith(ext));
  };

  const isExcel = (name: string) => {
    const lower = name.toLowerCase();
    return lower.endsWith('.xlsx') || lower.endsWith('.xls');
  };

  const isCsv = (name: string) => {
    return name.toLowerCase().endsWith('.csv');
  };

  const isMarkdown = (nameOrUrl?: string | null) => {
    if (!nameOrUrl) return false;
    return nameOrUrl.toLowerCase().endsWith('.md') || nameOrUrl.toLowerCase().includes('readme.md');
  };

  const contentTypeFromName = (name: string): string => {
    const n = name.toLowerCase();
    if (n.endsWith('.md')) return 'text/markdown; charset=utf-8';
    if (n.endsWith('.txt')) return 'text/plain; charset=utf-8';
    if (n.endsWith('.csv')) return 'text/csv; charset=utf-8';
    if (n.endsWith('.json')) return 'application/json; charset=utf-8';
    if (n.endsWith('.html')) return 'text/html; charset=utf-8';
    if (n.endsWith('.css')) return 'text/css; charset=utf-8';
    if (n.endsWith('.js')) return 'application/javascript; charset=utf-8';
    if (n.endsWith('.ts')) return 'application/typescript; charset=utf-8';
    if (n.endsWith('.xml')) return 'application/xml; charset=utf-8';
    if (n.endsWith('.pdf')) return 'application/pdf';
    if (n.endsWith('.png')) return 'image/png';
    if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
    if (n.endsWith('.webp')) return 'image/webp';
    return 'application/octet-stream';
  };

  const handleFileDoubleClick = async (file: TreeItem & { size?: number|null, updated_at?: string|null }) => {
    if (!isEditable(file.name)) {
      // Si no es editable, abrimos preview normal
      return handleFileClick(file);
    }
    try {
      const sUrl = await getSignedUrl(file.path, 900);
      const resp = await fetch(sUrl);
      const text = await resp.text();
      setPreviewingFile(file);
      setPreviewUrl("");
      setPreviewText("");
      setIsEditing(true);
      setEditingContent(text);
    } catch (e) {
      setFolderError('No se pudo abrir el editor');
    }
  };


  const handleSave = async () => {
    if (!previewingFile || !isEditing) return;
    setSaving(true);
    try {
      const res = await fetch('/api/gestion-documental/create-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: previewingFile.path,
          content: editingContent,
          contentType: contentTypeFromName(previewingFile.name),
        })
      });
      if (!res.ok) throw new Error('No se pudo guardar');
      // refrescar lista y previsualización
      await openFolderInCanvas(selectedFolderPath!, selectedFolderTitle);
      await handleFileClick(previewingFile);
      setIsEditing(false);
    } catch (e: any) {
      setFolderError(e?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setIsEditing(false);
    setEditingContent("");
  };

  // Acciones: Crear carpeta / Crear archivo / Subir archivo
  const handleCreateFolder = async () => {
    if (!selectedFolderPath) return;
    const name = prompt('Nombre de la carpeta nueva:');
    if (!name) return;
    const base = selectedFolderPath.endsWith('/') ? selectedFolderPath : selectedFolderPath + '/';
    try {
      const res = await fetch('/api/gestion-documental/mkdir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: base + name })
      });
      if (!res.ok) throw new Error('No se pudo crear la carpeta');
      await openFolderInCanvas(selectedFolderPath, selectedFolderTitle);
    } catch (e: any) {
      setFolderError(e?.message || 'Error creando carpeta');
    }
  };

  const handleCreateFile = async () => {
    if (!selectedFolderPath) return;
    const name = prompt('Nombre del archivo nuevo (ej: notas.md):');
    if (!name) return;
    const base = selectedFolderPath.endsWith('/') ? selectedFolderPath : selectedFolderPath + '/';
    try {
      const res = await fetch('/api/gestion-documental/create-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: base + name, content: '', contentType: contentTypeFromName(name) })
      });
      if (!res.ok) throw new Error('No se pudo crear el archivo');
      await openFolderInCanvas(selectedFolderPath, selectedFolderTitle);
    } catch (e: any) {
      setFolderError(e?.message || 'Error creando archivo');
    }
  };

  const triggerUpload = () => {
    uploadInputRef.current?.click();
  };

  const handleUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFolderPath) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.set('path', selectedFolderPath);
      form.set('file', file);
      const res = await fetch('/api/gestion-documental/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('No se pudo subir el archivo');
      await openFolderInCanvas(selectedFolderPath, selectedFolderTitle);
    } catch (e: any) {
      setFolderError(e?.message || 'Error subiendo archivo');
    } finally {
      setUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
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
          <button onClick={() => openReadme(f.path, base)} className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition">Ver guía</button>
          <button onClick={() => openFolderInCanvas(f.path, base)} className="text-xs px-3 py-1 rounded bg-[#ff6a00] text-white hover:bg-[#ff8a3b] transition">Abrir</button>
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

      {confirmDeleteOpen && fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[92vw] max-w-md bg-[#0b0f1a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-white/10">
              <h4 className="text-white font-semibold text-sm">Eliminar archivo</h4>
            </div>
            <div className="p-4 text-sm text-white/80">
              <p className="mb-2">¿Seguro que deseas eliminar el archivo <span className="font-mono">{fileToDelete.name}</span>? Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
              <button onClick={() => { setConfirmDeleteOpen(false); setFileToDelete(null); }} className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition">Cancelar</button>
              <button onClick={handleDeleteFile} className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition">Eliminar</button>
            </div>
          </div>
        </div>
      )}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && folders.length === 0 && (
        <div className="text-white/60">No se encontraron carpetas en la raíz del bucket.</div>
      )}
      {!loading && !error && !selectedFolderPath && folders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards}
        </div>
      )}

      {/* Vista de carpeta abierta en canvas */}
      {selectedFolderPath && (
        <div className="holo-card rounded-xl p-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedFolderTitle}</h3>
              <p className="text-xs text-white/60">
                {(() => {
                  const sp = selectedFolderPath || '';
                  const rel = basePrefix ? sp.replace(basePrefix, '') : sp;
                  return rel || '';
                })()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition" onClick={handleCreateFolder}>Crear carpeta</button>
              <button className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition" onClick={handleCreateFile}>Crear archivo</button>
              <button disabled={uploading} className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition disabled:opacity-50" onClick={triggerUpload}>{uploading ? 'Subiendo...' : 'Subir archivo'}</button>
              <input ref={uploadInputRef} type="file" className="hidden" onChange={handleUploadChange} />
              <button className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition" onClick={goBack}>Volver</button>
            </div>
          </div>

          {folderError && <div className="text-red-400 text-sm mb-2">{folderError}</div>}
          {loadingFolder ? (
            <div className="text-white/60 text-sm">Cargando carpeta...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Lista de archivos */}
              <div className="lg:col-span-1">
                <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/10 text-xs text-white/60">Archivos</div>
                  <ul className="max-h-[60vh] overflow-y-auto divide-y divide-white/5">
                    {childFolders.map(cf => (
                      <li key={cf.path} className="px-3 py-2 text-sm flex items-center justify-between hover:bg-white/5">
                        <button
                          className="text-left truncate flex-1 pr-2 font-medium text-white"
                          title={cf.name}
                          onClick={() => openFolderInCanvas(cf.path, cf.name.replace(/\/$/, ''))}
                        >
                          📁 {cf.name.replace(/\/$/, '')}
                        </button>
                        <div className="flex items-center gap-2 text-white/60">→</div>
                      </li>
                    ))}
                    {folderFiles.map(f => (
                      <li key={f.path} className="px-3 py-2 text-sm flex items-center justify-between hover:bg-white/5">
                        <button
                          className="text-left truncate flex-1 pr-2"
                          title={f.name}
                          onClick={() => handleFileClick(f)}
                          onDoubleClick={() => handleFileDoubleClick(f)}
                        >
                          {f.name}
                        </button>
                        <div className="flex items-center gap-2">
                          <a
                            className="text-xs text-white/60 hover:text-white"
                            title="Descargar"
                            href={`#`}
                            onClick={async (e) => { e.preventDefault(); try { const s = await getSignedUrl(f.path); window.open(s, '_blank'); } catch {} }}
                          >⬇️</a>
                        </div>
                      </li>
                    ))}
                    {childFolders.length === 0 && folderFiles.length === 0 && (
                      <li className="px-3 py-3 text-sm text-white/60">No hay archivos ni subcarpetas</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Panel de previsualización / edición */}
              <div className="lg:col-span-2">
                <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                    <div className="text-xs text-white/60 truncate">
                      {previewingFile ? previewingFile.name : isEditing ? 'Editor' : 'Selecciona un archivo'}
                    </div>
                    <div className="flex items-center gap-2">
                      {previewingFile && !isEditing && previewUrl && (
                        <a className="text-xs px-2 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition" href={previewUrl} target="_blank" rel="noreferrer">Abrir pestaña</a>
                      )}
                      {previewingFile && !isEditing && (
                        <button className="text-xs px-2 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition" onClick={async () => { try { const s = await getSignedUrl(previewingFile.path); window.open(s, '_blank'); } catch {} }}>Descargar</button>
                      )}
                      {previewingFile && !isEditing && (isExcel(previewingFile.name) || isCsv(previewingFile.name)) && xlsRows && (
                        <button className="text-xs px-2 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition" onClick={async () => {
                          try {
                            const sUrl = await getSignedUrl(previewingFile.path, 900);
                            const resp = await fetch(sUrl);
                            const ab = await resp.arrayBuffer();
                            const XLSX = await import('xlsx');
                            const wb = XLSX.read(ab);
                            const sheet = xlsSheetName ? wb.Sheets[xlsSheetName] : wb.Sheets[wb.SheetNames[0]];
                            const csv = XLSX.utils.sheet_to_csv(sheet);
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = (previewingFile.name.replace(/\.(xlsx|xls|csv)$/i, '') + '.csv');
                            a.click();
                            URL.revokeObjectURL(url);
                          } catch {}
                        }}>Exportar CSV</button>
                      )}
                      {previewingFile && !isEditing && (
                        <button className="text-xs px-2 py-1 rounded border border-red-400/40 text-red-300 hover:bg-red-500/10 transition" onClick={() => { setFileToDelete(previewingFile); setConfirmDeleteOpen(true); }}>Eliminar</button>
                      )}
                      {previewingFile && !isEditing && (
                        <button className="text-xs px-2 py-1 rounded bg-[#ff6a00] text-white hover:bg-[#ff8a3b] transition" onClick={() => isEditable(previewingFile.name) ? handleFileDoubleClick(previewingFile) : null}>Editar</button>
                      )}
                      {isEditing && (
                        <>
                          <button disabled={saving} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition disabled:opacity-50" onClick={handleSave}>{saving ? 'Guardando...' : 'Guardar'}</button>
                          <button disabled={saving} className="text-xs px-2 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition disabled:opacity-50" onClick={handleDiscard}>Descartar</button>
                          {previewingFile && (
                            <button disabled={saving} className="text-xs px-2 py-1 rounded border border-white/20 text-white hover:bg-white/10 transition" onClick={async () => { try { const s = await getSignedUrl(previewingFile.path); window.open(s, '_blank'); } catch {} }}>Descargar</button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-0">
                    {isEditing ? (
                      <textarea className="w-full h-[60vh] bg-transparent p-3 text-sm outline-none text-white" value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
                    ) : previewText ? (
                      isMarkdown(previewingFile?.name) ? (
                        <div className="w-full h-[60vh] overflow-auto bg-transparent p-3 text-base leading-7">
                          <MarkdownRenderer content={previewText} theme="dark" />
                        </div>
                      ) : (
                        <pre className="w-full h-[60vh] overflow-auto bg-transparent p-3 text-base leading-7 text-white whitespace-pre-wrap">{previewText}</pre>
                      )
                    ) : xlsRows ? (
                      <div className="w-full h-[60vh] overflow-auto text-sm">
                        <div className="flex items-center gap-2 p-2 border-b border-white/10">
                          <span className="text-xs text-white/60">Hoja:</span>
                          <select value={xlsSheetName || ''} onChange={async (e) => {
                            const name = e.target.value; setXlsSheetName(name);
                            try {
                              if (!previewingFile) return;
                              const sUrl = await getSignedUrl(previewingFile.path, 900);
                              const resp = await fetch(sUrl);
                              const ab = await resp.arrayBuffer();
                              const XLSX = await import('xlsx');
                              const wb = XLSX.read(ab);
                              const sheet = wb.Sheets[name];
                              const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                              setXlsRows(rows as any[]);
                            } catch {}
                          }} className="bg-transparent border border-white/20 text-white text-xs rounded px-2 py-1">
                            {(xlsAllSheets || []).map(s => (
                              <option className="bg-[#0b0f1a]" key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="p-2">
                          <table className="min-w-full text-xs text-white/90">
                            <tbody>
                              {(xlsRows as any[]).map((row, idx) => (
                                <tr key={idx} className={idx === 0 ? 'font-semibold' : ''}>
                                  {(row || []).map((cell: any, cidx: number) => (
                                    <td key={cidx} className="border border-white/10 px-2 py-1 align-top whitespace-pre-wrap">{String(cell ?? '')}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : previewUrl ? (
                      (() => {
                        const name = previewingFile?.name || previewUrl;
                        const commonProps = { className: 'w-full h-[60vh]' } as any;
                        const onErr = async () => {
                          try {
                            if (!previewingFile) return setFolderError('No se pudo previsualizar el archivo');
                            if (previewRetry >= 1) return setFolderError('No se pudo previsualizar el archivo');
                            // Reintentar una vez generando una URL firmada fresca
                            const fresh = await getSignedUrl(previewingFile.path, 900);
                            setPreviewRetry((n) => n + 1);
                            setPreviewUrl(fresh);
                          } catch {
                            setFolderError('No se pudo previsualizar el archivo');
                          }
                        };
                        if (isImage(name)) {
                          return <img src={previewUrl} alt={previewingFile?.name || 'imagen'} className="max-h-[60vh] w-auto" onError={onErr} />;
                        }
                        if (isPdf(name)) {
                          return <iframe src={previewUrl} {...commonProps} onError={onErr} />;
                        }
                        if (isVideo(name)) {
                          return <video src={previewUrl} controls {...commonProps} onError={onErr} />;
                        }
                        if (isAudio(name)) {
                          return <audio src={previewUrl} controls className="w-full" onError={onErr} />;
                        }
                        // Fallback genérico
                        return <iframe src={previewUrl} {...commonProps} onError={onErr} />;
                      })()
                    ) : (
                      <div className="p-6 text-white/60 text-sm">Selecciona un archivo para previsualizar o editar.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[90vw] max-w-4xl bg-[#0b0f1a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 bg-[#C7620A]">
              <h3 className="text-white font-semibold text-lg">Guía — {modalTitle}</h3>
              <button onClick={() => setModalOpen(false)} className="text-white hover:text-white/90">✕</button>
            </div>
            <div className="p-0">
              {modalLoading ? (
                <div className="p-6 text-white/60 text-sm">Cargando guía...</div>
              ) : modalText ? (
                isMarkdown(modalUrl) ? (
                  <div className="w-full h-[70vh] overflow-auto bg-transparent p-4 text-base leading-7">
                    <MarkdownRenderer content={modalText} theme="dark" />
                  </div>
                ) : (
                  <pre className="w-full h-[70vh] overflow-auto bg-transparent p-4 text-base leading-7 text-white whitespace-pre-wrap">{modalText}</pre>
                )
              ) : modalUrl ? (
                <iframe src={modalUrl} className="w-full h-[70vh]" />
              ) : (
                <div className="p-6 text-white/70">No se pudo cargar la guía.</div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
              <button onClick={() => setModalOpen(false)} className="text-xs px-3 py-1 rounded bg-[#ff6a00] text-white hover:bg-[#ff8a3b] transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
