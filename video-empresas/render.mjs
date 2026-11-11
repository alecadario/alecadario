// Exporta la animación a MP4 (H.264, 1920 × 1080) fotograma a fotograma,
// y escribe los subtítulos SRT / VTT desde src/subtitulos.js.
//
//   node render.mjs                      → salida/muestra-escenas-1-2.mp4 (+ .srt, .vtt, portada)
//   node render.mjs --fotos 1.5,8.6,21   → solo fotogramas PNG de control en salida/control/
//
// Requiere: Node, Playwright con Chromium y ffmpeg en el PATH.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = path.join(AQUI, 'salida');
const NOMBRE = 'muestra-escenas-1-2';
const FPS = 30;
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await pagina.goto(pathToFileURL(path.join(AQUI, 'src/index.html')).href + '?exportar');
await pagina.evaluate(() => window.listo);
const { duracion, subs } = await pagina.evaluate(() => ({ duracion: window.DURACION, subs: window.SUBTITULOS }));
const foto = async (t) => { await pagina.evaluate((x) => window.renderAt(x), t); return pagina.screenshot({ type: 'png' }); };

mkdirSync(SALIDA, { recursive: true });
if (arg('--fotos')) {
  mkdirSync(path.join(SALIDA, 'control'), { recursive: true });
  for (const t of arg('--fotos').split(',').map(Number)) {
    writeFileSync(path.join(SALIDA, 'control', `t-${t.toFixed(2).padStart(5, '0')}.png`), await foto(t));
  }
} else {
  const mp4 = path.join(SALIDA, `${NOMBRE}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(duracion * FPS);
  for (let f = 0; f < total; f++) {
    if (!ff.stdin.write(await foto(f / FPS))) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 90 === 0) console.log(`fotograma ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise((ok, mal) => ff.on('close', (c) => (c === 0 ? ok() : mal(new Error('ffmpeg terminó con código ' + c)))));

  const marca = (s, sep) => {
    const ms = Math.round(s * 1000), z = (v, l = 2) => String(v).padStart(l, '0');
    return `${z(Math.floor(ms / 3600000))}:${z(Math.floor(ms / 60000) % 60)}:${z(Math.floor(ms / 1000) % 60)}${sep}${z(ms % 1000, 3)}`;
  };
  writeFileSync(path.join(SALIDA, `${NOMBRE}.srt`), subs.map((c, i) => `${i + 1}\n${marca(c.ini, ',')} --> ${marca(c.fin, ',')}\n${c.texto}\n`).join('\n'));
  writeFileSync(path.join(SALIDA, `${NOMBRE}.vtt`), 'WEBVTT\n\n' + subs.map((c) => `${marca(c.ini, '.')} --> ${marca(c.fin, '.')}\n${c.texto}\n`).join('\n'));
  console.log('listo:', mp4);
}
await navegador.close();
