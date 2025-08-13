import tiktoken

# Ejemplo de pregunta y respuesta (puedes reemplazar por cualquier texto)
pregunta = "El Decreto Supremo N° 44 (MINTRA, 2023) deroga los decretos N° 40 y N° 54 de 1969, que regulaban la prevención de riesgos y los comités paritarios, respectivamente, y establece un nuevo reglamento. Sin embargo, este decreto no detalla un plan de acción para la constitución de un departamento de prevención.\n\nPor lo tanto, te proporcionaré un plan de acción basado en mi conocimiento general de buenas prácticas y la normativa general chilena, no específicamente del DS N° 44, ya que este no lo detalla:"

respuesta = """
**Plan de Acción para la Fundación del Departamento de Prevención de Riesgos en una Constructora:**

**Fase 1: Diagnóstico y Planificación:**

1. **Evaluación Inicial:** Realizar una evaluación inicial de los riesgos presentes en la empresa, considerando las diferentes áreas y actividades (excavaciones, trabajo en altura, manejo de materiales, etc.). Esto implica inspecciones, análisis de tareas y revisión de estadísticas de accidentes e incidentes previos (si existen).
2. **Definición de Objetivos:** Establecer objetivos específicos, medibles, alcanzables, relevantes y con plazos definidos (SMART) para el departamento. Ejemplos: reducir la tasa de accidentes en un X%, implementar un sistema de gestión de seguridad y salud ocupacional, etc.
3. **Diseño de la Estructura:** Definir la estructura del departamento, incluyendo los roles, responsabilidades y organigrama. Determinar el personal necesario (expertos, técnicos, administrativos) según el tamaño y complejidad de la empresa.
4. **Recursos:** Identificar los recursos necesarios: presupuesto, equipos de protección personal (EPP), herramientas, software, capacitación, etc.
5. **Plan de Implementación:** Elaborar un plan con las etapas, plazos y responsables para la puesta en marcha del departamento.

**Fase 2: Implementación:**

1. **Contratación y Capacitación del Personal:** Seleccionar y contratar al personal calificado. Implementar un programa de capacitación inicial y continua para todo el personal del departamento y los trabajadores de la empresa.
2. **Desarrollo de Procedimientos:** Elaborar procedimientos de trabajo seguro para todas las actividades, incluyendo el uso de EPP, manejo de equipos, respuesta a emergencias, etc.
3. **Implementación del Sistema de Gestión:** Implementar un sistema de gestión de seguridad y salud ocupacional basado en la planificación, acción, verificación y revisión (Ciclo PHVA).
4. **Comunicación y Difusión:** Implementar un plan de comunicación para informar a todo el personal sobre las políticas, procedimientos y actividades del departamento. Promover una cultura de seguridad.

**Fase 3: Monitoreo y Evaluación:**

1. **Inspecciones Planificadas:** Realizar inspecciones regulares para verificar el cumplimiento de los procedimientos y la eficacia de las medidas de control.
2. **Investigación de Accidentes e Incidentes:** Implementar un sistema de reporte e investigación de accidentes e incidentes para identificar las causas y tomar medidas correctivas.
3. **Revisión del Sistema de Gestión:** Revisar periódicamente el sistema de gestión para asegurar su eficacia y realizar mejoras continuas.
4. **Indicadores de Gestión:** Monitorear los indicadores de seguridad y salud ocupacional (tasa de accidentes, días perdidos, etc.) para evaluar el desempeño del departamento.

**Consideraciones adicionales:**

* **Cumplimiento legal:** Asegurarse del cumplimiento de toda la legislación chilena vigente en materia de prevención de riesgos laborales, incluyendo el nuevo reglamento establecido por el DS N° 44.
* **Participación de los trabajadores:** Fomentar la participación de los trabajadores en las actividades de prevención, a través de comités paritarios, charlas, capacitaciones, etc.
* **Relaciones con la comunidad:** Mantener una comunicación fluida con la comunidad cercana a los proyectos, informándoles sobre las medidas de seguridad implementadas y atendiendo sus inquietudes.
* **Clientes:** Informar a los clientes sobre las políticas y procedimientos de seguridad de la empresa, y coordinar con ellos las actividades que puedan afectar la seguridad en el proyecto.

**Recuerda:** Esta información proviene de mi entrenamiento general y no del DS N° 44 específicamente. Es fundamental consultar la normativa vigente y las guías de la autoridad competente para asegurar el cumplimiento legal.
"""

# Usa el modelo de codificación de OpenAI que más se aproxime a GPT-4o/GPT-5
encoding = tiktoken.encoding_for_model("gpt-4o")

pregunta_tokens = len(encoding.encode(pregunta))
respuesta_tokens = len(encoding.encode(respuesta))
total_tokens = pregunta_tokens + respuesta_tokens

print(f"Tokens pregunta: {pregunta_tokens}")
print(f"Tokens respuesta: {respuesta_tokens}")
print(f"Tokens totales: {total_tokens}")
