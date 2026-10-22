// Pestaña "Comprar": arma búsquedas en tiendas con los colores de tu paleta.
// No trae productos ni precios en vivo: abre el buscador de cada tienda ya filtrado.

const STORES = {
  zara: { label: "Zara", url: (q) => `https://www.zara.com/es/es/search?searchTerm=${q}` },
  bershka: { label: "Bershka", url: (q) => googleSite("bershka.com", q) },
  mango: { label: "Mango", url: (q) => googleSite("shop.mango.com", q) },
  lefties: { label: "Lefties", url: (q) => googleSite("lefties.com", q) },
  amazon: { label: "Amazon", url: (q) => `https://www.amazon.es/s?k=${q}` },
  primor: { label: "Primor", url: (q) => `https://www.primor.eu/catalogsearch/result/?q=${q}` },
};

function googleSite(domain, q) {
  return `https://www.google.com/search?q=site:${domain}+${q}`;
}

function storeLink(storeKey, query, text) {
  const q = encodeURIComponent(query).replace(/%20/g, "+");
  return `<a class="store-link" href="${STORES[storeKey].url(q)}" target="_blank" rel="noopener noreferrer">${text || STORES[storeKey].label}</a>`;
}

// Colores de tu paleta con nombre de moda (para buscar en tiendas).
const FASHION_COLORS = [
  { name: "café chocolate", hex: "#4c3e36" },
  { name: "verde bosque", hex: "#3c5146" },
  { name: "vino", hex: "#6e4947" },
  { name: "berenjena", hex: "#57464e" },
  { name: "mostaza", hex: "#cbad62" },
  { name: "terracota", hex: "#ba685c" },
  { name: "marfil", hex: "#e1d5b1" },
  { name: "camel", hex: "#bc9779" },
  { name: "beige arena", hex: "#e3d2b4" },
  { name: "verde oliva", hex: "#636d4d" },
  { name: "verde botella", hex: "#325f55" },
  { name: "azul petróleo", hex: "#39616e" },
  { name: "azul acero", hex: "#4f899f" },
  { name: "azul marino", hex: "#2d3955" },
  { name: "salmón", hex: "#dfa293" },
  { name: "rosa teja", hex: "#c87772" },
  { name: "burdeos", hex: "#9e3f4f" },
  { name: "granate", hex: "#68303a" },
  { name: "ciruela", hex: "#572f4b" },
  { name: "malva", hex: "#af7ca2" },
  { name: "gris topo", hex: "#8e8d85" },
  { name: "cobre", hex: "#a27253" },
  { name: "bronce", hex: "#90715b" },
  { name: "dorado envejecido", hex: "#af9f6a" },
];

const CLOTHING_TYPES = ["vestido", "blusa", "camiseta", "top", "jersey", "camisa", "pantalón", "falda", "short", "blazer", "chaqueta", "abrigo", "zapatos", "bolso", "cinturón"];

// Tonos de maquillaje de la guía (color de referencia aproximado de tu paleta).
const MAKEUP_PRODUCTS = {
  labial: [
    { name: "nude cálido profundo", hex: "#a87f6a" },
    { name: "nude amarronado", hex: "#906f4a" },
    { name: "vino cálido", hex: "#6e4947" },
    { name: "borgoña profundo", hex: "#68303a" },
    { name: "rojo quemado", hex: "#ae5656" },
    { name: "terracota oscuro", hex: "#ba685c" },
  ],
  rubor: [
    { name: "melocotón", hex: "#dfa293" },
    { name: "terracota", hex: "#bf6d5f" },
    { name: "rosa teja", hex: "#c87772" },
  ],
  bronceador: [
    { name: "bronceador cálido", hex: "#bc9779" },
    { name: "bronceador tostado", hex: "#a8946a" },
  ],
  "sombra de ojos": [
    { name: "chocolate", hex: "#4c3e36" },
    { name: "cobre", hex: "#a27253" },
    { name: "bronce", hex: "#90715b" },
    { name: "verde bosque", hex: "#3c5146" },
  ],
  "delineador": [
    { name: "marrón oscuro", hex: "#4c3e36" },
    { name: "negro", hex: "#2d3031" },
  ],
  "máscara de pestañas": [{ name: "negra", hex: "#2d3031" }],
};

