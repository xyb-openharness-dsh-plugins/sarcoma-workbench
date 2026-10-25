'use strict';
/* 小韧宝 SarcPal v0.2.0 · 软组织肉瘤患者工作台交互原型
   全部患者数据为模拟（demo/build-demo-data.mjs 生成）；不读写真实文件、不调用模型或宿主 API。
   三层信息边界：
     ①事实：值 / 日期 / 谁说的 / 报告原文 —— 可写；
     ②解释：指南原文 + 机构 + 版本 + 页码 —— 可写，页码不明就写「页码待核」；
     ③判断：好坏、稳定、进展、缓解、建议、预后、方案优劣、是否停药、是否转院 —— 一句都不生成。
   判断类统一出口：「这一句需要问你的医生」。
*/

const APP_INFO = { version: '0.2.0', build: '2026-10-25', channelLabel: '交互原型 · 未接入 DSH' };
const DEMO = window.DEMO;
const D = DEMO.profiles;

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const txt = (v, fallback = '—') => (v === null || v === undefined || v === '' ? fallback : String(v));
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => txt(d);
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const addDays = (d, n) => new Date(Date.parse(d) + n * 86400000).toISOString().slice(0, 10);

/* ---------------- 页面树（DIFF-MATRIX §二，12 一级 / 36 页签） ---------------- */
const PAGES = [
  ['dashboard', '看板', 'A/B/C 都要：今天能补哪一条'],
  ['tumor', '我的肿瘤', '亚型、部位、分期、分级四个词分开摆'],
  ['diagnosis', '确诊路径', '非计划切除之后，先把事实按日期排好'],
  ['surgery', '手术与伤口', '术式、切缘原文、伤口恢复各记各的'],
  ['treatment', '治疗与线序', '用过什么、第几周期、放疗起止'],
  ['tox', '副作用与不适', '只记你的原话与门诊记录原文'],
  ['function', '功能与康复', '日常动作自述与 TESS 原始作答'],
  ['labs', '化验与指标', '单点数值放回日期与来源'],
  ['followup', '复查与随访', '影像并列、指南原文、问题清单'],
  ['imaging', '影像与报告', '影像时间轴、报告原文、资料整理'],
  ['life', '生活与照护', '在哪看的、花了多少、怎么过'],
  ['trials', '临床研究', '线索不是推荐，登记状态未核实'],
];
const TABS = {
  dashboard: [],
  tumor: ['亚型与病理', '部位与大小', '分期与分级', '分子检测'],
  diagnosis: ['时间轴', '活检与病理会诊', '关键日期'],
  surgery: ['手术档案', '切缘记录', '伤口与恢复'],
  treatment: ['线序时间轴', '化疗周期', '放疗', '靶向与免疫'],
  tox: ['副作用记录', '同日化验', '该联系谁'],
  function: ['日常动作', 'TESS 自评', '康复记录'],
  labs: ['指标卡', '一图秀', '参考范围'],
  followup: ['影像时间轴', '随访节奏', '问题清单'],
  imaging: ['影像时间轴', '报告原文', '资料整理'],
  life: ['异地就医与资源', '花费', '情绪与照护者', '体重与日常'],
  trials: ['2026 线索', '篮子试验说明', '我记的试验'],
};

const SUBTITLES = {
  dashboard: '只回答三件事：资料放在哪、今天能补哪一条、下次复诊带什么。',
  tumor: '亚型、部位、分期、分级是四个不同的词：分开记录，不互推、不合并。',
  diagnosis: '只记日期、机构、报告原文；不评价当初的处置。',
  surgery: '切缘只抄原文；伤口只记你的描述与门诊记录原文。',
  treatment: '线序是事实，周期是日期；不判断方案优劣、不排下一次用药。',
  tox: '症状按日期记；与化验并置不并轴，不写因果句。',
  function: '日常动作是你自己的话；TESS 只存原始作答，不给总分、不画趋势。',
  labs: '一条序列一条尺；缺参考上限就写缺，不拿别的数顶替。',
  followup: '影像并列不连成曲线；指南原文照抄，不替你选档。',
  imaging: '报告原文只照抄；上传→解析候选→逐项核对→入库，四步分开。',
  life: '记机构、MDT、金额、情绪与体重；不给「该不该换医院」的答案。',
  trials: '登记状态不等于入组资格；本原型不内置未核实的登记条目。',
};

/* ---------------- 状态 ---------------- */
const state = {
  view: 'dashboard',
  profile: 'A',
  sub: {},
  sel: [],
  range: 'all',
  zoom: 100,
  pin: null,
  flipped: new Set(),
  font: 0,
  agentOpen: true,
  intake: { step: 1, decisions: {} },
  tess: { limb: '下肢', answers: [] },
  local: { A: { costs: [], contacts: [], trialNotes: [], questions: [], tessSaved: null }, B: { costs: [], contacts: [], trialNotes: [], questions: [], tessSaved: null } },
};
const P = () => D[state.profile];
const L = () => state.local[state.profile];
const M = () => Object.fromEntries(P().metrics.map((m) => [m.key, m]));
const metric = (k) => M()[k];

function resetProfileState() {
  state.view = 'dashboard';
  state.sub = {};
  // 默认 3 条数值线 + 1 条分类序列：文案与「最多 4 条」的选择器上限对齐。
  // 早先只取前 3 个 dash_keys，画出来全是数值线，与看板文案不符（P3 探针抓到）。
  const dk = (P().dash_keys || []).slice(0, 3);
  const firstQual = (P().metrics || []).find((m) => m.kind === 'qual');
  state.sel = firstQual ? dk.concat(firstQual.key) : dk;
  state.range = 'all';
  state.zoom = 100;
  state.pin = null;
  state.flipped = new Set();
  state.intake = { step: 1, decisions: {} };
  state.tess = { limb: '下肢', answers: [] };
}
state.sel = (() => {
  const dk = (D.A.dash_keys || []).slice(0, 3);
  const q = (D.A.metrics || []).find((m) => m.kind === 'qual');
  return q ? dk.concat(q.key) : dk;
})();

/* ---------------- 通用片段 ---------------- */
const pill = (t, c = '') => `<span class="pill ${c}">${esc(t)}</span>`;
const badgeUln = () => '<span class="badge">上限未提供 · ×ULN 不计算</span>';
const judgeLine = '<p class="help-box">这一句需要问你的医生。本台只整理事实，不生成判断。</p>';
const srcLine = (s) => (s ? `<button type="button" class="source-link" data-action="source" data-src="${esc(s)}">来源：${esc(s)}</button>` : '');
const section = (title, sub, body, right = '') => `<div class="section-title"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div>${right}</div>${body}`;
const emptyState = (h, p, actions = '') => `<div class="empty"><h3>${esc(h)}</h3><p>${esc(p)}</p>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
const rowHtml = (title, sub, side = '') => `<div class="row"><div class="row-main"><div><b>${title}</b>${sub ? `<p>${sub}</p>` : ''}</div></div>${side ? `<div class="side">${side}</div>` : ''}</div>`;
const recBtn = (type, id, title, sub, side = '') => `<button type="button" class="row-btn" data-record="${esc(type)}" data-id="${esc(id)}">${rowHtml(title, sub, side)}</button>`;

const DRUG_ULN = '获批状态未核实';
const drug = (name) => `${esc(name)} <span class="pill gold">${DRUG_ULN}</span>`;

function pageHead() {
  const page = PAGES.find((p) => p[0] === state.view);
  const tabs = TABS[state.view] || [];
  const cur = state.sub[state.view] || 0;
  return `<div class="page-head"><div><h1>${esc(page[1])}</h1><p>${esc(SUBTITLES[state.view])}</p></div></div>`
    + (tabs.length ? `<div class="subnav" role="tablist" aria-label="${esc(page[1])}页签">${tabs.map((t, i) => `<button type="button" role="tab" aria-selected="${cur === i}" data-sub="${i}">${esc(t)}</button>`).join('')}</div>` : '');
}

/* ---------------- 指标卡 ---------------- */
function sparkline(m, w = 200, h = 46) {
  const pts = (m.points || []).filter((p) => typeof p.v === 'number');
  if (pts.length === 1) {
    const y = h / 2 - 2;
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(m.name)}：只有 1 次记录，暂不连线">
      <path class="base" d="M4 ${h - 5}H${w - 4}"/><circle cx="${w / 2}" cy="${y}" r="3.2" fill="${m.color}"/>
      <text x="${w / 2}" y="${y + 17}" text-anchor="middle" font-size="10" fill="#94879F">只有 1 次记录，暂不连线</text></svg>`;
  }
  if (pts.length < 2) return '';
  const vs = pts.map((p) => p.v);
  let lo = Math.min(...vs);
  let hi = Math.max(...vs);
  if (hi === lo) { hi += 1; lo -= 1; }
  const X = (i) => 4 + (w - 8) * i / (pts.length - 1);
  const Y = (v) => h - 5 - (h - 10) * (v - lo) / (hi - lo);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join('');
  const dots = pts.map((p, i) => `<circle class="sp-dot" cx="${X(i).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="2.6" fill="${m.color}"/>`).join('');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path class="base" d="M4 ${h - 5}H${w - 4}"/><path class="sp-line" d="${path}" stroke="${m.color}"/>${dots}</svg>`;
}

function mcard(key, m) {
  const points = m.points || [];
  const last = points[points.length - 1];
  if (!last) return '';
  const isNum = typeof last.v === 'number';
  const cat = `<span class="cat"><i style="background:${m.color}"></i>${esc(m.cat)}</span>`;
  if (!isNum) {
    return `<div class="mcard" data-mcard="${esc(key)}" data-static="1" role="group" aria-roledescription="指标卡" aria-label="${esc(m.name)}：${esc(last.v)}（分类记录，只画节点，不连线）">
      <span class="mface front" data-face="front">${cat}<span class="name">${esc(m.name)}</span>
      <span class="na">${esc(last.v)}</span>
      <span class="meta"><span>${esc(last.d)} · ${esc(last.src)}</span><span class="hint">分类记录 · 不连线</span></span></span></div>`;
  }
  const band = m.band_high == null
    ? `<span class="badge">上限未提供 · ×ULN 不计算</span>`
    : `<span class="rec">参考 ${esc(m.band_low)}–${esc(m.band_high)} ${esc(m.unit)}</span>`;
  const bandLine = m.band_high == null
    ? `<span class="rec">参考下限 ${esc(m.band_low)} ${esc(m.unit)} · 上限未印在化验单上</span>`
    : band;
  const flip = state.flipped.has(key);
  return `<button type="button" class="mcard" data-mcard="${esc(key)}" data-flipped="${flip}" aria-pressed="${flip}" aria-roledescription="指标卡"
    aria-label="${esc(m.name)} 最近 ${last.v} ${esc(m.unit)}（${esc(last.d)}）；点一下翻面看迷你折线">
    <span class="mcard-inner">
      <span class="mface front" data-face="front" aria-hidden="${flip}">${cat}<span class="name">${esc(m.name)}</span>
        <span class="val">${esc(last.v)}<small>${esc(m.unit)}</small></span>
        <span class="delta">共 ${points.length} 次记录 · 最近 ${esc(last.d)}</span>
        ${bandLine}
        ${m.band_high == null ? badgeUln() : ''}
        <span class="rec">${esc(last.src)}</span></span>
      <span class="mface back" data-face="back" aria-hidden="${!flip}">${cat}<span class="name">${esc(m.name)}</span>
        <span class="count">${points.length} 次记录 · 迷你折线只画已记录的日期</span>
        ${sparkline(m)}
        <span class="meta"><span>${esc(m.note)}</span><span class="hint">轻点翻回</span></span></span>
    </span></button>`;
}

function metricGrid(keys) {
  const mm = M();
  return `<div class="metric-grid">${keys.filter((k) => mm[k]).map((k) => mcard(k, mm[k])).join('')}</div>`;
}

/* ---------------- 一图秀引擎 ---------------- */
const CW = 980, CH = 430, CX0 = 58, CX1 = 952, CY0 = 132, CY1 = 360, CATY = 100;
const shortDate = (d) => d.slice(5).replace('-', '.');
const numPts = (m) => (m.points || []).filter((p) => typeof p.v === 'number');

/* Fritsch-Carlson 单调三次 Hermite（不是普通 Catmull-Rom）：
   间隔不均时不会过冲出尖角，曲线段不越过相邻点的 y 范围。 */
function smoothPath(coords) {
  const n = coords.length;
  if (!n) return '';
  if (n === 1) return `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  const dx = [], slope = [];
  for (let i = 0; i < n - 1; i++) {
    const ddx = coords[i + 1].x - coords[i].x;
    dx.push(ddx);
    slope.push(ddx ? (coords[i + 1].y - coords[i].y) / ddx : 0);
  }
  const tan = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) tan.push(0);
    else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      tan.push((w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]));
    }
  }
  tan.push(slope[n - 2]);
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = coords[i].x + dx[i] / 3, c1y = coords[i].y + tan[i] * dx[i] / 3;
    const c2x = coords[i + 1].x - dx[i] / 3, c2y = coords[i + 1].y - tan[i + 1] * dx[i] / 3;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${coords[i + 1].x.toFixed(1)} ${coords[i + 1].y.toFixed(1)}`;
  }
  return d;
}

function dataBounds() {
  const ds = [];
  for (const m of P().metrics) for (const p of m.points) ds.push(p.d);
  for (const e of P().events) ds.push(e.d);
  ds.sort();
  return [Date.parse(ds[0]), Date.parse(ds[ds.length - 1])];
}
function domain() {
  const [s, e] = dataBounds();
  const months = { '3m': 3, '6m': 6 }[state.range];
  const start = months ? new Date(new Date(e).setMonth(new Date(e).getMonth() - months)) : new Date(s);
  const span = e - start.getTime();
  return [e - span * state.zoom / 100, e];
}
const xOf = (t, t0, t1) => CX0 + (t - t0) / Math.max(1, t1 - t0) * (CX1 - CX0);
function monthTicks(t0, t1) {
  const out = [];
  const d = new Date(t0);
  let cur = new Date(d.getFullYear(), d.getMonth(), 1);
  if (cur.getTime() < t0) cur.setMonth(cur.getMonth() + 1);
  while (cur.getTime() <= t1) {
    const x = xOf(cur.getTime(), t0, t1);
    if (x > CX0 + 8 && x < CX1 - 8) out.push({ x, label: `${cur.getMonth() + 1}月` });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return out.length > 7 ? out.filter((_, i) => i % 2 === 0) : out;
}

function chartSVG(t0, t1, codes) {
  const list = (codes || state.sel).map((k) => metric(k)).filter(Boolean);
  const numeric = list.filter((m) => m.kind === 'numeric' && numPts(m).length);
  const quals = list.filter((m) => m.kind === 'qual');
  if (!numeric.length && !quals.length) {
    return emptyState('这个时间窗里没有所选指标', '换一段时间范围，或在左侧加选一个指标。');
  }
  const grid = [0, 1, 2, 3, 4].map((i) => {
    const y = CY0 + i * (CY1 - CY0) / 4;
    return `<line class="grid" x1="${CX0}" x2="${CX1}" y1="${y}" y2="${y}"/>`;
  }).join('');
  const ticks = monthTicks(t0, t1).map((t) => `<line class="axis" x1="${t.x.toFixed(1)}" x2="${t.x.toFixed(1)}" y1="${CY1}" y2="${CY1 + 5}"/><text class="tick" x="${t.x.toFixed(1)}" y="${CY1 + 18}" text-anchor="middle">${t.label}</text>`).join('');

  /* 事件：菱形在评估行；竖虚线上端止于 CY0-10，下到数据区底。 */
  const events = P().events.filter((e) => { const t = Date.parse(e.d); return t >= t0 && t <= t1; });
  const marks = events.map((e, i) => {
    const x = xOf(Date.parse(e.d), t0, t1);
    const row = 60 + (i % 2) * 15;
    return `<g><path d="M ${x.toFixed(1)} ${row - 4} l4 4 -4 4 -4 -4 Z" fill="${i % 2 ? '#A9761F' : '#7B4C9A'}"/>
      <text x="${(x + 7).toFixed(1)}" y="${(row + 3.5).toFixed(1)}" font-size="9" fill="#6F5B7D">${esc(e.label)}</text></g>`;
  }).join('');
  const eventLines = events.map((e, i) => {
    const x = xOf(Date.parse(e.d), t0, t1);
    return `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${CY0 - 10}" y2="${CY1}" stroke="${i % 2 ? '#A9761F' : '#7B4C9A'}" stroke-width="1.1" stroke-dasharray="3 6" opacity=".38"/>`;
  }).join('');

  /* 分类序列：只画节点，不连线。节点固定在同一行，值标在节点旁。 */
  const catLane = quaisLane(quals, t0, t1);

  const series = numeric.map((m) => {
    const all = numPts(m).map((p) => p.v);
    const lo = Math.min(...all), hi = Math.max(...all);
    const span = hi - lo || Math.max(Math.abs(hi) * 0.08, 1);
    const pts = numPts(m).filter((p) => { const t = Date.parse(p.d); return t >= t0 && t <= t1; });
    return { m, lo, span, pts };
  }).filter((s) => s.pts.length);
  const yOf = (s, v) => CY1 - (v - s.lo) / s.span * (CY1 - CY0);

  const lastPos = series.map((s) => {
    const c = s.pts.map((p) => ({ x: xOf(Date.parse(p.d), t0, t1), y: yOf(s, p.v) }));
    const last = c[c.length - 1];
    return { s, x: last.x, y: last.y, v: s.pts[s.pts.length - 1].v };
  }).sort((a, b) => a.y - b.y);
  let cursor = -Infinity;
  for (const it of lastPos) { it.ly = Math.max(it.y, cursor + 13); cursor = it.ly; }
  const overflow = lastPos.length ? Math.max(0, lastPos[lastPos.length - 1].ly - (CY1 + 2)) : 0;
  if (overflow) for (const it of lastPos) it.ly -= overflow;

  const lines = series.map((s) => {
    const coords = s.pts.map((p) => ({ x: xOf(Date.parse(p.d), t0, t1), y: yOf(s, p.v) }));
    const path = s.pts.length > 1 ? `<path class="line" d="${smoothPath(coords)}" stroke="${s.m.color}"/>` : '';
    const points = coords.map((c, i) => {
      const p = s.pts[i];
      const active = state.pin && state.pin.code === s.m.key && state.pin.date === p.d;
      const r = i === s.pts.length - 1 ? 5.2 : (i === 0 ? 4.6 : 4);
      return `<circle class="pt" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}" fill="${s.m.color}" data-pin-code="${s.m.key}" data-pin-date="${esc(p.d)}" ${active ? 'data-active="1"' : ''}/>`;
    }).join('');
    const lp = lastPos.find((x) => x.s === s);
    const nearRight = lp.x > CX1 - 46;
    const lx = nearRight ? lp.x - 8 : lp.x + 8;
    const label = `<text class="delta-tag" x="${lx.toFixed(1)}" y="${(lp.ly + 4).toFixed(1)}" text-anchor="${nearRight ? 'end' : 'start'}" fill="${s.m.color}">${esc(lp.v)}</text>`;
    const single = s.pts.length === 1
      ? `<text x="${(nearRight ? lp.x - 9 : lp.x + 9).toFixed(1)}" y="${(lp.ly + 20).toFixed(1)}" text-anchor="${nearRight ? 'end' : 'start'}" font-size="9" fill="#94879F">只有 1 次记录，暂不连线</text>` : '';
    return `<g>${path}${points}${label}${single}</g>`;
  }).join('');

  return `<svg class="chart" viewBox="0 0 ${CW} ${CH}" role="img" aria-label="所选指标的时序图，${series.length} 条数值序列">
    ${grid}${ticks}${eventLines}${marks}${catLane}${lines}
    <text class="tick" x="${CX0}" y="${CY1 + 36}">每条数值序列按自身全部记录的最小值–最大值归一化，不代表数值可比</text>
  </svg>`;
}

