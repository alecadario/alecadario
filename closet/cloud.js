// Modo nube: cuentas con código de acceso y sincronización con Airtable (vía /api).
// En tu computadora (modo local) solo se usa la herramienta "Subir mi armario a la nube".

const CLOUD_TOKEN_KEY = "closetApp:token";
const cloud = {
  token: null,
  user: null,
  synced: null, // lo último que la nube ya tiene: { items: Map(id -> hash), ... }
  photos: new Set(), // "col|id|key" de las fotos que la nube ya tiene
  profileHash: "",
  timer: null,
  pushing: false,
  again: false,
};

const CLOUD_COLLECTIONS = ["items", "outfits", "log", "trips"];
const CLOUD_PHOTO_KEYS = { items: ["image", "photoSolo"], outfits: [], log: ["photo"], trips: [] };
const CLOUD_LOCAL_ONLY = { items: ["originalImage", "originsApplied"], outfits: [], log: [], trips: [] };

// ---------- utilidades ----------
function stableStringify(v) {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(v[k])}`).join(",")}}`;
  return JSON.stringify(v);
}

// El registro tal como viaja a Airtable: sin fotos ni datos que solo tienen sentido en tu computadora.
function cloudStrip(col, obj) {
  const o = { ...obj };
  CLOUD_PHOTO_KEYS[col].forEach((k) => delete o[k]);
  CLOUD_LOCAL_ONLY[col].forEach((k) => delete o[k]);
  return o;
}

const isDataUrl = (v) => typeof v === "string" && v.startsWith("data:");
const photoId = (col, id, key) => `${col}|${id}|${key}`;

async function cloudFetch(base, token, path, opts = {}) {
  const res = await fetch(base + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}), ...(opts.headers || {}) },
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) { /* sin cuerpo */ }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const api = (path, opts) => cloudFetch(CLOUD_API, cloud.token, path, opts).catch((e) => {
  if (e.status === 401 && cloud.token) cloudLogout("Tu sesión venció. Ingresá de nuevo.");
  throw e;
});

function setCloudStatus(kind, extra) {
  const el = document.getElementById("cloud-status");
  if (!el) return;
  const text = { pending: "Cambios sin guardar…", saving: "Guardando…", saved: "☁ Guardado", error: "⚠ Sin conexión, reintentando" }[kind] || "";
  el.textContent = text;
  el.title = extra || "";
  el.dataset.kind = kind;
}

// ---------- pantalla de ingreso ----------
function showAuthScreen(message) {
  let screen = document.getElementById("auth-screen");
  if (!screen) {
    screen = document.createElement("div");
    screen.id = "auth-screen";
    screen.className = "auth-screen";
    screen.innerHTML = `
      <div class="auth-card">
        <h2>El Closet de Ale 😊</h2>
        <p class="muted">Tu armario en la nube, privado y accesible desde cualquier dispositivo.</p>
        <div class="fit-legend">
          <button type="button" class="fit-chip active" data-mode="login">Ingresar</button>
          <button type="button" class="fit-chip" data-mode="register">Crear cuenta</button>
        </div>
        <form id="auth-form" class="item-form">
          <label data-only="register">Tu nombre <input type="text" id="auth-name" autocomplete="name" maxlength="60"></label>
          <label>Email <input type="email" id="auth-email" autocomplete="email" required></label>
          <label>Contraseña <input type="password" id="auth-pass" autocomplete="current-password" minlength="8" required></label>
          <label data-only="register">Código de acceso <input type="text" id="auth-code" autocomplete="off" autocapitalize="off"></label>
          <p class="error-msg" id="auth-error"></p>
          <button type="submit" id="auth-submit">Ingresar</button>
        </form>
        <p class="muted auth-note">Para crear una cuenta necesitás un código de acceso que te da quien administra esta web. La contraseña se guarda cifrada.</p>
      </div>`;
    document.body.appendChild(screen);

    let mode = "login";
    const setMode = (m) => {
      mode = m;
      screen.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("active", b.dataset.mode === m));
      screen.querySelectorAll("[data-only]").forEach((l) => { l.hidden = l.dataset.only !== m; });
      screen.querySelector("#auth-submit").textContent = m === "login" ? "Ingresar" : "Crear mi cuenta";
      screen.querySelector("#auth-pass").autocomplete = m === "login" ? "current-password" : "new-password";
      screen.querySelector("#auth-error").textContent = "";
    };
    screen.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
    setMode("login");

    screen.querySelector("#auth-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = screen.querySelector("#auth-error");
      const submit = screen.querySelector("#auth-submit");
      err.textContent = "";
      submit.disabled = true;
      try {
        const body = { email: screen.querySelector("#auth-email").value.trim(), password: screen.querySelector("#auth-pass").value };
        if (mode === "register") {
          body.name = screen.querySelector("#auth-name").value.trim();
          body.code = screen.querySelector("#auth-code").value.trim();
        }
        const data = await cloudFetch(CLOUD_API, null, mode === "login" ? "/auth/login" : "/auth/register", { method: "POST", body: JSON.stringify(body) });
        cloud.token = data.token;
        cloud.user = data.user;
        localStorage.setItem(CLOUD_TOKEN_KEY, data.token);
        screen.querySelector("#auth-pass").value = "";
        await cloudBoot();
      } catch (ex) {
        err.textContent = ex.message;
      } finally {
        submit.disabled = false;
      }
    });
  }
  screen.hidden = false;
  if (message) screen.querySelector("#auth-error").textContent = message;
}

