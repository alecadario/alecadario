// Estrategia de armario: qué tenés de más, de qué podrías desprenderte, qué conviene
// comprar y de dónde compraste más. Todo se calcula acá, sin servicios externos.

const STORE_OPTIONS = ["Zara", "Mango", "Bershka", "Lefties", "Stradivarius", "Pull&Bear", "H&M", "Shein", "Amazon", "Primor", "Vinted / segunda mano", "Regalo", "Otra"];

// Tipo de prenda a partir del nombre (el orden importa: lo más específico primero).
const ITEM_TYPES = [
  ["bailarinas", /bailarina/],
  ["sandalias", /sandalia/],
  ["tamancos", /tamanc/],
  ["mocasines", /mocasin|zapatitos|zapatos cerrados/],
  ["vestido", /vestido/],
  ["blazer", /blazer/],
  ["campera", /campera|abrigo|chaqueta/],
  ["sweater / cárdigan", /sweater|jersey|cardigan|cárdigan/],
  ["chaleco", /chaleco/],
  ["camisa / blusa", /camisa|blusa/],
  ["remera / musculosa", /remera|musculosa|body/],
  ["top", /\btop\b|bandeau/],
  ["short", /short/],
  ["falda", /\bfalda\b/],
  ["pantalón", /pantal|palazzo/],
  ["jean", /jean|denim/],
];

function itemType(it) {
  if (it.category === "bag") return "cartera";
  if (it.category === "jewelry") return "joya";
  if (it.category === "accessory") return "accesorio";
  const n = (it.name || "").toLowerCase();
  const found = ITEM_TYPES.find(([, re]) => re.test(n));
  if (found) return found[0];
  return { top: "top", bottom: "pantalón / falda", dress: "vestido", outerwear: "abrigo", shoes: "calzado" }[it.category] || it.category;
}

function rgbToHsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

function colorFamily(hex) {
  const [h, s, l] = rgbToHsl(hex);
  if (l > 0.86 && s < 0.35) return "blanco / crudo";
  if (l < 0.17) return "negro";
  if (s < 0.1) return "gris";
  if (h >= 15 && h < 50 && s < 0.55 && l > 0.55) return "beige / camel";
  if (h < 15 || h >= 345) return l < 0.35 ? "bordo / vino" : "rojo / rosa";
  if (h < 45) return l < 0.45 ? "marrón" : "naranja / coral";
  if (h < 70) return l < 0.6 ? "mostaza / oliva" : "amarillo";
  if (h < 165) return "verde";
  if (h < 260) return "azul / celeste";
  if (h < 345) return s < 0.3 ? "malva" : "rosa / violeta";
  return "otro";
}

function itemFamily(it) {
  const hex = (it.colors || []).map(resolveColorHex).find(Boolean);
  return hex ? colorFamily(hex) : "sin color";
}

function itemOrigin(it) {
  return [it.brand, it.store].filter(Boolean);
}

function countBy(list, keyFn) {
  const out = {};
  list.forEach((x) => {
    const k = keyFn(x);
    if (!k) return;
    (out[k] = out[k] || []).push(x);
  });
  return out;
}

const REDUNDANT_FROM = 3;

