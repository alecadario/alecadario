import { HttpError } from "./config.mjs";

// Colecciones de la app ↔ tablas de Airtable. Los campos más útiles para mirar en Airtable
// van en columnas propias ("promote"); el resto viaja en una columna Data (JSON).
export const COLLECTIONS = {
  items: {
    table: "Items",
    idField: "ItemId",
    promote: { name: "Name", category: "Category", brand: "Brand", store: "Store", price: "Price", bought: "Bought", favorite: "Favorite", donate: "Donate" },
    kinds: { price: "number", favorite: "bool", donate: "bool" },
    photos: { image: "Photo", photoSolo: "PhotoSolo" },
    skip: ["originalImage"],
  },
  outfits: { table: "Outfits", idField: "OutfitId", promote: { name: "Name" }, kinds: {}, photos: {}, skip: [] },
  log: { table: "Log", idField: "EntryId", promote: { date: "Date", type: "Type" }, kinds: {}, photos: { photo: "Photo" }, skip: [] },
  trips: { table: "Trips", idField: "TripId", promote: { name: "Name", startDate: "StartDate", endDate: "EndDate" }, kinds: {}, photos: {}, skip: [] },
};

export const PROFILE_TABLE = "Profiles";
const MAX_DATA = 90000; // el texto largo de Airtable admite hasta 100.000 caracteres

export function checkId(id) {
  if (typeof id !== "string" || !id || id.length > 100) throw new HttpError(400, "Identificador no válido.");
  return id;
}

// Objeto de la app → campos de Airtable (sin fotos: esas se suben aparte).
export function toFields(col, obj, userId) {
  const def = COLLECTIONS[col];
  const id = checkId(obj && obj.id);
  const fields = { UserId: userId, [def.idField]: id };
  const rest = { ...obj };
  delete rest.id;
  Object.keys(def.photos).forEach((k) => delete rest[k]);
  def.skip.forEach((k) => delete rest[k]);
  Object.entries(def.promote).forEach(([key, field]) => {
    const kind = def.kinds[key];
    const v = obj[key];
    if (kind === "number") fields[field] = v === undefined || v === null || v === "" || Number.isNaN(Number(v)) ? null : Number(v);
    else if (kind === "bool") fields[field] = !!v;
    else fields[field] = v === undefined || v === null ? "" : String(v).slice(0, 500);
    delete rest[key];
  });
  const data = JSON.stringify(rest);
  if (data.length > MAX_DATA) throw new HttpError(413, "Un registro tiene demasiados datos.");
  fields.Data = data;
  return fields;
}

// Registro de Airtable → objeto de la app.
export function fromRecord(col, rec) {
  const def = COLLECTIONS[col];
  const f = rec.fields || {};
  let data = {};
  try {
    data = JSON.parse(f.Data || "{}");
  } catch {
    data = {};
  }
  const obj = { ...data, id: f[def.idField] };
  Object.entries(def.promote).forEach(([key, field]) => {
    const kind = def.kinds[key];
    const v = f[field];
    if (kind === "bool") {
      if (v) obj[key] = true;
      else if (key === "favorite") obj[key] = false;
    } else if (kind === "number") {
      if (typeof v === "number") obj[key] = v;
    } else if (v !== undefined && v !== "") obj[key] = v;
  });
  Object.entries(def.photos).forEach(([key, field]) => {
    const att = f[field];
    if (Array.isArray(att) && att[0] && att[0].url) obj[key] = att[0].url;
  });
  return obj;
}
