const STORAGE_KEY = "closetApp:v1";

// El catálogo inicial y las fotos mejoradas son personales: solo existen en tu computadora.
const SEED_BASE = typeof SEED_ITEMS !== "undefined" ? SEED_ITEMS : [];
const SEED_EXTRA = typeof SEED_ACCESSORIES !== "undefined" ? SEED_ACCESSORIES : [];
const PHOTO_MAP = typeof ENHANCED_PHOTOS !== "undefined" ? ENHANCED_PHOTOS : {};
const emptyState = () => ({ items: [], outfits: [], log: [], trips: [], profile: {} });

const CATEGORIES = {
  top: "Top / remera / blusa",
  bottom: "Pantalón / short / falda",
  dress: "Vestido",
  outerwear: "Abrigo / campera / blazer",
  shoes: "Calzado",
  bag: "Cartera / bolso",
  jewelry: "Joyas",
  accessory: "Accesorio",
};

const SEASONS = ["verano", "otoño", "invierno", "primavera", "todo el año"];
const OCCASIONS = ["casual", "trabajo", "formal", "salida", "noche", "deporte", "playa"];

// Marca y tienda que se leen en las etiquetas de las fotos del calzado.
const KNOWN_ORIGINS = {
  "calzado-1-shoes": { brand: "Zara", store: "Zara" },
  "calzado-4-shoes": { brand: "Stradivarius", store: "Stradivarius" },
  "calzado-5-shoes": { brand: "Modare" },
  "calzado-6-shoes": { brand: "Mango", store: "Mango" },
};

let state = loadState();
let editingItemId = null;

function loadState() {
  // En la nube la fuente de verdad es Airtable: se carga después de iniciar sesión (cloud.js).
  if (CLOUD_ENABLED) return emptyState();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.log) parsed.log = [];
      if (!parsed.trips) parsed.trips = [];
      if (!parsed.profile) parsed.profile = typeof LOCAL_PROFILE !== "undefined" ? LOCAL_PROFILE : {};
      const merged = mergeNewSeedItems(parsed);
      const photos = applyEnhancedPhotos(parsed);
      const origins = applyKnownOrigins(parsed);
      if (merged || photos || origins) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    } catch (e) { /* fall through to reseed */ }
  }
  const seeded = { items: JSON.parse(JSON.stringify(SEED_BASE)), outfits: [], log: [], trips: [], profile: typeof LOCAL_PROFILE !== "undefined" ? LOCAL_PROFILE : {} };
  mergeNewSeedItems(seeded);
  applyEnhancedPhotos(seeded);
  applyKnownOrigins(seeded);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

// Cambia las fotos del catálogo por las versiones mejoradas (fotos/). Solo toca las que
// siguen siendo las del catálogo: si cambiaste la foto de una prenda, se respeta la tuya.
function applyEnhancedPhotos(st) {
  let changed = false;
  st.items.forEach((it) => {
    const better = PHOTO_MAP[it.id];
    if (better && typeof it.image === "string" && it.image.startsWith("images/")) {
      it.originalImage = it.image;
      it.image = better;
      changed = true;
    }
  });
  return changed;
}

function applyKnownOrigins(st) {
  let changed = false;
  st.items.forEach((it) => {
    const known = KNOWN_ORIGINS[it.id];
    if (!known) return;
    Object.keys(known).forEach((k) => {
      if (!it[k] && !(it.originsApplied && it.originsApplied.includes(k))) {
        it[k] = known[k];
        changed = true;
      }
    });
    it.originsApplied = Object.keys(known);
  });
  return changed;
}

// Suma al armario las prendas nuevas del catálogo (SEED_ACCESSORIES) una sola vez,
// sin tocar lo que ya hay. Si después las borrás, no vuelven a aparecer.
function mergeNewSeedItems(st) {
  if (!st.seenSeedIds) st.seenSeedIds = [];
  let changed = false;
  SEED_EXTRA.forEach((it) => {
    if (!st.seenSeedIds.includes(it.id)) {
      st.items.push(JSON.parse(JSON.stringify(it)));
      st.seenSeedIds.push(it.id);
      changed = true;
    }
  });
  return changed;
}

function saveState() {
  if (CLOUD_ENABLED) {
    cloudQueuePush();
    return true;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    alert('No se pudo guardar: el almacenamiento del navegador quedó lleno. Si acabás de agregar una foto muy pesada, probá con otra imagen más liviana, o eliminá alguna prenda con foto grande desde "Editar".');
    return false;
  }
}

// Foto que se muestra de una prenda: la de la prenda sola si existe, si no la puesta.
function itemImage(it) {
  return it.photoSolo || it.image;
}

function uid(prefix) {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- Tabs ----------
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "outfit-builder") renderOutfitBuilder();
    if (btn.dataset.tab === "my-outfits") renderMyOutfits();
    if (btn.dataset.tab === "calendar") renderCalendar();
    if (btn.dataset.tab === "trips") renderTrips();
    if (btn.dataset.tab === "gallery") renderGallery();
    if (btn.dataset.tab === "colorimetry") renderColorimetry();
    if (btn.dataset.tab === "shop") renderShop();
    if (btn.dataset.tab === "figure") renderFigure();
    if (btn.dataset.tab === "strategy") renderStrategy();
    if (btn.dataset.tab === "profile") renderProfile();
  });
});

// ---------- Wear tracking ----------
function getItemWearStats(itemId) {
  const wornEntries = state.log.filter((l) => l.type === "worn" && l.itemIds.includes(itemId));
  const count = wornEntries.length;
  const lastDate = wornEntries.reduce((max, e) => (!max || e.date > max ? e.date : max), null);
  return { count, lastDate };
}

// ---------- Filter dropdowns (wardrobe) ----------
function populateSelect(select, values, labelMap) {
  values.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = labelMap ? labelMap[v] : v;
    select.appendChild(opt);
  });
}

populateSelect(document.getElementById("filter-category"), Object.keys(CATEGORIES), CATEGORIES);
populateSelect(document.getElementById("filter-season"), SEASONS);
populateSelect(document.getElementById("filter-occasion"), OCCASIONS);
populateSelect(document.getElementById("rec-occasion"), OCCASIONS);
populateSelect(document.getElementById("rec-season"), SEASONS);

["filter-category", "filter-season", "filter-occasion", "filter-palette", "filter-figure", "filter-search", "filter-favorites"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderWardrobe);
});

