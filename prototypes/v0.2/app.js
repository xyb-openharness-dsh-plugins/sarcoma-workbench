'use strict';
/* 小肉宝 SarcoPal v0.1.0 — 交互原型（软组织肉瘤）
   患者数据全部为虚构演示；不读写真实文件、不调用模型或宿主 API。
   品牌色：深绿松（--violet 重映射）+ 暖砂（--orange），区别于小莲宝青绿与小粉宝粉。

   与移植底本（宫颈癌 v0.2）的结构差异——改前先看，两边不许互相抄：
   1. 一级页 11 个 / 二级 32 个。**没有「我的分期」独立一级**：STS 分期组依赖部位，
      独立成页会诱导患者自己算（ADR-2）。分期并入「我的亚型 · 分级与部位」，与分级并列。
   2. **局部治疗与全身治疗是两个一级页**，不是一条「治疗历程」。STS 的局部与全身常同期并行
      （H7），压成单链=（本癌种最大的结构错误）。
   3. **没有「一图秀」**：STS 没有贯穿全病程的数值指标，强行做图=假趋势。影像走「基线锚点 +
      原文并列对照」，指标走分组卡片 + 单指标趋势。
   4. 「功能与康复」独立一级（肢体功能/淋巴水肿/伤口与皮肤），这是 STS 最长尾的日常问题。
   5. 「心理与家庭」含「生育与亲密」私密二级，默认不导出、不进摘要、不进 AI 上下文。
   6. 治疗线用 32 号折叠卡：默认概要，展开固定五块（方案/指标和趋势/影像发现/副作用总结/支持措施）。
*/

const APP_INFO = { version: '0.1.0', build: '2026-10-25', channel: 'prototype', channelLabel: '交互原型 · 未接入 DSH' };
const D = window.DEMO;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let uidSeq = 0;
const uid = (p) => p + (++uidSeq);
const num = (n, d = 1) => (n === null || n === undefined || n === '' ? '—' : Number(n).toFixed(d).replace(/\.0$/, ''));
const TODAY = '2026-10-25';

/* ---------------- icons ---------------- */
const ICONS = {
  home: 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
  dna: 'M7 3c0 6 10 6 10 12M17 3c0 6-10 6-10 12M7 21c0-2 10-2 10 0M7 3c0 2 10 2 10 0',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M3 12h18',
  knife: 'M4 20 18 6a2 2 0 0 1 3 3L7 23M4 20l3 3M9 3l6 6',
  drip: 'M12 3v6m0 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM8 8h8',
  leg: 'M9 3v7l-3 8v3M9 10l4 3 1 8M15 3v5M9 3h6',
  lab: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7 15h10',
  cal: 'M4 6h16v15H4zM4 10h16M8 3v5M16 3v5',
  flask: 'M9 3h6M10 3v5l-4 11a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-4-11V3M8 14h8',
  heart: 'M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2 4.5 4.5 0 0 1 8 2c0 6-8 11-8 11Z',
  folder: 'M3 7h7l2 3h9v11H3z',
  info: 'M12 8v.01M12 11v6M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
  lock: 'M6 11V8a6 6 0 1 1 12 0v3M5 11h14v10H5z',
};
const icon = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[k] || ICONS.info}"/></svg>`;

/* ---------------- nav ---------------- */
const PAGES = [
  ['dashboard', '看板', 'home'],
  ['subtype', '我的亚型', 'dna'],
  ['imaging', '影像与基线', 'scan'],
  ['local', '局部治疗', 'knife'],
  ['systemic', '全身治疗', 'drip'],
  ['function', '功能与康复', 'leg'],
  ['metrics', '指标与报告', 'lab'],
  ['followup', '复诊与随访', 'cal'],
  ['trials', '试验与线索', 'flask'],
  ['mind', '心理与家庭', 'heart'],
  ['records', '资料与导出', 'folder'],
];
const SUBPAGES = {
  subtype: ['病理原文', '分级与部位', '分子与免疫组化', '会诊与二次意见'],
  imaging: ['基线锚点', '复查记录', '报告原文对照'],
  local: ['手术记录', '放疗疗程', '切缘与并发症'],
  systemic: ['治疗线总览', '周期与用药', '换线记录'],
  function: ['肢体功能', '淋巴水肿', '伤口与皮肤'],
  metrics: ['血象', '肝肾与心肌', '趋势对照'],
  followup: ['复查日历', '待办与问题', '就诊准备'],
  trials: ['检索入口', '关注与入组'],
  mind: ['当下感受', '私密记录', '支持资源', '生育与亲密'],
  records: ['资料库', '草稿核对', '导出快照', '隐私与分享'],
};
const TOTAL_SUB = Object.values(SUBPAGES).reduce((n, a) => n + a.length, 0);

/* ---------------- state ---------------- */
const state = {
  profile: 0,
  view: 'dashboard',
  sub: 0,
  large: false,
  showPrivate: false,
  metricPick: '白细胞计数 WBC',
  agentDraft: null,
  toast: null,
  dialog: null,
  candidateOpen: false,
  // demoOff 默认 false：本原型里每条记录都 in_use=1，勾上会导出 0 条——
  // 那正好证明开关生效，但不能当默认值，否则演示看起来像坏了。
  // 纪律优先于演示观感：演示数据默认排除（SPEC §4.2 / K5）。
  // 默认导出为空不是 bug，是开关在工作；页面必须把这个"空"解释清楚，而不是把默认值改反。
  exportOpts: { privateOn: false, demoOff: true, from: '2025-01-01', to: TODAY },
  moodDraft: '',
  lastExport: null,
  trialsQuery: '',
  trialFilter: 'all',
  visited: new Set(['dashboard']),
};
const P = () => D.profiles[state.profile];

/* ---------------- 三出口过滤（K5 / DEV-REQ R7） ----------------
   **实现不在这里**：见 ./exits.js。这里只做解构 + 绑定 TODAY。
   理由：同一段口径必须被产品与测试同时加载。写在 app.js 里时，
   测试只能在测试文件里重写一遍同名函数，于是"全绿"与产品行为无关（P1-18）。 */
const EXITS = globalThis.SARCO_EXITS;
if (!EXITS) throw new Error('exits.js 未加载：三出口过滤缺失，导出/AI/一页纸会失去私密与演示数据过滤');
const {
  visible, privateCount, canLeave, exportable, optsFromUI, inRange, allPrivate,
  buildExportSnapshot: _buildExportSnapshot,
  buildAgentContext: _buildAgentContext,
  buildVisitPrepSheet: _buildVisitPrepSheet,
} = EXITS;
// 生成时间由 app 注入（exits.js 不依赖 TODAY 常量）
const buildExportSnapshot = (p, opts = {}) => _buildExportSnapshot(p, { today: TODAY, ...opts });
const buildAgentContext = (p) => _buildAgentContext(p);
const buildVisitPrepSheet = (p) => _buildVisitPrepSheet(p);

/* ---------------- shell ---------------- */
function nav() {
  return PAGES.map(([id, label, ic]) => {
    const on = state.view === id ? ' aria-current="page"' : '';
    const count = SUBPAGES[id] ? `<span class="nav-count">${SUBPAGES[id].length}</span>` : '';
    return `<button class="nav-button"${on} data-nav="${id}">${icon(ic)}<span>${esc(label)}</span>${count}</button>`;
  }).join('');
}
function profileSwitcher() {
  return D.profiles.map((p, i) => `<button class="profile-item${i === state.profile ? ' on' : ''}" data-profile="${i}">
    <span class="avatar">${esc(p.short)}</span>
    <span><b>${esc(p.name)}</b><span>${esc(p.site)} · ${esc(p.subtype.name)}</span></span>
    <span class="pill ${p.recorder === 'caregiver' ? 'orange' : 'green'}">${esc(p.recorderLabel)}</span>
  </button>`).join('');
}
function subnav() {
  const subs = SUBPAGES[state.view];
  if (!subs) return '';
  return `<div class="subtabs" role="tablist">${subs.map((s, i) => `<button role="tab" class="subtab" aria-selected="${i === state.sub}" data-sub="${i}">${esc(s)}</button>`).join('')}</div>`;
}
function breadcrumb() {
  const label = (PAGES.find((p) => p[0] === state.view) || [])[1] || '';
  const subs = SUBPAGES[state.view] || [];
  const sub = subs[state.sub];
  return `<div class="breadcrumb">${esc(P().name)}<span>/</span><b>${esc(label)}</b>${sub ? `<span>/</span>${esc(sub)}` : ''}</div>`;
}
function topbar() {
  const p = P();
  return `<header class="topbar">
    <div class="breadcrumb-wrap">${breadcrumb()}</div>
    <div class="top-actions">
      <span class="ver-chip" title="版本与构建">v${APP_INFO.version} · ${APP_INFO.build}</span>
      <span class="status"><i class="${p.recorder === 'caregiver' ? 'orange' : ''}"></i>当前档案 <b>${esc(p.name)}</b></span>
      <button class="soft" data-action="toggle-large" aria-pressed="${state.large}">${state.large ? '常规字号' : '大字'}</button>
      <button class="soft" data-action="agent-draft" data-prompt="我想问关于我病情的问题">AI 对话</button>
    </div>
  </header>`;
}
function footer() {
  return `<footer class="footer">
    <span>${esc(D.meta.brand.zh)} ${esc(D.meta.brand.en)} · ${esc(D.meta.brand.tag)} · ${esc(D.meta.oncologyNote)}</span>
    <span>${esc(D.meta.guideNote)}</span>
  </footer>`;
}

