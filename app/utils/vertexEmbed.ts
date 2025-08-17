import { GoogleGenAI } from '@google/genai';

/**
 * Obtiene un embedding de texto usando Gemini 2.5 Pro vía Vertex AI.
 * @param text Texto a embeddar
 * @param projectId ID del proyecto GCP
 * @param location Región (ej: 'us-central1')
 * @returns Embedding vector
 */
export async function getVertexEmbedding(
  text: string,
  projectId: string,
  location = 'us-central1'
): Promise<number[]> {
  const genAI = new GoogleGenAI({
    project: projectId,
    location,
    vertexai: true,
  });
  const response = await genAI.models.embedContent({
    model: 'gemini-2.5-pro',
    contents: text,
  });
  if (!response || !response.embeddings || !response.embeddings[0] || !response.embeddings[0].values) {
    throw new Error('No se pudo obtener el embedding de Gemini 2.5 Pro');
  }
  return response.embeddings[0].values;
}