// ---------- Wardrobe rendering ----------
function renderWardrobe() {
  const category = document.getElementById("filter-category").value;
  const season = document.getElementById("filter-season").value;
  const occasion = document.getElementById("filter-occasion").value;
  const search = document.getElementById("filter-search").value.trim().toLowerCase();
  const onlyFav = document.getElementById("filter-favorites").checked;
  const palette = document.getElementById("filter-palette").value;
  const figure = document.getElementById("filter-figure").value;

  const filtered = state.items.filter((it) => {
    if (category && it.category !== category) return false;
    if (figure && getFigureFit(it).level !== figure) return false;
    if (palette) {
      const level = getColorFit(it).level;
      if (palette === "mine" ? level !== "in" && level !== "near" : level !== palette) return false;
    }
    if (season && !it.seasons.includes(season) && !it.seasons.includes("todo el año")) return false;
    if (occasion && !it.occasions.includes(occasion)) return false;
    if (onlyFav && !it.favorite) return false;
    if (search) {
      const haystack = (it.name + " " + it.colors.join(" ")).toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  document.getElementById("wardrobe-count").textContent =
    `${filtered.length} prenda${filtered.length === 1 ? "" : "s"}`;

  const grid = document.getElementById("wardrobe-grid");
  grid.innerHTML = "";
  filtered.forEach((it) => grid.appendChild(itemCard(it)));
}

function itemCard(it) {
  const card = document.createElement("div");
  card.className = "card";
  const stats = getItemWearStats(it.id);
  const fit = getColorFit(it);
  const figFit = getFigureFit(it);
  card.innerHTML = `
    <img src="${itemImage(it)}" alt="${escapeHtml(it.name)}" loading="lazy">
    <div class="card-body">
      <div class="card-name">${escapeHtml(it.name)}</div>
      <div class="tag-row">
        <span class="tag">${CATEGORIES[it.category] || it.category}</span>
        ${it.colors.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join("")}
      </div>
      <div class="tag-row">
        ${it.seasons.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("")}
      </div>
      ${FEATURES.palette ? `<div class="tag-row">
        <span class="tag tag-fit tag-fit-${fit.level}">${FIT_LABELS[fit.level]}</span>
        ${fit.star ? '<span class="tag tag-fit tag-fit-star">★ Color estrella</span>' : ""}
      </div>` : ""}
      ${figFit.level === "na" ? "" : `<div class="tag-row">
        <span class="tag tag-fig tag-fig-${figFit.level}" title="${escapeHtml(figFit.reasons.join(", "))}">${FIGURE_LABELS[figFit.level]}</span>
      </div>
      ${figFit.reasons.length ? `<div class="muted fig-reasons">${escapeHtml(figFit.reasons.join(" · "))}</div>` : ""}`}
      <div class="tag-row">
        <span class="tag tag-wear">${stats.count === 0 ? "Sin usar todavía" : `Usada ${stats.count}x`}</span>
        ${stats.lastDate ? `<span class="tag tag-wear">Último uso: ${stats.lastDate}</span>` : ""}
      </div>
      ${itemOrigin(it).length ? `<div class="muted origin-line">${escapeHtml(itemOrigin(it).join(" · "))}${it.price ? ` · ${it.price} €` : ""}</div>` : ""}
      ${it.donate ? '<div class="tag-row"><span class="tag tag-fit-out">Para donar</span></div>' : ""}
      <div class="card-actions">
        <button class="star-btn${it.favorite ? " active" : ""}" data-action="fav">${it.favorite ? "★ Favorito" : "☆ Favorito"}</button>
        <button data-action="edit">Editar</button>
      </div>
    </div>
  `;
  if (it.photoSolo) {
    const cardImg = card.querySelector("img");
    let showingSolo = true;
    cardImg.style.cursor = "pointer";
    cardImg.title = "Tocá para alternar entre la prenda sola y puesta";
    cardImg.addEventListener("click", () => {
      showingSolo = !showingSolo;
      cardImg.src = showingSolo ? it.photoSolo : it.image;
    });
  }
  card.querySelector('[data-action="fav"]').addEventListener("click", () => {
    it.favorite = !it.favorite;
    saveState();
    renderWardrobe();
  });
  card.querySelector('[data-action="edit"]').addEventListener("click", () => {
    startEditItem(it.id);
  });
  return card;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  // innerHTML no escapa las comillas, y este texto también va dentro de atributos.
  return div.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ---------- Add / edit item form ----------
function buildCheckboxFieldset(fieldsetEl, values, namePrefix) {
  const wrap = document.createElement("div");
  wrap.className = "checkbox-grid";
  values.forEach((v) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = v;
    input.name = namePrefix;
    label.appendChild(input);
    label.append(v);
    wrap.appendChild(label);
  });
  fieldsetEl.appendChild(wrap);
}

buildCheckboxFieldset(document.getElementById("item-seasons"), SEASONS, "season");
buildCheckboxFieldset(document.getElementById("item-occasions"), OCCASIONS, "occasion");

// Opciones para describir cómo se dibuja una prenda en el avatar.
const AVATAR_FIELDS = [
  { key: "sleeve", label: "Mangas", cats: ["top", "dress"], options: [["none", "Sin mangas"], ["short", "Cortas"], ["three", "3/4"], ["long", "Largas"]] },
  { key: "cov", label: "Hombros", cats: ["top", "dress"], options: [["full", "Cubiertos (breteles anchos)"], ["straps", "Tiras finas"], ["halter", "Cuello halter"], ["strapless", "Sin tiras"], ["off", "Descubiertos"]] },
  { key: "neck", label: "Escote", cats: ["top", "dress"], options: [["round", "Redondo"], ["v", "En V"], ["square", "Cuadrado"], ["heart", "Corazón"], ["high", "Cuello alto"]] },
  { key: "hem", label: "Largo", cats: ["top"], options: [["bra", "Corpiño"], ["crop", "Cropped"], ["hip", "A la cadera"], ["long", "Largo"], ["body", "Body"]] },
  { key: "len", label: "Largo", cats: ["dress"], options: [["mini", "Mini"], ["knee", "A la rodilla"], ["midi", "Midi"], ["maxi", "Largo"]] },
  { key: "len", label: "Largo", cats: ["bottom"], options: [["short", "Short"], ["bike", "Short ajustado"], ["cropped", "Tobillero"], ["full", "Pantalón largo"], ["mini", "Falda mini"], ["knee", "Falda a la rodilla"], ["midi", "Falda midi"], ["maxi", "Falda larga"]] },
  { key: "len", label: "Largo", cats: ["outerwear"], options: [["crop", "Corto"], ["hip", "A la cadera"], ["long", "Largo"]] },
  { key: "fit", label: "Ajuste del vestido", cats: ["dress"], options: [["fitted", "Ceñido"], ["aline", "Con vuelo"], ["loose", "Suelto"]] },
  { key: "rise", label: "Tiro", cats: ["bottom"], options: [["high", "Alto"], ["mid", "Medio"], ["low", "Bajo"]] },
  { key: "leg", label: "Pierna", cats: ["bottom"], options: [["wide", "Ancha"], ["straight", "Recta"], ["slim", "Ajustada"]] },
  { key: "flare", label: "Vuelo de la falda", cats: ["bottom"], options: [["straight", "Recta"], ["aline", "En A"], ["full", "Con mucho vuelo"]] },
];

(function buildAvatarFields() {
  const grid = document.getElementById("avatar-spec-grid");
  AVATAR_FIELDS.forEach((f, i) => {
    const label = document.createElement("label");
    label.dataset.fieldIndex = i;
    label.innerHTML = `${f.label}<select data-av-key="${f.key}"><option value="">Automático</option>${f.options.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select>`;
    grid.appendChild(label);
  });
})();

// Muestra solo los campos que corresponden a la categoría elegida.
function updateAvatarFields(category) {
  const fs = document.getElementById("item-avatar");
  fs.hidden = !FIGURE_CATEGORIES.includes(category);
  document.querySelectorAll("#avatar-spec-grid label").forEach((label) => {
    const f = AVATAR_FIELDS[Number(label.dataset.fieldIndex)];
    label.hidden = !f.cats.includes(category);
    if (label.hidden) label.querySelector("select").value = "";
  });
}

function readAvatarSpec(category) {
  const spec = {};
  document.querySelectorAll("#avatar-spec-grid label").forEach((label) => {
    if (label.hidden) return;
    const sel = label.querySelector("select");
    if (sel.value) spec[sel.dataset.avKey] = sel.value;
  });
  return spec;
}

document.getElementById("item-category").addEventListener("change", (e) => updateAvatarFields(e.target.value));
updateAvatarFields(document.getElementById("item-category").value);

(function buildCutsFieldset() {
  const wrap = document.createElement("div");
  wrap.className = "checkbox-grid";
  Object.keys(CUT_TAGS).forEach((key) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "cut";
    input.value = key;
    label.appendChild(input);
    label.append(CUT_TAGS[key].label);
    wrap.appendChild(label);
  });
  document.getElementById("item-cuts").appendChild(wrap);
})();

function readAndCompressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1000;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      callback(null, canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      callback(new Error('No pudimos leer esta foto en el navegador (puede ser un formato como HEIC que no se puede mostrar acá). Probá con una imagen JPG o PNG.'));
    };
    img.src = reader.result;
  };
  reader.onerror = () => callback(new Error("No pudimos leer el archivo."));
  reader.readAsDataURL(file);
}

document.getElementById("item-photo").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const preview = document.getElementById("item-photo-preview");
  const errorEl = document.getElementById("item-photo-error");
  errorEl.textContent = "";
  readAndCompressImage(file, (err, dataUrl) => {
    if (err) {
      errorEl.textContent = err.message;
      preview.hidden = true;
      preview.dataset.base64 = "";
      e.target.value = "";
      return;
    }
    preview.src = dataUrl;
    preview.hidden = false;
    preview.dataset.base64 = dataUrl;
    document.getElementById("item-photo-edit").hidden = false;
  });
});

document.getElementById("item-photo-edit").addEventListener("click", () => {
  const preview = document.getElementById("item-photo-preview");
  const errorEl = document.getElementById("item-photo-error");
  errorEl.textContent = "";
  openPhotoEditor(preview.dataset.base64 || preview.src, (url) => {
    preview.src = url;
    preview.dataset.base64 = url;
  }, (msg) => { errorEl.textContent = msg; });
});

// Foto opcional de la prenda sola (colgada o sobre una superficie).
let soloPhoto = null;

function showSoloPhoto(url) {
  soloPhoto = url || null;
  const preview = document.getElementById("item-solo-preview");
  preview.src = soloPhoto || "";
  preview.hidden = !soloPhoto;
  document.getElementById("item-solo-edit").hidden = !soloPhoto;
  document.getElementById("item-solo-remove").hidden = !soloPhoto;
}

document.getElementById("item-photo-solo").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const errorEl = document.getElementById("item-solo-error");
  errorEl.textContent = "";
  readAndCompressImage(file, (err, dataUrl) => {
    if (err) {
      errorEl.textContent = err.message;
      e.target.value = "";
      return;
    }
    showSoloPhoto(dataUrl);
  });
});

document.getElementById("item-solo-edit").addEventListener("click", () => {
  const errorEl = document.getElementById("item-solo-error");
  errorEl.textContent = "";
  openPhotoEditor(soloPhoto, (url) => showSoloPhoto(url), (msg) => { errorEl.textContent = msg; });
});

