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

import { setupVertexCredentials } from '../../utils/setupVertexCredentials';
setupVertexCredentials();

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import { getVertexEmbedding } from '../../utils/vertexEmbed';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const VECTOR_SIZE = 768;
const SIMILARITY_THRESHOLD = 0.75;
const MATCH_COUNT = 5;

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0764731811';
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout alcanzado en llamada a Gemini')), ms))
  ]);
}
// Obtener constitución dinámica
async function obtenerConstitucionAgente(supabase: any, nombreAgente: string): Promise<string> {
  const { data, error } = await supabase
    .from('constituciones_agente')
    .select('constitucion')
    .eq('nombre_agente', nombreAgente)
    .order('fecha_actualizacion', { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) {
    throw new Error('No se encontró la constitución del agente en la base de datos.');
  }
  return data[0].constitucion;
}

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

    // Obtener constitución dinámica
    let constitucionAgente = '';
    try {
      constitucionAgente = await obtenerConstitucionAgente(supabase, 'A.R.I.A.');
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'No se pudo obtener la constitución del agente.' }, { status: 500 });
    }

    // --- Embeddings: usar SOLO Gemini 2.5 Pro ---
    let questionEmbedding;
    try {
      console.log('[API/ASK] Solicitando embedding a Vertex AI vía REST...');
      questionEmbedding = await getVertexEmbedding(question, GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION);
      console.log('[API/ASK] Embedding generado con Vertex AI:', questionEmbedding.length);
    } catch (error: any) {
      return NextResponse.json({ error: 'No se pudo generar el embedding de la pregunta con Vertex AI.', details: error?.message || error?.toString() }, { status: 500 });
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
    let prompt = question; // Solo la pregunta, sin constitución ni contexto
    console.log('[API/ASK] Prompt enviado a Gemini:', prompt);

    let answer = '';
    let modelUsed = '';
    let inputTokens = null;
    let outputTokens = null;
    let estimatedCost = null;

    // Usar SOLO Gemini 2.5 Pro para generación
    try {
      console.log('[API/ASK] Llamando a Gemini 2.5 Pro (Vertex AI)...');
      // Instanciar GoogleGenAI localmente para evitar errores de referencia
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({
        vertexai: true,
        project: GOOGLE_CLOUD_PROJECT,
        location: GOOGLE_CLOUD_LOCATION,
      });
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });
      let respuestaTexto = '';
      // Extraer texto generado de la respuesta (Vertex AI)
      if (response && response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
        respuestaTexto = response.candidates[0].content.parts[0].text.trim();
      }
      answer = respuestaTexto;
      modelUsed = 'gemini-2.5-pro';
      console.log('[API/ASK] Respuesta recibida de Gemini 2.5 Pro:', answer);
    } catch (error: any) {
      console.error('[API/ASK] Error al usar Gemini 2.5 Pro:', error, error?.response?.data || error?.message || error);
      return NextResponse.json({ error: 'No se pudo generar una respuesta con Gemini 2.5 Pro.', details: error?.response?.data || error?.message || error?.toString() }, { status: 500 });
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

