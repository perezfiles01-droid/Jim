/* ===================================================================
   core.js
   Shared helpers and render components for the 2026.4 Reports
   Utilization suite.

   Every dashboard is written against these components rather than
   hand rolled markup. That is deliberate: there are ten dashboards
   in this spec, and the only way ten dashboards stay visually
   consistent is if they cannot each invent their own bar chart.

   All components return HTML strings. Nothing here touches the DOM
   except wirePager and wireSort, which are called after mount.
   =================================================================== */

const DASHBOARDS = {};

/* ---------- formatting ---------- */
const F = n => Number(Math.round(n)).toLocaleString();
const F1 = n => Number(n).toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:1});
const PCT = (a, b) => b ? (a / b * 100) : 0;
const PCTS = (a, b) => F1(PCT(a, b)) + "%";
/* Storage is held in GB throughout and printed in TB once it passes 1,024. */
const GB = g => g >= 1024 ? F1(g / 1024) + " TB" : F1(g) + " GB";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- feasibility tiers ----------
   The whole point of this suite is that a reader can tell, at a glance,
   whether a number can be produced from the tenant today or is waiting
   on something. Nine tiers, each tied to one concrete source.        */
const TIERS = {
  ready:     {label:"Ready today",     src:"public.Records in drm-npr"},
  scan:      {label:"Document scan",   src:"Microsoft Graph file scan"},
  usage:     {label:"Usage feed",      src:"M365 usage reports and Graph analytics"},
  mapping:   {label:"Site mapping",    src:"Site to department mapping list"},
  app:       {label:"App detection",   src:"EDRMS app inventory per site"},
  purview:   {label:"Purview",         src:"Purview labels and audit log"},
  opus:      {label:"Opus",            src:"Opus physical records inventory"},
  manual:    {label:"Reference list",  src:"Maintained reference list"},
  termstore: {label:"Term store",      src:"Managed metadata term store"}
};
const chip = t => `<span class="chip ${t}"><span class="dot"></span>${TIERS[t] ? TIERS[t].label : t}</span>`;

/* ---------- shell pieces ---------- */
function band(title, body){
  return `<div class="band"><h2>${title}</h2><div class="bd">${body}</div></div>`;
}

/* cards: [{lab, val, sub, tier, small}] */
function kpis(cards){
  return `<div class="kpis">` + cards.map(c => `
    <div class="kpi t-${c.tier}">
      <div class="lab">${c.lab}</div>
      <div class="val${c.small ? " sm" : ""}">${c.val}</div>
      ${c.sub ? `<div class="sub">${c.sub}</div>` : ""}
      <div class="kchip">${chip(c.tier)}</div>
    </div>`).join("") + `</div>`;
}

function panel(o){
  return `<div class="panel"${o.id ? ` id="${o.id}"` : ""}>
    <div class="phead">
      <div><div class="ptitle">${o.title}</div>${o.sub ? `<div class="psub">${o.sub}</div>` : ""}</div>
      ${o.tier ? chip(o.tier) : ""}
    </div>
    ${o.body}
  </div>`;
}

/* tiles: [{tl, tv, tn, cls}] */
function tiles(list){
  return `<div class="tiles">` + list.map(t => `
    <div class="tile${t.cls ? " " + t.cls : ""}">
      <div class="tl">${t.tl}</div>
      <div class="tv">${t.tv}</div>
      ${t.tn ? `<div class="tn">${t.tn}</div>` : ""}
    </div>`).join("") + `</div>`;
}

function note(html){ return `<div class="note">${html}</div>`; }
function callout(html){ return `<div class="callout">${html}</div>`; }

/* ---------- bar list ----------
   rows: [{label, sub, value, right}]   right overrides the printed value */
