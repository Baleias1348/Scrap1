import React from "react";

export default function ProfileAccountSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#ff6a00]">Mi Perfil y Configuración</h1>
      {/* Perfil */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2 text-white">Perfil</h2>
        <div className="bg-white/10 rounded-lg p-6 border border-white/10">
          <div className="flex gap-6 items-center mb-4">
            <div className="w-20 h-20 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-3xl font-bold border-2 border-[#ff6a00]/60">
              {/* Aquí podría ir el avatar del usuario */}
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="2" fill="#2563eb"/><path d="M4 20c0-4 16-4 16 0" stroke="#fff" strokeWidth="2" fill="none"/></svg>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">Nombre Apellido</div>
              <div className="text-white/60 text-sm">usuario@email.com</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 mb-1">Nombre</label>
              <input type="text" className="w-full rounded p-2 bg-black/30 border border-white/10 text-white" value="Nombre" />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Apellido</label>
              <input type="text" className="w-full rounded p-2 bg-black/30 border border-white/10 text-white" value="Apellido" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/70 mb-1">Email</label>
              <input type="email" className="w-full rounded p-2 bg-black/30 border border-white/10 text-white" value="usuario@email.com" />
            </div>
          </div>
        </div>
      </section>
      <hr className="border-white/20 my-10" />
      {/* Cuenta */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2 text-white">Cuenta</h2>
        <div className="bg-white/10 rounded-lg p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 mb-1">Contraseña actual</label>
              <input type="password" className="w-full rounded p-2 bg-black/30 border border-white/10 text-white" value="" placeholder="********" />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Nueva contraseña</label>
              <input type="password" className="w-full rounded p-2 bg-black/30 border border-white/10 text-white" value="" placeholder="" />
            </div>
            <div className="md:col-span-2">
              <button className="mt-4 bg-[#ff6a00] hover:bg-[#ff8a2b] text-white font-semibold px-6 py-2 rounded transition-all">Actualizar contraseña</button>
            </div>
          </div>
        </div>
      </section>
      <hr className="border-white/20 my-10" />
      {/* Configuración */}
      <section>
        <h2 className="text-xl font-semibold mb-2 text-white">Configuración</h2>
        <div className="bg-white/10 rounded-lg p-6 border border-white/10">
          <label className="flex items-center gap-3 mb-4">
            <input type="checkbox" className="form-checkbox accent-[#ff6a00]" />
            <span className="text-white/80">Recibir notificaciones por correo</span>
          </label>
          <label className="flex items-center gap-3 mb-4">
            <input type="checkbox" className="form-checkbox accent-[#ff6a00]" />
            <span className="text-white/80">Habilitar modo oscuro</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="form-checkbox accent-[#ff6a00]" />
            <span className="text-white/80">Mostrar tips de ayuda</span>
          </label>
        </div>
      </section>
    </div>
  );
}
