import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!; // service role
const BUCKET = 'prevencion2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Respect empty path if provided to allow bucket root listing
  const hasPath = searchParams.has('path');
  let path = hasPath ? (searchParams.get('path') || '') : '12_plantillas/';
  if (path === '/') path = '';
  const includeKeeps = (searchParams.get('includeKeeps') || 'false').toLowerCase() === 'true';

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await supabase.storage.from(BUCKET).list(path, { limit: 1000 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const folders: { name: string; path: string }[] = [];
    const files: { name: string; path: string; size?: number | null; updated_at?: string | null; icon?: string }[] = [];

    for (const item of data || []) {
      if (item.name === '.keep' && !includeKeeps) continue;
      const base = path ? (path.endsWith('/') ? path : path + '/') : '';
      const itemPath = base + item.name;
      if (item.id === null) {
        // folder
        folders.push({ name: item.name, path: itemPath + '/' });
      } else {
        files.push({ name: item.name, path: itemPath, size: (item as any).metadata?.size ?? null, updated_at: (item as any).updated_at ?? null });
      }
    }

    return NextResponse.json({ path: path || '', folders, files }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error listando árbol', details: err?.message || String(err) }, { status: 500 });
  }
}