document.getElementById("item-solo-remove").addEventListener("click", () => {
  document.getElementById("item-photo-solo").value = "";
  showSoloPhoto(null);
});

function resetItemForm() {
  editingItemId = null;
  document.getElementById("item-form").reset();
  document.getElementById("item-photo-preview").hidden = true;
  document.getElementById("item-photo-preview").dataset.base64 = "";
  document.getElementById("item-photo-error").textContent = "";
  document.getElementById("item-photo").value = "";
  document.getElementById("item-photo-edit").hidden = true;
  document.getElementById("item-solo-error").textContent = "";
  document.getElementById("item-photo-solo").value = "";
  showSoloPhoto(null);
  updateAvatarFields(document.getElementById("item-category").value);
  document.getElementById("add-item-title").textContent = "Agregar prenda";
  document.getElementById("item-form-submit").textContent = "Guardar prenda";
  document.getElementById("item-form-cancel").hidden = true;
  document.getElementById("item-form-delete").hidden = true;
}

function startEditItem(itemId) {
  const it = state.items.find((i) => i.id === itemId);
  if (!it) return;
  stopBulk();
  editingItemId = itemId;
  document.getElementById("add-item-title").textContent = "Editar prenda";
  document.getElementById("item-form-submit").textContent = "Guardar cambios";
  document.getElementById("item-form-cancel").hidden = false;
  document.getElementById("item-form-delete").hidden = false;
  document.getElementById("item-name").value = it.name;
  document.getElementById("item-category").value = it.category;
  document.getElementById("item-colors").value = it.colors.join(", ");
  document.getElementById("item-favorite").checked = it.favorite;
  document.getElementById("item-fit-override").value = it.fitOverride || "";
  document.getElementById("item-brand").value = it.brand || "";
  document.getElementById("item-store").value = it.store || "";
  document.getElementById("item-price").value = it.price || "";
  document.getElementById("item-bought").value = it.bought || "";
  refreshOriginLists();
  updateAvatarFields(it.category);
  const currentSpec = avSpec(it);
  document.querySelectorAll("#avatar-spec-grid select").forEach((sel) => {
    const opt = [...sel.options].some((o) => o.value === currentSpec[sel.dataset.avKey]);
    sel.value = !sel.closest("label").hidden && opt ? currentSpec[sel.dataset.avKey] : "";
  });
  const currentCuts = getItemCuts(it) || [];
  document.querySelectorAll('input[name="cut"]').forEach((cb) => {
    cb.checked = currentCuts.includes(cb.value);
  });
  document.querySelectorAll('input[name="season"]').forEach((cb) => {
    cb.checked = it.seasons.includes(cb.value);
  });
  document.querySelectorAll('input[name="occasion"]').forEach((cb) => {
    cb.checked = it.occasions.includes(cb.value);
  });
  const preview = document.getElementById("item-photo-preview");
  preview.src = it.image;
  preview.hidden = false;
  preview.dataset.base64 = "";
  document.getElementById("item-photo-error").textContent = "";
  document.getElementById("item-photo").value = "";
  document.getElementById("item-photo-edit").hidden = false;
  document.getElementById("item-solo-error").textContent = "";
  document.getElementById("item-photo-solo").value = "";
  showSoloPhoto(it.photoSolo);
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
  document.querySelector('.tab-btn[data-tab="add-item"]').classList.add("active");
  document.getElementById("add-item").classList.add("active");
}

document.getElementById("item-form-cancel").addEventListener("click", resetItemForm);

document.getElementById("item-form-delete").addEventListener("click", () => {
  if (!editingItemId) return;
  if (!confirm("¿Eliminar esta prenda del armario?")) return;
  state.items = state.items.filter((i) => i.id !== editingItemId);
  saveState();
  resetItemForm();
  renderWardrobe();
});

document.getElementById("item-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("item-name").value.trim();
  const category = document.getElementById("item-category").value;
  const colors = document.getElementById("item-colors").value
    .split(",").map((c) => c.trim()).filter(Boolean);
  const seasons = Array.from(document.querySelectorAll('input[name="season"]:checked')).map((c) => c.value);
  const occasions = Array.from(document.querySelectorAll('input[name="occasion"]:checked')).map((c) => c.value);
  const favorite = document.getElementById("item-favorite").checked;
  const fitOverride = document.getElementById("item-fit-override").value;
  const origin = {
    brand: document.getElementById("item-brand").value.trim(),
    store: document.getElementById("item-store").value.trim(),
    price: document.getElementById("item-price").value,
    bought: document.getElementById("item-bought").value,
  };
  const cuts = Array.from(document.querySelectorAll('input[name="cut"]:checked')).map((c) => c.value);
  const preview = document.getElementById("item-photo-preview");

  if (editingItemId) {
    const it = state.items.find((i) => i.id === editingItemId);
    it.name = name;
    it.category = category;
    it.colors = colors;
    it.seasons = seasons;
    it.occasions = occasions;
    it.favorite = favorite;
    if (fitOverride) it.fitOverride = fitOverride;
    else delete it.fitOverride;
    ["brand", "store", "bought"].forEach((k) => { if (origin[k]) it[k] = origin[k]; else delete it[k]; });
    if (origin.price !== "") it.price = Number(origin.price); else delete it.price;
    if (FIGURE_CATEGORIES.includes(category)) it.cut = cuts;
    const avSpecNow = readAvatarSpec(category);
    if (Object.keys(avSpecNow).length) it.avatar = avSpecNow;
    else delete it.avatar;
    if (soloPhoto) it.photoSolo = soloPhoto;
    else delete it.photoSolo;
    if (preview.dataset.base64) it.image = preview.dataset.base64;
  } else {
    const newItem = {
      id: uid("item"),
      image: preview.dataset.base64 || "",
      name, category, colors, seasons, occasions, favorite,
      notes: "",
    };
    if (fitOverride) newItem.fitOverride = fitOverride;
    ["brand", "store", "bought"].forEach((k) => { if (origin[k]) newItem[k] = origin[k]; });
    if (origin.price !== "") newItem.price = Number(origin.price);
    if (cuts.length && FIGURE_CATEGORIES.includes(category)) newItem.cut = cuts;
    const newAvSpec = readAvatarSpec(category);
    if (Object.keys(newAvSpec).length) newItem.avatar = newAvSpec;
    if (soloPhoto) newItem.photoSolo = soloPhoto;
    state.items.push(newItem);
  }
  if (!saveState()) return;
  resetItemForm();
  renderWardrobe();
  if (bulkQueue.length) {
    loadNextBulkPhoto();
    return;
  }
  document.querySelector('.tab-btn[data-tab="wardrobe"]').click();
});

// ---------- Outfit builder ----------
const SLOT_DEFS_SEPARATES = [
  { key: "top", label: "Top", category: "top", required: true },
  { key: "bottom", label: "Bottom", category: "bottom", required: true },
  { key: "outerwear", label: "Abrigo (opcional)", category: "outerwear", required: false },
  { key: "shoes", label: "Calzado (opcional)", category: "shoes", required: false },
  { key: "bag", label: "Cartera (opcional)", category: "bag", required: false },
  { key: "jewelry", label: "Joyas (opcional)", category: "jewelry", required: false },
  { key: "accessory", label: "Accesorio (opcional)", category: "accessory", required: false },
];
const SLOT_DEFS_DRESS = [
  { key: "dress", label: "Vestido", category: "dress", required: true },
  { key: "outerwear", label: "Abrigo (opcional)", category: "outerwear", required: false },
  { key: "shoes", label: "Calzado (opcional)", category: "shoes", required: false },
  { key: "bag", label: "Cartera (opcional)", category: "bag", required: false },
  { key: "jewelry", label: "Joyas (opcional)", category: "jewelry", required: false },
  { key: "accessory", label: "Accesorio (opcional)", category: "accessory", required: false },
];

let currentOutfitSelection = {};

function currentSlotDefs() {
  const mode = document.querySelector('input[name="outfit-mode"]:checked').value;
  return mode === "dress" ? SLOT_DEFS_DRESS : SLOT_DEFS_SEPARATES;
}

document.querySelectorAll('input[name="outfit-mode"]').forEach((r) => {
  r.addEventListener("change", () => {
    currentOutfitSelection = {};
    renderOutfitBuilder();
  });
});

