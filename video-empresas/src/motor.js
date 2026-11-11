/* Motor mínimo: cada fotograma es una función pura del tiempo (renderAt(t)).
   Eso permite previsualizar en el navegador y exportar fotograma a fotograma
   con resultado idéntico. Lienzo fijo 1920 × 1080. */
(function () {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const p = (t, a, b) => clamp((t - a) / (b - a));           // progreso 0..1 entre a y b
  const mix = (a, b, k) => a + (b - a) * k;
  const E = {
    out: (k) => 1 - Math.pow(1 - k, 3),
    inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
    back: (k) => 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2), // llega con un pequeño rebote
  };
  const n = (v) => Math.round(v * 10) / 10;

  // Azar determinista (mismo polvo en cada exportación)
  function azar(semilla) {
    let s = semilla >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  // Paleta Pizarra (assets/pizarra.css de la web)
  const C = {
    carbon: '#1E2627', petroleo: '#173A40', tiza: '#F4F1EA', tizaSuave: '#D6DEDC',
    papel: '#FBF8F2', panel: '#F3EEE3', blanco: '#FFFFFF', tinta: '#23302F',
    gris: '#5D6968', linea: '#CFCBC2',
    turquesa: '#1FB5B0', coral: '#EE6352', amarillo: '#F2C230',
    turquesaTexto: '#16807C', coralTexto: '#C9442F',
  };
  const TEMAS = {
    papel:  { id: 'papel',  fondo: C.papel,  trazo: C.tinta, titulo: C.petroleo, suave: C.gris,      ficha: C.blanco, sub: C.tinta },
    carbon: { id: 'carbon', fondo: C.carbon, trazo: C.tiza,  titulo: C.tiza,     suave: C.tizaSuave, ficha: C.carbon, sub: C.tiza },
  };

  // ── Primitivas SVG (devuelven texto) ──
  function attrs(o) {
    const fill = o.fill || 'none', stroke = o.stroke || 'none';
    let s = ` fill="${fill}" stroke="${stroke}"`;
    if (stroke !== 'none') s += ` stroke-width="${o.sw || 9}" stroke-linecap="round" stroke-linejoin="round"`;
    if (o.op !== undefined && o.op < 1) s += ` opacity="${n(clamp(o.op) * 100) / 100}"`;
    if (o.draw !== undefined && o.draw < 1) s += ` pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="${1 - clamp(o.draw)}"`;
    if (o.dash) s += ` stroke-dasharray="${o.dash}"`;
    if (o.tf) s += ` transform="${o.tf}"`;
    return s;
  }
  const visible = (o) => !(o.op !== undefined && o.op <= 0.004) && !(o.draw !== undefined && o.draw <= 0.002);
  const path = (d, o = {}) => (visible(o) ? `<path d="${d}"${attrs(o)}/>` : '');
  const line = (x1, y1, x2, y2, o = {}) => path(`M${n(x1)},${n(y1)} L${n(x2)},${n(y2)}`, o);
  const circle = (cx, cy, r, o = {}) => (visible(o) ? `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(Math.max(0, r))}"${attrs(o)}/>` : '');
  function rrD(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    return `M${n(x + r)},${n(y)} H${n(x + w - r)} Q${n(x + w)},${n(y)} ${n(x + w)},${n(y + r)} V${n(y + h - r)} Q${n(x + w)},${n(y + h)} ${n(x + w - r)},${n(y + h)} H${n(x + r)} Q${n(x)},${n(y + h)} ${n(x)},${n(y + h - r)} V${n(y + r)} Q${n(x)},${n(y)} ${n(x + r)},${n(y)} Z`;
  }
  const rotDe = (R) => (R.rot ? `rotate(${n(R.rot)} ${n(R.x + R.w / 2)} ${n(R.y + R.h / 2)})` : '');
  const rr = (R, o = {}) => path(rrD(R.x, R.y, R.w, R.h, R.r || 0), Object.assign({ tf: rotDe(R) }, o));
  // Interpola dos rectángulos {x,y,w,h,r,rot}: base de todas las transformaciones de objetos
  const rmix = (A, B, k) => ({
    x: mix(A.x, B.x, k), y: mix(A.y, B.y, k), w: mix(A.w, B.w, k), h: mix(A.h, B.h, k),
    r: mix(A.r || 0, B.r || 0, k), rot: mix(A.rot || 0, B.rot || 0, k),
  });
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function text(s, x, y, o = {}) {
    if (o.op !== undefined && o.op <= 0.004) return '';
    const fam = { titulo: "'Caveat Brush'", nota: "'Caveat'", cuerpo: "'Nunito Sans'" }[o.f || 'cuerpo'];
    const peso = o.w || (o.f === 'nota' ? 600 : 400);
    return `<text x="${n(x)}" y="${n(y)}" font-family="${fam}" font-weight="${peso}" font-size="${o.size || 40}" fill="${o.fill || '#000'}" text-anchor="${o.anchor || 'middle'}"` +
      (o.ls ? ` letter-spacing="${o.ls}"` : '') +
      (o.op !== undefined && o.op < 1 ? ` opacity="${n(clamp(o.op) * 100) / 100}"` : '') +
      (o.tf ? ` transform="${o.tf}"` : '') + (o.clip ? ` clip-path="url(#${o.clip})"` : '') + `>${esc(s)}</text>`;
  }
  const g = (inner, o = {}) => (inner ? `<g${o.tf ? ` transform="${o.tf}"` : ''}${o.op !== undefined && o.op < 1 ? ` opacity="${n(clamp(o.op) * 100) / 100}"` : ''}${o.clip ? ` clip-path="url(#${o.clip})"` : ''}${o.filter ? ` filter="url(#${o.filter})"` : ''}>${inner}</g>` : '');

  // Medición de texto para los «escritos» que se revelan de izquierda a derecha
  const lienzo = document.createElement('canvas').getContext('2d');
  const anchos = {};
  function ancho(s, familia, size, peso = 400) {
    const k = [s, familia, size, peso].join('|');
    if (!(k in anchos)) { lienzo.font = `${peso} ${size}px '${familia}'`; anchos[k] = lienzo.measureText(s).width; }
    return anchos[k];
  }

  window.M = { clamp, p, mix, E, n, azar, C, TEMAS, path, line, circle, rr, rrD, rmix, rotDe, text, g, ancho };
})();
