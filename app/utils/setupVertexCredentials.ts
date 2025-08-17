import fs from 'fs';

/**
 * Configura las credenciales de Vertex AI para entornos locales y Netlify.
 */
export function setupVertexCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.NETLIFY) {
    const path = '/tmp/vertex-service-account.json';
    fs.writeFileSync(path, process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path;
  }
  // En local, solo asegúrate de tener GOOGLE_APPLICATION_CREDENTIALS apuntando al archivo json
}
