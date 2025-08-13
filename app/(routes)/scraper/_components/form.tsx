import { useState } from "react";

type Props = {
  onStart?: (file: File | null, rateMs: number) => void;
  onPause?: () => void;
  onStop?: () => void;
};

export function ScraperForm({ onStart, onPause, onStop }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [rateMs, setRateMs] = useState<number>(1500);

  return (
    <form
      className="rounded-lg border p-4 space-y-3"
      onSubmit={(e: any) => {
        e.preventDefault();
        onStart?.(file, rateMs);
      }}
    >
      <div>
        <label className="block text-sm mb-1">Archivo CSV de URLs</label>
        <input
          type="file"
          accept=".csv"
          className="w-full border rounded px-3 py-2"
          onChange={(e: any) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Rate limit (ms)</label>
        <input
          type="number"
          placeholder="1500"
          value={rateMs}
          onChange={(e: any) => setRateMs(parseInt(e.target.value || "0", 10))}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-3 py-2 rounded bg-black text-white">
          Iniciar
        </button>
        <button type="button" className="px-3 py-2 rounded border" onClick={() => onPause?.()}>
          Pausar
        </button>
        <button type="button" className="px-3 py-2 rounded border" onClick={() => onStop?.()}>
          Detener
        </button>
      </div>
    </form>
  );
}