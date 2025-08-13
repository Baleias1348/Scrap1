import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

export async function GET(req: NextRequest) {
  try {
    // const models = await genAI.listModels(); // No soportado
    return NextResponse.json({ models: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || err?.toString() }, { status: 500 });
  }
}
