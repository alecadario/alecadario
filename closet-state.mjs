import { HttpError } from "./closet-lib/config.mjs";
import { handler, json } from "./closet-lib/http.mjs";
import { esc, listAll } from "./closet-lib/airtable.mjs";
import { requireUser } from "./closet-lib/auth.mjs";
import { COLLECTIONS, PROFILE_TABLE, fromRecord } from "./closet-lib/mapping.mjs";

export const config = { path: "/closet/api/state" };

export default handler(async (req) => {
  if (req.method !== "GET") throw new HttpError(405, "Método no permitido.");
  const user = requireUser(req);
  const formula = `{UserId}='${esc(user.id)}'`;
  const out = {};
  for (const [col, def] of Object.entries(COLLECTIONS)) {
    out[col] = (await listAll(def.table, formula)).map((r) => fromRecord(col, r));
  }
  const prof = (await listAll(PROFILE_TABLE, formula))[0];
  let profile = {};
  try {
    profile = prof ? JSON.parse(prof.fields.Data || "{}") : {};
  } catch {
    profile = {};
  }
  return json(req, 200, { ...out, profile });
});
