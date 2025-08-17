// Script para listar modelos disponibles en Vertex AI (incluyendo Gemini) usando cuenta de servicio
import {ModelServiceClient} from '@google-cloud/aiplatform';

const project = process.env.VERTEX_PROJECT_ID || 'gen-lang-client-0764731811';
const location = process.env.VERTEX_LOCATION || 'us-central1';

async function listModels() {
  const client = new ModelServiceClient({apiEndpoint: `${location}-aiplatform.googleapis.com`});
  const parent = `projects/${project}/locations/${location}`;
  const [models] = await client.listModels({parent});
  console.log('Modelos disponibles en Vertex AI:');
  for (const model of models) {
    console.log(`- ${model.displayName || model.name} | ${model.name}`);
  }
}

listModels().catch(console.error);