// Shared item-slot picker, reused by the outfit builder, the calendar day
// editor and the trip day editor.
function renderItemSlotPicker(container, slotDefs, selection, onChange) {
  container.innerHTML = "";
  slotDefs.forEach((def) => {
    const options = state.items.filter((i) => i.category === def.category);
    const box = document.createElement("div");
    box.className = "outfit-slot";
    box.innerHTML = `<h4>${def.label}</h4>`;
    const select = document.createElement("select");
    const emptyOpt = document.createElement("option");
    emptyOpt.value = "";
    emptyOpt.textContent = options.length ? "-- elegir --" : "(no hay prendas en esta categoría)";
    select.appendChild(emptyOpt);
    options.forEach((it) => {
      const opt = document.createElement("option");
      opt.value = it.id;
      opt.textContent = it.name;
      if (selection[def.key] === it.id) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => {
      selection[def.key] = select.value || null;
      onChange();
    });
    box.appendChild(select);
    container.appendChild(box);
  });
}

const ALL_CATEGORY_SLOTS = Object.keys(CATEGORIES).map((cat) => ({
  key: cat,
  label: CATEGORIES[cat],
  category: cat,
}));

function renderOutfitBuilder() {
  const slotsEl = document.getElementById("outfit-slots");
  renderItemSlotPicker(slotsEl, currentSlotDefs(), currentOutfitSelection, renderOutfitPreview);
  renderOutfitPreview();
}

let currentAvatarItems = [];
document.getElementById("outfit-avatar-open").addEventListener("click", () => {
  openLookPreview(currentAvatarItems, "Tu look en el avatar");
});

function renderOutfitPreview() {
  const preview = document.getElementById("outfit-preview");
  preview.innerHTML = "";
  const chosen = [];
  Object.values(currentOutfitSelection).filter(Boolean).forEach((id) => {
    const it = state.items.find((i) => i.id === id);
    if (it) {
      chosen.push(it);
      const img = document.createElement("img");
      img.src = itemImage(it);
      img.title = it.name;
      preview.appendChild(img);
    }
  });
  document.getElementById("outfit-fit").textContent = chosen.length && FEATURES.palette
    ? "Colorimetría: " + getOutfitFit(chosen).text
    : "";
  renderAvatarInto(document.getElementById("outfit-avatar"), chosen);
  currentAvatarItems = chosen;
  document.getElementById("outfit-avatar-open").hidden = !chosen.length;
  const fig = chosen.length && FEATURES.figure ? getOutfitFigure(chosen) : null;
  document.getElementById("outfit-figure").innerHTML = fig
    ? `<p>Figura: ${escapeHtml(fig.text)}</p>${fig.tips.length ? `<ul class="makeup-list">${fig.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>` : ""}`
    : "";
}

document.getElementById("save-outfit").addEventListener("click", () => {
  const defs = currentSlotDefs();
  const requiredMissing = defs.filter((d) => d.required && !currentOutfitSelection[d.key]);
  const msg = document.getElementById("outfit-save-msg");
  if (requiredMissing.length) {
    msg.textContent = "Elegí " + requiredMissing.map((d) => d.label).join(" y ") + " antes de guardar.";
    return;
  }
  const name = document.getElementById("outfit-name").value.trim() || "Outfit sin nombre";
  const itemIds = Object.values(currentOutfitSelection).filter(Boolean);
  const newOutfit = { id: uid("outfit"), name, itemIds, createdAt: Date.now() };
  state.outfits.push(newOutfit);
  const planDate = document.getElementById("outfit-plan-date").value;
  if (planDate) {
    state.log.push({
      id: uid("log"),
      date: planDate,
      itemIds: itemIds.slice(),
      outfitId: newOutfit.id,
      tripId: null,
      type: "planned",
      note: "",
    });
  }
  if (!saveState()) return;
  msg.textContent = planDate
    ? `Outfit "${name}" guardado y planificado para el ${planDate}. Lo vas a ver en el Calendario.`
    : `Outfit "${name}" guardado.`;
  document.getElementById("outfit-name").value = "";
  document.getElementById("outfit-plan-date").value = "";
});

// ---------- Mis outfits ----------
function renderMyOutfits() {
  const grid = document.getElementById("outfits-grid");
  grid.innerHTML = "";
  if (!state.outfits.length) {
    grid.innerHTML = '<p class="muted">Todavía no guardaste ningún outfit.</p>';
    return;
  }
  state.outfits.slice().reverse().forEach((outfit) => {
    const card = document.createElement("div");
    card.className = "card";
    const imgs = outfit.itemIds
      .map((id) => state.items.find((i) => i.id === id))
      .filter(Boolean)
      .map((it) => `<img src="${itemImage(it)}" alt="${escapeHtml(it.name)}" style="height:100px;width:33%;object-fit:cover;display:inline-block;">`)
      .join("");
    card.innerHTML = `
      <div style="display:flex;">${imgs}</div>
      <div class="card-body">
        <div class="card-name">${escapeHtml(outfit.name)}</div>
        <div class="schedule-row">
          <input type="date" data-role="schedule-date">
          <button type="button" data-action="schedule">Planificar</button>
        </div>
        <div class="card-actions">
          <button type="button" data-action="avatar">Ver en avatar</button>
          <button data-action="delete">Eliminar</button>
        </div>
      </div>
    `;
    card.querySelector('[data-action="delete"]').addEventListener("click", () => {
      state.outfits = state.outfits.filter((o) => o.id !== outfit.id);
      saveState();
      renderMyOutfits();
    });
    card.querySelector('[data-action="avatar"]').addEventListener("click", () => {
      const outfitItems = outfit.itemIds.map((id) => state.items.find((i) => i.id === id)).filter(Boolean);
      openLookPreview(outfitItems, outfit.name);
    });
    card.querySelector('[data-action="schedule"]').addEventListener("click", () => {
      const dateInput = card.querySelector('[data-role="schedule-date"]');
      const date = dateInput.value;
      if (!date) {
        alert("Elegí una fecha primero.");
        return;
      }
      state.log.push({
        id: uid("log"),
        date,
        itemIds: outfit.itemIds.slice(),
        outfitId: outfit.id,
        tripId: null,
        type: "planned",
        note: "",
      });
      if (!saveState()) return;
      alert(`"${outfit.name}" planificado para el ${date}. Lo vas a ver en el Calendario.`);
      dateInput.value = "";
    });
    grid.appendChild(card);
  });
}

// ---------- Recommend ----------
document.getElementById("rec-generate").addEventListener("click", renderRecommendations);

function itemMatches(it, occasion, season, onlyFav) {
  if (onlyFav && !it.favorite) return false;
  if (occasion && !it.occasions.includes(occasion)) return false;
  if (season && !it.seasons.includes(season) && !it.seasons.includes("todo el año")) return false;
  return true;
}

// Picks an item favoring the ones worn less often / longer ago, so
// recommendations don't always repeat the same favorites.
let preferPalette = true;
let preferFigure = true;

function pickRandom(arr, excludeIds) {
  let pool = arr.filter((it) => !excludeIds.has(it.id));
  if (!pool.length) return null;
  if (preferPalette) {
    // Primero lo que está en la paleta; si hay muy pocas opciones, se suma lo cercano.
    const inPalette = pool.filter((it) => getColorFit(it).level === "in");
    const nearPalette = pool.filter((it) => getColorFit(it).level === "near");
    if (inPalette.length >= 3) pool = inPalette;
    else if (inPalette.length + nearPalette.length > 0) pool = [...inPalette, ...nearPalette];
  }
  if (preferFigure) {
    // Prendas que te favorecen; si hay pocas, se suman las neutras y se evitan las menos favorecedoras.
    const good = pool.filter((it) => getFigureFit(it).level === "good");
    const notBad = pool.filter((it) => getFigureFit(it).level !== "bad");
    if (good.length >= 3) pool = good;
    else if (notBad.length > 0) pool = notBad;
  }
  const ranked = pool
    .map((it) => ({ it, ...getItemWearStats(it.id) }))
    .sort((a, b) => {
      if (a.count !== b.count) return a.count - b.count;
      return (a.lastDate || "0000-00-00").localeCompare(b.lastDate || "0000-00-00");
    });
  const candidateCount = Math.max(1, Math.ceil(ranked.length / 3));
  const candidates = ranked.slice(0, candidateCount);
  return candidates[Math.floor(Math.random() * candidates.length)].it;
}

function renderRecommendations() {
  const occasion = document.getElementById("rec-occasion").value;
  const season = document.getElementById("rec-season").value;
  const onlyFav = document.getElementById("rec-favorites").checked;
  preferPalette = FEATURES.palette && document.getElementById("rec-palette").checked;
  preferFigure = FEATURES.figure && document.getElementById("rec-figure").checked;

  const byCategory = {};
  Object.keys(CATEGORIES).forEach((c) => {
    byCategory[c] = state.items.filter((it) => it.category === c && itemMatches(it, occasion, season, onlyFav));
  });

  const missing = [];
  if (!byCategory.shoes.length) missing.push("calzado");
  if (!byCategory.bag.length) missing.push("carteras");
  if (!byCategory.jewelry.length) missing.push("joyas");
  const missingMsg = missing.length
    ? `Todavía no cargaste ${missing.join(", ")}. Agregalos desde "Agregar prenda" para completar los looks. `
    : "";
  document.getElementById("rec-hint").textContent =
    missingMsg + "Priorizamos las prendas que menos usaste últimamente para que no repitas siempre lo mismo.";

  const results = document.getElementById("rec-results");
  results.innerHTML = "";

  const combos = [];
  const usedDresses = new Set();
  const usedTops = new Set();
  const usedOuterwear = new Set();

  for (let i = 0; i < 3; i++) {
    const useDress = byCategory.dress.length && (i % 2 === 0 || !byCategory.top.length || !byCategory.bottom.length);
    const combo = {};
    if (useDress) {
      const dress = pickRandom(byCategory.dress, usedDresses);
      if (!dress) continue;
      usedDresses.add(dress.id);
      combo.dress = dress;
    } else {
      const top = pickRandom(byCategory.top, usedTops);
      if (!top) continue;
      usedTops.add(top.id);
      combo.top = top;
      combo.bottom = pickRandom(byCategory.bottom, new Set());
      if (!combo.bottom) continue;
    }
    if (season !== "verano") {
      combo.outerwear = pickRandom(byCategory.outerwear, usedOuterwear);
      if (combo.outerwear) usedOuterwear.add(combo.outerwear.id);
    }
    combo.shoes = pickRandom(byCategory.shoes, new Set());
    combo.bag = pickRandom(byCategory.bag, new Set());
    combo.jewelry = pickRandom(byCategory.jewelry, new Set());
    combos.push(combo);
  }

  if (!combos.length) {
    results.innerHTML = '<p class="muted">No encontré combinaciones con esos filtros. Probá cambiar la ocasión o el clima, o cargá más prendas.</p>';
    return;
  }

  combos.forEach((combo, idx) => {
    const items = Object.values(combo).filter(Boolean);
    const card = document.createElement("div");
    card.className = "rec-card";
    const imgs = items.map((it) => `<img src="${itemImage(it)}" alt="${escapeHtml(it.name)}" title="${escapeHtml(it.name)}">`).join("");
    const names = items.map((it) => it.name).join(" + ");
    const fitText = getOutfitFit(items).text;
    const figure = FEATURES.figure ? getOutfitFigure(items) : { text: "", tips: [] };
    card.innerHTML = `
      <div class="outfit-preview">${imgs}</div>
      <p class="muted">${escapeHtml(names)}</p>
      ${FEATURES.palette ? `<p class="muted">🎨 ${escapeHtml(fitText)}</p>` : ""}
      ${FEATURES.figure ? `<p class="muted">👗 ${escapeHtml(figure.text)}</p>` : ""}
      ${figure.tips.length ? `<ul class="makeup-list">${figure.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>` : ""}
      <div class="rec-card-actions">
        <input type="text" placeholder="Nombre del outfit" id="rec-name-${idx}">
        <button data-action="save">Guardar</button>
      </div>
      <button type="button" class="secondary rec-avatar-btn" data-action="avatar">Ver en avatar</button>
    `;
    card.querySelector('[data-action="avatar"]').addEventListener("click", () => openLookPreview(items, "Sugerencia de look"));
    card.querySelector('[data-action="save"]').addEventListener("click", () => {
      const name = document.getElementById(`rec-name-${idx}`).value.trim() || "Outfit sugerido";
      state.outfits.push({ id: uid("outfit"), name, itemIds: items.map((it) => it.id), createdAt: Date.now() });
      saveState();
      alert(`Outfit "${name}" guardado en Mis outfits.`);
    });
    results.appendChild(card);
  });
}

// ---------- Shared entry form (used by calendar days and trip days) ----------
function renderEntryForm(container, { date, tripId = null, forcedType = null, existing = null, onSaved }) {
  const selection = {};
  if (existing) {
    existing.itemIds.forEach((id) => {
      const it = state.items.find((i) => i.id === id);
      if (it) selection[it.category] = it.id;
    });
  }

  container.innerHTML = `
    ${forcedType ? "" : `
    <div class="outfit-mode">
      <label><input type="radio" name="entry-type" value="worn" ${!existing || existing.type === "worn" ? "checked" : ""}> Ya lo usé</label>
      <label><input type="radio" name="entry-type" value="planned" ${existing && existing.type === "planned" ? "checked" : ""}> Lo tengo planeado</label>
    </div>`}
    <label>Cargar desde un outfit guardado
      <select id="entry-outfit-select"><option value="">-- ninguno, elijo prenda por prenda --</option></select>
    </label>
    <div id="entry-slots" class="outfit-slots"></div>
    <label>Foto del look puesto (opcional, se puede subir en el momento o más adelante)
      <input type="file" id="entry-photo" accept="image/*">
    </label>
    <p id="entry-photo-error" class="error-msg"></p>
    <img id="entry-photo-preview" class="photo-preview" ${existing && existing.photo ? "" : "hidden"} src="${existing && existing.photo ? existing.photo : ""}">
    <button type="button" id="entry-photo-remove" ${existing && existing.photo ? "" : "hidden"}>Quitar foto</button>
    <label>Nota
      <input type="text" id="entry-note" value="${existing ? escapeHtml(existing.note || "") : ""}" placeholder="opcional">
    </label>
    <div class="form-actions">
      <button type="button" id="entry-save">Guardar</button>
      ${existing ? '<button type="button" id="entry-delete" class="danger">Eliminar</button>' : ""}
    </div>
  `;

  let entryPhoto = existing && existing.photo ? existing.photo : null;
  const photoInput = container.querySelector("#entry-photo");
  const photoPreview = container.querySelector("#entry-photo-preview");
  const photoError = container.querySelector("#entry-photo-error");
  const photoRemoveBtn = container.querySelector("#entry-photo-remove");

  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    photoError.textContent = "";
    readAndCompressImage(file, (err, dataUrl) => {
      if (err) {
        photoError.textContent = err.message;
        photoInput.value = "";
        return;
      }
      entryPhoto = dataUrl;
      photoPreview.src = dataUrl;
      photoPreview.hidden = false;
      photoRemoveBtn.hidden = false;
    });
  });

  photoRemoveBtn.addEventListener("click", () => {
    entryPhoto = null;
    photoInput.value = "";
    photoPreview.hidden = true;
    photoPreview.src = "";
    photoRemoveBtn.hidden = true;
  });

  const outfitSelect = container.querySelector("#entry-outfit-select");
  state.outfits.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o.id;
    opt.textContent = o.name;
    if (existing && existing.outfitId === o.id) opt.selected = true;
    outfitSelect.appendChild(opt);
  });

  const slotsContainer = container.querySelector("#entry-slots");
  function refreshSlots() {
    renderItemSlotPicker(slotsContainer, ALL_CATEGORY_SLOTS, selection, () => {});
  }
  refreshSlots();

  outfitSelect.addEventListener("change", () => {
    Object.keys(selection).forEach((k) => delete selection[k]);
    const outfit = state.outfits.find((o) => o.id === outfitSelect.value);
    if (outfit) {
      outfit.itemIds.forEach((id) => {
        const it = state.items.find((i) => i.id === id);
        if (it) selection[it.category] = it.id;
      });
    }
    refreshSlots();
  });

  container.querySelector("#entry-save").addEventListener("click", () => {
    const itemIds = Object.values(selection).filter(Boolean);
    if (!itemIds.length) {
      alert("Elegí al menos una prenda antes de guardar.");
      return;
    }
    const type = forcedType || container.querySelector('input[name="entry-type"]:checked').value;
    const note = container.querySelector("#entry-note").value.trim();
    if (existing) {
      existing.itemIds = itemIds;
      existing.type = type;
      existing.note = note;
      existing.outfitId = outfitSelect.value || null;
      existing.photo = entryPhoto;
    } else {
      state.log.push({
        id: uid("log"),
        date,
        itemIds,
        outfitId: outfitSelect.value || null,
        tripId,
        type,
        note,
        photo: entryPhoto,
      });
    }
    if (!saveState()) return;
    onSaved();
  });

  if (existing) {
    container.querySelector("#entry-delete").addEventListener("click", () => {
      state.log = state.log.filter((l) => l.id !== existing.id);
      saveState();
      onSaved();
    });
  }
}