function quaisLane(quals, t0, t1) {
  if (!quals.length) return '';
  const q = quals[0];
  const pts = q.points.filter((p) => { const t = Date.parse(p.d); return t >= t0 && t <= t1; });
  if (!pts.length) return '';
  const nodes = pts.map((p, i) => {
    const x = xOf(Date.parse(p.d), t0, t1);
    const anchor = x > CX1 - 70 ? 'end' : 'start';
    const dx = x > CX1 - 70 ? -7 : 7;
    return `<g><rect class="cat-node" x="${(x - 3.4).toFixed(1)}" y="${CATY - 3.4}" width="6.8" height="6.8" rx="1.6" fill="${q.color}"/>
      <text class="cat-label" x="${(x + dx).toFixed(1)}" y="${(CATY + 3.4 + (i % 2) * 10).toFixed(1)}" text-anchor="${anchor}" fill="${q.color}">${esc(p.v)}</text></g>`;
  }).join('');
  return `<text x="6" y="${CATY + 3.5}" font-size="9" fill="#94879F">分类</text>${nodes}
    <text x="${CX1}" y="${CATY - 12}" text-anchor="end" font-size="9" fill="#94879F">${esc(q.name)} · 只画节点不连线</text>`;
}

function legendHtml(codes) {
  const list = (codes || state.sel).map((k) => metric(k)).filter(Boolean);
  return `<div class="legend">${list.map((m) => `<span><i style="background:${m.color}"></i><b>${esc(m.name)}</b><span class="range">${m.kind === 'qual' ? '分类 · 节点' : `${esc(m.unit || '')}${m.band_high == null ? ' · 上限未提供' : ''}`}</span></span>`).join('')}</div>`;
}

function pinHtml() {
  if (!state.pin) return '<p class="small-note">点图上的圆点，能把那一行数值、日期、来源并排看一次。</p>';
  const m = metric(state.pin.code);
  const p = m && (m.points || []).find((x) => x.d === state.pin.date);
  if (!p) return '';
  const ref = typeof p.v === 'number'
    ? (p.ref_high == null ? '这张化验单未印参考上限（×ULN 不计算）' : `该化验单参考 ${p.ref_low}–${p.ref_high} ${m.unit}`)
    : '分类记录，只画节点';
  return `<div class="pin"><div><b>${esc(m.name)} · ${esc(p.v)} ${esc(m.unit)}</b><p>${esc(p.d)} · ${esc(p.src)} · ${esc(ref)}</p></div><span class="pill line">${esc(m.cat)}</span></div>`;
}

/* ---------------- 各一级页 ---------------- */
function vDashboard() {
  const p = P();
  const imgs = p.imaging;
  const lastImg = imgs[imgs.length - 1];
  const lastVisit = [lastImg && lastImg.d, ...p.questions.map((q) => q.d)].filter(Boolean).sort().slice(-1)[0];
  const today = p.window_end;
  const stageTxt = p.staging.length ? txt(p.staging[0].tnm) : '未回报';
  const tasks = [
    ['tumor', 2, '补一次分期记录', '本档案的分期行：' + (p.staging.length ? '已记录 1 行' : '未回报'), '①'],
    ['labs', 1, '看一眼一图秀', '默认 3 条数值线 + 1 条分类序列', '②'],
    ['followup', 2, '带问题清单去复诊', `已记 ${p.questions.length} 条，问过 ${p.questions.filter((q) => q.asked).length} 条`, '③'],
    ['imaging', 2, '整理一份报告', '上传 → 解析候选 → 逐项核对 → 入库', '④'],
  ];
  const recent = [
    ...p.imaging.map((r, i) => ({ d: r.d, t: `${r.method} · ${r.region}`, s: r.conclusion, type: 'imaging', id: String(i) })),
    ...p.surgery.map((r, i) => ({ d: r.d, t: r.kind, s: r.institution, type: 'surgery', id: String(i) })),
    ...p.tox.map((r, i) => ({ d: r.d, t: r.symptom, s: txt(r.ctcae_text), type: 'symptom', id: String(i) })),
  ].sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 5);

  return `${pageHead()}
  <section class="hero">
    <div><span class="eyebrow">今日一页 · ${esc(p.name)}</span>
      <h1>${esc(p.headline)}</h1>
      <p>${esc(p.mindset)}</p>
      <div class="chips" style="margin-top:10px">${p.path.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>
      <div class="actions"><button type="button" class="primary" data-view="diagnosis">打开确诊路径</button><button type="button" data-view="labs" data-sub="1">看一图秀</button></div>
    </div>
    <div class="hero-mark" aria-hidden="true">韧</div>
  </section>
  <div class="intent"><i>i</i><div><b>这一页不判断病情。</b>只把「已记录的事实」摆出来：最近一次复查、当前方案、还有哪些位置是空的。</div></div>
  <div class="task-grid">${tasks.map(([v, s, t, d, n]) => `<button type="button" class="task-entry" data-view="${v}" data-sub="${s}"><span class="entry-icon">${n}</span><b>${esc(t)}</b><span>${esc(d)}</span><span class="arrow">→</span></button>`).join('')}</div>
  <div class="dash-cols">
    <div class="stack">
      ${section('指标卡 · 最近一次', '点整张卡翻面看迷你折线；单点不连线', metricGrid(p.dash_keys))}
      ${section('最近记录', '按日期倒序；点一条进整页详情', `<div class="mini-list">${recent.map((r) => `<button type="button" class="row-btn" data-record="${r.type}" data-id="${r.id}"><div class="mini-item"><div><b>${esc(r.t)}</b><p>${esc(r.s)}</p></div><span>${esc(r.d)}</span></div></button>`).join('')}</div>`)}
    </div>
    <div class="stack">
      <div class="card"><div class="card-head"><div><h2>今天能对上的数</h2><p>全部由本档案已记录的日期直接相减</p></div></div>
        <div class="mini-list">
          <div class="mini-item"><div><b>距最近一次复查</b><p>${esc(lastVisit)} → ${esc(today)}</p></div><span class="num">${daysBetween(lastVisit, today)} 天</span></div>
          <div class="mini-item"><div><b>影像记录</b><p>CT / MRI 并列，不连成曲线</p></div><span class="num">${imgs.length} 条</span></div>
          <div class="mini-item"><div><b>问题清单</b><p>产品只整理，不生成答案</p></div><span class="num">${p.questions.length} 条</span></div>
          <div class="mini-item"><div><b>TESS 作答</b><p>只存原始作答，不给总分</p></div><span class="num">${p.tess.length ? `${p.tess[0].answers.length} 题` : '未记录'}</span></div>
        </div>
      </div>
      <div class="card"><div class="card-head"><div><h2>档案位置</h2><p>事实层四个词分开摆</p></div></div>
        <div class="mini-list">
          <div class="mini-item"><div><b>亚型</b><p>${esc(txt(p.pathology[p.pathology.length - 1].subtype))}</p></div><span>病理</span></div>
          <div class="mini-item"><div><b>分期</b><p>${esc(p.staging.length ? p.staging[0].note : '本档案没有分期记录行，界面显示「未回报」')}</p></div><span>${esc(stageTxt)}</span></div>
          <div class="mini-item"><div><b>分级</b><p>FNCLCC 三组件</p></div><span>${esc(p.grade.length ? p.grade[0].grade : '—')}</span></div>
          <div class="mini-item"><div><b>部位</b><p>${esc(p.site[p.site.length - 1].size_text)}</p></div><span>${esc(p.site[p.site.length - 1].site)}</span></div>
        </div>
      </div>
    </div>
  </div>`;
}

/* 我的肿瘤 */
function vTumor() {
  const p = P();
  const s = state.sub.tumor || 0;
  if (s === 0) {
    return `${pageHead()}<div class="notice">WHO 第 5 版（2020）列出 50 余种恶性亚型；病理报告原文怎么写就怎么记，不翻译成通俗名，也不由本台推断亚型。<br>来源：WHO Classification of Tumours, 5th ed. vol.3（2020）；NCCN STS V3.2026 ST-1~ST-3。</div>
      <div class="card">${p.pathology.map((r, i) => recBtn('pathology', i, esc(r.subtype), `${esc(r.d)} · ${esc(r.institution)} · ${esc(r.consult)}`, pill('报告原文', 'line'))).join('')}</div>
      ${judgeLine}`;
  }
  if (s === 1) {
    return `${pageHead()}<div class="notice plain">部位只记报告原文。AJCC 第 8 版已把「深度」从分期字段里删除，但影像与病理仍会描述深度，所以这里照抄。</div>
      <div class="card">${p.site.map((r, i) => recBtn('site', i, esc(r.site), `${esc(r.d)} · ${esc(r.size_text)} · ${esc(r.depth)}`, pill('影像/病理原文', 'line'))).join('')}</div>
      ${judgeLine}`;
  }
  if (s === 2) {
    const stageBlock = p.staging.length
      ? `<div class="card"><div class="card-head"><div><h2>分期（AJCC 第 8 版）</h2><p>报告原文照抄；分期组由医生判定，本台不合并计算</p></div>${pill('已记录', 'green')}</div>
          ${p.staging.map((r, i) => recBtn('staging', i, esc(r.tnm), `${esc(r.d)} · ${esc(r.system)} · ${esc(r.source)}`, '')).join('')}
          <p class="table-note">${esc(p.staging[0].note)}</p></div>`
      : `<div class="card"><div class="card-head"><div><h2>分期（AJCC 第 8 版）</h2><p>这个档案没有分期记录行</p></div>${pill('未回报', 'grey')}</div>
          <div class="empty"><h3>未回报</h3><p>本档案没有分期记录行。本台不补期别、不推算分期组；这一格保持空。</p><p style="margin-top:6px">分期报告出来以后，可以按报告原文补一行「TNM + 系统 + 报告日期 + 报告机构」。</p></div></div>`;
    return `${pageHead()}${stageBlock}
      <div class="notice">头颈、胸腹腔内脏、眼眶的软组织肉瘤在 AJCC 第 8 版里未定义分期组（NCCN STS V3.2026 ST-5：needs data collection before defining a stage grouping）。遇到这些部位，界面只写「该部位 AJCC 8 未定义分期组」，不补期别。</div>
      <div class="card"><div class="card-head"><div><h2>${esc(p.titles.grade)}</h2><p>FNCLCC 三组件：分化 1–3 + 核分裂 1–3 + 坏死 0–2 = 2–8 分；G1 2–3 / G2 4–5 / G3 6–8</p></div>${pill('与分期分开存', 'line')}</div>
        ${p.grade.map((r, i) => recBtn('grade', i, `分级 ${esc(r.grade)}`, `${esc(r.d)} · ${esc(r.components)} · ${esc(r.institution)}`, '')).join('')}
      </div>
      <div class="notice warn"><b>三个词不互推：</b>FNCLCC 分级 ≠ TNM 分期 ≠ 病理亚型。分级是分期的输入变量之一，但「由 G 和 T/N/M 得到几期」是医生的判断；本台只并列，不计算。</div>
      ${judgeLine}`;
  }
  return `${pageHead()}<div class="notice plain">只记「做了哪些检测、报告原文怎么写」。哪些亚型该查什么、结果意味着什么，属解释与判断两层，本原型不生成。NCCN SARC-C 原文本轮未提取，故不写「必查/可选」的分层。</div>
    <div class="card">${p.molecular.map((r, i) => recBtn('molecular', i, esc(r.item), `${esc(r.d)} · ${esc(r.institution)}`, pill(esc(r.result), r.result === '未做' ? 'grey' : 'line'))).join('')}</div>
    ${judgeLine}`;
}

