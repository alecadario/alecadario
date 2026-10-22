// Avatar ilustrado y maniquí con fotos, para ver cómo queda un look.
// La silueta usa las proporciones de BODY (figura.js); las prendas se dibujan con su
// color (colorimetria.js), estampa y corte (figura.js).

const AVATAR = {
  skin: "#dca77f",
  skinShade: "#c98f66",
  hair: "#8f5d3a",
  hairLight: "#b98a5e",
  base: "#222222",
  cx: 150,
};

// ---------- utilidades de color ----------
function avHexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
function avRgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
function avMix(hex, other, t) {
  const a = avHexToRgb(hex), b = avHexToRgb(other);
  return avRgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}
const avDarken = (hex, t) => avMix(hex, "#000000", t);
const avLighten = (hex, t) => avMix(hex, "#ffffff", t);

function avItemColors(item) {
  const found = (item.colors || []).map(resolveColorHex).filter(Boolean);
  return found.length ? found : ["#b8b8b8"];
}

// ---------- perfil del cuerpo (mitad de ancho según la altura y) ----------
function avProfile() {
  const m = Object.fromEntries(BODY.measures.map((x) => [x.key, x.cm]));
  const k = 56 / m.hipLow; // la cadera baja equivale a 56 px de mitad de ancho
  const hw = (cm) => cm * k;
  return [
    [96, hw(m.shoulders)],
    [130, hw(m.bust) * 1.02],
    [160, hw(m.bust)],
    [190, ((hw(m.bust) + hw(m.waist)) / 2) * 0.95],
    [222, hw(m.waist)],
    [246, hw(m.hipHigh) * 0.97],
    [265, hw(m.hipHigh)],
    [302, hw(m.hipLow)],
    [335, hw(m.hipLow) * 0.97],
  ];
}

function avInterp(points, y) {
  if (y <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (y <= points[i][0]) {
      const [y0, v0] = points[i - 1];
      const [y1, v1] = points[i];
      return v0 + ((v1 - v0) * (y - y0)) / (y1 - y0);
    }
  }
  return points[points.length - 1][1];
}

const AV = {
  leg: { c: [[335, 28], [470, 20], [590, 14]], w: [[335, 28], [400, 25], [470, 17], [530, 16], [590, 10]] },
  arm: { c: [[104, 58], [200, 66], [330, 74]], w: [[104, 9], [200, 8.5], [330, 5.5]] },
};

// Camino suave (Catmull-Rom) a partir de puntos.
function avSmooth(pts, close) {
  if (pts.length < 3) return "M" + pts.map((p) => p.join(",")).join(" L");
  const p = close ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${p[1][0].toFixed(1)},${p[1][1].toFixed(1)}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + (close ? " Z" : "");
}

function avRange(y0, y1, step) {
  const out = [];
  for (let y = y0; y < y1; y += step) out.push(y);
  out.push(y1);
  return out;
}

// Contorno cerrado a partir de dos lados (listas de [x,y]) con tope y base rectos o curvos.
function avClosed(left, right, smooth = true) {
  const pts = [...left, ...right.slice().reverse()];
  return smooth ? avSmooth(pts, true) : "M" + pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" L") + " Z";
}

