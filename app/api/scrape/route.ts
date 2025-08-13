import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const strategy = body.strategy === 'leychile' ? 'leychile_api' : body.strategy;
    const urls: string[] = Array.isArray(body.urls) ? body.urls : [];
    if (!strategy || !urls.length) {
      return new Response(JSON.stringify({ success: false, error: 'Faltan parámetros.' }), { status: 400 });
    }

    // Construir argumentos para el framework Python
    const projectRoot = path.resolve(process.cwd(), 'preventiflow_scraper');
    const scriptPath = path.join(projectRoot, 'main.py');
    const args = [scriptPath, strategy, ...urls];

    // Ejecutar el script Python
    const pythonProc = spawn('python3', args, { cwd: projectRoot });
    let stdout = '';
    let stderr = '';
    pythonProc.stdout.on('data', (data) => { stdout += data.toString(); });
    pythonProc.stderr.on('data', (data) => { stderr += data.toString(); });
    const exitCode: number = await new Promise((resolve) => {
      pythonProc.on('close', resolve);
    });

    // Buscar el archivo de resultados más reciente
    const resultsDir = path.join(projectRoot, 'results');
    const files = fs.readdirSync(resultsDir)
      .filter(f => f.startsWith(strategy))
      .map(f => ({ name: f, time: fs.statSync(path.join(resultsDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);
    if (!files.length) {
      return new Response(JSON.stringify({ success: false, error: 'No se encontró resultado.' }), { status: 500 });
    }
    const latestFile = path.join(resultsDir, files[0].name);
    const output = fs.readFileSync(latestFile, 'utf-8');

    return new Response(JSON.stringify({ success: true, output }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
  }
}
