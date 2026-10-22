// ¿Estamos en la web publicada (modo nube) o en tu computadora (modo local)?
// En tu computadora (localhost o archivo suelto) todo sigue guardándose en el navegador.
// Para probar el modo nube en local: agregá ?cloud=1 a la dirección.
const CLOUD_ENABLED = (() => {
  if (!/^https?:$/.test(location.protocol)) return false;
  const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);
  return !isLocal || /[?&]cloud=1\b/.test(location.search);
})();
// Las funciones viven en <carpeta de la app>/api (alecadario.com/closet/api).
const CLOUD_API = (() => {
  const m = location.pathname.match(/^(.*\/closet)(\/|$)/);
  return (m ? m[1] : location.pathname.replace(/\/[^/]*$/, "")) + "/api";
})();