/* 确诊路径 */
function vDiagnosis() {
  const p = P();
  const s = state.sub.diagnosis || 0;
  if (s === 0) {
    return `${pageHead()}<div class="notice violet">只记事实与日期：发现、就诊、影像、活检、切除、病理回报、会诊、转诊。<b>不评价当初的处置是否规范。</b></div>
      <div class="card">${p.diagnosis.map((r, i) => `<button type="button" class="row-btn" data-record="diagnosis" data-id="${i}"><div class="row"><div class="row-main"><div><b>${esc(r.d)} · ${esc(r.kind)}</b><p>${esc(r.detail)}</p><p>${esc(r.institution)}</p></div></div><div class="side">${pill(esc(r.kind), 'line')}</div></div></button>`).join('')}</div>
      ${judgeLine}`;
  }
  if (s === 1) {
    return `${pageHead()}<div class="card"><div class="card-head"><div><h2>活检与病理会诊</h2><p>只记：送了哪家会诊、结论原文怎么写</p></div></div>
      ${p.pathology.map((r, i) => recBtn('pathology', i, esc(r.subtype), `${esc(r.d)} · ${esc(r.institution)} · 会诊：${esc(r.consult)}`, '')).join('')}</div>
      <div class="notice">WHO 第 5 版（2020）有 50 余种恶性亚型，诊断依赖形态、免疫组化与分子检测（NCCN STS V3.2026 SARC-B / SARC-C 专章）。会诊是常规流程。<br>这句是解释层；「你的亚型是凶是缓」不写，也不能写。</div>
      ${judgeLine}`;
  }
  const dates = p.diagnosis.map((r) => ({ ...r }));
  const kinds = ['发现肿块', '首次就诊', '影像', '活检', '切除', '病理回报', '会诊', '转诊'];
  return `${pageHead()}<div class="card"><div class="card-head"><div><h2>关键日期</h2><p>有就写日期，没有就留「尚未记录」——不留推测值</p></div></div>
    <div class="table-wrap"><table><thead><tr><th>环节</th><th>日期</th><th>机构</th><th>记录</th></tr></thead><tbody>
    ${kinds.map((k) => {
      const rows = dates.filter((r) => r.kind === k);
      if (!rows.length) return `<tr><td><b>${esc(k)}</b></td><td class="num">尚未记录</td><td>—</td><td>—</td></tr>`;
      return rows.map((r) => `<tr><td><b>${esc(k)}</b></td><td class="num">${esc(r.d)}</td><td>${esc(r.institution)}</td><td>${esc(r.detail)}</td></tr>`).join('');
    }).join('')}
    </tbody></table></div><p class="table-note">日期之间不计算「延误」，也不与前一家机构的处置做比较。</p></div>${judgeLine}`;
}

/* 手术与伤口 */
function vSurgery() {
  const p = P();
  const s = state.sub.surgery || 0;
  if (s === 0) {
    return `${pageHead()}<div class="actions" style="margin-bottom:12px"><button type="button" class="primary" data-pv="surgery">打开手术档案（整页表单）</button></div>
      <div class="card">${p.surgery.map((r, i) => recBtn('surgery', i, esc(r.kind), `${esc(r.d)} · ${esc(r.institution)} · ${esc(r.extent)}`, pill('术式原文', 'line'))).join('')}</div>
      <div class="notice plain">字段结构在整页表单里演示：日期、术式、机构、切除范围、重建、术前/术后诊断、切缘原文、伤口情况、麻醉、时长、出血量、备注。</div>`;
  }
  if (s === 1) {
    return `${pageHead()}<div class="actions" style="margin-bottom:12px"><button type="button" class="primary" data-pv="margin">打开切缘记录（整页）</button></div>
      <div class="card">${p.margin.map((r, i) => recBtn('margin', i, esc(r.margin_text), `${esc(r.d)} · 关联手术 ${esc(r.surgery_ref)} · ${esc(r.src)}`, pill('原文', 'line'))).join('')}</div>
      <div class="notice warn"><b>切缘只抄原文。</b>R0 / R1 / R2 的定义（CSCO 肢体软组织肉瘤共识原文）：R0 显微镜下无肿瘤残留；R1 显微镜下肿瘤残留；R2 肉眼肿瘤残留。定义可写；这组字母意味着什么，属于判断，不写。</div>${judgeLine}`;
  }
  return `${pageHead()}<div class="actions" style="margin-bottom:12px"><button type="button" class="primary" data-pv="wound">打开伤口与恢复（整页）</button></div>
    <div class="card">${p.wound.map((r, i) => recBtn('wound', i, esc(r.text), `${esc(r.d)} · ${esc(r.care)}`, '')).join('')}</div>
    <div class="notice">伤口记录是你自己的话，不是并发症诊断。渗液、发红、裂口都按日期记；怎么处理以门诊记录为准。</div>`;
}

/* 治疗与线序 */
function vTreatment() {
  const p = P();
  const s = state.sub.treatment || 0;
  if (s === 0) {
    return `${pageHead()}<div class="actions" style="margin-bottom:12px"><button type="button" class="primary" data-pv="timeline">打开线序全景（整页）</button></div>
      <div class="card">${p.lines.map((r, i) => recBtn('line', i, esc(r.name), `${esc(r.start)}${r.end ? ' → ' + esc(r.end) : ' → 未记结束'} · ${esc(r.detail)}`, pill(esc(r.status), r.status === '进行中' ? 'green' : 'grey'))).join('')}</div>
      <div class="notice plain">线序是事实：方案名、起止日期、记录出处。换线原因只抄医嘱原文。<b>不比较方案优劣、不排下一线。</b></div>`;
  }
  if (s === 1) {
    return `${pageHead()}${p.cycles.length ? `<div class="card"><div class="table-wrap"><table class="cycle-table"><thead><tr><th>周期</th><th>日期</th><th>用药</th><th>状态</th></tr></thead><tbody>
      ${p.cycles.map((c, i) => `<tr class="${c.done ? 'done' : 'next'}"><td><b>${esc(c.name)}</b></td><td class="num">${esc(c.date)}</td><td>${esc(c.drugs)}</td><td>${pill(esc(c.status), c.done ? 'grey' : 'line')}</td></tr>`).join('')}
      </tbody></table></div><p class="table-note">周期按医嘱日期记；「第几个周期」以你的用药记录为准，不由本台推算。</p></div>` : emptyState('这个档案没有化疗周期记录', '本档案走的是手术 + 放疗路径；化疗周期表保持空。')}`;
  }
  if (s === 2) {
    return `${pageHead()}${p.rt.length ? `<div class="card">${p.rt.map((r, i) => recBtn('rt', i, `放疗 ${esc(r.start)} → ${esc(r.end)}`, `${esc(r.site)} · ${esc(r.timing)} · ${esc(r.note)}`, pill('放疗记录', 'line'))).join('')}</div>` : emptyState('这个档案没有放疗记录', '本档案没有 rt_rows；不补、不推测是否做过。')}
      <div class="notice">放疗是局部治疗的一种。术前还是术后、剂量与靶区怎么定，都是医生的判断；本台只记起止日期、部位与病历原文。</div>`;
  }
  const targets = p.lines.filter((l) => /靶向|安罗|免疫|单抗|替尼/.test(l.name + l.detail));
  return `${pageHead()}${targets.length ? `<div class="card">${targets.map((r, i) => recBtn('line', p.lines.indexOf(r), esc(r.name), `${esc(r.start)} → ${esc(r.end || '未记结束')} · ${esc(r.detail)}`, drug(r.name.replace(/（.*?）/g, '')) )).join('')}</div>` : emptyState('这个档案没有口服靶向或免疫治疗记录', '本档案没有对应线序行；药名与获批状态都不凭空补。')}
    <div class="notice warn"><b>药名后的「${DRUG_ULN}」：</b>本原型没有接入 NMPA 数据库，任何药名都不在界面里断言获批状态。真实版本须逐药核对说明书。<br>示例：他泽司他（Tazemetostat）在中国大陆 2025-03-18 获批的适应症是 EZH2 突变阳性复发/难治性滤泡性淋巴瘤；<b>上皮样肉瘤适应症在中国大陆未获批</b>（NMPA 2025；海南博鳌乐城临床急需进口通道另计）。</div>${judgeLine}`;
}

/* 副作用与不适 */
function vTox() {
  const p = P();
  const s = state.sub.tox || 0;
  if (s === 0) {
    return `${pageHead()}<div class="card">${p.tox.map((r, i) => recBtn('symptom', i, esc(r.symptom), `${esc(r.d)} · ${esc(r.ctcae_text)} · ${esc(r.note)}`, '')).join('')}</div>
      <div class="notice">只记你的原话与门诊记录原文（CTCAE 字样照抄）。<b>不生成「因为某药所以某症状」这类因果句。</b></div>${judgeLine}`;
  }
  if (s === 1) {
    const rows = p.tox.map((r, i) => {
      const labs = [];
      for (const m of p.metrics) for (const pt of m.points) if (pt.d === r.d) labs.push({ m, pt });
      return `<div class="card" style="margin-bottom:10px"><div class="card-head"><div><h2>${esc(r.d)} · ${esc(r.symptom)}</h2><p>${esc(txt(r.ctcae_text))}</p></div><button type="button" class="text-button" data-record="symptom" data-id="${i}">看记录 →</button></div>
        ${labs.length ? `<div class="mini-list">${labs.map(({ m, pt }) => `<div class="mini-item"><div><b>${esc(m.name)} ${esc(pt.v)} ${esc(m.unit)}</b><p>${esc(pt.src)}${pt.ref_high == null ? ' · 上限未提供' : ''}</p></div><span>${esc(pt.d)}</span></div>`).join('')}</div>` : '<p class="table-note">这一天没有同日化验记录。并置不并轴：不同日期的数值不插值到症状上。</p>'}
      </div>`;
    }).join('');
    return `${pageHead()}<div class="notice plain">「同日」是严格同一天。症状与化验并排摆，不画在同一根轴上，也不由本台解释两者关系。</div>${rows}`;
  }
  const contacts = L().contacts;
  return `${pageHead()}<div class="notice warn">本台<b>不给「什么情况必须去医院」的阈值</b>。这里只列你自己填的联系人与你写的观察项。</div>
    <div class="card"><div class="card-head"><div><h2>我填的联系人</h2><p>只在你这台设备上演示；刷新重置</p></div><button type="button" class="primary" data-action="add-contact">加一个联系人</button></div>
    ${contacts.length ? `<div class="mini-list">${contacts.map((c) => `<div class="mini-item"><div><b>${esc(c.name)} · ${esc(c.relation)}</b><p>${esc(c.note)}</p></div><span>${esc(c.phone)}</span></div>`).join('')}</div>` : emptyState('还没有填联系人', '你可以写：谁陪你去、出现什么情况时你希望先打给谁。观察项由你写，不由产品给阈值。')}
    </div>${judgeLine}`;
}

/* 功能与康复 */
function vFunction() {
  const p = P();
  const s = state.sub.function || 0;
  if (s === 0) {
    return `${pageHead()}<div class="card">${p.function.map((r, i) => recBtn('function', i, esc(r.action), `${esc(r.d)} · ${esc(r.limitation)}`, '')).join('')}</div>
      <div class="notice">这是你自己的话，不是评分。写「蹲不下去」「走 500 米要歇」比写一个分数更有用。</div>`;
  }
  if (s === 1) {
    const saved = p.tess[0] || L().tessSaved;
    return `${pageHead()}<div class="actions" style="margin-bottom:12px"><button type="button" class="primary" data-pv="tess">逐题作答 / 查看（整页）</button></div>
      ${saved ? `<div class="card"><div class="card-head"><div><h2>最近一次 TESS</h2><p>${esc(saved.d)} · ${esc(saved.limb)} · 只存原始作答</p></div>${pill(`已记录 ${saved.answers ? saved.answers.filter((x) => x !== null).length : saved.count} 题`, 'green')}</div>
        <p class="table-note">不显示总分、不画趋势、不比较两次作答。分数怎么读，属于医学判断。</p></div>`
      : emptyState('这个档案还没有 TESS 作答', '可以选上肢或下肢，逐题记录 0–5 的原始作答；保存后只显示「已记录 N 题」。', '<button type="button" class="primary" data-pv="tess">开始作答</button>')}
      ${judgeLine}`;
  }
  return `${pageHead()}<div class="notice plain">只记「你做了什么、哪天做的」。训练动作与强度以康复治疗师/医生的记录为准，本台不生成训练处方。</div>
    <div class="card">${p.function.map((r, i) => recBtn('function', i, esc(r.action), `${esc(r.d)} · ${esc(r.limitation)} · 记录为康复观察项`, '')).join('')}</div>
    <div class="help-box">NCCN STS V3.2026 SARC-D 3 of 4 有独立康复章节：术前评估合并症、体能/衰弱、营养与家庭支持；截肢或大型保肢手术前应提供正式 PM&R 会诊。这是指南要求，不是给你的安排。</div>`;
}