/* ---------------- shared bits ---------------- */
function pageHead(title, desc, actions = '') {
  return `<div class="page-head"><div><h1>${esc(title)}</h1>${desc ? `<p>${desc}</p>` : ''}</div><div class="actions">${actions}</div></div>`;
}
function notice(kind, html) {
  return `<div class="notice ${kind}">${html}</div>`;
}
function empty(title, desc, actionLabel = '', actionAttr = '') {
  return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(desc)}</p>${actionLabel ? `<button class="soft" ${actionAttr} style="margin-top:12px">${esc(actionLabel)}</button>` : ''}</div>`;
}
function pill(text, kind = '') {
  return `<span class="pill ${kind}">${esc(text)}</span>`;
}
function recorderBadge(r) {
  return r === 'caregiver' ? pill('家属代记', 'orange') : pill('本人记录', 'green');
}
function sourceLine(src) {
  return `<small class="src">出处：${esc(src)}</small>`;
}
function moreMenu(items) {
  return `<details class="more"><summary>⋯ 更多</summary><div class="more-body">${items.map((i) => `<button class="text-button" ${i.attr || ''}>${esc(i.label)}</button>`).join('')}</div></details>`;
}
function agentButton(prompt, label = 'AI 协助示例') {
  return `<button class="soft agent" data-action="agent-draft" data-prompt="${esc(prompt)}">${esc(label)}</button>`;
}

/* ---------------- Fritsch–Carlson monotone smooth path (doc 16) ---------------- */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  const n = pts.length;
  const dx = [], dy = [], slope = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; dy[i] = pts[i + 1][1] - pts[i][1]; slope[i] = dy[i] / (dx[i] || 1e-9); }
  const t = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) t[i] = 0;
    else { const w1 = 2 * dx[i] + dx[i - 1], w2 = dx[i] + 2 * dx[i - 1]; t[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]); }
  }
  t[n - 1] = slope[n - 2];
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const x0 = pts[i][0], y0 = pts[i][1], x1 = pts[i + 1][0], y1 = pts[i + 1][1], h = (x1 - x0) / 3;
    d += ` C${x0 + h},${y0 + t[i] * h} ${x1 - h},${y1 - t[i + 1] * h} ${x1},${y1}`;
  }
  return d;
}
/** 单指标趋势图：SVG 根 class="chart"，单点不连线（doc 16）。 */
function lineChart(series, { w = 640, h = 200, ref = null, unit = '', label = '' } = {}) {
  const pad = { l: 46, r: 16, t: 16, b: 30 };
  const xs = series.map((s) => s.x), ys = series.map((s) => s.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  let minY = Math.min(...ys, ref ?? Infinity), maxY = Math.max(...ys, ref ?? -Infinity);
  if (!isFinite(minY)) { minY = 0; maxY = 1; }
  const spanY = maxY - minY || 1; minY -= spanY * 0.12; maxY += spanY * 0.12;
  const sx = (x) => pad.l + ((x - minX) / (maxX - minX || 1)) * (w - pad.l - pad.r);
  const sy = (y) => h - pad.b - ((y - minY) / (maxY - minY || 1)) * (h - pad.t - pad.b);
  const pts = series.map((s) => [sx(s.x), sy(s.y)]);
  const path = pts.length > 1 ? smoothPath(pts) : '';
  const dots = series.map((s) => `<circle cx="${sx(s.x).toFixed(1)}" cy="${sy(s.y).toFixed(1)}" r="3.6" class="pt"><title>${esc(s.label)} ${num(s.y, 2)} ${esc(unit)}</title></circle>`).join('');
  const refLine = ref === null ? '' : `<line class="ref" x1="${pad.l}" x2="${w - pad.r}" y1="${sy(ref)}" y2="${sy(ref)}"/><text class="ax" x="${pad.l - 6}" y="${sy(ref) + 3}" text-anchor="end">${esc(String(ref))}</text>`;
  const yTicks = [minY, (minY + maxY) / 2, maxY].map((v) => `<text class="ax" x="${pad.l - 6}" y="${sy(v) + 3}" text-anchor="end">${num(v, 1)}</text>`).join('');
  const xTicks = series.filter((_, i) => i === 0 || i === series.length - 1).map((s) => `<text class="ax" x="${sx(s.x)}" y="${h - 8}" text-anchor="middle">${esc(s.label)}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label || '指标')} 趋势（${series.length} 个点，单位 ${esc(unit || '未标注')}）">${refLine}${path ? `<path class="line" d="${path}"/>` : ''}${dots}${yTicks}${xTicks}</svg>`;
}

/* ---------------- AI 候选（演示态） ----------------
   候选必须由**本档案的真实记录**推导，否则代记档案会拿到另一位患者的提问（P1-14）。
   这里不调用模型：只把"档案里有哪些值得问医生的事实"映射成问句骨架，且仍然要人核对。 */
function draftQuestions(p) {
  const out = [];
  const sys = visible(p.systemic).filter((x) => !x.in_use);
  const last = sys[sys.length - 1];
  if (last) out.push(`第 ${last.lineNo} 线（${last.regimen}）现在到第几周期了，后面的计划是什么？`);
  const lowWbc = visible(p.metrics).filter((m) => /WBC|白细胞/i.test(m.name) && Number(m.value) < 3.0);
  if (lowWbc.length) out.push(`白细胞降到 ${lowWbc[lowWbc.length - 1].value} 那一次（${lowWbc[lowWbc.length - 1].date}），下一次还能按原计划打吗？`);
  const alt = visible(p.metrics).filter((m) => /ALT/i.test(m.name));
  if (alt.length > 1 && Number(alt[alt.length - 1].value) > Number(alt[0].value) * 1.5) out.push(`ALT 从 ${alt[0].value} 升到 ${alt[alt.length - 1].value}，需要调整方案吗？`);
  const lumps = visible(p.metrics).filter((m) => /cm|周径/.test(m.unit || ''));
  if (lumps.length > 1) out.push(`${lumps[0].measure || '这个部位'}从 ${lumps[0].value}${lumps[0].unit} 变到 ${lumps[lumps.length - 1].value}${lumps[lumps.length - 1].unit}，这算变化吗？`);
  const priv = allPrivate(p);
  out.push(`（本档案有 ${priv} 条私密记录，未进入这次上下文）我想问的还有：`);
  return out.length ? out : ['还没有足够记录来生成候选——先记一条，再让我整理。'];
}

/* ---------------- dashboard ---------------- */
function viewDashboard() {
  const p = P();
  const lastImaging = p.imaging.filter((i) => i.site === p.site).slice(-1)[0];
  const nextVisit = p.visits.find((v) => v.planned);
  const activeSys = p.systemic.find((s) => s.status === '进行中');
  const baseline = p.imaging.find((i) => i.baseline && i.site === p.site);
  const pending = p.candidates.filter((c) => c.status === 'pending').length;
  const priv = allPrivate(p);   // viewpoint + fertility，各算一次（原来 fertility 被算了两次，看板显示 3 实际 2）
  return `${pageHead(`${p.name}的看板`, `${esc(p.site)} · ${esc(p.subtype.name)} · ${esc(p.subtype.grade)} · ${esc(p.recorderLabel)}`,
    `<button class="soft" data-action="open-candidates">待核对 ${pending} 条</button>${agentButton('我想整理一下最近一次的复查资料', 'AI 协助整理')}`)}
  <div class="hero">
    <div>
      <div class="eyebrow">资料截至 ${TODAY}</div>
      <h1>${esc(p.subtype.name)}</h1>
      <p>${esc(p.subtype.grade)} · 报告写的分期：${esc(p.subtype.stageText)} · ${esc(p.site)}${p.subtype.stageNote ? ` · <span class="muted">${esc(p.subtype.stageNote)}</span>` : ''}</p>
      <div class="actions">
        <button class="primary" data-nav="followup" data-sub="2">准备下次复诊</button>
        <button class="soft" data-nav="imaging" data-sub="0">看看基线是哪次</button>
      </div>
    </div>
    <div class="hero-mark">${icon('dna', 'hero-ic')}<span>${esc(D.meta.brand.zh)}</span></div>
  </div>
  <div class="dashboard-grid">
    <div class="stack">
      <div class="card">
        <div class="card-head"><h2>接下来</h2><span class="muted">按时间</span></div>
        <div class="rows">
          ${nextVisit ? row(`下次复诊 · ${esc(nextVisit.date)}`, esc(nextVisit.purpose), `data-nav="followup" data-sub="2"`) : ''}
          ${activeSys ? row(`治疗进行中 · ${esc(activeSys.regimen)}`, `第 ${activeSys.cycleNo} 周期 · ${esc(activeSys.cyclePlan)}`, `data-nav="systemic" data-sub="1"`) : ''}
          ${lastImaging ? row(`最近影像 · ${esc(lastImaging.date)}`, `${esc(lastImaging.modality)} · ${esc(lastImaging.wording.slice(0, 34))}…`, `data-nav="imaging" data-sub="1"`) : ''}
          ${row('想问的问题', p.visits[0] ? esc(p.visits[0].questions[0]) : '还没有记录', `data-nav="followup" data-sub="1"`)}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>今天可以做的事</h2></div>
        <div class="rows">
          ${row('把想问的写下来', '门诊只有几分钟，先说最想问的那一条', `data-nav="followup" data-sub="1"`)}
          ${row('记一次身体反应', '按自述写，不用判断严重不严重', `data-nav="function" data-sub="2"`)}
          ${row('核对待核对的草稿', `还有 ${pending} 条候选没确认`, 'data-action="open-candidates"')}
        </div>
      </div>
    </div>
    <div class="stack">
      <div class="card accent">
        <div class="card-head"><h2>基线锚点</h2>${pill(baseline ? '已设基线' : '尚无基线', baseline ? 'green' : 'grey')}</div>
        ${baseline ? `<p class="baseline-text">${esc(baseline.date)} · ${esc(baseline.modality)}</p><p class="muted small">${esc(baseline.wording)}</p>${sourceLine(baseline.source)}`
          : `<p class="muted small">还没有把任何一次影像设为基线。设置后，后续复查都拿它作参照。</p><button class="soft" data-nav="imaging" data-sub="0" style="margin-top:10px">去设置基线</button>`}
      </div>
      <div class="card">
        <div class="card-head"><h2>我的记录构成</h2></div>
        <div class="stat-band">
          <span><b>${p.pathologies.length}</b>份病理</span>
          <span><b>${p.imaging.length}</b>次影像</span>
          <span><b>${p.systemic.length}</b>条治疗线</span>
          <span><b>${p.metrics.length}</b>条指标</span>
          <span><b>${priv}</b>条私密<small>（默认不导出）</small></span>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>术语卡</h2><span class="muted">编辑归纳</span></div>
        <div class="rows">${D.glossary.slice(0, 3).map((g) => row(g.k, g.v.slice(0, 40) + '…', 'data-action="open-glossary"')).join('')}</div>
      </div>
    </div>
  </div>`;
}
function row(title, desc, attr) {
  return `<button class="row theme-row" ${attr}><span class="row-main"><span><b>${esc(title)}</b><p>${esc(desc)}</p></span></span><span class="arrow">›</span></button>`;
}