const MAKEUP_INTENTS = [
  { label: "Efecto buena cara", picks: [["rubor", "melocotón"], ["labial", "nude cálido profundo"]] },
  { label: "Sofisticado formal", picks: [["sombra de ojos", "chocolate"], ["sombra de ojos", "cobre"], ["labial", "nude amarronado"]] },
  { label: "Presencia y carácter", picks: [["labial", "vino cálido"], ["labial", "borgoña profundo"], ["bronceador", "bronceador cálido"]] },
  { label: "Seguridad", picks: [["labial", "rojo quemado"], ["labial", "terracota oscuro"], ["máscara de pestañas", "negra"]] },
];

const POPULAR_BRANDS = ["Maybelline", "L'Oréal Paris", "NYX", "Catrice", "Essence", "Kiko Milano", "Rimmel", "Revlon", "MAC", "Clinique", "Charlotte Tilbury", "Rare Beauty"];

let shopState = { store: "zara", clothing: "vestido", makeup: "labial", brand: "" };

// Qué tipos de tu armario corresponden a lo que se busca en la tienda.
const CLOTHING_TO_TYPES = {
  vestido: ["vestido"],
  blusa: ["camisa / blusa"],
  camisa: ["camisa / blusa"],
  camiseta: ["remera / musculosa"],
  top: ["top", "remera / musculosa"],
  jersey: ["sweater / cárdigan"],
  pantalón: ["pantalón", "jean"],
  falda: ["falda"],
  short: ["short"],
  blazer: ["blazer"],
  chaqueta: ["campera", "blazer"],
  abrigo: ["campera", "blazer"],
};

function matchesClothingType(it, clothing) {
  if (clothing === "zapatos") return it.category === "shoes";
  if (clothing === "bolso") return it.category === "bag";
  if (clothing === "cinturón") return it.category === "accessory";
  return (CLOTHING_TO_TYPES[clothing] || []).includes(itemType(it));
}

// Las prendas que ya tenés con un color parecido.
function countOwnedNear(hex) {
  const target = hexToLab(hex);
  return state.items.filter((it) => {
    const h = (it.colors || []).map(resolveColorHex).find(Boolean);
    return h && labDistance(hexToLab(h), target) <= 14;
  });
}

