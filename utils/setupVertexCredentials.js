// Este helper configura las credenciales de Vertex AI según el entorno (local o Netlify)
const fs = require('fs');

function setupVertexCredentials() {
  // En Netlify, la variable GOOGLE_SERVICE_ACCOUNT_JSON debe contener el JSON como string
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.NETLIFY) {
    const path = '/tmp/vertex-service-account.json';
    fs.writeFileSync(path, process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path;
  }
  // En local, solo asegúrate de tener GOOGLE_APPLICATION_CREDENTIALS apuntando al archivo json
  // No se hace nada extra aquí: el SDK lo toma automáticamente
}

module.exports = setupVertexCredentials;
