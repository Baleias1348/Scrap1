import React, { useRef } from "react";

interface FirmaEnPantallaProps {
  onFirmar: (firmaDataUrl: string) => void;
}

export default function FirmaEnPantalla({ onFirmar }: FirmaEnPantallaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let drawing = false;

  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  }
  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }
  function endDraw() {
    drawing = false;
  }
  function limpiar() {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.clearRect(0, 0, 400, 120);
  }
  function guardarFirma() {
    if (canvasRef.current) {
      onFirmar(canvasRef.current.toDataURL("image/png"));
    }
  }
  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="border rounded bg-white dark:bg-gray-800 cursor-crosshair"
        style={{ touchAction: "none" }}
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={endDraw}
        onPointerLeave={endDraw}
      />
      <div className="flex gap-2">
        <button onClick={limpiar} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">Limpiar</button>
        <button onClick={guardarFirma} className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-900">Guardar Firma</button>
      </div>
      <div className="text-xs text-gray-500">Firme aquí usando su dedo o mouse</div>
    </div>
  );
}
