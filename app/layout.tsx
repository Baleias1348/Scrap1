// Forzar build Netlify: 2025-08-13
import "./globals.css";
import "./standalone-dashboard.css";

export const metadata = {
  title: "Preventi Flow",
  description: "Dashboard Preventi Flow"
};

import { AuthProvider } from "./context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#101014] text-white font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}