/* 化验与指标 */
function vLabs() {
  const p = P();
  const s = state.sub.labs || 0;
  if (s === 0) {
    const cats = [...new Set(p.metrics.map((m) => m.cat))];
    return `${pageHead()}${cats.map((c) => `<div class="metric-group"><div class="metric-group-head"><h3>${esc(c)}</h3><span>值 · 单位 · 次数 · 日期 · 来源</span></div>${metricGrid(p.metrics.filter((m) => m.cat === c).map((m) => m.key))}</div>`).join('')}
      <div class="notice">卡背是固定高度的迷你折线。缺参考上限的指标，正面带「上限未提供 · ×ULN 不计算」徽章。</div>`;
  }
  if (s === 1) {
    const [t0, t1] = domain();
    return `${pageHead()}
      <div class="overview">
        <aside class="rail">
          <details class="pick" open><summary>指标 <small>最多 4 条</small></summary>
            <div class="metric-list">${[...new Set(p.metrics.map((m) => m.cat))].map((c) => `<div class="cat-label">${esc(c)}</div>${p.metrics.filter((m) => m.cat === c).map((m) => `<label class="metric-pick"><input type="checkbox" data-metric="${esc(m.key)}" ${state.sel.includes(m.key) ? 'checked' : ''}><i style="background:${m.color}"></i><span>${esc(m.name)}</span><small>${m.kind === 'qual' ? '分类' : m.points.length + ' 次'}</small></label>`).join('')}`).join('')}</div>
          </details>
          <section><h3>时间范围</h3><div class="chips">${[['all', '全部'], ['6m', '近 6 个月'], ['3m', '近 3 个月']].map(([k, t]) => `<button type="button" class="chip" data-range="${k}" aria-pressed="${state.range === k}" style="min-height:30px">${t}</button>`).join('')}</div>
            <div class="zoom"><input type="range" min="30" max="100" step="5" value="${state.zoom}" data-zoom aria-label="时间窗缩放"><span>${state.zoom}%</span></div>
          </section>
          <section><h3>说明</h3><p class="table-note">事件只画竖虚线，不改曲线；分类序列只画节点。单点写「只有 1 次记录，暂不连线」。</p>
            <button type="button" class="primary" style="width:100%;margin-top:8px" data-pv="chart">放大到整页</button></section>
        </aside>
        <div class="chart-panel">
          <div class="chart-top"><div><h2>一图秀</h2><p class="table-note">每条序列按自身最小–最大值归一化；不代表不同指标可以互相比较。</p></div><span class="pill line">${state.sel.length} 条序列</span></div>
          ${legendHtml()}
          <div class="chart-wrap">${chartSVG(t0, t1)}</div>
          <p class="scroll-hint">窄屏可左右滑动图表</p>
          ${pinHtml()}
        </div>
      </div>`;
  }
  return `${pageHead()}<div class="notice warn"><b>×ULN 契约：</b>只认这张化验单自带的参考上限。化验单没印上限，就显示「上限未提供 · ×ULN 不计算」，<b>绝不拿参考下限当上限</b>，也不借成人通用区间凑数。</div>
    <div class="card"><div class="table-wrap"><table><thead><tr><th>指标</th><th>单位</th><th>参考下限</th><th>参考上限</th><th>记录次数</th><th>说明</th></tr></thead><tbody>
    ${p.metrics.map((m) => `<tr><td><b>${esc(m.name)}</b></td><td>${esc(m.unit || '—')}</td><td class="num">${m.band_low == null ? '未提供' : esc(m.band_low)}</td><td class="num">${m.band_high == null ? '<span class="badge">上限未提供</span>' : esc(m.band_high)}</td><td class="num">${m.points.length}</td><td>${esc(m.note)}</td></tr>`).join('')}
    </tbody></table></div><p class="table-note">不同医院、不同化验单的参考区间不合并；本表按指标列出的是本档案各次化验单中记录到的区间口径。</p></div>`;
}

/* 复查与随访 */
const FOOTNOTES = [
  { k: 'n', text: '若该区域易于通过体格检查随访，可能不需要影像。' },
  { k: 'o', text: '10 年后复发可能性小，随访应个体化。' },
  { k: 'r', text: '高分化脂肪肉瘤不需常规胸部影像检查（用于转移性疾病）。' },
];
function cadenceTable() {
  return `<div class="table-wrap"><table class="tier-table"><thead><tr><th>情形（NCCN 页）</th><th>随访原文</th><th>出处</th></tr></thead><tbody>
    ${P().rhythm.map((r) => `<tr><td><b>${esc(r.item)}</b></td><td>${esc(r.freq)}</td><td>${esc(r.guideline)}</td></tr>`).join('')}
    </tbody></table></div>`;
}
function footnotesHtml() {
  return `<div class="footnotes">${FOOTNOTES.map((f) => `<div class="footnote"><b>脚注 ${f.k}</b>：${esc(f.text)}<em>这是 NCCN 的标准，不是给你的安排。</em></div>`).join('')}</div>`;
}
function vFollowup() {
  const p = P();
  const s = state.sub.followup || 0;
  if (s === 0) {
    return `${pageHead()}<div class="notice">影像按日期并列摆放，<b>不连成「生长曲线」</b>，也不计算增大/缩小速度。</div>
      <div class="card">${p.imaging.map((r, i) => recBtn('imaging', i, `${esc(r.method)} · ${esc(r.region)}`, `${esc(r.d)} · ${esc(r.conclusion)}`, pill(esc(r.method), 'line'))).join('')}</div>`;
  }
  if (s === 1) {
    return `${pageHead()}<div class="actions" style="margin-bottom:12px"><button type="button" class="primary" data-pv="cadence">打开原文五档（整页）</button></div>
      <div class="card"><div class="card-head"><div><h2>NCCN STS V3.2026 随访五档</h2><p>原文照抄；硬纤维瘤档不在本工作台范围（中间型、非恶性）</p></div>${pill('机构 + 版本 + 表号', 'line')}</div>
      ${cadenceTable()}<p class="table-note">NCCN 不按「高/低危」二分，而是按分期组 + 可切除性/功能结局分层，并允许按局部区域复发风险个体化。本台不替你选档。</p>
      ${footnotesHtml()}</div>
      <div class="notice plain"><b>我的位置不在这里算。</b>本档案已记录的复查日期：${p.imaging.map((r) => esc(r.d)).join(' / ')}。这些是事实，不是「你属于哪一档」的结论。</div>`;
  }
  const qs = p.questions.concat(L().questions);
  return `${pageHead()}<div class="actions" style="margin-bottom:12px"><button type="button" class="primary" data-action="add-question">加一条问题</button></div>
    <div class="notice violet">产品只把问题整理成清单，<b>不生成答案</b>。医生怎么答，就照原话记下来。</div>
    <div class="card">${qs.map((q, i) => `<div class="row"><div class="row-main"><div><b>${esc(q.q)}</b><p>${esc(q.d)}${q.answer ? ' · 医生原话：' + esc(q.answer) : ''}</p></div></div><div class="side"><label class="checkline" style="margin:0"><input type="checkbox" data-asked="${i}" ${q.asked ? 'checked' : ''}>问过了</label></div></div>`).join('')}</div>${judgeLine}`;
}

/* 影像与报告 */
function vImaging() {
  const p = P();
  const s = state.sub.imaging || 0;
  if (s === 0) {
    return `${pageHead()}<div class="card">${p.imaging.map((r, i) => recBtn('imaging', i, `${esc(r.method)} · ${esc(r.region)}`, `${esc(r.d)} · ${esc(r.institution)} · ${esc(r.conclusion)}`, pill('报告原文', 'line'))).join('')}</div>
      <div class="notice plain">影像方式、部位、日期、结论原文并列。点一条进整页详情，再点「看原文」进第二层。</div>`;
  }
  if (s === 1) {
    return `${pageHead()}<div class="notice">报告原文只能从记录详情里点「看原文」进入第二层；长文本不压在详情下面滚。</div>
      <div class="card">${p.imaging.map((r, i) => recBtn('imaging', i, `${esc(r.method)} · ${esc(r.region)}`, `${esc(r.d)} · ${esc(r.conclusion)}`, '<span class="pill line">记录详情 →</span>')).join('')}
        ${p.docs.map((d) => `<div class="row"><div class="row-main"><div><b>${esc(d.name)}</b><p>${esc(d.date)} · ${esc(d.type)} · ${esc(d.status)}</p></div></div><div class="side">${pill('资料', 'grey')}</div></div>`).join('')}
      </div>`;
  }
  return `${pageHead()}<div class="actions" style="margin-bottom:12px"><button type="button" class="primary" data-pv="intake">打开资料整理（四步）</button></div>
    <div class="card"><div class="flow-steps"><span class="on">1 上传</span><span class="fs-arrow">→</span><span>2 解析候选</span><span class="fs-arrow">→</span><span>3 逐项核对</span><span class="fs-arrow">→</span><span>4 入库</span></div>
      <p class="table-note">候选字段与业务事实分开展示：解析结果在核对前不算事实；采用后才写进对应记录表。整页里演示完整四步。</p>
      <div class="dropzone" style="margin-top:10px"><b>上传一份报告</b><p>原型不读真实文件、不上传网络；用「演示文件」模拟解析。</p></div>
    </div>`;
}

/* 生活与照护 */
function vLife() {
  const p = P();
  const s = state.sub.life || 0;
  const orgs = [...new Set([...p.diagnosis.map((r) => r.institution), ...p.surgery.map((r) => r.institution), ...p.imaging.map((r) => r.institution)])].filter((x) => x && x !== '自述');
  if (s === 0) {
    return `${pageHead()}<div class="card"><div class="card-head"><div><h2>在哪看的</h2><p>机构名与是否经过 MDT，都是事实</p></div></div>
      <div class="mini-list">${orgs.map((o) => `<div class="mini-item"><div><b>${esc(o)}</b><p>${p.diagnosis.some((r) => r.institution === o) ? '确诊路径里有记录' : '手术或影像记录里有这个机构'}</p></div><span>已记录</span></div>`).join('')}</div>
      <div class="mini-item" style="margin-top:8px"><div><b>多学科（MDT）记录</b><p>${p.diagnosis.some((r) => r.kind === '会诊' && /MDT|多学科/.test(r.detail)) ? '确诊路径里有 MDT / 多学科门诊记录' : '本档案没有 MDT 字样记录'}</p></div><span>事实</span></div>
    </div>
    <div class="notice">NCCN STS V3.2026 RETSARC-1 原文要求：治疗开始前，所有患者应由具备肉瘤专长的多学科团队评估。中国已成立的专科中心可核实两家：北京大学肿瘤医院软组织与腹膜后肿瘤中心（2015）、上海市级医院肉瘤临床诊治中心（2017）。<br>以上是解释层；<b>「你应该转院」不生成。</b></div>${judgeLine}`;
  }
  if (s === 1) {
    const costs = L().costs;
    return `${pageHead()}<div class="actions" style="margin-bottom:12px"><button type="button" class="primary" data-action="add-cost">记一笔花费</button></div>
      <div class="card">${costs.length ? `<div class="table-wrap"><table><thead><tr><th>日期</th><th>用途</th><th>金额</th></tr></thead><tbody>${costs.map((c) => `<tr><td class="num">${esc(c.d)}</td><td>${esc(c.purpose)}</td><td class="num">¥${esc(c.amount)}</td></tr>`).join('')}</tbody></table></div>` : emptyState('还没有记花费', '只记金额与用途，不判断「值不值得」。数据只在内存里，刷新重置。')}</div>`;
  }
  if (s === 2) {
    return `${pageHead()}<div class="card">${p.viewpoints.map((r, i) => recBtn('viewpoint', i, `「${esc(r.mood)}」`, `${esc(r.d)} · ${esc(r.text)}`, '')).join('')}</div>
      <div class="card" style="margin-top:10px"><div class="card-head"><div><h2>想跟家里人说的一句话</h2><p>你自己写，不是本台生成</p></div></div><p>${esc(p.familyTalk)}</p></div>
      <div class="notice">情绪与照护者负担没有权威量化数据（本轮未核实），所以不设评分、不打分。</div>`;
  }
  const wt = metric('wt');
  return `${pageHead()}<div class="card"><div class="card-head"><div><h2>体重（自测）</h2><p>同一台秤才合并；不同秤的读数不合并</p></div></div>${wt ? mcard('wt', wt) : emptyState('这个档案没有体重记录', '可在指标里补一条自测体重。')}</div>
    <div class="card" style="margin-top:10px"><div class="card-head"><div><h2>日常</h2><p>你自己写的一段话</p></div></div><p>${esc(p.activity)}</p></div>
    <div class="notice">不设营养支持页：肉瘤没有特定的饮食处方证据。NCCN 要求术前评估营养状态，这条只作为解释层写在康复页。</div>`;
}

