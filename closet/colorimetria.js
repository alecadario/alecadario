// Colorimetría personal: Otoño Intenso (guía SAIGU Cosmetics, sept 2026).
// Cada color tiene un rol: FN = fondo de armario, CA = complementos/acentos, M = metales.

const SEASON = {
  name: "Otoño Intenso",
  tagline: "Cálida y magnética",
  traits: [
    { label: "Tono y subtono", value: "Cálido" },
    { label: "Contraste", value: "Alto" },
    { label: "Saturación", value: "Media" },
  ],
};

const PALETTE_ROWS = [
  ["#dfd5c5 #c7bbaa #e3d2b4 #e6d0b3 #bca88d #e0d2b2 #dcddac #eaddac #ecbfb2 #accbc5", "FN FN FN FN FN FN FN FN FN FN"],
  ["#c6c1b4 #8e8d85 #5a5951 #a19889 #565555 #453b44 #283330 #2d3955 #46403b #2d3031", "FN FN FN FN FN FN FN FN FN FN"],
  ["#ccb381 #a8946a #906f4a #bc9779 #a87f6a #e0938c #c87772 #c58e78 #ae7b6c #603d3c", "CA CA CA CA CA CA CA CA CA CA"],
  ["#dfa293 #b8766a #ae6664 #72474a #5f343a #bf6d5f #ae5656 #9e3f4f #68303a #4f333a", "CA CA CA CA FN CA CA CA CA FN"],
  ["#cca7bd #af7ca2 #9a6384 #572f4b #2e4150 #83bac0 #60a3b8 #4f899f #39616e #2b4346", "CA CA CA CA FN CA CA CA CA CA"],
  ["#85c4b3 #70a49e #6c8a7b #325f55 #384745 #b3cc98 #b2ca89 #96a16e #636d4d #494f48", "CA CA CA CA FN CA CA CA CA FN"],
  ["#978f68 #756748 #605a49 #494740 #b5a07b #af9f6a #a27253 #90715b #b8b3a2 #8d928f", "CA CA FN FN M M M M M M"],
];

const PALETTE = PALETTE_ROWS.flatMap(([hexes, roles]) => {
  const h = hexes.split(" ");
  const r = roles.split(" ");
  return h.map((hex, i) => ({ hex, role: r[i] }));
});

const PALETTE_ROLE_LABELS = {
  FN: { title: "Fondo de armario", desc: "La base de tu guardarropa: versátiles y combinan bien entre sí." },
  CA: { title: "Complementos y acentos", desc: "Aportan contraste y energía. En pequeñas dosis, combinados con los de fondo." },
  M: { title: "Metales y brillantes", desc: "Dorados, cobres y bronces envejecidos para joyas y detalles." },
};

// Los colores que más te favorecen según la guía.
const BEST_HARMONY = [
  { name: "Café chocolate", hex: "#4c3e36" },
  { name: "Verde bosque profundo", hex: "#3c5146" },
  { name: "Vino cálido", hex: "#6e4947" },
  { name: "Berenjena cálido", hex: "#57464e" },
];
const BEST_IMPACT = [
  { name: "Amarillo mostaza brillante", hex: "#cbad62" },
  { name: "Rojo calidez saturado", hex: "#ba685c" },
  { name: "Marfil dorado", hex: "#e1d5b1" },
];

const MAKEUP_TIPS = [
  { intent: "Efecto buena cara", tip: "Rubor bronceador melocotón y labial nude cálido profundo." },
  { intent: "Sofisticado formal", tip: "Ahumado de ojos en chocolate y cobre, con labial nude amarronado o cálido." },
  { intent: "Presencia y carácter", tip: "Labial vino cálido o borgoña profundo, delineado sutil y pómulos con polvos bronceadores." },
  { intent: "Seguridad", tip: "Labial rojo quemado o terracota oscuro, ojos limpios con máscara negra y cejas muy definidas." },
];