function analyzeWardrobe() {
  const items = state.items;
  const clothing = items.filter((i) => FIGURE_CATEGORIES.includes(i.category));
  const wornEntries = state.log.filter((l) => l.type === "worn").length;

  const groups = countBy(items, (it) => `${itemType(it)} · ${itemFamily(it)}`);
  const redundant = Object.entries(groups)
    .filter(([, v]) => v.length >= REDUNDANT_FROM)
    .sort((a, b) => b[1].length - a[1].length);
  const redundantSize = {};
  redundant.forEach(([, v]) => v.forEach((it) => { redundantSize[it.id] = v.length; }));

  const today = fmtDate(new Date());
  const sixMonthsAgo = (() => { const d = new Date(); d.setMonth(d.getMonth() - 6); return fmtDate(d); })();
  const candidates = items
    .filter((it) => !it.donate)
    .map((it) => {
      const reasons = [];
      let score = 0;
      if (FIGURE_CATEGORIES.includes(it.category) && getFigureFit(it).level === "bad") { score += 2; reasons.push("Menos favorecedora para tu figura"); }
      if (getColorFit(it).level === "out") { score += 2; reasons.push("Fuera de tu paleta de colores"); }
      if (redundantSize[it.id]) { score += 1; reasons.push(`Repetida: tenés ${redundantSize[it.id]} parecidas`); }
      if (wornEntries >= 10) {
        const stats = getItemWearStats(it.id);
        if (stats.count === 0) { score += 1; reasons.push("Nunca la marcaste como usada"); }
        else if (stats.lastDate && stats.lastDate < sixMonthsAgo) { score += 1; reasons.push("No la usás hace más de 6 meses"); }
      }
      return { it, score, reasons };
    })
    .filter((c) => c.score >= 3)
    .sort((a, b) => b.score - a.score);

  const byStore = countBy(items, (it) => it.store);
  const byBrand = countBy(items, (it) => it.brand);
  const byType = countBy(items, itemType);
  const spend = items.reduce((s, it) => s + (Number(it.price) || 0), 0);
  const priced = items.filter((it) => Number(it.price) > 0);
  const missingOrigin = items.filter((it) => !it.store || !it.brand);

  // Huecos para comprar
  const goodBoth = (it) => {
    const p = getColorFit(it).level;
    const f = getFigureFit(it).level;
    return (p === "in" || p === "near") && (f === "good" || f === "na");
  };
  const gaps = [];
  const cat = (c) => items.filter((i) => i.category === c);
  if (!cat("bag").length) gaps.push({ text: "No tenés carteras cargadas: es lo que más completa los looks.", shop: { clothing: "bolso" } });
  if (!cat("jewelry").length) gaps.push({ text: "No tenés joyas cargadas. Tus metales: dorado envejecido, cobre y bronce.", shop: null });
  const outerGood = cat("outerwear").filter((i) => getFigureFit(i).level === "good");
  if (FEATURES.figure && cat("outerwear").length && !outerGood.length) {
    gaps.push({ text: `Tus ${cat("outerwear").length} abrigos son todos oversize o sin cintura: te falta un blazer o abrigo entallado que marque la cintura.`, shop: { clothing: "blazer" } });
  }
  const tops = items.filter((i) => i.category === "top").length;
  const bottoms = items.filter((i) => i.category === "bottom").length;
  if (bottoms && tops / bottoms >= 1.4) {
    gaps.push({ text: `Tenés ${tops} tops y solo ${bottoms} pantalones, shorts y faldas: te conviene sumar prendas de abajo (de tiro alto) antes que más tops.`, shop: { clothing: "pantalón" } });
  }
  const missingColors = FEATURES.palette ? FASHION_COLORS.filter((c) => countOwnedNear(c.hex).length === 0).map((c) => c.name) : [];
  const priorityColors = ["café chocolate", "verde bosque", "vino", "camel", "marfil", "terracota", "berenjena", "mostaza"];
  const pc = priorityColors.filter((n) => missingColors.includes(n));
  if (pc.length) gaps.push({ text: `No tenés nada en estos colores de tu paleta: ${pc.join(", ")}.`, shop: { color: pc[0] } });
  const lowGood = clothing.filter(goodBoth).length;
  const stop = redundant.slice(0, 5).map(([k, v]) => ({ key: k, items: v }));

  return { items, clothing, groups, redundant, candidates, byStore, byBrand, byType, spend, priced, missingOrigin, gaps, stop, lowGood, wornEntries };
}

function thumbButtons(list) {
  return list.map((it) => `<button type="button" class="thumb-btn" data-edit="${it.id}" title="${escapeHtml(it.name)}"><img src="${itemImage(it)}" alt="${escapeHtml(it.name)}"></button>`).join("");
}

