/* 小肉宝 SarcoPal · 指标卡与一图秀（27 号 + 16 号规范的可执行实现）
   ------------------------------------------------------------------
   27 号：卡片是"一个指标的一问一答"，正面六段 + 背面趋势；翻面是**真 3D**，
          状态存 key 不存 DOM，点击只改属性不重绘。
   16 号：一图秀每条线按自身量纲归一化，图上必须写明"不可比"；单点不连线；
          指标选择 ≤4，可滚动，窄屏折叠但能展开。

   为什么单独一个文件：和 exits.js / match.js 同理——这些函数要能被测试直接加载，
   而不是在测试里重写一份（独立评审 P1-18 的教训）。
*/
(function (root) {
  'use strict';

  const num = (n, d = 1) => (n === null || n === undefined || n === '' ? '—' : Number(n).toFixed(d).replace(/\.0$/, ''));

  /** 指标分轨：同一轨的指标可以并列看，跨轨不可比（27 号 §5：一张卡只属于一条轨）。 */
  const TRACKS = [
    { key: 'blood', label: '血象', hint: '决定"能不能按计划继续治疗"', color: '#8a5a0c' },
    { key: 'organ', label: '肝肾与心肌', hint: '决定"药能不能代谢、心脏受不受得住"', color: '#1f5a4d' },
    { key: 'function', label: '功能测量', hint: '周径、步行距离这类"自己量得出来"的数', color: '#b4552b' },
  ];

  /** 把同一指标名归到一个轨。病种不同就换映射，不要在页面里写死。 */
  function trackOf(name) {
    if (/WBC|ANC|HGB|PLT|中性粒|血红蛋白|白细胞|血小板/.test(name)) return 'blood';
    if (/ALT|AST|肌酐|CREA|LVEF|TSH|胆红素|钾|钠|eGFR/.test(name)) return 'organ';
    if (/周径|步行|握力|体重|臂围|腿围/.test(name)) return 'function';
    return 'organ';
  }

  /** 参考区间解析。返回 {lo,hi,text,kind} —— `≥50` 这类单边阈值也要认，
      否则 LVEF 会显示"无范围"（独立评审 P2-4）。 */
  function parseRef(ref) {
    const text = String(ref || '').trim();
    if (!text) return { kind: 'none', text: '这张单没印参考范围' };
    let m = text.match(/(-?\d+\.?\d*)\s*[–\-~]\s*(-?\d+\.?\d*)/);
    if (m) return { kind: 'range', lo: +m[1], hi: +m[2], text };
    m = text.match(/(≥|>=|＞=)\s*(-?\d+\.?\d*)/);
    if (m) return { kind: 'gte', lo: +m[2], text };
    m = text.match(/(≤|<=|＜=)\s*(-?\d+\.?\d*)/);
    if (m) return { kind: 'lte', hi: +m[2], text };
    return { kind: 'text', text };
  }
  function refStatus(value, ref) {
    const r = parseRef(ref);
    if (r.kind === 'range') return value >= r.lo && value <= r.hi;
    if (r.kind === 'gte') return value >= r.lo;
    if (r.kind === 'lte') return value <= r.hi;
    return null;   // null = 无法判断，不是"异常"
  }

  /** 取一条指标的全部记录（同一指标、同一单位，按日期升序）。 */
  function seriesOf(metrics, name, unit) {
    const all = (metrics || []).filter((m) => m.name === name);
    const unitCount = all.reduce((a, m) => { a[m.unit] = (a[m.unit] || 0) + 1; return a; }, {});
    const mainUnit = unit || Object.keys(unitCount).sort((a, b) => unitCount[b] - unitCount[a])[0] || '';
    return {
      unit: mainUnit,
      rows: all.filter((m) => m.unit === mainUnit).sort((a, b) => a.date.localeCompare(b.date)),
      otherUnits: Object.keys(unitCount).filter((u) => u !== mainUnit).map((u) => ({ unit: u, n: unitCount[u] })),
    };
  }

  /* ---------------- 一图秀：多指标归一化 ---------------- */
  /**
   * 每条线按**该指标全部记录**的 min/max 归一化（16 号 §0.2），
   * 不是按当前时间窗——否则切窗口时曲线形状会整体跳变。
   */
  function normalize(rows, allRows) {
    const src = allRows && allRows.length ? allRows : rows;
    const ys = src.map((r) => r.value);
    let lo = Math.min(...ys), hi = Math.max(...ys);
    if (!isFinite(lo) || !isFinite(hi)) { lo = 0; hi = 1; }
    const span = hi - lo || Math.max(Math.abs(hi) * 0.08, 1);
    return {
      lo, hi,
      at: (v) => (v - lo) / span,      // 0..1
    };
  }

  /** 一图秀的序列集合：最多 4 条（16 号 R7）。 */
  function buildChartSeries(metrics, names, opts = {}) {
    const max = opts.max || 4;
    const picked = (names || []).slice(0, max);
    return picked.map((name) => {
      const { unit, rows, otherUnits } = seriesOf(metrics, name);
      const none = rows.length === 0;
      const norm = none ? { lo: 0, hi: 1, at: (v) => 0 } : normalize(rows, rows);
      return {
        name, unit, rows, otherUnits, none,
        single: rows.length === 1,        // 单点不连线（R2）
        norm,
        min: none ? null : norm.lo,
        max: none ? null : norm.hi,
        last: none ? null : rows[rows.length - 1],
      };
    });
  }

  /** 时间窗过滤（R8）。窗口外的点不画，序列仍留在图例里并标注"该窗口无数据"。 */
  function windowRows(rows, from, to) {
    return (rows || []).filter((r) => (!from || r.date >= from) && (!to || r.date <= to));
  }

  const API = {
    num, TRACKS, trackOf, parseRef, refStatus, seriesOf,
    normalize, buildChartSeries, windowRows,
  };
  root.SARCO_METRICS = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
