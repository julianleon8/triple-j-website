// Generic, zero-dependency Supabase impersonator: GoTrue password auth + a
// PostgREST subset, backed by in-memory tables. App-agnostic — an app supplies
// a seed (users + tables), an optional RLS-ish `scope`, and optional `rpc`
// handlers. See README.md. Local dev/demo tool only: it has NO real security.
"use strict";
const http = require("http");
const crypto = require("crypto");

const WEEK = 7 * 24 * 3600;
const nowSec = () => Math.floor(Date.now() / 1000);
const b64u = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = (payload) =>
  `${b64u({ alg: "HS256", typ: "JWT" })}.${b64u(payload)}.${"x".repeat(43)}`;

// ---- PostgREST filter parsing ------------------------------------------------
const RESERVED = new Set(["select", "order", "limit", "offset", "on_conflict", "columns", "apikey"]);

function parseList(arg) {
  return arg.replace(/^\(|\)$/g, "").split(",").map((s) => s.replace(/^"|"$/g, ""));
}
function cmp(cell, arg) {
  if (typeof cell === "number") return cell - Number(arg);
  return String(cell) < arg ? -1 : String(cell) > arg ? 1 : 0;
}
function likeRe(arg, flags) {
  const esc = arg.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/[*%]/g, ".*");
  return new RegExp(`^${esc}$`, flags);
}
function matcher(key, raw) {
  let v = raw;
  let neg = false;
  if (v.startsWith("not.")) { neg = true; v = v.slice(4); }
  const dot = v.indexOf(".");
  if (dot < 0) return null;
  const op = v.slice(0, dot);
  const arg = v.slice(dot + 1);
  const test = (cell) => {
    switch (op) {
      case "eq": return String(cell) === arg;
      case "neq": return String(cell) !== arg;
      case "gt": return cell != null && cmp(cell, arg) > 0;
      case "gte": return cell != null && cmp(cell, arg) >= 0;
      case "lt": return cell != null && cmp(cell, arg) < 0;
      case "lte": return cell != null && cmp(cell, arg) <= 0;
      case "like": return cell != null && likeRe(arg, "").test(String(cell));
      case "ilike": return cell != null && likeRe(arg, "i").test(String(cell));
      case "in": return parseList(arg).includes(String(cell));
      case "cs": return Array.isArray(cell) && parseList(arg.replace(/^\{|\}$/g, "")).every((x) => cell.map(String).includes(x));
      case "is": return arg === "null" ? cell == null : Boolean(cell) === (arg === "true");
      default: return true;
    }
  };
  return (r) => (neg ? !test(r[key]) : test(r[key]));
}
// Split on commas that are not inside parentheses.
function splitTop(s) {
  const parts = []; let depth = 0; let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { parts.push(cur); cur = ""; } else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}
// or=(a.eq.1,and(b.gte.2,c.is.null)) / and=(...) -> row predicate
function groupMatcher(raw, mode) {
  const inner = raw.trim().replace(/^\(/, "").replace(/\)$/, "");
  const tests = splitTop(inner).map((item) => {
    const t = item.trim();
    const g = t.match(/^(and|or)\(([\s\S]*)\)$/);
    if (g) return groupMatcher(g[2], g[1]);
    const dot = t.indexOf(".");
    return matcher(t.slice(0, dot), t.slice(dot + 1)) || (() => true);
  });
  return (r) => (mode === "or" ? tests.some((t) => t(r)) : tests.every((t) => t(r)));
}
function applyFilters(rows, params) {
  let out = rows;
  for (const [key, raw] of params.entries()) {
    if (RESERVED.has(key) || key.includes(".")) continue; // "embed.order" etc. handled by embeds
    if (key === "or" || key === "and") { out = out.filter(groupMatcher(raw, key)); continue; }
    const m = matcher(key, raw);
    if (m) out = out.filter(m);
  }
  return out;
}
function applyOrder(rows, order) {
  if (!order) return rows;
  const specs = order.split(",").map((s) => {
    const bits = s.split(".");
    return { col: bits[0], desc: bits.includes("desc"), nullsFirst: bits.includes("nullsfirst") };
  });
  return [...rows].sort((a, b) => {
    for (const sp of specs) {
      const av = a[sp.col], bv = b[sp.col];
      if (av == null && bv == null) continue;
      if (av == null) return sp.nullsFirst ? -1 : 1;
      if (bv == null) return sp.nullsFirst ? 1 : -1;
      if (av < bv) return sp.desc ? 1 : -1;
      if (av > bv) return sp.desc ? -1 : 1;
    }
    return 0;
  });
}
// select parsing: flat columns (with "alias:col"), "*", and embedded relations
// like `customers(name)`, `alias:quote_line_items(*)`, `customers!inner(name)`.
function parseSelect(select) {
  const cols = []; const embeds = [];
  for (const part of splitTop(select || "*")) {
    const t = part.trim();
    if (!t) continue;
    const m = t.match(/^(?:(\w+):)?(\w+)((?:![\w]+)*)\s*\(([\s\S]*)\)$/);
    if (m) embeds.push({ alias: m[1] || m[2], name: m[2], inner: m[3].includes("!inner"), select: m[4] });
    else cols.push(t);
  }
  return { cols, embeds };
}
/** Relation helpers for the seed's `relations` map. */
const rel = {
  /** parent has many `table` rows whose `fk` points at parent.id */
  many: (table, fk) => ({ table, local: "id", foreign: fk, many: true }),
  /** parent.`fk` points at one row of `table` (its id) */
  one: (table, fk) => ({ table, local: fk, foreign: "id", many: false }),
};