/* ---------------- subtype ---------------- */
function viewSubtype() {
  const p = P(), s = p.subtype, sub = state.sub;
  if (sub === 0) return viewPathology();
  if (sub === 1) return viewGradeStage();
  if (sub === 2) return viewMolecular();
  return viewConsult();
}
function viewPathology() {
  const p = P();
  return `${pageHead('病理原文', '每条病理一张卡：亚型 / 分级 / 部位与深浅 / 分子与免疫组化。只照录报告，不推断。',
    `${agentButton('我拍一张病理报告，帮我抄成条目', 'AI 抄报告')}${moreMenu([{ label: '手工补一条病理' }, { label: '看原件' }])}`)}
  ${notice('violet', '<b>为什么不能自动判断亚型：</b>亚型是病理科结合形态、免疫组化与分子检测给出的分类结论，工作台只记录报告原文。报告没写就显示「报告未写明」，不补默认值。')}
  <div class="stack">
  ${p.pathologies.map((x) => `<div class="card">
    <div class="card-head"><div><h2>${esc(x.kind)}</h2><p class="muted small">${esc(x.date)} · ${esc(x.source)}</p></div><div class="actions">${recorderBadge(x.recorder)}${moreMenu([{ label: '改这一条' }, { label: '看原件' }])}</div></div>
    <div class="kv-grid">
      ${kv('亚型（报告原文）', x.subtypeText)}
      ${kv('分级（报告原文）', x.gradeText)}
      ${kv('部位', x.site)}
      ${kv('深浅', x.depthText)}
      ${kv('切缘', x.marginText)}
      ${kv('出处', x.source)}
    </div>
  </div>`).join('')}
  </div>`;
}
function kv(k, v) { return `<div class="kv"><span>${esc(k)}</span><b>${esc(v || '报告未写明')}</b></div>`; }
function viewGradeStage() {
  const p = P(), s = p.subtype;
  return `${pageHead('分级与部位', '左栏是报告写的分级，右栏是医生记录的分期。两栏并列，不做换算。',
    moreMenu([{ label: '改这一条' }, { label: '看报告原文' }]))}
  ${notice('warn', '<b>分级 ≠ 分期。</b>分级是显微镜下的恶性程度（FNCLCC G1–G3）；分期是病变范围（TNM+G），且 STS 的分期组按部位分设——同一个 TNM 在腹膜后与四肢可能得到不同分期。两者不能互相换算，具体以医生判断为准。')}
  <div class="grid two">
    <div class="card">
      <div class="card-head"><h2>分级（病理报告写的）</h2>${pill(s.grade, 'violet')}</div>
      <p class="big-value">${esc(s.grade)}</p>
      ${sourceLine(s.gradeSource)}
      <div class="divider"></div>
      <p class="muted small"><b>FNCLCC 三要素</b>（仅说明口径，本工作台不计算）：分化 + 核分裂数 + 坏死，三项加总 2–3 = G1、4–5 = G2、6–8 = G3。</p>
      ${moreMenu([{ label: '这项是谁写的' }])}
    </div>
    <div class="card">
      <div class="card-head"><h2>分期（医生记录的）</h2>${pill(p.site, 'grey')}</div>
      <p class="big-value">${esc(s.stageText)}</p>
      <p class="muted small">部位：${esc(p.site)} · 深浅：${esc(p.depthText)}</p>
      <div class="divider"></div>
      ${notice('plain', '报告没有给出的项，这里留空并写「报告未写明」，<b>不会自动补算</b>。')}
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>分级与分期在报告里的位置</h2></div>
    <div class="rows">
      ${row('组织学类型', 'CAP 模板的必填字段，取自 WHO 分类', 'data-action="open-glossary"')}
      ${row('Histologic Grade (FNCLCC)', '报告里固定四选一：G1 / G2 / G3 / 未分级', 'data-action="open-glossary"')}
      ${row('pTNM Classification (AJCC 8th)', '报告里可能带 pTNM；临床分期由医生另行记录', 'data-action="open-glossary"')}
    </div>
  </div>`;
}
function viewMolecular() {
  const p = P();
  return `${pageHead('分子与免疫组化', '每个缩写一行：检测名称 / 结果 / 方法 / 报告原文。只说明"检测了什么"。',
    `${agentButton('我拍一张免疫组化报告', 'AI 抄检测项')}${moreMenu([{ label: '手工补一行' }])}`)}
  ${notice('violet', '免疫组化（IHC）测的是<b>蛋白表达</b>，分子检测测的是<b>基因层面改变</b>；两者都只是病理科用于分类的辅助信息，<b>单独不能定亚型</b>。')}
  <div class="card">
    <div class="card-head"><h2>免疫组化</h2><span class="muted">${p.subtype.ihc.length} 项</span></div>
    <table class="table"><thead><tr><th>检测项</th><th>结果</th><th>这条在测什么</th></tr></thead><tbody>
    ${p.subtype.ihc.map((x) => `<tr><td><b>${esc(x.k)}</b></td><td>${esc(x.v)}</td><td class="muted">${esc(x.note || '—')}</td></tr>`).join('')}
    </tbody></table>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>分子检测</h2><span class="muted">${p.subtype.molecular.length} 项</span></div>
    <table class="table"><thead><tr><th>检测</th><th>结果</th><th>方法</th></tr></thead><tbody>
    ${p.subtype.molecular.map((x) => `<tr><td><b>${esc(x.k)}</b></td><td>${esc(x.v)}</td><td class="muted">${esc(x.method)}</td></tr>`).join('')}
    </tbody></table>
    <p class="small-note">分子结果与亚型的对应关系见「术语卡」。工作台不据分子结果反推亚型——这是病理科的综合判断。</p>
  </div>`;
}
function viewConsult() {
  const p = P();
  return `${pageHead('会诊与二次意见', '把两家医院说过的话并列，不做评价。',
    moreMenu([{ label: '加一次会诊记录' }, { label: '要带的资料清单' }]))}
  <div class="card">
    <div class="card-head"><h2>已记录的会诊</h2></div>
    <div class="stack">
      ${p.subtype.consult.map((c) => `<div class="row static"><div class="row-main"><div><b>${esc(c.hospital)} · ${esc(c.kind)}</b><p>${esc(c.text)}</p><small class="src">${esc(c.date)}</small></div></div></div>`).join('')}
    </div>
  </div>
  <div class="grid two" style="margin-top:14px">
    <div class="card"><div class="card-head"><h2>要带的资料</h2></div><div class="rows">
      ${['病理切片 / 白片（向原医院借）', '影像光盘或原始 DICOM', '出院记录与手术记录复印件', '已有报告原件（含免疫组化与分子）', '正在用的药与剂量清单'].map((t) => `<div class="row static"><div class="row-main"><div><b>${esc(t)}</b></div></div></div>`).join('')}
    </div></div>
    <div class="card"><div class="card-head"><h2>会诊时可以问</h2></div><div class="rows">
      ${['我的亚型和分级，两家医院的写法一致吗？', '切缘的状态，两家的描述一致吗？', '如果需要再做一次病理会诊，要补哪几项检测？'].map((t) => `<div class="row static"><div class="row-main"><div><b>${esc(t)}</b></div></div></div>`).join('')}
      <button class="soft" data-nav="followup" data-sub="1">把这些加进问题清单</button>
    </div></div>
  </div>`;
}

/* ---------------- imaging ---------------- */
function viewImaging() {
  if (state.sub === 0) return viewBaseline();
  if (state.sub === 1) return viewImagingList();
  return viewImagingDiff();
}
function viewBaseline() {
  const p = P();
  const site = p.site;
  const list = p.imaging.filter((i) => i.site === site);
  const active = list.find((i) => i.baseline);
  return `${pageHead('基线锚点', '全库最多一条激活基线。后续复查都拿它作参照，工作台不自算变化率。',
    `${agentButton('我想把这次复查设成新的基线', 'AI 协助设置')}${moreMenu([{ label: '为什么只能有一条基线' }])}`)}
  ${notice('violet', '<b>基线是什么：</b>治疗结束（或随访开始）那次影像，后续检查都与之对照。报告里的「较前」指的就是某一次——通常就是基线。')}
  <div class="card">
    <div class="card-head"><h2>当前基线（${esc(site)}）</h2>${active ? pill('激活中', 'green') : pill('尚未设置', 'grey')}</div>
    ${active ? `<div class="baseline-box">
        <b>${esc(active.date)} · ${esc(active.modality)}</b>
        <p>${esc(active.wording)}</p>
        ${sourceLine(active.source)}
        <div class="actions" style="margin-top:10px"><button class="soft" data-action="set-baseline" data-id="${esc(active.id)}">改换基线</button></div>
      </div>` : `<p class="muted">还没有基线。选一次影像设为基线，后续复查就有了对照。</p>`}
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>可选为基线的影像（${esc(site)}）</h2><span class="muted">${list.length} 次</span></div>
    <div class="stack">
      ${list.map((i) => `<div class="pick-row">
        <div><b>${esc(i.date)} · ${esc(i.modality)}</b><p class="muted small">${esc(i.wording.slice(0, 46))}…</p></div>
        <div class="actions">${i.baseline ? pill('当前基线', 'green') : `<button class="soft" data-action="set-baseline" data-id="${esc(i.id)}">设为基线</button>`}</div>
      </div>`).join('')}
    </div>
    <p class="small-note">设为新基线时，原基线自动失活——库里同时只允许一条激活基线（避免"哪次是基线"这个问题的第二个答案）。</p>
  </div>`;
}
function viewImagingList() {
  const p = P();
  const list = p.imaging;
  return `${pageHead('复查记录', '按部位与时间倒序。每条只记报告原文与「对照哪次」。',
    `${agentButton('我拍一张影像报告，帮我抄成一条', 'AI 抄报告')}${moreMenu([{ label: '手工补一条影像' }])}`)}
  ${notice('plain', '工作台<b>不判读影像</b>：不写"进展/稳定/好转"，不改写医生措辞，不计算病灶变化率。只做两件事——存原文、标对照。')}
  <div class="stack">
    ${list.slice().reverse().map((i) => `<div class="card">
      <div class="card-head"><div><h2>${esc(i.date)} · ${esc(i.modality)}</h2><p class="muted small">部位：${esc(i.site)}${i.baseline ? ' · <b>基线</b>' : ''}${i.comparedTo ? ` · 对照：${esc(i.comparedTo)}` : ''}</p></div>
      <div class="actions">${recorderBadge(i.recorder)}${moreMenu([{ label: '改这一条' }, { label: '看原件' }])}</div></div>
      <blockquote class="quote">${esc(i.wording)}</blockquote>
      ${sourceLine(i.source)}
      ${i.baselineNote ? `<p class="small-note">${esc(i.baselineNote)}</p>` : ''}
    </div>`).join('')}
  </div>`;
}
function viewImagingDiff() {
  const p = P();
  const site = p.site;
  const list = p.imaging.filter((i) => i.site === site).slice(-2);
  return `${pageHead('报告原文对照', '两段原文并列 + 时间间隔。中间不写结论。', moreMenu([{ label: '换一组对照' }]))}
  ${notice('warn', '报告里出现「较前增大」「新发结节」这类词时，工作台只解释这个词在描述什么（见下方词表），<b>不解释"这意味着好转还是恶化"</b>——那是医生判断。')}
  <div class="grid two">
    ${list.map((i) => `<div class="card"><div class="card-head"><h2>${esc(i.date)}</h2>${i.baseline ? pill('基线', 'green') : pill('复查', 'grey')}</div>
      <p class="muted small">${esc(i.modality)}</p><blockquote class="quote">${esc(i.wording)}</blockquote>${sourceLine(i.source)}</div>`).join('')}
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>两次间隔</h2></div>
    <p class="big-value">约 ${monthsBetween(list[0]?.date, list[1]?.date)} 个月</p>
    <p class="small-note">间隔本身不是结论：复查间隔由医生按个人情况定（公开参考值见「复诊与随访」）。</p>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>影像报告词表</h2><span class="muted">编辑归纳，不构成判读</span></div>
    <table class="table"><thead><tr><th>报告里的词</th><th>它描述的是</th><th>通俗解释</th></tr></thead><tbody>
    ${D.imagingTerms.map((t) => `<tr><td><b>${esc(t.word)}</b></td><td class="muted">${esc(t.layer)}</td><td>${esc(t.explain)}</td></tr>`).join('')}
    </tbody></table>
  </div>`;
}
function monthsBetween(a, b) {
  if (!a || !b) return '—';
  const [y1, m1] = a.split('-').map(Number), [y2, m2] = b.split('-').map(Number);
  return Math.max(0, (y2 - y1) * 12 + (m2 - m1)).toFixed(0);
}

