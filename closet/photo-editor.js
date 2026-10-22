// Editor simple de fotos: rotar, recortar, brillo, contraste, saturación y temperatura.
// openPhotoEditor(src, onDone) -> onDone(dataUrl) al aplicar. Si la foto no se puede
// procesar (por ejemplo una imagen de archivo local), llama a onError(mensaje).

function openPhotoEditor(src, onDone, onError) {
  const img = new Image();
  img.onload = () => buildEditor(img, onDone, onError);
  img.onerror = () => onError && onError("No se pudo abrir la foto para retocarla.");
  img.src = src;
}

function buildEditor(img, onDone, onError) {
  const MAX = 1000;
  const PREVIEW = 420;
  let rotation = 0; // grados, múltiplos de 90
  const adj = { top: 0, bottom: 0, left: 0, right: 0, brightness: 0, contrast: 100, saturation: 100, temperature: 0 };

  // Imagen de trabajo (rotada) a tamaño máximo.
  function rotatedCanvas(maxSide) {
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const swap = rotation % 180 !== 0;
    const c = document.createElement("canvas");
    c.width = swap ? h : w;
    c.height = swap ? w : h;
    const x = c.getContext("2d");
    x.translate(c.width / 2, c.height / 2);
    x.rotate((rotation * Math.PI) / 180);
    x.drawImage(img, -w / 2, -h / 2, w, h);
    return c;
  }

  function render(maxSide) {
    const base = rotatedCanvas(maxSide);
    const sx = Math.round(base.width * (adj.left / 100));
    const sy = Math.round(base.height * (adj.top / 100));
    const sw = Math.max(10, base.width - sx - Math.round(base.width * (adj.right / 100)));
    const sh = Math.max(10, base.height - sy - Math.round(base.height * (adj.bottom / 100)));
    const out = document.createElement("canvas");
    out.width = sw;
    out.height = sh;
    const ctx = out.getContext("2d");
    ctx.drawImage(base, sx, sy, sw, sh, 0, 0, sw, sh);
    const data = ctx.getImageData(0, 0, sw, sh); // falla si la imagen está "contaminada"
    const d = data.data;
    const bright = adj.brightness * 1.5;
    const contrast = adj.contrast / 100;
    const sat = adj.saturation / 100;
    const warm = adj.temperature / 100;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] * (1 + warm * 0.18);
      let g = d[i + 1];
      let b = d[i + 2] * (1 - warm * 0.18);
      r = (r - 128) * contrast + 128 + bright;
      g = (g - 128) * contrast + 128 + bright;
      b = (b - 128) * contrast + 128 + bright;
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      d[i] = Math.max(0, Math.min(255, l + (r - l) * sat));
      d[i + 1] = Math.max(0, Math.min(255, l + (g - l) * sat));
      d[i + 2] = Math.max(0, Math.min(255, l + (b - l) * sat));
    }
    ctx.putImageData(data, 0, 0);
    return out;
  }

  const overlay = document.createElement("div");
  overlay.className = "editor-overlay";
  overlay.innerHTML = `
    <div class="editor-box" role="dialog" aria-label="Retocar foto">
      <h3>Retocar foto</h3>
      <div class="editor-body">
        <canvas class="editor-canvas"></canvas>
        <div class="editor-controls">
          <div class="editor-row">
            <button type="button" data-act="rot-left">⟲ Girar</button>
            <button type="button" data-act="rot-right">⟳ Girar</button>
            <button type="button" data-act="auto">Mejorar automático</button>
          </div>
          <h4>Recortar (%)</h4>
          ${slider("top", "Arriba", 0, 45, 0)}
          ${slider("bottom", "Abajo", 0, 45, 0)}
          ${slider("left", "Izquierda", 0, 45, 0)}
          ${slider("right", "Derecha", 0, 45, 0)}
          <h4>Luz y color</h4>
          ${slider("brightness", "Brillo", -40, 40, 0)}
          ${slider("contrast", "Contraste", 70, 150, 100)}
          ${slider("saturation", "Saturación", 50, 150, 100)}
          ${slider("temperature", "Frío ↔ cálido", -40, 40, 0)}
        </div>
      </div>
      <p class="muted editor-error"></p>
      <div class="form-actions">
        <button type="button" data-act="apply">Aplicar</button>
        <button type="button" data-act="reset" class="secondary">Restablecer</button>
        <button type="button" data-act="cancel" class="secondary">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  function slider(key, label, min, max, value) {
    return `<label class="editor-slider">${label}<input type="range" data-key="${key}" min="${min}" max="${max}" value="${value}"></label>`;
  }

  const canvas = overlay.querySelector(".editor-canvas");
  const errorEl = overlay.querySelector(".editor-error");

  function paint() {
    try {
      const out = render(PREVIEW);
      canvas.width = out.width;
      canvas.height = out.height;
      canvas.getContext("2d").drawImage(out, 0, 0);
      errorEl.textContent = "";
    } catch (e) {
      close();
      if (onError) onError("Esta foto no se puede retocar desde un archivo local. Volvé a subirla desde \"Foto\" o abrí la app con el servidor (python3 -m http.server).");
    }
  }

  function close() {
    overlay.remove();
  }

  overlay.querySelectorAll("input[type=range]").forEach((input) => {
    input.addEventListener("input", () => {
      adj[input.dataset.key] = Number(input.value);
      paint();
    });
  });

  function resetAll() {
    rotation = 0;
    Object.assign(adj, { top: 0, bottom: 0, left: 0, right: 0, brightness: 0, contrast: 100, saturation: 100, temperature: 0 });
    overlay.querySelectorAll("input[type=range]").forEach((input) => {
      input.value = adj[input.dataset.key];
    });
    paint();
  }

  // Ajuste automático de brillo y contraste según la luminosidad de la foto.
  function autoAdjust() {
    adj.brightness = 0;
    adj.contrast = 100;
    const probe = render(160);
    const data = probe.getContext("2d").getImageData(0, 0, probe.width, probe.height).data;
    let sum = 0, sum2 = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += l; sum2 += l * l; n++;
    }
    const mean = sum / n;
    const sd = Math.sqrt(Math.max(1, sum2 / n - mean * mean));
    adj.brightness = Math.round(Math.max(-30, Math.min(30, (125 - mean) / 1.5 * 0.6)));
    adj.contrast = Math.round(Math.max(90, Math.min(130, (58 / sd) * 100)));
    overlay.querySelector('[data-key="brightness"]').value = adj.brightness;
    overlay.querySelector('[data-key="contrast"]').value = adj.contrast;
    paint();
  }

  overlay.addEventListener("click", (e) => {
    const act = e.target.dataset && e.target.dataset.act;
    if (e.target === overlay || act === "cancel") return close();
    if (act === "rot-left") { rotation = (rotation + 270) % 360; paint(); }
    if (act === "rot-right") { rotation = (rotation + 90) % 360; paint(); }
    if (act === "reset") resetAll();
    if (act === "auto") autoAdjust();
    if (act === "apply") {
      try {
        const out = render(MAX);
        const url = out.toDataURL("image/jpeg", 0.85);
        close();
        onDone(url);
      } catch (err) {
        errorEl.textContent = "No se pudo aplicar los cambios a esta foto.";
      }
    }
  });

  paint();
}