// Nombres de color de las prendas -> color típico (para compararlos con la paleta).
const COLOR_NAME_HEX = {
  blanco: "#f4f4f0", crema: "#efe6d2", marfil: "#efe3c8", beige: "#d8c4a6",
  negro: "#1c1c1c", gris: "#8a8a8a", "gris claro": "#c9c9c9",
  celeste: "#8fbfe0", "celeste claro": "#b9d9ee", "celeste medio": "#6fa5d0", "celeste grisáceo": "#a9bdcc",
  azul: "#2f5fb0", "azul marino": "#1f2a4d", "azul oscuro": "#1a2b52", "azul grisáceo": "#5a6f8c",
  verde: "#2e9b4f", "verde oscuro": "#1f4a37", "verde oliva": "#6b7040", "verde salvia": "#9aae8a",
  "verde menta": "#a8dcc0", menta: "#b4e0cc", "verde petróleo": "#1f5560", "verde lima": "#b8d82a",
  marrón: "#6b4430", chocolate: "#4a2f22", camel: "#b88a5a", bordo: "#6a2030", vino: "#6e1f33",
  bronce: "#9a6b3e", cobre: "#a35f3c", dorado: "#c9a24a", plateado: "#c0c0c0", terracota: "#b5603f",
  amarillo: "#f0d23c", "amarillo pálido": "#f2e8a8", mostaza: "#c8a550", naranja: "#e8812a",
  coral: "#f27a5e", "rosa palo": "#e8b4a8", rosa: "#e86aa8", fucsia: "#d02a85", rojo: "#c02a2a",
  violeta: "#7a4a9a", turquesa: "#1cb6bb",
};

function hexToLab(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92);
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

const BEST_LAB = [...BEST_HARMONY, ...BEST_IMPACT].map((c) => hexToLab(c.hex));
// Los colores destacados de la guía también cuentan como parte de la paleta.
const PALETTE_LAB = [...PALETTE.map((p) => p.hex), ...BEST_HARMONY.map((c) => c.hex), ...BEST_IMPACT.map((c) => c.hex)]
  .map((hex) => ({ hex, lab: hexToLab(hex) }));

function labDistance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function resolveColorHex(name) {
  const key = String(name).trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(key)) return key;
  if (COLOR_NAME_HEX[key]) return COLOR_NAME_HEX[key];
  let best = null;
  Object.keys(COLOR_NAME_HEX).forEach((k) => {
    if (key.includes(k) && (!best || k.length > best.length)) best = k;
  });
  return best ? COLOR_NAME_HEX[best] : null;
}

const FIT_LABELS = {
  in: "✓ Tu paleta",
  near: "≈ Cerca de tu paleta",
  out: "✗ Fuera de tu paleta",
  unknown: "· Sin color de referencia",
};

// Nivel de calce de una prenda con la paleta. Se usa el primer color de la
// prenda que se pueda reconocer (el dominante). Si la prenda tiene un ajuste
// manual (item.fitOverride) manda ese.
function getColorFit(item) {
  if (!FEATURES.palette) return { level: "unknown", deltaE: null, manual: false, star: false };
  const star = (lab) => BEST_LAB.some((b) => labDistance(lab, b) <= 10);
  if (item.fitOverride === "in" || item.fitOverride === "near" || item.fitOverride === "out") {
    return { level: item.fitOverride, deltaE: null, manual: true, star: false };
  }
  const hex = (item.colors || []).map(resolveColorHex).find(Boolean);
  if (!hex) return { level: "unknown", deltaE: null, manual: false, star: false };
  const lab = hexToLab(hex);
  let best = Infinity;
  PALETTE_LAB.forEach((p) => {
    const d = labDistance(lab, p.lab);
    if (d < best) best = d;
  });
  const level = best <= 10 ? "in" : best <= 18 ? "near" : "out";
  return { level, deltaE: best, manual: false, star: level === "in" && star(lab) };
}

// Resumen de calce de un conjunto de prendas (outfit).
function getOutfitFit(items) {
  const fits = items.map(getColorFit);
  const known = fits.filter((f) => f.level !== "unknown");
  if (!known.length) return { score: null, text: "Sin colores de referencia para comparar con tu paleta." };
  const points = known.reduce((s, f) => s + (f.level === "in" ? 1 : f.level === "near" ? 0.5 : 0), 0);
  const score = Math.round((points / known.length) * 100);
  const inCount = known.filter((f) => f.level === "in").length;
  return {
    score,
    text: `${inCount} de ${known.length} prendas en tu paleta (${score}% de afinidad).`,
  };
}
