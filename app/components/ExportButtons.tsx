"use client";
import React, { useState } from "react";
import { saveAs } from "file-saver";
import htmlDocx from "html-docx-js/dist/html-docx";

export default function ExportButtons({ html, filename = "documento" }: { html: string; filename?: string }) {
  const [downloading, setDownloading] = useState(false);

  const exportWord = () => {
    setDownloading(true);
    const converted = htmlDocx.asBlob(html);
    saveAs(converted, `${filename}.docx`);
    setTimeout(() => setDownloading(false), 1200);
  };

  const exportPDF = async () => {
    setDownloading(true);
    const printWindow = window.open("", "_blank");
    printWindow?.document.write(html);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <div className="flex gap-2 my-2">
      <button
        onClick={exportWord}
        className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-blue-100 border border-gray-200 text-gray-700"
        disabled={downloading}
        type="button"
      >
        {downloading ? "Exportando…" : "Exportar Word"}
      </button>
      <button
        onClick={exportPDF}
        className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-blue-100 border border-gray-200 text-gray-700"
        disabled={downloading}
        type="button"
      >
        {downloading ? "Exportando…" : "Exportar PDF"}
      </button>
    </div>
  );
}
