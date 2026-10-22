import { assertConfigured } from "./config.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastCall = 0;

// Escapa texto para usarlo dentro de una fórmula de Airtable ('...').
export function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/[\r\n]/g, " ");
}

// Airtable permite 5 pedidos por segundo por base: se espacian y se reintenta ante 429.
async function call(method, url, body, attempt = 0) {
  const c = assertConfigured();
  const wait = Math.max(0, lastCall + 210 - Date.now());
  if (wait) await sleep(wait);
  lastCall = Date.now();
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 429 && attempt < 3) {
    await sleep(1500 * (attempt + 1));
    return call(method, url, body, attempt + 1);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status} en ${method} ${url.split("?")[0]}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

const tableUrl = (table) => {
  const c = assertConfigured();
  return `${c.api}/v0/${c.base}/${encodeURIComponent(table)}`;
};

export async function listAll(table, formula) {
  const out = [];
  let offset;
  do {
    const q = new URLSearchParams({ pageSize: "100" });
    if (formula) q.set("filterByFormula", formula);
    if (offset) q.set("offset", offset);
    const data = await call("GET", `${tableUrl(table)}?${q}`);
    out.push(...data.records);
    offset = data.offset;
  } while (offset);
  return out;
}

const chunks = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

export async function createRecords(table, fieldsList) {
  const out = [];
  for (const group of chunks(fieldsList, 10)) {
    const data = await call("POST", tableUrl(table), { records: group.map((fields) => ({ fields })), typecast: true });
    out.push(...data.records);
  }
  return out;
}

export async function updateRecords(table, updates) {
  const out = [];
  for (const group of chunks(updates, 10)) {
    const data = await call("PATCH", tableUrl(table), { records: group.map((u) => ({ id: u.id, fields: u.fields })), typecast: true });
    out.push(...data.records);
  }
  return out;
}

export async function deleteRecords(table, ids) {
  for (const group of chunks(ids, 10)) {
    const q = group.map((id) => `records[]=${encodeURIComponent(id)}`).join("&");
    await call("DELETE", `${tableUrl(table)}?${q}`);
  }
}

export async function clearField(table, recordId, field) {
  const [rec] = await updateRecords(table, [{ id: recordId, fields: { [field]: [] } }]);
  return rec;
}

// Sube un archivo (base64, hasta 5 MB) a un campo de adjuntos.
export async function uploadAttachment(recordId, field, { contentType, filename, base64 }) {
  const c = assertConfigured();
  return call("POST", `${c.content}/v0/${c.base}/${recordId}/${encodeURIComponent(field)}/uploadAttachment`, {
    contentType,
    filename,
    file: base64,
  });
}
