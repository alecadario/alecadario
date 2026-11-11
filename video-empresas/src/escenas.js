/* Escenas del video de empresas. Cada escena dibuja en función del tiempo y
   del FORMATO activo: HORIZONTAL (web) y VERTICAL (redes) son dos composiciones
   distintas de los mismos dibujos, no un recorte.
   Los tiempos (T) y subtítulos vienen del montaje elegido en montajes.js. */
(function () {
  const { p, mix, E, n, azar, C, TEMAS, path, line, circle, rr, rrD, rmix, rotDe, text, g, ancho } = window.M;

  const clave = new URLSearchParams(location.search).get('montaje') === 'redes' ? 'redes' : 'web';
  const MONTAJE = window.MONTAJES[clave], T = MONTAJE.T, D = MONTAJE.barrido;

  // Ubicación de un objeto: su punto propio (ox, oy) cae en (px, py) de la pantalla a escala s.
  const ubica = (ox, oy, px, py, s) => ({ x: px - ox * s, y: py - oy * s, s });
  const entre = (A, B, k) => ({ x: mix(A.x, B.x, k), y: mix(A.y, B.y, k), s: mix(A.s, B.s, k) });
  const puntoDe = (G, ox, oy) => ({ x: G.x + ox * G.s, y: G.y + oy * G.s, s: G.s });
  const FIJO = { x: 0, y: 0, s: 1 };
  const grupo = (s, U) => g(s, { tf: U.x || U.y || U.s !== 1 ? `translate(${n(U.x)} ${n(U.y)}) scale(${Math.round(U.s * 1000) / 1000})` : '', op: U.op });
  const rectDe = (U, w, h, r, rot) => ({ x: U.x, y: U.y, w: w * U.s, h: h * U.s, r: r * U.s, rot });

  // ═════════ Formatos ═════════
  const HORIZONTAL = {
    W: 1920, H: 1080, inclinacion: 130,
    aviso: { s: 'MONTAJE DE TRABAJO · SUBTÍTULOS PROVISIONALES, SIN LOCUCIÓN', x: 60, y: 62, size: 19 },
    titular: { x: 960, y: 222, size: 150, max: 1500 },
    sub: { x: 960, y: 985, size: 46, max: 1640, alto: 60 },
    textura: { y: 290, h: 560 },
    // Escenas 1 y 2
    piso: { y: 740, x1: 140, x2: 1780, sw: 7 },
    banco: { de: { x: 250, y: 590, w: 440, h: 28, r: 9 }, a: { x: 180, y: 620, w: 1560, h: 28, r: 9 }, patas: [[300, 250], [640, 1670]], abre: 26, sw: 9 },
    bajaPesa: 30, clientes: true,
    nota: { x: 470, y: 392, size: 46 },
    rotulos: { modo: 'fila', y: 832, size: 64, xs: [484, 960, 1466] },
    s2fin: ubica(1290, 618, 290, 800, 2.3),
    base: (t) => 1 - p(t, T.zoom[0], T.zoom[0] + 0.4),
    pesa: (t) => ({ ...FIJO, op: 1 - p(t, T.zoom[0], T.zoom[0] + 0.4) }),
    maquina: (t) => ({ ...FIJO, op: 1 - p(t, T.zoom[0], T.zoom[0] + 0.4) }),
    recibos: (t) => ({ ...entre(FIJO, HORIZONTAL.s2fin, E.inOut(p(t, ...T.zoom))), op: 1 }),
    s3: {
      vendedor: { x: 290, y: 800, s: 2.3 }, mesa: [97, 470, 809], guion: { x: 96, y: 292, s: 1.5 },
      O: [450, 650], E: [1490, 650], cliente: { x: 1670, y: 770, s: 1.9 },
      tema: { d: 'M710,650 C800,650 830,430 980,430', n: [980, 430], nota: [980, 374] },
      sil: { d: 'M710,650 C800,650 830,850 980,850', n: [980, 850], globo: [1012, 756] },
      otra: { x: 1690, y: 400, s: 1.6, nota: [1690, 452] },
      rumbos: [{ d: 'M980,430 C1150,430 1290,300 1560,330' }, { d: 'M980,430 C1110,470 1190,560 1300,545', q: [1338, 566] }, { d: 'M980,850 C1140,850 1240,800 1360,815', q: [1398, 838] }],
    },
    s4: {
      tarjeta: { x: 690, y: 320, w: 540, h: 380, r: 16, rot: -3 }, tarjeta2: { x: 290, y: 370, w: 450, h: 316, r: 14, rot: -4 },
      q1: { x: 370, y: 420, rot: -5 }, q2: { x: 1560, y: 440, rot: 4 }, qSize: 64,
      edificio: { x: 1300, y: 370, s: 1 }, flecha: [800, 540, 1230], nota: [1450, 750],
    },
    s5: {
      piso: { y: 820, x1: 140, x2: 1780, sw: 7 }, entrenador: { x: 400, y: 820, s: 1.3 }, atleta: { x: 860, y: 820, s: 1.3 },
      tabla: { x: 1320, y: 350, w: 370, h: 420, r: 14, rot: 2 },
      pasos: { size: 76, pos: [[330, 222], [735, 222], [1140, 222], [1530, 222]], flechas: [1, 1, 1] },
    },
    s6: {
      circulos: [{ x: 270, y: 540, s: 1 }, { x: 560, y: 540, s: 1 }, { x: 850, y: 540, s: 1 }], rotSize: 52,
      diag: { x: 120, y: 395, w: 880, h: 365, r: 30 }, diagSize: 64,
      caminos: [
        { d: 'M1015,540 C1065,520 1090,455 1140,440', x: 1162, y: 456, s: 'Diseño del sistema' },
        { d: 'M1015,578 H1140', x: 1162, y: 594, s: 'Formación' },
        { d: 'M1015,616 C1065,636 1090,700 1140,716', x: 1162, y: 732, s: 'Asesoramiento para implementar' }],
      caminoSize: 50, anclaCamino: 'start', notaSigue: { x: 1420, y: 352, size: 46, s: 'si seguimos trabajando juntos' },
    },
    s7: { globos: [{ x: 250, y: 340, w: 420, h: 170 }, { x: 750, y: 340, w: 420, h: 170 }, { x: 1250, y: 340, w: 420, h: 170 }], linea: { x1: 400, x2: 1520, y: 700 } },
    s8: {
      caja: { x: 960, y: 560, s: 1.5 }, caja2: { x: 560, y: 580, s: 1.1 }, lupa: { x: 1260, y: 510, s: 1 }, entender: { x: 1260, y: 800, size: 80 },
      nombre: { x: 960, y: 330, size: 160, max: 1500 }, oike: { x: 960, y: 428, size: 50 },
      lema: { x: 960, y: 610, size: 84, alto: 90, lineas: ['Las oportunidades también se construyen.'] },
      invita: { x: 960, y: 810, size: 104 }, web: null,
    },
  };

  // Vertical: pocos elementos grandes, uno por vez. Zonas libres para las
  // aplicaciones: 260 px arriba, 480 px abajo y la columna derecha inferior.
  const V = {
    pesa: [ubica(470, 588, 335, 1088, 1.2), ubica(484, 489, 540, 850, 1.9)],
    maquina: [ubica(960, 740, 820, 1220, 1.2), ubica(960, 486, 540, 850, 2.1)],
    recibos: [ubica(1495, 535, 320, 720, 0.9), ubica(1466, 470, 540, 850, 1.75)],
  };
  const foco = (P, t, a) => entre(P[0], P[1], E.inOut(p(t, a, a + 0.7)));
  const af = () => T.fichas[0] - 0.25, ac = () => T.curso[0] - 0.2, ae = () => T.ensayo[0] - 0.2;
  const VERTICAL = {
    W: 1080, H: 1920, inclinacion: 230,
    aviso: { s: 'MONTAJE DE TRABAJO · SUBTÍTULOS PROVISIONALES, SIN LOCUCIÓN', x: 70, y: 292, size: 20 },
    titular: { x: 540, y: 480, size: 190, max: 920 },
    sub: { x: 510, y: 1372, size: 60, max: 800, alto: 76 },
    textura: { y: 560, h: 700 },
    piso: { y: 1220, x1: 40, x2: 1040, sw: 8 },
    banco: { de: { x: 70, y: 1090, w: 530, h: 32, r: 10 }, a: { x: 60, y: 1090, w: 940, h: 32, r: 10 }, patas: [[130, 110], [540, 950]], abre: 30, sw: 11 },
    bajaPesa: 0, clientes: false, mesaEnsayo: true,
    nota: { x: 780, y: 650, size: 52 },
    rotulos: { modo: 'foco', x: 540, y: 480, size: 136, hasta: () => [ac() - 0.05, ae() - 0.05, T.pregunta2[0] - 0.4] },
    s2fin: V.recibos[1],
    // cada recurso pasa solo al centro; al final quedan las dos personas ensayando
    base: (t) => 1 - p(t, af() - 0.05, af() + 0.25),
    pesa: (t) => ({ ...foco(V.pesa, t, af()), op: 1 - p(t, ac() - 0.05, ac() + 0.2) }),
    maquina: (t) => ({ ...foco(V.maquina, t, ac()), op: 1 - p(t, af() - 0.05, af() + 0.2) + p(t, ac(), ac() + 0.25) * (1 - p(t, ae() - 0.05, ae() + 0.2)) }),
    recibos: (t) => ({ ...foco(V.recibos, t, ae()), op: 1 - p(t, af() - 0.05, af() + 0.2) + p(t, ae(), ae() + 0.25) }),
    s3: {
      vendedor: { x: 250, y: 1240, s: 2.3 }, mesa: [80, 430, 1249], guion: { x: 66, y: 790, s: 1.25 },
      O: [395, 1040], E: [745, 705], cliente: { x: 850, y: 745, s: 1.7 },
      tema: { d: 'M482,956 C430,900 330,860 300,745', n: [300, 745], nota: [440, 778] },
      sil: null,
      otra: { x: 800, y: 1205, s: 1.7, nota: [800, 990] },
      rumbos: [{ d: 'M482,956 C600,960 660,1050 700,1105' }, { d: 'M300,745 C310,650 400,605 500,596', q: [538, 616] }],
    },
    s5: {
      piso: { y: 1240, x1: 40, x2: 1040, sw: 8 }, entrenador: { x: 230, y: 1240, s: 1.5 }, atleta: { x: 690, y: 1240, s: 1.5 },
      tabla: null,
      pasos: { size: 88, pos: [[290, 400], [770, 400], [290, 530], [770, 530]], flechas: [1, 0, 1] },
    },
    s6: {
      circulos: [{ x: 190, y: 800, s: 1.2 }, { x: 540, y: 800, s: 1.2 }, { x: 890, y: 800, s: 1.2 }], rotSize: 52,
      diag: { x: 36, y: 630, w: 1008, h: 400, r: 36 }, diagSize: 64,
      caminos: [
        { d: 'M300,1040 C290,1080 220,1100 196,1132', x: 190, y: 1196, s: 'Diseño' },
        { d: 'M540,1040 V1132', x: 540, y: 1196, s: 'Formación' },
        { d: 'M780,1040 C790,1080 810,1100 816,1132', x: 812, y: 1196, s: 'Acompañamiento' }],
      caminoSize: 46, anclaCamino: 'middle', notaSigue: { x: 540, y: 1262, size: 44, s: 'si seguimos trabajando juntos' },
    },
    s8: {
      caja: { x: 540, y: 880, s: 1.9 }, caja2: { x: 540, y: 640, s: 1 }, lupa: { x: 520, y: 1010, s: 0.9 }, entender: { x: 540, y: 1246, size: 76 },
      nombre: { x: 540, y: 560, size: 190, max: 900 }, oike: { x: 540, y: 660, size: 54 },
      lema: { x: 540, y: 840, size: 92, alto: 104, lineas: ['Las oportunidades también', 'se construyen.'] },
      invita: { x: 540, y: 1140, size: 100 }, web: { x: 540, y: 1268, size: 56, s: 'en alecadario.com' },
    },
  };
  const F = MONTAJE.formato === 'vertical' ? VERTICAL : HORIZONTAL;
  window.FORMATO = { montaje: clave, W: F.W, H: F.H };
  window.DURACION = T.fin;
  window.SUBTITULOS = MONTAJE.subtitulos;
  window.ARCHIVO = MONTAJE.archivo;

  // ═════════ Piezas comunes ═════════
  function persona(tm, col, d = 1) { // busto; origen en el centro de la base
    return circle(0, -82, 31, { stroke: tm.trazo, sw: 8, fill: tm.fondo, draw: d }) +
      path('M-58,0 C-58,-52 58,-52 58,0', { stroke: tm.trazo, sw: 8, fill: tm.fondo, draw: d }) +
      path('M-30,-12 q30,-12 60,0', { stroke: col, sw: 6, draw: d });
  }
  function guionW(tm, op = 1) { // hoja de guion; origen arriba a la izquierda
    const R = { x: 0, y: 0, w: 108, h: 122, r: 8, rot: -4 };
    return rr(R, { stroke: tm.trazo, sw: 7, fill: tm.ficha }) + g(
      text('guion', 54, 36, { f: 'nota', size: 30, fill: tm.trazo }) +
      [0, 1, 2].map((j) => text(String(j + 1), 16, 66 + j * 22, { f: 'nota', size: 22, fill: C.coral, anchor: 'start' }) +
        line(36, 59 + j * 22, 88 - j * 10, 59 + j * 22, { stroke: tm.suave, sw: 4 })).join(''), { tf: rotDe(R), op });
  }
  function figura(tm, tipo, sube = 0, extra = 0) { // cuerpo entero; origen entre los pies
    const st = { stroke: tm.trazo, sw: 9 };
    let s = line(-24, 0, 0, -120, st) + line(24, 0, 0, -120, st) + line(0, -120, 0, -232, st) + circle(0, -270, 34, { ...st, fill: tm.fondo });
    if (tipo === 'entrenador') {
      s += path('M-34,-282 q34,-46 68,0 Z', { stroke: C.coral, sw: 7, fill: C.coral }) + line(34, -283, 62, -283, { stroke: C.coral, sw: 8 }) +
        path('M0,-212 L44,-168 L74,-196', st) + rr({ x: 64, y: -240, w: 46, h: 58, r: 5, rot: 8 }, { stroke: tm.trazo, sw: 6, fill: tm.ficha }) +
        path('M0,-212 L-40,-170 L-10,-146', st);
    } else {
      const hy = -222 - sube * 118;
      s += path(`M0,-212 L-64,${n(-196 - sube * 50)} L-56,${n(hy)}`, st) + path(`M0,-212 L64,${n(-196 - sube * 50)} L56,${n(hy)}`, st) +
        line(-150, hy, 150, hy, { stroke: tm.trazo, sw: 8 });
      [-1, 1].forEach((k) => {
        s += rr({ x: k > 0 ? 124 : -146, y: hy - 36, w: 22, h: 72, r: 6 }, { fill: tm.trazo }) +
          rr({ x: k > 0 ? 150 : -168, y: hy - 26, w: 18, h: 52, r: 5 }, { fill: C.coral, op: extra });
      });
      s += path('M-16,-196 q16,10 32,0', { stroke: C.turquesa, sw: 6 });
    }
    return s;
  }
  function flecha(x1, y1, x2, y2, o) { // recta con punta
    const a = Math.atan2(y2 - y1, x2 - x1), L = 20, pt = (da) => `${n(x2 - L * Math.cos(a + da))},${n(y2 - L * Math.sin(a + da))}`;
    return line(x1, y1, x2, y2, o) + path(`M${pt(0.5)} L${n(x2)},${n(y2)} L${pt(-0.5)}`, { ...o, dash: null, draw: o.draw === undefined ? 1 : p(o.draw, 0.8, 1) });
  }
  function subrayado(x0, y, w, color, k, sw = 9) {
    return path(`M${n(x0)},${n(y)} q${n(w / 4)},-12 ${n(w / 2)},-2 t${n(w / 2)},-3`, { stroke: color, sw, draw: E.out(k) });
  }
  let nClip = 0;
  function escrito(s, P, k, color, raya, op = 1) { // texto que se escribe de izquierda a derecha
    if (k <= 0 || op <= 0) return '';
    let size = P.size;
    if (P.max) size = Math.min(size, Math.floor(size * P.max / ancho(s, 'Caveat Brush', size)));
    const w = ancho(s, 'Caveat Brush', size), x0 = P.x - w / 2, id = 'c' + (nClip++);
    return g(`<clipPath id="${id}"><rect x="${n(x0 - 20)}" y="${n(P.y - size * 1.1)}" width="${n((w + 40) * Math.min(1, k / 0.85))}" height="${n(size * 1.6)}"/></clipPath>` +
      text(s, P.x, P.y, { f: 'titulo', size, fill: color, clip: id }) +
      (raya ? subrayado(x0 + w * 0.08, P.y + size * 0.2, w * 0.84, raya, p(k, 0.85, 1)) : ''), { op });
  }
  function partir(s, P) { // dos líneas equilibradas si no entra en una
    if (ancho(s, 'Nunito Sans', P.size, 700) <= P.max) return [s];
    const pal = s.split(' ');
    let mejor = 1, dif = Infinity;
    for (let i = 1; i < pal.length; i++) {
      const d = Math.abs(pal.slice(0, i).join(' ').length - pal.slice(i).join(' ').length);
      if (d < dif) { dif = d; mejor = i; }
    }
    return [pal.slice(0, mejor).join(' '), pal.slice(mejor).join(' ')];
  }
  function subtitulo(tm, t) {
    const P = F.sub;
    let s = '';
    MONTAJE.subtitulos.forEach((c) => {
      if (c.soloArchivo) return;
      const op = Math.min(p(t, c.ini, c.ini + 0.12), 1 - p(t, c.fin - 0.12, c.fin));
      if (op <= 0) return;
      const ls = partir(c.texto, P);
      const size = Math.min(P.size, ...ls.map((l) => Math.floor(P.size * P.max / ancho(l, 'Nunito Sans', P.size, 700))));
      ls.forEach((l, i) => { s += text(l, P.x, P.y + (i - (ls.length - 1) / 2) * P.alto, { size, w: 700, fill: tm.sub, op }); });
    });
    return s;
  }

  // ═════════ Escenas 1 y 2 · gimnasio que se vuelve escritorio ═════════
  function polvoEn(superficies, t, semilla) {
    const k = p(t, ...T.polvo);
    if (k <= 0) return '';
    const rnd = azar(semilla);
    let s = '';
    superficies.forEach(([x1, x2, y], i) => {
      const d = E.out(p(k, i * 0.05, 0.55 + i * 0.05));
      s += path(`M${x1},${y} q${(x2 - x1) / 4},-7 ${(x2 - x1) / 2},-1 t${(x2 - x1) / 2},0`, { stroke: C.linea, sw: 11, draw: d });
      for (let j = 0; j < (x2 - x1) / 9; j++) {
        const x = mix(x1, x2, rnd()), cae = E.out(p(k, rnd() * 0.5, 0.5 + rnd() * 0.5));
        s += circle(x, y - 6 - 70 * (1 - cae) - rnd() * 8, 2 + rnd() * 2.6, { fill: C.gris, op: cae * 0.55 });
      }
    });
    return s;
  }
  function pisoD(tm, P, d) {
    const w = P.x2 - P.x1;
    return path(`M${P.x1},${P.y} C${n(P.x1 + w * 0.23)},${P.y - 5} ${n(P.x1 + w * 0.7)},${P.y + 5} ${P.x2},${P.y - 1}`, { stroke: tm.trazo, sw: P.sw, draw: d });
  }
  function bancoEscritorio(tm, t, k) {
    const B = F.banco, d = E.out(p(t, ...T.banco));
    const tabla = rmix(B.de, B.a, k);
    const p1 = mix(B.patas[0][0], B.patas[0][1], k), p2 = mix(B.patas[1][0], B.patas[1][1], k), abre = mix(B.abre, 0, k);
    let s = rr(tabla, { stroke: tm.trazo, sw: B.sw, fill: tm.fondo, draw: d }) +
      line(p1, tabla.y + tabla.h, p1 - abre, F.piso.y, { stroke: tm.trazo, sw: B.sw, draw: d }) +
      line(p2, tabla.y + tabla.h, p2 + abre, F.piso.y, { stroke: tm.trazo, sw: B.sw, draw: d });
    if (tm.id === 'papel') s += polvoEn([[B.de.x + 12, B.de.x + 80, B.de.y - 4], [B.de.x + B.de.w - 78, B.de.x + B.de.w - 10, B.de.y - 4]], t, 11);
    return s;
  }
  const DISCOS = [
    { x: 338, y: 482, w: 24, h: 88, r: 8 }, { x: 366, y: 464, w: 30, h: 124, r: 10 },
    { x: 544, y: 464, w: 30, h: 124, r: 10 }, { x: 578, y: 482, w: 24, h: 88, r: 8 },
  ];
  const FICHAS = [
    { x: 262, y: 500, w: 178, h: 110, r: 12, rot: -6 }, { x: 318, y: 372, w: 178, h: 110, r: 12, rot: 4 },
    { x: 528, y: 366, w: 178, h: 110, r: 12, rot: -3 }, { x: 478, y: 502, w: 178, h: 110, r: 12, rot: 5 },
  ];
  const ACENTOS = [C.turquesa, C.coral, C.amarillo, C.turquesa];
  function pesaFichas(tm, t, k) { // pesa → fichas de contactos (genéricas, no una interfaz)
    const a = p(t, ...T.pesa);
    if (a <= 0) return '';
    const m = E.back(p(t, ...T.fichas)), det = p(t, T.fichas[0] + 0.55, T.fichas[1] + 0.25);
    const baja = F.bajaPesa * k * (1 - m);
    let s = '';
    const bw = 152 * (1 - p(t, T.fichas[0], T.fichas[0] + 0.4));
    if (bw > 1) s += rr({ x: 470 - bw / 2, y: 519 + baja, w: bw, h: 14, r: 5 }, { fill: tm.trazo });
    DISCOS.forEach((Dk, i) => {
      const R = rmix({ ...Dk, y: Dk.y + baja }, FICHAS[i], m);
      s += rr(R, { fill: tm.trazo, stroke: tm.fondo, sw: 4 * m });
      if (det > 0) {
        s += g(
          circle(34, 40, 17, { fill: ACENTOS[i] }) +
          line(66, 32, 148, 32, { stroke: tm.fondo, sw: 8 }) +
          line(66, 52, 122, 52, { stroke: tm.fondo, sw: 5, op: 0.7 }) +
          line(22, 84, 156, 84, { stroke: tm.fondo, sw: 4, op: 0.45, draw: det }),
          { tf: `${rotDe(R)} translate(${n(R.x)} ${n(R.y)})`, op: det });
      }
    });
    if (tm.id === 'papel') s += polvoEn([[336, 364, 478], [364, 398, 460], [404, 536, 515], [542, 576, 460], [576, 604, 478]], t, 7);
    return g(s, { tf: `translate(0 ${n((1 - E.back(a)) * -260)})`, op: p(t, T.pesa[0], T.pesa[0] + 0.2) });
  }
  function maquinaCurso(tm, t) { // máquina → curso (la pila de pesos pasa a ser el temario)
    const a = p(t, ...T.maquina);
    if (a <= 0) return '';
    const m = E.back(p(t, ...T.curso)), fuera = 1 - p(t, T.curso[0], T.curso[0] + 0.3), det = p(t, T.curso[0] + 0.55, T.curso[1] + 0.25);
    const marco = rmix({ x: 830, y: 310, w: 260, h: 430, r: 16 }, { x: 790, y: 352, w: 340, h: 224, r: 18 }, m);
    let s = rr(marco, { stroke: tm.trazo, fill: tm.fondo, draw: E.out(p(t, T.maquina[0], T.maquina[0] + 0.7)) });
    const cab = E.out(p(t, T.maquina[0] + 0.45, T.maquina[1]));
    s += g(
      line(868, 350, 1052, 350, { stroke: tm.trazo, sw: 7, draw: cab }) +
      line(960, 372, 960, 586, { stroke: tm.trazo, sw: 5, draw: cab }) +
      line(884, 350, 884, 446, { stroke: tm.trazo, sw: 5, draw: cab }) +
      line(856, 452, 912, 452, { stroke: C.coral, sw: 10, draw: cab }),
      { op: fuera });
    const px = mix(960, 1082, m), py = mix(350, 398, m);
    s += circle(px, py, mix(20, 24, m), { stroke: tm.trazo, sw: 6, fill: tm.fondo, op: p(t, T.maquina[0] + 0.4, T.maquina[0] + 0.6) });
    s += path(`M${px - 7},${py - 11} L${px + 11},${py} L${px - 7},${py + 11} Z`, { fill: C.coral, op: det });
    const FILAS = [190, 150, 172, 128];
    for (let i = 0; i < 4; i++) {
      const R = rmix({ x: 885, y: 590 + i * 36, w: 150, h: 28, r: 7 }, { x: 868, y: 436 + i * 33, w: FILAS[i], h: 9, r: 4 }, m);
      s += rr(R, { fill: tm.trazo, op: p(t, T.maquina[0] + 0.5 + i * 0.08, T.maquina[0] + 0.62 + i * 0.08) * mix(1, 0.75, m) });
      const dc = p(t, T.curso[0] + 0.6 + i * 0.1, T.curso[0] + 0.8 + i * 0.1);
      s += path(`M828,${440 + i * 33} l7,8 l14,-16`, { stroke: ACENTOS[i], sw: 6, draw: dc });
    }
    s += text('Curso', 824, 414, { f: 'titulo', size: 50, fill: tm.trazo, anchor: 'start', op: det });
    s += line(960, 578, 960, 618, { stroke: tm.trazo, draw: det }) + line(896, 618, 1024, 618, { stroke: tm.trazo, draw: det });
    if (tm.id === 'papel') {
      s += polvoEn([[838, 1082, 305], [888, 1032, 586]], t, 23);
      const w = E.out(p(p(t, ...T.polvo), 0.45, 1)); // telaraña pequeña
      s += g(
        line(0, 0, 70, 20, { stroke: C.gris, sw: 2.5, draw: w }) + line(0, 0, 52, 52, { stroke: C.gris, sw: 2.5, draw: w }) + line(0, 0, 20, 70, { stroke: C.gris, sw: 2.5, draw: w }) +
        path('M34,10 q0,14 -24,24', { stroke: C.gris, sw: 2.5, draw: w }) + path('M58,17 q-2,30 -41,41', { stroke: C.gris, sw: 2.5, draw: w }),
        { tf: 'translate(838 318)', op: 0.8 });
    }
    return s;
  }
  function reciboD(R, zig) {
    const r = R.r || 0, x = R.x, y = R.y, w = R.w, h = R.h, dientes = 8, paso = w / dientes;
    let d = `M${n(x)},${n(y + h)} V${n(y + r)} Q${n(x)},${n(y)} ${n(x + r)},${n(y)} H${n(x + w - r)} Q${n(x + w)},${n(y)} ${n(x + w)},${n(y + r)} V${n(y + h)}`;
    for (let i = 1; i <= dientes; i++) d += ` L${n(x + w - paso * (i - 0.5))},${n(y + h - zig)} L${n(x + w - paso * i)},${n(y + h)}`;
    return d + ' Z';
  }
  const RECIBOS = [
    { en: 'recibo1', de: { x: 1322, y: 392, w: 190, h: 240, r: 6, rot: -8 }, a: { x: 1222, y: 318, w: 228, h: 106, r: 46, rot: 0 }, rotulo: 'pesas' },
    { en: 'recibo2', de: { x: 1478, y: 352, w: 190, h: 240, r: 6, rot: 6 }, a: { x: 1480, y: 372, w: 228, h: 106, r: 46, rot: 0 }, rotulo: 'máquina' },
    { en: 'recibo3', de: { x: 1376, y: 432, w: 236, h: 292, r: 6, rot: -2 }, a: { x: 1416, y: 498, w: 108, h: 122, r: 8, rot: -4 }, rotulo: 'gimnasio' },
  ];
  function recibosEnsayo(tm, t) { // recibos → roleplay (dos voces y un guion)
    const m = E.inOut(p(t, ...T.ensayo)), sale = 1 - p(t, T.ensayo[0], T.ensayo[0] + 0.3), det = p(t, T.ensayo[0] + 0.6, T.ensayo[1] + 0.3);
    let s = '';
    if (det > 0) {
      s += line(1206, 622, 1726, 622, { stroke: tm.trazo, draw: det, op: F.mesaEnsayo ? 1 : p(t, ...T.zoom) });
      [[1290, C.turquesa], [1652, C.amarillo]].forEach(([cx, col]) => { s += g(persona(tm, col, det), { tf: `translate(${cx} 618)` }); });
    }
    RECIBOS.forEach((r, i) => {
      const en = T[r.en], a = p(t, en, en + 0.4);
      if (a <= 0) return;
      const R = rmix(r.de, r.a, m), zig = 14 * (1 - Math.min(1, m * 2.5));
      let c = path(zig > 0.3 ? reciboD(R, zig) : rrD(R.x, R.y, R.w, R.h, R.r), { stroke: tm.trazo, sw: 7, fill: tm.ficha });
      const k = r.de.w / 190;
      c += g(
        text(r.rotulo, r.de.w / 2, 58 * k, { f: 'nota', size: 42 * k, fill: tm.trazo }) +
        line(28 * k, 92 * k, r.de.w - 28 * k, 92 * k, { stroke: tm.suave, sw: 4, op: 0.6 }) +
        line(28 * k, 122 * k, r.de.w - 60 * k, 122 * k, { stroke: tm.suave, sw: 4, op: 0.6 }) +
        text('$', r.de.w / 2, 198 * k, { f: 'titulo', size: 76 * k, fill: C.coral }),
        { tf: `translate(${n(R.x)} ${n(R.y)})`, op: sale });
      if (det > 0 && i < 2) {
        const cx = R.x + R.w / 2;
        c += text(String(i + 1), R.x + 46, R.y + 74, { f: 'titulo', size: 64, fill: i ? C.amarillo : C.turquesa, op: det }) +
          path(`M${R.x + 84},${R.y + 44} h${96 * det}`, { stroke: tm.trazo, sw: 6, op: det }) +
          path(`M${R.x + 84},${R.y + 68} h${66 * det}`, { stroke: tm.trazo, sw: 6, op: det * 0.7 });
        const hacia = i ? 1 : -1;
        c += path(`M${cx - 16 + hacia * 44},${R.y + R.h - 3} l${hacia * 12},26 l${18 - hacia * 2},-27`, { stroke: tm.trazo, sw: 7, fill: tm.ficha, op: det });
      }
      if (det > 0 && i === 2) {
        c += g(
          text('guion', 54, 36, { f: 'nota', size: 30, fill: tm.trazo }) +
          [0, 1, 2].map((j) => text(String(j + 1), 16, 66 + j * 22, { f: 'nota', size: 22, fill: C.coral, anchor: 'start' }) +
            line(36, 59 + j * 22, 88 - j * 10, 59 + j * 22, { stroke: tm.suave, sw: 4 })).join(''),
          { tf: `${rotDe(R)} translate(${n(R.x)} ${n(R.y)})`, op: det });
      }
      s += g(g(c, { tf: i === 2 && det > 0 ? '' : rotDe(R) }), { tf: `translate(0 ${n((1 - E.back(a)) * -110)})`, op: p(t, en, en + 0.15) });
    });
    return s;
  }
  const ROTULOS = [['Herramientas.', C.turquesa, 'fichas'], ['Formación.', C.coral, 'curso'], ['Práctica.', C.amarillo, 'ensayo']];
  function rotulos(tm, t) {
    const R = F.rotulos, hasta = R.hasta ? R.hasta() : null;
    return ROTULOS.map(([s, color, cl], i) => {
      const k = p(t, T[cl][0] + 0.5, T[cl][1] + 0.3);
      if (k <= 0) return '';
      const w = ancho(s, 'Caveat Brush', R.size), sube = (1 - E.back(k)) * R.size * 0.38;
      if (R.modo === 'fila') {
        return text(s, R.xs[i], R.y + sube, { f: 'titulo', size: R.size, fill: tm.titulo, op: Math.min(1, k * 2) }) +
          path(`M${n(R.xs[i] - w / 2)},${R.y + 16} q${n(w / 4)},-8 ${n(w / 2)},-1 t${n(w / 2)},0`, { stroke: color, sw: 7, draw: E.out(p(k, 0.4, 1)) });
      }
      const op = Math.min(1, k * 2) * (1 - p(t, hasta[i], hasta[i] + 0.25)); // foco: una palabra por vez
      return g(text(s, R.x, R.y + sube, { f: 'titulo', size: R.size, fill: tm.titulo }) +
        subrayado(R.x - w * 0.44, R.y + R.size * 0.22, w * 0.88, color, p(k, 0.4, 1), 10), { op });
    }).join('');
  }
  function gimnasio(tm, t) {
    const kEsc = E.inOut(p(t, ...T.escritorio));
    let arte = g(pisoD(tm, F.piso, E.out(p(t, ...T.piso))) + bancoEscritorio(tm, t, kEsc), { op: F.base(t) }) +
      grupo(maquinaCurso(tm, t), F.maquina(t)) + grupo(pesaFichas(tm, t, kEsc), F.pesa(t)) + grupo(recibosEnsayo(tm, t), F.recibos(t));
    let textos = '';
    if (tm.id === 'papel') {
      textos += text('unas semanas después…', F.nota.x, F.nota.y, { f: 'nota', size: F.nota.size, fill: tm.suave, op: p(t, T.polvo[0], T.polvo[0] + 0.5), tf: `rotate(-3 ${F.nota.x} ${F.nota.y})` });
      textos += escrito('¿Qué cambió?', F.titular, p(t, ...T.pregunta1), tm.titulo, C.coral);
    } else {
      const fz = 1 - p(t, T.zoom[0], T.zoom[0] + 0.4);
      textos += g(rotulos(tm, t), { op: fz });
      if (F.clientes) {
        const kc = E.out(p(t, ...T.clientes));
        arte += g(path('M1742,560 C1790,556 1832,520 1846,446', { stroke: C.coral, sw: 8, draw: kc }) +
          path('M1818,466 L1847,444 L1866,476', { stroke: C.coral, sw: 8, draw: p(kc, 0.8, 1) }), { op: fz });
        textos += text('clientes', 1812, 412, { f: 'nota', size: 46, fill: tm.suave, op: p(kc, 0.5, 1) * fz });
      }
      textos += escrito('¿Y en la realidad?', F.titular, p(t, ...T.pregunta2), tm.titulo, C.coral, fz);
    }
    return { arte, textos };
  }

  // ═════════ Escena 3 · la realidad cambia ═════════
  function realidad(tm, t) {
    const L = F.s3, ini = T.s3;
    let arte = '', textos = '';
    // el vendedor sigue en pantalla desde el ensayo
    const kv = E.inOut(p(t, ini + 0.5, ini + 1.4));
    const U = entre(puntoDe(F.s2fin, 1290, 618), L.vendedor, kv);
    const cx = U.x, cy = U.y - 82 * U.s;
    arte += line(L.mesa[0], L.mesa[2], L.mesa[1], L.mesa[2], { stroke: tm.trazo, op: p(t, ini + 0.4, ini + 1.2) });
    // camino ensayado: recto, 1 → 2 → 3
    const [ox, oy] = L.O, [ex, ey] = L.E, pt = (k) => [mix(ox, ex, k), mix(oy, ey, k)];
    const dr = E.out(p(t, ...T.recto)), real = p(t, T.tema, T.tema + 0.5), n1 = pt(0.25);
    arte += line(ox, oy, ...pt(Math.min(dr, 0.25)), { stroke: tm.trazo, op: dr > 0 ? 1 : 0 });
    if (dr > 0.25) arte += line(...n1, ...pt(dr), { stroke: tm.trazo, op: mix(1, 0.3, real), dash: real > 0 ? '4 22' : null });
    arte += grupo(persona(tm, C.amarillo, p(t, ini + 0.8, ini + 1.6)), L.cliente);
    // la reunión real: el camino se ramifica
    const kt = E.out(p(t, T.tema, T.tema + 0.8));
    arte += path(L.tema.d, { stroke: tm.trazo, draw: kt }) + circle(...L.tema.n, 18, { fill: C.coral, op: p(kt, 0.85, 1) });
    textos += text('otro tema', ...L.tema.nota, { f: 'nota', size: 44, fill: tm.suave, op: p(kt, 0.7, 1) });
    if (L.sil) {
      const ks = E.out(p(t, T.silencio, T.silencio + 0.7)), [bx, by] = L.sil.globo;
      arte += path(L.sil.d, { stroke: tm.trazo, draw: ks }) + circle(...L.sil.n, 18, { fill: C.coral, op: p(ks, 0.85, 1) });
      arte += g(rr({ x: bx, y: by, w: 124, h: 66, r: 30 }, { stroke: tm.trazo, sw: 7, fill: tm.ficha }) +
        [0, 1, 2].map((i) => circle(bx + 34 + i * 28, by + 33, 6, { fill: tm.suave, op: p(t, T.silencio + 0.5 + i * 0.2, T.silencio + 0.6 + i * 0.2) })).join(''), { op: p(ks, 0.7, 1) });
    }
    const ko = p(t, T.otra, T.otra + 0.5);
    if (ko > 0) {
      arte += grupo(persona(tm, C.coral), { x: L.otra.x, y: L.otra.y, s: L.otra.s * E.back(ko), op: Math.min(1, ko * 3) });
      textos += text('otra persona', ...L.otra.nota, { f: 'nota', size: 44, fill: tm.suave, op: p(ko, 0.5, 1) });
    }
    L.rumbos.forEach((r, i) => {
      const kr = E.out(p(p(t, ...T.rumbo), i * 0.22, 0.56 + i * 0.22));
      arte += path(r.d, { stroke: tm.trazo, draw: kr });
      if (r.q) textos += text('?', ...r.q, { f: 'titulo', size: 76, fill: C.coral, op: p(kr, 0.8, 1) });
    });
    [0.25, 0.5, 0.75].forEach((k, i) => {
      const a = p(dr, k - 0.05, k + 0.05), [x, y] = pt(k);
      arte += g(circle(x, y, 30, { stroke: ACENTOS[i], sw: 8, fill: tm.fondo }) + text(String(i + 1), x, y + 16, { f: 'titulo', size: 46, fill: tm.trazo }),
        { op: a * (i ? mix(1, 0.3, real) : 1) });
    });
    // preguntas: ¿puede adaptarse?, ¿sus fortalezas?, ¿o recordar el guion?
    const kp = p(t, ...T.pregunta3), rx = 74 * U.s, ry = 70 * U.s, hy = U.y - 66 * U.s;
    arte += path(`M${n(cx - rx)},${n(hy)} a${n(rx)},${n(ry)} 0 1,1 ${n(rx * 2)},0 a${n(rx)},${n(ry)} 0 1,1 ${n(-rx * 1.96)},-14`, { stroke: C.turquesa, sw: 8, draw: E.out(p(kp, 0.2, 1)) });
    const kf = p(t, T.fortalezas, T.fortalezas + 0.6);
    [[0.42, -0.9], [0.78, -0.62], [0.98, -0.2]].forEach(([dx, dy], i) => { // destellos junto a la cabeza
      const a = p(kf, i * 0.2, 0.6 + i * 0.2), x = cx + dx * 52 * U.s, y = cy + dy * 52 * U.s;
      arte += line(x, y, x + dx * 16 * U.s, y + dy * 16 * U.s, { stroke: C.amarillo, sw: 10, draw: a });
    });
    textos += escrito('¿Puede adaptarse?', F.titular, kp, tm.titulo, C.coral);
    // el guion acompaña al vendedor
    const G0 = puntoDe(F.s2fin, 1416, 498), UG = entre(G0, L.guion, E.inOut(p(t, ini + 0.4, ini + 1.5)));
    const kg = p(t, T.guion3, T.guion3 + 0.5), mece = kg > 0 ? Math.sin((t - T.guion3) * 5) * 5 * Math.min(1, kg) : 0;
    arte += g(grupo(guionW(tm), UG), { tf: `rotate(${n(mece)} ${n(UG.x + 54 * UG.s)} ${n(UG.y + 61 * UG.s)})` });
    [0.3, 0.55, 0.8].forEach((k, i) => {
      arte += circle(mix(UG.x + 80 * UG.s, cx - 20, k), mix(UG.y + 120 * UG.s, cy - 34 * U.s, k), 5 + i * 3, { fill: tm.suave, op: p(kg, i * 0.25, 0.5 + i * 0.25) });
    });
    arte += grupo(persona(tm, C.turquesa), U);
    return { arte, textos };
  }

  // ═════════ Escena 4 · las recetas ═════════
  const guionFin = () => rectDe(F.s3.guion, 108, 122, 8, -4);
  function tarjetaReceta(t) {
    const L = F.s4;
    return rmix(rmix(guionFin(), L.tarjeta, E.inOut(p(t, ...T.receta))), L.tarjeta2, E.inOut(p(t, ...T.empresa)));
  }
  function recetas(tm, t) {
    const L = F.s4, R = tarjetaReceta(t), km = p(t, ...T.receta), ke = E.inOut(p(t, ...T.empresa));
    let arte = '', textos = '';
    arte += rr(R, { fill: C.tiza, stroke: C.linea, sw: 4 });
    const k = R.w / L.tarjeta.w, dentro = { tf: `${rotDe(R)} translate(${n(R.x)} ${n(R.y)}) scale(${Math.round(k * 1000) / 1000})` };
    textos += g(
      text('RECETA', 44, 70, { size: 30, w: 800, ls: 8, fill: C.coralTexto, anchor: 'start' }) +
      line(44, 92, 496, 92, { stroke: C.linea, sw: 4 }) +
      text('«Hacé esto.»', 270, 212, { f: 'titulo', size: 112, fill: C.petroleo }) +
      text('A otra empresa le funcionó.', 270, 300, { f: 'nota', size: 46, fill: C.tinta, op: p(t, T.cita, T.cita + 0.5) }),
      { ...dentro, op: p(km, 0.7, 1) });
    // preguntas que rodean la receta
    const fq = 1 - p(t, T.empresa[0] - 0.3, T.empresa[0]);
    [['¿Con qué clientes?', L.q1, T.q1, 1], ['¿Con qué equipo?', L.q2, T.q2, -1]].forEach(([s, P, en, lado]) => {
      const a = p(t, en, en + 0.4);
      if (a <= 0) return;
      textos += text(s, P.x, P.y + (1 - E.back(a)) * 24, { f: 'titulo', size: L.qSize, fill: tm.titulo, op: Math.min(1, a * 2) * fq, tf: `rotate(${P.rot} ${P.x} ${P.y})` });
      const w = ancho(s, 'Caveat Brush', L.qSize) / 2;
      arte += g(path(`M${P.x + lado * (w - 60)},${P.y + 30} q${lado * 60},60 ${lado * 150},70`, { stroke: C.coral, sw: 7, draw: p(a, 0.4, 1) }), { op: fq });
    });
    textos += escrito('¿En qué condiciones?', F.titular, p(t, ...T.q3), tm.titulo, C.coral);
    // ¿y tu empresa?
    if (ke > 0) {
      const [x1, y, x2] = L.flecha;
      arte += flecha(x1, y, x1 + (x2 - x1) * ke, y, { stroke: C.coral, sw: 8, dash: '6 24' });
      textos += text('?', (x1 + x2) / 2, y - 40, { f: 'titulo', size: 150, fill: C.coral, op: p(ke, 0.5, 1) });
      const st = { stroke: tm.trazo, sw: 8, draw: ke };
      arte += grupo(
        path('M-16,70 L150,0 L316,70', st) + rr({ x: 0, y: 70, w: 300, h: 250, r: 6 }, st) + rr({ x: 122, y: 220, w: 56, h: 100, r: 4 }, st) +
        [[36, 110], [204, 110], [36, 200], [204, 200]].map(([x, yy]) => rr({ x, y: yy, w: 60, h: 52, r: 4 }, { ...st, sw: 6 })).join(''), L.edificio);
      textos += text('tu empresa', ...L.nota, { f: 'nota', size: 50, fill: tm.suave, op: p(ke, 0.5, 1) });
    }
    return { arte, textos };
  }

  // ═════════ Escena 5 · el entrenador ═════════
  const PASOS = [['Observar', C.turquesa], ['Practicar', C.coral], ['Revisar', C.amarillo], ['Ajustar', C.turquesa]];
  function pasos(tm, t, op = 1) {
    const P = F.s5.pasos;
    let s = '';
    PASOS.forEach(([pal, col], i) => {
      const k = p(t, T.pasos[i], T.pasos[i] + 0.5);
      if (k <= 0) return;
      const [x, y] = P.pos[i], w = ancho(pal, 'Caveat Brush', P.size);
      s += text(pal, x, y + (1 - E.back(k)) * 22, { f: 'titulo', size: P.size, fill: tm.titulo, op: Math.min(1, k * 2) }) +
        subrayado(x - w / 2, y + P.size * 0.2, w, col, p(k, 0.4, 1), 8);
      if (i > 0 && P.flechas[i - 1]) {
        const [xa, ya] = P.pos[i - 1], wa = ancho(PASOS[i - 1][0], 'Caveat Brush', P.size);
        s += flecha(xa + wa / 2 + 26, ya - P.size * 0.28, x - w / 2 - 26, y - P.size * 0.28, { stroke: tm.suave, sw: 7, draw: p(k, 0, 0.6) });
      }
    });
    return g(s, { op });
  }
  const OBS = ['hoy', 'objetivo', 'a desarrollar', 'respuesta'];
  function entrenador(tm, t) {
    const L = F.s5, ini = T.s5, kg = p(t, ...T.gimnasio);
    let arte = pisoD(tm, L.piso, E.out(p(t, ini + 0.3, ini + 1.2))), textos = '';
    const sube = t < T.trabajo ? 0 : 0.5 - 0.5 * Math.cos(((t - T.trabajo) / 1.9) * 2 * Math.PI);
    const ex = p(t, T.ajusta + 0.5, T.ajusta + 0.9);
    arte += grupo(figura(tm, 'entrenador'), { ...L.entrenador, op: p(kg, 0, 0.6) }) + grupo(figura(tm, 'atleta', sube, ex), { ...L.atleta, op: p(kg, 0.4, 1) });
    // observar: la mirada del entrenador
    const e = L.entrenador, a = L.atleta, ko = p(t, T.pasos[0], T.pasos[0] + 0.6);
    arte += line(e.x + 70 * e.s, e.y - 272 * e.s, mix(e.x + 70 * e.s, a.x - 60 * a.s, ko), mix(e.y - 272 * e.s, a.y - 262 * a.s, ko), { stroke: C.turquesa, sw: 7, dash: '4 20', op: ko > 0 ? 1 : 0 });
    // ajustar: marca junto a la carga
    const ka = p(t, T.ajusta, T.ajusta + 0.5);
    if (ka > 0) {
      const cabe = a.x + 190 * a.s + 170 < F.W - 80, by = a.y - (222 + sube * 118) * a.s; // si no entra al costado, va sobre la barra
      textos += text('+ carga', cabe ? a.x + 190 * a.s : a.x, cabe ? by - 30 : by - 52 * a.s, { f: 'nota', size: 46, fill: C.coralTexto, anchor: cabe ? 'start' : 'middle', op: ka * (1 - p(t, T.ajusta + 2.2, T.ajusta + 2.8)) });
    }
    // la receta genérica se vuelve la planilla de observación
    if (L.tabla) {
      const R = rmix(F.s4.tarjeta2, L.tabla, E.inOut(p(t, ini + 0.3, ini + 1.5))), kd = p(t, ini + 1.2, ini + 1.8);
      arte += rr(R, { fill: tm.ficha, stroke: tm.trazo, sw: 7 }) + rr({ x: R.x + R.w / 2 - 50, y: R.y - 16, w: 100, h: 34, r: 8, rot: R.rot }, { fill: tm.trazo, op: kd });
      let filas = '';
      OBS.forEach((pal, i) => {
        const y = 100 + i * 86, ok = p(t, T.obs[i], T.obs[i] + 0.4);
        filas += rr({ x: 40, y: y - 34, w: 40, h: 40, r: 6 }, { stroke: tm.suave, sw: 5 }) +
          path(`M46,${y - 14} l12,14 l26,-34`, { stroke: ACENTOS[i], sw: 8, draw: ok }) +
          text(pal, 106, y, { f: 'nota', size: 50, fill: tm.trazo, anchor: 'start', op: mix(0.35, 1, ok) });
      });
      textos += g(filas, { tf: `${rotDe(R)} translate(${n(R.x)} ${n(R.y)})`, op: kd });
    }
    textos += pasos(tm, t);
    return { arte, textos };
  }

  // ═════════ Escena 6 · Ale y el método ═════════
  function icono(tm, i) {
    const st = { stroke: tm.trazo, sw: 7 };
    if (i === 0) return path('M-56,-22 L0,-66 L56,-22', st) + rr({ x: -44, y: -22, w: 88, h: 78, r: 4 }, st) + rr({ x: -13, y: 14, w: 26, h: 42, r: 3 }, st);
    if (i === 1) return circle(-52, 26, 15, st) + circle(0, -34, 15, st) + circle(52, 26, 15, st) +
      flecha(-40, 10, -14, -20, st) + flecha(14, -20, 40, 10, st) + line(-34, 30, 34, 30, { ...st, dash: '3 14' });
    return g(persona(tm, C.turquesa), { tf: 'translate(-36 52) scale(0.62)' }) + g(persona(tm, C.coral), { tf: 'translate(36 52) scale(0.62)' });
  }
  const MAPA = [['Negocio', C.turquesa], ['Sistema comercial', C.coral], ['Personas', C.amarillo]];
  function metodo(tm, t) {
    const L = F.s6;
    let arte = '', textos = '';
    // «esa es la lógica»: los cuatro pasos siguen en la pizarra hasta que aparece el nombre
    textos += pasos(tm, t, 1 - p(t, T.nombre[0] - 0.5, T.nombre[0] - 0.1));
    textos += escrito('Alejandra Cadario', F.titular, p(t, ...T.nombre), tm.titulo, C.turquesa);
    MAPA.forEach(([pal, col], i) => {
      const k = p(t, T.c[i], T.c[i] + 0.7), U = L.circulos[i];
      if (k <= 0) return;
      arte += grupo(path('M-105,0 a105,105 0 1,1 210,0 a105,105 0 1,1 -207,-16', { stroke: col, sw: 9, draw: E.out(k) }) + g(icono(tm, i), { op: p(k, 0.5, 1) }), U);
      textos += text(pal, U.x, U.y + 168 * U.s, { f: 'titulo', size: L.rotSize, fill: tm.titulo, op: p(k, 0.5, 1) });
      if (i > 0) arte += line(L.circulos[i - 1].x + 118 * U.s, U.y, U.x - 118 * U.s, U.y, { stroke: tm.suave, sw: 6, draw: p(k, 0.3, 0.8) });
    });
    // diagnóstico: una entrega completa
    const kd = E.out(p(t, ...T.diag)), Dg = L.diag;
    arte += rr(Dg, { stroke: tm.suave, sw: 7, draw: kd });
    textos += text('Diagnóstico', Dg.x + 34, Dg.y - 22, { f: 'titulo', size: L.diagSize, fill: tm.titulo, anchor: 'start', op: p(kd, 0.3, 0.7) });
    const kc = p(kd, 0.75, 1), bx = Dg.x + Dg.w - 40, by = Dg.y;
    arte += circle(bx, by, 34 * E.back(kc), { fill: C.turquesa, op: kc > 0 ? 1 : 0 }) + path(`M${bx - 15},${by} l11,13 l20,-26`, { stroke: C.carbon, sw: 8, draw: p(kc, 0.4, 1) });
    textos += text('entrega completa', bx - 52, by - 22, { f: 'nota', size: 42, fill: tm.suave, anchor: 'end', op: kc });
    // caminos posteriores opcionales (punteados)
    const cuando = [T.disena, T.sigue, T.sigue];
    L.caminos.forEach((c, i) => {
      const k = p(t, cuando[i][0] + (i === 2 ? 0.5 : 0), cuando[i][1] + (i === 2 ? 0.5 : 0));
      arte += path(c.d, { stroke: ACENTOS[i], sw: 7, dash: '5 20', op: k });
      textos += text(c.s, c.x, c.y, { f: 'titulo', size: L.caminoSize, fill: tm.titulo, anchor: L.anclaCamino, op: p(k, 0.4, 1) });
    });
    const N = L.notaSigue;
    textos += text(N.s, N.x, N.y, { f: 'nota', size: N.size, fill: tm.suave, op: p(t, ...T.sigue) });
    return { arte, textos };
  }

  // ═════════ Escena 7 · preguntas para actuar ═════════
  const PREG = [['¿Qué practicar?', 'practicar'], ['¿Qué cambiar?', 'proceso'], ['¿Qué dificulta?', 'obstáculos']];
  function preguntas(tm, t) {
    const L = F.s7, m = E.inOut(p(t, ...T.tarjetas));
    let arte = '', textos = '';
    L.globos.forEach((G, i) => {
      const a = p(t, T.q7[i], T.q7[i] + 0.45);
      if (a <= 0) return;
      const R = { ...G, r: mix(70, 16, m), rot: mix([-3, 2, -2][i], 0, m) }, sube = (1 - E.back(a)) * 40, cx = G.x + G.w / 2;
      let c = path(`M${G.x + 70},${G.y + G.h - 4} l-14,44 l58,-44`, { stroke: tm.trazo, sw: 8, fill: tm.ficha, op: 1 - m }) +
        rr(R, { stroke: tm.trazo, sw: 8, fill: tm.ficha }) +
        text(PREG[i][0], cx, G.y + 104, { f: 'titulo', size: 58, fill: tm.titulo, op: 1 - p(m, 0, 0.5), tf: `rotate(${R.rot} ${cx} ${G.y + 85})` });
      // la pregunta se vuelve prioridad con acciones
      const d = p(m, 0.5, 1);
      c += g(circle(G.x + 62, G.y + 62, 34, { stroke: ACENTOS[i], sw: 8 }) + text(String(i + 1), G.x + 62, G.y + 80, { f: 'titulo', size: 50, fill: tm.titulo }) +
        text(PREG[i][1], G.x + 116, G.y + 78, { f: 'titulo', size: 52, fill: tm.titulo, anchor: 'start' }) +
        line(G.x + 44, G.y + 128, G.x + G.w - 60, G.y + 128, { stroke: tm.suave, sw: 6, draw: d }), { op: d });
      arte += g(c, { tf: `translate(0 ${n(sube)})`, op: Math.min(1, a * 2.5) });
    });
    // punto de partida → revisión (sin indicadores inventados)
    const kl = E.out(p(t, ...T.linea)), { x1, x2, y } = L.linea;
    arte += flecha(x1, y, mix(x1, x2, kl), y, { stroke: tm.trazo, sw: 8, op: kl > 0 ? 1 : 0 });
    arte += circle(x1, y, 20, { fill: C.turquesa, op: p(kl, 0, 0.15) });
    [0.3, 0.52, 0.74].forEach((k, i) => { arte += line(mix(x1, x2, k), y - 20, mix(x1, x2, k), y + 20, { stroke: ACENTOS[i], sw: 8, draw: p(kl, k, k + 0.1) }); });
    const kr = p(kl, 0.9, 1);
    arte += circle(x2 + 62, y, 44 * E.back(kr), { stroke: C.coral, sw: 9, op: kr > 0 ? 1 : 0 }) + path(`M${x2 + 44},${y} l13,15 l24,-31`, { stroke: C.coral, sw: 8, draw: p(t, T.linea[1], T.linea[1] + 0.4) });
    textos += text('punto de partida', x1, y + 82, { f: 'nota', size: 46, fill: tm.suave, op: p(kl, 0.05, 0.3) }) +
      text('revisión', x2 + 62, y + 104, { f: 'nota', size: 46, fill: tm.suave, op: kr });
    textos += escrito('Prioridades claras. Avances que podamos revisar.', { ...F.titular, size: 96, max: 1640 }, p(t, ...T.final7), tm.titulo, C.coral);
    return { arte, textos };
  }

  // ═════════ Escena 8 · cierre ═════════
  function cierre(tm, t) {
    const L = F.s8, sale = 1 - p(t, T.nombre8[0] - 0.5, T.nombre8[0] - 0.1);
    let arte = '', textos = '';
    // la próxima solución llega… y primero se mira qué necesita la empresa
    const kc = p(t, ...T.caja), ke = E.inOut(p(t, ...T.entender));
    if (kc > 0 && sale > 0) {
      const U = entre(L.caja, L.caja2, ke), st = { stroke: tm.trazo, sw: 8, fill: tm.fondo };
      arte += g(grupo(
        rr({ x: -110, y: -56, w: 220, h: 166, r: 8 }, st) + rr({ x: -126, y: -100, w: 252, h: 46, r: 8 }, st) +
        line(0, -100, 0, 110, { stroke: C.coral, sw: 12 }) +
        path('M0,-102 C-70,-170 -90,-96 0,-102 C70,-170 90,-96 0,-102', { stroke: C.coral, sw: 9 }),
        { x: U.x, y: U.y + (1 - E.back(kc)) * -300, s: U.s }), { op: Math.min(1, kc * 3) * sale });
      textos += text('la próxima solución', U.x, U.y + 176 * U.s, { f: 'nota', size: 48, fill: tm.suave, op: p(kc, 0.6, 1) * sale });
      const M = L.lupa, kl = E.out(p(ke, 0.2, 1));
      arte += g(grupo(
        [-88, 0, 88].map((x, i) => circle(x, 0, 34, { stroke: ACENTOS[i], sw: 8, draw: p(ke, 0.1 + i * 0.15, 0.6 + i * 0.15) })).join('') +
        path('M-150,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0', { stroke: tm.trazo, sw: 11, draw: kl }) +
        line(108, 108, 196, 196, { stroke: tm.trazo, sw: 20, draw: p(kl, 0.8, 1) }), M), { op: sale });
      textos += text('primero, entender', L.entender.x, L.entender.y, { f: 'titulo', size: L.entender.size, fill: tm.titulo, op: p(ke, 0.6, 1) * sale });
    }
    // firma y última invitación
    textos += escrito('Alejandra Cadario', L.nombre, p(t, ...T.nombre8), tm.titulo, null);
    textos += text('OIKE', L.oike.x + 9, L.oike.y, { size: L.oike.size, w: 800, ls: 18, fill: tm.suave, op: p(t, T.nombre8[1] - 0.2, T.nombre8[1] + 0.3) });
    const kl = p(t, ...T.lema), Lm = L.lema;
    Lm.lineas.forEach((l, i) => {
      const k = p(kl, i * 0.4, 0.6 + i * 0.4), y = Lm.y + i * Lm.alto;
      textos += text(l, Lm.x, y + (1 - E.out(k)) * 20, { f: 'titulo', size: Lm.size, fill: tm.titulo, op: k });
      if (i === Lm.lineas.length - 1) {
        const w = ancho(l, 'Caveat Brush', Lm.size), wu = ancho('construyen.', 'Caveat Brush', Lm.size);
        arte += subrayado(Lm.x + w / 2 - wu, y + Lm.size * 0.2, wu, C.turquesa, p(t, T.lema[1], T.lema[1] + 0.5), 9);
      }
    });
    const ki = p(t, ...T.invita), I = L.invita, wi = ancho('Conocé el Método Oike', 'Caveat Brush', I.size), rx = wi / 2 + 56, ry = I.size * 0.74, oy = I.y - I.size * 0.3;
    textos += text('Conocé el Método Oike', I.x, I.y + (1 - E.back(ki)) * 26, { f: 'titulo', size: I.size, fill: tm.titulo, op: Math.min(1, ki * 2) });
    arte += path(`M${n(I.x - rx)},${n(oy)} a${n(rx)},${n(ry)} 0 1,1 ${n(rx * 2)},0 a${n(rx)},${n(ry)} 0 1,1 ${n(-rx * 1.97)},-12`, { stroke: C.coral, sw: 8, draw: E.out(p(t, T.invita[0] + 0.4, T.invita[1] + 0.7)) });
    if (L.web) textos += text(L.web.s, L.web.x, L.web.y, { size: L.web.size, w: 800, fill: C.turquesa, op: p(t, T.invita[1], T.invita[1] + 0.5) });
    return { arte, textos };
  }

  // ═════════ Montaje ═════════
  const ESCENAS = {
    s1: ['papel', gimnasio], s2: ['carbon', gimnasio], s3: ['papel', realidad], s4: ['carbon', recetas],
    s5: ['papel', entrenador], s6: ['carbon', metodo], s7: ['papel', preguntas], s8: ['carbon', cierre],
  };
  const ORDEN = MONTAJE.escenas;
  function capa(cl, t) {
    const [tema, fn] = ESCENAS[cl], tm = TEMAS[tema], r = fn(tm, t);
    const A = F.aviso;
    return `<rect width="${F.W}" height="${F.H}" fill="${tm.fondo}"/>` +
      (tema === 'carbon' ? `<rect y="${F.textura.y}" width="${F.W}" height="${F.textura.h}" fill="url(#tiza)"/>` : '') +
      g(r.arte, { filter: 'mano' }) + r.textos +
      text(A.s, A.x, A.y, { size: A.size, w: 800, ls: 2, fill: tm.suave, anchor: 'start', op: 0.85 }) + subtitulo(tm, t);
  }
  window.renderAt = function (t) {
    const { W, H } = F, inc = F.inclinacion;
    nClip = 0;
    let i = 0;
    while (i + 1 < ORDEN.length && T[ORDEN[i + 1]] <= t) i++;
    const kB = i > 0 ? E.inOut(p(t, T[ORDEN[i]], T[ORDEN[i]] + D)) : 1, borde = mix(-2 * inc, W + 2 * inc, kB);
    const quieto = ORDEN[i] === 's1' && t >= T.polvo[0];
    const semilla = quieto ? 3 : 1 + (Math.floor(t * 8) % 4);     // «temblor» del trazo a 8 fps
    let s = `<defs>
      <filter id="mano" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="${semilla}" result="r"/>
        <feDisplacementMap in="SourceGraphic" in2="r" scale="7" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <pattern id="tiza" width="420" height="594" patternUnits="userSpaceOnUse"><image href="../assets/tiza.png" width="420" height="594"/></pattern>
      <clipPath id="barrido"><path d="M-10,-10 H${n(borde + inc)} L${n(borde - inc)},${H + 10} H-10 Z"/></clipPath>
    </defs>`;
    if (kB < 1) {
      // la escena siguiente entra como una pizarra que barre a la anterior
      s += capa(ORDEN[i - 1], t) + g(capa(ORDEN[i], t), { clip: 'barrido' }) + line(borde + inc, -10, borde - inc, H + 10, { stroke: C.turquesa, sw: 10 });
    } else s += capa(ORDEN[i], t);
    document.getElementById('escena').innerHTML = s;
  };
})();
