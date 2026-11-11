# Video empresas · Alejandra Cadario / Oike

Carpeta de producción independiente. No forma parte de la web: ninguna página la
enlaza y no debe publicarse tal cual (ver «Antes de integrar»).

## Estado

**Video 1 de 3 (empresas / gimnasio): contenido y dirección visual aprobados por Ale
para web y redes.** Queda pendiente solo el acabado final: fotos, voz, música y
sincronización. Los MP4 son montajes de trabajo: llevan subtítulos temporizados
provisionales incrustados y un rótulo que los identifica como tales.

| Archivo | Qué es |
| --- | --- |
| `salida/video-empresas-web-horizontal.mp4` | alecadario.com · 1920 × 1080 · guion completo, escenas 1 a 8 · 2 min 26 s |
| `salida/video-empresas-web-horizontal.srt` / `.vtt` | Subtítulos del montaje web |
| `salida/video-empresas-redes-vertical.mp4` | Reels / TikTok · 1080 × 1920 · historia condensada · 60 s |
| `salida/video-empresas-redes-vertical.srt` / `.vtt` | Subtítulos del montaje de redes |
| `salida/opciones-fotos-*.jpg` | Fotos existentes en el repositorio de la web, para elegir |

Ambos MP4 son H.264 a 30 fps, sin pista de audio.

- **Web**: cierra con «Conocé el Método Oike».
- **Redes**: abre con «Compraste las pesas. ¿Cuánto cambió?», omite las escenas 4
  (recetas) y 7 (preguntas para actuar) y cierra con «Conocé el Método Oike en
  alecadario.com». Su guion es una condensación del guion base, a validar por Ale.
  Reserva 260 px arriba, 480 px abajo y los bordes para los controles y textos de las
  aplicaciones; son márgenes orientativos, a comprobar en un teléfono.

## Pendiente (acabado final)

Se decide al final, cuando estén preparados los tres videos (empresas / gimnasio,
Método Oike y Oike Impacto), para definir una dirección sonora común:

- Voz y música. Hasta entonces se trabaja con textos y subtítulos temporizados.
- Fotos de Ale para las escenas 6 y 8: no incorporar ninguna hasta que Ale indique
  cuáles; las composiciones están resueltas sin foto.
- Sincronización con la locución: duración, pausas y animaciones se ajustan en
  `src/montajes.js`. Los 60 s del vertical son una referencia provisional.
- Portada y versión sin rótulo de trabajo.
- Propuesta de ubicación de cada video en alecadario.com (sin modificar la web).

## Proyecto editable

- `src/montajes.js` — por montaje: formato, orden de escenas, tiempos de cada acción y
  subtítulos (fuente única del texto incrustado y de los SRT / VTT).
- `src/escenas.js` — dibujos y transformaciones de las ocho escenas, y la composición
  de cada formato (`HORIZONTAL` y `VERTICAL`).
- `src/motor.js` — paleta Pizarra, primitivas de dibujo e interpolaciones.
- `src/index.html` — previsualización con barra de tiempo (abrir en el navegador;
  agregar `?montaje=redes` para el vertical).
- `render.mjs` — exporta el MP4 fotograma a fotograma.

```bash
node render.mjs --montaje web
```

```bash
node render.mjs --montaje redes
```

```bash
node render.mjs --montaje redes --fotos 4.5,14.8,59.5
```

Requiere Node, Playwright con Chromium y ffmpeg.

## Recursos y licencias

- Tipografías Caveat Brush, Caveat y Nunito Sans, copiadas de `assets/fonts/` de la web
  (SIL Open Font License, `assets/fonts/OFL.txt`).
- `assets/tiza.png`: textura de tiza de la web, usada solo en zonas de dibujo oscuras.
- Todos los dibujos están hechos por código para este video. Los montajes no usan
  fotos, música ni voz.

## Antes de integrar

`netlify.toml` publica la raíz del repositorio: si esta carpeta llega a la rama que
se despliega, quedaría accesible en `/video-empresas/`. La integración en la web es
un pedido aparte; en ese momento conviene publicar solo el MP4 final y su portada.
