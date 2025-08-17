import 'dotenv/config';
import { getVertexEmbedding } from '../app/utils/vertexEmbed';

async function main() {
  // Ajusta estos valores según tu entorno
  const texto = 'Esto es una prueba de embeddings con Gemini 2.5 Pro vía Vertex AI.';
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!projectId) {
    console.error('Falta la variable de entorno GOOGLE_CLOUD_PROJECT');
    process.exit(1);
  }

  try {
    const embedding = await getVertexEmbedding(texto, projectId, location);
    console.log('Embedding generado:', embedding);
  } catch (err) {
    console.error('Error al generar el embedding:', err);
    process.exit(1);
  }
}

main();
