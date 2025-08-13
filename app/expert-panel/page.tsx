"use client";
import React, { useEffect, useState } from "react";

interface Interaccion {
  id: string;
  pregunta: string;
  respuesta: string;
  tipo_respuesta: string;
  categoria_usuario: string;
  validada: boolean;
  experto_validador?: string;
  fecha: string;
}

export default function ExpertPanel() {
  const [interacciones, setInteracciones] = useState<Interaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [editRespuesta, setEditRespuesta] = useState("");
  const [filter, setFilter] = useState<{validada?: string, categoria_usuario?: string}>({});

  useEffect(() => {
    fetchInteracciones();
  }, [filter]);

  async function fetchInteracciones() {
    setLoading(true);
    let url = "/api/interacciones";
    const params = [];
    if (filter.validada) params.push(`validada=${filter.validada}`);
    if (filter.categoria_usuario) params.push(`categoria_usuario=${filter.categoria_usuario}`);
    if (params.length) url += "?" + params.join("&");
    const res = await fetch(url);
    const { data } = await res.json();
    setInteracciones(data);
    setLoading(false);
  }

  async function handleValidate(id: string) {
    await fetch("/api/interacciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, validada: true, experto_validador: "experto" })
    });
    fetchInteracciones();
  }

  async function handleEdit(id: string, respuesta: string) {
    await fetch("/api/interacciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, respuesta })
    });
    setEditingId(null);
    fetchInteracciones();
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Panel de Expertos: Validación y Curación</h1>
      <div className="flex gap-4 mb-4">
        <select value={filter.validada||""} onChange={e=>setFilter(f=>({...f, validada: e.target.value||undefined}))} className="border rounded p-2">
          <option value="">Todas</option>
          <option value="false">No validadas</option>
          <option value="true">Validadas</option>
        </select>
        <select value={filter.categoria_usuario||""} onChange={e=>setFilter(f=>({...f, categoria_usuario: e.target.value||undefined}))} className="border rounded p-2">
          <option value="">Todos los usuarios</option>
          <option value="experto">Expertos</option>
          <option value="anonimo">Anónimos</option>
        </select>
        <button onClick={fetchInteracciones} className="bg-blue-500 text-white rounded px-4 py-2">Actualizar</button>
      </div>
      {loading ? <div>Cargando...</div> : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Fecha</th>
              <th className="border px-2 py-1">Usuario</th>
              <th className="border px-2 py-1">Pregunta</th>
              <th className="border px-2 py-1">Respuesta</th>
              <th className="border px-2 py-1">Tipo</th>
              <th className="border px-2 py-1">Validada</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {interacciones.map(i => (
              <tr key={i.id} className={i.validada ? "bg-green-50" : ""}>
                <td className="border px-2 py-1 whitespace-nowrap">{new Date(i.fecha).toLocaleString()}</td>
                <td className="border px-2 py-1">{i.categoria_usuario}</td>
                <td className="border px-2 py-1">{i.pregunta}</td>
                <td className="border px-2 py-1">
                  {editingId === i.id ? (
                    <div>
                      <textarea value={editRespuesta} onChange={e=>setEditRespuesta(e.target.value)} className="w-full border rounded p-1" rows={6}/>
                      <button onClick={()=>handleEdit(i.id, editRespuesta)} className="bg-blue-500 text-white rounded px-2 py-1 mt-1">Guardar</button>
                      <button onClick={()=>setEditingId(null)} className="ml-2 text-gray-500">Cancelar</button>
                    </div>
                  ) : (
                    <div>
                      <pre className="whitespace-pre-wrap break-words">{i.respuesta}</pre>
                      <button onClick={()=>{setEditingId(i.id);setEditRespuesta(i.respuesta);}} className="text-blue-500 text-xs ml-2">Editar</button>
                    </div>
                  )}
                </td>
                <td className="border px-2 py-1">{i.tipo_respuesta}</td>
                <td className="border px-2 py-1 text-center">{i.validada ? "✅" : ""}</td>
                <td className="border px-2 py-1">
                  {!i.validada && <button onClick={()=>handleValidate(i.id)} className="bg-green-500 text-white rounded px-2 py-1">Validar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
