// Prueba real: invocar Gemini 2.5 Pro en Vertex AI usando service account y @google-cloud/aiplatform
import {PredictionServiceClient} from '@google-cloud/aiplatform';

const project = process.env.VERTEX_PROJECT_ID || 'gen-lang-client-0764731811';
const location = process.env.VERTEX_LOCATION || 'us-central1';
const apiEndpoint = `${location}-aiplatform.googleapis.com`;

const model = `projects/${project}/locations/${location}/publishers/google/models/gemini-2.5-pro`;

async function main() {
  const client = new PredictionServiceClient({apiEndpoint});
  // Para Gemini 2.5 Pro, la instancia debe usar el campo 'content'
  const instance = { content: '¿Cuál es la capital de Francia?' };
  const request = {
    model,
    instances: [instance],
    parameters: { temperature: 0.2, maxOutputTokens: 256 }
  };
  try {
    const [response] = await client.predict(request);
    console.log('Respuesta Gemini 2.5 Pro:', JSON.stringify(response, null, 2));
  } catch (e) {
    console.error('Error al invocar Gemini 2.5 Pro:', e?.message || e);
  }
}

main();