/* ---------------- local treatment ---------------- */
function viewLocal() {
  if (state.sub === 0) return viewLocalList('surgery');
  if (state.sub === 1) return viewLocalList('rt');
  return viewLocalComplications();
}
function viewLocalList(kind) {
  const p = P();
  const list = p.local.filter((l) => l.kind === kind);
  const title = kind === 'surgery' ? '手术记录' : '放疗疗程';
  return `${pageHead(title, kind === 'surgery' ? '术式、切缘、并发症分开记。切缘只照录报告原文。' : '次数、部位、总剂量照录；皮肤反应记在「功能与康复」。',
    `${agentButton(kind === 'surgery' ? '我拍一张出院记录' : '我拍一张放疗计划单', 'AI 抄记录')}${moreMenu([{ label: kind === 'surgery' ? '手工补一条手术' : '手工补一个疗程' }])}`)}
  ${list.length === 0 ? empty('还没有记录', kind === 'surgery' ? '先记一次手术，切缘会用得上。' : '先记一个放疗疗程。') : `<div class="stack">
    ${list.map((l) => `<div class="card">
      <div class="card-head"><div><h2>${esc(l.title)}</h2><p class="muted small">${esc(l.dateStart)}${l.dateEnd && l.dateEnd !== l.dateStart ? ' → ' + esc(l.dateEnd) : ''} · ${esc(l.status)}</p></div>
      <div class="actions">${recorderBadge(l.recorder)}${moreMenu([{ label: '改这一条' }, { label: '看原件' }])}</div></div>
      <p>${esc(l.detail)}</p>
      ${l.margin ? `<p class="margin-line">切缘（报告原文）：<b>${esc(l.margin)}</b></p>` : ''}
    </div>`).join('')}
  </div>`}`;
}
function viewLocalComplications() {
  const p = P();
  const all = p.local.flatMap((l) => (l.complications || []).map((c) => ({ ...c, from: l.title, kind: l.kind })));
  return `${pageHead('切缘与并发症', '并发症只记自述与处理，不判断是否感染、不评级。',
    moreMenu([{ label: '手工补一条' }]))}
  ${notice('plain', '工作台<b>不判断伤口是否感染、不做放射性皮炎分级</b>。只记录"哪天、什么表现、怎么处理"。')}
  <div class="card">
    <div class="card-head"><h2>切缘记录</h2></div>
    ${p.pathologies.filter((x) => x.marginText && x.marginText !== '—（活检）').map((x) => `<div class="row static"><div class="row-main"><div><b>${esc(x.date)} · ${esc(x.kind)}</b><p>切缘：${esc(x.marginText)}</p>${sourceLine(x.source)}</div></div></div>`).join('') || '<p class="muted">还没有切缘记录。</p>'}
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>并发症与处理</h2><span class="muted">${all.length} 条</span></div>
    <div class="stack">${all.map((c) => `<div class="row static"><div class="row-main"><div><b>${esc(c.date)}</b><p>${esc(c.text)}</p><small class="src">来自：${esc(c.from)}</small></div></div></div>`).join('')}</div>
  </div>`;
}

/* ---------------- systemic (foldout cards, doc 32) ---------------- */
function viewSystemic() {
  if (state.sub === 0) return viewSystemicOverview();
  if (state.sub === 1) return viewSystemicCycles();
  return viewSystemicSwitch();
}
function foldBlock(title, summary, items) {
  return `<section class="pd-block">
    <div class="pd-head">${esc(title)}</div>
    <p class="pd-summary">${esc(summary)}</p>
    <ul class="pd-items">${items.length ? items.map((i) => `<li><b>${esc(i[0])}</b><span>${esc(i[1])}</span></li>`).join('') : '<li class="pd-empty">无 + 说明：这一阶段没有记录到该项内容。</li>'}</ul>
  </section>`;
}
function foldCard(line) {
  const p = P();
  const metrics = p.metrics.filter((m) => m.date >= line.dateStart && (!line.dateEnd || m.date <= line.dateEnd));
  const imaging = p.imaging.filter((i) => i.date >= line.dateStart && (!line.dateEnd || i.date <= line.dateEnd));
  // 副作用必须落在本线时段内。第一版取的是"第一条带并发症的局部记录"，未过滤，
  // 导致三条治疗线的副作用逐字相同（术后并发症被挂在靶向/试验名下）——患者会读成因果关系。
  const inWin = (d) => d >= line.dateStart && (!line.dateEnd || d <= line.dateEnd);
  const aelist = [
    // 局部治疗并发症（术后/放疗后）
    ...p.local.filter((l) => inWin(l.dateStart || l.date)).flatMap((l) => l.complications || []),
    // 自述不适（functionLog 里 domain='ae' 的条目）：靶向/化疗期间最常见
    ...(p.functionLog || []).filter((f) => f.domain === 'ae' && f.text),
  ].filter((a) => inWin(a.date)).slice(0, 3);
  const support = p.viewpoint.filter((v) => v.date >= line.dateStart && (!line.dateEnd || v.date <= line.dateEnd));
  const visSupport = visible(support, { includePrivate: false });
  const hiddenCount = support.length - visSupport.length;
  return `<details class="phase-fold">
    <summary><span class="ph-dot"></span><span class="ph-name">第 ${line.lineNo} 线 · ${esc(line.regimen)}</span><span class="ph-meta">${esc(line.dateStart)}${line.dateEnd ? ' → ' + esc(line.dateEnd) : ' · 进行中'} · ${esc(line.status)}</span><span class="ph-hint">展开细节</span></summary>
    <div class="phase-detail">
      ${foldBlock('方案', `${line.regimen}；${line.cyclePlan}${line.cycleNo ? `，已记录第 ${line.cycleNo} 周期` : ''}`, [
        ['方案原文', line.regimen], ['起止', `${line.dateStart}${line.dateEnd ? ' → ' + line.dateEnd : ' → 进行中'}`],
        ['计划 vs 实际', line.cyclePlan], ['状态', line.status],
      ])}
      ${foldBlock('指标和趋势', metrics.length ? `${metrics.length} 条指标落在本阶段` : '本阶段没有指标记录', metrics.slice(0, 4).map((m) => [m.name, `${m.value} ${m.unit}（${m.date}，参考 ${m.ref}）`]))}
      ${foldBlock('影像发现', imaging.length ? `${imaging.length} 次影像落在本阶段（原文照录）` : '本阶段没有影像记录', imaging.map((i) => [i.date + ' ' + i.modality, i.wording]))}
      ${foldBlock('副作用总结', aelist.length ? '记录到的不良反应（自述原文）' : '本阶段没有记录到不良反应', aelist.map((a) => [a.date, a.text]))}
      ${foldBlock('心理/营养措施和效果', visSupport.length ? '支持措施与效果记录（患者原话，不评疗效）' : '本阶段没有可展示的支持记录', visSupport.map((v) => [v.date + ' ' + v.mood, `「${v.text}」`]))}
      ${hiddenCount ? `<p class="pd-filtered">有 ${hiddenCount} 条私密记录未在此展开显示（三出口过滤）。</p>` : ''}
    </div>
  </details>`;
}
function viewSystemicOverview() {
  const p = P();
  return `${pageHead('治疗线总览', '默认只看概要：第几线、什么方案、起止。展开看该阶段的五块细节。',
    `${agentButton('我记一下这周期用的药', 'AI 记用药')}${moreMenu([{ label: '手工补一条治疗线' }])}`)}
  ${notice('violet', '<b>为什么局部与全身是两个页面：</b>肉瘤的放疗/手术和化疗/靶向经常<b>同期进行</b>，不是"一线失败换二线"的单链。压成一条线会把你真实的治疗记录撕成两半。')}
  <div class="card">
    <div class="card-head"><h2>${p.systemic.length} 条治疗线</h2><span class="muted">默认全部收起（0 个展开）</span></div>
    ${p.systemic.map(foldCard).join('')}
    <div class="fold-actions">
      <button class="soft" data-action="expand-all">全部展开</button>
      <button class="soft" data-action="collapse-all">全部收起</button>
    </div>
    <p class="small-note print-note">浏览器打印<b>不会</b>自动展开收起的折叠卡（CSS 无法改变 &lt;details&gt; 的开合状态）。要看完整病程请先点「全部展开」，再打印/导出 PDF。</p>
  </div>`;
}
function viewSystemicCycles() {
  const p = P();
  const cur = p.systemic.find((s) => s.status === '进行中') || p.systemic.slice(-1)[0];
  return `${pageHead('周期与用药', '周期号、给药日、方案原文。方案缩写不认识时查术语卡。',
    `${agentButton('我拍一张化疗单', 'AI 抄化疗单')}${moreMenu([{ label: '手工补一个周期' }])}`)}
  <div class="card">
    <div class="card-head"><h2>${esc(cur.regimen)}</h2>${pill(cur.status, cur.status === '进行中' ? 'green' : 'grey')}</div>
    <p class="muted small">${esc(cur.cyclePlan)} · 已记录 ${cur.cycles.length} 个周期</p>
    <table class="table" style="margin-top:10px"><thead><tr><th>周期</th><th>日期</th><th>备注</th></tr></thead><tbody>
    ${cur.cycles.map((c) => `<tr><td><b>第 ${c.n} 周期</b></td><td>${esc(c.d)}</td><td class="muted">${esc(c.note)}</td></tr>`).join('')}
    </tbody></table>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>换线原因原文</h2></div>
    <blockquote class="quote">${esc(cur.reasonText || '未记录原因原文')}</blockquote>
    <p class="small-note">换线必须留医生原话。只存"进展/不耐受"这类判定词，等于把医生的话改写成了结论。</p>
  </div>`;
}
function viewSystemicSwitch() {
  const p = P();
  const lines = p.systemic;
  return `${pageHead('换线记录', '每条线为什么停、换成什么，原因只放医生原话。', moreMenu([{ label: '记一次换线' }]))}
  ${notice('warn', '换线原因的字段是<b>医生原话</b>，不是勾选框。若报告只写"进展"，就照录"进展"，工作台不扩写成解释、不推荐下一线。')}
  <div class="card">
    <div class="stack">
    ${lines.map((l) => `<div class="switch-row">
      <div><b>第 ${l.lineNo} 线 · ${esc(l.regimen)}</b><p class="muted small">${esc(l.dateStart)}${l.dateEnd ? ' → ' + esc(l.dateEnd) : ' → 进行中'} · ${esc(l.status)}</p>
      ${l.reasonText ? `<blockquote class="quote small">${esc(l.reasonText)}</blockquote>` : ''}</div>
      <div>${pill(l.status, l.status === '进行中' ? 'green' : l.status === '已换线' ? 'yellow' : 'grey')}</div>
    </div>`).join('')}
    </div>
  </div>`;
}

