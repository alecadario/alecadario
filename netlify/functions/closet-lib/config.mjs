// Configuración leída de las variables de entorno de Netlify.
export function cfg() {
  return {
    token: process.env.CLOSET_AIRTABLE_TOKEN,
    base: process.env.CLOSET_AIRTABLE_BASE_ID,
    api: process.env.CLOSET_AIRTABLE_API_URL || "https://api.airtable.com",
    content: process.env.CLOSET_AIRTABLE_CONTENT_URL || "https://content.airtable.com",
    jwtSecret: process.env.CLOSET_JWT_SECRET,
    origins: (process.env.CLOSET_ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),
  };
}

export function assertConfigured() {
  const c = cfg();
  const missing = ["token", "base", "jwtSecret"].filter((k) => !c[k]);
  if (missing.length) throw new HttpError(500, "Falta configurar el servidor (variables de entorno).");
  if (c.jwtSecret.length < 24) throw new HttpError(500, "CLOSET_JWT_SECRET es demasiado corto.");
  return c;
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