/* 临床研究 */
function vTrials() {
  const s = state.sub.trials || 0;
  if (s === 0) {
    return `${pageHead()}<div class="notice warn"><b>本原型不内置试验登记条目。</b>本轮调研只核到「全球肉瘤相关注册研究数百至一千余项量级、以 1/2 期为主、单研究样本量小」这类第三方镜像口径（research/STS-FACTCHECK-2026-10-25.md §F），没有一条可引用的登记号 + 标题 + 分期。编一个号就是伪造，所以 trials 表留空。</div>
      ${emptyState('本档案没有登记摘录', '真实版本从 ClinicalTrials.gov / 中国药物临床试验登记与信息公示平台拉取，并把登记状态一律标「未核实」。', '<button type="button" class="primary" data-sub="1">看篮子试验说明</button>')}
      <div class="card" style="margin-top:10px"><div class="card-head"><div><h2>登记状态 ≠ 入组资格</h2><p>这三件事不要混</p></div></div>
        <div class="mini-list"><div class="mini-item"><div><b>登记状态</b><p>招募中 / 已完成 / 终止，是登记页写的</p></div><span>事实</span></div>
        <div class="mini-item"><div><b>入组标准</b><p>由研究方案规定，需要研究团队核对</p></div><span>方案</span></div>
        <div class="mini-item"><div><b>你是否适合</b><p>这一句需要问你的医生</p></div><span>判断</span></div></div></div>`;
  }
  if (s === 1) {
    const paths = [
      ['ntrk', 'NTRK 融合阳性', '不限软组织肉瘤亚型', '拉罗替尼 / 恩曲替尼 / 瑞普替尼', 'NCCN STS V3.2026 SARC-G 1 of 14 原文：NTRK gene fusion-positive sarcomas only (regardless of soft tissue sarcoma subtype)'],
      ['ret', 'RET 融合阳性', '不限亚型', '塞尔帕替尼', 'NCCN STS V3.2026 SARC-G 1 of 14 原文：regardless of soft tissue sarcoma subtype'],
      ['tmb', 'TMB-H（≥10 mut/Mb）', '不限亚型', '帕博利珠单抗 / 纳武利尤单抗 ± 伊匹木单抗', 'NCCN STS V3.2026 SARC-G 原文'],
      ['msi', 'MSI-H / dMMR', '不限亚型', '帕博利珠单抗', 'NCCN STS V3.2026 SARC-G 原文'],
    ];
    return `${pageHead()}<div class="notice violet">下面四条是<b>指南里的分子路径</b>，不是招募信息，也不是「你该检测/该用药」的建议。检测与用药由医生决定。</div>
      <div class="grid two">${paths.map(([id, t, d, drugs, src]) => `<div class="card"><div class="card-head"><div><h2>${esc(t)}</h2><p>${esc(d)}</p></div>${pill('分子路径', 'line')}</div><p style="font-size:calc(12px * var(--tz))">${esc(drugs)}</p><p class="table-note">${esc(src)}</p><div class="actions"><button type="button" class="text-button" data-pv="trial" data-type="${id}">看详情 →</button></div></div>`).join('')}</div>
      <div class="notice warn" style="margin-top:12px">他泽司他（Tazemetostat）：中国大陆 2025-03-18 获批的适应症是 EZH2 突变阳性复发/难治性滤泡性淋巴瘤；<b>上皮样肉瘤适应症在中国大陆未获批</b>。NCCN V3.2026 已把该药从上皮样肉瘤推荐中删除（SARC-G, 4 of 14 – Epithelioid Sarcoma: Tazemetostat removed）。</div>`;
  }
  const notes = L().trialNotes;
  return `${pageHead()}<div class="actions" style="margin-bottom:12px"><button type="button" class="primary" data-action="add-trial">记一条试验线索</button></div>
    <div class="notice">只记「医生在哪次门诊提到、登记号/标题原文、当时怎么说的」。登记状态一律标「未核实」，不判断是否符合条件。</div>
    <div class="card">${notes.length ? `<div class="mini-list">${notes.map((n) => `<div class="mini-item"><div><b>${esc(n.title)}</b><p>${esc(n.id)} · ${esc(n.note)}</p></div><span>${esc(n.d)}</span></div>`).join('')}</div>` : emptyState('还没有记试验线索', '如果医生提到某个试验，把登记号、标题和日期记在这里；本台不替你报名、不判断资格。')}</div>${judgeLine}`;
}

const VIEWS = { dashboard: vDashboard, tumor: vTumor, diagnosis: vDiagnosis, surgery: vSurgery, treatment: vTreatment, tox: vTox, function: vFunction, labs: vLabs, followup: vFollowup, imaging: vImaging, life: vLife, trials: vTrials };

/* ---------------- 记录模型（整页详情用） ---------------- */
function recordOf(type, id) {
  const p = P();
  const i = Number(id);
  switch (type) {
    case 'pathology': return p.pathology[i];
    case 'site': return p.site[i];
    case 'staging': return p.staging[i];
    case 'grade': return p.grade[i];
    case 'molecular': return p.molecular[i];
    case 'diagnosis': return p.diagnosis[i];
    case 'surgery': return p.surgery[i];
    case 'margin': return p.margin[i];
    case 'wound': return p.wound[i];
    case 'line': return p.lines[i];
    case 'cycle': return p.cycles[i];
    case 'rt': return p.rt[i];
    case 'symptom': return p.tox[i];
    case 'function': return p.function[i];
    case 'imaging': return p.imaging[i];
    case 'question': return p.questions.concat(L().questions)[i];
    case 'viewpoint': return p.viewpoints[i];
    case 'tess': return p.tess[i];
    case 'lab': {
      const [k, j] = String(id).split(':');
      const m = metric(k);
      const pt = m && m.points[Number(j)];
      return pt ? { ...pt, metric: m } : undefined;
    }
    case 'cost': return L().costs[i];
    case 'trialnote': return L().trialNotes[i];
    default: return undefined;
  }
}

function recordTitle(type, r) {
  switch (type) {
    case 'pathology': return r.subtype;
    case 'site': return `${r.site} · ${r.size_text}`;
    case 'staging': return `分期记录 ${r.d}`;
    case 'grade': return `分级 ${r.grade}`;
    case 'molecular': return r.item;
    case 'diagnosis': return r.kind;
    case 'surgery': return r.kind;
    case 'margin': return '切缘记录';
    case 'wound': return '伤口记录';
    case 'line': return r.name;
    case 'cycle': return r.name;
    case 'rt': return '放疗记录';
    case 'symptom': return r.symptom;
    case 'function': return r.action;
    case 'imaging': return `${r.method} · ${r.region}`;
    case 'question': return r.q;
    case 'viewpoint': return `「${r.mood}」`;
    case 'lab': return `${r.metric.name} ${r.d}`;
    case 'tess': return `TESS 原始作答 ${r.d}`;
    case 'cost': return `花费 ${r.d}`;
    case 'trialnote': return r.title;
    default: return '记录详情';
  }
}

function fieldsOf(type, r) {
  switch (type) {
    case 'pathology': return [['日期', r.d], ['亚型（原文）', r.subtype], ['报告机构', r.institution], ['会诊', r.consult], ['备注', r.note]];
    case 'site': return [['日期', r.d], ['部位（原文）', r.site], ['大小（原文）', r.size_text], ['深度（原文）', r.depth], ['来源', r.src]];
    case 'staging': return [['日期', r.d], ['TNM（原文）', r.tnm], ['分期系统', r.system], ['来源', r.source], ['备注', r.note]];
    case 'grade': return [['日期', r.d], ['分级（原文）', r.grade], ['FNCLCC 三组件', r.components], ['机构', r.institution], ['备注', r.note]];
    case 'molecular': return [['日期', r.d], ['检测项', r.item], ['结果（原文）', r.result], ['机构', r.institution]];
    case 'diagnosis': return [['日期', r.d], ['环节', r.kind], ['记录（原文）', r.detail], ['机构', r.institution]];
    case 'surgery': return [['日期', r.d], ['术式', r.kind], ['切除范围（原文）', r.extent], ['重建', r.recon], ['机构', r.institution], ['备注', r.note]];
    case 'margin': return [['日期', r.d], ['切缘原文', r.margin_text], ['关联手术', r.surgery_ref], ['来源', r.src]];
    case 'wound': return [['日期', r.d], ['你的描述', r.text], ['在哪处理的', r.care]];
    case 'line': return [['线序', r.line_no], ['方案', r.name], ['说明（原文）', r.detail], ['开始', r.start], ['结束', r.end], ['状态', r.status], ['来源', r.src]];
    case 'cycle': return [['周期', r.name], ['日期', r.date], ['用药', r.drugs], ['状态', r.status]];
    case 'rt': return [['开始', r.start], ['结束', r.end], ['部位', r.site], ['时机（原文）', r.timing], ['备注', r.note]];
    case 'symptom': return [['日期', r.d], ['症状（原话）', r.symptom], ['门诊记录原文', r.ctcae_text], ['备注', r.note]];
    case 'function': return [['日期', r.d], ['动作', r.action], ['你的话', r.limitation]];
    case 'imaging': return [['日期', r.d], ['方式', r.method], ['部位', r.region], ['结论（原文）', r.conclusion], ['机构', r.institution]];
    case 'question': return [['记录日期', r.d], ['问题', r.q], ['问过', r.asked ? '是' : '否'], ['医生原话', r.answer]];
    case 'viewpoint': return [['日期', r.d], ['当时的心情', r.mood], ['你写的', r.text]];
    case 'lab': return [['日期', r.d], ['指标', r.metric.name], ['值', `${r.v} ${r.metric.unit}`], ['来源', r.src], ['该化验单参考下限', r.ref_low], ['该化验单参考上限', r.ref_high]];
    case 'tess': return [['日期', r.d], ['肢体', r.limb], ['题数', r.answers.length], ['作答', r.answers.join(' / ')]];
    case 'cost': return [['日期', r.d], ['用途', r.purpose], ['金额', `¥${r.amount}`]];
    case 'trialnote': return [['日期', r.d], ['登记号 / 标题', r.id], ['记录', r.note]];
    default: return [];
  }
}

function originalOf(type, r) {
  const p = P();
  switch (type) {
    case 'pathology': {
      const grade = p.grade[0];
      const margin = p.margin.find((m) => m.src && m.src.includes('病理')) || p.margin[0];
      return {
        org: r.institution, date: r.d, kind: '病理报告原文（演示摘录）',
        text: ['【送检材料】' + (p.site[0] ? p.site[0].site + ' 肿物标本' : '未记录'),
          '【病理诊断】' + r.subtype,
          r.consult ? '【会诊】' + r.consult : '',
          grade ? '【组织学分级】FNCLCC ' + grade.grade + '（' + grade.components + '）' : '',
          margin ? '【切缘】' + margin.margin_text : '',
          '【报告机构】' + r.institution,
          '【报告日期】' + r.d,
          r.note ? '【备注】' + r.note : ''].filter(Boolean).join('\n'),
      };
    }
    case 'imaging': return { org: r.institution, date: r.d, kind: '影像报告原文（演示摘录）', text: ['【检查方式】' + r.method, '【检查部位】' + r.region, '【影像所见/结论】' + r.conclusion, '【报告机构】' + r.institution, '【报告日期】' + r.d].join('\n') };
    case 'surgery': return { org: r.institution, date: r.d, kind: '手术记录原文（演示摘录）', text: ['【术式】' + r.kind, '【切除范围】' + r.extent, r.recon && r.recon !== '—' ? '【重建】' + r.recon : '', r.note ? '【备注】' + r.note : '', '【机构】' + r.institution, '【日期】' + r.d].filter(Boolean).join('\n') };
    case 'margin': return { org: r.src, date: r.d, kind: '切缘原文（病理报告摘录）', text: ['【切缘】' + r.margin_text, '【关联手术】' + r.surgery_ref, '【来源】' + r.src, '【报告日期】' + r.d].join('\n') };
    case 'diagnosis': return { org: r.institution, date: r.d, kind: '病历记录原文（演示摘录）', text: ['【环节】' + r.kind, '【记录】' + r.detail, '【机构】' + r.institution, '【日期】' + r.d].join('\n') };
    case 'grade': return { org: r.institution, date: r.d, kind: '病理分级原文（演示摘录）', text: ['【组织学分级】FNCLCC ' + r.grade, '【三组件】' + r.components, '【报告机构】' + r.institution, '【报告日期】' + r.d].join('\n') };
    case 'staging': return { org: r.source, date: r.d, kind: '分期原文（演示摘录）', text: ['【TNM】' + r.tnm, '【分期系统】' + r.system, '【来源】' + r.source, '【日期】' + r.d].join('\n') };
    case 'site': return { org: r.src, date: r.d, kind: '影像/病理描述原文（演示摘录）', text: ['【部位】' + r.site, '【大小】' + r.size_text, '【深度】' + r.depth, '【来源】' + r.src, '【日期】' + r.d].join('\n') };
    case 'symptom': return { org: r.note, date: r.d, kind: '门诊/自述记录（演示摘录）', text: ['【症状】' + r.symptom, '【门诊记录原文】' + r.ctcae_text, '【备注】' + r.note, '【日期】' + r.d].join('\n') };
    case 'rt': return { org: '放疗记录', date: r.start, kind: '放疗记录（演示摘录）', text: ['【起止】' + r.start + ' → ' + r.end, '【部位】' + r.site, '【时机】' + r.timing, '【备注】' + r.note].join('\n') };
    case 'molecular': return { org: r.institution, date: r.d, kind: '分子检测报告（演示摘录）', text: ['【检测项】' + r.item, '【结果】' + r.result, '【机构】' + r.institution, '【日期】' + r.d].join('\n') };
    default: return null;
  }
}

