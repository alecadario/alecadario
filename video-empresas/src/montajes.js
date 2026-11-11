/* Los dos montajes del primer video. Cada uno define su formato, el orden de
   escenas, los tiempos (segundos) de cada acción y sus subtítulos.
   Los subtítulos son la fuente única del texto incrustado y de los SRT / VTT.
   PROVISIONALES: todos los tiempos se reajustan con la locución real de Ale.
   `soloArchivo`: la frase ya está escrita en pantalla; va al SRT pero no se incrusta. */
window.MONTAJES = {
  // ── alecadario.com · horizontal 1920 × 1080 · guion completo, escenas 1 a 8 ──
  web: {
    formato: 'horizontal', archivo: 'video-empresas-web-horizontal', barrido: 1.5,
    escenas: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'],
    T: {
      s1: 0, piso: [0.1, 0.8], banco: [0.3, 0.9], pesa: [0.7, 1.3], recibo1: 1.4, maquina: [2.0, 2.9], recibo2: 2.9, recibo3: 3.7,
      polvo: [5.1, 6.5], pregunta1: [7.4, 8.2],
      s2: 10.0, escritorio: [10.6, 12.3], fichas: [13.4, 14.3], curso: [14.9, 15.8], ensayo: [16.5, 17.4],
      clientes: [19.0, 19.8], pregunta2: [19.9, 20.8], zoom: [22.2, 23.2],
      s3: 23.4, recto: [24.6, 26.6], tema: 28.0, silencio: 30.2, otra: 31.5, rumbo: [33.4, 36.0], pregunta3: [37.8, 38.6], fortalezas: 40.0, guion3: 42.6,
      s4: 46.6, receta: [47.0, 48.4], cita: 50.0, q1: 55.0, q2: 56.4, q3: [57.8, 58.6], empresa: [60.0, 61.2],
      s5: 64.0, gimnasio: [64.6, 66.0], obs: [67.0, 68.6, 70.2, 72.0], trabajo: 74.9, ajusta: 78.2, pasos: [65.4, 75.2, 76.8, 78.6],
      s6: 84.4, nombre: [89.2, 90.2], c: [92.6, 95.2, 97.6], diag: [100.6, 102.2], disena: [104.4, 106.0], sigue: [107.4, 109.0],
      s7: 113.4, q7: [114.2, 116.4, 119.2], tarjetas: [122.2, 123.4], linea: [123.4, 125.4], final7: [126.2, 127.4],
      s8: 130.4, caja: [131.0, 131.8], entender: [133.2, 134.4], nombre8: [136.2, 137.0], lema: [138.4, 139.4], invita: [141.4, 142.2],
      fin: 146,
    },
    subtitulos: [
      // 1 · Compra / expectativa
      { ini: 0.5, fin: 2.0, texto: 'Compraste las pesas.' },
      { ini: 2.0, fin: 3.3, texto: 'La máquina.' },
      { ini: 3.3, fin: 5.0, texto: 'Pagaste el gimnasio.' },
      { ini: 6.6, fin: 9.4, texto: '¿Cuánto cambió tu estado físico?' },
      // 2 · Paralelo empresarial
      { ini: 10.2, fin: 13.2, texto: 'Con tu equipo comercial puede pasar algo parecido.' },
      { ini: 13.4, fin: 14.9, texto: 'Compraste el CRM.' },
      { ini: 14.9, fin: 16.5, texto: 'Contrataste el curso.' },
      { ini: 16.5, fin: 18.2, texto: 'Hicieron los roleplays.' },
      { ini: 18.8, fin: 22.0, texto: '¿Qué pasó cuando salieron a hablar con clientes?' },
      // 3 · La realidad cambia
      { ini: 23.8, fin: 27.6, texto: 'Porque en el ejercicio, el cliente tenía una objeción prevista.' },
      { ini: 27.9, fin: 30.1, texto: 'En la reunión real, cambió de tema.' },
      { ini: 30.1, fin: 31.4, texto: 'No respondió.' },
      { ini: 31.4, fin: 33.1, texto: 'Apareció otra persona.' },
      { ini: 33.3, fin: 37.2, texto: 'La conversación tomó un rumbo que nadie había ensayado.' },
      { ini: 37.7, fin: 39.8, texto: '¿Tu vendedor pudo adaptarse?' },
      { ini: 39.9, fin: 42.4, texto: '¿Sabía cómo aprovechar sus fortalezas?' },
      { ini: 42.5, fin: 46.2, texto: '¿O estaba intentando recordar qué decía el guion?' },
      // 4 · Las recetas
      { ini: 47.2, fin: 49.5, texto: 'Y entonces aparece otra receta:' },
      { ini: 49.8, fin: 54.6, texto: '«Hacé esto. A otra empresa le mejoró las ventas un treinta por ciento».' },
      { ini: 55.0, fin: 56.4, texto: '¿Con qué clientes?' },
      { ini: 56.4, fin: 57.8, texto: '¿Con qué equipo?' },
      { ini: 57.8, fin: 59.6, texto: '¿En qué condiciones?' },
      { ini: 59.9, fin: 63.6, texto: '¿Qué te hace pensar que tu empresa necesita lo mismo?' },
      // 5 · El entrenador
      { ini: 64.4, fin: 67.0, texto: 'Un entrenador personal empieza por observarte:' },
      { ini: 67.0, fin: 68.6, texto: 'qué podés hacer hoy,' },
      { ini: 68.6, fin: 70.2, texto: 'qué querés conseguir,' },
      { ini: 70.2, fin: 72.0, texto: 'qué necesitás desarrollar' },
      { ini: 72.0, fin: 74.5, texto: 'y cómo respondés a los ejercicios.' },
      { ini: 74.9, fin: 78.1, texto: 'Te propone un trabajo, observa cómo lo hacés' },
      { ini: 78.1, fin: 81.2, texto: 'y ajusta la exigencia según tu avance.' },
      // 6 · Ale / el método
      { ini: 85.2, fin: 88.8, texto: 'Esa es la lógica que llevo al desarrollo comercial.' },
      { ini: 89.2, fin: 91.4, texto: 'Soy Alejandra Cadario.' },
      { ini: 92.0, fin: 95.1, texto: 'Con Oike, empezamos por comprender tu negocio,' },
      { ini: 95.1, fin: 97.5, texto: 'cómo funciona tu sistema comercial' },
      { ini: 97.5, fin: 100.0, texto: 'y qué capacidades tiene tu equipo.' },
      { ini: 100.5, fin: 104.0, texto: 'Evaluamos para reconocer fortalezas y necesidades.' },
      { ini: 104.3, fin: 107.2, texto: 'Diseñamos la intervención que corresponde' },
      { ini: 107.3, fin: 112.8, texto: 'y, si seguimos trabajando juntos, acompañamos su aplicación y revisamos los avances.' },
      // 7 · Preguntas para actuar
      { ini: 114.0, fin: 116.2, texto: '¿Qué necesitamos practicar?' },
      { ini: 116.3, fin: 119.0, texto: '¿Qué necesitamos cambiar en el proceso?' },
      { ini: 119.1, fin: 121.7, texto: '¿Qué está dificultando el trabajo?' },
      { ini: 122.1, fin: 125.8, texto: '¿Y cómo vamos a comprobar si estamos avanzando?' },
      // 8 · Cierre
      { ini: 130.8, fin: 135.6, texto: 'Antes de comprar la próxima solución, entendamos qué necesita tu empresa.' },
      { ini: 136.2, fin: 138.3, texto: 'Alejandra Cadario. Oike.', soloArchivo: true },
      { ini: 138.4, fin: 141.2, texto: 'Las oportunidades también se construyen.', soloArchivo: true },
    ],
  },

  // ── Reels / TikTok · vertical 1080 × 1920 · historia completa en un minuto ──
  // Guion condensado a partir del guion base (a validar por Ale); omite las escenas 4 y 7.
  redes: {
    formato: 'vertical', archivo: 'video-empresas-redes-vertical', barrido: 1.0,
    escenas: ['s1', 's2', 's3', 's5', 's6', 's8'],
    T: {
      s1: 0, piso: [0.05, 0.5], banco: [0.1, 0.6], pesa: [0.3, 0.8], recibo1: 0.9, maquina: [1.2, 1.9], recibo2: 1.9, recibo3: 2.2,
      polvo: [2.5, 3.4], pregunta1: [3.0, 3.7],
      s2: 5.2, escritorio: [5.6, 6.9], fichas: [8.4, 9.2], curso: [9.7, 10.5], ensayo: [11.1, 11.9],
      clientes: [999, 999], pregunta2: [13.3, 14.1], zoom: [999, 999],
      s3: 15.6, recto: [16.4, 18.2], tema: 19.4, silencio: 999, otra: 20.4, rumbo: [20.8, 22.4], pregunta3: [23.1, 23.8], fortalezas: 24.4, guion3: 999,
      s5: 26.0, gimnasio: [26.5, 27.6], obs: [999, 999, 999, 999], trabajo: 29.8, ajusta: 32.0, pasos: [27.4, 30.2, 31.4, 32.6],
      s6: 35.4, nombre: [39.4, 40.2], c: [42.6, 44.2, 45.2], diag: [46.4, 47.4], disena: [48.8, 49.6], sigue: [49.2, 50.0],
      s8: 51.2, caja: [51.8, 52.5], entender: [53.6, 54.6], nombre8: [55.6, 56.3], lema: [56.6, 57.4], invita: [57.6, 58.3],
      fin: 60,
    },
    subtitulos: [
      { ini: 0.3, fin: 2.2, texto: 'Compraste las pesas.' },
      { ini: 2.8, fin: 5.0, texto: '¿Cuánto cambió?' },
      { ini: 5.5, fin: 8.2, texto: 'Con tu equipo comercial puede pasar algo parecido.' },
      { ini: 8.4, fin: 9.7, texto: 'Compraste el CRM.' },
      { ini: 9.7, fin: 11.1, texto: 'Contrataste el curso.' },
      { ini: 11.1, fin: 12.6, texto: 'Hicieron los roleplays.' },
      { ini: 13.0, fin: 15.4, texto: '¿Y cuando salieron a hablar con clientes?' },
      { ini: 16.2, fin: 19.0, texto: 'En el ensayo, la objeción estaba prevista.' },
      { ini: 19.2, fin: 20.4, texto: 'En la reunión real,' },
      { ini: 20.4, fin: 22.7, texto: 'la conversación tomó otro rumbo.' },
      { ini: 23.0, fin: 25.6, texto: '¿Tu vendedor pudo adaptarse?' },
      { ini: 26.6, fin: 29.6, texto: 'Un entrenador personal empieza por observarte.' },
      { ini: 29.8, fin: 31.4, texto: 'Te propone un trabajo' },
      { ini: 31.4, fin: 34.0, texto: 'y ajusta la exigencia según tu avance.' },
      { ini: 36.0, fin: 39.2, texto: 'Esa es la lógica que llevo al desarrollo comercial.' },
      { ini: 39.4, fin: 41.2, texto: 'Soy Alejandra Cadario.' },
      { ini: 41.5, fin: 44.0, texto: 'Con Oike, empezamos por comprender tu negocio,' },
      { ini: 44.0, fin: 46.1, texto: 'tu sistema comercial y tu equipo.' },
      { ini: 46.3, fin: 48.6, texto: 'Evaluamos, diseñamos la intervención' },
      { ini: 48.6, fin: 51.0, texto: 'y, si seguimos juntos, acompañamos su aplicación.' },
      { ini: 51.5, fin: 53.4, texto: 'Antes de comprar la próxima solución,' },
      { ini: 53.4, fin: 55.4, texto: 'entendamos qué necesita tu empresa.' },
      { ini: 55.8, fin: 57.6, texto: 'Las oportunidades también se construyen.', soloArchivo: true },
      { ini: 57.6, fin: 59.6, texto: 'Conocé el Método Oike en alecadario.com.', soloArchivo: true },
    ],
  },
};