function hideAuthScreen() {
  const screen = document.getElementById("auth-screen");
  if (screen) screen.hidden = true;
}

// ---------- ciclo de vida ----------
async function cloudInit() {
  document.getElementById("cloud-logout").addEventListener("click", () => cloudLogout());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && cloud.token && Date.now() - (cloud.lastLoad || 0) > 30 * 60 * 1000) cloudRefreshUrls();
  });
  setInterval(() => { if (cloud.token && document.visibilityState === "visible") cloudRefreshUrls(); }, 45 * 60 * 1000);
  window.addEventListener("online", () => { if (cloud.token) cloudQueuePush(); });
  window.addEventListener("beforeunload", (e) => {
    if (cloud.timer || cloud.pushing) { e.preventDefault(); e.returnValue = ""; }
  });

  const saved = localStorage.getItem(CLOUD_TOKEN_KEY);
  if (!saved) return showAuthScreen();
  cloud.token = saved;
  try {
    const me = await api("/auth/me");
    cloud.user = me.user;
    await cloudBoot();
  } catch (e) {
    if (!cloud.token) return; // cloudLogout ya mostró la pantalla
    showAuthScreen(e.status === 401 ? "" : "No se pudo conectar. Revisá tu conexión e intentá de nuevo.");
  }
}

function snapshotOf(st) {
  const snap = {};
  CLOUD_COLLECTIONS.forEach((col) => {
    snap[col] = new Map((st[col] || []).map((o) => [o.id, stableStringify(cloudStrip(col, o))]));
  });
  return snap;
}

function photosOf(st) {
  const set = new Set();
  CLOUD_COLLECTIONS.forEach((col) => {
    (st[col] || []).forEach((o) => CLOUD_PHOTO_KEYS[col].forEach((k) => { if (o[k] && !isDataUrl(o[k])) set.add(photoId(col, o.id, k)); }));
  });
  return set;
}

async function cloudBoot() {
  const data = await api("/state");
  state = { items: data.items || [], outfits: data.outfits || [], log: data.log || [], trips: data.trips || [], profile: data.profile || {} };
  cloud.synced = snapshotOf(state);
  cloud.photos = photosOf(state);
  cloud.profileHash = stableStringify(state.profile);
  cloud.lastLoad = Date.now();
  applyProfile(state.profile);
  applyFeatureVisibility();
  hideAuthScreen();
  document.getElementById("cloud-box").hidden = false;
  document.getElementById("cloud-user").textContent = cloud.user ? cloud.user.name || cloud.user.email : "";
  setCloudStatus("saved");
  refreshOriginLists();
  refreshEverything();
}

function cloudLogout(message) {
  clearTimeout(cloud.timer);
  cloud.timer = null;
  cloud.token = null;
  cloud.user = null;
  localStorage.removeItem(CLOUD_TOKEN_KEY);
  state = emptyState();
  applyProfile({});
  applyFeatureVisibility();
  document.getElementById("cloud-box").hidden = true;
  refreshEverything();
  showAuthScreen(message);
}

// ---------- guardar en la nube ----------
function cloudQueuePush() {
  if (!cloud.token || !cloud.synced) return;
  clearTimeout(cloud.timer);
  setCloudStatus("pending");
  cloud.timer = setTimeout(cloudPush, 1200);
}

