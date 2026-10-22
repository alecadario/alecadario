import { HttpError } from "./closet-lib/config.mjs";
import { handler, json, readJson } from "./closet-lib/http.mjs";
import { esc, listAll, createRecords, updateRecords, deleteRecords } from "./closet-lib/airtable.mjs";
import { requireUser } from "./closet-lib/auth.mjs";
import { COLLECTIONS, PROFILE_TABLE, toFields, checkId } from "./closet-lib/mapping.mjs";

export const config = { path: "/closet/api/sync" };

export default handler(async (req) => {
  if (req.method !== "POST") throw new HttpError(405, "Método no permitido.");
  const user = requireUser(req);
  const body = await readJson(req);
  const upserts = body.upserts || {};
  const deletes = body.deletes || {};
  const formula = `{UserId}='${esc(user.id)}'`;
  const result = { upserted: 0, deleted: 0 };

  for (const [col, def] of Object.entries(COLLECTIONS)) {
    const ups = Array.isArray(upserts[col]) ? upserts[col] : [];
    const dels = Array.isArray(deletes[col]) ? deletes[col] : [];
    if (!ups.length && !dels.length) continue;
    if (ups.length > 500 || dels.length > 500) throw new HttpError(413, "Demasiados cambios juntos.");

    // Solo se tocan registros del propio usuario (la fórmula siempre filtra por UserId).
    const existing = new Map((await listAll(def.table, formula)).map((r) => [r.fields[def.idField], r.id]));

    const toCreate = [];
    const toUpdate = [];
    ups.forEach((obj) => {
      const fields = toFields(col, obj, user.id);
      const recId = existing.get(fields[def.idField]);
      if (recId) {
        delete fields.UserId;
        toUpdate.push({ id: recId, fields });
      } else {
        toCreate.push(fields);
      }
    });
    if (toCreate.length) await createRecords(def.table, toCreate);
    if (toUpdate.length) await updateRecords(def.table, toUpdate);
    const delIds = dels.map((id) => existing.get(checkId(id))).filter(Boolean);
    if (delIds.length) await deleteRecords(def.table, delIds);
    result.upserted += ups.length;
    result.deleted += delIds.length;
  }

  if (body.profile && typeof body.profile === "object") {
    const data = JSON.stringify(body.profile);
    if (data.length > 20000) throw new HttpError(413, "El perfil es demasiado grande.");
    const prof = (await listAll(PROFILE_TABLE, formula))[0];
    if (prof) await updateRecords(PROFILE_TABLE, [{ id: prof.id, fields: { Data: data } }]);
    else await createRecords(PROFILE_TABLE, [{ UserId: user.id, Data: data }]);
  }
  return json(req, 200, { ok: true, ...result });
});
