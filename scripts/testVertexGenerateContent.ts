import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function main() {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!project) {
    console.error('Falta GOOGLE_CLOUD_PROJECT');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenAI({
      project,
      location,
      vertexai: true,
    });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: 'Hola, ¿puedes responder esta prueba de conectividad?'
    });
    console.log('Respuesta completa de Vertex AI:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Error consultando Vertex AI:', err);
    process.exit(1);
  }
}

main();
