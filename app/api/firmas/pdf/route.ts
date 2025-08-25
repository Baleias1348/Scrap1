import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  return Response.json({ error: 'not_implemented' }, { status: 501 });
}