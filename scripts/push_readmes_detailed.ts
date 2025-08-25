import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string; // service role
const BUCKET = 'prevencion2';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY');
  process.exit(1);
}

const md = (s: string) => new Blob([s], { type: 'text/markdown; charset=utf-8' });

const READMES: Record<string, string> = {
  '01_reglamentos/README.md': `# 01_reglamentos

- **Descripción**
  - Contiene el reglamento interno de orden, higiene y seguridad de la organización. Puede incluir reglamentos específicos adicionales según la actividad (ej. reglamento de teletrabajo).

- **Normativa aplicable (Chile)**
  - Código del Trabajo (Art. 153–157).
  - DS 44 (2025), que regula la gestión preventiva de riesgos laborales de manera integral.
  - Ley 16.744 (accidentes y enfermedades laborales).

- **Instructivo de mantenimiento**
  - Actualizar en caso de modificaciones legales o internas.
  - Comunicar y distribuir a todos los trabajadores.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: escrito, físico y/o digital.
  - Plazos: actualizar cada vez que se modifique normativa o estructura interna.
  - Firmas: Representante legal y conocimiento de los trabajadores.

- **Relación con anexos**
  - Documentos de difusión (listas de asistencia a charlas de inducción).

- **Buenas prácticas ISO (9001 / 45001)**
  - Control documental y versionado.
  - Evidencia de entrega a trabajadores.

- **✅ Checklist básico**
  - Reglamento firmado y vigente.
  - Registro de entrega/comunicación.
  - Control de versiones implementado.
`,
  '02_afiliacion_y_seguros/README.md': `# 02_afiliacion_y_seguros

- **Descripción**
  - Documentación de afiliación a mutualidades, seguros complementarios y pólizas de accidentes.

- **Normativa aplicable (Chile)**
  - Ley 16.744 (seguridad social en riesgos laborales).
  - D.S. 67/1999 (mutualidades).

- **Instructivo de mantenimiento**
  - Mantener certificados de afiliación vigentes.
  - Guardar copias de pólizas y comprobantes de pago.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: certificados emitidos por la mutualidad.
  - Plazo/vigencia: anual o mientras dure el contrato.
  - Firmas: Mutualidad o aseguradora.

- **Buenas prácticas ISO (9001 / 45001)**
  - Evidencia de cobertura vigente.
  - Copias disponibles para auditorías.

- **✅ Checklist básico**
  - Certificado de afiliación vigente.
  - Pólizas archivadas.
  - Comprobante de pago actualizado.
`,
  '03_comite_paritario/README.md': `# 03_comite_paritario

- **Descripción**
  - Actas, resoluciones y registros del Comité Paritario de Higiene y Seguridad.

- **Normativa aplicable (Chile)**
  - D.S. 54: Reglamenta comités paritarios.

- **Instructivo de mantenimiento**
  - Registrar actas de reuniones mensuales.
  - Mantener vigencia de constitución y renovación de miembros.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: actas firmadas, libro o registro digital.
  - Plazo: reunión mensual.
  - Firmas: Presidente y Secretario del Comité.

- **Buenas prácticas ISO (9001 / 45001)**
  - Publicar actas a los trabajadores.
  - Retroalimentación en el plan preventivo.

- **✅ Checklist básico**
  - Comité constituido con acta.
  - Actas mensuales archivadas.
  - Registro de asistentes firmado.
`,
  '04_matriz_riesgos/README.md': `# 04_matriz_riesgos

- **Descripción**
  - Documentación de identificación de peligros, evaluación de riesgos y medidas de control.

- **Normativa aplicable (Chile)**
  - DS 44 (2025), que regula la gestión preventiva de riesgos laborales de manera integral.
  - ISO 45001 (gestión de SST).

- **Instructivo de mantenimiento**
  - Revisar la matriz al menos una vez al año o tras cambios relevantes.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: planilla digital.
  - Plazo: actualización anual.
  - Firmas: Responsable SST.

- **Buenas prácticas ISO (9001 / 45001)**
  - Control de versiones y trazabilidad.
  - Uso de metodología estándar (ej. GTC-45, NTP).

- **✅ Checklist básico**
  - Matriz actualizada al año vigente.
  - Responsable designado.
  - Evidencia de comunicación a trabajadores.
`,
  '05_capacitaciones/README.md': `# 05_capacitaciones

- **Descripción**
  - Registros de cursos, charlas y entrenamientos de trabajadores.

- **Normativa aplicable (Chile)**
  - DS 44 (2025), que regula la gestión preventiva de riesgos laborales de manera integral.
  - Ley 20.123 (subcontratación: obligación de capacitación).

- **Instructivo de mantenimiento**
  - Archivar certificados y listas de asistencia.
  - Mantener programa anual.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: certificados, listas firmadas.
  - Plazo: anual o según riesgos detectados.
  - Firmas: Relator y/o empleador.

- **Buenas prácticas ISO (9001 / 45001)**
  - Medir eficacia de capacitaciones.
  - Integrar con evaluación de desempeño.

- **✅ Checklist básico**
  - Programa anual vigente.
  - Certificados archivados.
  - Registro de asistencia.
`,
  '06_emergencias/README.md': `# 06_emergencias

- **Descripción**
  - Plan de emergencia, simulacros y protocolos.

- **Normativa aplicable (Chile)**
  - D.S. 594 (condiciones sanitarias y ambientales).
  - Normas de seguridad contra incendios.

- **Instructivo de mantenimiento**
  - Actualizar plan cada año o tras incidentes.
  - Realizar simulacros y registrar resultados.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: manual escrito.
  - Plazo: anual.
  - Firmas: Representante legal.

- **Buenas prácticas ISO (9001 / 45001)**
  - Evidencia de simulacros.
  - Plan accesible a todos.

- **✅ Checklist básico**
  - Plan vigente.
  - Simulacros registrados.
  - Señalética instalada.
`,
  '07_accidentes_enfermedades/README.md': `# 07_accidentes_enfermedades

- **Descripción**
  - Registros de accidentes laborales y enfermedades profesionales.

- **Normativa aplicable (Chile)**
  - Ley 16.744.
  - DS 44 (2025), que regula la gestión preventiva de riesgos laborales de manera integral.

- **Instructivo de mantenimiento**
  - Registrar todo accidente, aun sin baja.
  - Mantener fichas médicas confidenciales.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: formularios, reportes médicos.
  - Plazo: inmediato tras accidente.
  - Firmas: Jefatura, Comité Paritario.

- **Buenas prácticas ISO (9001 / 45001)**
  - Análisis de causas raíz.
  - Seguimiento de acciones correctivas.

- **✅ Checklist básico**
  - Accidentes investigados.
  - Registro de seguimiento.
  - Notificación a mutual.
`,
  '08_trabajadores/README.md': `# 08_trabajadores

- **Descripción**
  - Información de trabajadores (contratos, datos personales, capacitaciones).

- **Normativa aplicable (Chile)**
  - Código del Trabajo.
  - Ley de Protección de Datos Personales.

- **Instructivo de mantenimiento**
  - Mantener actualizada lista maestra.
  - Segregar directos/indirectos.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: digital, protegido.
  - Plazo: actualización continua.
  - Firmas: Contratos firmados por ambas partes.

- **Buenas prácticas ISO (9001 / 45001)**
  - Confidencialidad de datos.
  - Acceso restringido.

- **✅ Checklist básico**
  - Lista maestra actualizada.
  - Contratos archivados.
  - Datos sensibles protegidos.
`,
  '09_epp/README.md': `# 09_epp

- **Descripción**
  - Registros de entrega, control y reposición de equipos de protección personal.

- **Normativa aplicable (Chile)**
  - D.S. 594 (condiciones sanitarias).
  - DS 44 (2025), que regula la gestión preventiva de riesgos laborales de manera integral.

- **Instructivo de mantenimiento**
  - Registrar entregas con firma de trabajador.
  - Controlar stock y vencimientos.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: formularios de entrega.
  - Plazo: según riesgo y desgaste.
  - Firmas: Entregador y trabajador.

- **Buenas prácticas ISO (9001 / 45001)**
  - Registro digital de stock.
  - Capacitación en uso de EPP.

- **✅ Checklist básico**
  - Registro de entregas firmado.
  - Control de stock vigente.
  - EPP dentro de vigencia.
`,
  '10_fiscalizaciones/README.md': `# 10_fiscalizaciones

- **Descripción**
  - Registros de visitas y fiscalizaciones de organismos públicos.

- **Normativa aplicable (Chile)**
  - Ley 16.744.
  - Competencias de Dirección del Trabajo y SEREMI de Salud.

- **Instructivo de mantenimiento**
  - Archivar actas de fiscalización.
  - Registrar medidas correctivas aplicadas.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: actas, cartas.
  - Plazo: inmediato tras fiscalización.
  - Firmas: Inspector fiscalizador.

- **Buenas prácticas ISO (9001 / 45001)**
  - Evidencia de cierre de no conformidades.
  - Reportar avances al Comité Paritario.

- **✅ Checklist básico**
  - Actas archivadas.
  - Plan de acción documentado.
  - Cumplimiento validado.
`,
  '11_equipos_mantenimiento/README.md': `# 11_equipos_mantenimiento

- **Descripción**
  - Registros de inspección, mantención y certificación de equipos y maquinarias.

- **Normativa aplicable (Chile)**
  - D.S. 594 (seguridad en equipos).
  - Normas sectoriales específicas (eléctricas, mecánicas).

- **Instructivo de mantenimiento**
  - Registrar todas las mantenciones preventivas y correctivas.
  - Mantener certificados de calibración.

- **Requisitos legales (formatos, plazos, vigencia)**
  - Formato: informes técnicos, certificados.
  - Plazo: según plan de mantenimiento.
  - Firmas: Técnico responsable.

- **Buenas prácticas ISO (9001 / 45001)**
  - Plan de mantenimiento anual.
  - Indicadores de fallas y disponibilidad.

- **✅ Checklist básico**
  - Plan anual definido.
  - Informes archivados.
  - Certificados vigentes.
`,
};

(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  let ok = 0, fail = 0;
  for (const [path, content] of Object.entries(READMES)) {
    const { error } = await supabase.storage.from(BUCKET).upload(path, md(content), { upsert: true, contentType: 'text/markdown; charset=utf-8' } as any);
    if (error) {
      console.error('Error subiendo', path, error.message);
      fail++;
    } else {
      console.log('OK ->', path);
      ok++;
    }
  }
  console.log(`Completado. OK=${ok}, FAIL=${fail}`);
})();