function recordPageBody(type, id) {
  const r = recordOf(type, id);
  if (!r) return { title: '记录不存在', html: `<div class="pv-inner">${emptyState('这条记录不存在', '可能换了档案，或这条记录只在另一个档案里。关掉本页回到列表即可。')}</div>` };
  const fields = fieldsOf(type, r);
  const orig = originalOf(type, r);
  const sameDate = [];
  const push = (t, i, label, sub) => sameDate.push({ t, i, label, sub });
  P().imaging.forEach((x, i) => { if (x.d === r.d) push('imaging', i, `${x.method} · ${x.region}`, x.conclusion); });
  P().surgery.forEach((x, i) => { if (x.d === r.d) push('surgery', i, x.kind, x.extent); });
  P().tox.forEach((x, i) => { if (x.d === r.d) push('symptom', i, x.symptom, x.note); });
  P().diagnosis.forEach((x, i) => { if (x.d === r.d) push('diagnosis', i, x.kind, x.detail); });
  for (const m of P().metrics) m.points.forEach((p, i) => { if (p.d === r.d && typeof p.v === 'number') push('lab', `${m.key}:${i}`, `${m.name} ${p.v} ${m.unit}`, p.src); });
  const html = `<div class="pv-inner">
    <section class="pv-section"><h2>事实</h2>
      <dl class="kv">${fields.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(txt(v))}</dd></div>`).join('')}</dl>
    </section>
    ${orig ? `<section class="pv-section"><h2>原文</h2><div class="pv-prose"><pre>${esc(orig.text)}</pre></div>
      <div class="actions" style="margin-top:10px"><button type="button" class="pv-btn" data-report="${esc(type)}" data-id="${esc(id)}">看原文（第二层）</button></div>
      <p class="pv-note">原文只照抄，不改写、不摘要、不解释。</p></section>` : ''}
    <section class="pv-section"><h2>来源</h2>
      <dl class="kv">${[['记录类型', labelOf(type)], ['日期', txt(r.d || r.start || r.date)], ['机构 / 记录处', txt(r.institution || r.src || r.care || r.note)], ['谁说的', type === 'viewpoint' || type === 'function' || type === 'wound' ? '你自己' : '病历 / 报告原文']].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </section>
    <section class="pv-section"><h2>关联 · 同一天的其他记录</h2>
      ${sameDate.length ? `<div class="mini-list">${sameDate.map((x) => `<button type="button" class="pv-btn" data-record="${x.t}" data-id="${esc(x.i)}">${esc(x.label)}<span class="pv-note"> · ${esc(txt(x.sub))}</span></button>`).join('')}</div>` : '<p class="pv-note">这一天没有其他记录。</p>'}
    </section>
    <p class="pv-note">本页只记录事实。好坏、稳定、进展、缓解、下一步怎么办，都不由本台生成——这一句需要问你的医生。</p>
  </div>`;
  return { title: recordTitle(type, r), html };
}

const TYPE_LABEL = {
  pathology: '病理记录', site: '部位与大小', staging: '分期记录', grade: '分级记录', molecular: '分子检测',
  diagnosis: '确诊时间轴', surgery: '手术记录', margin: '切缘记录', wound: '伤口记录', line: '治疗线序',
  cycle: '化疗周期', rt: '放疗记录', symptom: '副作用记录', function: '日常动作', imaging: '影像记录',
  question: '问题清单', viewpoint: '情绪记录', lab: '化验记录', tess: 'TESS 自评', cost: '花费记录', trialnote: '试验线索',
};
const labelOf = (t) => TYPE_LABEL[t] || t;

/* ---------------- 整页视图 ---------------- */
const pv = window.createPageView ? window.createPageView({ crumbRoot: '小韧宝' }) : null;
/* 探针（scripts/probe-prototype.mjs）要读层深与当前 key；失败时退回 null 不影响界面。 */
if (pv) window.__pv = pv;

function pvDef(key, title, crumb, render) {
  return { key, title, crumb, render };
}

/* TESS 正文单独成函数：切肢体时要重建 .pv-body，render() 不碰它。 */
function pvTessBody() {
      const existing = P().tess[0];
      // TESS 下肢 30 题 / 上肢 29 题：写死 30 会让「上肢 29 题」这个事实与画面打架
      const total = state.tess.limb === '上肢' ? 29 : 30;
      const answers = state.tess.answers.length === total ? state.tess.answers : Array(total).fill(null);
      state.tess.answers = answers;
      return `<div class="pv-inner">
        <section class="pv-section"><h2>分肢体</h2>
          <div class="tess-limb" role="group" aria-label="选择肢体">
            <button type="button" data-tess-limb="下肢" aria-pressed="${state.tess.limb === '下肢'}">下肢 · 30 题</button>
            <button type="button" data-tess-limb="上肢" aria-pressed="${state.tess.limb === '上肢'}">上肢 · 29 题</button>
            <span class="pill line">题面文本未内置（TESS 中文版授权待核）</span>
          </div>
          <p class="pv-note">原型只演示「逐题原始作答 + 保存」的结构，不复制量表题面。0 = 没有困难，5 = 做不到。</p>
        </section>
        <section class="pv-section"><h2>${esc(state.tess.limb)} · 逐题</h2>
          <div class="tess-list">${answers.map((v, i) => `<div class="tess-item"><span class="q">第 ${i + 1} 题${existing && existing.limb === state.tess.limb && existing.answers[i] != null && v == null ? '（已记录：' + existing.answers[i] + '）' : ''}</span>
            <span class="tess-scale" role="group" aria-label="第 ${i + 1} 题">${[0, 1, 2, 3, 4, 5].map((n) => `<label><input type="radio" name="t${i}" value="${n}" data-tess-i="${i}" ${v === n ? 'checked' : ''}>${n}</label>`).join('')}</span></div>`).join('')}</div>
        </section>
        <div class="tess-save"><button type="button" class="pv-btn" data-action="tess-save">保存作答</button><p id="tess-status">${state.tess.savedText || (existing ? `已记录 ${existing.answers.filter((x) => x != null).length} 题` : '还没有保存')}</p></div>
        <p class="pv-note">保存后只显示「已记录 N 题」。不显示总分、不画趋势、不比较两次作答——分数怎么读属于医学判断，这一句需要问你的医生。</p>
      </div>`;
}

if (pv) {
  pv.defineAll([
    pvDef('record', '记录详情', '记录详情', (body, api, params) => {
      const type = (params && params.type) || 'pathology';
      const id = (params && params.id) || '0';
      const out = recordPageBody(type, id);
      body.innerHTML = out.html;
    }),
    pvDef('report', '报告原文', '记录详情 › 报告原文', (body, api, params) => {
      const type = (params && params.type) || 'pathology';
      const id = (params && params.id) || '0';
      const r = recordOf(type, id);
      const orig = r && originalOf(type, r);
      body.innerHTML = `<div class="pv-inner">
        ${orig ? `<section class="pv-section"><h2>原文照抄</h2><div class="pv-prose"><pre>${esc(orig.text)}</pre></div></section>
        <section class="pv-section"><h2>出处</h2><dl class="kv"><div><dt>类型</dt><dd>${esc(orig.kind)}</dd></div><div><dt>机构</dt><dd>${esc(txt(orig.org))}</dd></div><div><dt>日期</dt><dd>${esc(txt(orig.date))}</dd></div></dl></section>` : `<div class="empty"><h3>这条记录没有原文</h3><p>它本身就是一条事实记录（例如自述或花费），没有对应的报告原文。</p></div>`}
        <section class="pv-section"><h2>免责</h2><p class="pv-note">本页是演示档案里的报告摘要，不是真实病历。原文只照抄，不改写、不摘要、不解释；判读请回到给你出报告的医生。</p></section>
      </div>`;
    }),
    pvDef('surgery', '手术档案', '手术与伤口 › 手术档案', (body) => {
      const s = P().surgery[P().surgery.length - 1] || {};
      body.innerHTML = `<div class="pv-inner">
        <section class="pv-section"><h2>字段结构</h2>
          <div class="form-grid">
            ${[['手术日期', s.d], ['术式', s.kind], ['机构', s.institution], ['切除范围', s.extent], ['重建方式', s.recon], ['术前诊断', s.note], ['术后诊断', ''], ['切缘原文', P().margin[P().margin.length - 1] ? P().margin[P().margin.length - 1].margin_text : ''], ['伤口情况', P().wound[P().wound.length - 1] ? P().wound[P().wound.length - 1].text : ''], ['麻醉方式', ''], ['手术时长', ''], ['出血量', '']].map(([l, v]) => `<div class="field"><label>${esc(l)}</label><input value="${esc(txt(v, ''))}" placeholder="未记录"></div>`).join('')}
            <div class="field wide"><label>备注</label><textarea placeholder="只写事实，不写判断">${esc('')}</textarea></div>
          </div>
          <div class="form-actions"><button type="button" class="pv-btn" data-action="save-draft">保存草稿</button><button type="button" class="pv-btn" data-pv="margin">去切缘记录</button></div>
          <p class="pv-note" style="margin-top:10px">原型只在内存里演示字段，不写磁盘；刷新即重置。</p>
        </section>
        <section class="pv-section"><h2>已有手术</h2>${P().surgery.map((r, i) => `<button type="button" class="pv-btn" data-record="surgery" data-id="${i}" style="margin:0 6px 6px 0">${esc(r.kind)} · ${esc(r.d)}</button>`).join('')}</section>
      </div>`;
    }),
    pvDef('margin', '切缘记录', '手术与伤口 › 切缘记录', (body) => {
      body.innerHTML = `<div class="pv-inner">
        <section class="pv-section"><h2>原文</h2>
          ${P().margin.map((r, i) => `<div class="card" style="margin-bottom:10px"><div class="card-head"><div><h2>${esc(r.d)} 报告原文</h2><p>关联手术：${esc(r.surgery_ref)}</p></div></div><div class="pv-prose"><pre>${esc(r.margin_text)}</pre></div><p class="pv-note">来源：${esc(r.src)}</p><button type="button" class="pv-btn" data-report="margin" data-id="${i}" style="margin-top:8px">看整段原文</button></div>`).join('')}
        </section>
        <section class="pv-section"><h2>三条注</h2>
          <p class="pv-note">1. 切缘只抄报告原文，不改写、不解读。</p>
          <p class="pv-note">2. R0 / R1 / R2 的定义（CSCO 肢体软组织肉瘤共识原文）：R0 显微镜下无肿瘤残留；R1 显微镜下肿瘤残留；R2 肉眼肿瘤残留。</p>
          <p class="pv-note">3. 切缘是否「oncologically appropriate」、要不要二次扩大切除、切多大范围——这一句需要问你的医生。</p>
        </section>
      </div>`;
    }),
    pvDef('wound', '伤口与恢复', '手术与伤口 › 伤口与恢复', (body) => {
      const rows = P().wound;
      body.innerHTML = `<div class="pv-inner">
        <section class="pv-section"><h2>时间序列</h2>
          ${rows.length ? rows.map((r, i) => `<div class="card" style="margin-bottom:9px"><div class="card-head"><div><h2>${esc(r.d)}</h2><p>${esc(txt(r.care))}</p></div></div><p>${esc(r.text)}</p><div class="actions" style="margin-top:7px"><button type="button" class="pv-btn" data-record="wound" data-id="${i}">看记录</button></div></div>`).join('') : `<div class="empty"><h3>本档案没有伤口记录</h3><p>没有录入的内容，本台不补、不推测。</p></div>`}
        </section>
        <section class="pv-section"><h2>照片位</h2><p class="pv-note">原型不存图、不调用相机。真实版本会把照片与这条记录绑定，并按你的设置决定是否加密。</p></section>
        <p class="pv-note">伤口记录是你自己的话，不是并发症诊断。怎么处理以门诊记录为准。</p>
      </div>`;
    }),
    pvDef('tess', 'TESS 自评作答', '功能与康复 › TESS 自评', (body) => {
      body.innerHTML = pvTessBody();
    }),
    pvDef('chart', '一图秀 · 放大', '化验与指标 › 一图秀', (body) => {
      const [t0, t1] = domain();
      body.innerHTML = `<div class="pv-inner">
        <section class="pv-section"><h2>放大只改宽度，规则一条不放宽</h2>
          <p class="pv-note">单调三次插值（Fritsch-Carlson）· 末点 13px 避让 · 事件竖虚线上端止于 CY0-10 · 分类序列只画节点 · 单点写「只有 1 次记录，暂不连线」。</p>
        </section>
        <section class="pv-section">
          <div class="chart-panel"><div class="chart-top"><div><h2>${esc(P().name)} · ${esc(P().window_start)} → ${esc(P().window_end)}</h2><p class="table-note">每条序列按自身最小–最大值归一化，不代表不同指标可以互相比较。</p></div><span class="pill line">${state.sel.length} 条序列</span></div>
            ${legendHtml()}<div class="chart-wrap">${chartSVG(t0, t1)}</div>${pinHtml()}</div>
        </section>
        <section class="pv-section"><h2>指标区</h2>${metricGrid(state.sel)}</section>
      </div>`;
    }),
    pvDef('cadence', '随访节奏 · 原文五档', '复查与随访 › 随访节奏', (body) => {
      body.innerHTML = `<div class="pv-inner">
        <section class="pv-section"><h2>NCCN STS V3.2026 随访五档</h2>
          <p class="pv-note">机构 + 版本 + 表号；页码未取得，写「页码待核」。硬纤维瘤档不在本工作台范围（中间型、非恶性）。</p>
          ${cadenceTable()}
        </section>
        <section class="pv-section"><h2>三条脚注原文</h2>${footnotesHtml()}</section>
        <section class="pv-section"><h2>我的位置</h2>
          <p class="pv-note">本档案已记录：${P().imaging.map((r) => esc(r.d) + ' ' + esc(r.method) + ' ' + esc(r.region)).join('；')}。</p>
          <p class="pv-note">这些是事实。你属于哪一档、下一次该什么时候查什么，是医生的判断；本台不分档、不排计划。</p>
        </section>
      </div>`;
    }),
    pvDef('timeline', '线序全景', '治疗与线序 › 线序时间轴', (body) => {
      body.innerHTML = `<div class="pv-inner">
        <section class="pv-section"><h2>把用过的时间段横向排开</h2><p class="pv-note">横轴是日期，行是线序；事件只做竖虚线，不插值成折点。</p></section>
        <section class="pv-section"><div class="timeline-scroll">${timelineSVG()}</div></section>
        <section class="pv-section"><h2>线序明细</h2>${P().lines.map((r, i) => `<button type="button" class="pv-btn" data-record="line" data-id="${i}" style="margin:0 6px 6px 0">${esc(r.name)} · ${esc(r.start)}</button>`).join('')}</section>
        <p class="pv-note">线序是事实；方案优劣、下一线用什么，不由本台生成。</p>
      </div>`;
    }),
    pvDef('trial', '分子路径详情', '临床研究 › 篮子试验说明', (body, api, params) => {
      const id = (params && params.type) || 'ntrk';
      const map = {
        ntrk: { t: 'NTRK 融合阳性', d: '不论软组织肉瘤亚型', drug: '拉罗替尼 / 恩曲替尼 / 瑞普替尼', mech: '高选择性 TRK 抑制剂（拉罗替尼）；TRK/ROS1/ALK 抑制剂（恩曲替尼）；新一代 TRK 抑制剂（瑞普替尼）', src: 'NCCN STS V3.2026 SARC-G 1 of 14' },
        ret: { t: 'RET 融合阳性', d: '不论亚型', drug: '塞尔帕替尼', mech: 'RET 抑制剂', src: 'NCCN STS V3.2026 SARC-G 1 of 14' },
        tmb: { t: 'TMB-H（≥10 mut/Mb）', d: '不论亚型', drug: '帕博利珠单抗 / 纳武利尤单抗 ± 伊匹木单抗', mech: 'PD-1 / PD-1+CTLA-4 抑制', src: 'NCCN STS V3.2026 SARC-G' },
        msi: { t: 'MSI-H / dMMR', d: '不论亚型', drug: '帕博利珠单抗', mech: 'PD-1 抑制', src: 'NCCN STS V3.2026 SARC-G' },
      };
      const x = map[id] || map.ntrk;
      body.innerHTML = `<div class="pv-inner">
        <section class="pv-section"><h2>属性</h2><dl class="kv"><div><dt>分子路径</dt><dd>${esc(x.t)}</dd></div><div><dt>适用亚型</dt><dd>${esc(x.d)}</dd></div><div><dt>指南位置</dt><dd>${esc(x.src)}</dd></div></dl></section>
        <section class="pv-section"><h2>原理</h2><p class="pv-note">${esc(x.mech)}。对应药物（获批状态未核实）：${drug(x.drug.replace(/ \/ /g, '、'))}。</p></section>
        <section class="pv-section"><h2>阶段</h2><p class="pv-note">这是指南的系统治疗推荐条目，不是一项试验的分期，也不是招募信息。本原型不内置任何登记号。</p></section>
        <section class="pv-section"><h2>历史数据</h2><p class="pv-note">本原型未内置该路径的 ORR / PFS / OS 数值——调研文档明确「NCCN 表只给参考文献编号，具体数值本轮未逐条核实」。未核实就不写。</p></section>
        <div class="notice" style="margin-top:14px">是否做这个检测、结果是否能用这个药，是医生的判断：这一句需要问你的医生。</div>
      </div>`;
    }),
    pvDef('intake', '资料整理', '影像与报告 › 资料整理', (body) => {
      body.innerHTML = intakeHtml();
    }),
  ]);
}

function labelOfType(t) { return labelOf(t); }

/* 横向线序 SVG（整页） */
function timelineSVG() {
  const p = P();
  const lines = p.lines;
  const dates = [];
  lines.forEach((l) => { dates.push(l.start); if (l.end) dates.push(l.end); });
  p.events.forEach((e) => dates.push(e.d));
  dates.sort();
  const t0 = Date.parse(dates[0]);
  const t1 = Date.parse(dates[dates.length - 1]);
  const W = 960, H = 150 + lines.length * 44;
  const X0 = 120, X1 = W - 30;
  const x = (d) => X0 + (Date.parse(d) - t0) / Math.max(1, t1 - t0) * (X1 - X0);
  const rows = lines.map((l, i) => {
    const y = 76 + i * 44;
    const x1 = x(l.start);
    const x2 = l.end ? x(l.end) : X1 - 4;
    return `<g><text x="8" y="${y + 4}" font-size="11" fill="#4A2D5C">${esc(l.name)}</text>
      <rect x="${x1.toFixed(1)}" y="${y - 7}" width="${Math.max(4, x2 - x1).toFixed(1)}" height="14" rx="7" fill="#7B4C9A" opacity="${l.status === '进行中' ? '.55' : '.28'}"/>
      <text x="${(x1 + 4).toFixed(1)}" y="${y - 11}" font-size="9" fill="#5E3578">${esc(l.start)}${l.end ? ' → ' + esc(l.end) : ''}</text></g>`;
  }).join('');
  const evs = p.events.map((e, i) => {
    const ex = x(e.d);
    return `<line x1="${ex.toFixed(1)}" x2="${ex.toFixed(1)}" y1="52" y2="${H - 26}" stroke="${i % 2 ? '#A9761F' : '#7B4C9A'}" stroke-width="1" stroke-dasharray="3 6" opacity=".35"/>
      <text x="${ex.toFixed(1)}" y="44" font-size="8.5" fill="#6F5B7D" text-anchor="${ex > X1 - 60 ? 'end' : 'start'}">${esc(e.d.slice(5))} ${esc(e.label)}</text>`;
  }).join('');
  return `<svg class="timeline-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="治疗线序横向时间轴">
    <line x1="${X0}" x2="${X1}" y1="${H - 26}" y2="${H - 26}" stroke="#DFD5E8"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => { const d = new Date(t0); d.setMonth(d.getMonth() + i); if (d.getTime() > t1) return ''; return `<text x="${x(d.toISOString().slice(0, 10)).toFixed(1)}" y="${H - 10}" font-size="9" fill="#94879F" text-anchor="middle">${d.getMonth() + 1}月</text>`; }).join('')}
    ${evs}${rows}</svg>`;
}

/* 资料整理四步 */
function intakeHtml() {
  const p = P();
  const step = state.intake.step;
  const dec = state.intake.decisions;
  const cands = p.candidates;
  const accepted = cands.filter((c) => dec[c.id] === 'accept').length;
  const stepBar = `<div class="flow-steps">${['上传', '解析候选', '逐项核对', '入库'].map((t, i) => `<span class="${step === i + 1 ? 'on' : ''}">${i + 1} ${t}</span>${i < 3 ? '<span class="fs-arrow">→</span>' : ''}`).join('')}</div>`;
  let body = '';
  if (step === 1) {
    body = `<div class="dropzone"><b>上传一份报告</b><p>原型不读真实文件、不上传网络。点下面按钮用一条演示文件走完流程。</p>
      <div class="actions" style="justify-content:center;margin-top:12px"><button type="button" class="pv-btn" data-action="intake-demo">用演示文件模拟上传</button>
      <label class="pv-btn" style="display:inline-flex;align-items:center;cursor:pointer">选择本机文件<input type="file" id="intake-file" hidden accept=".pdf,.jpg,.jpeg,.png,.txt"></label></div></div>
      <p class="pv-note">真实版本的文件只落在你选定的本机目录；上传这一步不产生业务事实。</p>`;
  } else if (step === 2) {
    body = `<div class="notice">解析只产出<b>候选字段</b>，不是事实。候选要逐项核对、采用后才写进对应记录表。</div>
      <div class="card"><div class="card-head"><div><h2>解析候选</h2><p>来自演示文件：${esc(p.docs[p.docs.length - 1].name)}</p></div>${pill(`${cands.length} 条候选`, 'line')}</div>
      <div class="mini-list">${cands.map((c) => `<div class="mini-item"><div><b>${esc(c.name)}</b><p>${esc(c.value)}</p><p>${esc(c.source)}</p></div><span class="pill grey">待核对</span></div>`).join('')}</div>
      <div class="form-actions"><button type="button" class="pv-btn" data-action="intake-next">进入逐项核对</button></div></div>`;
  } else if (step === 3) {
    body = `<div class="notice violet"><b>候选与业务事实分开摆。</b>左边是解析结果，右边是本档案已有的事实；只有「采用」的候选才会进入第 4 步。</div>
      <div class="grid two">
        <div class="card"><div class="card-head"><div><h2>解析候选</h2><p>每一条都要你点一下</p></div></div>
          <div class="grid" style="gap:8px">${cands.map((c) => `<div class="candidate"><div><b>${esc(c.name)}</b><p>${esc(c.value)}</p><p class="table-note">${esc(c.source)}</p></div><div class="acts">
            <button type="button" data-intake="${esc(c.id)}" data-decision="accept" aria-pressed="${dec[c.id] === 'accept'}">${dec[c.id] === 'accept' ? '已采用' : '采用'}</button>
            <button type="button" data-intake="${esc(c.id)}" data-decision="reject" aria-pressed="${dec[c.id] === 'reject'}">${dec[c.id] === 'reject' ? '已不采用' : '不采用'}</button></div></div>`).join('')}</div>
        </div>
        <div class="card"><div class="card-head"><div><h2>档案里已有的事实</h2><p>来自业务记录表，不参与候选合并</p></div></div>
          <div class="mini-list">
            <div class="mini-item"><div><b>切缘</b><p>${esc(p.margin.map((m) => m.margin_text).join(' / '))}</p></div><span>${esc(p.margin[0].d)}</span></div>
            <div class="mini-item"><div><b>亚型</b><p>${esc(p.pathology[p.pathology.length - 1].subtype)}</p></div><span>${esc(p.pathology[p.pathology.length - 1].d)}</span></div>
            <div class="mini-item"><div><b>放疗</b><p>${p.rt.length ? esc(p.rt[0].start + ' → ' + p.rt[0].end) : '本档案无放疗记录'}</p></div><span>—</span></div>
          </div>
        </div>
      </div>
      <div class="form-actions"><button type="button" class="pv-btn" data-action="intake-next" ${accepted ? '' : 'disabled'}>入库（已采用 ${accepted} 条）</button></div>`;
  } else {
    body = `<div class="empty"><h3>已入库 ${accepted} 条候选（演示）</h3><p>原型只写内存，不落磁盘。真实版本会新增记录行，并保留候选与事实之间的来源链。</p><p style="margin-top:6px">被拒绝的候选不会删除，只是不进入记录表。</p></div>
      <div class="card" style="margin-top:12px"><div class="card-head"><div><h2>四步各自留下了什么</h2><p>可回溯，不合并</p></div></div>
      <div class="mini-list">
        <div class="mini-item"><div><b>1 上传</b><p>文件：${esc(p.docs[p.docs.length - 1].name)}</p></div><span>原件</span></div>
        <div class="mini-item"><div><b>2 解析候选</b><p>${cands.length} 条候选字段</p></div><span>候选层</span></div>
        <div class="mini-item"><div><b>3 逐项核对</b><p>采用 ${accepted} 条 / 不采用 ${cands.filter((c) => dec[c.id] === 'reject').length} 条</p></div><span>你的决定</span></div>
        <div class="mini-item"><div><b>4 入库</b><p>只把采用的写进记录表</p></div><span>事实层</span></div>
      </div></div>`;
  }
  return `<div class="pv-inner">${stepBar}${body}
    <p class="pv-note" style="margin-top:14px">候选与事实分表存放是 schema 的第四契约：documents / candidate_fields / 记录表 / metric_points 各是一层，不合并。</p></div>`;
}

/* ---------------- 渲染 ---------------- */
function render() {
  const main = $('#main');
  if (!main) return;
  main.innerHTML = `<div class="page-enter">${(VIEWS[state.view] || vDashboard)()}</div>`;
  document.title = `小韧宝 SarcPal · ${PAGES.find((p) => p[0] === state.view)[1]} · v${APP_INFO.version}`;
  renderNav();
  renderProfileChip();
  renderAgent();
  main.focus({ preventScroll: true });
}

function renderNav() {
  $('#nav').innerHTML = PAGES.map(([k, label]) => `<button type="button" class="nav-tab" data-view="${k}" aria-current="${state.view === k ? 'page' : 'false'}">${esc(label)}</button>`).join('');
}
function renderProfileChip() {
  const p = P();
  $('#profile-avatar').textContent = p.name.slice(0, 1);
  $('#profile-name').textContent = p.name;
  $('#profile-btn').setAttribute('aria-label', `切换演示档案：当前 ${p.name}`);
}
function setView(k, sub = null) {
  if (!VIEWS[k]) return;
  state.view = k;
  // 0 也是合法页签：原来写 `if (sub)` 会把 0 跳过，点导航仍停在上次那个页签
  state.sub[k] = sub == null ? 0 : sub;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
  $('#main').focus({ preventScroll: true });
}
function setSub(i) {
  state.sub[state.view] = i;
  render();
}

/* ---------------- AI 面板 ---------------- */
const FORBIDDEN = ['建议治疗', '可能复发', '可以停药', '无需就医', '治愈率'];
const SOFT_WORDS = ['稳定', '进展', '缓解', '好转', '恶化'];

function renderAgent() {
  const body = $('#agent-body');
  if (!body) return;
  const p = P();
  body.innerHTML = `
    <div class="agent-note"><b>边界先写在前面：</b>本原型没有接入模型。任何「好不好 / 稳不稳 / 要不要换方案」的问题，统一回你一句：<b>这一句需要问你的医生。</b></div>
    <div class="agent-quick">
      <button type="button" data-action="ask" data-q="这个指标要紧吗？">这个指标要紧吗？</button>
      <button type="button" data-action="ask" data-q="现在算稳定吗？">现在算稳定吗？</button>
      <button type="button" data-action="ask" data-q="要不要停药？">要不要停药？</button>
    </div>
    <div class="agent-card"><h4>本页可以让我做的两件事</h4><p>1. 把这页已记录的事实按日期排一遍；2. 检查这页有没有出现判断类措辞。<br>两件事都不产生医学结论。</p></div>
    <div class="agent-card" id="agent-output"><h4>当前档案</h4><pre>${esc(p.name)} · ${esc(p.meta)}
