"// Archivo eliminado para evitar conflicto con el nuevo dashboard";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

import ChatWindow from "./ChatWindow";

export default function StandaloneDashboardWithChat() {
  const pathname = usePathname();

  // Si la ruta es /dashboard/asistente-ia, renderiza el dashboard con el chat
  if (pathname === "/dashboard/asistente-ia") {
    return (
      <div>
        {/* Aquí iba el dashboard de ejemplo, eliminado por limpieza */}
        <ChatWindow />
      </div>
    );
  }
  // En cualquier otra ruta, dashboard clásico
  return <div />;
}