// ---------- Calendar ----------
const today = new Date();
let calYear = today.getFullYear();
let calMonth = today.getMonth();

const MONTH_NAMES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const WEEKDAY_NAMES = ["L", "M", "M", "J", "V", "S", "D"];

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function renderCalendar() {
  document.getElementById("cal-title").textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";
  WEEKDAY_NAMES.forEach((w) => {
    const el = document.createElement("div");
    el.className = "cal-weekday";
    el.textContent = w;
    grid.appendChild(el);
  });

  const firstOfMonth = new Date(calYear, calMonth, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr = fmtDate(new Date());

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = fmtDate(new Date(calYear, calMonth, day));
    const entries = state.log.filter((l) => l.date === dateStr);
    const tripForDay = state.trips.find((t) => dateStr >= t.startDate && dateStr <= t.endDate);
    let cellClass = "cal-day" + (dateStr === todayStr ? " today" : "");
    if (tripForDay) {
      cellClass += " in-trip";
      if (dateStr === tripForDay.startDate) cellClass += " trip-start";
      if (dateStr === tripForDay.endDate) cellClass += " trip-end";
    }
    const cell = document.createElement("div");
    cell.className = cellClass;
    if (tripForDay) cell.title = `Viaje: ${tripForDay.name}`;
    const thumbs = entries
      .slice(0, 3)
      .map((e) => {
        if (e.photo) return `<img src="${e.photo}" alt="">`;
        const firstItem = state.items.find((i) => i.id === e.itemIds[0]);
        return firstItem ? `<img src="${itemImage(firstItem)}" alt="">` : "";
      })
      .join("");
    const hasPlanned = entries.some((e) => e.type === "planned");
    const hasWorn = entries.some((e) => e.type === "worn");
    cell.innerHTML = `
      <span class="cal-day-num">${day}</span>
      ${tripForDay ? `<span class="cal-day-trip">✈️ ${escapeHtml(tripForDay.name)}</span>` : ""}
      <div class="cal-day-thumbs">${thumbs}</div>
      <span class="cal-badge">${hasPlanned ? "✈️" : ""}${hasWorn ? "✓" : ""}</span>
    `;
    cell.addEventListener("click", () => openDayEditor(dateStr));
    grid.appendChild(cell);
  }
}

