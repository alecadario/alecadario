import { HttpError } from "./closet-lib/config.mjs";
import { handler, json, readJson } from "./closet-lib/http.mjs";
import { esc, listAll, clearField, uploadAttachment } from "./closet-lib/airtable.mjs";
import { requireUser } from "./closet-lib/auth.mjs";
import { COLLECTIONS, checkId } from "./closet-lib/mapping.mjs";

export const config = { path: "/closet/api/photo" };

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Devuelve la foto guardada como data URL. El navegador no puede retocar una imagen que
// viene directo de Airtable (otro dominio), así que se descarga desde acá.
async function getPhoto(req, user) {
  const q = new URL(req.url).searchParams;
  const def = COLLECTIONS[q.get("collection")];
  if (!def) throw new HttpError(400, "Colección no válida.");
  const field = def.photos[q.get("key")];
  if (!field) throw new HttpError(400, "Campo de foto no válido.");
  const id = checkId(q.get("id"));

  const rows = await listAll(def.table, `AND({UserId}='${esc(user.id)}',{${def.idField}}='${esc(id)}')`);
  const att = rows[0] && rows[0].fields[field];
  if (!Array.isArray(att) || !att[0] || !att[0].url) throw new HttpError(404, "Esa foto no está guardada.");

  const res = await fetch(att[0].url);
  if (!res.ok) throw new Error(`No se pudo descargar la foto de Airtable (${res.status}).`);
  const type = (res.headers.get("content-type") || att[0].type || "").split(";")[0];
  if (!TYPES[type]) throw new HttpError(415, "La foto debe ser JPG, PNG o WEBP.");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 4 * 1024 * 1024) throw new HttpError(413, "La foto pesa demasiado para retocarla.");
  return json(req, 200, { dataUrl: `data:${type};base64,${buf.toString("base64")}` });
}

// GET: descarga la foto para retocarla. POST: sube (o quita, si dataUrl es null) la foto de un registro que ya existe.
export default handler(async (req) => {
  if (req.method === "GET") return getPhoto(req, requireUser(req));
  if (req.method !== "POST") throw new HttpError(405, "Método no permitido.");
  const user = requireUser(req);
  const b = await readJson(req, 7 * 1024 * 1024);
  const def = COLLECTIONS[b.collection];
  if (!def) throw new HttpError(400, "Colección no válida.");
  const field = def.photos[b.key];
  if (!field) throw new HttpError(400, "Campo de foto no válido.");
  const id = checkId(b.id);

  const rows = await listAll(def.table, `AND({UserId}='${esc(user.id)}',{${def.idField}}='${esc(id)}')`);
  const rec = rows[0];
  if (!rec) throw new HttpError(404, "Primero hay que guardar el registro.");

  if (b.dataUrl === null) {
    await clearField(def.table, rec.id, field);
    return json(req, 200, { ok: true, url: null });
  }
  const m = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(String(b.dataUrl || ""));
  if (!m || !TYPES[m[1]]) throw new HttpError(400, "La foto debe ser JPG, PNG o WEBP.");
  if (m[2].length > 6.5 * 1024 * 1024) throw new HttpError(413, "La foto pesa demasiado.");

  await clearField(def.table, rec.id, field); // reemplaza la foto anterior
  const updated = await uploadAttachment(rec.id, field, { contentType: m[1], filename: `${id}.${TYPES[m[1]]}`, base64: m[2] });
  const att = updated && updated.fields && updated.fields[field];
  return json(req, 200, { ok: true, url: Array.isArray(att) && att[0] ? att[0].url : null });
});
