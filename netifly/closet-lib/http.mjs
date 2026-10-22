import { cfg, HttpError } from "./config.mjs";

// CORS: la web publicada usa el mismo origen, así que solo se habilitan los orígenes
// de ALLOWED_ORIGINS (por ejemplo, tu computadora para la herramienta de migración).
export function corsHeaders(req) {
  const origin = req.headers.get("origin");
  const h = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (origin && cfg().origins.includes(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    h["Vary"] = "Origin";
  }
  return h;
}

export function json(req, status, body) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) });
}

// Envuelve un handler: preflight, errores controlados y errores inesperados sin filtrar detalles.
export function handler(fn) {
  return async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
    try {
      return await fn(req);
    } catch (e) {
      if (e instanceof HttpError) return json(req, e.status, { error: e.message });
      console.error("Error inesperado:", e && e.stack ? e.stack : e);
      return json(req, 500, { error: "Algo salió mal en el servidor." });
    }
  };
}

export async function readJson(req, maxBytes = 5 * 1024 * 1024) {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "El envío es demasiado grande.");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "El envío no es válido.");
  }
}
