import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function testGemini(modelName) {
  try {
    console.log(`[TEST] Llamando a ${modelName}...`);
    const llmModel = genAI.getGenerativeModel({ model: modelName });
    const resp = await llmModel.generateContent("hola");
    console.log(`[TEST] Respuesta de ${modelName}:`, resp.response.text());
  } catch (e) {
    console.error(`[TEST] Error al conectar con ${modelName}:`, e?.response?.data || e?.message || e);
    return false;
  }
  return true;
}

(async () => {
  if (!(await testGemini('gemini-pro'))){
    await testGemini('gemini-1.5-pro-latest');
  }
})();
