import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { context, answer } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Eres un verificador de consistencia legal.
Tu tarea es revisar si la respuesta contradice el contenido del contexto.
- Si contradice, corrige la respuesta basándote SOLO en context.
- Si no contradice, devuelve la respuesta original.
Responde en español y en formato Markdown.
          `.trim()
        },
        {
          role: "user",
          content: JSON.stringify({ context, answer })
        }
      ],
      temperature: 0
    });

    return NextResponse.json({
      correctedAnswer: completion.choices[0]?.message?.content || ""
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
