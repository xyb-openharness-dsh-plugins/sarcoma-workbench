/* 小肉宝 SarcoPal · 临床试验匹配指数（35 号规范的可执行实现）
   ------------------------------------------------------------------
   规范：starter docs/35-CLINICAL-TRIAL-MATCHING.md
   为什么单独一个文件：和 exits.js 同理——这段算法必须被**产品**和**测试**同时加载。
   写在 app.js 里，测试就只能重写一份，于是"全绿"与产品无关。

   四条硬约束（写进代码，不只写文档）：
   1. 未知维度 **不进分母**，不是 0 分。患者越不了解自己，分母越小，不是分数越低。
   2. 入排标准 / 生物标志阈值 / 年龄区间 **不进计算**——登记库没有这些结构化字段，
      有也必须由研究者判定。
   3. `index = null` ≠ 0：没有任何可算维度时不显示分数，只显示缺口清单。
   4. 绝不输出"能入组/符合条件/建议报名"。只输出"登记信息对得上多少"。
*/
(function (root) {
  'use strict';

  /** 三态：known 有值 / unknown 未测 / absent 本癌种无此项 */
  function field(value, opts = {}) {
    return {
      value: value === undefined ? null : value,
      state: opts.state || (value === undefined || value === null || value === '' ? 'unknown' : 'known'),
      source: opts.source || null,
      date: opts.date || null,
      note: opts.note || null,
    };
  }

  /**
   * 单个维度的得分。返回 null 表示"这一维不该进分母"。
   * 规则：
   *  - 患者未知 / 无此项 → null
   *  - 登记库这一维为 null → null
   *  - 两边都有 → 0..1
   */
  function scoreDim(dim, patientVal, trialVal) {
    if (patientVal === null || patientVal === undefined || patientVal === '') return null;
    if (trialVal === null || trialVal === undefined || trialVal === '') return null;
    switch (dim.kind) {
      case 'eq':
        return String(patientVal) === String(trialVal) ? 1 : 0;
      case 'contains':
        return String(trialVal).includes(String(patientVal)) ? 1 : 0;
      case 'status': {
        const table = dim.table || {};
        const v = table[String(trialVal)];
        return v === undefined ? null : v;
      }
      case 'subtype': {
        // 明写 both → 1；与本型一致 → 1；明写另一型 → 0；未写 → null
        const t = String(trialVal);
        if (t === 'both' || t === '全部') return 1;
        return t === String(patientVal) ? 1 : 0;
      }
      default:
        return null;
    }
  }

  /**
   * 计算一条试验的匹配指数。
   * @param {object} patient  { subtype, molecular:{...}, ihc:{...}, region } —— 建档产出
   * @param {object} trial    登记库条目（已裁剪字段）
   * @param {object} dims     维度定义（见 DEFAULT_DIMS）
   */
  function computeMatch(patient, trial, dims) {
    const detail = [];
    let sum = 0;
    let n = 0;
    const missing = [];

    for (const dim of dims) {
      const pv = dim.fromPatient(patient);
      const tv = dim.fromTrial(trial);
      const s = scoreDim(dim, pv, tv);
      if (s === null) {
        missing.push({
          dim: dim.key,
          label: dim.label,
          reason: pv === null || pv === undefined || pv === ''
            ? (dim.absentInDisease ? 'absent' : 'unknown')
            : 'not_in_registry',
        });
        detail.push({ dim: dim.key, label: dim.label, score: null, patient: pv ?? null, trial: tv ?? null });
        continue;
      }
      sum += s;
      n += 1;
      detail.push({ dim: dim.key, label: dim.label, score: s, patient: pv ?? null, trial: tv ?? null });
    }

    // 缺口是登记库里**根本没有**的维度，永远不进分母；单列出来给患者看
    const notComputable = [
      { label: '入排标准（inclusion / exclusion）', why: '登记库导出里没有结构化字段；且必须由研究者判定' },
      { label: '生物标志阈值', why: '登记记录里只有散文描述，没有可机读阈值' },
      { label: '年龄区间', why: '大部分登记记录没有该字段' },
    ];

    // 只有登记库侧维度可算时（如患者什么都没填），不给分数只给缺口：
    // 否则"100 分"会被读成"完全匹配"，而患者其实一项都没提供。
    const patientSideKnown = detail.filter((d) => d.score !== null && dims.find((x) => x.key === d.dim)?.patientSide).length;
    const index = n === 0 || patientSideKnown === 0 ? null : Math.round((100 * sum) / n);
    return {
      index,
      patientSideKnown,
      knownDims: n,
      totalDims: dims.length,
      missingCount: missing.length,
      missing,
      notComputable,
      detail,
    };
  }

  /** STS 的维度口径。换病种按 35 号 §4 替换，不要照抄。
      只放"登记库里真的有的字段 + 患者手上有结果的字段"。 */
  const DEFAULT_DIMS = [
    {
      key: 'region', patientSide: true, label: '地区', kind: 'contains', absentInDisease: false,
      fromPatient: (p) => (p && p.region) || null,
      fromTrial: (t) => (t && t.country) || null,
    },
    {
      // patientSide:false —— 招募状态是**登记库侧**的事实，患者不需要提供任何东西。
      // 它仍然参与打分（"这个试验现在招不招"确实影响可行性），但不能单独支撑一个 index：
      // 否则一个什么资料都没填的档案也会拿到 100 分，读起来像"完全匹配"（T3 反例）。
      key: 'status', label: '招募状态', kind: 'status', absentInDisease: false, patientSide: false,
      table: {
        RECRUITING: 1, NOT_YET_RECRUITING: 0.6, ACTIVE_NOT_RECRUITING: 0.4,
        ENROLLING_BY_INVITATION: 0.4, UNKNOWN: null,
      },
      fromPatient: () => 'any',
      fromTrial: (t) => (t && t.statusCode) || null,
    },
    {
      key: 'subtype', patientSide: true, label: '亚型线索', kind: 'subtype', absentInDisease: false,
      fromPatient: (p) => (p && p.subtype) || null,
      fromTrial: (t) => (t && t.subtype) || null,
    },
    {
      key: 'molecular', patientSide: true, label: '分子检测', kind: 'eq', absentInDisease: false,
      fromPatient: (p) => (p && p.molecular && p.molecular.token) || null,
      fromTrial: (t) => (t && t.molecularToken) || null,
    },
    {
      key: 'ihc', patientSide: true, label: '免疫组化', kind: 'eq', absentInDisease: false,
      fromPatient: (p) => (p && p.ihc && p.ihc.token) || null,
      fromTrial: (t) => (t && t.ihcToken) || null,
    },
  ];

  /** 界面必须写出来的"指数格式"说明（35 号 §2.3）。文案与代码同源，避免文档/页面漂移。 */
  const INDEX_FORMAT = [
    '取值 0–100；**null 不是 0** —— 没有可算维度时不显示分数，只显示缺口。',
    '分母只累加"患者有结果 且 登记库有字段"的维度；了解的维度越少，分母越小，不是分数越低。',
    '各维度等权，不做加权，也不做连续插值（部分命中只给 0.4 / 0.6 固定档）。',
    '入排标准、生物标志阈值、年龄区间**不进计算**：登记库里没有结构化字段，且必须由研究者判定。',
    '它不是"我能不能入组"的答案；是否适合由研究团队评估。',
  ];

  const API = { field, scoreDim, computeMatch, DEFAULT_DIMS, INDEX_FORMAT };
  root.SARCO_MATCH = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