document.getElementById("cal-prev").addEventListener("click", () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});

document.getElementById("cal-next").addEventListener("click", () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

function openDayEditor(dateStr) {
  const box = document.getElementById("day-editor");
  box.hidden = false;
  const [y, m, d] = dateStr.split("-");
  const tripForDay = state.trips.find((t) => dateStr >= t.startDate && dateStr <= t.endDate);
  box.innerHTML = `
    <h3>${d}/${m}/${y}</h3>
    ${tripForDay ? `<p class="muted">✈️ Parte del viaje "${escapeHtml(tripForDay.name)}"</p>` : ""}
    <div id="day-entries-list"></div>
    <h4>Agregar para este día</h4>
    <div id="day-entry-form"></div>
  `;
  renderDayEntriesList(dateStr);
  renderEntryForm(document.getElementById("day-entry-form"), {
    date: dateStr,
    tripId: tripForDay ? tripForDay.id : null,
    onSaved: () => {
      renderCalendar();
      openDayEditor(dateStr);
    },
  });
}

function renderDayEntriesList(dateStr) {
  const list = document.getElementById("day-entries-list");
  const entries = state.log.filter((l) => l.date === dateStr);
  if (!entries.length) {
    list.innerHTML = '<p class="muted">Todavía no hay nada cargado para este día.</p>';
    return;
  }
  list.innerHTML = "";
  entries.forEach((entry) => {
    const itemImgs = entry.itemIds
      .map((id) => state.items.find((i) => i.id === id))
      .filter(Boolean)
      .map((it) => `<img src="${itemImage(it)}" alt="${escapeHtml(it.name)}" title="${escapeHtml(it.name)}">`)
      .join("");
    const preview = entry.photo
      ? `<img src="${entry.photo}" alt="Foto del look" class="entry-photo-full">`
      : itemImgs;
    const trip = entry.tripId ? state.trips.find((t) => t.id === entry.tripId) : null;
    const wrap = document.createElement("div");
    wrap.className = "day-entry";
    wrap.innerHTML = `
      <div class="outfit-preview">${preview}</div>
      ${entry.photo ? `<div class="outfit-preview">${itemImgs}</div>` : ""}
      <p class="muted">${entry.type === "worn" ? "✓ Usado" : "✈️ Planeado"}${trip ? ` — Viaje: ${escapeHtml(trip.name)}` : ""}${entry.note ? " — " + escapeHtml(entry.note) : ""}</p>
      <div class="card-actions">
        <button type="button" data-action="edit">${entry.photo ? "Editar / cambiar foto" : "Agregar foto / editar"}</button>
        <button type="button" data-action="del">Eliminar</button>
      </div>
    `;
    wrap.querySelector('[data-action="edit"]').addEventListener("click", () => {
      renderEntryForm(document.getElementById("day-entry-form"), {
        date: dateStr,
        existing: entry,
        onSaved: () => {
          renderCalendar();
          openDayEditor(dateStr);
        },
      });
      document.getElementById("day-entry-form").scrollIntoView({ behavior: "smooth" });
    });
    wrap.querySelector('[data-action="del"]').addEventListener("click", () => {
      state.log = state.log.filter((l) => l.id !== entry.id);
      saveState();
      renderDayEntriesList(dateStr);
      renderCalendar();
    });
    list.appendChild(wrap);
  });
}

// ---------- Trips ----------
document.getElementById("trip-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("trip-name").value.trim();
  const startDate = document.getElementById("trip-start").value;
  const endDate = document.getElementById("trip-end").value;
  const notes = document.getElementById("trip-notes").value.trim();
  if (!name || !startDate || !endDate) return;
  if (endDate < startDate) {
    alert("La fecha de vuelta no puede ser anterior a la fecha de salida.");
    return;
  }
  state.trips.push({ id: uid("trip"), name, startDate, endDate, notes, packedItemIds: [] });
  if (!saveState()) return;
  document.getElementById("trip-form").reset();
  renderTrips();
});

function renderTrips() {
  const list = document.getElementById("trips-list");
  list.innerHTML = "";
  if (!state.trips.length) {
    list.innerHTML = '<p class="muted">Todavía no armaste ningún viaje.</p>';
  }
  state.trips.slice().reverse().forEach((trip) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-body">
        <div class="card-name">${escapeHtml(trip.name)}</div>
        <p class="muted">${trip.startDate} al ${trip.endDate}</p>
        <div class="card-actions">
          <button type="button" data-action="open">Ver viaje</button>
          <button type="button" data-action="delete">Eliminar</button>
        </div>
      </div>
    `;
    card.querySelector('[data-action="open"]').addEventListener("click", () => renderTripDetail(trip.id));
    card.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (!confirm("¿Eliminar este viaje y los looks planeados para esas fechas?")) return;
      state.log = state.log.filter((l) => l.tripId !== trip.id);
      state.trips = state.trips.filter((t) => t.id !== trip.id);
      saveState();
      renderTrips();
      document.getElementById("trip-detail").hidden = true;
    });
    list.appendChild(card);
  });
}

function renderTripDetail(tripId) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return;
  const box = document.getElementById("trip-detail");
  box.hidden = false;

  const days = [];
  const cursor = new Date(trip.startDate + "T00:00:00");
  const end = new Date(trip.endDate + "T00:00:00");
  while (cursor <= end) {
    days.push(fmtDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  box.innerHTML = `
    <h3>${escapeHtml(trip.name)}</h3>
    <p class="muted">${trip.startDate} al ${trip.endDate}${trip.notes ? " — " + escapeHtml(trip.notes) : ""}</p>
    <div id="trip-days" class="outfit-slots"></div>
    <div id="trip-day-editor" hidden></div>
    <h4>Lista para armar la valija</h4>
    <div id="trip-packing-list"></div>
  `;

  const daysBox = document.getElementById("trip-days");
  days.forEach((dateStr) => {
    const entries = state.log.filter((l) => l.date === dateStr && l.tripId === tripId);
    const imgs = entries
      .flatMap((e) => e.itemIds)
      .map((id) => state.items.find((i) => i.id === id))
      .filter(Boolean)
      .map((it) => `<img src="${itemImage(it)}" alt="${escapeHtml(it.name)}" title="${escapeHtml(it.name)}">`)
      .join("");
    const dayDiv = document.createElement("div");
    dayDiv.className = "outfit-slot";
    dayDiv.innerHTML = `
      <h4>${dateStr}</h4>
      <div class="outfit-preview">${imgs || '<p class="muted">Sin look asignado</p>'}</div>
      <button type="button" data-action="assign">${entries.length ? "Editar look" : "Asignar look"}</button>
    `;
    dayDiv.querySelector('[data-action="assign"]').addEventListener("click", () => {
      const existing = state.log.find((l) => l.date === dateStr && l.tripId === tripId);
      const editorBox = document.getElementById("trip-day-editor");
      editorBox.hidden = false;
      editorBox.innerHTML = `<h4>Look para el ${dateStr}</h4><div id="trip-day-entry-form"></div>`;
      renderEntryForm(document.getElementById("trip-day-entry-form"), {
        date: dateStr,
        tripId,
        forcedType: "planned",
        existing,
        onSaved: () => renderTripDetail(tripId),
      });
    });
    daysBox.appendChild(dayDiv);
  });

  renderPackingList(tripId);
}

function renderPackingList(tripId) {
  const trip = state.trips.find((t) => t.id === tripId);
  const box = document.getElementById("trip-packing-list");
  const entries = state.log.filter((l) => l.tripId === tripId);
  const itemIds = [...new Set(entries.flatMap((e) => e.itemIds))];
  if (!itemIds.length) {
    box.innerHTML = '<p class="muted">Asignale un look a los días del viaje para generar la lista.</p>';
    return;
  }
  if (!trip.packedItemIds) trip.packedItemIds = [];
  const items = itemIds.map((id) => state.items.find((i) => i.id === id)).filter(Boolean);
  const byCat = {};
  items.forEach((it) => {
    (byCat[it.category] = byCat[it.category] || []).push(it);
  });
  box.innerHTML = Object.keys(byCat)
    .map(
      (cat) => `
    <h5>${CATEGORIES[cat]}</h5>
    <div class="checkbox-grid">
      ${byCat[cat]
        .map(
          (it) => `
        <label><input type="checkbox" data-item-id="${it.id}" ${trip.packedItemIds.includes(it.id) ? "checked" : ""}> ${escapeHtml(it.name)}</label>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("");
  box.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", () => {
      const id = cb.dataset.itemId;
      if (cb.checked) {
        if (!trip.packedItemIds.includes(id)) trip.packedItemIds.push(id);
      } else {
        trip.packedItemIds = trip.packedItemIds.filter((x) => x !== id);
      }
      saveState();
    });
  });
}

// ---------- Gallery ----------
document.getElementById("gallery-filter").addEventListener("change", renderGallery);

function renderGallery() {
  const filter = document.getElementById("gallery-filter").value;
  let entries = state.log.slice();
  if (filter) entries = entries.filter((e) => e.type === filter);
  // Most recent date first; same-day entries stay in a stable order by id.
  entries.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";
  if (!entries.length) {
    grid.innerHTML = '<p class="muted">Todavía no hay looks para mostrar. Marcá algo como usado o planeado desde el Calendario.</p>';
    return;
  }

  entries.forEach((entry) => {
    let mediaHtml;
    if (entry.photo) {
      mediaHtml = `<img src="${entry.photo}" alt="Look del ${entry.date}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
    } else {
      const imgs = entry.itemIds
        .map((id) => state.items.find((i) => i.id === id))
        .filter(Boolean)
        .slice(0, 4);
      if (!imgs.length) return;
      mediaHtml = `
        <div class="gallery-collage collage-${imgs.length}">
          ${imgs.map((it) => `<img src="${itemImage(it)}" alt="${escapeHtml(it.name)}">`).join("")}
        </div>`;
    }
    const tile = document.createElement("div");
    tile.className = "gallery-tile";
    tile.innerHTML = `
      ${mediaHtml}
      <span class="gallery-badge">${entry.type === "worn" ? "✓" : "✈️"}</span>
      <span class="gallery-date">${entry.date}</span>
    `;
    tile.addEventListener("click", () => {
      const [y, m] = entry.date.split("-").map(Number);
      calYear = y;
      calMonth = m - 1;
      document.querySelector('.tab-btn[data-tab="calendar"]').click();
      openDayEditor(entry.date);
      document.getElementById("day-editor").scrollIntoView({ behavior: "smooth" });
    });
    grid.appendChild(tile);
  });
}