// ---- engine --------------------------------------------------------------------
/**
 * @param {object} opts
 * @param {() => {users: Record<string, object>, tables: Record<string, object[]>}} opts.seed
 *   Called on start and on reset; must return FRESH objects each time.
 * @param {(table, rows, user, tables) => object[]} [opts.scope]  RLS-ish read/write filter;
 *   `user` is null for anonymous requests (anon key only).
 * @param {Record<string, (args, user, tables) => any>} [opts.rpc]  POST /rest/v1/rpc/<name>.
 * @param {Record<string, Record<string, object>>} [opts.relations]  { table: { embedName: rel.many()/rel.one() } }
 *   enabling PostgREST embeds like select=*,customers(name). Unknown embeds log once and resolve to null/[].
 * @param {number} [opts.port=54321]
 */
function createMockSupabase({ seed, scope = (_t, rows) => rows, rpc = {}, relations = {}, port = 54321 }) {
  let state = seed();
  const tokens = new Map(); // access/refresh token -> user
  const warned = new Set();

  // Session user by token; a bearer JWT whose payload says role=service_role
  // (the app's SUPABASE_SERVICE_ROLE_KEY) becomes a service user that bypasses
  // RLS-ish scoping in your seed (check `user.role === "service_role"`).
  const userFromReq = (req) => {
    const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (tokens.has(bearer)) return tokens.get(bearer);
    try {
      const payload = JSON.parse(Buffer.from(bearer.split(".")[1] || "", "base64url").toString());
      if (payload.role === "service_role") return { id: "service-role", role: "service_role", email: null };
    } catch { /* not a JWT */ }
    return null;
  };

  function shape(table, rows, selectStr, params, user, prefix = "") {
    const { cols, embeds } = parseSelect(selectStr);
    const whole = !selectStr || cols.includes("*");
    return rows.map((row) => {
      const out = whole ? { ...row } : {};
      if (!whole) {
        for (const c of cols) {
          const [alias, col] = c.includes(":") ? c.split(":") : [c, c];
          out[alias] = row[col];
        }
      }
      for (const e of embeds) {
        const def = relations[table]?.[e.name];
        if (!def) {
          if (!warned.has(`${table}.${e.name}`)) { warned.add(`${table}.${e.name}`); console.warn(`[mock] no relation '${table}.${e.name}' in seed.relations -> null/[]`); }
          out[e.alias] = null;
          continue;
        }
        let related = scope(def.table, state.tables[def.table] || [], user, state.tables)
          .filter((r) => r[def.foreign] === row[def.local]);
        const key = prefix + e.name;
        related = applyOrder(related, params.get(`${key}.order`));
        const lim = params.get(`${key}.limit`);
        if (lim) related = related.slice(0, parseInt(lim, 10));
        const shaped = shape(def.table, related, e.select, params, user, `${key}.`);
        out[e.alias] = def.many ? shaped : shaped[0] ?? null;
      }
      return out;
    });
  }

  function issueSession(user) {
    const access = jwt({
      sub: user.id, email: user.email, exp: nowSec() + WEEK, iat: nowSec(),
      role: "authenticated", aud: "authenticated", session_id: "mock",
    });
    const refresh = `mock-refresh-${crypto.randomUUID()}`;
    tokens.set(access, user);
    tokens.set(refresh, user);
    return {
      access_token: access, token_type: "bearer", expires_in: WEEK,
      expires_at: nowSec() + WEEK, refresh_token: refresh, user,
    };
  }

  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const send = (status, obj, headers = {}) => {
        res.writeHead(status, { "Content-Type": "application/json", ...headers });
        res.end(obj === undefined ? undefined : JSON.stringify(obj));
      };
      const u = new URL(req.url, "http://x");
      const path = u.pathname;
      for (const h of ["Allow-Origin", "Allow-Headers", "Allow-Methods", "Expose-Headers"]) {
        res.setHeader(`Access-Control-${h}`, "*");
      }
      if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
      let json = {};
      try { json = body ? JSON.parse(body) : {}; } catch { /* non-JSON body */ }

      // ---- dev control ----
      if (path === "/__reset" && req.method === "POST") {
        state = seed();
        return send(200, { ok: true });
      }

      // ---- auth ----
      if (path === "/auth/v1/token") {
        const grant = u.searchParams.get("grant_type");
        const user = grant === "refresh_token"
          ? tokens.get(json.refresh_token)
          : state.users[json.email];
        if (!user) return send(400, { error: "invalid_grant", error_description: "Invalid login credentials" });
        return send(200, issueSession(user));
      }
      if (path === "/auth/v1/user") {
        const user = userFromReq(req);
        return user ? send(200, user) : send(401, { message: "no session" });
      }
      if (path === "/auth/v1/logout") { res.writeHead(204); return res.end(); }

      // ---- rpc ----
      const rpcM = path.match(/^\/rest\/v1\/rpc\/([a-z_0-9]+)$/);
      if (rpcM) {
        const fn = rpc[rpcM[1]];
        if (!fn) return send(404, { code: "PGRST202", message: `mock: no rpc handler '${rpcM[1]}'` });
        try { return send(200, fn(json, userFromReq(req), state.tables) ?? null); }
        catch (e) { return send(400, { message: String(e.message || e) }); }
      }

      // ---- tables ----
      const m = path.match(/^\/rest\/v1\/([a-z_0-9]+)$/);
      if (!m) return send(404, { message: "not found: " + path });
      const table = m[1];
      const user = userFromReq(req); // null = anon (anon-key bearer): scope() decides what anon sees
      if (!state.tables[table]) {
        if (!warned.has(table)) { warned.add(table); console.warn(`[mock] unknown table '${table}' -> []`); }
        state.tables[table] = [];
      }
      const all = state.tables[table];
      const visible = scope(table, all, user, state.tables);
      const prefer = req.headers.prefer || "";
      const wantsObject = (req.headers.accept || "").includes("vnd.pgrst.object");
      const select = u.searchParams.get("select");
      const wantRows = prefer.includes("return=representation");

      const respondRows = (status, rows) => {
        const out = shape(table, rows, select, u.searchParams, user);
        if (wantsObject) {
          return out.length === 1
            ? send(status, out[0])
            : send(406, { code: "PGRST116", details: `Results contain ${out.length} rows`, hint: null, message: "JSON object requested, multiple (or no) rows returned" });
        }
        return send(status, out);
      };

      if (req.method === "GET" || req.method === "HEAD") {
        let filtered = applyFilters(visible, u.searchParams);
        for (const e of parseSelect(select).embeds.filter((x) => x.inner)) {
          const def = relations[table]?.[e.name];
          if (def) filtered = filtered.filter((p) => scope(def.table, state.tables[def.table] || [], user, state.tables).some((r) => r[def.foreign] === p[def.local]));
        }
        const total = filtered.length;
        let rows = applyOrder(filtered, u.searchParams.get("order"));
        const off = parseInt(u.searchParams.get("offset") || "0", 10);
        const lim = u.searchParams.get("limit");
        rows = rows.slice(off, lim ? off + parseInt(lim, 10) : undefined);
        const range = `${total ? off : "*"}-${total ? off + rows.length - 1 : "*"}/${total}`;
        if (req.method === "HEAD") { res.writeHead(200, { "Content-Range": range }); return res.end(); }
        res.setHeader("Content-Range", range);
        return respondRows(200, rows);
      }

      if (req.method === "POST") {
        const incoming = (Array.isArray(json) ? json : [json]).map((r) => ({
          id: crypto.randomUUID(), created_at: new Date().toISOString(), ...r,
        }));
        const upsert = prefer.includes("resolution=merge-duplicates");
        const written = incoming.map((row) => {
          const existing = upsert && all.find((r) => r.id === row.id);
          if (existing) return Object.assign(existing, row);
          all.push(row);
          return row;
        });
        return wantRows ? respondRows(201, written) : (res.writeHead(201), res.end());
      }

      if (req.method === "PATCH" || req.method === "DELETE") {
        const targets = applyFilters(visible, u.searchParams);
        if (req.method === "PATCH") {
          for (const r of targets) Object.assign(r, json, { updated_at: new Date().toISOString() });
        } else {
          state.tables[table] = all.filter((r) => !targets.includes(r));
        }
        return wantRows ? respondRows(200, targets) : (res.writeHead(204), res.end());
      }

      return send(405, { message: "method not allowed" });
    });
  });

  return {
    server,
    reset: () => { state = seed(); },
    start: () => new Promise((resolve) =>
      server.listen(port, () => { console.log(`mock supabase on :${port}`); resolve(); })),
  };
}

module.exports = { createMockSupabase, rel };
