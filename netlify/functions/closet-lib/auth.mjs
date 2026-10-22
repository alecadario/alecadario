import crypto from "node:crypto";
import { assertConfigured, HttpError } from "./config.mjs";

const b64url = (buf) => Buffer.from(buf).toString("base64url");
const DAY = 24 * 60 * 60;

export function signToken(payload, days = 30) {
  const { jwtSecret } = assertConfigured();
  const head = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + days * DAY }));
  const sig = crypto.createHmac("sha256", jwtSecret).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}

export function verifyToken(token) {
  const { jwtSecret } = assertConfigured();
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new HttpError(401, "Sesión no válida.");
  const expected = crypto.createHmac("sha256", jwtSecret).update(`${parts[0]}.${parts[1]}`).digest();
  const given = Buffer.from(parts[2], "base64url");
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) throw new HttpError(401, "Sesión no válida.");
  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  } catch {
    throw new HttpError(401, "Sesión no válida.");
  }
  if (!payload.exp || payload.exp < Date.now() / 1000) throw new HttpError(401, "La sesión venció. Ingresá de nuevo.");
  return payload;
}

// Usuario autenticado a partir del encabezado Authorization: Bearer <token>.
export function requireUser(req) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer (.+)$/);
  if (!m) throw new HttpError(401, "Ingresá para continuar.");
  const p = verifyToken(m[1]);
  if (!p.sub) throw new HttpError(401, "Sesión no válida.");
  return { id: p.sub, email: p.email };
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => {
      if (err) reject(err);
      else resolve({ salt, hash: key.toString("hex") });
    });
  });
}

export async function verifyPassword(password, salt, hash) {
  const { hash: h } = await hashPassword(password, salt);
  const a = Buffer.from(h, "hex");
  const b = Buffer.from(String(hash || ""), "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
