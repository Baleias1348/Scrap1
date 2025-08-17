import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("Modelos disponibles:");
    for (const model of models) {
      console.log("-", model.name, model.description ? `| ${model.description}` : "");
    }
  } catch (e) {
    console.error("Error al listar modelos:", e?.response?.data || e?.message || e);
  }
}

listModels();
