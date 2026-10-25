/* 小肉宝 SarcoPal · 三出口过滤（K5 单点实现）
   ------------------------------------------------------------------
   为什么单独一个文件：这段逻辑必须被 **产品** 和 **测试** 同时引用。
   第一版把它写在 app.js 里，测试就在测试文件里又抄了一份同名函数，
   于是"14 个测试全绿"和产品行为之间没有任何连接（独立评审 P1-18）。
   现在 app.js 与 test 都加载本文件，改口径只有一处。

   双模：浏览器里挂到 globalThis.SARCO_EXITS；Node 测试用 vm 跑同一份源码。
   app.js 是 classic script（不能 type=module，否则 file:// 下加载失败），
   所以这里也不用 export —— 不要改成 ESM。 */
(function (root) {
  'use strict';

  const isPrivate = (x) => !!x && x.visibility === 'private';
  const isDemo = (x) => !!x && !!x.in_use;

  /** 默认出口：只给非私密。 */
  function visible(list, { includePrivate = false } = {}) {
    return (list || []).filter((x) => includePrivate || !isPrivate(x));
  }
  function privateCount(list) {
    return (list || []).filter(isPrivate).length;
  }
  /** 一条记录能不能离开本机。私密与演示数据都在这里判。 */
  function canLeave(x, opts = {}) {
    if (!x) return false;
    if (isPrivate(x) && !opts.privateOn) return false;
    if (isDemo(x) && !opts.demoOn) return false;
    return true;
  }
  function exportable(list, opts = {}) {
    return (list || []).filter((x) => canLeave(x, opts));
  }
  /** UI 的 {demoOff} → 判定的 {demoOn}。名字不归一就会恒真/恒假（P1-4 的真凶）。 */
  function optsFromUI(o = {}) {
    return { privateOn: !!o.privateOn, demoOn: !o.demoOff, from: o.from || null, to: o.to || null };
  }
  /** 日期范围。空范围 = 不限制（不是"全排除"）。 */
  function inRange(x, from, to) {
    const d = x && (x.date || x.dateStart);
    if (!d) return true;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }
  /** 一个档案的全部私密条目：viewpoint + fertility，各算一次。 */
  function allPrivate(p) {
    return privateCount(p && p.viewpoint) + privateCount(p && p.fertility);
  }

  /** 出口一：导出快照。 */
  function buildExportSnapshot(p, opts = {}) {
    const pick = (list) => exportable(list || [], opts).filter((x) => inRange(x, opts.from, opts.to));
    return {
      kind: 'snapshot',
      generatedAt: opts.today || null,
      profile: { name: p.name, site: p.site, recorder: p.recorder, recorderLabel: p.recorderLabel },
      subtype: p.subtype,
      pathologies: pick(p.pathologies), imaging: pick(p.imaging),
      local: pick(p.local), systemic: pick(p.systemic),
      metrics: pick(p.metrics), functionLog: pick(p.functionLog),
      visits: pick(p.visits), trials: pick(p.trials),
      viewpoint: opts.privateOn ? pick(p.viewpoint) : [],
      fertility: opts.privateOn ? pick(p.fertility) : [],
      viewpointFiltered: opts.privateOn ? 0 : allPrivate(p),
    };
  }
  /** 出口二：AI 上下文。私密永远不进，且不提供"勾选放开"。演示数据也不进。 */
  function buildAgentContext(p) {
    const keep = (list) => visible(list).filter((x) => !isDemo(x));
    return {
      kind: 'agent-context',
      site: p.site, subtype: { name: p.subtype.name, grade: p.subtype.grade },
      pathologies: keep(p.pathologies), imaging: keep(p.imaging),
      systemic: keep(p.systemic), local: keep(p.local), metrics: keep(p.metrics),
      viewpoint: [], fertility: [], viewpointFiltered: allPrivate(p),
    };
  }
  /** 出口三：就诊一页纸。私密永远不进；代记标记必须带（K5）。 */
  function buildVisitPrepSheet(p) {
    const base = (p.imaging || []).find((i) => i.baseline && i.site === p.site);
    const vis = visible(p.visits);
    const v = vis.find((x) => x.planned) || vis[0];
    return {
      kind: 'prep-sheet',
      name: p.name, site: p.site, subtype: p.subtype.name, grade: p.subtype.grade,
      recorder: p.recorder, recorderLabel: p.recorderLabel,
      stageText: p.subtype.stageText, baseline: base || null,
      lines: visible(p.systemic).filter((x) => !isDemo(x)),
      questions: v ? v.questions : [],
      viewpoint: [], fertility: [], viewpointFiltered: allPrivate(p),
    };
  }

  const API = {
    isPrivate, isDemo, visible, privateCount, canLeave, exportable,
    optsFromUI, inRange, allPrivate,
    buildExportSnapshot, buildAgentContext, buildVisitPrepSheet,
  };
  root.SARCO_EXITS = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