// ---------- estampas ----------
function avFill(item, defs, idPrefix) {
  const colors = avItemColors(item);
  const base = colors[0];
  const second = colors[1] || (avLighten(base, 0.55));
  const name = (item.name || "").toLowerCase();
  const id = `${idPrefix}-${defs.length}`;
  let pat = null;
  if (/rayas/.test(name)) {
    pat = `<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="${base}"/><rect x="3" width="2.4" height="9" fill="${second}"/></pattern>`;
  } else if (/lunares/.test(name)) {
    pat = `<pattern id="${id}" width="11" height="11" patternUnits="userSpaceOnUse"><rect width="11" height="11" fill="${base}"/><circle cx="3" cy="3" r="2" fill="${second}"/><circle cx="8.5" cy="8.5" r="1.6" fill="${second}"/></pattern>`;
  } else if (/vichy|cuadros/.test(name)) {
    pat = `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${second}"/><rect width="5" height="5" fill="${base}"/><rect x="5" y="5" width="5" height="5" fill="${base}"/></pattern>`;
  } else if (/floral|rosas|flores/.test(name) || (item.colors || []).includes("floral")) {
    pat = `<pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="${base}"/><circle cx="6" cy="6" r="3.4" fill="#c8606c"/><circle cx="16" cy="15" r="3" fill="#b8788e"/><circle cx="14" cy="4" r="1.6" fill="#6b7f5a"/><circle cx="4" cy="16" r="1.6" fill="#6b7f5a"/></pattern>`;
  } else if (/animal print|leopardo/.test(name) || (item.colors || []).includes("animal print")) {
    pat = `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#b58b5e"/><ellipse cx="4" cy="4" rx="3" ry="2" fill="#4a3322"/><ellipse cx="11" cy="9" rx="2.6" ry="1.8" fill="#4a3322"/><ellipse cx="4" cy="12" rx="2" ry="1.4" fill="#4a3322"/></pattern>`;
  } else if (/marmolado|metalizad|estampad/.test(name) && !/remera/.test(name)) {
    const a = avDarken(base, 0.35), b = avLighten(second, 0.1);
    pat = `<pattern id="${id}" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="${base}"/><path d="M0,10 Q10,0 22,12 T40,8 L40,22 Q28,30 16,20 T0,26 Z" fill="${second}" opacity="0.8"/><path d="M0,34 Q14,26 26,36 T40,30 L40,40 L0,40 Z" fill="${a}" opacity="0.8"/><circle cx="30" cy="4" r="4" fill="${b}" opacity="0.7"/></pattern>`;
  }
  if (pat) {
    defs.push(pat);
    return { fill: `url(#${id})`, stroke: avDarken(base, 0.3) };
  }
  return { fill: base, stroke: avDarken(base, 0.28) };
}

// ---------- cuerpo ----------
function avBody(P, cx) {
  const parts = [];
  const f = (d, extra = "") => parts.push(`<path d="${d}" fill="${AVATAR.skin}" stroke="${AVATAR.skinShade}" stroke-width="1" ${extra}/>`);
  // piernas
  [-1, 1].forEach((s) => {
    const ys = [335, 400, 470, 530, 590];
    const L = ys.map((y) => [cx + s * avInterp(AV.leg.c, y) - avInterp(AV.leg.w, y), y]);
    const R = ys.map((y) => [cx + s * avInterp(AV.leg.c, y) + avInterp(AV.leg.w, y), y]);
    f(avClosed(L, R));
    parts.push(`<ellipse cx="${cx + s * 14}" cy="606" rx="13" ry="7" fill="${AVATAR.skin}" stroke="${AVATAR.skinShade}"/>`);
  });
  // torso
  const ys = avRange(110, 340, 12);
  const left = [[cx - 16, 90], [cx - 42, 97], ...ys.map((y) => [cx - avInterp(P, y), y])];
  const right = [[cx + 16, 90], [cx + 42, 97], ...ys.map((y) => [cx + avInterp(P, y), y])];
  f(avClosed(left, right));
  // cuello y cabeza
  parts.push(`<rect x="${cx - 9}" y="72" width="18" height="30" rx="6" fill="${AVATAR.skin}"/>`);
  // brazos
  [-1, 1].forEach((s) => {
    const ay = avRange(104, 330, 18);
    const L = ay.map((y) => [cx + s * avInterp(AV.arm.c, y) - avInterp(AV.arm.w, y), y]);
    const R = ay.map((y) => [cx + s * avInterp(AV.arm.c, y) + avInterp(AV.arm.w, y), y]);
    f(avClosed(L, R));
    parts.push(`<ellipse cx="${cx + s * 75}" cy="340" rx="6.5" ry="10" fill="${AVATAR.skin}" stroke="${AVATAR.skinShade}"/>`);
  });
  return parts.join("");
}

