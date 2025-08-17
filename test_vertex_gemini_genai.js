// Prueba real: invocar Gemini 2.5 Pro en Vertex AI usando @google/genai (ESM)
import {GoogleGenAI} from '@google/genai';

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0764731811';
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

async function generateContent(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: '¿Cuál es la capital de Francia?',
  });
  console.log('Respuesta Gemini 2.5 Pro:', response.text);
  return response.text;
}

generateContent();
