"use client";

import React from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-8">
  <h2 className="text-3xl font-bold mb-4">¡Ocurrió un error!</h2>
  <p className="mb-6 text-white/70">{error.message || "Ha ocurrido un error inesperado."}</p>
  <button
    className="bg-[#ff6a00] text-white px-6 py-2 rounded shadow hover:bg-[#ff8a3b] font-semibold"
    onClick={() => reset()}
  >
    Reintentar
  </button>
</div>
  );
}