function avHeadBack(cx) {
  return `<path d="M${cx - 31},52 C${cx - 38},6 ${cx + 38},6 ${cx + 31},52 L${cx + 36},150 Q${cx},166 ${cx - 36},150 Z" fill="${AVATAR.hair}"/>
    <path d="M${cx - 30},120 Q${cx - 34},140 ${cx - 28},152 M${cx + 30},120 Q${cx + 34},140 ${cx + 28},152" stroke="${AVATAR.hairLight}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

function avHeadFront(cx) {
  return `<ellipse cx="${cx}" cy="50" rx="24" ry="28" fill="${AVATAR.skin}" stroke="${AVATAR.skinShade}"/>
    <path d="M${cx - 25},46 C${cx - 24},14 ${cx + 24},14 ${cx + 25},46 C${cx + 14},30 ${cx - 6},26 ${cx - 25},46 Z" fill="${AVATAR.hair}"/>
    <circle cx="${cx - 9}" cy="51" r="1.8" fill="#3a2a22"/><circle cx="${cx + 9}" cy="51" r="1.8" fill="#3a2a22"/>
    <path d="M${cx - 8},62 Q${cx},70 ${cx + 8},62" stroke="#a5503f" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="${cx - 15}" cy="60" rx="4" ry="2.4" fill="#e58f7a" opacity="0.45"/><ellipse cx="${cx + 15}" cy="60" rx="4" ry="2.4" fill="#e58f7a" opacity="0.45"/>`;
}

// ---------- prendas ----------
function avText(item) {
  return (item.name || "").toLowerCase();
}
function avCuts(item) {
  return getItemCuts(item) || [];
}

// Silueta de una prenda desde yTop hasta yHem: la mitad de ancho sigue el cuerpo + holgura.
function avTorsoShape(P, cx, yTop, yHem, ease, flare = 0, yFlareFrom = 300) {
  const ys = avRange(yTop, yHem, 10);
  const half = (y) => {
    const body = avInterp(P, Math.min(y, 335));
    let h = body + ease;
    if (flare && y > yFlareFrom) h += (flare * (y - yFlareFrom)) / Math.max(1, yHem - yFlareFrom);
    return h;
  };
  return { left: ys.map((y) => [cx - half(y), y]), right: ys.map((y) => [cx + half(y), y]), half };
}

function avSleeves(item, kind, ease, cx, fill, stroke) {
  const reach = { long: 330, three: 255, short: 165 }[kind];
  if (!reach) return "";
  let out = "";
  [-1, 1].forEach((s) => {
    const ys = avRange(100, reach, 16);
    const widen = 3 + ease * 0.4;
    const L = ys.map((y) => [cx + s * avInterp(AV.arm.c, y) - (avInterp(AV.arm.w, y) + widen), y]);
    const R = ys.map((y) => [cx + s * avInterp(AV.arm.c, y) + (avInterp(AV.arm.w, y) + widen), y]);
    out += `<path d="${avClosed(L, R, false)}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
  });
  return out;
}

function avSpec(item) {
  const own = { ...(item.avatar || {}) };
  // Antes el largo de los tops se guardaba como "len": se lee como "hem", que es el que usa el dibujo.
  if (item.category === "top" && own.len && !own.hem) {
    own.hem = own.len;
    delete own.len;
  }
  return Object.assign({}, AVATAR_SPEC_BY_ID[item.id] || {}, own);
}

function avSleeveKind(item) {
  const sp = avSpec(item);
  if (sp.sleeve) return sp.sleeve === "none" ? null : sp.sleeve;
  const n = avText(item);
  if (/manga larga|mangas largas|sweater|cardigan|camisa|campera|blazer|blusa cruzada|poncho/.test(n)) return "long";
  if (/manga 3\/4/.test(n)) return "three";
  if (/remera|mangas cortas|manga corta/.test(n)) return "short";
  return null;
}

function avCoverage(item) {
  const sp = avSpec(item);
  if (sp.cov) return sp.cov;
  const n = avText(item);
  const cuts = avCuts(item);
  if (/strapless|bandeau|sin tiras/.test(n)) return "strapless";
  if (cuts.includes("escote-halter") || /halter/.test(n)) return "halter";
  if (cuts.includes("hombros-descubiertos") || /off-shoulder|bardot|hombros descubiertos/.test(n)) return "off";
  if (avSleeveKind(item) || /remera|chaleco|body|musculosa|camisa/.test(n)) return "full";
  return "straps";
}

function avNeckKind(item) {
  const sp = avSpec(item);
  if (sp.neck) return sp.neck;
  const cuts = avCuts(item);
  if (cuts.includes("escote-v") || cuts.includes("cruzado")) return "v";
  if (cuts.includes("escote-cuadrado")) return "square";
  if (cuts.includes("escote-corazon")) return "heart";
  return "round";
}

