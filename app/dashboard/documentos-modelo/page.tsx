'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface DocumentoModelo {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  version: number;
  validado: boolean;
  fecha_actualizacion: string;
}

export default function DocumentosModeloDashboard() {
  const [documentos, setDocumentos] = useState<DocumentoModelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/documentos_modelo')
      .then(res => res.json())
      .then(data => {
        setDocumentos(data.documentos || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Error al cargar documentos modelo.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-blue-900">📄 Documentos Modelo</h1>
            <p className="mb-4 text-gray-700">Gestiona y consulta los modelos legales personalizables. Aquí podrás ver el estado, versión y validación de cada documento.</p>
          </div>
          <Link href="/dashboard/plantillas" className="px-3 py-2 bg-white border rounded hover:bg-blue-50 text-blue-700" title="Ir a Plantillas y Buenas Prácticas">Plantillas y Buenas Prácticas →</Link>
        </div>
        <Link href="/dashboard/documentos-modelo/nuevo" className="inline-block mb-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">+ Nuevo Documento Modelo</Link>
        {loading && <div className="text-gray-500">Cargando documentos...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <table className="w-full bg-white rounded shadow mt-4" role="table">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="px-4 py-2 text-left" scope="col">Título</th>
                <th className="px-4 py-2" scope="col">Categoría</th>
                <th className="px-4 py-2" scope="col">Versión</th>
                <th className="px-4 py-2" scope="col">Validado</th>
                <th className="px-4 py-2" scope="col">Actualización</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map(doc => (
                <tr key={doc.id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2 font-medium text-blue-800">
                    <Link href={`/dashboard/documentos-modelo/${doc.id}`}>{doc.titulo}</Link>
                  </td>
                  <td className="px-4 py-2">{doc.categoria}</td>
                  <td className="px-4 py-2 text-center">{doc.version}</td>
                  <td className="px-4 py-2 text-center">{doc.validado ? '✅' : '—'}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{new Date(doc.fecha_actualizacion).toLocaleDateString()}</td>
                </tr>
              ))}
              {documentos.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">No hay documentos cargados aún.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