/* ---------------- function & rehab ---------------- */
function viewFunction() {
  if (state.sub === 0) return viewFuncList('function');
  if (state.sub === 1) return viewFuncList('lymphedema');
  return viewFuncList('wound');
}
function viewFuncList(domain) {
  const p = P();
  const list = p.functionLog.filter((f) => f.domain === domain);
  const cfg = {
    function: { title: '肢体功能', desc: '活动度、辅助器具、步行距离——按自述记录，不评等级。', ph: '这周走路的情况', kind: 'AI 记一句' },
    lymphedema: { title: '淋巴水肿', desc: '周径数值 + 测量位置 + 哪一侧。单位必须手动选，不默认。', ph: '今天量了一下腿围', kind: 'AI 记测量' },
    wound: { title: '伤口与皮肤', desc: '自述描述 + 处理。不做感染判断、不做皮炎分级。', ph: '皮肤有点红、有点疼', kind: 'AI 记一句' },
  }[domain];
  const nums = list.filter((f) => f.value !== null && f.value !== undefined);
  // 只画"同一测量位置 + 同一单位"的那一组。换位置或换单位不合并（页头写的就是这句，
  // 第一版代码直接画了 nums 全部，等于自己把口径否了 —— P1-9）。
  const groups = {};
  if (domain === 'lymphedema') {
    for (const f of nums) {
      const key = `${f.measure || '未注明位置'}|${f.unit || '未注明单位'}`;
      (groups[key] = groups[key] || []).push(f);
    }
  }
  const groupKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  const picked = groupKeys.length ? groups[groupKeys[0]] : [];
  const otherGroups = groupKeys.slice(1).map((k) => ({ key: k, n: groups[k].length }));
  return `${pageHead(cfg.title, cfg.desc,
    `${agentButton(cfg.ph, cfg.kind)}${moreMenu([{ label: '手工补一条' }, { label: '看历史' }])}`)}
  ${domain === 'wound' ? notice('plain', '工作台<b>不判断伤口是否感染、不做放射性皮炎分级</b>；出现破溃、渗液时，记录内容照抄自述，是否就诊由你和医生决定。') : ''}
  ${picked.length > 1 ? `<div class="card"><div class="card-head"><h2>${esc(picked[0].measure)}</h2><span class="muted">单位 ${esc(picked[0].unit)} · ${picked.length} 个点</span></div>
    ${lineChart(picked.map((f) => ({ x: new Date(f.date).getTime(), y: f.value, label: f.date.slice(5) })), { w: 620, h: 190, unit: picked[0].unit, label: `${picked[0].measure}（${picked[0].unit}）` })}
    <p class="small-note">只画同一测量位置、同一单位的数值。换位置或换单位<b>不合并</b>成一条线（分类不进趋势）。</p>
    ${otherGroups.length ? `<p class="small-note warn">另外还有 ${otherGroups.length} 组不同位置/单位的记录（${otherGroups.map((g) => esc(g.key.replace('|', ' / ')) + ' × ' + g.n).join('、')}），<b>没有画进这张图</b>——混在一起会看起来像数值突变。</p>` : ''}</div>`
    : `<div class="card"><div class="card-head"><h2>趋势</h2></div>${empty(
      nums.length === 0 ? '还没有测量记录' : '暂时连不成线',
      nums.length === 0 ? '记录要带数值 + 测量位置 + 单位，才会出现在这里。' : '同一位置、同一单位的数值至少两条才画线；现在只有一组里的一个点，或每组都只有一个点。')}</div>`}
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>记录</h2><span class="muted">${list.length} 条</span></div>
    <div class="stack">
      ${list.slice().reverse().map((f) => `<div class="row static"><div class="row-main"><div>
        <b>${esc(f.date)}${f.measure ? ' · ' + esc(f.measure) : ''}</b>
        <p>${f.value !== null && f.value !== undefined ? `<b class="num">${num(f.value, 1)} ${esc(f.unit)}</b>${f.side ? ' · ' + esc(f.side) : ''}${f.text ? ' · ' + esc(f.text) : ''}` : esc(f.text)}</p>
        ${recorderBadge(f.recorder)}
      </div></div><div>${moreMenu([{ label: '改这一条' }])}</div></div>`).join('')}
    </div>
  </div>`;
}

/* ---------------- metrics ---------------- */
function viewMetrics() {
  if (state.sub === 2) return viewMetricsTrend();
  const group = state.sub === 0 ? '血象' : '肝肾与心肌';
  const p = P();
  const keyOf = (m) => {
    if (group === '血象') return /WBC|ANC|HGB|PLT|中性粒|血红蛋白|白细胞/.test(m.name);
    return /ALT|AST|肌酐|CREA|LVEF|TSH|胆红素|钾|钠/.test(m.name);
  };
  const list = p.metrics.filter(keyOf);
  const names = [...new Set(list.map((m) => m.name))];
  return `${pageHead(group, '按指标名分卡，卡背面是参考范围与出处。跨单位不合并。',
    `${agentButton('我拍一张化验单', 'AI 抄化验单')}${moreMenu([{ label: '手工补一行' }])}`)}
  ${notice('plain', '工作台<b>不做 CTCAE 自动分级到处置</b>：只显示数值、参考范围、日期与出处。数值高低要不要紧，由医生结合整体判断。')}
  <div class="grid two">
    ${names.map((n) => {
      const rows = list.filter((m) => m.name === n).sort((a, b) => a.date.localeCompare(b.date));
      const last = rows.slice(-1)[0], prev = rows.slice(-2)[0];
      const inRef = (v, ref) => { const m = String(ref).match(/(-?\d+\.?\d*)\s*[–-]\s*(-?\d+\.?\d*)/); if (!m) return null; return v >= +m[1] && v <= +m[2]; };
      const ok = inRef(last.value, last.ref);
      return `<div class="card">
        <div class="card-head"><h2>${esc(n)}</h2>${ok === null ? pill('无范围', 'grey') : ok ? pill('在范围内', 'green') : pill('超出范围', 'yellow')}</div>
        <p class="big-value">${num(last.value, last.value % 1 ? 2 : 0)} <small>${esc(last.unit)}</small></p>
        <p class="muted small">${esc(last.date)} · 参考 ${esc(last.ref)}${prev ? ` · 上次 ${num(prev.value, prev.value % 1 ? 2 : 0)}（${esc(prev.date)}）` : ''}</p>
        ${sourceLine(last.source)}
        <div class="divider"></div>
        <p class="small-note">"超出范围"只是说这个数在参考区间外，<b>不是严重程度判断</b>。</p>
      </div>`;
    }).join('')}
  </div>`;
}
function viewMetricsTrend() {
  const p = P();
  const names = [...new Set(p.metrics.map((m) => m.name))];
  const pick = state.metricPick && names.includes(state.metricPick) ? state.metricPick : names[0];
  state.metricPick = pick;
  // 同一指标可能有多个单位（g/L vs g/dL）。单位不同的数值画进一条线＝制造假趋势（P1-8）。
  // 口径：默认只画"出现次数最多的那个单位"，其余单位在下方显式列出，不合并。
  const all = p.metrics.filter((m) => m.name === pick);
  const unitCount = all.reduce((acc, m) => { acc[m.unit] = (acc[m.unit] || 0) + 1; return acc; }, {});
  const unit = Object.keys(unitCount).sort((a, b) => unitCount[b] - unitCount[a])[0] || '';
  const otherUnits = Object.keys(unitCount).filter((u) => u !== unit);
  const rows = all.filter((m) => m.unit === unit).sort((a, b) => a.date.localeCompare(b.date));
  const ref = rows[0]?.ref?.match(/(\d+\.?\d*)\s*[–-]\s*(\d+\.?\d*)/);
  const refMid = ref ? (+ref[1] + +ref[2]) / 2 : null;
  return `${pageHead('趋势对照', '一次只看一个指标。单点不连线；跨单位不合并。', moreMenu([{ label: '这张图的画法' }]))}
  <div class="overview">
    <div class="rail">
      <h3>选指标</h3>
      <div class="metric-list">${names.map((n) => `<button class="metric-pick${n === pick ? ' on' : ''}" data-metric="${esc(n)}">${esc(n)}<small>${p.metrics.filter((m) => m.name === n).length}</small></button>`).join('')}</div>
      <section><h3>口径</h3><p class="small-note">同一指标、同一单位才画线；参考区间以最近一张化验单为准。</p></section>
    </div>
    <div class="stack">
      <div class="card">
        <div class="card-head"><h2>${esc(pick)}</h2><span class="muted">${rows.length} 个点 · ${esc(unit)}</span></div>
        ${rows.length === 0 ? empty('还没有这个指标的记录', '这一页只画已确认的数值。拍照或手工补一条之后，这里才会出现点。')
          : rows.length === 1 ? empty('只有一个点', '单点不连线（一个点画不出走向）。再记一次就能看到变化。')
          : lineChart(rows.map((m) => ({ x: new Date(m.date).getTime(), y: m.value, label: m.date.slice(5) })), { ref: refMid, unit, label: pick })}
        <p class="small-note">参考区间：${esc(rows[0]?.ref || '这张单没印')}。图上的虚线只是参考区间的中点，不是判定线。</p>
        ${otherUnits.length ? `<p class="small-note warn">这个指标还出现过别的单位（${otherUnits.map((u) => `${esc(u)} × ${unitCount[u]}`).join('、')}），<b>没有画进这条线</b>——不同单位连成一条线会看起来像数值突变。</p>` : ''}
      </div>
      <div class="card">
        <div class="card-head"><h2>原始数值</h2></div>
        <table class="table"><thead><tr><th>日期</th><th>数值</th><th>参考</th><th>出处</th></tr></thead><tbody>
        ${rows.map((m) => `<tr><td>${esc(m.date)}</td><td><b>${num(m.value, m.value % 1 ? 2 : 0)}</b> ${esc(m.unit)}</td><td class="muted">${esc(m.ref)}</td><td class="muted small">${esc(m.source)}</td></tr>`).join('')}
        </tbody></table>
      </div>
    </div>
  </div>`;
}

