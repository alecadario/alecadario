// Figura: clasificación orientativa para recomendaciones de ropa, a partir de las
// medidas de cada persona (perfil).

// Medidas de partida (genéricas). Las de cada persona llegan con su perfil (profile.js).
const BODY = {
  type: "Reloj de arena",
  detail: "con leve predominio de caderas",
  measures: [
    { key: "shoulders", label: "Hombros (contorno)", cm: 98 },
    { key: "bust", label: "Busto", cm: 92 },
    { key: "waist", label: "Cintura", cm: 74 },
    { key: "hipHigh", label: "Cadera alta", cm: 96 },
    { key: "hipLow", label: "Cadera baja", cm: 100 },
  ],
};

const FIGURE_FAVORS = [
  "Marcar la cintura: cinturones, vestidos y blusas cruzadas, peplum, cortes entallados.",
  "Pantalones y faldas de tiro alto: llevan la mirada a tu zona más definida.",
  "Escotes en V, cuadrado, corazón o halter, y hombros descubiertos: equilibran con tus caderas.",
  "Telas fluidas que acompañan la curva sin abultar: satén, crepé, punto fino.",
  "Pantalones rectos o wide leg con tiro alto, y faldas lápiz o con caída suave.",
  "Tops cortos con tiro alto: marcan la cintura y alargan las piernas.",
];
const FIGURE_BALANCE = [
  "Cortes cajón u oversize sin marcar la cintura: la tapan. Mejor con cinto o metidos por dentro.",
  "Volumen justo en las caderas (volados, faldas escalonadas, bolsillos cargo).",
  "Tiro bajo: corta la proporción de cintura y cadera.",
  "Volumen en la cintura (bubble, volados al ras): suma donde sos más definida.",
];

// Etiquetas de corte: cuánto favorecen a tu figura (positivo = favorece).
const CUT_TAGS = {
  "cintura-marcada": { label: "marca la cintura", score: 2 },
  cruzado: { label: "cruzado: marca la cintura", score: 2 },
  cinto: { label: "con cinto o lazo en la cintura", score: 2 },
  "tiro-alto": { label: "tiro alto", score: 2 },
  entallado: { label: "ceñido al cuerpo", score: 1 },
  fluido: { label: "tela fluida", score: 1 },
  "escote-v": { label: "escote en V", score: 1 },
  "escote-cuadrado": { label: "escote cuadrado", score: 1 },
  "escote-corazon": { label: "escote corazón", score: 1 },
  "escote-halter": { label: "cuello halter", score: 1 },
  "hombros-descubiertos": { label: "hombros descubiertos", score: 1 },
  "pierna-recta": { label: "pierna recta", score: 1 },
  evase: { label: "caída evasé", score: 1 },
  lapiz: { label: "corte lápiz", score: 1 },
  "a-line": { label: "falda en A", score: 1 },
  cropped: { label: "cropped", score: 0 },
  "pierna-ancha": { label: "pierna ancha", score: 0 },
  "volumen-cintura": { label: "volumen en la cintura", score: -1 },
  oversize: { label: "oversize: tapa la cintura", score: -1 },
  "sin-cintura": { label: "sin cintura marcada", score: -1 },
  "volumen-cadera": { label: "volumen en las caderas", score: -2 },
  "tiro-bajo": { label: "tiro bajo", score: -2 },
};

const FIGURE_CATEGORIES = ["top", "bottom", "dress", "outerwear"];

const FIGURE_LABELS = {
  good: "♡ Te favorece",
  neutral: "· Neutro para tu figura",
  bad: "△ Menos favorecedor",
  unknown: "· Sin datos de corte",
};