function computeDiff() {
  const upserts = {};
  const deletes = {};
  let any = false;
  CLOUD_COLLECTIONS.forEach((col) => {
    const current = new Map((state[col] || []).map((o) => [o.id, o]));
    upserts[col] = [];
    deletes[col] = [];
    current.forEach((o, id) => {
      const stripped = cloudStrip(col, o);
      if (cloud.synced[col].get(id) !== stableStringify(stripped)) upserts[col].push(stripped);
    });
    cloud.synced[col].forEach((_, id) => { if (!current.has(id)) deletes[col].push(id); });
    if (upserts[col].length || deletes[col].length) any = true;
  });
  const profileHash = stableStringify(state.profile || {});
  return { upserts, deletes, any, profile: profileHash !== cloud.profileHash ? state.profile || {} : null, profileHash };
}

async function cloudPush() {
  cloud.timer = null;
  if (!cloud.token) return;
  if (cloud.pushing) {
    cloud.again = true;
    return;
  }
  cloud.pushing = true;
  setCloudStatus("saving");
  try {
    const diff = computeDiff();
    // En tandas de 100 registros por colección, para no pasarse del tamaño de cada envío.
    for (const col of CLOUD_COLLECTIONS) {
      const ups = diff.upserts[col];
      const dels = diff.deletes[col];
      for (let i = 0; i < Math.max(ups.length, dels.length, 1); i += 100) {
        const u = ups.slice(i, i + 100);
        const d = dels.slice(i, i + 100);
        if (!u.length && !d.length) continue;
        await api("/sync", { method: "POST", body: JSON.stringify({ upserts: { [col]: u }, deletes: { [col]: d } }) });
        u.forEach((o) => cloud.synced[col].set(o.id, stableStringify(o)));
        d.forEach((id) => cloud.synced[col].delete(id));
      }
    }
    if (diff.profile) {
      await api("/sync", { method: "POST", body: JSON.stringify({ profile: diff.profile }) });
      cloud.profileHash = diff.profileHash;
    }
    await cloudPushPhotos();
    setCloudStatus("saved");
  } catch (e) {
    if (cloud.token) {
      setCloudStatus("error", e.message);
      clearTimeout(cloud.retry);
      cloud.retry = setTimeout(cloudQueuePush, 8000);
    }
  } finally {
    cloud.pushing = false;
    if (cloud.again) {
      cloud.again = false;
      cloudQueuePush();
    }
  }
}

// Sube las fotos nuevas (data URL) y quita las que ya no están.
async function cloudPushPhotos() {
  for (const col of CLOUD_COLLECTIONS) {
    for (const key of CLOUD_PHOTO_KEYS[col]) {
      for (const o of state[col] || []) {
        const pid = photoId(col, o.id, key);
        const value = o[key];
        if (isDataUrl(value)) {
          const r = await api("/photo", { method: "POST", body: JSON.stringify({ collection: col, key, id: o.id, dataUrl: value }) });
          if (r.url && o[key] === value) o[key] = r.url; // ahora la foto vive en la nube
          cloud.photos.add(pid);
        } else if (!value && cloud.photos.has(pid) && cloud.synced[col].has(o.id)) {
          await api("/photo", { method: "POST", body: JSON.stringify({ collection: col, key, id: o.id, dataUrl: null }) });
          cloud.photos.delete(pid);
        }
      }
    }
  }
}

// Los enlaces de las fotos de Airtable vencen a las pocas horas: se piden de nuevo sin tocar lo demás.
async function cloudRefreshUrls() {
  if (!cloud.token || cloud.pushing || cloud.timer) return;
  try {
    const data = await api("/state");
    CLOUD_COLLECTIONS.forEach((col) => {
      const fresh = new Map((data[col] || []).map((o) => [o.id, o]));
      (state[col] || []).forEach((o) => {
        const f = fresh.get(o.id);
        if (!f) return;
        CLOUD_PHOTO_KEYS[col].forEach((k) => { if (f[k] && o[k] && !isDataUrl(o[k])) o[k] = f[k]; });
      });
    });
    cloud.lastLoad = Date.now();
    const active = document.querySelector(".tab-panel.active");
    if (active && active.id === "wardrobe") renderWardrobe();
  } catch (e) { /* se reintenta más tarde */ }
}