function barList(rows, o){
  o = o || {};
  const max = o.max || Math.max(1, ...rows.map(r => r.value));
  const color = o.color || "var(--blue)";
  const fmt = o.fmt || F;
  const total = rows.reduce((a, r) => a + r.value, 0);
  return rows.map(r => `
    <div class="bl${o.narrow ? " narrow" : ""}">
      <div class="blab"><b>${r.label}</b>${r.sub ? `<small>${r.sub}</small>` : ""}</div>
      <div class="btrack"><div class="bfill" style="width:${(r.value / max * 100).toFixed(1)}%;background:${r.color || color}"></div></div>
      <div class="bval">${r.right !== undefined ? r.right
        : `<b>${fmt(r.value)}</b>${o.showShare ? ` <span>${PCTS(r.value, total)}</span>` : ""}`}</div>
    </div>`).join("");
}

/* ---------- stacked bar list ----------
   rows: [{label, sub, a, b}] with a two part split */
function stackedList(rows, o){
  const max = o.max || Math.max(1, ...rows.map(r => r.a + r.b));
  const fmt = o.fmt || F;
  return rows.map(r => {
    const t = r.a + r.b;
    return `<div class="sb">
      <div class="slab"><b>${r.label}</b>${r.sub ? `<small>${r.sub}</small>` : ""}</div>
      <div class="strack">
        <div class="sseg" style="width:${(r.a / max * 100).toFixed(1)}%;background:${o.ca}"></div>
        <div class="sseg" style="width:${(r.b / max * 100).toFixed(1)}%;background:${o.cb}"></div>
      </div>
      <div class="sval"><b>${fmt(r.a)}</b> <span>/ ${fmt(r.b)}</span></div>
    </div>`;
  }).join("") + (o.hideTotal ? "" : "");
}

function legend(items){
  return `<div class="legend">` + items.map(i =>
    `<span class="lg"><span class="sw" style="background:${i.c}"></span>${i.l}</span>`).join("") + `</div>`;
}

/* ---------- donut ----------
   items: [{label, value, color}]. Drawn as stroked arcs on one circle so
   Power BI can reproduce it with its own native donut visual.          */
function donut(items, o){
  o = o || {};
  const total = items.reduce((a, i) => a + i.value, 0) || 1;
  const R = 54, C = 2 * Math.PI * R;
  let off = 0, arcs = "";
  items.forEach(i => {
    const len = i.value / total * C;
    arcs += `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${i.color}" stroke-width="26"
      stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"
      transform="rotate(-90 70 70)"><title>${esc(i.label)}: ${F(i.value)}</title></circle>`;
    off += len;
  });
  const fmt = o.fmt || F;
  return `<div class="dwrap">
    <svg viewBox="0 0 140 140" width="150" height="150" style="flex:none">
      ${arcs}
      <text x="70" y="66" text-anchor="middle" font-size="20" font-weight="700" fill="#10243E"
        style="font-variant-numeric:tabular-nums">${o.centre || fmt(total)}</text>
      <text x="70" y="84" text-anchor="middle" font-size="9.5" fill="#6B7A8C"
        letter-spacing=".08em">${(o.centreLabel || "TOTAL").toUpperCase()}</text>
    </svg>
    <div class="dleg">${items.map(i => `
      <div class="dlrow">
        <span class="sw" style="background:${i.color}"></span>
        <span class="dlab">${i.label}</span>
        <span class="dval">${fmt(i.value)}</span>
        <span class="dpct">${PCTS(i.value, total)}</span>
      </div>`).join("")}</div>
  </div>`;
}

/* ---------- column trend ----------
   points: [{x, y}] or [{x, y, y2}] for a two series comparison.
   Kept as plain columns because a Power BI clustered column chart is
   the native equivalent and reproduces exactly.                       */