// Corte de cada prenda del catálogo inicial (según sus fotos).
const CUT_TAGS_BY_ID = {
  "1-dress": ["cintura-marcada", "entallado"],
  "2-dress": ["entallado", "fluido"],
  "3-dress": ["cintura-marcada", "a-line"],
  "4-dress": ["volumen-cadera"],
  "5-dress": ["entallado", "fluido"],
  "6-dress": ["escote-v", "sin-cintura", "fluido"],
  "7-dress": ["escote-cuadrado", "cintura-marcada", "a-line"],
  "29-dress": ["escote-halter", "cruzado", "entallado"],
  "IMG_6431-dress": ["escote-v", "entallado", "cruzado"],
  "IMG_6433-dress": ["entallado", "fluido"],
  "IMG_6434-dress": ["escote-cuadrado", "cintura-marcada", "fluido"],
  "IMG_6435-dress": ["entallado", "volumen-cadera"],
  "IMG_6436-dress": ["cintura-marcada", "entallado", "escote-halter"],
  "IMG_6437-dress": ["escote-v", "entallado", "fluido"],

  "8-top": ["cropped", "entallado"],
  "21-top": ["cropped", "oversize"],
  "23-top": ["escote-v", "cropped"],
  "24-top": ["escote-v", "cropped"],
  "25-top": ["oversize", "cropped"],
  "26-top": ["cropped", "volumen-cintura"],
  "27-top": ["entallado", "escote-corazon"],
  "28-top": ["entallado", "cropped"],
  "32-top": ["cropped"],
  "33-top": ["escote-v", "entallado", "escote-halter"],
  "34-top": ["cropped", "escote-cuadrado"],
  "35-top": ["entallado", "cintura-marcada"],
  "36-top": ["cintura-marcada", "escote-v", "cropped"],
  "37-top": ["escote-halter", "fluido"],
  "38-top": ["cropped"],
  "39-top": ["escote-v", "cropped"],
  "40-top": ["cinto", "cropped", "escote-v"],
  "41-top": ["cinto", "cropped", "escote-v"],
  "42-top": ["oversize", "fluido"],
  "43-top": ["cintura-marcada", "fluido", "hombros-descubiertos"],
  "44-top": ["oversize"],
  "45-top": ["oversize", "cropped"],
  "IMG_6399-top": ["escote-halter", "fluido"],
  "IMG_6400-top": ["entallado"],
  "IMG_6402-top": ["escote-halter", "fluido"],
  "IMG_6403-top": ["cruzado", "escote-v"],
  "IMG_6404-top": ["entallado", "hombros-descubiertos"],
  "IMG_6405-top": ["escote-v", "volumen-cintura"],
  "IMG_6406-top": ["escote-v", "entallado"],
  "IMG_6408-top": ["entallado", "cintura-marcada"],
  "IMG_6409-top": ["escote-halter", "fluido", "cintura-marcada"],
  "IMG_6411-top": ["hombros-descubiertos", "cintura-marcada", "cropped"],
  "IMG_6412-top": ["cruzado", "oversize"],
  "IMG_6426-top": ["oversize", "cropped"],
  "IMG_6427-top": [],
  "IMG_6428-top": ["entallado", "hombros-descubiertos"],
  "IMG_6429-top": ["oversize"],
  "basico-top-negro": ["entallado", "cropped"],

  "8-bottom": ["tiro-alto", "pierna-ancha", "fluido"],
  "9-bottom": ["tiro-alto", "fluido"],
  "10-bottom": ["tiro-alto", "pierna-ancha"],
  "11-bottom": ["pierna-ancha"],
  "12-bottom": ["tiro-alto", "pierna-ancha"],
  "13-bottom": ["tiro-alto", "cinto", "pierna-ancha"],
  "14-bottom": ["pierna-recta", "entallado"],
  "15-bottom": ["entallado", "pierna-recta"],
  "16-bottom": ["tiro-alto", "pierna-ancha"],
  "17-bottom": ["tiro-bajo", "pierna-ancha"],
  "18-bottom": ["tiro-alto", "pierna-recta"],
  "19-bottom": ["tiro-bajo", "pierna-ancha"],
  "20-bottom": ["tiro-alto", "pierna-ancha"],
  "IMG_6413-bottom": ["tiro-alto", "fluido", "evase"],
  "IMG_6414-bottom": ["tiro-alto", "fluido", "entallado"],
  "IMG_6415-bottom": ["tiro-alto"],
  "IMG_6416-bottom": ["tiro-alto"],
  "IMG_6417-bottom": ["tiro-alto", "volumen-cadera"],
  "IMG_6418-bottom": [],
  "IMG_6419-bottom": ["tiro-alto", "cinto"],
  "IMG_6420-bottom": ["tiro-alto", "volumen-cadera"],
  "IMG_6421-bottom": ["volumen-cadera"],
  "IMG_6422-bottom": ["sin-cintura"],
  "IMG_6423-bottom": ["lapiz"],
  "IMG_6424-bottom": ["lapiz"],
  "IMG_6425-bottom": ["tiro-alto"],
  "basico-short-negro": ["tiro-alto", "entallado"],

  "IMG_6430-outerwear": ["oversize"],
  "IMG_6432-outerwear": ["cropped", "volumen-cintura"],
  "IMG_6438-outerwear": ["oversize"],
  "IMG_6439-outerwear": ["oversize"],
};