// ---------- subir mi armario local a la nube ----------
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("No se pudo leer una foto."));
    r.readAsDataURL(blob);
  });
}

async function photoToDataUrl(src) {
  if (isDataUrl(src)) return src;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`No se encontró la foto ${src}`);
  return blobToDataUrl(await res.blob());
}

function openMigration() {
  const overlay = document.createElement("div");
  overlay.className = "editor-overlay";
  overlay.innerHTML = `
    <div class="editor-box" style="max-width:520px">
      <h3>Subir mi armario a la nube</h3>
      <p class="muted">Copia tus ${state.items.length} prendas, outfits, calendario, viajes, tu perfil (medidas y colorimetría) y todas las fotos a tu cuenta. Lo que ya tengas en la nube con los mismos datos se actualiza.</p>
      <div class="item-form">
        <label>Dirección de la web <input type="text" id="mig-url" value="https://alecadario.com/closet" autocomplete="off"></label>
        <label>Email <input type="email" id="mig-email" autocomplete="email"></label>
        <label>Contraseña <input type="password" id="mig-pass" autocomplete="current-password"></label>
        <label>Código de acceso (solo si todavía no tenés cuenta) <input type="text" id="mig-code" autocomplete="off"></label>
        <label>Tu nombre (solo para crear la cuenta) <input type="text" id="mig-name" autocomplete="name"></label>
      </div>
      <p class="muted" id="mig-log"></p>
      <div class="form-actions">
        <button type="button" data-act="go">Subir</button>
        <button type="button" class="secondary" data-act="close">Cerrar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const log = (t) => { overlay.querySelector("#mig-log").textContent = t; };
  overlay.addEventListener("click", async (e) => {
    const act = e.target.dataset && e.target.dataset.act;
    if (e.target === overlay || act === "close") return overlay.remove();
    if (act !== "go") return;
    const goBtn = e.target;
    goBtn.disabled = true;
    try {
      const base = overlay.querySelector("#mig-url").value.trim().replace(/\/+$/, "") + "/api";
      const email = overlay.querySelector("#mig-email").value.trim();
      const password = overlay.querySelector("#mig-pass").value;
      const code = overlay.querySelector("#mig-code").value.trim();
      log("Ingresando…");
      const auth = code
        ? await cloudFetch(base, null, "/auth/register", { method: "POST", body: JSON.stringify({ email, password, code, name: overlay.querySelector("#mig-name").value.trim() || email }) })
        : await cloudFetch(base, null, "/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      const token = auth.token;
      const call = (path, body) => cloudFetch(base, token, path, { method: "POST", body: JSON.stringify(body) });

      log("Subiendo datos…");
      const profile = typeof LOCAL_PROFILE !== "undefined" ? LOCAL_PROFILE : state.profile || {};
      await call("/sync", { profile });
      for (const col of CLOUD_COLLECTIONS) {
        const list = (state[col] || []).map((o) => cloudStrip(col, o));
        for (let i = 0; i < list.length; i += 50) await call("/sync", { upserts: { [col]: list.slice(i, i + 50) } });
      }

      const jobs = [];
      CLOUD_COLLECTIONS.forEach((col) => (state[col] || []).forEach((o) => CLOUD_PHOTO_KEYS[col].forEach((key) => { if (o[key]) jobs.push({ col, key, id: o.id, src: o[key] }); })));
      let failed = 0;
      for (let i = 0; i < jobs.length; i++) {
        log(`Subiendo fotos… ${i + 1} de ${jobs.length}`);
        try {
          await call("/photo", { collection: jobs[i].col, key: jobs[i].key, id: jobs[i].id, dataUrl: await photoToDataUrl(jobs[i].src) });
        } catch (ex) {
          failed++;
          console.warn("Foto no subida:", jobs[i], ex.message);
        }
      }
      log(`Listo: ${state.items.length} prendas subidas${failed ? `. ${failed} foto${failed === 1 ? "" : "s"} no se pudieron subir` : ", con todas sus fotos"}. Ya podés entrar a la web con tu cuenta.`);
    } catch (ex) {
      log("No se pudo completar: " + ex.message);
    } finally {
      goBtn.disabled = false;
    }
  });
}

document.getElementById("cloud-upload-btn").addEventListener("click", openMigration);

if (CLOUD_ENABLED) cloudInit();