// Borde superior del corpiño (de izquierda a derecha) según cobertura y escote.
function avNeckPath(cx, cov, neck, topY) {
  const hw = avInterp(avProfile(), topY);
  if (cov === "full") {
    if (neck === "v") return [[cx - hw + 4, 98], [cx - 12, 98], [cx, 138], [cx + 12, 98], [cx + hw - 4, 98]];
    if (neck === "square") return [[cx - hw + 4, 98], [cx - 22, 98], [cx - 22, 120], [cx + 22, 120], [cx + 22, 98], [cx + hw - 4, 98]];
    if (neck === "heart") return [[cx - hw + 4, 98], [cx - 16, 100], [cx, 128], [cx + 16, 100], [cx + hw - 4, 98]];
    return [[cx - hw + 4, 98], [cx - 14, 98], [cx, 112], [cx + 14, 98], [cx + hw - 4, 98]];
  }
  if (cov === "off") return [[cx - hw - 6, 112], [cx, 118], [cx + hw + 6, 112]];
  if (cov === "strapless") return [[cx - hw + 2, 138], [cx, 140], [cx + hw - 2, 138]];
  if (neck === "v") return [[cx - hw + 6, 118], [cx - 6, 150], [cx, 154], [cx + 6, 150], [cx + hw - 6, 118]];
  if (neck === "heart") return [[cx - hw + 6, 136], [cx - 14, 128], [cx, 142], [cx + 14, 128], [cx + hw - 6, 136]];
  if (neck === "square") return [[cx - hw + 10, 126], [cx + hw - 10, 126]];
  return [[cx - hw + 6, 128], [cx, 144], [cx + hw - 6, 128]];
}

const AV_HEM = { bra: 188, crop: 208, hip: 258, long: 285, body: 300 };
const AV_DRESS_LEN = { mini: 388, knee: 450, midi: 500, maxi: 588 };
const AV_SKIRT_LEN = { mini: 392, knee: 470, midi: 510, maxi: 586 };
const AV_RISE = { high: 216, mid: 238, low: 266 };
const AV_PANTS_LEN = { short: 396, bike: 372, cropped: 556, full: 594 };