// Corte de la prenda: el que editaste a mano manda sobre el del catálogo.
function getItemCuts(item) {
  if (Array.isArray(item.cut)) return item.cut;
  return CUT_TAGS_BY_ID[item.id] || null;
}

function getFigureFit(item) {
  if (!FEATURES.figure || !FIGURE_CATEGORIES.includes(item.category)) return { level: "na", score: 0, reasons: [] };
  const cuts = getItemCuts(item);
  if (!cuts) return { level: "unknown", score: 0, reasons: [] };
  const known = cuts.filter((t) => CUT_TAGS[t]);
  const score = known.reduce((s, t) => s + CUT_TAGS[t].score, 0);
  const level = score >= 2 ? "good" : score <= -1 ? "bad" : "neutral";
  return { level, score, reasons: known.map((t) => CUT_TAGS[t].label) };
}

// Evaluación de un look completo: afinidad con tu figura y consejos para equilibrarlo.
function getOutfitFigure(items) {
  const clothing = items.filter((it) => FIGURE_CATEGORIES.includes(it.category));
  if (!clothing.length) return { score: null, text: "Sin prendas de vestir para evaluar.", tips: [] };

  const fits = clothing.map(getFigureFit).filter((f) => f.level !== "unknown");
  const points = fits.reduce((s, f) => s + (f.level === "good" ? 1 : f.level === "neutral" ? 0.5 : 0), 0);
  const score = fits.length ? Math.round((points / fits.length) * 100) : null;

  const cutsOf = (cat) => {
    const it = clothing.find((c) => c.category === cat);
    return it ? getItemCuts(it) || [] : [];
  };
  const top = cutsOf("top");
  const bottom = cutsOf("bottom");
  const dress = cutsOf("dress");
  const outer = cutsOf("outerwear");
  const marksWaist = (c) => ["cintura-marcada", "cruzado", "cinto", "tiro-alto"].some((t) => c.includes(t));

  const tips = [];
  if (top.includes("oversize") && (bottom.includes("tiro-alto") || bottom.includes("lapiz") || bottom.includes("entallado"))) {
    tips.push("Top amplio: metelo por dentro del pantalón o atalo para que se vea la cintura.");
  }
  if ((top.includes("cropped") || top.includes("entallado")) && bottom.includes("tiro-alto")) {
    tips.push("✓ Top corto o ceñido con tiro alto: marca la cintura y alarga las piernas.");
  }
  if (bottom.includes("volumen-cadera") && !(top.includes("entallado") || top.includes("cropped") || top.includes("escote-v"))) {
    tips.push("Volumen abajo: equilibralo con un top ajustado o con escote.");
  }
  if (bottom.includes("tiro-bajo")) {
    tips.push("Tiro bajo: si podés, probá una versión de tiro alto, te marca mejor la cintura.");
  }
  if (outer.includes("oversize")) {
    tips.push("Blazer o abrigo amplio: llevalo abierto y marcá la cintura con un cinto.");
  }
  if (dress.length && !marksWaist(dress)) {
    tips.push("Sumá un cinto fino para marcar la cintura.");
  }
  if (!dress.length && !marksWaist(top) && !marksWaist(bottom) && !top.includes("entallado")) {
    tips.push("Ninguna prenda marca la cintura: probá con un cinto.");
  }

  return {
    score,
    text: score === null ? "Sin datos de corte para evaluar." : `${score}% de afinidad con tu figura.`,
    tips: tips.slice(0, 3),
  };
}
