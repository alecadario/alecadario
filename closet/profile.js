// Perfil de cada persona: qué funciones personalizadas tiene activas y con qué datos.
// En modo local se activan todas (tu perfil está en local-profile.js, que no se publica).
// En la nube cada cuenta guarda su perfil en Airtable y arranca sin funciones personalizadas.

const FEATURES = {
  palette: typeof CLOUD_ENABLED === "undefined" ? true : !CLOUD_ENABLED,
  figure: typeof CLOUD_ENABLED === "undefined" ? true : !CLOUD_ENABLED,
};

const MEASURE_KEYS = ["shoulders", "bust", "waist", "hipHigh", "hipLow"];

// Las recomendaciones de figura están pensadas para reloj de arena: cintura bien definida y
// busto y cadera parecidos. Para otras siluetas todavía no hay reglas.
function isHourglass(m) {
  if (!m || MEASURE_KEYS.some((k) => !(m[k] > 0))) return false;
  const widest = Math.max(m.bust, m.hipLow);
  return m.waist / widest <= 0.75 && Math.abs(m.bust - m.hipLow) / m.hipLow <= 0.12;
}

function describeBody(m) {
  if (m.hipLow > m.bust * 1.05) return "con leve predominio de caderas";
  if (m.bust > m.hipLow * 1.05) return "con leve predominio de busto";
  return "con busto y caderas equilibrados";
}

function applyProfile(p) {
  p = p || {};
  FEATURES.palette = p.season === "otono-intenso";
  const measures = p.body && p.body.measures;
  const complete = !!measures && MEASURE_KEYS.every((k) => measures[k] > 0);
  FEATURES.figure = complete && isHourglass(measures);
  if (complete) {
    BODY.type = p.body.type || "Reloj de arena";
    BODY.detail = p.body.detail || describeBody(measures);
    BODY.measures.forEach((m) => { m.cm = measures[m.key]; });
  }
}

// Muestra u oculta lo que depende de la colorimetría y de la figura.
function applyFeatureVisibility() {
  const set = (sel, on) => document.querySelectorAll(sel).forEach((el) => { el.hidden = !on; });
  const labelOf = (id) => `label:has(> #${id})`;
  set('.tab-btn[data-tab="colorimetry"]', FEATURES.palette);
  set('.tab-btn[data-tab="shop"]', FEATURES.palette);
  set('.tab-btn[data-tab="figure"]', FEATURES.figure);
  set("#filter-palette", FEATURES.palette);
  set("#filter-figure", FEATURES.figure);
  set(labelOf("rec-palette"), FEATURES.palette);
  set(labelOf("rec-figure"), FEATURES.figure);
  set("#item-cuts", FEATURES.figure);
  set("label:has(> #item-fit-override)", FEATURES.palette);
}


// ---------- Pantalla "Mi perfil" ----------
const MEASURE_HELP = {
  shoulders: ["Hombros (contorno)", "Con la cinta alrededor de los hombros, pasando por la parte más ancha."],
  bust: ["Busto", "Alrededor de la parte más llena del pecho."],
  waist: ["Cintura", "En la parte más angosta del torso, sin apretar."],
  hipHigh: ["Cadera alta", "Unos 10 cm debajo de la cintura."],
  hipLow: ["Cadera baja", "Alrededor de la parte más ancha de las caderas."],
};

function renderProfile() {
  const root = document.getElementById("profile");
  const prof = state.profile || {};
  const m = (prof.body && prof.body.measures) || {};
  root.innerHTML = `
    <h2>Mi perfil</h2>
    <p class="muted">Con esto la app personaliza las recomendaciones y dibuja el avatar con tus proporciones. Son datos tuyos: solo los ves vos.</p>
    <form id="profile-form" class="item-form">
      <label>Mi colorimetría
        <select id="profile-season">
          <option value="">Todavía no la tengo / no la quiero usar</option>
          <option value="otono-intenso" ${prof.season === "otono-intenso" ? "selected" : ""}>Otoño intenso</option>
        </select>
      </label>
      <p class="muted">Hoy está disponible la paleta de Otoño intenso. Si tu estación es otra, más adelante podrás sumarla.</p>
      <fieldset>
        <legend>Mis medidas (en cm)</legend>
        <div class="avatar-spec-grid">
          ${MEASURE_KEYS.map((k) => `<label>${MEASURE_HELP[k][0]}
            <input type="number" min="30" max="250" step="0.5" id="profile-${k}" value="${m[k] || ""}" inputmode="decimal">
            <span class="muted">${MEASURE_HELP[k][1]}</span></label>`).join("")}
        </div>
      </fieldset>
      <p class="muted" id="profile-result"></p>
      <button type="submit">Guardar mi perfil</button>
    </form>`;

  const form = root.querySelector("#profile-form");
  const result = root.querySelector("#profile-result");
  const readMeasures = () => {
    const out = {};
    MEASURE_KEYS.forEach((k) => { out[k] = Number(root.querySelector(`#profile-${k}`).value) || 0; });
    return out;
  };
  const explain = () => {
    const meas = readMeasures();
    if (MEASURE_KEYS.some((k) => !(meas[k] > 0))) {
      result.textContent = "Completá las cinco medidas para activar las recomendaciones de figura y ajustar el avatar.";
    } else if (isHourglass(meas)) {
      result.textContent = `Tu silueta se ve como reloj de arena ${describeBody(meas)}: se activan las recomendaciones de figura.`;
    } else {
      result.textContent = "Tu silueta no entra en reloj de arena. Por ahora las recomendaciones de figura solo existen para esa silueta; el avatar sí usa tus medidas. Más adelante sumamos otras.";
    }
  };
  form.addEventListener("input", explain);
  explain();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const meas = readMeasures();
    const complete = MEASURE_KEYS.every((k) => meas[k] > 0);
    const profile = { season: root.querySelector("#profile-season").value };
    if (complete) profile.body = { type: "Reloj de arena", detail: describeBody(meas), measures: meas };
    if (!profile.season) delete profile.season;
    state.profile = profile;
    if (!saveState()) return;
    applyProfile(profile);
    applyFeatureVisibility();
    refreshEverything();
    result.textContent = "Perfil guardado. " + result.textContent;
  });
}