function renderShop() {
  const root = document.getElementById("shop");
  const clothesStores = ["zara", "bershka", "mango", "lefties"];

  const clothingCards = FASHION_COLORS.map((c) => {
    const owned = countOwnedNear(c.hex);
    const ownedOfType = owned.filter((it) => matchesClothingType(it, shopState.clothing));
    const ownedOther = owned.filter((it) => !ownedOfType.includes(it));
    const query = `${shopState.clothing} ${c.name}`;
    return `
      <div class="shop-card">
        <span class="swatch" style="background:${c.hex}" title="${c.hex}"></span>
        <div class="shop-card-body">
          <b>${escapeHtml(c.name)}</b>
          ${ownedOfType.length
            ? `<button type="button" class="owned-btn" data-owned="${escapeHtml(c.name)}">Ya tenés ${ownedOfType.length} (${escapeHtml(shopState.clothing)} de este color) · ver cuáles</button><div class="thumb-row owned-list" hidden>${thumbButtons(ownedOfType)}</div>`
            : `<span class="muted">No tenés ${escapeHtml(shopState.clothing)} de este color</span>`}
          ${ownedOther.length
            ? `<button type="button" class="owned-btn" data-owned-other="${escapeHtml(c.name)}">+${ownedOther.length} de otros tipos en este color</button><div class="thumb-row owned-list" hidden>${thumbButtons(ownedOther)}</div>`
            : ""}
          ${storeLink(shopState.store, query, `Buscar "${escapeHtml(query)}" en ${STORES[shopState.store].label}`)}
        </div>
      </div>`;
  }).join("");

  const shades = MAKEUP_PRODUCTS[shopState.makeup];
  const makeupCards = shades.map((s) => {
    const brand = shopState.brand.trim();
    const query = `${shopState.makeup} ${s.name}${brand ? " " + brand : ""}`;
    return `
      <div class="shop-card">
        <span class="swatch" style="background:${s.hex}" title="Color de referencia ${s.hex}"></span>
        <div class="shop-card-body">
          <b>${escapeHtml(s.name)}</b>
          <span class="muted">${escapeHtml(query)}</span>
          <span class="store-row">${storeLink("amazon", query)} ${storeLink("primor", query)}</span>
        </div>
      </div>`;
  }).join("");

  const intentButtons = MAKEUP_INTENTS.map((it, i) => `<button type="button" class="fit-chip" data-intent="${i}">${it.label}</button>`).join("");

  root.innerHTML = `
    <h2>Comprar con mi colorimetría</h2>
    <p class="muted">Armo la búsqueda con los colores de tu paleta y la abro directo en la tienda. No muestro productos ni precios acá: eso lo ves en la tienda. Para Bershka, Mango y Lefties la búsqueda se abre con Google limitado a su sitio, así evitamos enlaces que no funcionan. Tiendas de España.</p>

    <h3>Ropa y accesorios</h3>
    <div class="filters">
      <select id="shop-store">
        ${clothesStores.map((k) => `<option value="${k}" ${shopState.store === k ? "selected" : ""}>${STORES[k].label}</option>`).join("")}
      </select>
      <select id="shop-clothing">
        ${CLOTHING_TYPES.map((t) => `<option value="${t}" ${shopState.clothing === t ? "selected" : ""}>${t}</option>`).join("")}
      </select>
    </div>
    <div class="shop-grid">${clothingCards}</div>

    <h3>Maquillaje</h3>
    <p class="muted">Atajos según la intención de tu guía:</p>
    <div class="fit-legend">${intentButtons}</div>
    <div id="shop-intent-results"></div>
    <div class="filters">
      <select id="shop-makeup">
        ${Object.keys(MAKEUP_PRODUCTS).map((p) => `<option value="${p}" ${shopState.makeup === p ? "selected" : ""}>${p}</option>`).join("")}
      </select>
      <input type="text" id="shop-brand" list="shop-brands" placeholder="Marca (opcional)" value="${escapeHtml(shopState.brand)}">
      <datalist id="shop-brands">${POPULAR_BRANDS.map((b) => `<option value="${escapeHtml(b)}">`).join("")}</datalist>
    </div>
    <p class="muted">Los tonos son los que recomienda tu guía; el color de la muestra es solo de referencia, cada marca lo nombra distinto. Las marcas de la lista son solo ejemplos para autocompletar.</p>
    <div class="shop-grid">${makeupCards}</div>
  `;

  root.querySelectorAll(".owned-btn").forEach((b) => b.addEventListener("click", () => {
    const list = b.nextElementSibling;
    list.hidden = !list.hidden;
  }));
  root.querySelectorAll("#shop [data-edit]").forEach((b) => b.addEventListener("click", () => startEditItem(b.dataset.edit)));
  root.querySelector("#shop-store").addEventListener("change", (e) => { shopState.store = e.target.value; renderShop(); });
  root.querySelector("#shop-clothing").addEventListener("change", (e) => { shopState.clothing = e.target.value; renderShop(); });
  root.querySelector("#shop-makeup").addEventListener("change", (e) => { shopState.makeup = e.target.value; renderShop(); });
  root.querySelector("#shop-brand").addEventListener("change", (e) => { shopState.brand = e.target.value; renderShop(); });

  root.querySelectorAll("[data-intent]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const intent = MAKEUP_INTENTS[Number(btn.dataset.intent)];
      const brand = shopState.brand.trim();
      const rows = intent.picks.map(([product, shade]) => {
        const query = `${product} ${shade}${brand ? " " + brand : ""}`;
        return `<li>${escapeHtml(query)}: ${storeLink("amazon", query)} · ${storeLink("primor", query)}</li>`;
      }).join("");
      root.querySelector("#shop-intent-results").innerHTML = `<p><b>${intent.label}</b></p><ul class="makeup-list">${rows}</ul>`;
    });
  });
}