当前页：${esc(PAGES.find((x) => x[0] === state.view)[1])}
已记录：影像 ${p.imaging.length} 条 / 手术 ${p.surgery.length} 条 / 副作用 ${p.tox.length} 条
分期行：${p.staging.length ? '1 行（原文）' : '未回报'}</pre></div>`;
  const toggle = $('#agent-toggle');
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(state.agentOpen));
    $('#agent-state').textContent = state.agentOpen ? '已展开' : '已收起';
  }
  $('#work-grid').classList.toggle('agent-closed', !state.agentOpen);
  $('#agent-dock').hidden = !state.agentOpen;
}

function agentSay(text) {
  const out = $('#agent-output');
  if (out) out.innerHTML = `<h4>回复</h4><pre>${esc(text)}</pre>`;
}
function agentBuild() {
  const p = P();
  const rows = [];
  rows.push(`${p.name} · ${p.meta}`);
  rows.push(`本页：${PAGES.find((x) => x[0] === state.view)[1]} / ${(TABS[state.view] || [])[state.sub[state.view] || 0] || '页内分区'}`);
  rows.push(`病理由 ${p.pathology.length} 条记录，最近一条：${p.pathology[p.pathology.length - 1].d} ${p.pathology[p.pathology.length - 1].subtype}`);
  rows.push(`手术 ${p.surgery.length} 次，最近：${p.surgery[p.surgery.length - 1].d} ${p.surgery[p.surgery.length - 1].kind}`);
  rows.push(`影像 ${p.imaging.length} 次：${p.imaging.map((x) => x.d).join(' / ')}`);
  rows.push(`指标 ${p.metrics.length} 项 / 数据点 ${p.metrics.reduce((a, m) => a + m.points.length, 0)} 个`);
  rows.push('以上都是已记录事实，不含判断。');
  agentSay(rows.join('\n'));
}
function agentCheck() {
  const text = $('#main').innerText + '\n' + (PAGES.map((x) => x[1] + SUBTITLES[x[0]]).join('\n'));
  const hits = FORBIDDEN.filter((w) => text.includes(w)).concat(SOFT_WORDS.filter((w) => text.includes(w)));
  const out = $('#agent-output');
  if (!out) return;
  out.innerHTML = `<h4>判断类措辞自检</h4><div class="agent-check">${hits.length ? hits.map((h) => `<span class="hit">命中：${esc(h)}</span>`).join('') : `<span class="pass">本页文本未命中 ${FORBIDDEN.length} 个硬禁词与 ${SOFT_WORDS.length} 个软判断词</span>`}<span class="pass">数据值来自 demo-data.js，未出现派生结论</span></div>`;
}

/* ---------------- 弹窗 ---------------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 2200);
}
function openDialog(eyebrow, title, bodyHtml, footHtml = '') {
  $('#dialog-eyebrow').textContent = eyebrow;
  $('#dialog-title').textContent = title;
  $('#dialog-body').innerHTML = bodyHtml;
  $('#dialog-foot').innerHTML = footHtml || '<button type="button" class="primary" data-action="close">知道了</button>';
  $('#dialog').showModal();
}
function closeDialog() { $('#dialog').close(); }

function dlgProfiles() {
  const rows = Object.entries(D).map(([k, p]) => `<button type="button" class="profile-row ${state.profile === k ? 'on' : ''}" data-profile="${k}" style="display:flex;justify-content:space-between;width:100%;text-align:left;padding:11px 12px;border:1px solid var(--line);border-radius:11px;margin-top:8px;background:#fff">
    <span><b style="display:block">${esc(p.name)} · ${esc(p.meta)}</b><span style="font-size:calc(11px * var(--tz));color:var(--muted)">${esc(p.headline)}</span></span>
    <span class="pill ${state.profile === k ? 'green' : 'grey'}">${state.profile === k ? '当前' : '切换'}</span></button>`).join('');
  openDialog('演示档案', '换一个档案看另一条路径', `<p style="font-size:calc(12px * var(--tz));color:var(--muted);line-height:1.7">换档案后回到看板，默认指标与图表初始状态同构（3 条数值线 + 1 条分类序列 + 1 个单点）。</p>${rows}`);
}
function dlgSettings() {
  const sizes = [['narrow', '窄 300'], ['std', '标准 372'], ['wide', '宽 500']];
  openDialog('设置', '原型设置', `
    <div class="about">
      <div class="card" style="padding:12px"><div class="card-head"><div><h3>字号</h3><p>三档：1 / 1.15 / 1.32</p></div></div>
        <div class="actions">${[0, 1, 2].map((i) => `<button type="button" data-font="${i}" aria-pressed="${state.font === i}">${['正常', '大字', '特大'][i]}</button>`).join('')}</div></div>
      <div class="card" style="padding:12px"><div class="card-head"><div><h3>AI 面板宽度</h3><p>默认展开，可收起</p></div></div>
        <div class="actions">${sizes.map(([k, t]) => `<button type="button" data-agent-size="${k}" aria-pressed="false">${t}</button>`).join('')}</div></div>
      <div class="card" style="padding:12px"><div class="card-head"><div><h3>演示数据</h3><p>全部为虚构模拟；刷新页面即重置本地改动</p></div></div>
        <div class="actions"><button type="button" data-action="reload">清空本地改动并刷新</button></div></div>
      <div class="card" style="padding:12px"><div class="card-head"><div><h3>关于</h3><p>${esc(APP_INFO.channelLabel)}</p></div></div>
        <p style="font-size:calc(11.5px * var(--tz))">小韧宝 SarcPal v${APP_INFO.version} · ${APP_INFO.build}。本原型不读写真实文件、不调用模型或宿主 API。</p></div>
    </div>`);
}
function dlgAbout() {
  openDialog('关于', '小韧宝 SarcPal', `<div class="about"><div class="about-ver"><b>v${APP_INFO.version}</b><span class="pill line">${esc(APP_INFO.channelLabel)}</span></div>
    <dl><div><dt>构建</dt><dd>${APP_INFO.build}</dd></div><div><dt>品牌</dt><dd>小韧宝 SarcPal · 品牌字「韧」</dd></div>
    <div><dt>数据</dt><dd>2 套虚构档案 / 各约 6 个月窗口</dd></div>
    <div><dt>指南口径</dt><dd>NCCN STS V3.2026（03/12/26）· AJCC 8（2017）· WHO 第 5 版（2020）</dd></div>
    <div><dt>边界</dt><dd>事实与指南原文可写；判断一句都不生成</dd></div></dl>
    <p class="help-box">本原型不接入 DSH、不调用模型、不发网络请求。双击 index.html 即可打开。</p></div>`);
}

function dlgAddCost() {
  openDialog('花费', '记一笔花费', `<div class="form-grid">
    <div class="field"><label>日期</label><input id="cost-d" type="date" value="${esc(P().window_end)}"></div>
    <div class="field"><label>金额（元）</label><input id="cost-a" type="number" min="0" step="0.01" placeholder="0.00"></div>
    <div class="field wide"><label>用途</label><input id="cost-p" placeholder="例如：复查 CT / 异地住宿 / 换药"></div>
    </div><p class="table-note" style="margin-top:9px">只记金额与用途，不判断是否值得、不推算报销比例。</p>`,
    '<button type="button" data-action="close">取消</button><button type="button" class="primary" data-action="save-cost">保存</button>');
}
function dlgAddContact() {
  openDialog('该联系谁', '加一个联系人', `<div class="form-grid">
    <div class="field"><label>称呼</label><input id="ct-n" placeholder="例如：女儿"></div>
    <div class="field"><label>关系</label><input id="ct-r" placeholder="例如：家属"></div>
    <div class="field"><label>电话</label><input id="ct-p" placeholder="只在本机演示"></div>
    <div class="field"><label>你希望先找他的情形</label><input id="ct-w" placeholder="你自己写，不由产品给阈值"></div>
    </div>`,
    '<button type="button" data-action="close">取消</button><button type="button" class="primary" data-action="save-contact">保存</button>');
}
function dlgAddQuestion() {
  openDialog('问题清单', '加一条想问的问题', `<div class="form-grid">
    <div class="field"><label>日期</label><input id="q-d" type="date" value="${esc(P().window_end)}"></div>
    <div class="field wide"><label>问题</label><input id="q-q" placeholder="写成一句能直接问出口的话"></div>
    </div><p class="table-note" style="margin-top:9px">产品只整理清单，不生成答案。</p>`,
    '<button type="button" data-action="close">取消</button><button type="button" class="primary" data-action="save-question">保存</button>');
}
function dlgAddTrial() {
  openDialog('临床研究', '记一条试验线索', `<div class="form-grid">
    <div class="field"><label>日期</label><input id="tr-d" type="date" value="${esc(P().window_end)}"></div>
    <div class="field"><label>登记号 / 标题</label><input id="tr-i" placeholder="医生提到的原文，没记住就写「未记」"></div>
    <div class="field wide"><label>当时怎么说的</label><input id="tr-n" placeholder="只记原话，不写判断"></div>
    </div><p class="table-note" style="margin-top:9px">登记状态一律标「未核实」；本台不判断是否符合入组条件。</p>`,
    '<button type="button" data-action="close">取消</button><button type="button" class="primary" data-action="save-trial">保存</button>');
}

/* ---------------- 事件 ---------------- */
function setFont(i) {
  state.font = i;
  const v = [1, 1.15, 1.32][i];
  document.documentElement.style.setProperty('--tz', String(v));
  $('#font-toggle').setAttribute('aria-pressed', String(i > 0));
  $('#font-toggle').textContent = ['字号 Aa', '大字 Aa', '特大 Aa'][i];
  toast(['字号：正常', '字号：大字', '字号：特大'][i]);
}

document.addEventListener('click', (e) => {
  const t = e.target;
  const rec = t.closest('[data-record]');
  if (rec && pv) { pv.open('record', { type: rec.dataset.record, id: rec.dataset.id }); return; }
  const rep = t.closest('[data-report]');
  if (rep && pv) { pv.open('report', { type: rep.dataset.report, id: rep.dataset.id }); return; }
  const pvb = t.closest('[data-pv]');
  if (pvb && pv) { pv.open(pvb.dataset.pv, { type: pvb.dataset.type, id: pvb.dataset.id }); return; }
  const view = t.closest('[data-view]');
  if (view) { setView(view.dataset.view, Number(view.dataset.sub || 0)); return; }
  const sub = t.closest('[data-sub]');
  if (sub && !t.closest('.subnav')) { setSub(Number(sub.dataset.sub)); return; }
  const subTab = t.closest('.subnav [data-sub]');
  if (subTab) { setSub(Number(subTab.dataset.sub)); return; }
  const mcardEl = t.closest('[data-mcard]');
  if (mcardEl && !mcardEl.dataset.static) {
    const k = mcardEl.dataset.mcard;
    if (state.flipped.has(k)) state.flipped.delete(k); else state.flipped.add(k);
    render();
    return;
  }
  const pin = t.closest('[data-pin-code]');
  if (pin) { state.pin = { code: pin.dataset.pinCode, date: pin.dataset.pinDate }; render(); return; }
  const range = t.closest('[data-range]');
  if (range) { state.range = range.dataset.range; render(); return; }
  const tessLimb = t.closest('[data-tess-limb]');
  if (tessLimb) {
    state.tess.limb = tessLimb.dataset.tessLimb;
    state.tess.answers = Array(state.tess.limb === '下肢' ? 30 : 29).fill(null);
    // 整页视图里的正文是独立节点，render() 不会重建它——必须自己重画，否则题数不变
    if (pv && pv.current === 'tess') { const b = t.closest('.pv-body'); if (b) b.innerHTML = pvTessBody(); }
    else render();
    return;
  }
  const intake = t.closest('[data-intake]');
  if (intake) {
    state.intake.decisions[intake.dataset.intake] = intake.dataset.decision;
    if (pv && pv.current === 'intake') { const b = t.closest('.pv-body'); if (b) b.innerHTML = intakeHtml(); }
    else render();
    return;
  }
  const prof = t.closest('[data-profile]');
  if (prof) {
    state.profile = prof.dataset.profile;
    resetProfileState();
    closeDialog();
    render();
    toast(`已换成 ${P().name}（回到看板，默认指标重置）`);
    return;
  }
  const fontBtn = t.closest('[data-font]');
  if (fontBtn) { setFont(Number(fontBtn.dataset.font)); return; }
  const sizeBtn = t.closest('[data-agent-size]');
  if (sizeBtn) {
    const w = { narrow: '300px', std: '372px', wide: '500px' }[sizeBtn.dataset.agentSize];
    // 用自定义属性而不是内联 gridTemplateColumns：内联声明会盖住 ≤1180px 的媒体查询，
    // 390 宽 + 500px 面板时主栏被压成 0px（P5 探针实测）。
    $('#work-grid').style.setProperty('--agent-w', w);
    toast('面板宽度：' + sizeBtn.textContent);
    return;
  }

  const actionEl = t.closest('[data-action]');
  if (!actionEl) return;
  const a = actionEl.dataset.action;
  if (a === 'close') { closeDialog(); return; }
  if (a === 'settings') { dlgSettings(); return; }
  if (a === 'about') { dlgAbout(); return; }
  if (a === 'profiles') { dlgProfiles(); return; }
  if (a === 'agent') {
    state.agentOpen = !state.agentOpen;
    renderAgent();
    toast(state.agentOpen ? 'AI 面板已展开（原型未接入模型）' : 'AI 面板已收起');
    return;
  }
  if (a === 'agent-build') { agentBuild(); return; }
  if (a === 'agent-check') { agentCheck(); return; }
  if (a === 'ask') {
    // IP10：示例问题只**预写**进输入框，不直接发送——点了按钮就出"回复"会让人以为真答了
    const q = actionEl.dataset.q || '';
    const box = $('#agent-q');
    if (box) { box.value = q; box.focus(); }
    return;
  }
  if (a === 'agent-ask') {
    const box = $('#agent-q');
    const q = (box && box.value ? box.value : '').trim();
    if (!q) { toast('先写一句要问的'); if (box) box.focus(); return; }
    agentSay(`你问：${q}\n\n这一句需要问你的医生。\n\n本原型没有接入模型，这里不会给出判断。能做的只有：把与这个问题有关的已记录事实按日期排一遍，供你带去门诊。`);
    return;
  }
  if (a === 'source') { openDialog('来源', '这条记录出自哪里', `<p style="font-size:calc(12.5px * var(--tz));line-height:1.8">${esc(actionEl.dataset.src)}</p><p class="table-note">原型里所有来源都是演示档案中的机构名 + 日期；真实版本点来源会回到原件。</p>`); return; }
  if (a === 'save-draft') { toast('已保存到本页草稿（原型不写磁盘）'); return; }
  if (a === 'tess-save') {
    const n = state.tess.answers.filter((x) => x !== null).length;
    L().tessSaved = { d: P().window_end, limb: state.tess.limb, answers: state.tess.answers.slice(), count: n };
    const st = $('#tess-status');
    if (st) st.textContent = `已记录 ${n} 题`;
    toast(`已记录 ${n} 题（不计算总分、不画趋势）`);
    return;
  }
  if (a === 'intake-demo') { state.intake.step = 2; if (pv && pv.current === 'intake') { $('.pv-body').innerHTML = intakeHtml(); } return; }
  if (a === 'intake-next') { state.intake.step = Math.min(4, state.intake.step + 1); if (pv && pv.current === 'intake') { $('.pv-body').innerHTML = intakeHtml(); } return; }
  if (a === 'add-cost') { dlgAddCost(); return; }
  if (a === 'save-cost') {
    const d = $('#cost-d').value; const amt = $('#cost-a').value; const purpose = $('#cost-p').value.trim();
    if (!d || !amt || !purpose) { toast('日期、金额、用途都要填'); return; }
    L().costs.push({ d, amount: amt, purpose }); closeDialog(); render(); toast('已记一笔花费（仅内存）'); return;
  }
  if (a === 'add-contact') { dlgAddContact(); return; }
  if (a === 'save-contact') {
    const name = $('#ct-n').value.trim(); const relation = $('#ct-r').value.trim(); const phone = $('#ct-p').value.trim(); const note = $('#ct-w').value.trim();
    if (!name) { toast('至少写一个称呼'); return; }
    L().contacts.push({ name, relation, phone, note }); closeDialog(); render(); toast('已加联系人（仅内存）'); return;
  }
  if (a === 'add-question') { dlgAddQuestion(); return; }
  if (a === 'save-question') {
    const d = $('#q-d').value; const q = $('#q-q').value.trim();
    if (!d || !q) { toast('日期和问题都要填'); return; }
    L().questions.push({ d, q, asked: 0, answer: '' }); closeDialog(); render(); toast('已加一条问题（仅内存）'); return;
  }
  if (a === 'add-trial') { dlgAddTrial(); return; }
  if (a === 'save-trial') {
    const d = $('#tr-d').value; const id = $('#tr-i').value.trim(); const note = $('#tr-n').value.trim();
    if (!d || !id) { toast('日期和登记号/标题都要填'); return; }
    L().trialNotes.push({ d, id, title: id, note }); closeDialog(); render(); toast('已记一条线索（登记状态未核实）'); return;
  }
  if (a === 'reload') { location.reload(); return; }
});

document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.matches('[data-metric]')) {
    const k = t.dataset.metric;
    if (t.checked) {
      if (state.sel.length >= 4) { t.checked = false; toast('一图秀最多 4 条序列'); return; }
      state.sel.push(k);
    } else state.sel = state.sel.filter((x) => x !== k);
    render();
    return;
  }
  if (t.matches('[data-tess-i]')) {
    state.tess.answers[Number(t.dataset.tessI)] = Number(t.value);
    return;
  }
  if (t.matches('[data-asked]')) {
    const i = Number(t.dataset.asked);
    const qs = P().questions.concat(L().questions);
    const q = qs[i];
    if (q) q.asked = t.checked ? 1 : 0;
    return;
  }
  if (t.matches('#intake-file')) {
    if (t.files && t.files[0]) {
      state.intake.step = 2;
      if (pv && pv.current === 'intake') $('.pv-body').innerHTML = intakeHtml();
      toast(`已选：${t.files[0].name}（原型只读文件名）`);
    }
  }
});

document.addEventListener('input', (e) => {
  if (e.target.matches('[data-zoom]')) {
    state.zoom = Number(e.target.value);
    const span = e.target.parentElement.querySelector('span');
    if (span) span.textContent = `${state.zoom}%`;
    const wrap = document.querySelector('.chart-wrap');
    if (wrap) { const [t0, t1] = domain(); wrap.innerHTML = chartSVG(t0, t1); }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $('#dialog').open) { closeDialog(); }
});

/* ---------------- 启动 ---------------- */
renderNav();
renderProfileChip();
render();
$('#font-toggle').addEventListener('click', () => setFont((state.font + 1) % 3));
$('#profile-btn').addEventListener('click', dlgProfiles);
$('#agent-toggle').addEventListener('click', (e) => { e.preventDefault(); state.agentOpen = !state.agentOpen; renderAgent(); });
$('#ver-chip').addEventListener('click', dlgAbout);
$('#dialog').addEventListener('click', (e) => { if (e.target === $('#dialog')) closeDialog(); });

/* 深链：#page=record&type=pathology&id=0 */
if (pv) pv.openFromHash();
