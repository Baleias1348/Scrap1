"use client";
import React, { useState } from "react";
import ExportarDocumento from "./ExportarDocumento";
import FirmaEnPantalla from "./FirmaEnPantalla";

interface CampoEditable {
  nombre: string;
  tipo: string;
  label: string;
}

interface DocumentoEditableProps {
  contenidoBase: string;
  campos: CampoEditable[];
  onCompletar: (valores: Record<string, string>) => void;
}

import { useAuth } from "../context/AuthContext";

export default function DocumentoEditable({ contenidoBase, campos, onCompletar }: DocumentoEditableProps) {
  const [valores, setValores] = useState<Record<string, string>>(
    Object.fromEntries(campos.map(c => [c.nombre, ""]))
  );
  const [finalizado, setFinalizado] = useState(false);
  const [porFirmar, setPorFirmar] = useState(false);
  const [firmaUrl, setFirmaUrl] = useState<string | null>(null);
  const [showNombreInput, setShowNombreInput] = useState(false);
  const [nombreDoc, setNombreDoc] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState<string>("");
  const { user, org } = useAuth();

  // Subir y guardar documento en el bucket y base de datos
  async function handleDescargarYGuardar(e: React.FormEvent) {
    e.preventDefault();
    setSubiendo(true);
    setMensajeGuardado("");
    try {
      // Generar el archivo PDF (puedes cambiar a Word si prefieres)
      const html = generarHtmlFinal();
      // Usa html2pdf.js para generar el blob PDF
      const html2pdf = (await import("html2pdf.js")).default;
      const pdfBlob: Blob = await new Promise((resolve, reject) => {
        html2pdf()
          .from(html)
          .outputPdf('blob')
          .then(resolve)
          .catch(reject);
      });
      // Subir a endpoint API
      const formData = new FormData();
      formData.append('file', new File([pdfBlob], `${nombreDoc}.pdf`, { type: 'application/pdf' }));
      // Usar orgId y userId reales del contexto de sesión
      formData.append('orgId', org?.id || 'demo-org');
      formData.append('userId', user?.id || 'demo-user');
      formData.append('nombre', nombreDoc);
      formData.append('extension', 'pdf');
      const resp = await fetch('/api/documentos_modelo/upload', {
        method: 'POST',
        body: formData
      });
      const data = await resp.json();
      if (data.ok) {
        setMensajeGuardado('Documento guardado y disponible en tu organización.');
        // Descargar localmente
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreDoc}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        setShowNombreInput(false);
      } else {
        setMensajeGuardado('Error al guardar el documento: ' + (data.error || '')); 
      }
    } catch (err: any) {
      setMensajeGuardado('Error inesperado al guardar: ' + (err?.message || err?.toString()));
    }
    setSubiendo(false);
  }


  // Reemplaza los placeholders por inputs
  function renderContenido() {
    let partes = contenidoBase.split(/(\[[A-Z0-9_]+\])/g);
    return partes.map((parte, idx) => {
      const match = parte.match(/^\[([A-Z0-9_]+)\]$/);
      if (match) {
        const nombreCampo = match[1];
        const campo = campos.find(c => c.nombre === nombreCampo);
        if (!campo) return parte;
        return (
          <input
            key={idx}
            type={campo.tipo === "date" ? "date" : "text"}
            placeholder={campo.label}
            value={valores[nombreCampo] || ""}
            onChange={e => setValores(v => ({ ...v, [nombreCampo]: e.target.value }))}
            className="border-b border-gray-400 px-1 mx-1 bg-transparent focus:outline-none min-w-[100px]"
            disabled={finalizado}
          />
        );
      }
      // Renderizar saltos de línea
      if (parte === "\n") return <br key={idx} />;
      return parte;
    });
  }

  function handleFinalizar() {
    setFinalizado(true);
    onCompletar(valores);
  }

  // Generar HTML con los valores rellenados
  function generarHtmlFinal() {
    let html = contenidoBase;
    Object.entries(valores).forEach(([k, v]) => {
      html = html.replaceAll(`[${k}]`, v || "________");
    });
    // Mejorar formato para exportación
    return html.replace(/\n/g, '<br/>');
  }

  return (
    <div className="prose prose-sm max-w-none bg-gray-50 dark:bg-gray-900 p-4 rounded shadow">
      <div>{renderContenido()}</div>
      {!finalizado ? (
        <div className="mt-4">
          <div className="mb-2 font-semibold text-indigo-700 dark:text-indigo-300">¿Quieres que personalicemos este documento para tu empresa?</div>
          <button
            className="px-4 py-2 bg-fuchsia-700 text-white rounded hover:bg-fuchsia-900"
            onClick={handleFinalizar}
          >
            Sí, personalizar
          </button>
        </div>
      ) : porFirmar ? (
        <div className="mt-4">
          <div className="mb-2 text-indigo-700 dark:text-indigo-300 font-semibold">Firme el documento en pantalla:</div>
          <FirmaEnPantalla onFirmar={(url) => setFirmaUrl(url)} />
          {firmaUrl && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <img src={firmaUrl} alt="Firma" className="border" style={{ maxWidth: 300 }} />
              <div className="text-green-700 dark:text-green-400 font-semibold">¡Documento firmado y guardado en la bandeja de firmados!</div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mt-4 text-green-700 dark:text-green-400 font-semibold">
            Documento guardado. Ahora puedes descargarlo, enviarlo por correo o enviarlo a la bandeja "Por Firmar".<br/>
            <span className="text-sm text-gray-700 dark:text-gray-200">
              Cuando descargues también guardaré en los documentos de tu organización este archivo para que esté disponible cuando lo necesites.
            </span>
          </div>
          {showNombreInput ? (
            <form className="mt-2 flex gap-2 items-center" onSubmit={handleDescargarYGuardar}>
              <input
                className="border px-2 py-1 rounded text-gray-900"
                placeholder="Nombre del documento"
                value={nombreDoc}
                onChange={e => setNombreDoc(e.target.value)}
                required
                disabled={subiendo}
              />
              <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700" disabled={subiendo}>
                {subiendo ? "Guardando..." : "Confirmar y descargar"}
              </button>
            </form>
          ) : (
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => setShowNombreInput(true)}
              >
                Descargar PDF y guardar
              </button>
              <button
                className="px-3 py-1 bg-fuchsia-700 text-white rounded hover:bg-fuchsia-900"
                onClick={() => setPorFirmar(true)}
              >
                Enviar a bandeja "Por Firmar"
              </button>
            </div>
          )}
          {mensajeGuardado && <div className="mt-2 text-green-700 dark:text-green-400 font-semibold">{mensajeGuardado}</div>}
        </>
      )}
    </div>
  );
}
