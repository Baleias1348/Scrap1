import { GoogleAuth } from 'google-auth-library';

/**
 * Obtiene un embedding de texto usando Vertex AI (Google Cloud) vía REST.
 * @param text Texto a embeddar
 * @param projectId ID del proyecto GCP
 * @param location Región (ej: 'us-central1')
 * @returns Embedding vector
 */
export async function getVertexEmbedding(text: string, projectId: string, location = 'us-central1'): Promise<number[]> {
  // Autenticación con service account
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  // Endpoint Vertex AI REST
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/embedding-001:predict`;

  // Payload según docs Vertex AI
  const body = {
    instances: [
      {
        content: text,
      },
    ],
    parameters: {
      task_type: 'RETRIEVAL_QUERY',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${(accessToken as any).token || accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vertex AI embedding error: ${err}`);
  }
  const data = await res.json();
  // Devuelve el vector del primer resultado
  return data.predictions[0].embeddings.values;
}
