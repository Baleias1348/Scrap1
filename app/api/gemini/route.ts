import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google API key not configured.' }, { status: 500 });
    }

    // Construir el payload para Gemini 2.5 (Google AI)
    // Leer bio dinámica desde el archivo markdown
    const bioPath = path.join(process.cwd(), 'app/dashboard/personaje_bio.md');
    let systemPrompt = '';
    try {
      systemPrompt = await fs.readFile(bioPath, 'utf-8');
    } catch (e) {
      systemPrompt = `Eres la agente Preventi Flow. Rol profesional no disponible temporalmente.`;
    }

    const body = {
      contents: [
        { role: 'system', parts: [{ text: systemPrompt }] },
        ...(history || []).map((h: { role: string, content: string }) => ({
          role: h.role,
          parts: [{ text: h.content }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 1,
        topK: 40,
      },
    };

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const rawResponse = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: rawResponse.error || 'Error from Gemini API', raw: rawResponse }, { status: 500 });
    }

    const text = rawResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ text, raw: rawResponse });
  } catch (err: any) {
    // Log completo del error para depuración
    return NextResponse.json({ error: err.message || 'Unexpected error', details: err?.stack || err }, { status: 500 });
  }
}