/* ---------------- follow-up ---------------- */
function viewFollowup() {
  if (state.sub === 0) return viewFollowupCal();
  if (state.sub === 1) return viewTodo();
  return viewVisitPrep();
}
function lastImagingDate(p) { return p.imaging.filter((i) => i.site === p.site).slice(-1)[0]?.date; }
function viewFollowupCal() {
  const p = P();
  const ref = D.followupRef[p.site];
  const last = lastImagingDate(p);
  const months = last ? Math.max(0, (new Date(TODAY) - new Date(last)) / (1000 * 3600 * 24 * 30.44)) : null;
  return `${pageHead('复查日历', '只显示「距上次多久」与公开参考间隔，不给复查指令。', moreMenu([{ label: '参考间隔是哪来的' }]))}
  ${notice('warn', '公开参考间隔只是<b>某份指南版本的建议</b>，UK 指南明确指出 STS 随访缺乏高质量证据、各中心做法差异大。具体节奏由你的医生按个人情况决定。')}
  <div class="grid two">
    <div class="card">
      <div class="card-head"><h2>距上次复查</h2>${pill(p.site, 'grey')}</div>
      <p class="big-value">${months === null ? '—' : Math.floor(months) + ' 个月'}</p>
      <p class="muted small">上次影像：${esc(last || '暂无记录')}</p>
      <div class="divider"></div>
      <p class="small-note">公开参考间隔：${esc((ref.months || []).join('–'))} 个月（${esc(ref.years)}）</p>
      ${sourceLine(ref.source)}
      <p class="small-note"><b>这不是"逾期提醒"</b>：工作台不判断该不该复查，只把间隔摊开给你看。</p>
    </div>
    <div class="card">
      <div class="card-head"><h2>已安排的复诊</h2></div>
      ${p.visits.filter((v) => v.planned).map((v) => `<div class="row static"><div class="row-main"><div><b>${esc(v.date)} · ${esc(v.purpose)}</b><p>${v.questions.length} 个待问问题</p></div></div><button class="soft" data-nav="followup" data-sub="2">准备</button></div>`).join('') || '<p class="muted">还没有安排。</p>'}
      <button class="soft" data-action="add-visit" style="margin-top:10px">加一次复诊</button>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>按部位的复查节奏（只作参考）</h2></div>
    <table class="table"><thead><tr><th>部位</th><th>参考间隔</th><th>出处</th></tr></thead><tbody>
    ${Object.entries(D.followupRef).map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc((v.months || []).join('–'))} 个月 · ${esc(v.years)}</td><td class="muted small">${esc(v.source)}</td></tr>`).join('')}
    </tbody></table>
    <p class="small-note">上表来自 NCCN <b>患者版</b> 2025（据专业版 1.2025 改写）；专业版原文本次未取得，故标注"患者版转述"。</p>
  </div>`;
}
function viewTodo() {
  const p = P();
  const v = p.visits.find((x) => x.planned) || p.visits[0];
  return `${pageHead('待办与问题', '一个问题一条，最多 140 字。按你心里的优先级排。',
    `${agentButton('我最近老担心指标和腿肿，帮我把问题整理成条目', 'AI 协助整理')}${moreMenu([{ label: '手工加一条' }])}`)}
  ${notice('violet', 'AI 只把你说的话<b>整理成条目候选</b>，不替你想问题、不替你判断该问什么；候选确认前不进清单。')}
  <div class="card">
    <div class="card-head"><h2>下次复诊想问的</h2><span class="muted">${v.questions.length} 条</span></div>
    <div class="stack">
      ${v.questions.map((q, i) => `<div class="q-row"><span class="q-no">${i + 1}</span><p>${esc(q)}</p>${moreMenu([{ label: '改这一条' }, { label: '删掉' }])}</div>`).join('')}
    </div>
    <div class="actions" style="margin-top:12px"><button class="soft" data-action="add-question">加一条问题</button>
    ${agentButton('把我想问的整理成条目', 'AI 整理候选')}</div>
  </div>
  ${state.agentDraft ? renderAgentDraft() : ''}
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>复诊记录</h2></div>
    ${p.visits.filter((x) => !x.planned).map((x) => `<div class="row static"><div class="row-main"><div><b>${esc(x.date)} · ${esc(x.purpose)}</b><p>${esc(x.summaryText || '还没有写小结')}</p></div></div>${recorderBadge(x.recorder)}</div>`).join('') || '<p class="muted">还没有已完成的复诊记录。</p>'}
  </div>`;
}
function renderAgentDraft() {
  return `<div class="card agent-draft">
    <div class="card-head"><h2>AI 候选（未确认）</h2>${pill('待核对', 'violet')}</div>
    <p class="muted small">来源：${esc(state.agentDraft.source)}。候选<b>不会自动入清单</b>——逐条核对后确认才写入。</p>
    <p class="small-note">本次上下文已排除 ${state.agentDraft.filtered ?? 0} 条私密记录（AI 出口不提供"勾选放开"）。</p>
    <div class="stack">${state.agentDraft.items.map((t) => `<div class="cand"><p>${esc(t)}</p><div class="actions"><button class="soft" data-action="accept-cand">确认</button><button class="soft" data-action="reject-cand">不对，改一下</button></div></div>`).join('')}</div>
    <div class="actions" style="margin-top:10px"><button class="text-button" data-action="close-draft">全部拒收（零副作用）</button></div>
  </div>`;
}
function viewVisitPrep() {
  const p = P();
  const v = p.visits.find((x) => x.planned) || p.visits[0];
  const base = p.imaging.find((i) => i.baseline && i.site === p.site);
  return `${pageHead('就诊准备', '一页纸：亚型、最近治疗、基线影像、想问的问题。', `<button class="primary" data-action="export-prep">生成一页纸</button>`)}
  <div class="card print-page">
    <div class="print-head"><h2>${esc(p.name)} · ${esc(p.site)} · ${esc(p.subtype.name)}</h2>
      <p class="muted small"><b>记录人：${esc(p.recorderLabel)}</b>（${p.recorder === 'patient' ? '本人记录' : '家属代记，本人可能未逐条核对'}） · 生成于 ${TODAY} · 资料截至 ${TODAY} · 仅供就诊沟通，不是病历</p></div>
    <div class="kv-grid">
      ${kv('亚型（报告原文）', p.subtype.name)}
      ${kv('分级', p.subtype.grade)}
      ${kv('分期（医生记录）', p.subtype.stageText)}
      ${kv('基线影像', base ? `${base.date} ${base.modality}` : '尚未设置')}
    </div>
    <div class="divider"></div>
    <h3>治疗线</h3>
    <div class="rows">${p.systemic.map((l) => `<div class="row static"><div class="row-main"><div><b>第 ${l.lineNo} 线 · ${esc(l.regimen)}</b><p>${esc(l.dateStart)}${l.dateEnd ? ' → ' + esc(l.dateEnd) : ' → 进行中'} · ${esc(l.status)}</p></div></div></div>`).join('')}</div>
    <div class="divider"></div>
    <h3>想问的问题</h3>
    <ol class="qlist">${v.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>
    <p class="small-note">私密记录（心理、生育与亲密）默认<b>不进入</b>这份材料。</p>
  </div>`;
}

/* ---------------- trials ---------------- */
function viewTrials() {
  const p = P();
  const list = p.trials;
  // seen = 真的从某通道取回过条目；failed = 有通道本次没取回（未配置/未查过/超时）。
  // 这两个必须分开：0 条 + 通道失败 ≠ 没有试验（K6）。
  const real = list.filter((t) => !/未查过|未取回|未配置/.test(t.statusText || ''));
  const fetchedAt = real.map((t) => t.fetchedAt).filter(Boolean).sort().slice(-1)[0] || null;
  const channelFailed = list.length > 0 && real.length < list.length;
  const filtered = state.trialFilter === 'all' ? list : list.filter((t) => /招募/.test(t.statusText));
  if (state.sub === 1) {
    return `${pageHead('关注与入组', '关注的试验与入组步骤。工作台不判断你是否符合条件。', moreMenu([{ label: '加一条关注' }]))}
    ${notice('warn', '「招募中」只表示登记库里的状态，<b>不等于你符合条件</b>。是否适合入组由研究团队评估。')}
    <div class="card"><div class="stack">${list.map((t) => `<div class="row static"><div class="row-main"><div><b>${esc(t.registryId)} · ${esc(t.title)}</b><p>${esc(t.phase)} · ${esc(t.statusText)} · ${esc(t.siteText)}</p>${sourceLine(`${t.channel} · 采集于 ${t.fetchedAt}`)}</div></div>${pill(t.statusText, /招募/.test(t.statusText) ? 'green' : 'grey')}</div>`).join('')}</div></div>`;
  }
  return `${pageHead('检索入口', '按亚型与部位检索登记库。每条带来源通道与采集时间。',
    `${agentButton('我想找滑膜肉瘤的临床研究', 'AI 拟检索条件')}`)}
  <div class="card">
    <div class="card-head"><h2>检索条件</h2></div>
    <div class="filter-row">
      <label class="field"><span>亚型/关键词</span><input id="trial-q" value="${esc(state.trialsQuery)}"></label>
      <label class="field"><span>部位</span><select id="trial-site"><option>全部</option>${D.meta.sites.map((s) => `<option${s === p.site ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
      <label class="field"><span>状态</span><select id="trial-status"><option value="all">全部</option><option value="recruiting">仅招募中</option></select></label>
      <button class="primary" data-action="trial-search">检索</button>
    </div>
    <p class="small-note">通道：clinicaltrials.gov · ChiCTR · 药物临床试验登记平台 · ICTRP。任一通道失败会显示"未取回"，<b>不会显示空列表冒充"没有试验"</b>。</p>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>结果</h2><span class="muted">${filtered.length
      ? `${filtered.length} 条 · 采集于 ${esc(fetchedAt || '未记录')}`
      : (channelFailed ? '本次没能取回 · 不是"没有试验"' : `0 条 · 采集于 ${esc(fetchedAt || '未记录')}`)}</span></div>
    <div class="stack">
    ${filtered.length === 0 ? `<div class="empty-state"><b>${channelFailed ? '有通道没取回，不是"没有试验"' : '按当前条件没有匹配到'}</b>
      <p>${channelFailed ? '下面列出的通道里有本次没取回的。空白不代表这个亚型没有在研研究，只代表<b>这次没查到</b>。' : '可以放宽亚型关键词或把状态改成"全部"再查一次。'}</p>
      <p class="small-note">${list.map((t) => `${esc(t.channel)}：${esc(t.statusText)}`).join(' · ') || '还没有任何通道的采集记录'}</p></div>` : ''}
    ${filtered.map((t) => `<div class="trial-row">
      <div><b>${esc(t.title)}</b><p class="muted small">${esc(t.registryId)} · ${esc(t.phase)} · ${esc(t.siteText)}</p>
      <p class="small">${esc(t.matchNote)}</p>
      ${sourceLine(`${t.channel} · 采集于 ${t.fetchedAt}`)}</div>
      <div class="actions">${pill(t.statusText, /招募/.test(t.statusText) ? 'green' : /未/.test(t.statusText) ? 'grey' : 'yellow')}${moreMenu([{ label: '看登记原文' }, { label: '加入关注' }])}</div>
    </div>`).join('')}
    </div>
    <p class="small-note">离线语料目前只覆盖胰腺癌，软组织肉瘤<b>无离线覆盖</b>——所以标"未配置"的通道就是真的没查过。</p>
  </div>`;
}

/* ---------------- mind ---------------- */
function viewMind() {
  const p = P();
  if (state.sub === 0) return viewMood();
  if (state.sub === 1) return viewPrivate();
  if (state.sub === 2) return viewSupport();
  return viewFertility();
}
function viewMood() {
  const p = P();
  const shared = p.viewpoint.filter((v) => v.visibility !== 'private');
  return `${pageHead('当下感受', '选一个词，写一句话。这些记录默认<b>只给你自己看</b>。',
    `${agentButton('我最近老睡不好，心里发慌', 'AI 记一句')}${moreMenu([{ label: '改这一条' }])}`)}
  ${notice('violet', '这一页<b>不做心理量表评分、不做危机分级</b>。如果出现伤害自己的想法，工作台只给一条固定提示：请联系当地急救或你的治疗团队。')}
  <div class="card">
    <div class="card-head"><h2>记一条</h2><span class="muted">私密 · 默认不导出</span></div>
    <div class="mood-row">${['很怕', '累', '平稳', '有点盼头'].map((m) => `<button class="chip" data-action="mood" data-mood="${esc(m)}" aria-pressed="${p.viewpoint.slice(-1)[0]?.mood === m}">${esc(m)}</button>`).join('')}</div>
    <label class="field" style="margin-top:12px"><span>一句话（≤140 字）</span><textarea id="mood-text" rows="3" maxlength="140" placeholder="想写什么就写什么，不用组织语言">${esc(state.moodDraft)}</textarea></label>
    <p class="small-note">输入框只放<b>你这次新写的</b>内容；已保存的记录不会回填到框里——遮住状态下截图、投屏都不会露出旧内容。</p>
    <div class="actions"><button class="primary" data-action="save-mood">存为私密记录</button><span class="muted small">存进去后可在「私密记录」看到</span></div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-head"><h2>可以分享的记录</h2><span class="muted">${shared.length} 条</span></div>
    <div class="stack">${shared.map((v) => `<div class="row static"><div class="row-main"><div><b>${esc(v.date)} · ${esc(v.mood)}</b><p>「${esc(v.text)}」</p></div></div>${pill('可分享', 'grey')}</div>`).join('') || '<p class="muted">还没有可分享的记录。</p>'}</div>
  </div>`;
}
function viewPrivate() {
  const p = P();
  const priv = p.viewpoint.filter((v) => v.visibility === 'private');
  return `${pageHead('私密记录', '这里的内容默认不进导出、不进 AI 上下文、不进摘要。', `<button class="soft" data-action="toggle-private">${state.showPrivate ? '先遮起来' : '我要看'}</button>`)}
  ${notice('warn', '私密不是"前端隐藏"而是<b>数据结构属性</b>（visibility=private）：三个出口各自过滤一遍，且共用同一个过滤函数。')}
  <div class="card">
    <div class="card-head"><h2>私密条目</h2><span class="muted">${priv.length} 条 · 三出口已过滤</span></div>
    ${state.showPrivate ? `<div class="stack">${priv.map((v) => `<div class="row static"><div class="row-main"><div><b>${esc(v.date)} · ${esc(v.mood)}</b><p>「${esc(v.text)}」</p><small class="src">${v.domain === 'fertility' ? '生育与亲密' : '情绪与家庭'} · ${esc(v.recorder === 'caregiver' ? '家属代记' : '本人记录')}</small></div></div>${pill('私密', 'violet')}</div>`).join('')}</div>`
      : `<div class="private-mask"><p>${priv.length} 条私密记录已遮住。</p><button class="soft" data-action="toggle-private">我要看</button><p class="small-note">遮住状态下截图、投屏都不会露出内容。</p></div>`}
  </div>`;
}
function viewSupport() {
  return `${pageHead('支持资源', '只列公开可查的渠道。不推荐具体机构、不承诺服务。', moreMenu([{ label: '加一条我找到的资源' }]))}
  ${notice('plain', '本次核实时（2026-10-25）<b>未联系核实</b>任何公益组织或赠药项目；因此这里只列通用渠道，不列未核实的商业项目。')}
  <div class="card"><div class="rows">
    ${row('就诊医院的社工部 / 患者服务部', '大多数三甲医院设有，可问医保、转诊、心理支持', 'data-action="noop"')}
    ${row('当地医保经办机构', '异地就医备案、门诊慢特病办理', 'data-action="noop"')}
    ${row('医院康复科 / 营养科', '术后功能与进食问题，可挂号评估', 'data-action="noop"')}
  </div></div>`;
}
function viewFertility() {
  const p = P();
  return `${pageHead('生育与亲密', '治疗前是否被提过生育力保存、康复评估。只记录议题是否存在。', moreMenu([{ label: '补一条' }]))}
  ${notice('violet', '这一页<b>只记录"医生有没有提过"</b>，不把记录写成对你的要求；出处附在下面。')}
  <div class="card">
    <div class="card-head"><h2>记录项</h2>${pill('私密', 'violet')}</div>
    <div class="stack">${p.fertility.map((f) => `<div class="row static"><div class="row-main"><div><b>${esc(f.item)}</b><p>${esc(f.value)}${f.note ? ' · ' + esc(f.note) : ''}</p><small class="src">${esc(f.date)}</small></div></div>${moreMenu([{ label: '改这一条' }])}</div>`).join('')}</div>
  </div>
  <div class="card" style="margin-top:14px"><div class="card-head"><h2>出处（只列文件，不给建议）</h2></div>
  <div class="rows">
    ${row('ASCO 2025 生育力保存指南', '要求在开始抗肿瘤治疗前讨论并记录（J Clin Oncol 2025;43(12):1488–1515）', 'data-action="noop"')}
    ${row('NCCN 患者版 2025 p.27', '提到手术存在肢体/身体功能障碍风险，并讨论了康复评估（该指南原文为建议性表述；此处只记录这个议题存在，不转成对你的要求）', 'data-action="noop"')}
  </div></div>`;
}

/* ---------------- records ---------------- */
function viewRecords() {
  if (state.sub === 0) return viewDocs();
  if (state.sub === 1) return viewCandidates();
  if (state.sub === 2) return viewExport();
  return viewPrivacy();
}
function viewDocs() {
  const p = P();
  return `${pageHead('资料库', '原件不改动；解析失败不产生任何候选。', `${agentButton('我上传一份报告', '上传/拍照')}${moreMenu([{ label: '从本机导入' }])}`)}
  <div class="card">
    <div class="card-head"><h2>已导入</h2><span class="muted">${p.documents.length} 份</span></div>
    <table class="table"><thead><tr><th>文件</th><th>类型</th><th>日期</th><th>解析状态</th><th>来源</th></tr></thead><tbody>
    ${p.documents.map((d) => `<tr><td><b>${esc(d.name)}</b></td><td>${esc(d.kind)}</td><td>${esc(d.date)}</td><td>${pill(d.parseStatus, d.parseStatus === '已解析' ? 'green' : d.parseStatus === '待解析' ? 'yellow' : 'grey')}</td><td class="muted small">${esc(d.source)}</td></tr>`).join('')}
    </tbody></table>
  </div>
  ${state.candidateOpen ? candidatePanel() : ''}
  <div class="card" style="margin-top:14px"><div class="card-head"><h2>解析说明</h2></div>
  <p class="small-note">解析（MinerU / 本地）产出的是<b>候选</b>，不是事实。候选进「草稿核对」，逐条确认后才写入对应记录。拒收候选 = 零副作用。</p></div>`;
}
function candidatePanel() {
  const p = P();
  const cands = p.candidates.filter((c) => c.status === 'pending');
  return `<div class="card agent-draft" style="margin-top:14px">
    <div class="card-head"><h2>待核对候选</h2><span class="muted">${cands.length} 条</span></div>
    ${cands.map((c) => `<div class="cand">
      <p><b>${esc(c.entityType)}</b> · ${esc(c.source)}</p>
      <pre class="cand-json">${esc(JSON.stringify(c.payload, null, 2))}</pre>
      <div class="actions"><button class="soft" data-action="accept-cand">确认入档</button><button class="soft" data-action="reject-cand">不对，改一下</button><button class="text-button" data-action="reject-cand">拒收</button></div>
    </div>`).join('') || '<p class="muted">没有待核对候选。</p>'}
  </div>`;
}
function viewCandidates() {
  const p = P();
  return `${pageHead('草稿核对', '每项给"不对，改一下"直达入口。确认才入事实层。', moreMenu([{ label: '全部拒收' }]))}
  ${candidatePanel()}
  <div class="card" style="margin-top:14px"><div class="card-head"><h2>已处理</h2></div>
  <p class="muted small">本演示档案暂无已处理的候选记录。</p></div>`;
}
function viewExport() {
  const p = P();
  const o = state.exportOpts;
  const canon = optsFromUI(o);           // demoOff → demoOn，不归一就会恒排除（P1-4）
  const privCount = allPrivate(p);
  const pool = [p.pathologies, p.imaging, p.local, p.systemic, p.metrics, p.functionLog,
    p.visits, p.trials, p.viewpoint, p.fertility];
  const allCount = pool.reduce((n, a) => n + a.length, 0);
  const outCount = pool.reduce((n, a) => n + exportable(a, canon).filter((x) => inRange(x, canon.from, canon.to)).length, 0);
  return `${pageHead('导出快照', '导出的是"资料快照"，不是病历。私密与演示数据默认排除。', `<button class="primary" data-action="do-export">生成</button>`)}
  ${notice('warn', '导出物固定带一句"生成于 X，资料截至 Y，仅供沟通，不是病历"。<b>私密记录默认不导出</b>——要导出需在这里显式勾选。')}
  <div class="grid two">
    <div class="card"><div class="card-head"><h2>范围</h2></div>
      <label class="field"><span>起始日期</span><input type="date" id="exp-from" value="${esc(o.from)}"></label>
      <label class="field" style="margin-top:10px"><span>结束日期</span><input type="date" id="exp-to" value="${esc(o.to)}"></label>
      <label class="check"><input type="checkbox" id="exp-private" ${o.privateOn ? 'checked' : ''}><span>包含私密记录（当前 ${privCount} 条）</span></label>
      <label class="check"><input type="checkbox" id="exp-demo" ${o.demoOff ? 'checked' : ''}><span>排除演示数据（in_use=1）。本原型每条记录都标了 in_use，勾上导出为空——那正说明开关有效。</span></label>
    </div>
    <div class="card"><div class="card-head"><h2>会包含什么</h2><span class="pill green">约 ${outCount} / ${allCount} 条</span></div>
      <div class="rows">
        ${row('我的亚型', '亚型 / 分级 / 分期（报告原文）', 'data-action="noop"')}
        ${row('局部治疗与全身治疗', `${exportable(p.local, canon).length} 条局部 · ${exportable(p.systemic, canon).length} 条全身`, 'data-action="noop"')}
        ${row('基线影像与复查', `${exportable(p.imaging, canon).length} 次影像（含原文）`, 'data-action="noop"')}
        ${row('指标表', `${exportable(p.metrics, canon).length} 条数值`, 'data-action="noop"')}
        ${row('想问的问题', `${p.visits[0]?.questions.length || 0} 条`, 'data-action="noop"')}
      </div>
      <p class="small-note">不含：私密记录（除勾选）、演示数据（除取消勾选）、任何"诊断结论/治疗建议/预后"。</p>
      ${outCount === 0 ? `<div class="empty-state"><b>当前范围会导出 0 条</b>
        <p>${canon.demoOn ? '这份档案在所选日期范围内没有记录。' : '本原型<b>全部记录都标了 in_use=1（演示数据）</b>，而导出默认排除演示数据——所以默认是 0 条。<b>这不是坏了，是纪律在起作用。</b>想看导出长什么样，取消勾选"排除演示数据"。'}</p></div>` : ''}
      ${state.lastExport ? `<div class="card" style="margin-top:12px;box-shadow:none;border-color:var(--violet)"><div class="card-head"><h2>上次生成的结果</h2>${pill('已生成', 'green')}</div>
        <p class="small">${state.lastExport.kind === 'snapshot' ? '资料快照' : '就诊一页纸'} · 共 <b>${state.lastExport.items}</b> 项 · 已排除私密 <b>${state.lastExport.filtered}</b> 条 · 生成于 ${TODAY}</p>
        <p class="small-note">演示态不真正落盘。真实版本会写到 output/YYYY/MM/ 下并登记来源。</p></div>` : ''}
    </div>
  </div>`;
}
function viewPrivacy() {
  const p = P();
  return `${pageHead('隐私与分享', '三个出口各自过滤一遍，且共用同一个过滤函数。', moreMenu([{ label: '为什么这样设计' }]))}
  ${notice('violet', '私密内容一旦进了导出/AI/摘要就无法回收。所以过滤写在<b>数据层的一个函数</b>里，而不是在前端做"隐藏"。')}
  <div class="card">
    <div class="card-head"><h2>三个出口</h2></div>
    <table class="table"><thead><tr><th>出口</th><th>私密记录</th><th>演示数据</th><th>怎么验</th></tr></thead><tbody>
      <tr><td><b>导出快照</b></td><td>默认排除（需显式勾选）</td><td>默认排除</td><td class="muted small">buildExportSnapshot() + exportable() 单测</td></tr>
      <tr><td><b>AI 上下文</b></td><td>默认排除</td><td>不适用</td><td class="muted small">buildAgentContext() 不提供放开开关</td></tr>
      <tr><td><b>摘要 / 一页纸</b></td><td>默认排除</td><td>默认排除</td><td class="muted small">同一函数，三处调用</td></tr>
    </tbody></table>
  </div>
  <div class="card" style="margin-top:14px"><div class="card-head"><h2>本档案的私密条目</h2><span class="muted">${allPrivate(p)} 条</span></div>
  <p class="small-note">已从导出、AI 上下文与就诊一页纸中排除。可在「心理与家庭 · 私密记录」查看。</p>
  <div class="actions"><button class="soft" data-nav="mind" data-sub="1">去看私密记录</button></div></div>`;
}

/* ---------------- router ---------------- */
const VIEWS = {
  dashboard: viewDashboard, subtype: viewSubtype, imaging: viewImaging, local: viewLocal,
  systemic: viewSystemic, function: viewFunction, metrics: viewMetrics, followup: viewFollowup,
  trials: viewTrials, mind: viewMind, records: viewRecords,
};
function render() {
  const body = (VIEWS[state.view] || viewDashboard)();
  $('#app').innerHTML = `<div class="shell ${state.large ? 'large' : ''}">
    <div class="prototype-bar"><span><b>交互原型</b> · 患者数据全部为虚构演示 · 不读写真实文件</span><span>v${APP_INFO.version} · ${APP_INFO.build} · ${TOTAL_SUB} 个二级页</span></div>
    <div class="workspace">
      <aside class="sidebar">
        <div class="brand"><img src="../../assets/brand/sarcopal.svg" alt="" onerror="this.style.display='none'"><div><strong>${esc(D.meta.brand.zh)}</strong><span>${esc(D.meta.brand.en)} · ${esc(D.meta.brand.tag)}</span></div></div>
        <div class="profiles">${profileSwitcher()}</div>
        <nav id="nav">${nav()}</nav>
        <div class="sidebar-bottom"><p>只做信息整理<br>不诊断 · 不推荐 · 不预后</p><button class="text-button" data-action="open-glossary">术语卡</button></div>
      </aside>
      <div class="work-area">
        ${topbar()}
        <main id="main">${subnav()}${body}</main>
        ${footer()}
      </div>
    </div>
  </div>`;
  if (state.dialog === 'glossary') $('#app').insertAdjacentHTML('beforeend', glossaryDialog());
  bind();
}
function glossaryDialog() {
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="术语卡"><div class="modal-body">
    <div class="card-head"><h2>术语卡</h2><button class="soft" data-action="close-dialog">关掉</button></div>
    <div class="stack">${D.glossary.map((g) => `<div class="row static"><div class="row-main"><div><b>${esc(g.k)}</b><p>${esc(g.v)}</p></div></div></div>`).join('')}</div>
    <p class="small-note">以上为工作台编辑归纳，不是指南原文；具体以医生解释为准。</p>
  </div></div>`;
}
/* toast 必须挂在 #app 之外：render() 会整体重写 #app.innerHTML，
   任何插在里面的节点都会在同一个 tick 被销毁（第一版就栽在这，所有动作零反馈）。 */
function showToast(msg) {
  state.toast = msg;
  document.querySelectorAll('.toast').forEach((n) => n.remove());
  document.body.insertAdjacentHTML('beforeend', `<div class="toast" role="status">${esc(msg)}</div>`);
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    document.querySelectorAll('.toast').forEach((n) => n.remove());
    state.toast = null;
  }, 3200);
}

/* ---------------- events ---------------- */
function bind() {
  // 单次分发：同一元素可能同时带 data-nav 与 data-sub，不能各自 onclick 覆盖。
  $$('[data-nav],[data-sub]').forEach((b) => b.onclick = (e) => {
    e.stopPropagation();
    if (b.dataset.nav) return go(b.dataset.nav, b.dataset.sub);
    state.sub = Number(b.dataset.sub); render();
  });
  // 切档案 = 换主体。凡与主体绑定的 UI 状态必须一起清，
  // 否则"在 A 档案解锁私密 → 切到 B 档案"就把 B 的私密直接摊开了（P0-2 实测路径）。
  $$('[data-profile]').forEach((b) => b.onclick = () => {
    const next = Number(b.dataset.profile);
    if (next === state.profile) return;
    state.profile = next;
    state.sub = 0;
    state.showPrivate = false;
    state.metricPick = null;
    state.agentDraft = null;
    state.candidateOpen = false;
    state.moodDraft = '';
    state.trialsQuery = '';
    state.exportOpts = { ...state.exportOpts, privateOn: false };
    state.lastExport = null;
    render();
  });
  $$('[data-metric]').forEach((b) => b.onclick = () => { state.metricPick = b.dataset.metric; render(); });
  $$('[data-action]').forEach((b) => b.onclick = () => act(b.dataset.action, b));
  $$('#trial-status').forEach((s) => s.onchange = () => { state.trialFilter = s.value; render(); });
  const tq = $('#trial-q'); if (tq) tq.onchange = () => { state.trialsQuery = tq.value; render(); };
  const expFrom = $('#exp-from'); if (expFrom) expFrom.onchange = () => { state.exportOpts.from = expFrom.value; render(); };
  const expTo = $('#exp-to'); if (expTo) expTo.onchange = () => { state.exportOpts.to = expTo.value; render(); };
  const mood = $('#mood-text'); if (mood) mood.oninput = () => { state.moodDraft = mood.value; };
  const expPriv = $('#exp-private'); if (expPriv) expPriv.onchange = () => { state.exportOpts.privateOn = expPriv.checked; render(); };
  const expDemo = $('#exp-demo'); if (expDemo) expDemo.onchange = () => { state.exportOpts.demoOff = expDemo.checked; render(); };
}
function go(view, sub) {
  state.view = view; state.sub = sub ? Number(sub) : 0; state.visited.add(view);
  history.replaceState(null, '', `#${view}/${state.sub}`);
  render(); $('#main')?.scrollIntoView({ block: 'start' });
}
function act(action, el) {
  switch (action) {
    case 'toggle-large': state.large = !state.large; return render();
    case 'open-glossary': state.dialog = 'glossary'; return render();
    case 'close-dialog': state.dialog = null; return render();
    case 'agent-draft': {
      const p = P();
      const ctx = buildAgentContext(p);
      state.agentDraft = { source: 'AI 协助（演示）· 未发送', filtered: ctx.viewpointFiltered, items: draftQuestions(p) };
      document.activeElement?.blur?.();
      showToast('已把提示词放进输入框，未自动发送（IP10）');
      return render();
    }
    case 'accept-cand': showToast('候选已确认入档（演示）'); state.agentDraft = null; return render();
    case 'reject-cand': showToast('已拒收，零副作用（演示）'); state.agentDraft = null; return render();
    case 'close-draft': state.agentDraft = null; return render();
    case 'open-candidates': state.candidateOpen = true; return go('records', 1);
    case 'set-baseline': {
      // 基线按"部位"唯一：同一部位只能有一条激活基线（H6 / SPEC ADR-3）。
      // 换位置/换检查不是换基线，所以只关同部位的旧基线。
      const p = P();
      const target = p.imaging.find((i) => i.id === el?.dataset.id);
      if (!target) return;
      p.imaging.forEach((i) => { if (i.site === target.site) i.baseline = 0; });
      target.baseline = 1;
      showToast(`基线已改为 ${target.date} ${target.modality}；该部位旧基线已自动失活`);
      return render();
    }
    case 'toggle-private': state.showPrivate = !state.showPrivate; return render();
    case 'save-mood': {
      const p = P();
      const txt = (state.moodDraft || '').trim();
      if (!txt) return showToast('还没写内容——输入框是空的，没有保存任何东西');
      p.viewpoint.push({ id: uid('vp'), date: TODAY, mood: '自记', domain: 'mood', text: txt, visibility: 'private', in_use: 1 });
      state.moodDraft = '';
      showToast('已存为私密记录 · 默认不进导出、不进 AI、不进一页纸');
      return render();
    }
    case 'add-question': {
      const p = P();
      const v = visible(p.visits).find((x) => x.planned) || visible(p.visits)[0];
      if (!v) return showToast('还没有可挂问题的复诊记录');
      v.questions.push({ id: uid('q'), text: '（待你补充）这个阶段我还不确定的是什么', asked: 0 });
      showToast('已加一条问题（占位文本，请在复诊前改掉）');
      return render();
    }
    case 'add-visit': {
      const p = P();
      p.visits.push({ id: uid('v'), date: TODAY, kind: '患者自记的复诊安排', summaryText: '', planned: 1, questions: [], in_use: 1, visibility: 'shared' });
      showToast('已加一次复诊安排（日期为今天，请按实际改）');
      return render();
    }
    case 'expand-all': $$('.phase-fold').forEach((d) => { d.open = true; }); return;
    case 'collapse-all': $$('.phase-fold').forEach((d) => { d.open = false; }); return;
    case 'trial-search': showToast('检索完成：2 条命中，1 个通道未取回（演示）'); return render();
    case 'export-prep': {
      const sheet = buildVisitPrepSheet(P());
      state.lastExport = { kind: 'prep-sheet', filtered: sheet.viewpointFiltered, items: sheet.questions.length };
      showToast(`一页纸已生成：${sheet.questions.length} 个问题 · 已排除 ${sheet.viewpointFiltered} 条私密`);
      return render();
    }
    case 'do-export': {
      const snap = buildExportSnapshot(P(), optsFromUI(state.exportOpts));
      const n = Object.values(snap).filter(Array.isArray).reduce((a, b) => a + b.length, 0);
      state.lastExport = { kind: 'snapshot', filtered: snap.viewpointFiltered, items: n };
      showToast(n === 0
        ? '生成了 0 条：演示数据被默认排除（不是出错，是纪律在起作用）'
        : `导出快照已生成：${n} 条 · 已排除 ${snap.viewpointFiltered} 条私密`);
      return render();
    }
    case 'mood': {
      state.moodDraft = state.moodDraft || '';
      state.moodPick = el?.dataset.mood || null;
      showToast(`已选「${state.moodPick}」——写一句话再点保存`);
      return render();
    }
    case 'noop': return;
    default: return;
  }
}

/* ---------------- boot ---------------- */
function syncFromHash() {
  const m = location.hash.match(/^#([a-z]+)(?:\/(\d+))?$/);
  if (m && VIEWS[m[1]]) { state.view = m[1]; state.sub = Number(m[2] || 0); state.visited.add(m[1]); }
  render();
}
window.addEventListener('hashchange', syncFromHash);

(function boot() {
  const m = location.hash.match(/^#([a-z]+)(?:\/(\d+))?$/);
  if (m && VIEWS[m[1]]) { state.view = m[1]; state.sub = Number(m[2] || 0); }
  render();
  window.__SARCO_PAL__ = {
    state, PAGES, SUBPAGES, totalSub: TOTAL_SUB, smoothPath, render,
    // 三出口：走查/评审可直接调用，验证"私密与演示数据被排除"不是靠嘴说
    visible, exportable, canLeave, privateCount,
    buildExportSnapshot, buildAgentContext, buildVisitPrepSheet,
    // 口径与构造函数一起暴露：测试/评审不该自己猜哪个是"全部私密"
    allPrivate, optsFromUI, inRange, EXITS,
  };
})();