// ---------- Mi colorimetría ----------
function swatchHtml(hex, label) {
  return `<span class="swatch" style="background:${hex}" title="${escapeHtml(label ? label + " · " : "")}${hex}"></span>`;
}

function renderColorimetry() {
  const root = document.getElementById("colorimetry");

  const counts = { in: 0, near: 0, out: 0, unknown: 0 };
  state.items.forEach((it) => { counts[getColorFit(it).level]++; });
  const total = state.items.length || 1;
  const pct = (n) => Math.round((n / total) * 100);

  const byRole = ["FN", "CA", "M"].map((role) => {
    const info = PALETTE_ROLE_LABELS[role];
    const swatches = PALETTE.filter((p) => p.role === role).map((p) => swatchHtml(p.hex, info.title)).join("");
    return `
      <div class="palette-group">
        <h4>${info.title} <span class="muted">(${role})</span></h4>
        <p class="muted">${info.desc}</p>
        <div class="swatch-row">${swatches}</div>
      </div>`;
  }).join("");

  const best = (list) => list.map((c) => `
    <div class="best-color">${swatchHtml(c.hex, c.name)}<span>${escapeHtml(c.name)}</span></div>`).join("");

  root.innerHTML = `
    <h2>Mi colorimetría: ${SEASON.name}</h2>
    <p class="muted">${SEASON.tagline}. Guía de SAIGU Cosmetics (septiembre 2026).</p>
    <div class="tag-row trait-row">
      ${SEASON.traits.map((t) => `<span class="tag">${t.label}: <b>${t.value}</b></span>`).join("")}
    </div>

    <h3>Cómo está tu armario con tu paleta</h3>
    <div class="fit-bar">
      <span class="fit-seg fit-in" style="width:${pct(counts.in)}%"></span>
      <span class="fit-seg fit-near" style="width:${pct(counts.near)}%"></span>
      <span class="fit-seg fit-out" style="width:${pct(counts.out)}%"></span>
      <span class="fit-seg fit-unknown" style="width:${pct(counts.unknown)}%"></span>
    </div>
    <div class="fit-legend">
      <button type="button" class="fit-chip" data-fit="in">✓ En tu paleta: ${counts.in} (${pct(counts.in)}%)</button>
      <button type="button" class="fit-chip" data-fit="near">≈ Cerca: ${counts.near} (${pct(counts.near)}%)</button>
      <button type="button" class="fit-chip" data-fit="out">✗ Fuera: ${counts.out} (${pct(counts.out)}%)</button>
      ${counts.unknown ? `<span class="muted">· Sin color de referencia: ${counts.unknown}</span>` : ""}
    </div>
    <p class="muted">Tocá una categoría para ver esas prendas en el Armario. La comparación usa el color principal de cada prenda; si alguna quedó mal, corregila con "Editar" → "Color según mi paleta".</p>

    <h3>Tu paleta</h3>
    ${byRole}

    <h3>Tus mejores colores</h3>
    <h4>Armonía / mayor equilibrio</h4>
    <div class="best-row">${best(BEST_HARMONY)}</div>
    <h4>Contraste / mayor impacto</h4>
    <div class="best-row">${best(BEST_IMPACT)}</div>
    <p class="muted">Las prendas con estos colores aparecen con "★ Color estrella" en el Armario.</p>

    <h3>Maquillaje según la intención</h3>
    <ul class="makeup-list">
      ${MAKEUP_TIPS.map((m) => `<li><b>${m.intent}:</b> ${m.tip}</li>`).join("")}
    </ul>
    <p class="muted">Para joyas, los metales de tu paleta son los dorados, cobres y bronces envejecidos.</p>
  `;

  root.querySelectorAll(".fit-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.getElementById("filter-palette").value = chip.dataset.fit;
      renderWardrobe();
      document.querySelector('.tab-btn[data-tab="wardrobe"]').click();
    });
  });
}

// ---------- Carga de varias fotos ----------
let bulkQueue = [];
let bulkTotal = 0;

function updateBulkStatus(msg) {
  const active = bulkQueue.length > 0 || msg;
  document.getElementById("bulk-status").textContent = msg || "";
  document.getElementById("bulk-skip").hidden = !bulkQueue.length && !msg;
  document.getElementById("bulk-stop").hidden = !bulkQueue.length && !msg;
  if (!active) document.getElementById("bulk-status").textContent = "";
}

function stopBulk() {
  bulkQueue = [];
  bulkTotal = 0;
  document.getElementById("item-photos-bulk").value = "";
  updateBulkStatus("");
}

function loadNextBulkPhoto() {
  if (!bulkQueue.length) {
    updateBulkStatus("");
    document.getElementById("item-photos-bulk").value = "";
    return;
  }
  const url = bulkQueue.shift();
  const done = bulkTotal - bulkQueue.length;
  const preview = document.getElementById("item-photo-preview");
  preview.src = url;
  preview.hidden = false;
  preview.dataset.base64 = url;
  document.getElementById("item-photo-edit").hidden = false;
  updateBulkStatus(`Foto ${done} de ${bulkTotal}. Completá los datos y guardá para pasar a la siguiente.`);
  document.getElementById("item-name").focus();
}

document.getElementById("item-photos-bulk").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  updateBulkStatus(`Preparando ${files.length} fotos…`);
  const urls = [];
  let failed = 0;
  for (const file of files) {
    await new Promise((resolve) => {
      readAndCompressImage(file, (err, dataUrl) => {
        if (err) failed++;
        else urls.push(dataUrl);
        resolve();
      });
    });
  }
  bulkQueue = urls;
  bulkTotal = urls.length;
  resetItemForm();
  if (!urls.length) {
    updateBulkStatus("No se pudo leer ninguna de las fotos. Probá con JPG o PNG.");
    return;
  }
  loadNextBulkPhoto();
  if (failed) {
    document.getElementById("bulk-status").textContent += ` (${failed} foto${failed === 1 ? "" : "s"} no se pudieron leer y se omitieron.)`;
  }
});

