/* Escenas 1 (Compra / expectativa) y 2 (Paralelo empresarial).
   Los tiempos (segundos) están en T y son comunes a los dos formatos.
   Cada objeto se dibuja en sus coordenadas propias y cada FORMATO decide dónde
   va, a qué tamaño y cuándo se ve: horizontal 1920 × 1080 (web) y vertical
   1080 × 1920 (Reels / TikTok) son dos composiciones, no un recorte. */
(function () {
  const { p, mix, E, n, azar, C, TEMAS, path, line, circle, rr, rrD, rmix, rotDe, text, g, ancho } = window.M;

  const T = {
    piso: [0.1, 0.8], banco: [0.3, 0.9],
    pesa: [0.7, 1.3], recibo1: 1.4,
    maquina: [2.0, 2.9], recibo2: 2.9,
    recibo3: 3.7,
    polvo: [5.1, 6.5],                 // quietud: se detiene el temblor del trazo
    pregunta1: [7.4, 8.2],
    barrido: [10.0, 11.7],             // la pizarra entra y «borra» el polvo
    escritorio: [10.6, 12.3],          // banco de pesas → escritorio
    fichas: [13.4, 14.3],              // pesa → fichas de contactos
    curso: [14.9, 15.8],               // máquina → curso
    ensayo: [16.5, 17.4],              // recibos → roleplay y guion
    clientes: [19.0, 19.8],
    pregunta2: [19.9, 20.8],
  };

  // ── Formatos ──
  // Ubicación de un objeto: su punto propio (ox, oy) cae en (px, py) de la pantalla a escala s.
  const ubica = (ox, oy, px, py, s) => ({ x: px - ox * s, y: py - oy * s, s });
  const entre = (A, B, k) => ({ x: mix(A.x, B.x, k), y: mix(A.y, B.y, k), s: mix(A.s, B.s, k) });
  const FIJO = { x: 0, y: 0, s: 1 };

  const HORIZONTAL = {
    W: 1920, H: 1080, inclinacion: 130,
    piso: { y: 740, x1: 140, x2: 1780, sw: 7 },
    banco: { de: { x: 250, y: 590, w: 440, h: 28, r: 9 }, a: { x: 180, y: 620, w: 1560, h: 28, r: 9 }, patas: [[300, 250], [640, 1670]], abre: 26, sw: 9 },
    bajaPesa: 30, mesaEnsayo: false, clientes: true,
    base: () => 1,
    pesa: () => ({ ...FIJO, op: 1 }), maquina: () => ({ ...FIJO, op: 1 }), recibos: () => ({ ...FIJO, op: 1 }),
    textura: { y: 290, h: 480 },
    aviso: { s: 'MUESTRA · ESCENAS 1 Y 2 · SUBTÍTULOS PROVISIONALES, SIN LOCUCIÓN', x: 60, y: 62, size: 19 },
    nota: { x: 470, y: 392, size: 46 },
    pregunta1: { x: 960, y: 222, size: 150 }, pregunta2: { x: 960, y: 222, size: 150 },
    rotulos: { modo: 'fila', y: 832, size: 64, xs: [484, 960, 1466] },
    sub: { x: 960, y: 985, size: 46, max: 1700, alto: 60 },
  };

  // Vertical: los tres objetos del gimnasio en triángulo; en la escena 2 cada
  // recurso pasa solo al centro, grande, con su palabra arriba; al final se reúnen.
  // Zonas libres para las aplicaciones: 260 px arriba, 480 px abajo y la columna derecha.
  const V = {
    pesa: [ubica(470, 588, 335, 1088, 1.2), ubica(484, 489, 540, 850, 1.9), ubica(484, 618, 280, 1086, 0.9)],
    maquina: [ubica(960, 740, 820, 1220, 1.2), ubica(960, 486, 540, 850, 2.1), ubica(960, 618, 760, 1090, 1)],
    recibos: [ubica(1495, 535, 320, 720, 0.9), ubica(1466, 470, 540, 850, 1.75), ubica(1466, 622, 540, 800, 0.85)],
  };
  const REUNION = [18.8, 19.3];
  const foco = (P, t, a) => (t < 18.7 ? entre(P[0], P[1], E.inOut(p(t, a, a + 0.7))) : P[2]);
  const VERTICAL = {
    W: 1080, H: 1920, inclinacion: 230,
    piso: { y: 1220, x1: 40, x2: 1040, sw: 8 },
    banco: { de: { x: 70, y: 1090, w: 530, h: 32, r: 10 }, a: { x: 60, y: 1090, w: 940, h: 32, r: 10 }, patas: [[130, 110], [540, 950]], abre: 30, sw: 11 },
    bajaPesa: 0, mesaEnsayo: true, clientes: false,
    base: (t) => 1 - p(t, 13.1, 13.4) + p(t, ...REUNION),
    pesa: (t) => ({ ...foco(V.pesa, t, 13.15), op: 1 - p(t, 14.65, 14.9) + p(t, ...REUNION) }),
    maquina: (t) => ({ ...foco(V.maquina, t, 14.7), op: 1 - p(t, 13.1, 13.35) + p(t, 14.7, 14.95) * (1 - p(t, 16.25, 16.5)) + p(t, ...REUNION) }),
    recibos: (t) => ({ ...foco(V.recibos, t, 16.3), op: 1 - p(t, 13.1, 13.35) + p(t, 16.3, 16.55) * (1 - p(t, 18.4, 18.65)) + p(t, ...REUNION) }),
    textura: { y: 540, h: 700 },
    aviso: { s: 'MUESTRA VERTICAL · SUBTÍTULOS PROVISIONALES, SIN LOCUCIÓN', x: 70, y: 292, size: 20 },
    nota: { x: 780, y: 650, size: 52 },
    pregunta1: { x: 540, y: 480, size: 190 }, pregunta2: { x: 540, y: 480, size: 144 },
    rotulos: { modo: 'foco', x: 540, y: 480, size: 136, hasta: [14.65, 16.25, 18.4] },
    sub: { x: 510, y: 1372, size: 60, max: 800, alto: 76 },
  };
  const F = new URLSearchParams(location.search).get('formato') === 'vertical' ? VERTICAL : HORIZONTAL;
  window.FORMATO = { nombre: F === VERTICAL ? 'vertical' : 'horizontal', W: F.W, H: F.H };

  const grupo = (s, U) => g(s, { tf: U.x || U.y || U.s !== 1 ? `translate(${n(U.x)} ${n(U.y)}) scale(${Math.round(U.s * 1000) / 1000})` : '', op: U.op });

  // ── Polvo ilustrado: los objetos quedaron quietos (solo sobre papel) ──
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

  // ── Piso y banco que se estira hasta ser escritorio ──
  function piso(tm, t) {
    const { y, x1, x2, sw } = F.piso, w = x2 - x1;
    return path(`M${x1},${y} C${n(x1 + w * 0.23)},${y - 5} ${n(x1 + w * 0.7)},${y + 5} ${x2},${y - 1}`, { stroke: tm.trazo, sw, draw: E.out(p(t, ...T.piso)) });
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

  // ── Pesa → fichas de contactos (genéricas, no una interfaz) ──
  const DISCOS = [
    { x: 338, y: 482, w: 24, h: 88, r: 8 }, { x: 366, y: 464, w: 30, h: 124, r: 10 },
    { x: 544, y: 464, w: 30, h: 124, r: 10 }, { x: 578, y: 482, w: 24, h: 88, r: 8 },
  ];
  const FICHAS = [
    { x: 262, y: 500, w: 178, h: 110, r: 12, rot: -6 }, { x: 318, y: 372, w: 178, h: 110, r: 12, rot: 4 },
    { x: 528, y: 366, w: 178, h: 110, r: 12, rot: -3 }, { x: 478, y: 502, w: 178, h: 110, r: 12, rot: 5 },
  ];
  const ACENTOS = [C.turquesa, C.coral, C.amarillo, C.turquesa];
  function pesaFichas(tm, t, k) {
    const a = p(t, ...T.pesa);
    if (a <= 0) return '';
    const m = E.back(p(t, ...T.fichas)), det = p(t, T.fichas[0] + 0.55, T.fichas[1] + 0.25);
    const baja = F.bajaPesa * k * (1 - m);
    let s = '';
    // barra: se acorta y desaparece al transformarse
    const bw = 152 * (1 - p(t, T.fichas[0], T.fichas[0] + 0.4));
    if (bw > 1) s += rr({ x: 470 - bw / 2, y: 519 + baja, w: bw, h: 14, r: 5 }, { fill: tm.trazo });
    DISCOS.forEach((D, i) => {
      const R = rmix({ ...D, y: D.y + baja }, FICHAS[i], m);
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

  // ── Máquina → curso (la pila de pesos pasa a ser la lista de módulos) ──
  function maquinaCurso(tm, t) {
    const a = p(t, ...T.maquina);
    if (a <= 0) return '';
    const m = E.back(p(t, ...T.curso)), fuera = 1 - p(t, T.curso[0], T.curso[0] + 0.3), det = p(t, T.curso[0] + 0.55, T.curso[1] + 0.25);
    const marco = rmix({ x: 830, y: 310, w: 260, h: 430, r: 16 }, { x: 790, y: 352, w: 340, h: 224, r: 18 }, m);
    let s = rr(marco, { stroke: tm.trazo, fill: tm.fondo, draw: E.out(p(t, T.maquina[0], T.maquina[0] + 0.7)) });
    // travesaño, cable y agarre de la máquina
    const cab = E.out(p(t, T.maquina[0] + 0.45, T.maquina[1]));
    s += g(
      line(868, 350, 1052, 350, { stroke: tm.trazo, sw: 7, draw: cab }) +
      line(960, 372, 960, 586, { stroke: tm.trazo, sw: 5, draw: cab }) +
      line(884, 350, 884, 446, { stroke: tm.trazo, sw: 5, draw: cab }) +
      line(856, 452, 912, 452, { stroke: C.coral, sw: 10, draw: cab }),
      { op: fuera });
    // polea → botón de reproducción
    const px = mix(960, 1082, m), py = mix(350, 398, m);
    s += circle(px, py, mix(20, 24, m), { stroke: tm.trazo, sw: 6, fill: tm.fondo, op: p(t, T.maquina[0] + 0.4, T.maquina[0] + 0.6) });
    s += path(`M${px - 7},${py - 11} L${px + 11},${py} L${px - 7},${py + 11} Z`, { fill: C.coral, op: det });
    // pila de pesos → filas del temario
    const FILAS = [190, 150, 172, 128];
    for (let i = 0; i < 4; i++) {
      const R = rmix({ x: 885, y: 590 + i * 36, w: 150, h: 28, r: 7 }, { x: 868, y: 436 + i * 33, w: FILAS[i], h: 9, r: 4 }, m);
      s += rr(R, { fill: tm.trazo, op: p(t, T.maquina[0] + 0.5 + i * 0.08, T.maquina[0] + 0.62 + i * 0.08) * mix(1, 0.75, m) });
      const dc = p(t, T.curso[0] + 0.6 + i * 0.1, T.curso[0] + 0.8 + i * 0.1);
      s += path(`M828,${440 + i * 33} l7,8 l14,-16`, { stroke: ACENTOS[i], sw: 6, draw: dc });
    }
    s += text('Curso', 824, 414, { f: 'titulo', size: 50, fill: tm.trazo, anchor: 'start', op: det });
    // pie del monitor, apoyado en el escritorio
    s += line(960, 578, 960, 618, { stroke: tm.trazo, draw: det }) + line(896, 618, 1024, 618, { stroke: tm.trazo, draw: det });
    if (tm.id === 'papel') {
      s += polvoEn([[838, 1082, 305], [888, 1032, 586]], t, 23);
      // telaraña pequeña en la esquina de la máquina
      const w = E.out(p(p(t, ...T.polvo), 0.45, 1));
      s += g(
        line(0, 0, 70, 20, { stroke: C.gris, sw: 2.5, draw: w }) + line(0, 0, 52, 52, { stroke: C.gris, sw: 2.5, draw: w }) + line(0, 0, 20, 70, { stroke: C.gris, sw: 2.5, draw: w }) +
        path('M34,10 q0,14 -24,24', { stroke: C.gris, sw: 2.5, draw: w }) + path('M58,17 q-2,30 -41,41', { stroke: C.gris, sw: 2.5, draw: w }),
        { tf: 'translate(838 318)', op: 0.8 });
    }
    return s;
  }

  // ── Recibos → roleplay (dos voces y un guion) ──
  function reciboD(R, zig) {
    const r = R.r || 0, x = R.x, y = R.y, w = R.w, h = R.h, dientes = 8, paso = w / dientes;
    let d = `M${n(x)},${n(y + h)} V${n(y + r)} Q${n(x)},${n(y)} ${n(x + r)},${n(y)} H${n(x + w - r)} Q${n(x + w)},${n(y)} ${n(x + w)},${n(y + r)} V${n(y + h)}`;
    for (let i = 1; i <= dientes; i++) d += ` L${n(x + w - paso * (i - 0.5))},${n(y + h - zig)} L${n(x + w - paso * i)},${n(y + h)}`;
    return d + ' Z';
  }
  const RECIBOS = [
    { en: T.recibo1, de: { x: 1322, y: 392, w: 190, h: 240, r: 6, rot: -8 }, a: { x: 1222, y: 318, w: 228, h: 106, r: 46, rot: 0 }, rotulo: 'pesas' },
    { en: T.recibo2, de: { x: 1478, y: 352, w: 190, h: 240, r: 6, rot: 6 }, a: { x: 1480, y: 372, w: 228, h: 106, r: 46, rot: 0 }, rotulo: 'máquina' },
    { en: T.recibo3, de: { x: 1376, y: 432, w: 236, h: 292, r: 6, rot: -2 }, a: { x: 1416, y: 498, w: 108, h: 122, r: 8, rot: -4 }, rotulo: 'gimnasio' },
  ];
  function recibosEnsayo(tm, t) {
    const m = E.inOut(p(t, ...T.ensayo)), sale = 1 - p(t, T.ensayo[0], T.ensayo[0] + 0.3), det = p(t, T.ensayo[0] + 0.6, T.ensayo[1] + 0.3);
    let s = '';
    // dos personas ensayando (aparecen con la transformación)
    if (det > 0) {
      if (F.mesaEnsayo) s += line(1206, 622, 1726, 622, { stroke: tm.trazo, draw: det });
      [[1290, C.turquesa], [1652, C.amarillo]].forEach(([cx, col]) => {
        s += circle(cx, 536, 31, { stroke: tm.trazo, sw: 8, fill: tm.fondo, draw: det }) +
          path(`M${cx - 58},618 C${cx - 58},566 ${cx + 58},566 ${cx + 58},618`, { stroke: tm.trazo, sw: 8, fill: tm.fondo, draw: det }) +
          path(`M${cx - 30},606 q30,-12 60,0`, { stroke: col, sw: 6, draw: det });
      });
    }
    RECIBOS.forEach((r, i) => {
      const a = p(t, r.en, r.en + 0.4);
      if (a <= 0) return;
      const R = rmix(r.de, r.a, m), zig = 14 * (1 - Math.min(1, m * 2.5));
      let c = path(zig > 0.3 ? reciboD(R, zig) : rrD(R.x, R.y, R.w, R.h, R.r), { stroke: tm.trazo, sw: 7, fill: tm.ficha });
      // contenido del recibo
      const k = r.de.w / 190;
      c += g(
        text(r.rotulo, r.de.w / 2, 58 * k, { f: 'nota', size: 42 * k, fill: tm.trazo }) +
        line(28 * k, 92 * k, r.de.w - 28 * k, 92 * k, { stroke: tm.suave, sw: 4, op: 0.6 }) +
        line(28 * k, 122 * k, r.de.w - 60 * k, 122 * k, { stroke: tm.suave, sw: 4, op: 0.6 }) +
        text('$', r.de.w / 2, 198 * k, { f: 'titulo', size: 76 * k, fill: C.coral }),
        { tf: `translate(${n(R.x)} ${n(R.y)})`, op: sale });
      // contenido del ensayo
      if (det > 0 && i < 2) {
        const cx = R.x + R.w / 2;
        c += text(String(i + 1), R.x + 46, R.y + 74, { f: 'titulo', size: 64, fill: i ? C.amarillo : C.turquesa, op: det }) +
          path(`M${R.x + 84},${R.y + 44} h${96 * det}`, { stroke: tm.trazo, sw: 6, op: det }) +
          path(`M${R.x + 84},${R.y + 68} h${66 * det}`, { stroke: tm.trazo, sw: 6, op: det * 0.7 });
        const hacia = i ? 1 : -1; // colita del globo hacia quien habla
        c += path(`M${cx - 16 + hacia * 44},${R.y + R.h - 3} l${hacia * 12},26 l${18 - hacia * 2},-27`, { stroke: tm.trazo, sw: 7, fill: tm.ficha, op: det });
      }
      if (det > 0 && i === 2) {
        c += g(
          text('guion', 54, 36, { f: 'nota', size: 30, fill: tm.trazo }) +
          [0, 1, 2].map((j) => text(String(j + 1), 16, 66 + j * 22, { f: 'nota', size: 22, fill: C.coral, anchor: 'start' }) +
            line(36, 59 + j * 22, 88 - j * 10, 59 + j * 22, { stroke: tm.suave, sw: 4 })).join(''),
          { tf: `${rotDe(R)} translate(${n(R.x)} ${n(R.y)})`, op: det });
      }
      s += g(g(c, { tf: i === 2 && det > 0 ? '' : rotDe(R) }), { tf: `translate(0 ${n((1 - E.back(a)) * -110)})`, op: p(t, r.en, r.en + 0.15) });
    });
    return s;
  }

  // ── Textos ──
  function subrayado(x0, y, w, color, k, sw = 9) {
    return path(`M${n(x0)},${n(y)} q${n(w / 4)},-12 ${n(w / 2)},-2 t${n(w / 2)},-3`, { stroke: color, sw, draw: E.out(k) });
  }
  function escrito(id, s, P, k, color, raya) {
    if (k <= 0) return '';
    const w = ancho(s, 'Caveat Brush', P.size), x0 = P.x - w / 2;
    return `<clipPath id="${id}"><rect x="${n(x0 - 20)}" y="${P.y - P.size * 1.1}" width="${n((w + 40) * Math.min(1, k / 0.85))}" height="${P.size * 1.6}"/></clipPath>` +
      text(s, P.x, P.y, { f: 'titulo', size: P.size, fill: color, clip: id }) +
      subrayado(x0 + w * 0.08, P.y + P.size * 0.2, w * 0.84, raya, p(k, 0.85, 1));
  }
  const ROTULOS = [['Herramientas.', C.turquesa, 'fichas'], ['Formación.', C.coral, 'curso'], ['Práctica.', C.amarillo, 'ensayo']];
  function rotulos(tm, t) {
    const R = F.rotulos;
    return ROTULOS.map(([s, color, clave], i) => {
      const k = p(t, T[clave][0] + 0.5, T[clave][1] + 0.3);
      if (k <= 0) return '';
      const w = ancho(s, 'Caveat Brush', R.size), sube = (1 - E.back(k)) * R.size * 0.38;
      if (R.modo === 'fila') { // los tres quedan bajo sus objetos
        return text(s, R.xs[i], R.y + sube, { f: 'titulo', size: R.size, fill: tm.titulo, op: Math.min(1, k * 2) }) +
          path(`M${n(R.xs[i] - w / 2)},${R.y + 16} q${n(w / 4)},-8 ${n(w / 2)},-1 t${n(w / 2)},0`, { stroke: color, sw: 7, draw: E.out(p(k, 0.4, 1)) });
      }
      // foco: una palabra por vez, grande, arriba del objeto
      const op = Math.min(1, k * 2) * (1 - p(t, R.hasta[i], R.hasta[i] + 0.25));
      return g(text(s, R.x, R.y + sube, { f: 'titulo', size: R.size, fill: tm.titulo }) +
        subrayado(R.x - w * 0.44, R.y + R.size * 0.22, w * 0.88, color, p(k, 0.4, 1), 10), { op });
    }).join('');
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
    window.SUBTITULOS.forEach((c) => {
      const op = Math.min(p(t, c.ini, c.ini + 0.12), 1 - p(t, c.fin - 0.12, c.fin));
      if (op <= 0) return;
      const ls = partir(c.texto, P);
      ls.forEach((l, i) => { s += text(l, P.x, P.y + (i - (ls.length - 1) / 2) * P.alto, { size: P.size, w: 700, fill: tm.sub, op }); });
    });
    return s;
  }

  // ── Una pasada completa en un tema (papel o carbón) ──
  function pasada(tm, t) {
    const kEsc = E.inOut(p(t, ...T.escritorio));
    let arte = g(piso(tm, t) + bancoEscritorio(tm, t, kEsc), { op: F.base(t) }) +
      grupo(maquinaCurso(tm, t), F.maquina(t)) + grupo(pesaFichas(tm, t, kEsc), F.pesa(t)) + grupo(recibosEnsayo(tm, t), F.recibos(t));
    let textos = text(F.aviso.s, F.aviso.x, F.aviso.y, { size: F.aviso.size, w: 800, ls: 2, fill: tm.suave, anchor: 'start', op: 0.85 });
    if (tm.id === 'papel') {
      textos += text('unas semanas después…', F.nota.x, F.nota.y, { f: 'nota', size: F.nota.size, fill: tm.suave, op: p(t, T.polvo[0], T.polvo[0] + 0.5), tf: `rotate(-3 ${F.nota.x} ${F.nota.y})` });
      textos += escrito('e1', '¿Qué cambió?', F.pregunta1, p(t, ...T.pregunta1), tm.titulo, C.coral);
    } else {
      textos += rotulos(tm, t);
      if (F.clientes) {
        const kc = E.out(p(t, ...T.clientes));
        arte += path('M1742,560 C1790,556 1832,520 1846,446', { stroke: C.coral, sw: 8, draw: kc }) +
          path('M1818,466 L1847,444 L1866,476', { stroke: C.coral, sw: 8, draw: p(kc, 0.8, 1) });
        textos += text('clientes', 1812, 412, { f: 'nota', size: 46, fill: tm.suave, op: p(kc, 0.5, 1) });
      }
      textos += escrito('e2', '¿Y en la realidad?', F.pregunta2, p(t, ...T.pregunta2), tm.titulo, C.coral);
    }
    return { arte, textos: textos + subtitulo(tm, t) };
  }

  window.renderAt = function (t) {
    const { W, H } = F, inc = F.inclinacion;
    const quieto = t >= T.polvo[0] && t < T.barrido[0];
    const semilla = quieto ? 3 : 1 + (Math.floor(t * 8) % 4);     // «temblor» del trazo a 8 fps
    const kB = E.inOut(p(t, ...T.barrido)), borde = mix(-2 * inc, W + 2 * inc, kB);
    let s = `<defs>
      <filter id="mano" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="${semilla}" result="r"/>
        <feDisplacementMap in="SourceGraphic" in2="r" scale="7" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <pattern id="tiza" width="420" height="594" patternUnits="userSpaceOnUse"><image href="../assets/tiza.png" width="420" height="594"/></pattern>
      <clipPath id="barrido"><path d="M-10,-10 H${n(borde + inc)} L${n(borde - inc)},${H + 10} H-10 Z"/></clipPath>
    </defs>`;
    if (kB < 1) {
      const a = pasada(TEMAS.papel, t);
      s += `<rect width="${W}" height="${H}" fill="${C.papel}"/>` + g(a.arte, { filter: 'mano' }) + a.textos;
    }
    if (kB > 0) {
      const b = pasada(TEMAS.carbon, t);
      // textura de tiza solo en la zona de dibujo, nunca detrás de subtítulos ni preguntas
      s += g(`<rect width="${W}" height="${H}" fill="${C.carbon}"/><rect y="${F.textura.y}" width="${W}" height="${F.textura.h}" fill="url(#tiza)"/>` +
        g(b.arte, { filter: 'mano' }) + b.textos, { clip: 'barrido' });
      if (kB < 1) s += line(borde + inc, -10, borde - inc, H + 10, { stroke: C.turquesa, sw: 10 });
    }
    document.getElementById('escena').innerHTML = s;
  };
})();
