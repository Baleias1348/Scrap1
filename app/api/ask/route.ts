/**
 * Endpoint RAG Preventi Flow: /api/ask
 *
 * 1. Recibe POST con { question }
 * 2. Genera embedding de la pregunta usando Google Generative Language (embedding-004)
 * 3. Llama a la función RPC match_normativas en Supabase para buscar contexto relevante
 * 4. Construye el prompt final (constitución + contexto + pregunta)
 * 5. Llama a Gemini (Google Generative Language) para generar la respuesta
 * 6. Devuelve { answer, sources }
 *
 * ---
 *
 * SQL para crear la función de similitud vectorial en Supabase:
 *
 * -- Búsqueda de similitud de vectores
 * create function match_normativas (
 *   query_embedding vector(768),
 *   match_threshold float,
 *   match_count int
 * )
 * returns table (
 *   id uuid,
 *   nombre_norma text,
 *   texto_limpio text,
 *   similarity float
 * )
 * language plpgsql
 * as $$
 * begin
 *   return query
 *   select
 *     biblioteca_legal.id,
 *     biblioteca_legal.nombre_norma,
 *     biblioteca_legal.texto_limpio,
 *     1 - (biblioteca_legal.embedding <=> query_embedding) as similarity
 *   from biblioteca_legal
 *   where 1 - (biblioteca_legal.embedding <=> query_embedding) > match_threshold
 *   order by similarity desc
 *   limit match_count;
 * end;
 * $$;
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar cliente de Google Generative AI solo si la clave está disponible
let genAI: GoogleGenerativeAI | null = null;
if (process.env.GOOGLE_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
} else {
  console.error('[API/ASK] No se encontró GOOGLE_API_KEY en el entorno.');
}

// --- CONFIGURACIÓN ---
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const VECTOR_SIZE = 768;
const SIMILARITY_THRESHOLD = 0.75;
const MATCH_COUNT = 5;

// Setting de Interacción Inicial y Constitución del agente
const AGENT_INTERACTION_SETTING = `Hola soy la agente Ai de Preventi Flow, estoy aquí para ayudarte.

¿Hay algo en específico en lo que quieras trabajar? Por ejemplo, ¿necesitas un modelo de procedimiento, un protocolo de seguridad, o quizás información sobre alguna normativa general?

Si luego de la interacción hay una pregunta o petición real:
(Incoporar alguna expresión de aceptación como Claro!, “Con mucho gusto”, Por supuesto, Etc) te ayudaré en XXX… buscaré para ti XXX (lo que sea que haya pedido el usuario).

Si en las interacciones anteriores el usuario no hubiese entregado información respecto a datos de su organización, complementar con:
“Si me cuentas brevemente algunas cosas respecto a tu organización, como el rubro, la región y la cantidad de trabajadores, podré ayudarte de manera mucho más enfocada. O si prefieres, puedo darte respuestas aplicables a todo tipo de empresas y organizaciones.”

Los datos relevantes deben ser marcados como palabras clave y recordados para futuras interacciones con el usuario.`;

const AGENT_CONSTITUTION = AGENT_INTERACTION_SETTING + `\n\nMi nombre es María José Gibson, Chief Safety, Compliance & Operations Officer (CSCO) con más de 15 años de experiencia en prevención de riesgos, cumplimiento legal, gestión de emergencias y liderazgo operativo en Chile y Latinoamérica. Soy experta en traducir la normativa legal en soluciones prácticas y estratégicas para empresas de todos los rubros, especialmente construcción, minería, industria y salud.

Respondo de forma clara, proactiva y estratégica, integrando:
- Legislación laboral y de seguridad chilena (Ley 16.744, DS N° 44, DS N° 594, Código del Trabajo, normas sectoriales).
- Prácticas y soluciones cotidianas de terreno y oficina.
- Estrategias para mejorar la cultura preventiva y la gestión de riesgos.
- Protocolos y documentos modelo para prevención, emergencias y cumplimiento.
- Sugerencias de mejora continua, liderazgo y formación de equipos.
- Coordinación efectiva con autoridades fiscalizadoras, organismos sectoriales y coordinadoras de emergencias (como Sernageomin, Seremi, mutualidades, ONEMI/SENAPRED, etc).

Cuando el usuario solicite un documento:
- Antes de mostrar el documento, inicia la respuesta con una frase cálida y profesional, mostrando disposición, experiencia y acompañamiento. Ejemplo: "¡Por supuesto! Ahora elaboraré para ti el modelo solicitado, tomando en cuenta nuestra experiencia y la normativa vigente (Ley XX, DS XX, etc). Si tienes dudas o necesitas personalizaciones, dime y te ayudo a ajustarlo.".
- Entrega siempre un modelo completo y profesional en formato Markdown enriquecido (usa títulos, subtítulos, listas, tablas, negritas, cursivas, etc).
- Incluye campos editables como [NOMBRE_EMPRESA], [RUT], [FECHA], etc.
- Utiliza tablas para organizar listados de EPP, sanciones, anexos, responsabilidades, etc. Siempre que puedas, prefiere tablas sobre listas simples.
- Da ejemplos concretos y prácticos en cada sección relevante (por ejemplo, ejemplos de cláusulas, de uso de EPP, de procedimientos, etc).
- Separa claramente el documento principal de los anexos y del “paquete completo” de documentos relacionados. Usa encabezados claros como "Anexos" o "Documentos Complementarios".
- Usa un tono natural, profesional y cercano, como el de un consultor senior, evitando frases robóticas o excesivamente formales.
- Incluye siempre un breve disclaimer recomendando la revisión final por parte de un experto humano.
- Si el usuario lo pide, elabora los documentos listos para descargar o personalizar en Word o PDF.
- Al inicio del documento, incluye una breve instrucción: "Complete los campos marcados entre [ ] antes de imprimir o enviar este documento".
- Al final de cada respuesta, incluye SIEMPRE un cierre proactivo y consultivo, ofreciendo ayuda concreta para crear documentos relacionados, anexos, matrices de riesgos, protocolos, planes de emergencia, o cualquier otro documento complementario que pueda ser útil en el contexto del usuario. Por ejemplo: "Si necesitas adaptar este documento, crear anexos, protocolos, matrices de riesgos, planes de emergencia o cualquier otro documento relacionado, solo dime y estaré encantada de ayudarte a elaborarlo. ¿Te gustaría que te ayude con algún anexo, procedimiento o documento adicional?".
`;

export async function POST(req: NextRequest) {
  console.log('--- [API/ASK] Nueva consulta recibida ---');
  try {
    const { question } = await req.json();
    console.log('[API/ASK] Pregunta recibida:', question);
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Debe enviar una pregunta en el campo "question".' }, { status: 400 });
    }
    // Interceptar saludos simples y NO responder con la bienvenida
    const saludos = [/^hola[!.¡]?$/i, /^buen[oa]s? (d[ií]as|tardes|noches)[!.¡]?$/i, /^buen[oa]s?[!.¡]?$/i, /^hey[!.¡]?$/i, /^holi[!.¡]?$/i, /^saludos[!.¡]?$/i];
    if (saludos.some(r => r.test(question.trim()))) {
      return NextResponse.json({ answer: '¡Hola! ¿En qué tema específico de prevención o gestión documental te puedo ayudar hoy?' });
    }

    // 1. Crear cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('[API/ASK] Cliente Supabase creado');

    // --- Embeddings: usar SOLO Gemini 2.5 Pro ---
    let questionEmbedding;
    if (!genAI) {
      return NextResponse.json({ error: 'No hay clave de Google Generative AI (Gemini) configurada.' }, { status: 500 });
    }
    try {
      console.log('[API/ASK] Solicitando embedding a Gemini 2.5 Pro...');
      const embeddingModel = genAI.getGenerativeModel({ model: 'models/embedding-001' });
      const embeddingResp = await embeddingModel.embedContent({
        content: question,
        taskType: 'retrieval_query',
      });
      questionEmbedding = embeddingResp.embedding.values;
      console.log('[API/ASK] Embedding generado con Gemini:', questionEmbedding.length);
    } catch (error: any) {
      return NextResponse.json({ error: 'No se pudo generar el embedding de la pregunta con Gemini.', details: error?.message || error?.toString() }, { status: 500 });
    }
    if (!questionEmbedding || questionEmbedding.length !== VECTOR_SIZE) {
      return NextResponse.json({ error: 'No se pudo generar el embedding de la pregunta.', details: questionEmbedding }, { status: 500 });
    }

    // 4. Buscar contexto relevante en Supabase (RPC)
    console.log('[API/ASK] Buscando contexto legal relevante en Supabase...');
    const { data: matches, error: matchError } = await supabase.rpc('match_normativas', {
      query_embedding: questionEmbedding,
      match_threshold: SIMILARITY_THRESHOLD,
      match_count: MATCH_COUNT,
    });
    if (matchError) {
      return NextResponse.json({ error: 'Error al buscar contexto en la base legal.', details: matchError.message }, { status: 500 });
    }
    if (matches) console.log('[API/ASK] Contexto legal encontrado:', matches.length);
    let contexto = '';
    let sources: string[] = [];
    let contextoEconomico = '';
    // Buscar contexto económico relevante (los 5 códigos más similares por embedding)
    console.log('[API/ASK] Buscando contexto económico relevante en Supabase...');
    const { data: codigosEconomicos, error: codigosError } = await supabase
      .from('codigos_actividad_economica_sii_chile')
      .select('codigo, descripcion, categoria_tributaria, afecto_iva, disponible_internet')
      .limit(5);
    if (!codigosError && codigosEconomicos && codigosEconomicos.length > 0) {
      console.log('[API/ASK] Códigos económicos encontrados:', codigosEconomicos.length);
      contextoEconomico = codigosEconomicos.map((c: any, idx: number) =>
        `Código Económico #${idx+1}: ${c.codigo}\nDescripción: ${c.descripcion}\nCategoría Tributaria: ${c.categoria_tributaria}\nAfecto IVA: ${c.afecto_iva}\nDisponible Internet: ${c.disponible_internet}`
      ).join('\n\n');
    }
    let prompt = '';
    // --- Construcción de prompt ---
    if (matches && matches.length > 0) {
      console.log('[API/ASK] Construyendo prompt con contexto legal y económico...');
      contexto = matches.map((m: any, idx: number) => `Fuente #${idx+1} (${m.nombre_norma}):\n${m.texto_limpio}`).join('\n\n');
      sources = matches.map((m: any) => m.nombre_norma);
      prompt = `CONSTITUCIÓN DEL AGENTE:\n${AGENT_CONSTITUTION}\n\nCONTEXTO LEGAL RELEVANTE:\n${contexto}\n\nCONTEXTO ECONÓMICO RELEVANTE (Códigos SII):\n${contextoEconomico}\n\nPREGUNTA DEL USUARIO:\n${question}\n\nINSTRUCCIÓN: Si la respuesta está en el contexto, úsalo y cita las fuentes. Si el contexto no contiene la respuesta, responde igualmente usando tu conocimiento general y aclara explícitamente al usuario que la información proviene de tu entrenamiento y no de fuentes legales consultadas.`;
    } else {
      prompt = `CONSTITUCIÓN DEL AGENTE:\n${AGENT_CONSTITUTION}\n\nCONTEXTO ECONÓMICO RELEVANTE (Códigos SII):\n${contextoEconomico}\n\nPREGUNTA DEL USUARIO:\n${question}\n\nINSTRUCCIÓN: No se encontró información relevante en la base legal. Responde usando tu conocimiento general y aclara explícitamente al usuario que la información proviene de tu entrenamiento y no de fuentes legales consultadas.`;
    }


    let answer = '';
    let modelUsed = '';
    let inputTokens = null;
    let outputTokens = null;
    let estimatedCost = null;
    
    // Usar SOLO Gemini 2.5 Pro para generación
    if (!genAI) {
      throw new Error('No hay clave de Google Generative AI (Gemini) configurada.');
    }
    try {
      console.log('[API/ASK] Llamando a Gemini 2.5 Pro...');
      const llmModel = genAI.getGenerativeModel({ model: 'models/gemini-2.5-pro-latest' });
      const llmResp = await llmModel.generateContent(prompt);
      answer = llmResp.response.text().trim();
      modelUsed = 'gemini-2.5-pro-latest';
      console.log('[API/ASK] Respuesta recibida de Gemini 2.5 Pro:', answer);
    } catch (error) {
      console.error('[API/ASK] Error al usar Gemini 2.5 Pro:', error);
      throw new Error('No se pudo generar una respuesta con Gemini 2.5 Pro. Por favor, inténtalo de nuevo.');
    }

    // Logging de interacción en Supabase
    try {
      console.log('[API/ASK] Registrando interacción en Supabase...');
      await supabase.from('interacciones').insert([
        {
          pregunta: question,
          respuesta: answer,
          modelo: modelUsed,
          metadata: {
            sources,
            tokens: {
              input: inputTokens || null,
              output: outputTokens || null
            },
            costo_estimado: estimatedCost || null
          }
        }
      ]);
    } catch (e) {
      console.error('[API/ASK] Error registrando interacción en Supabase:', e);
    }
    // --- FILTRO Y AJUSTE DE RESPUESTA FINAL ---
    console.log('[API/ASK] Devolviendo respuesta final al frontend...');
    /**
     * Limpieza y control de interacción de la respuesta AI.
     * - Saludo inicial SOLO en la primera interacción.
     * - Sugerencia organizacional SOLO en la segunda interacción Y solo si no hay datos organizacionales.
     * - Nunca repetir ni poner la sugerencia al final ni duplicada.
     * - Limpia botones de exportar y frases fuera de contexto.
     */
    function cleanAIResponse(text: string, interactionStep: number, hasOrgInfo: boolean, isAmbiguous: boolean): string {
      let cleaned = text
        // Eliminar disclaimers y frases innecesarias
        .replace(/mi información proviene de mi entrenamiento[^.]*\./gi, "")
        .replace(/Recuerda que mi información proviene[^.]*\./gi, "")
        .replace(/Siempre es recomendable validar[^.]*\./gi, "")
        .replace(/Dado que tu pregunta es si estoy en línea[^.]*\./gi, "")
        .replace(/Si bien no hay una base legal que consultar[^.]*\./gi, "")
        .replace(/más de 15 años en estos temas[^.]*\./gi, "")
        .replace(/especialmente en las áreas de construcción, minería, industria y salud\.?/gi, "")
        .replace(/y mucho más, especialmente en las áreas de construcción, minería, industria y salud\.?/gi, "")
        .replace(/Mi nombre es María José Gibson[^.]*\./gi, "")
        .replace(/Chief Safety, Compliance[^.]*Officer[^.]*\./gi, "")
        .replace(/Si deseas orientación sobre la normativa aplicable[^.]*\./gi, "")
        .replace(/No hay una base legal que consultar[^.]*\./gi, "")
        // Eliminar frases genéricas sobre base de conocimientos
        .replace(/Ten en cuenta que esta información proviene de mi base de conocimientos general y no de una consulta específica a la normativa legal vigente\. Si tienes dudas o necesitas personalizaciones, dime y te ayudo a ajustarlo\./gi, "")
        .replace(/Esta información proviene de mi base de conocimientos general y no de una consulta específica a la normativa legal vigente\.?/gi, "")
        .replace(/mi base de conocimientos general y no de una consulta específica a la normativa legal vigente\.?/gi, "")
        .replace(/información proviene de mi base de conocimientos general[^.]*\./gi, "")
        .replace(/si tienes dudas o necesitas personalizaciones, dime y te ayudo a ajustarlo\./gi, "")
        .replace(/si tienes dudas o necesitas personalización, dime y te ayudo a ajustarlo\./gi, "")
        // Eliminar frases sobre elaboración de matriz de riesgo por entrenamiento
        .replace(/Ahora elaborar[ée] para ti un modelo de matriz de riesgo,? tomando en cuenta mi entrenamiento y experiencia en prevención de riesgos\.?/gi, "")
        .replace(/Ahora elaborar[ée] para ti un modelo de matriz de riesgo\.?/gi, "")
        .replace(/tomando en cuenta mi entrenamiento y experiencia en prevención de riesgos\.?/gi, "")

        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s+|\s+$/g, "");

      // 1. Presentación inicial SOLO en la primera interacción
      if (interactionStep === 1) {
        // Saludo inicial fijo y profesional según nueva regla del usuario
        return `Hola soy la agente Ai de Preventi Flow, estoy aquí para ayudarte.\n\n¿Hay algo en específico en lo que quieras trabajar? Por ejemplo, ¿necesitas un modelo de procedimiento, un protocolo de seguridad, o quizás información sobre alguna normativa general?`;
      }

      // Evitar que la IA repita la bienvenida como respuesta a una consulta del usuario
      // Filtro avanzado: eliminar cualquier bloque de bienvenida redundante, incluso si está seguido de frases como "¡Con mucho gusto te ayudaré..."
      const bienvenidaBloquePattern = /^(hola[,!]?\s*soy la agente Ai de Preventi Flow,?\s*estoy aquí para ayudarte[.!]?\s*)/i;
      if (bienvenidaBloquePattern.test(cleaned.trim())) {
        // Elimina el bloque de bienvenida y deja solo el contenido útil
        cleaned = cleaned.replace(bienvenidaBloquePattern, '').trim();
        // Si después de limpiar, la respuesta comienza con frases tipo "¡Con mucho gusto te ayudaré..." o similares, deja solo esa parte
        const frasesAceptacion = [
          '¡Con mucho gusto te ayudaré',
          '¡Por supuesto',
          'Claro, te ayudo',
          'Con mucho gusto',
          'Por supuesto',
          'Claro que sí',
          'Encantada de ayudarte',
          'Perfecto',
          'Listo',
          'Aquí tienes',
        ];
        for (const frase of frasesAceptacion) {
          if (cleaned.toLowerCase().startsWith(frase.toLowerCase())) {
            return cleaned;
          }
        }
        // Si no hay nada útil, responde con una frase neutra
        if (!cleaned || cleaned.length < 10) {
          return "¡Estoy lista para ayudarte! Por favor, dime con más detalle qué necesitas (por ejemplo: matriz de riesgos, protocolo, normativa, etc.).";
        }
        // Si hay contenido útil después del saludo, retorna solo ese contenido
        return cleaned;
      }

      // 2. Sugerencia organizacional SOLO en la segunda interacción y solo si NO hay datos
      if (interactionStep === 2) {
        // Anteponer frase cálida de aceptación solo en la segunda interacción
        const frasesAceptacion = [
          '¡Por supuesto!',
          'Claro, te ayudo con eso.',
          'Con mucho gusto, aquí tienes…'
        ];
        const frase = frasesAceptacion[Math.floor(Math.random() * frasesAceptacion.length)];
        let respuesta = `${frase} ${cleaned.trim()}`;

        // 3. Si la información es ambigua
        if (isAmbiguous) {
          return cleaned.trim() + '\n\n¿Podrías confirmar o especificar mejor a qué área, actividad o situación te refieres? Así podré darte una respuesta más enfocada.';
        }

        // Eliminar saludos y sugerencias redundantes o repetidas en cualquier otra interacción
        cleaned = cleaned.replace(/^(¡?Hola!?.*?ayudarte[.!]?\s*){2,}/i, '')
          .replace(/Si me cuentas brevemente algunas cosas respecto a tu organización[^.]*\.(\s*O si prefieres,[^.]*\.)?/gi, '')
          .replace(/Si me cuentas la región[^.]*\./gi, '')
          .replace(/Si necesitas un modelo de algún documento específico[^.]*\./gi, '')
          .replace(/Exportar Word|Exportar PDF|PF/gi, '')
          .replace(/\n{3,}/g, "\n\n");

        return cleaned.trim();
      }

      // No declarar interactionStep, hasOrgInfo ni isAmbiguous aquí (ya vienen como parámetros)
      return cleaned;
    }

    // --- DETERMINAR PARÁMETROS DE INTERACCIÓN ---
    // TODO: Mejorar la lógica para detectar paso de interacción, datos de organización y ambigüedad
    let interactionStep = 1;
    let hasOrgInfo = false;
    let isAmbiguous = false;
    // Heurística simple: si la pregunta es un saludo y no hay contexto, es la primera interacción
    if (question && /hola|buenas|estás en línea|saludos/i.test(question) && (!sources || sources.length === 0)) {
      interactionStep = 1;
    } else {
      interactionStep = 2;
    }
    // Heurística mejorada para detectar datos organizacionales en la pregunta
    const orgKeywords = [
      /rubro\s*[:=]?\s*\w+/i,
      /sector\s*[:=]?\s*\w+/i,
      /empresa\s+(del|de)\s+\w+/i,
      /trabajador(?:es)?\s*[:=]?\s*\d+/i,
      /empleado(?:s)?\s*[:=]?\s*\d+/i,
      /regi[oó]n\s*[:=]?\s*\w+/i,
      /mi empresa es/i,
      /nuestra empresa/i,
      /somos\s+\d+\s+(trabajador(?:es)?|empleado(?:s)?)/i,
      /agricultura|minería|construcción|servicios|comercio|industria|salud/i
    ];
    for (const regex of orgKeywords) {
      if (regex.test(question)) {
        hasOrgInfo = true;
        break;
      }
    }
    // Heurística simple para ambigüedad
    if (/no\s+(entiendo|comprendo)|puedes ser m[aá]s espec[ií]fico|ambig[uü]edad|no queda claro/i.test(answer)) {
      isAmbiguous = true;
    }
    const cleanedAnswer = cleanAIResponse(answer, interactionStep, hasOrgInfo, isAmbiguous);
    // Eliminar botones de exportar si no se trata de un documento generado
    let cleanedFinal = cleanedAnswer;
    if (!/modelo|protocolo|plantilla|documento|descargar en (word|pdf)/i.test(cleanedAnswer)) {
      cleanedFinal = cleanedFinal.replace(/Exportar Word|Exportar PDF|PF/gi, '');
    }
    // Construir referencia normativa SOLO si hay fuentes
    let referenciaNormativa = '';
    if (sources && sources.length > 0) {
      referenciaNormativa = `\n\nReferencia normativa: ${sources.map((s, i) => `Fuente #${i+1}: ${s}`).join(' | ')}`;
    }
    // Agregar cierre proactivo (si no lo incluye el modelo)
    let cierreProactivo = '\n\n¿Necesitas que te ayude con algún documento, protocolo, matriz de riesgos o procedimiento adicional? Solo dime.';
    let finalAnswer = cleanedAnswer;
    if (!/documento|protocolo|matriz|anexo|plan de emergencia|procedimiento/i.test(cleanedAnswer)) {
      finalAnswer += cierreProactivo;
    }
    // Agregar disclaimer solo si la respuesta es un documento generado
    if (/^(modelo|documento|protocolo|instructivo|formato|plantilla|plan de emergencia)/i.test(cleanedAnswer)) {
      finalAnswer += '\n\n<small style="font-size:60%">Este documento es un modelo y debe ser revisado y adaptado a las necesidades específicas de tu empresa u organización por un profesional experto en prevención de riesgos. No sustituye la asesoría legal profesional.</small>';
    }
    finalAnswer += referenciaNormativa;
    return NextResponse.json({ answer: finalAnswer.trim(), sources, model: modelUsed });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error inesperado en el backend.', details: err?.message || err?.toString() }, { status: 500 });
  }
}

