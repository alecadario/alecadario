import crypto from "node:crypto";
import { HttpError } from "./closet-lib/config.mjs";
import { handler, json, readJson } from "./closet-lib/http.mjs";
import { esc, listAll, createRecords, updateRecords } from "./closet-lib/airtable.mjs";
import { hashPassword, verifyPassword, signToken, requireUser } from "./closet-lib/auth.mjs";

export const config = { path: ["/closet/api/auth/register", "/closet/api/auth/login", "/closet/api/auth/me"] };

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const publicUser = (r) => ({ id: r.fields.UserId, email: r.fields.Email, name: r.fields.Name || "" });

async function findUserByEmail(email) {
  const rows = await listAll("Users", `LOWER({Email})='${esc(email.toLowerCase())}'`);
  return rows[0] || null;
}

async function register(req) {
  const b = await readJson(req, 10000);
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  const name = String(b.name || "").trim().slice(0, 60);
  const code = String(b.code || "").trim();
  if (!EMAIL.test(email)) throw new HttpError(400, "Ingresá un email válido.");
  if (password.length < 8 || password.length > 200) throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres.");
  if (!name) throw new HttpError(400, "Ingresá tu nombre.");
  if (!code) throw new HttpError(400, "Ingresá tu código de acceso.");

  const invites = await listAll("Invites", `LOWER({Code})='${esc(code.toLowerCase())}'`);
  const invite = invites[0];
  const uses = invite ? Number(invite.fields.Uses || 0) : 0;
  const max = invite ? Number(invite.fields.MaxUses || 1) : 0;
  if (!invite || uses >= max) {
    await sleep(400);
    throw new HttpError(403, "Código de acceso no válido o ya usado.");
  }
  if (await findUserByEmail(email)) throw new HttpError(409, "Ya existe una cuenta con ese email.");

  const { salt, hash } = await hashPassword(password);
  const userId = crypto.randomUUID();
  await createRecords("Users", [{ UserId: userId, Email: email, Name: name, Salt: salt, PasswordHash: hash, CreatedAt: new Date().toISOString(), InviteCode: invite.fields.Code }]);
  await updateRecords("Invites", [{ id: invite.id, fields: { Uses: uses + 1, UsedBy: [invite.fields.UsedBy, email].filter(Boolean).join(", ") } }]);
  const token = signToken({ sub: userId, email });
  return json(req, 201, { token, user: { id: userId, email, name } });
}

async function login(req) {
  const b = await readJson(req, 10000);
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  const row = EMAIL.test(email) ? await findUserByEmail(email) : null;
  const ok = row && (await verifyPassword(password, row.fields.Salt, row.fields.PasswordHash));
  if (!ok) {
    await sleep(500);
    throw new HttpError(401, "Email o contraseña incorrectos.");
  }
  return json(req, 200, { token: signToken({ sub: row.fields.UserId, email }), user: publicUser(row) });
}

async function me(req) {
  const u = requireUser(req);
  const rows = await listAll("Users", `{UserId}='${esc(u.id)}'`);
  if (!rows[0]) throw new HttpError(401, "La cuenta ya no existe.");
  return json(req, 200, { user: publicUser(rows[0]) });
}

export default handler(async (req) => {
  const route = new URL(req.url).pathname.split("/").pop();
  if (route === "register" && req.method === "POST") return register(req);
  if (route === "login" && req.method === "POST") return login(req);
  if (route === "me" && req.method === "GET") return me(req);
  throw new HttpError(404, "No encontrado.");
});
