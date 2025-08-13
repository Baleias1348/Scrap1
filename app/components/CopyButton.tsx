"use client";
import React, { useState } from "react";

export default function CopyButton({ text, label = "Copiar tabla" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-1 text-xs rounded bg-gray-100 hover:bg-blue-100 border border-gray-200 text-gray-700 transition"
      aria-label={label}
      type="button"
    >
      {copied ? "¡Copiado!" : label}
    </button>
  );
}
