# Video empresas · Alejandra Cadario / Oike

Carpeta de producción independiente. No forma parte de la web: ninguna página la
enlaza y no debe publicarse tal cual (ver «Antes de integrar»).

## Estado

**Muestra de las escenas 1 y 2 en dos formatos** (23 s, 30 fps, mismos tiempos).
Sin locución: llevan subtítulos temporizados provisionales incrustados y un rótulo
que las identifica como muestra. Las escenas 3 a 8 y el montaje breve para redes
(45–60 s) no están producidos.

| Archivo | Qué es |
| --- | --- |
| `salida/muestra-escenas-1-2.mp4` | Horizontal 1920 × 1080 para la web (H.264, sin pista de audio) |
| `salida/muestra-escenas-1-2-vertical.mp4` | Vertical 1080 × 1920 para Reels / TikTok, con composición propia |
| `salida/muestra-escenas-1-2.srt` / `.vtt` | Subtítulos como archivo (valen para los dos formatos) |
| `salida/muestra-fotograma-referencia.png` | Fotograma fijo horizontal de referencia (no es la portada final) |

En vertical se reservan 260 px arriba, 480 px abajo y la columna derecha para los
controles y textos de las aplicaciones; son márgenes orientativos, a comprobar en
un teléfono con cada aplicación.

## Proyecto editable

- `src/subtitulos.js` — textos y tiempos de los subtítulos (fuente única del video, SRT y VTT).
- `src/escenas-1-2.js` — dibujos y transformaciones; los tiempos están en el bloque `T` y la
  composición de cada formato en `HORIZONTAL` y `VERTICAL`.
- `src/motor.js` — paleta Pizarra, primitivas de dibujo e interpolaciones.
- `src/index.html` — previsualización de trabajo con barra de tiempo (abrir en el navegador;
  agregar `?formato=vertical` para el formato de redes).
- `render.mjs` — exporta el MP4 fotograma a fotograma.

```bash
node render.mjs
```

```bash
node render.mjs --formato vertical
```

```bash
node render.mjs --fotos 1.6,8.8,21.5
```

Requiere Node, Playwright con Chromium y ffmpeg.

## Recursos y licencias

- Tipografías Caveat Brush, Caveat y Nunito Sans, copiadas de `assets/fonts/` de la web
  (SIL Open Font License, `assets/fonts/OFL.txt`).
- `assets/tiza.png`: textura de tiza de la web, usada solo en la zona de dibujo oscura.
- Todos los dibujos están hechos por código para este video. La muestra no usa fotos,
  música ni voz.

## Antes de integrar

`netlify.toml` publica la raíz del repositorio: si esta carpeta llega a la rama que
se despliega, quedaría accesible en `/video-empresas/`. La integración en la web es
un pedido aparte; en ese momento conviene publicar solo el MP4 final y su portada.