document.getElementById("bulk-skip").addEventListener("click", () => {
  resetItemForm();
  loadNextBulkPhoto();
});

document.getElementById("bulk-stop").addEventListener("click", () => {
  stopBulk();
  resetItemForm();
});

// ---------- Copia de seguridad y empezar de cero ----------
function refreshEverything() {
  renderWardrobe();
  renderMyOutfits();
  renderCalendar();
  renderTrips();
}

document.getElementById("backup-download").addEventListener("click", () => {
  downloadBackup();
  document.getElementById("backup-msg").textContent = "Copia descargada. Guardala en un lugar seguro.";
});

function downloadBackup() {
  const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `closet-de-ale-copia-${fmtDate(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

document.getElementById("backup-restore-btn").addEventListener("click", () => document.getElementById("backup-restore").click());

document.getElementById("backup-restore").addEventListener("change", (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const msg = document.getElementById("backup-msg");
  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch (err) {
      msg.textContent = "Ese archivo no es una copia válida.";
      return;
    }
    if (!parsed || !Array.isArray(parsed.items)) {
      msg.textContent = "Ese archivo no parece una copia de El Closet de Ale.";
      return;
    }
    if (!confirm(`Esto reemplaza todo lo que tenés ahora por la copia (${parsed.items.length} prendas). ¿Seguimos?`)) return;
    parsed.outfits = parsed.outfits || [];
    parsed.log = parsed.log || [];
    parsed.trips = parsed.trips || [];
    state = parsed;
    if (!saveState()) return;
    refreshEverything();
    msg.textContent = `Copia restaurada: ${state.items.length} prendas, ${state.outfits.length} outfits.`;
  };
  reader.readAsText(file);
});

document.getElementById("reset-wardrobe").addEventListener("click", () => {
  const overlay = document.createElement("div");
  overlay.className = "editor-overlay";
  overlay.innerHTML = `
    <div class="editor-box" role="dialog" aria-label="Borrar todas las prendas" style="max-width:480px">
      <h3>Borrar todas las prendas</h3>
      <p>Se van a borrar las <b>${state.items.length} prendas</b> del armario. Esto no se puede deshacer, salvo que tengas una copia de seguridad.</p>
      <label class="fav-toggle"><input type="checkbox" id="reset-backup" checked> Descargar una copia de seguridad antes de borrar</label>
      <label class="fav-toggle"><input type="checkbox" id="reset-outfits" checked> Borrar también los ${state.outfits.length} outfits guardados (quedarían sin prendas)</label>
      <label class="fav-toggle"><input type="checkbox" id="reset-calendar"> Borrar también el calendario (${state.log.length} registros) y los viajes (${state.trips.length})</label>
      <p class="muted">Si dejás el calendario, se conservan las fotos reales de tus looks, pero sin las prendas asociadas. El catálogo inicial no vuelve a cargarse.</p>
      <div class="form-actions">
        <button type="button" class="danger" data-act="confirm">Borrar todo lo marcado</button>
        <button type="button" class="secondary" data-act="cancel">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  if (CLOUD_ENABLED) overlay.querySelector("#reset-backup").closest("label").remove();
  overlay.addEventListener("click", (e) => {
    const act = e.target.dataset && e.target.dataset.act;
    if (e.target === overlay || act === "cancel") overlay.remove();
    if (act !== "confirm") return;
    const backupBox = overlay.querySelector("#reset-backup");
    if (backupBox && backupBox.checked) downloadBackup();
    const delOutfits = overlay.querySelector("#reset-outfits").checked;
    const delCalendar = overlay.querySelector("#reset-calendar").checked;
    state.items = [];
    if (delOutfits) state.outfits = [];
    if (delCalendar) {
      state.log = [];
      state.trips = [];
    }
    state.seenSeedIds = SEED_EXTRA.map((i) => i.id);
    stopBulk();
    overlay.remove();
    if (!saveState()) return;
    refreshEverything();
    document.getElementById("backup-msg").textContent = "Armario vacío. Ya podés subir tus prendas desde \"Agregar prenda\" (podés elegir varias fotos a la vez).";
  });
});

// ---------- Mi figura ----------
function renderFigure() {
  const root = document.getElementById("figure");
  const m = Object.fromEntries(BODY.measures.map((x) => [x.key, x.cm]));
  const waistHip = (m.waist / m.hipLow).toFixed(2);
  const diffShoulders = m.shoulders - m.hipLow;
  const diffBust = m.bust - m.hipLow;

  const clothing = state.items.filter((it) => FIGURE_CATEGORIES.includes(it.category));
  const counts = { good: 0, neutral: 0, bad: 0, unknown: 0 };
  clothing.forEach((it) => { counts[getFigureFit(it).level]++; });
  const total = clothing.length || 1;
  const pct = (n) => Math.round((n / total) * 100);
  const both = clothing.filter((it) => {
    const palette = getColorFit(it).level;
    return getFigureFit(it).level === "good" && (palette === "in" || palette === "near");
  }).length;

  root.innerHTML = `
    <h2>Mi figura: ${BODY.type}</h2>
    <p class="muted">${BODY.type} ${BODY.detail}. Clasificación orientativa para recomendaciones de ropa, con criterios generales de estilismo: no son reglas, usalas como guía.</p>

    <h3>Tus medidas</h3>
    <table class="measures-table">
      ${BODY.measures.map((x) => `<tr><td>${x.label}</td><td><b>${x.cm} cm</b></td></tr>`).join("")}
    </table>
    <ul class="makeup-list">
      <li>Cintura / cadera baja: <b>${waistHip}</b>, una cintura muy definida.</li>
      <li>Hombros vs cadera baja: <b>${diffShoulders > 0 ? "+" : ""}${diffShoulders} cm</b>, equilibrio entre hombros y caderas.</li>
      <li>Busto vs cadera baja: <b>${diffBust > 0 ? "+" : ""}${diffBust} cm</b>, caderas algo más anchas que el busto.</li>
    </ul>

    <h3>Qué te favorece</h3>
    <ul class="makeup-list">${FIGURE_FAVORS.map((t) => `<li>${t}</li>`).join("")}</ul>
    <h3>Qué conviene equilibrar</h3>
    <ul class="makeup-list">${FIGURE_BALANCE.map((t) => `<li>${t}</li>`).join("")}</ul>

    <h3>Cómo está tu armario con tu figura</h3>
    <div class="fit-bar">
      <span class="fit-seg fit-in" style="width:${pct(counts.good)}%"></span>
      <span class="fit-seg fit-near" style="width:${pct(counts.neutral)}%"></span>
      <span class="fit-seg fit-out" style="width:${pct(counts.bad)}%"></span>
      <span class="fit-seg fit-unknown" style="width:${pct(counts.unknown)}%"></span>
    </div>
    <div class="fit-legend">
      <button type="button" class="fit-chip" data-figure="good">♡ Te favorece: ${counts.good} (${pct(counts.good)}%)</button>
      <button type="button" class="fit-chip" data-figure="neutral">· Neutro: ${counts.neutral} (${pct(counts.neutral)}%)</button>
      <button type="button" class="fit-chip" data-figure="bad">△ Menos favorecedor: ${counts.bad} (${pct(counts.bad)}%)</button>
      ${counts.unknown ? `<span class="muted">· Sin datos de corte: ${counts.unknown}</span>` : ""}
    </div>
    <p class="muted">Tocá una categoría para ver esas prendas en el Armario. El corte de cada prenda se puede corregir en "Editar" → "Corte y silueta".</p>

    <h3>Colorimetría + figura</h3>
    <p><b>${both}</b> prendas cumplen las dos: te favorecen y están en tu paleta o cerca.</p>
    <button type="button" class="fit-chip" id="figure-both">Ver esas prendas en el Armario</button>
  `;

  root.querySelectorAll("[data-figure]").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.getElementById("filter-figure").value = chip.dataset.figure;
      document.getElementById("filter-palette").value = "";
      renderWardrobe();
      document.querySelector('.tab-btn[data-tab="wardrobe"]').click();
    });
  });
  root.querySelector("#figure-both").addEventListener("click", () => {
    document.getElementById("filter-figure").value = "good";
    document.getElementById("filter-palette").value = "mine";
    renderWardrobe();
    document.querySelector('.tab-btn[data-tab="wardrobe"]').click();
  });
}

// ---------- Init ----------
applyProfile(
  state.profile && (state.profile.season || state.profile.body)
    ? state.profile
    : !CLOUD_ENABLED && typeof LOCAL_PROFILE !== "undefined" ? LOCAL_PROFILE : state.profile
);
applyFeatureVisibility();
refreshOriginLists();
renderWardrobe();
if (CLOUD_ENABLED) {
  // En la web las copias de seguridad en archivo no aplican: los datos viven en la nube.
  ["backup-download", "backup-restore-btn"].forEach((id) => { document.getElementById(id).hidden = true; });
} else {
  document.getElementById("cloud-upload-btn").hidden = false;
}
