"use client";
import React, { useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { getSupabaseClient } from "../../../src/lib/supabase";

interface CodigoActividad {
  id: number;
  codigo: string;
  descripcion: string;
}

export default function NuevaOrganizacionPage() {
  return (
    <RequireAuth>
      <NuevaOrganizacionForm />
    </RequireAuth>
  );
}

function NuevaOrganizacionForm() {
  const [razonSocial, setRazonSocial] = useState("");
  const [rut, setRut] = useState("");
  const [direccion, setDireccion] = useState("");
  const [rubro, setRubro] = useState<CodigoActividad | null>(null);
  const [rubroInput, setRubroInput] = useState("");
  const [rubroResultados, setRubroResultados] = useState<CodigoActividad[]>([]);
  const [cantidadTrabajadores, setCantidadTrabajadores] = useState("");
  const [mutual, setMutual] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Autocompletado de rubro (actividad económica)
  async function buscarRubros(query: string) {
    setRubroInput(query);
    if (query.length < 2) {
      setRubroResultados([]);
      return;
    }
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("codigos_actividad_economica_sii_chile")
      .select("id, codigo, descripcion")
      .ilike("descripcion", `%${query}%`)
      .limit(10);
    if (!error && data) {
      setRubroResultados(data);
    } else {
      setRubroResultados([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    if (!razonSocial || !rubro) {
      setError("Debes ingresar la razón social y seleccionar el rubro.");
      setLoading(false);
      return;
    }
    try {
      const resp = await fetch('/api/organizaciones/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_organizacion: razonSocial,
          extras: {
            rut: rut || undefined,
            direccion: direccion || undefined,
            actividad_economica: rubro?.descripcion || undefined,
            // Campos adicionales locales no soportados por el endpoint se omiten
          }
        }),
        credentials: 'include',
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error((json?.error ? `${json.error}` : 'No se pudo crear la organización') + ` (HTTP ${resp.status}${json?.code ? ", code " + json.code : ''})`);
      setSuccess("¡Organización creada exitosamente!");
      setRazonSocial("");
      setRut("");
      setDireccion("");
      setRubro(null);
      setRubroInput("");
      setCantidadTrabajadores("");
      setMutual("");
      setSitioWeb("");
      setLogoUrl("");
    } catch (err: any) {
      setError("Error al crear la organización: " + (err?.message || 'Error desconocido'));
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded shadow text-gray-900">
      <h1 className="text-2xl font-bold mb-6">Nueva Organización</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Razón Social *</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={razonSocial} onChange={e => setRazonSocial(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">RUT</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={rut} onChange={e => setRut(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Dirección</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={direccion} onChange={e => setDireccion(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Actividad Económica (Rubro) *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={rubroInput}
            onChange={e => buscarRubros(e.target.value)}
            placeholder="Buscar actividad..."
            required
            autoComplete="off"
          />
          {rubroResultados.length > 0 && (
            <ul className="border rounded bg-white mt-1 max-h-40 overflow-y-auto shadow-lg z-10 relative">
              {rubroResultados.map(r => (
                <li
                  key={r.id}
                  className={`px-3 py-2 hover:bg-blue-100 cursor-pointer ${rubro?.id === r.id ? "bg-blue-200" : ""}`}
                  onClick={() => { setRubro(r); setRubroInput(`${r.codigo} - ${r.descripcion}`); setRubroResultados([]); }}
                >
                  <span className="font-mono text-xs text-gray-500">{r.codigo}</span> - {r.descripcion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block mb-1">Cantidad de Trabajadores</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={cantidadTrabajadores} onChange={e => setCantidadTrabajadores(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Mutual</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={mutual} onChange={e => setMutual(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Sitio Web</label>
          <input type="url" className="w-full border rounded px-3 py-2" value={sitioWeb} onChange={e => setSitioWeb(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Logo (URL)</label>
          <input type="url" className="w-full border rounded px-3 py-2" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
        </div>
        <button type="submit" className="w-full py-2 rounded bg-blue-600 text-white font-semibold" disabled={loading}>
          {loading ? "Creando..." : "Crear Organización"}
        </button>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}
