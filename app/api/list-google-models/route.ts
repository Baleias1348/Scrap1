import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

export async function GET(req: NextRequest) {
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${GOOGLE_API_KEY}`);
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || err?.toString() }, { status: 500 });
  }
}