function barList(entries, total, emptyMsg) {
  if (!entries.length) return `<p class="muted">${emptyMsg}</p>`;
  return `<div class="bar-list">${entries.map(([label, n, extra]) => `
    <div class="bar-row"><span class="bar-label">${escapeHtml(label)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${Math.max(4, Math.round((n / Math.max(total, 1)) * 100))}%"></span></span>
      <span class="bar-n">${n}${extra ? ` · ${escapeHtml(extra)}` : ""}</span></div>`).join("")}</div>`;
}

let originPage = 0;

function renderStrategy() {
  const root = document.getElementById("strategy");
  const a = analyzeWardrobe();
  const total = a.items.length;

  const catEntries = Object.entries(CATEGORIES)
    .map(([k, label]) => [label, a.items.filter((i) => i.category === k).length])
    .filter(([, n]) => n > 0);
  const typeEntries = Object.entries(a.byType).map(([k, v]) => [k, v.length]).sort((x, y) => y[1] - x[1]).slice(0, 12);
  const storeEntries = Object.entries(a.byStore).map(([k, v]) => {
    const spent = v.reduce((s, it) => s + (Number(it.price) || 0), 0);
    return [k, v.length, spent ? `${spent.toFixed(0)} €` : ""];
  }).sort((x, y) => y[1] - x[1]);
  const brandEntries = Object.entries(a.byBrand).map(([k, v]) => [k, v.length]).sort((x, y) => y[1] - x[1]).slice(0, 10);

  const redundantHtml = a.redundant.length
    ? a.redundant.map(([k, v]) => `<div class="strategy-card"><b>${escapeHtml(k)}</b> <span class="muted">(${v.length})</span><div class="thumb-row">${thumbButtons(v)}</div></div>`).join("")
    : '<p class="muted">No encontré grupos con 3 o más prendas parecidas.</p>';

  const donated = a.items.filter((i) => i.donate);
  const candHtml = a.candidates.length
    ? a.candidates.slice(0, 15).map((c) => `
      <div class="strategy-card cand">
        <button type="button" class="thumb-btn" data-edit="${c.it.id}" title="${escapeHtml(c.it.name)}"><img src="${itemImage(c.it)}" alt=""></button>
        <div class="cand-body"><b>${escapeHtml(c.it.name)}</b>
          <ul>${c.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
          <button type="button" class="secondary small" data-donate="${c.it.id}">Marcar para donar</button></div>
      </div>`).join("")
    : '<p class="muted">Ninguna prenda junta suficientes motivos todavía.</p>';
  const donatedHtml = donated.length
    ? `<h4>Ya marcadas para donar (${donated.length})</h4><div class="thumb-row">${donated.map((it) => `<span class="donate-chip">${thumbButtons([it])}<button type="button" class="secondary small" data-undonate="${it.id}">Quitar</button></span>`).join("")}</div>`
    : "";

  const gapsHtml = a.gaps.length
    ? `<ul class="makeup-list">${a.gaps.map((g, i) => `<li>${escapeHtml(g.text)}${g.shop ? ` <button type="button" class="secondary small" data-gap="${i}">Buscar en Comprar</button>` : ""}</li>`).join("")}</ul>`
    : '<p class="muted">Tu armario está bastante equilibrado.</p>';
  const stopHtml = a.stop.length
    ? `<ul class="makeup-list">${a.stop.map((s) => `<li>No compres más: <b>${escapeHtml(s.key)}</b> (ya tenés ${s.items.length}). <span class="muted">Son: ${s.items.map((i) => escapeHtml(i.name)).join(", ")}</span></li>`).join("")}</ul>`
    : "";

  const start = originPage * 10;
  const pageItems = a.missingOrigin.slice(start, start + 10);
  const originHtml = a.missingOrigin.length
    ? `<p class="muted">Faltan marca o tienda en ${a.missingOrigin.length} prendas. Completá estas y guardá: con eso se arman los gráficos de dónde y qué comprás.</p>
      <div class="origin-table">${pageItems.map((it) => `
        <div class="origin-row" data-id="${it.id}">
          <button type="button" class="thumb-btn" data-edit="${it.id}" title="${escapeHtml(it.name)}"><img src="${itemImage(it)}" alt=""></button>
          <span class="origin-name">${escapeHtml(it.name)}</span>
          <input type="text" list="brand-list" placeholder="Marca" value="${escapeHtml(it.brand || "")}" data-f="brand">
          <input type="text" list="store-list" placeholder="Tienda" value="${escapeHtml(it.store || "")}" data-f="store">
          <input type="number" min="0" step="0.01" placeholder="€" value="${it.price || ""}" data-f="price">
        </div>`).join("")}</div>
      <div class="form-actions"><button type="button" id="origin-save">Guardar estas ${pageItems.length}</button>
        ${start + 10 < a.missingOrigin.length ? '<button type="button" class="secondary" id="origin-next">Siguientes 10</button>' : ""}
        ${originPage > 0 ? '<button type="button" class="secondary" id="origin-prev">Anteriores</button>' : ""}</div>`
    : '<p class="muted">Todas tus prendas tienen marca y tienda.</p>';

  root.innerHTML = `
    <h2>Mi estrategia de armario</h2>
    <p class="muted">Un panorama de lo que tenés para decidir qué comprar, qué no y de qué desprenderte. Son sugerencias: la decisión es tuya.</p>

    <h3>Resumen</h3>
    <p><b>${total}</b> prendas${a.spend ? ` · <b>${a.spend.toFixed(0)} €</b> invertidos (${a.priced.length} con precio cargado)` : ""}.</p>
    ${barList(catEntries, total, "")}

    <h3>Antes de comprar</h3>
    ${gapsHtml}
    ${stopHtml}

    <h3>Tenés de más</h3>
    <p class="muted">Grupos de 3 o más prendas del mismo tipo y color. Tocá una foto para abrirla.</p>
    ${redundantHtml}

    <h3>Podrías desprenderte de</h3>
    <p class="muted">Prendas que juntan varios motivos: ${[FEATURES.figure ? "no te favorecen" : "", FEATURES.palette ? "están fuera de tu paleta" : "", "están repetidas"].filter(Boolean).join(", ")}${a.wornEntries >= 10 ? " o casi no las usás" : ""}.${a.wornEntries < 10 ? " Cuando registres más looks usados en el Calendario, también cuenta cuánto las usás." : ""}</p>
    ${candHtml}
    ${donatedHtml}

    <h3>Qué tipo de prendas comprás más</h3>
    ${barList(typeEntries, total, "")}

    <h3>Dónde comprás más</h3>
    ${barList(storeEntries, total, "Todavía no cargaste la tienda de ninguna prenda.")}
    <h4>Marcas</h4>
    ${barList(brandEntries, total, "Todavía no cargaste la marca de ninguna prenda.")}

    <h3>Completar marca y tienda</h3>
    ${originHtml}
  `;

  root.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => startEditItem(b.dataset.edit)));
  root.querySelectorAll("[data-donate]").forEach((b) => b.addEventListener("click", () => {
    const it = state.items.find((i) => i.id === b.dataset.donate);
    if (it) { it.donate = true; saveState(); renderStrategy(); }
  }));
  root.querySelectorAll("[data-undonate]").forEach((b) => b.addEventListener("click", () => {
    const it = state.items.find((i) => i.id === b.dataset.undonate);
    if (it) { delete it.donate; saveState(); renderStrategy(); }
  }));
  root.querySelectorAll("[data-gap]").forEach((b) => b.addEventListener("click", () => {
    const g = a.gaps[Number(b.dataset.gap)];
    if (g.shop && g.shop.clothing) shopState.clothing = g.shop.clothing;
    document.querySelector('.tab-btn[data-tab="shop"]').click();
  }));
  const save = root.querySelector("#origin-save");
  if (save) save.addEventListener("click", () => {
    root.querySelectorAll(".origin-row").forEach((row) => {
      const it = state.items.find((i) => i.id === row.dataset.id);
      if (!it) return;
      const val = (f) => row.querySelector(`[data-f="${f}"]`).value.trim();
      if (val("brand")) it.brand = val("brand"); else delete it.brand;
      if (val("store")) it.store = val("store"); else delete it.store;
      if (val("price")) it.price = Number(val("price")); else delete it.price;
    });
    if (saveState()) renderStrategy();
  });
  const next = root.querySelector("#origin-next");
  if (next) next.addEventListener("click", () => { originPage++; renderStrategy(); });
  const prev = root.querySelector("#origin-prev");
  if (prev) prev.addEventListener("click", () => { originPage = Math.max(0, originPage - 1); renderStrategy(); });
}

// Marcas y tiendas conocidas (para autocompletar).
function refreshOriginLists() {
  const brands = [...new Set(state.items.map((i) => i.brand).filter(Boolean).concat(POPULAR_BRANDS))];
  const bl = document.getElementById("brand-list");
  const sl = document.getElementById("store-list");
  if (bl) bl.innerHTML = brands.map((b) => `<option value="${escapeHtml(b)}">`).join("");
  if (sl) sl.innerHTML = [...new Set(state.items.map((i) => i.store).filter(Boolean).concat(STORE_OPTIONS))].map((s) => `<option value="${escapeHtml(s)}">`).join("");
}