function avTop(item, P, cx, defs, idp, forDress) {
  const cuts = avCuts(item);
  const sp = avSpec(item);
  const n = avText(item);
  const { fill, stroke } = avFill(item, defs, idp);
  const cov = avCoverage(item);
  const neckKind = avNeckKind(item);
  const sleeve = avSleeveKind(item);
  let hem = AV_HEM[sp.hem] || (cuts.includes("cropped") ? 208 : /body/.test(n) ? 300 : /sweater/.test(n) ? 272 : cuts.includes("oversize") ? 285 : 258);
  if (forDress) hem = forDress;
  const ease = cuts.includes("oversize") ? 16 : cuts.includes("fluido") ? 8 : cuts.includes("entallado") ? 3 : 5;
  const flare = cuts.includes("fluido") && hem > 230 ? 8 : 0;
  const neck = avNeckPath(cx, cov, neckKind, 120);
  const shape = avTorsoShape(P, cx, 120, hem, ease, flare, 230);
  const topEdge = neck;
  const pts = [
    ...topEdge,
    ...shape.right.filter((p) => p[1] > topEdge[topEdge.length - 1][1]),
    [cx, hem + (hem < 230 ? 2 : 6)],
    ...shape.left.slice().reverse().filter((p) => p[1] > topEdge[0][1]),
  ];
  let out = avSleeves(item, sleeve, ease, cx, fill, stroke);
  out += `<path d="${avSmooth(pts, true)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>`;
  const strapColor = fill.startsWith("url") ? stroke : fill;
  if (cov === "straps") {
    const hw = avInterp(P, 110) - 14;
    out += `<path d="M${cx - hw},${topEdge[0][1]} L${cx - hw + 2},100 M${cx + hw},${topEdge[topEdge.length - 1][1]} L${cx + hw - 2},100" stroke="${strapColor}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else if (cov === "halter") {
    out += `<path d="M${topEdge[0][0] + 6},${topEdge[0][1]} L${cx - 4},84 M${topEdge[topEdge.length - 1][0] - 6},${topEdge[topEdge.length - 1][1]} L${cx + 4},84" stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  if (neckKind === "high") out += `<rect x="${cx - 10}" y="76" width="20" height="26" rx="6" fill="${fill}" stroke="${stroke}"/>`;
  if (cuts.includes("cinto")) out += `<path d="M${cx - avInterp(P, 222) - ease},222 L${cx + avInterp(P, 222) + ease},222" stroke="${avDarken(avItemColors(item)[0], 0.35)}" stroke-width="4"/>`;
  return out;
}

function avLegsPants(item, P, cx, defs, idp) {
  const cuts = avCuts(item);
  const sp = avSpec(item);
  const n = avText(item);
  const { fill, stroke } = avFill(item, defs, idp);
  const waistY = AV_RISE[sp.rise] || (cuts.includes("tiro-alto") ? 216 : cuts.includes("tiro-bajo") ? 266 : 238);
  const leg = sp.leg || (cuts.includes("pierna-ancha") ? "wide" : cuts.includes("pierna-recta") ? "straight" : cuts.includes("entallado") ? "slim" : "straight");
  const lenKey = sp.len || (/short/.test(n) ? "short" : /tobillero|vichy/.test(n) ? "cropped" : "full");
  const hem = AV_PANTS_LEN[lenKey] || 594;
  const ease = { wide: 4, straight: 2, slim: 0 }[leg] ?? 2;
  let extraHem = { wide: 17, straight: 9, slim: 3 }[leg] ?? 9;
  if (lenKey === "short" || lenKey === "bike") extraHem = Math.min(extraHem, leg === "wide" ? 14 : 8);
  const hipYs = avRange(waistY, 340, 10);
  const left = hipYs.map((y) => [cx - (avInterp(P, y) + ease), y]);
  const right = hipYs.map((y) => [cx + (avInterp(P, y) + ease), y]);
  const legPaths = [-1, 1].map((s) => {
    const ys = avRange(335, hem, 15);
    const wid = (y) => avInterp(AV.leg.w, y) + 3 + ((extraHem - 3) * (y - 335)) / Math.max(1, hem - 335);
    const L = ys.map((y) => [cx + s * avInterp(AV.leg.c, y) - wid(y), y]);
    const R = ys.map((y) => [cx + s * avInterp(AV.leg.c, y) + wid(y), y]);
    return avClosed(L, R);
  });
  const hipPath = avClosed(left, right);
  let out = "";
  // contornos y, encima, el relleno solo: así no queda una costura entre cadera y piernas
  [...legPaths, hipPath].forEach((d) => { out += `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`; });
  [...legPaths, hipPath].forEach((d) => { out += `<path d="${d}" fill="${fill}" stroke="none"/>`; });
  if (lenKey !== "short" && lenKey !== "bike") out += `<path d="M${cx},340 L${cx},${hem}" stroke="${stroke}" stroke-width="1.1" opacity="0.85"/>`;
  if (cuts.includes("cinto")) out += `<path d="M${cx - avInterp(P, waistY) - ease},${waistY + 2} L${cx + avInterp(P, waistY) + ease},${waistY + 2}" stroke="${avDarken(avItemColors(item)[0], 0.4)}" stroke-width="4"/>`;
  return out;
}

function avSkirt(item, P, cx, defs, idp) {
  const cuts = avCuts(item);
  const sp = avSpec(item);
  const n = avText(item);
  const { fill, stroke } = avFill(item, defs, idp);
  const waistY = AV_RISE[sp.rise] || (cuts.includes("tiro-alto") ? 216 : 232);
  const hem = AV_SKIRT_LEN[sp.len] || (/larga|maxi/.test(n) ? 586 : /mini|volados|corte simple/.test(n) ? 392 : 470);
  const flare = { straight: 2, aline: 24, full: 36 }[sp.flare] ?? (cuts.includes("volumen-cadera") ? 34 : cuts.includes("lapiz") ? -2 : cuts.includes("fluido") || cuts.includes("evase") ? 24 : 12);
  const shape = avTorsoShape(P, cx, waistY, hem, 2, flare, 300);
  return `<path d="${avClosed(shape.left, shape.right)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
    <path d="M${cx - 14},${hem - 3} Q${cx},${hem + 5} ${cx + 14},${hem - 3}" stroke="${stroke}" fill="none" opacity="0.5"/>`;
}

function avDress(item, P, cx, defs, idp) {
  const cuts = avCuts(item);
  const sp = avSpec(item);
  const n = avText(item);
  const { fill, stroke } = avFill(item, defs, idp);
  const cov = avCoverage(item);
  const neckKind = avNeckKind(item);
  const sleeve = avSleeveKind(item);
  const hem = AV_DRESS_LEN[sp.len] || (/largo|larga|maxi/.test(n) ? 588 : /midi/.test(n) ? 500 : /corto|mini/.test(n) ? 388 : 450);
  const fit = sp.fit || (cuts.includes("entallado") ? "fitted" : cuts.includes("a-line") || cuts.includes("volumen-cadera") ? "aline" : "loose");
  const ease = { fitted: 2, aline: 4, loose: 8 }[fit];
  const flare = { fitted: 4, aline: 38, loose: 14 }[fit];
  const neck = avNeckPath(cx, cov, neckKind, 120);
  const shape = avTorsoShape(P, cx, 120, hem, ease, flare, 300);
  const pts = [
    ...neck,
    ...shape.right.filter((p) => p[1] > neck[neck.length - 1][1]),
    [cx, hem + 5],
    ...shape.left.slice().reverse().filter((p) => p[1] > neck[0][1]),
  ];
  let out = avSleeves(item, sleeve, ease, cx, fill, stroke);
  out += `<path d="${avSmooth(pts, true)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>`;
  const strapColor = fill.startsWith("url") ? stroke : fill;
  if (cov === "straps") {
    const hw = avInterp(P, 110) - 14;
    out += `<path d="M${cx - hw + 4},${neck[0][1]} L${cx - hw + 6},100 M${cx + hw - 4},${neck[neck.length - 1][1]} L${cx + hw - 6},100" stroke="${strapColor}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  } else if (cov === "halter") {
    out += `<path d="M${neck[0][0] + 6},${neck[0][1]} L${cx - 4},84 M${neck[neck.length - 1][0] - 6},${neck[neck.length - 1][1]} L${cx + 4},84" stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  if (neckKind === "high") out += `<rect x="${cx - 10}" y="76" width="20" height="26" rx="6" fill="${fill}" stroke="${stroke}"/>`;
  if (cuts.includes("cintura-marcada") || cuts.includes("cinto") || cuts.includes("cruzado")) {
    out += `<path d="M${cx - avInterp(P, 222) - ease},224 Q${cx},230 ${cx + avInterp(P, 222) + ease},224" stroke="${stroke}" stroke-width="2.4" fill="none"/>`;
  }
  if (/abertura|abertur/.test(n)) {
    out += `<path d="M${cx + 10},${hem - 150} L${cx + 26},${hem + 4}" stroke="${AVATAR.skin}" stroke-width="7" stroke-linecap="round" opacity="0.95"/>`;
  }
  return out;
}

function avOuterwear(item, P, cx, defs, idp) {
  const cuts = avCuts(item);
  const sp = avSpec(item);
  const n = avText(item);
  const { fill, stroke } = avFill(item, defs, idp);
  const hem = { crop: 246, hip: 282, long: 304 }[sp.len] || (/campera/.test(n) ? 246 : cuts.includes("oversize") ? 304 : 282);
  const ease = cuts.includes("oversize") ? 24 : 12;
  const ys = avRange(100, hem, 12);
  const outer = (y) => avInterp(P, Math.min(y, 335)) + ease + 2;
  const inner = (y) => (y < 140 ? 10 + (y - 100) * 0.3 : 20 + (y - 140) * 0.05);
  let out = avSleeves(item, "long", ease, cx, fill, stroke);
  [-1, 1].forEach((s) => {
    const L = ys.map((y) => [cx + s * outer(y), y]);
    const R = ys.map((y) => [cx + s * inner(y), y]);
    out += `<path d="${avClosed(L, R, false)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>`;
    out += `<path d="M${cx + s * inner(106)},100 L${cx + s * (inner(106) + 14)},150 L${cx + s * (inner(150) + 2)},178 Z" fill="${avLighten(avItemColors(item)[0], 0.12)}" stroke="${stroke}" stroke-width="1"/>`;
  });
  if (/cierre|campera/.test(n)) out += `<path d="M${cx},112 L${cx},${hem}" stroke="${stroke}" stroke-width="1.4"/>`;
  return out;
}

function avShoes(item, cx, defs, idp) {
  const n = avText(item);
  const col = avItemColors(item)[0];
  const stroke = avDarken(col, 0.3);
  const heel = /taco|sandalia|tamanco|plataforma|zapatos? alto/.test(n) && !/bajo/.test(n);
  let out = "";
  [-1, 1].forEach((s) => {
    const x = cx + s * 14;
    if (heel) {
      out += `<path d="M${x - 12},598 L${x + 12},598 L${x + 13},612 L${x - 10},608 Z" fill="${col}" stroke="${stroke}"/>
        <rect x="${x - 3 * s - 3}" y="606" width="5" height="14" fill="${stroke}"/>`;
    } else {
      out += `<path d="M${x - 13},600 Q${x - 14},614 ${x - 2},614 Q${x + 12},614 ${x + 14},609 L${x + 12},598 Z" fill="${col}" stroke="${stroke}"/>`;
    }
  });
  return out;
}

function avBag(item, cx) {
  const col = avItemColors(item)[0];
  const stroke = avDarken(col, 0.35);
  const x = cx + 62;
  return `<path d="M${cx + 46},100 Q${x + 10},180 ${x + 12},296" stroke="${stroke}" stroke-width="2.4" fill="none"/>
    <rect x="${x - 14}" y="296" width="44" height="34" rx="6" fill="${col}" stroke="${stroke}" stroke-width="1.2"/>
    <path d="M${x - 14},306 L${x + 30},306" stroke="${stroke}" stroke-width="1"/>`;
}

function avJewelry(item, cx) {
  const n = avText(item);
  const col = avItemColors(item)[0];
  const stroke = avDarken(col, 0.3);
  if (/aro|pendiente|arete|caravana/.test(n)) {
    return `<circle cx="${cx - 25}" cy="62" r="4" fill="${col}" stroke="${stroke}"/><circle cx="${cx + 25}" cy="62" r="4" fill="${col}" stroke="${stroke}"/>`;
  }
  if (/pulsera|brazalete/.test(n)) {
    return `<rect x="${cx - 81}" y="318" width="13" height="5" rx="2" fill="${col}" stroke="${stroke}"/><rect x="${cx + 68}" y="318" width="13" height="5" rx="2" fill="${col}" stroke="${stroke}"/>`;
  }
  if (/anillo/.test(n)) {
    return `<circle cx="${cx + 75}" cy="344" r="2.6" fill="none" stroke="${col}" stroke-width="2"/>`;
  }
  return `<path d="M${cx - 13},98 Q${cx},124 ${cx + 13},98" stroke="${col}" stroke-width="2.6" fill="none"/><circle cx="${cx}" cy="119" r="3" fill="${col}" stroke="${stroke}"/>`;
}

// ---------- armado del avatar ----------
let avatarCounter = 0;

// Devuelve el SVG del avatar vestido con los items dados.
function buildAvatarSvg(items) {
  const cx = AVATAR.cx;
  const P = avProfile();
  const defs = [];
  const idp = `avp${++avatarCounter}`;
  const by = (cat) => items.filter((i) => i.category === cat);
  const dress = by("dress")[0];
  const top = by("top")[0];
  const bottom = by("bottom")[0];
  const outer = by("outerwear")[0];
  const shoes = by("shoes")[0];
  const bag = by("bag")[0];
  const jewels = by("jewelry");
  const accessories = by("accessory");

  let g = "";
  g += avHeadBack(cx);
  g += avBody(P, cx);

  // base neutra (la misma que usás para probarte todo) cuando falta una parte
  if (!dress && !bottom) {
    g += `<path d="${avClosed(avRange(262, 340, 10).map((y) => [cx - (avInterp(P, y) + 1), y]), avRange(262, 340, 10).map((y) => [cx + (avInterp(P, y) + 1), y]))}" fill="${AVATAR.base}"/>`;
    [-1, 1].forEach((s) => {
      const ys = avRange(335, 400, 15);
      const L = ys.map((y) => [cx + s * avInterp(AV.leg.c, y) - avInterp(AV.leg.w, y) - 1, y]);
      const R = ys.map((y) => [cx + s * avInterp(AV.leg.c, y) + avInterp(AV.leg.w, y) + 1, y]);
      g += `<path d="${avClosed(L, R)}" fill="${AVATAR.base}"/>`;
    });
  }
  if (!dress && !top) {
    const hw = avInterp(P, 140);
    g += `<path d="M${cx - hw + 4},134 Q${cx},146 ${cx + hw - 4},134 L${cx + hw - 6},176 Q${cx},182 ${cx - hw + 6},176 Z" fill="${AVATAR.base}"/>
      <path d="M${cx - hw + 8},134 L${cx - hw + 10},102 M${cx + hw - 8},134 L${cx + hw - 10},102" stroke="${AVATAR.base}" stroke-width="5" stroke-linecap="round"/>`;
  }

  if (dress) {
    g += avDress(dress, P, cx, defs, idp);
  } else {
    if (bottom) g += /falda/.test(avText(bottom)) ? avSkirt(bottom, P, cx, defs, idp) : avLegsPants(bottom, P, cx, defs, idp);
    if (top) g += avTop(top, P, cx, defs, idp, null);
  }
  if (shoes) g += avShoes(shoes, cx, defs, idp);
  g += avHeadFront(cx);
  if (outer) g += avOuterwear(outer, P, cx, defs, idp);
  jewels.forEach((j) => { g += avJewelry(j, cx); });
  accessories.forEach((a) => {
    if (/cinto|cintur/.test(avText(a))) {
      const col = avItemColors(a)[0];
      g += `<path d="M${cx - avInterp(P, 222) - 6},224 L${cx + avInterp(P, 222) + 6},224" stroke="${col}" stroke-width="5"/>`;
    }
  });
  if (bag) g += avBag(bag, cx);

  return `<svg class="avatar-svg" viewBox="0 0 300 640" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar con el look">
    <defs>${defs.join("")}</defs>
    <ellipse cx="${cx}" cy="622" rx="70" ry="8" fill="rgba(2,79,91,0.12)"/>
    ${g}
  </svg>`;
}

// ---------- maniquí con tus fotos ----------
function buildMannequinHtml(items) {
  const by = (cat) => items.filter((i) => i.category === cat);
  const tile = (it, cls) => `<figure class="mq-tile ${cls}"><img src="${itemImage(it)}" alt="${escapeHtml(it.name)}"><figcaption>${escapeHtml(it.name)}</figcaption></figure>`;
  const dress = by("dress")[0], top = by("top")[0], bottom = by("bottom")[0];
  const main = dress
    ? tile(dress, "mq-dress")
    : [top ? tile(top, "mq-top") : "", bottom ? tile(bottom, "mq-bottom") : ""].join("");
  const shoes = by("shoes").map((s) => tile(s, "mq-shoes")).join("");
  const side = [...by("outerwear"), ...by("bag"), ...by("jewelry"), ...by("accessory")].map((s) => tile(s, "mq-side-tile")).join("");
  if (!main && !shoes && !side) return '<p class="muted">Elegí prendas para ver el maniquí.</p>';
  return `<div class="mannequin"><div class="mq-col">${main}${shoes}</div>${side ? `<div class="mq-side">${side}</div>` : ""}</div>`;
}

// ---------- vistas ----------
function renderAvatarInto(container, items) {
  container.innerHTML = items.length ? buildAvatarSvg(items) : "";
}

// Ventana con las dos vistas: ilustrada y con tus fotos.
function openLookPreview(items, title) {
  const overlay = document.createElement("div");
  overlay.className = "editor-overlay";
  overlay.innerHTML = `
    <div class="editor-box look-preview" role="dialog" aria-label="Vista previa del look">
      <h3>${escapeHtml(title || "Cómo se ve el look")}</h3>
      <div class="fit-legend">
        <button type="button" class="fit-chip active" data-view="avatar">Avatar ilustrado</button>
        <button type="button" class="fit-chip" data-view="mannequin">Con mis fotos</button>
      </div>
      <div class="look-view"></div>
      <p class="muted look-note"></p>
      <div class="form-actions"><button type="button" class="secondary" data-act="close">Cerrar</button></div>
    </div>`;
  document.body.appendChild(overlay);
  const view = overlay.querySelector(".look-view");
  const note = overlay.querySelector(".look-note");
  const names = items.map((i) => i.name).join(" + ");
  function show(kind) {
    overlay.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === kind));
    if (kind === "avatar") {
      view.innerHTML = `<div class="avatar-wrap">${buildAvatarSvg(items)}</div>`;
      note.textContent = "Ilustración con tus proporciones; los colores y cortes son aproximados. " + names;
    } else {
      view.innerHTML = buildMannequinHtml(items);
      note.textContent = "Las fotos reales de cada prenda, apiladas en orden. " + names;
    }
  }
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || (e.target.dataset && e.target.dataset.act === "close")) overlay.remove();
    if (e.target.dataset && e.target.dataset.view) show(e.target.dataset.view);
  });
  show("avatar");
}
