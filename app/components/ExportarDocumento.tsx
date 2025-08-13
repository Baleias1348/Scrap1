"use client";
import React from "react";

import { saveAs } from "file-saver";

interface ExportarDocumentoProps {
  html: string;
  filename?: string;
}

export default function ExportarDocumento({ html, filename = "documento" }: ExportarDocumentoProps) {
  const exportPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf()
      .from(html)
      .set({ filename: filename + ".pdf", margin: 10, jsPDF: { unit: 'mm', format: 'a4' } })
      .save();
  };


  const exportWord = () => {
    const blob = new Blob([
      `<html><head><meta charset='utf-8'/></head><body>${html}</body></html>`
    ], { type: "application/msword" });
    saveAs(blob, filename + ".doc");
  };

  return (
    <div className="flex gap-2 mt-2">
      <button
        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        onClick={exportPDF}
        type="button"
      >
        Descargar PDF
      </button>
      <button
        className="px-3 py-1 bg-fuchsia-700 text-white rounded hover:bg-fuchsia-900"
        onClick={exportWord}
        type="button"
      >
        Descargar Word
      </button>
    </div>
  );
}