function trend(points, o){
  o = o || {};
  const W = 900, H = o.height || 230, PAD = {l:52, r:10, t:14, b:30};
  const two = points.some(p => p.y2 !== undefined);
  const max = Math.max(1, ...points.map(p => Math.max(p.y, p.y2 || 0))) * 1.12;
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const step = iw / points.length;
  const bw = two ? Math.min(16, step * 0.32) : Math.min(30, step * 0.62);
  let g = "";
  /* gridlines and y axis */
  for (let i = 0; i <= 4; i++){
    const v = max / 4 * i, y = PAD.t + ih - (v / max * ih);
    g += `<line x1="${PAD.l}" y1="${y.toFixed(1)}" x2="${W - PAD.r}" y2="${y.toFixed(1)}" stroke="#E4EBF3"/>`;
    g += `<text x="${PAD.l - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#6B7A8C"
      style="font-variant-numeric:tabular-nums">${o.fmt ? o.fmt(v) : F(v)}</text>`;
  }
  points.forEach((p, i) => {
    const cx = PAD.l + step * i + step / 2;
    const draw = (val, colour, dx) => {
      const h = val / max * ih, x = cx + dx - bw / 2, y = PAD.t + ih - h;
      g += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, h).toFixed(1)}"
        rx="3" fill="${colour}"><title>${esc(p.x)}: ${o.fmt ? o.fmt(val) : F(val)}</title></rect>`;
    };
    if (two){ draw(p.y, o.c1 || "var(--blue)", -bw / 2 - 2); draw(p.y2, o.c2 || "var(--teal)", bw / 2 + 2); }
    else draw(p.y, p.color || o.c1 || "var(--blue)", 0);
    g += `<text x="${cx.toFixed(1)}" y="${H - 10}" text-anchor="middle" font-size="10" fill="#6B7A8C">${esc(p.x)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;max-height:${H + 20}px">${g}</svg>`;
}

/* ---------- treemap ----------
   Squarified layout, single hue shaded by value. Carried over from the
   previous suite unchanged so the two reports look like one family.  */
function squarify(items, x, y, w, h){
  const area = w * h, sum = items.reduce((a, b) => a + b.v, 0) || 1;
  let rem = items.map(it => ({...it, area: it.v / sum * area})), R = [], rx = x, ry = y, rw = w, rh = h;
  function worst(a, side){
    const s = a.reduce((p, q) => p + q, 0), mx = Math.max(...a), mn = Math.min(...a);
    return Math.max(side * side * mx / (s * s), (s * s) / (side * side * mn));
  }
  while (rem.length){
    const side = Math.min(rw, rh);
    let row = [rem[0]], wr = worst(row.map(z => z.area), side);
    while (row.length < rem.length){
      const t = row.concat([rem[row.length]]);
      const w3 = worst(t.map(z => z.area), side);
      if (w3 > wr) break;
      row = t; wr = w3;
    }
    const ra = row.reduce((a, b) => a + b.area, 0);
    if (rw >= rh){
      const cw = ra / rh; let cy = ry;
      row.forEach(z => { const ch = z.area / cw; R.push({...z, x:rx, y:cy, w:cw, h:ch}); cy += ch; });
      rx += cw; rw -= cw;
    } else {
      const rhh = ra / rw; let cx = rx;
      row.forEach(z => { const cwd = z.area / rhh; R.push({...z, x:cx, y:ry, w:cwd, h:rhh}); cx += cwd; });
      ry += rhh; rh -= rhh;
    }
    rem = rem.slice(row.length);
  }
  return R;
}
function shade(v, mn, mx){
  const t = mx > mn ? (v - mn) / (mx - mn) : 0.6;
  const L = [156, 195, 236], D = [8, 52, 90];
  const c = i => Math.round(L[i] + (D[i] - L[i]) * t);
  return `rgb(${c(0)},${c(1)},${c(2)})`;
}
/* items: [{label, name, v}] */
function treemap(items, o){
  o = o || {};
  const fmt = o.fmt || F;
  const mn = Math.min(...items.map(d => d.v)), mx = Math.max(...items.map(d => d.v));
  const rects = squarify(items.slice().sort((a, b) => b.v - a.v), 0, 0, 900, o.height || 400);
  let svg = "";
  rects.forEach(r => {
    const x = r.x + 3, y = r.y + 3, w = r.w - 6, h = r.h - 6;
    const t = (mx > mn ? (r.v - mn) / (mx - mn) : 0.6) < 0.42;
    const tc = t ? "#082F4E" : "#FFFFFF", sc = t ? "#2C567A" : "#DCEBFA";
    if (w < 4 || h < 4) return;
    svg += `<g><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"
      rx="7" fill="${shade(r.v, mn, mx)}"><title>${esc(r.name || r.label)}: ${fmt(r.v)}</title></rect>`;
    if (h > 34) svg += `<text x="${(x + 14).toFixed(1)}" y="${(y + 26).toFixed(1)}" font-size="15" font-weight="700" fill="${tc}">${esc(r.label)}</text>`;
    if (h > 58 && w > 110) svg += `<text x="${(x + 14).toFixed(1)}" y="${(y + 43).toFixed(1)}" font-size="11" fill="${sc}">${esc(r.name || "")}</text>`;
    if (h > 74) svg += `<text x="${(x + 14).toFixed(1)}" y="${(y + h - 14).toFixed(1)}" font-size="24" font-weight="700" fill="${tc}"
      style="font-variant-numeric:tabular-nums">${fmt(r.v)}</text>`;
    svg += `</g>`;
  });
  return `<svg viewBox="0 0 900 ${o.height || 400}" width="100%" style="display:block;max-height:${(o.height || 400) + 30}px">${svg}</svg>`;
}

/* ---------- table ----------
   cols: [{k, t, num, w, fmt, cell}]   rows: array of objects          */
function table(cols, rows, o){
  o = o || {};
  const head = cols.map(c =>
    `<th class="${c.num ? "num " : ""}${o.sortable ? "sortable " : ""}${o.sort === c.k ? "on" : ""}"
      ${o.sortable ? `data-sort="${c.k}"` : ""}>${c.t}${o.sort === c.k ? (o.dir === "asc" ? " ↑" : " ↓") : ""}</th>`).join("");
  const body = rows.map(r => `<tr>` + cols.map(c => {
    const v = c.cell ? c.cell(r) : (c.fmt ? c.fmt(r[c.k]) : r[c.k]);
    return `<td class="${c.num ? "num" : ""}">${v === undefined || v === null ? "" : v}</td>`;
  }).join("") + `</tr>`).join("");
  return `<div class="tscroll"><table class="tb"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/* ---------- pager ---------- */
const PAGE_SIZE = 10;
function pager(total, page, pages, noun){
  if (pages <= 1) return `<div class="pager"><div class="pinfo">Showing 1 to ${F(total)} of ${F(total)} ${noun}</div><div></div></div>`;
  const win = [];
  for (let p = 1; p <= pages; p++){ if (p === 1 || p === pages || Math.abs(p - page) <= 1) win.push(p); }
  let nums = "", last = 0;
  win.forEach(p => {
    if (last && p - last > 1) nums += `<span style="color:var(--mut)">...</span>`;
    nums += `<button class="${p === page ? "on" : ""}" data-pg="${p}">${p}</button>`;
    last = p;
  });
  const from = (page - 1) * PAGE_SIZE + 1, to = Math.min(total, page * PAGE_SIZE);
  return `<div class="pager"><div class="pinfo">Showing ${from} to ${to} of ${F(total)} ${noun}</div>
    <div class="pbtns"><button data-pg="prev" ${page === 1 ? "disabled" : ""}>&lsaquo; Prev</button>${nums}<button data-pg="next" ${page === pages ? "disabled" : ""}>Next &rsaquo;</button></div></div>`;
}
function wirePager(scope, onGo){
  document.querySelectorAll(scope + " .pager button[data-pg]").forEach(b => b.onclick = () => onGo(b.dataset.pg));
}
function wireSort(scope, onSort){
  document.querySelectorAll(scope + " th[data-sort]").forEach(t => t.onclick = () => onSort(t.dataset.sort));
}
function wireSeg(scope, onPick){
  document.querySelectorAll(scope + " button[data-seg]").forEach(b => b.onclick = () => onPick(b.dataset.seg));
}
function segctl(options, active){
  return `<div class="segctl">` + options.map(o =>
    `<button data-seg="${o.k}" class="${o.k === active ? "on" : ""}">${o.t}</button>`).join("") + `</div>`;
}

/* Sort an array of objects by key, returning a new array. */
function sortBy(rows, key, dir){
  return rows.slice().sort((a, b) => {
    const x = a[key], y = b[key];
    const c = (typeof x === "string") ? x.localeCompare(y) : (x - y);
    return dir === "asc" ? c : -c;
  });
}
