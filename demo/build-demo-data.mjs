/* 小韧宝 SarcPal · 演示数据生成器（唯一数据源）
   产出：
     1) demo/demo-data.sqlite —— 执行 schema/0001_initial.sql 建表后逐表 INSERT（显式列名）
     2) prototypes/v0.2/demo-data.js —— 原型只读数据层（经典 <script> 可直接加载）
   原则：
     - 全部患者数据为虚构模拟；两套档案只覆盖事实层（值 / 日期 / 谁说的 / 报告原文）。
     - 不写任何"好坏、稳定、进展、缓解、建议、预后"一类判断。
     - 不写时间戳、不用 Math.random：同一份代码连跑两次，两个产物 md5 必须一致。
   用法：
     - 直接运行：node demo/build-demo-data.mjs（写盘）
     - 被 import：只拿到 buildDemoProfiles() 的纯数据，一个字节都不碰磁盘
   医学口径：research/STS-FACTCHECK-2026-10-25.md（NCCN STS V3.2026 / AJCC 8 / WHO 5th 2020）。
*/
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, existsSync, rmSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const P2 = join(ROOT, 'prototypes/v0.2');
const SCHEMA = join(ROOT, 'schema/0001_initial.sql');

/* ---------- 小工具 ---------- */
const pt = (d, v, src, refLow = null, refHigh = null) => ({ d, v, src, ref_low: refLow, ref_high: refHigh });
const qp = (d, v, src) => ({ d, v, src, ref_low: null, ref_high: null });

/* 指标配色：同一屏最多 4 条序列，必须跨色相拉开。
   品牌赭紫 #7B4C9A 给最常用的一条；其余用同明度的褐金 / 青 / 砖红。 */
const KEY_COLOR = {
  hgb: '#7B4C9A',
  alb: '#9A6FB5',
  alt: '#A9761F',
  crp: '#2F6F66',
  wound_q: '#B4553A',
  appetite_q: '#3F6F99',
};

/* 五档随访：NCCN STS V3.2026 原表（中文表述录自 research/STS-FACTCHECK-2026-10-25.md §D15）
   只并列原文，不按患者分档、不排计划。硬纤维瘤档不在本工作台范围（中间型、非恶性）。 */
const RHYTHM_TIERS = [
  {
    key: 'ia-ib',
    item: 'Stage IA / IB（低级别）',
    freq: '体格检查每 3–6 个月 × 3 年，之后每年一次；获取基线影像；按局部区域复发风险定期行原发部位影像；考虑胸部影像',
    guideline: 'NCCN STS V3.2026 · EXTSARC-2 · 页码待核',
  },
  {
    key: 'ii-iii-resectable',
    item: 'Stage II / III / 选择 IV（anyT N1 M0），可切除且功能结局可接受',
    freq: '体格检查 + 影像每 3–6 个月 × 3 年，然后每 6 个月至满 5 年，之后每年；转移性疾病影像；治疗结束时及定期行原发部位影像',
    guideline: 'NCCN STS V3.2026 · EXTSARC-3 · 页码待核',
  },
  {
    key: 'ii-iii-unresectable',
    item: 'Stage II / III，可切除但功能结局不可接受，或不可切除',
    freq: '体格检查每 3–6 个月至满 5 年，然后每 6 个月 × 2 年，之后每年；胸部影像；原发部位基线 + 定期影像',
    guideline: 'NCCN STS V3.2026 · EXTSARC-4 · 页码待核',
  },
  {
    key: 'iv-sync',
    item: '同步 IV 期',
    freq: '体格检查每 2–6 个月 × 2–3 年，然后每 6 个月至满 5 年，之后每年（若仍无复发）；胸部及其他已知转移部位影像',
    guideline: 'NCCN STS V3.2026 · EXTSARC-5 · 页码待核',
  },
  {
    key: 'retroperitoneal',
    item: '腹膜后 / 腹腔内',
    freq: '体格检查 + 影像每 3–6 个月 × 3 年，然后每 6 个月至满 5 年，之后每年',
    guideline: 'NCCN STS V3.2026 · RETSARC-3 · 页码待核',
  },
];

/* ---------- 档案 A：王先生 · 右大腿非计划切除 ---------- */
function profileA() {
  return {
    meta: {
      name: '王先生',
      sex: '男',
      age: 52,
      meta: '52 岁 · 右大腿深部 · 非计划切除后二次扩大切除',
      headline: '二次扩大切除与术后放疗已记录，进入复查',
      stage: 'pT2N0M0（病理报告原文 · AJCC 第 8 版）',
      mindset: '最想弄清第一次在外院切的那次算什么，还有切缘那行字到底怎么念。',
      dash_keys: ['hgb', 'alb', 'alt'],
      path: ['右大腿肿块', '县医院按脂肪瘤切除', '术后病理：肉瘤', '会诊：UPS G3', '二次扩大切除', '术后放疗'],
      activity: '能走 20 分钟；蹲下去还差一点，小腿到傍晚发紧。',
      family_talk: '想把两次手术和放疗的时间线讲给女儿听，复诊时她陪着去。',
      window_start: '2026-04-02',
      window_end: '2026-10-06',
    },
    titles: {
      pathology: '亚型与病理', site: '部位与大小', staging: '分期与分级', grade: '分级（FNCLCC）',
      molecular: '分子检测', diagnosis: '确诊时间轴', surgery: '手术档案', margin: '切缘记录',
      wound: '伤口与恢复', lines: '治疗线序', rt: '放疗记录', tox: '副作用记录',
      function: '日常动作', tess: 'TESS 自评', rhythm: '随访节奏', imaging: '影像时间轴',
      question: '问题清单',
    },
    pathology: [
      { d: '2026-04-23', subtype: '梭形细胞恶性肿瘤，倾向肉瘤（原文）', institution: '县人民医院病理科', consult: '未会诊', note: '首次切除标本；报告原文未给出亚型与分级', ord: 0 },
      { d: '2026-05-08', subtype: '未分化多形性肉瘤（UPS）', institution: '省肿瘤医院病理科', consult: '外院切片送省肿瘤医院会诊', note: '会诊报告原文：符合未分化多形性肉瘤；FNCLCC G3', ord: 1 },
      { d: '2026-05-26', subtype: '未分化多形性肉瘤（UPS）', institution: '省肿瘤医院病理科', consult: '—', note: '二次扩大切除标本病理；切缘见「切缘记录」', ord: 2 },
    ],
    site: [
      { d: '2026-04-03', site: '右大腿（股四头肌内，深部）', size_text: '8.5 × 6.2 × 5.0 cm（MRI）', depth: '深部：位于深筋膜下、股四头肌肌内（影像原文）', src: '省肿瘤医院 MRI 报告 2026-04-03', ord: 0 },
      { d: '2026-05-26', site: '右大腿（股四头肌内，深部）', size_text: '8.0 × 6.0 × 4.5 cm（病理）', depth: '深部（病理标本描述原文）', src: '省肿瘤医院病理报告 2026-05-26', ord: 1 },
    ],
    /* 分期行只有 A 有；B 故意没有该行（界面显示「未回报」）。 */
    staging: [
      { d: '2026-05-26', tnm: 'pT2N0M0', system: 'AJCC 第 8 版', source: '省肿瘤医院病理报告 2026-05-26', note: '分期原文照抄；T/N/M 与分级的关系由医生判定，本台不合并计算期别', ord: 0 },
    ],
    grade: [
      { d: '2026-05-08', grade: 'G3', components: '分化 3 + 核分裂 2 + 坏死 1 = 6 分', institution: '省肿瘤医院病理科', note: 'FNCLCC 三组件、合计分与 G3 均为会诊报告原文', ord: 0 },
    ],
    molecular: [
      { d: '2026-05-08', item: 'MDM2（FISH）', result: '阴性（原文）', institution: '省肿瘤医院病理科', ord: 0 },
      { d: '2026-05-08', item: 'SS18（FISH）', result: '阴性（原文）', institution: '省肿瘤医院病理科', ord: 1 },
      { d: '2026-05-08', item: 'NTRK1/2/3（IHC）', result: '未做', institution: '—', ord: 2 },
    ],
    diagnosis: [
      { d: '2026-03-28', kind: '发现肿块', detail: '洗澡时摸到右大腿前侧一个不痛的包，约拳头一半大', institution: '自述', ord: 0 },
      { d: '2026-04-02', kind: '首次就诊', detail: '县人民医院普外科门诊；当日开大腿超声', institution: '县人民医院', ord: 1 },
      { d: '2026-04-06', kind: '影像', detail: '超声：右大腿肌层内实性低回声，约 8.3 cm（原文）', institution: '县人民医院超声科', ord: 2 },
      { d: '2026-04-09', kind: '切除', detail: '右大腿肿物局部切除术；术前诊断写「右大腿脂肪瘤」', institution: '县人民医院普外科', ord: 3 },
      { d: '2026-04-23', kind: '病理回报', detail: '术后病理：梭形细胞恶性肿瘤，倾向肉瘤（原文）；报告写「请上级医院会诊」', institution: '县人民医院病理科', ord: 4 },
      { d: '2026-05-08', kind: '会诊', detail: '病理会诊：未分化多形性肉瘤，FNCLCC G3（原文）', institution: '省肿瘤医院病理科', ord: 5 },
      { d: '2026-05-12', kind: '转诊', detail: '软组织肿瘤多学科门诊记录原文：拟行二次扩大切除', institution: '省肿瘤医院', ord: 6 },
    ],
    surgery: [
      { d: '2026-04-09', kind: '右大腿肿物局部切除术', extent: '沿肿物边缘切除，未标记方向（手术记录原文摘录）', recon: '—', institution: '县人民医院普外科', note: '术前诊断：右大腿脂肪瘤', ord: 0 },
      { d: '2026-05-21', kind: '右大腿肿瘤扩大切除术', extent: '距原手术瘢痕外 3 cm 设计切口，连同部分股四头肌一并切除（手术记录原文）', recon: '—', institution: '省肿瘤医院软组织肿瘤外科', note: '术前影像与病理会诊见「确诊路径」', ord: 1 },
    ],
    margin: [
      { d: '2026-04-23', margin_text: '切缘未见明确肿瘤，局部切缘距肿瘤约 2 mm（原文）', surgery_ref: '2026-04-09', src: '县人民医院病理报告', ord: 0 },
      { d: '2026-05-26', margin_text: '镜下切缘未见肿瘤累及（R0，病理原文）', surgery_ref: '2026-05-21', src: '省肿瘤医院病理报告', ord: 1 },
    ],
    wound: [
      { d: '2026-04-12', text: '换药时说伤口有点渗液，纱布一天换两次', care: '县人民医院换药室', ord: 0 },
      { d: '2026-05-28', text: '第二次手术后第 7 天，伤口干燥，走路时有牵拉感', care: '省肿瘤医院病房', ord: 1 },
      { d: '2026-06-08', text: '拆线，伤口愈合', care: '省肿瘤医院门诊', ord: 2 },
      { d: '2026-06-30', text: '放疗开始后皮肤发红，没破', care: '自述', ord: 3 },
      { d: '2026-07-21', text: '皮肤颜色变深，只在照野里', care: '放疗门诊', ord: 4 },
    ],
    lines: [
      { line_no: 1, name: '手术（二次扩大切除）', detail: '右大腿肿瘤扩大切除术', start: '2026-05-21', end: '2026-05-21', status: '已完成', src: '手术记录 2026-05-21', ord: 0 },
      { line_no: 2, name: '术后放疗', detail: '右大腿瘤床 60 Gy / 30 次', start: '2026-06-15', end: '2026-07-27', status: '已完成', src: '放疗记录 2026-06-15', ord: 1 },
    ],
    cycles: [],
    rt: [
      { start: '2026-06-15', end: '2026-07-27', site: '右大腿瘤床及手术瘢痕外放 2 cm', timing: '术后（放疗记录原文）', note: '60 Gy / 30 次；末次 2026-07-27', ord: 0 },
    ],
    tox: [
      { d: '2026-06-30', symptom: '照野皮肤发红', ctcae_text: '放疗门诊记录原文：放射性皮炎 1 级（CTCAE v5.0）', note: '放疗第 3 周', ord: 0 },
      { d: '2026-07-02', symptom: '乏力，下午想躺一会儿', ctcae_text: '—', note: '自述', ord: 1 },
      { d: '2026-07-25', symptom: '照野皮肤脱屑、颜色变深', ctcae_text: '放疗门诊记录原文：干性脱屑', note: '放疗第 6 周', ord: 2 },
    ],
    function: [
      { d: '2026-06-20', action: '蹲下', limitation: '蹲不下去，膝盖弯到一半就停', ord: 0 },
      { d: '2026-08-14', action: '走路', limitation: '走 500 米要歇一次，主要是大腿发紧', ord: 1 },
      { d: '2026-10-06', action: '上下楼', limitation: '上楼可以，下楼要扶栏杆', ord: 2 },
      { d: '2026-10-06', action: '小腿肿', limitation: '到傍晚小腿发胀，早上好一些', ord: 3 },
    ],
    tess: [
      {
        d: '2026-10-06', limb: '下肢',
        answers: [2, 3, 2, 4, 3, 2, 2, 3, 4, 3, 2, 3, 3, 2, 4, 3, 2, 2, 3, 3, 4, 2, 3, 3, 2, 3, 4, 3, 2, 3],
        ord: 0,
      },
    ],
    rhythm: RHYTHM_TIERS.map((t, i) => ({ item: t.item, freq: t.freq, guideline: t.guideline, next: '—', ord: i })),
    imaging: [
      { d: '2026-04-03', method: 'MRI', region: '右大腿', conclusion: '右大腿股四头肌内异常信号，大小约 8.5 × 6.2 × 5.0 cm（原文摘录）', institution: '省肿瘤医院放射科', ord: 0 },
      { d: '2026-05-15', method: 'CT', region: '胸部', conclusion: '双肺未见明确转移性病变（原文）', institution: '省肿瘤医院放射科', ord: 1 },
      { d: '2026-08-27', method: 'MRI', region: '右大腿', conclusion: '术后改变，术区未见明确异常信号（原文）', institution: '省肿瘤医院放射科', ord: 2 },
      { d: '2026-09-24', method: 'CT', region: '胸部', conclusion: '双肺未见明确转移性病变（原文）', institution: '省肿瘤医院放射科', ord: 3 },
    ],
    questions: [
      { d: '2026-06-20', q: '第二次手术切除的范围，和第一次比多了哪些组织？', asked: 1, answer: '门诊记录原文：以二次手术病理与手术记录为准', ord: 0 },
      { d: '2026-06-20', q: '切缘那行「距肿瘤约 2 mm」在报告里怎么读？', asked: 0, answer: '', ord: 1 },
      { d: '2026-08-14', q: '术后放疗为什么安排在手术之后，而不是手术之前？', asked: 1, answer: '', ord: 2 },
      { d: '2026-08-14', q: '复查为什么胸部做 CT、腿做 MRI？', asked: 0, answer: '', ord: 3 },
      { d: '2026-10-06', q: '康复训练现在可以练哪些动作？', asked: 0, answer: '', ord: 4 },
    ],
    viewpoints: [
      { d: '2026-05-09', mood: '懵', text: '会诊报告上写「未分化多形性肉瘤」，我第一次听到这个词。', ord: 0 },
      { d: '2026-07-20', mood: '累', text: '放疗做到一半，皮肤像晒伤，走路摩擦会疼。', ord: 1 },
      { d: '2026-10-06', mood: '踏实一点', text: '复查单上写「未见明确异常」，我把它照抄进记录，别的没多想。', ord: 2 },
    ],
    docs: [
      { id: 'd1', name: '县医院术后病理报告', date: '2026-04-23', type: '报告', status: '已核对', ord: 0 },
      { id: 'd2', name: '省肿瘤医院病理会诊报告', date: '2026-05-08', type: '报告', status: '已核对', ord: 1 },
      { id: 'd3', name: '二次扩大切除手术记录', date: '2026-05-21', type: '报告', status: '已核对', ord: 2 },
      { id: 'd4', name: '二次手术病理报告', date: '2026-05-26', type: '报告', status: '待核对', ord: 3 },
      { id: 'd5', name: '放疗计划单', date: '2026-06-15', type: '报告', status: '已核对', ord: 4 },
      { id: 'd6', name: '右大腿 MRI 报告', date: '2026-08-27', type: '影像', status: '已核对', ord: 5 },
    ],
    candidates: [
      { id: 'c1', name: '切缘原文', value: '镜下切缘未见肿瘤累及（R0，病理原文）', source: '二次手术病理报告 · 第 2 页', status: 'accepted', ord: 0 },
      { id: 'c2', name: '放疗剂量', value: '60 Gy / 30 次', source: '放疗计划单 · 第 1 页', status: 'needs_review', ord: 1 },
      { id: 'c3', name: '核分裂计数', value: '约 12 个 / 10 HPF', source: '会诊报告 · 镜下描述', status: 'needs_review', ord: 2 },
    ],
    metrics: [
      {
        key: 'hgb', name: '血红蛋白', unit: 'g/L', cat: '血象', color: KEY_COLOR.hgb, dec: 0, kind: 'numeric',
        band_low: 130, band_high: 175, note: '不同医院参考区间不合并；本档案参考区间取省肿瘤医院化验单',
        points: [
          pt('2026-04-02', 118, '首次就诊', 130, 175), pt('2026-05-12', 112, '多学科门诊', 130, 175),
          pt('2026-05-26', 108, '术后第 5 天', 130, 175), pt('2026-06-20', 121, '放疗前', 130, 175),
          pt('2026-08-14', 126, '复查', 130, 175), pt('2026-10-06', 129, '复查', 130, 175),
        ],
      },
      {
        key: 'alb', name: '白蛋白', unit: 'g/L', cat: '生化', color: KEY_COLOR.alb, dec: 0, kind: 'numeric',
        band_low: 40, band_high: 55, note: '营养相关指标；本台只并列数值，不解读',
        points: [
          pt('2026-04-02', 41, '首次就诊', 40, 55), pt('2026-05-12', 38, '多学科门诊', 40, 55),
          pt('2026-06-20', 40, '放疗前', 40, 55), pt('2026-10-06', 42, '复查', 40, 55),
        ],
      },
      {
        /* 故意只填参考下限：这张化验单没有给上限 → 界面只能标 needsUln，绝不能拿下限当上限。 */
        key: 'alt', name: 'ALT（谷丙转氨酶）', unit: 'U/L', cat: '生化', color: KEY_COLOR.alt, dec: 0, kind: 'numeric',
        band_low: 9, band_high: null, note: '该院化验单只印了参考下限 9 U/L，未印上限',
        points: [
          pt('2026-04-02', 22, '首次就诊', 9, null), pt('2026-05-12', 31, '多学科门诊', 9, null),
          pt('2026-06-20', 28, '放疗前', 9, null), pt('2026-10-06', 35, '复查', 9, null),
        ],
      },
      {
        /* 故意只有 1 个点：必须出现「只有 1 次记录，暂不连线」。 */
        key: 'crp', name: 'C 反应蛋白', unit: 'mg/L', cat: '生化', color: KEY_COLOR.crp, dec: 1, kind: 'numeric',
        band_low: 0, band_high: 8, note: '只记录到 1 次；单点不连线',
        points: [pt('2026-07-02', 6.8, '放疗期间门诊', 0, 8)],
      },
      {
        key: 'wound_q', name: '伤口与照野皮肤（自述）', unit: '', cat: '伤口与皮肤', color: KEY_COLOR.wound_q, dec: null, kind: 'qual',
        band_low: null, band_high: null, note: '患者自己的描述，照抄原话；分类序列只画节点，不连线',
        points: [
          qp('2026-04-12', '少量渗液', '换药记录'), qp('2026-05-28', '干燥', '术后第 7 天'),
          qp('2026-06-08', '已拆线', '门诊'), qp('2026-06-30', '照野发红', '放疗第 3 周'),
          qp('2026-07-21', '干性脱屑', '放疗门诊'),
        ],
      },
      {
        key: 'wt', name: '体重（自测）', unit: 'kg', cat: '体征', color: '#6B4C8C', dec: 1, kind: 'numeric',
        band_low: null, band_high: null, note: '家里同一台秤；不同秤的读数不合并',
        points: [
          pt('2026-04-02', 74.5, '首次就诊', null, null), pt('2026-05-26', 72.8, '术后第 5 天', null, null),
          pt('2026-08-14', 73.6, '复查', null, null), pt('2026-10-06', 74.0, '复查', null, null),
        ],
      },
    ],
    events: [
      { d: '2026-04-09', label: '首次切除（外院）' },
      { d: '2026-04-23', label: '术后病理回报' },
      { d: '2026-05-08', label: '病理会诊' },
      { d: '2026-05-21', label: '二次扩大切除' },
      { d: '2026-06-15', label: '术后放疗开始' },
      { d: '2026-10-06', label: '复查' },
    ],
  };
}

/* ---------- 档案 B：张女士 · 腹膜后去分化脂肪肉瘤复发不可切除 ---------- */
function profileB() {
  return {
    meta: {
      name: '张女士',
      sex: '女',
      age: 58,
      meta: '58 岁 · 腹膜后去分化脂肪肉瘤 · 复发灶不可切除（MDT 记录 2026-05-11）',
      /* 看板大标题不放判读：「复发 / 不可切除」是 2026-05-11 MDT 记录的原文结论，
         不是本台对病情下的判断。产品标题只写"现在在做什么 + 你能记什么"，
         那句结论留在「确诊路径」与「记录详情」里，带日期与出处（三层边界第 ③ 层）。 */
      headline: '口服靶向治疗中：按周期记录，把手脚的反应带进门诊',
      stage: '',
      mindset: '最想知道现在这个药吃到第几个周期，手脚的反应要不要记下来带给医生。',
      dash_keys: ['hgb', 'alt', 'alb'],
      path: ['腹膜后肿块', '手术切除', '去分化脂肪肉瘤', '局部复发（MDT 记录）', '不可切除（MDT 记录）', '口服靶向'],
      activity: '能自己做饭；走 10 分钟要坐下歇，下午容易困。',
      family_talk: '妹妹在老家，电话里总问还要吃多久，我不知道怎么答。',
      window_start: '2026-04-16',
      window_end: '2026-10-14',
    },
    titles: {
      pathology: '亚型与病理', site: '部位与大小', staging: '分期与分级', grade: '分级（FNCLCC）',
      molecular: '分子检测', diagnosis: '确诊时间轴', surgery: '手术档案', margin: '切缘记录',
      wound: '伤口与恢复', lines: '治疗线序', rt: '放疗记录', tox: '副作用记录',
      function: '日常动作', tess: 'TESS 自评', rhythm: '随访节奏', imaging: '影像时间轴',
      question: '问题清单',
    },
    pathology: [
      { d: '2024-02-09', subtype: '高分化脂肪肉瘤，局部去分化', institution: '省肿瘤医院病理科', consult: '院内会诊', note: '2024 年手术标本；报告原文', ord: 0 },
      { d: '2026-05-06', subtype: '去分化脂肪肉瘤（复发灶穿刺）', institution: '省肿瘤医院病理科', consult: '—', note: 'CT 引导下穿刺活检；报告原文', ord: 1 },
    ],
    site: [
      { d: '2024-01-08', site: '腹膜后（左肾前间隙）', size_text: '12.0 × 9.5 × 8.0 cm（CT）', depth: '腹膜后（影像原文）', src: '省肿瘤医院 CT 报告 2024-01-08', ord: 0 },
      { d: '2026-05-06', site: '腹膜后（原瘤床旁）', size_text: '7.2 × 5.8 cm（CT）', depth: '腹膜后（影像原文）', src: '省肿瘤医院穿刺前 CT 2026-05-06', ord: 1 },
    ],
    /* 故意为空：本档案没有分期记录行 → 界面必须显示「未回报」。 */
    staging: [],
    grade: [
      { d: '2024-02-09', grade: 'G3', components: '分化 3 + 核分裂 2 + 坏死 1 = 6 分', institution: '省肿瘤医院病理科', note: '2024 年手术标本报告原文；分级与分期分开记录，不互推', ord: 0 },
    ],
    molecular: [
      { d: '2024-02-09', item: 'MDM2（FISH）', result: '扩增（MDM2/CEP12 比值 6.8，原文）', institution: '省肿瘤医院病理科', ord: 0 },
      { d: '2026-05-06', item: 'CDK4（IHC）', result: '阳性（原文）', institution: '省肿瘤医院病理科', ord: 1 },
    ],
    diagnosis: [
      { d: '2023-12-20', kind: '发现肿块', detail: '体检超声发现左上腹占位，自己没感觉', institution: '体检中心', ord: 0 },
      { d: '2024-01-08', kind: '影像', detail: '腹部增强 CT：腹膜后 12 cm 占位（原文摘录）', institution: '省肿瘤医院放射科', ord: 1 },
      { d: '2024-01-16', kind: '转诊', detail: '腹膜后肿瘤外科门诊；记录「拟行手术切除」', institution: '省肿瘤医院', ord: 2 },
      { d: '2024-02-02', kind: '切除', detail: '腹膜后肿瘤切除术（手术记录原文）', institution: '省肿瘤医院腹膜后肿瘤外科', ord: 3 },
      { d: '2024-02-09', kind: '病理回报', detail: '高分化脂肪肉瘤，局部去分化（原文）', institution: '省肿瘤医院病理科', ord: 4 },
      { d: '2026-04-28', kind: '影像', detail: '复查 CT：原瘤床旁新增软组织结节（原文摘录）', institution: '省肿瘤医院放射科', ord: 5 },
      { d: '2026-05-06', kind: '活检', detail: 'CT 引导下腹膜后病灶穿刺活检（2 针）', institution: '省肿瘤医院介入科', ord: 6 },
      { d: '2026-05-11', kind: '会诊', detail: 'MDT 记录原文：复发灶不可切除，进入系统治疗', institution: '省肿瘤医院', ord: 7 },
    ],
    surgery: [
      { d: '2024-02-02', kind: '腹膜后肿瘤切除术', extent: '连同左肾前间隙脂肪及部分肾被膜一并切除（手术记录原文）', recon: '—', institution: '省肿瘤医院腹膜后肿瘤外科', note: '2024 年首次手术；本次住院记录已归档', ord: 0 },
    ],
    margin: [
      { d: '2024-02-09', margin_text: '切缘局部距肿瘤 < 1 mm（原文）', surgery_ref: '2024-02-02', src: '省肿瘤医院病理报告', ord: 0 },
    ],
    wound: [],
    lines: [
      { line_no: 1, name: '腹膜后肿瘤切除术', detail: '首次手术；病理见「亚型与病理」', start: '2024-02-02', end: '2024-02-02', status: '已完成', src: '手术记录 2024-02-02', ord: 0 },
      { line_no: 2, name: '多柔比星单药（一线）', detail: '多柔比星 75 mg/m²，每 3 周一次', start: '2026-05-19', end: '2026-07-07', status: '已结束', src: '肿瘤内科医嘱 2026-05-19', ord: 1 },
      { line_no: 3, name: '安罗替尼（二线）', detail: '12 mg 每日一次，服 14 天停 7 天；换线原因抄医嘱：一线治疗结束后进入口服靶向', start: '2026-07-21', end: '', status: '进行中', src: '肿瘤内科医嘱 2026-07-21', ord: 2 },
    ],
    cycles: [
      { name: '第 1 周期', date: '2026-05-19', drugs: '多柔比星', status: '已完成', done: 1, ord: 0 },
      { name: '第 2 周期', date: '2026-06-09', drugs: '多柔比星', status: '已完成', done: 1, ord: 1 },
      { name: '第 3 周期', date: '2026-06-30', drugs: '多柔比星', status: '已完成', done: 1, ord: 2 },
      { name: '第 4 周期', date: '2026-07-21', drugs: '安罗替尼（口服，28 天为一周期）', status: '已完成', done: 1, ord: 3 },
      { name: '第 5 周期', date: '2026-08-18', drugs: '安罗替尼（口服）', status: '已完成', done: 1, ord: 4 },
      { name: '第 6 周期', date: '2026-09-15', drugs: '安罗替尼（口服）', status: '已完成', done: 1, ord: 5 },
      { name: '第 7 周期', date: '2026-10-13', drugs: '安罗替尼（口服）', status: '按医嘱', done: 0, ord: 6 },
    ],
    rt: [],
    tox: [
      { d: '2026-08-02', symptom: '手脚发红、脱皮', ctcae_text: '门诊记录原文：手足皮肤反应 2 级（CTCAE v5.0）', note: '安罗替尼第 2 周期后', ord: 0 },
      { d: '2026-08-19', symptom: '没力气，下午要躺', ctcae_text: '—', note: '自述', ord: 1 },
      { d: '2026-09-02', symptom: '吃饭没味道，吃半碗', ctcae_text: '—', note: '自述', ord: 2 },
      { d: '2026-09-18', symptom: '手脚裂口，碰水疼', ctcae_text: '门诊记录原文：手足皮肤反应 2 级', note: '门诊', ord: 3 },
    ],
    function: [
      { d: '2026-08-19', action: '走路', limitation: '走 10 分钟要坐下歇', ord: 0 },
      { d: '2026-09-18', action: '上楼', limitation: '两层楼要歇一次', ord: 1 },
    ],
    tess: [],
    rhythm: RHYTHM_TIERS.map((t, i) => ({ item: t.item, freq: t.freq, guideline: t.guideline, next: '—', ord: i })),
    imaging: [
      { d: '2026-04-28', method: 'CT', region: '腹盆腔', conclusion: '原瘤床旁新增软组织结节，约 7.2 × 5.8 cm（原文摘录）', institution: '省肿瘤医院放射科', ord: 0 },
      { d: '2026-05-06', method: 'CT', region: '腹盆腔', conclusion: '穿刺路径评估；病灶同前（原文）', institution: '省肿瘤医院放射科', ord: 1 },
      { d: '2026-06-25', method: 'CT', region: '胸部', conclusion: '双肺未见明确转移性病变（原文）', institution: '省肿瘤医院放射科', ord: 2 },
      { d: '2026-08-20', method: 'CT', region: '腹盆腔', conclusion: '病灶大小约 7.0 × 5.6 cm（原文摘录）', institution: '省肿瘤医院放射科', ord: 3 },
      { d: '2026-09-17', method: 'MRI', region: '腹盆腔', conclusion: '腹膜后病灶，约 6.9 × 5.5 cm（原文摘录）', institution: '省肿瘤医院放射科', ord: 4 },
    ],
    questions: [
      { d: '2026-05-11', q: '现在吃的这个药，一般吃到什么时候评估一次？', asked: 1, answer: '门诊记录原文：按周期复查，评估时间以门诊安排为准', ord: 0 },
      { d: '2026-08-19', q: '手脚脱皮到什么程度要跟医生说？', asked: 0, answer: '', ord: 1 },
      { d: '2026-08-19', q: '下次评估是做 CT 还是 MRI？', asked: 0, answer: '', ord: 2 },
      { d: '2026-09-17', q: '腹膜后复查为什么不用每次都拍胸片？', asked: 0, answer: '', ord: 3 },
      { d: '2026-10-14', q: '如果漏服一次，要不要补服？', asked: 0, answer: '', ord: 4 },
    ],
    viewpoints: [
      { d: '2026-06-03', mood: '烦', text: '一天三顿药，吃到第几轮老是记混。', ord: 0 },
      { d: '2026-08-19', mood: '累', text: '手脚像被砂纸磨过，走路疼。', ord: 1 },
      { d: '2026-09-17', mood: '想弄清楚', text: '每次复查都写大小，我想知道这些数字放在一起是什么样。', ord: 2 },
    ],
    docs: [
      { id: 'd1', name: '首次手术病理报告', date: '2024-02-09', type: '报告', status: '已核对', ord: 0 },
      { id: 'd2', name: '腹盆腔增强 CT 报告', date: '2026-04-28', type: '影像', status: '已核对', ord: 1 },
      { id: 'd3', name: '复发灶穿刺病理报告', date: '2026-05-06', type: '报告', status: '待核对', ord: 2 },
      { id: 'd4', name: 'MDT 记录', date: '2026-05-11', type: '其他', status: '已核对', ord: 3 },
      { id: 'd5', name: '腹盆腔 CT 报告', date: '2026-08-20', type: '影像', status: '已核对', ord: 4 },
    ],
    candidates: [
      { id: 'c1', name: '复发灶亚型', value: '去分化脂肪肉瘤（病理原文）', source: '穿刺病理报告 · 诊断意见', status: 'accepted', ord: 0 },
      { id: 'c2', name: 'MDM2 扩增', value: 'MDM2/CEP12 比值 6.8（原文）', source: 'FISH 报告', status: 'needs_review', ord: 1 },
      { id: 'c3', name: '病灶大小', value: '7.0 × 5.6 cm', source: '2026-08-20 CT 报告 · 第 1 页', status: 'needs_review', ord: 2 },
    ],
    metrics: [
      {
        key: 'hgb', name: '血红蛋白', unit: 'g/L', cat: '血象', color: KEY_COLOR.hgb, dec: 0, kind: 'numeric',
        band_low: 115, band_high: 150, note: '不同医院参考区间不合并；本档案取省肿瘤医院化验单',
        points: [
          pt('2026-04-16', 105, '复发评估', 115, 150), pt('2026-05-19', 101, '一线第 1 周期前', 115, 150),
          pt('2026-06-30', 98, '第 3 周期前', 115, 150), pt('2026-08-18', 103, '第 5 周期前', 115, 150),
          pt('2026-10-14', 107, '复查', 115, 150),
        ],
      },
      {
        key: 'alt', name: 'ALT（谷丙转氨酶）', unit: 'U/L', cat: '生化', color: KEY_COLOR.alt, dec: 0, kind: 'numeric',
        band_low: 9, band_high: null, note: '该院化验单只印了参考下限 9 U/L，未印上限',
        points: [
          pt('2026-04-16', 24, '复发评估', 9, null), pt('2026-05-19', 29, '一线第 1 周期前', 9, null),
          pt('2026-07-21', 38, '改口服靶向', 9, null), pt('2026-08-18', 44, '第 5 周期前', 9, null),
          pt('2026-10-14', 41, '复查', 9, null),
        ],
      },
      {
        key: 'alb', name: '白蛋白', unit: 'g/L', cat: '生化', color: KEY_COLOR.alb, dec: 0, kind: 'numeric',
        band_low: 40, band_high: 55, note: '营养相关指标；本台只并列数值，不解读',
        points: [
          pt('2026-04-16', 36, '复发评估', 40, 55), pt('2026-06-30', 34, '第 3 周期前', 40, 55),
          pt('2026-10-14', 37, '复查', 40, 55),
        ],
      },
      {
        key: 'crp', name: 'C 反应蛋白', unit: 'mg/L', cat: '生化', color: KEY_COLOR.crp, dec: 1, kind: 'numeric',
        band_low: 0, band_high: 8, note: '只记录到 1 次；单点不连线',
        points: [pt('2026-09-18', 9.2, '门诊', 0, 8)],
      },
      {
        key: 'appetite_q', name: '进食情况（自述）', unit: '', cat: '日常', color: KEY_COLOR.appetite_q, dec: null, kind: 'qual',
        band_low: null, band_high: null, note: '患者自己的描述，照抄原话；分类序列只画节点，不连线',
        points: [
          qp('2026-06-03', '正常', '自述'), qp('2026-07-21', '比以前少', '自述'),
          qp('2026-08-18', '半碗', '自述'), qp('2026-09-18', '半碗，晚上加一次营养粉', '自述'),
          qp('2026-10-14', '比上月能吃', '自述'),
        ],
      },
      {
        key: 'wt', name: '体重（自测）', unit: 'kg', cat: '体征', color: '#6B4C8C', dec: 1, kind: 'numeric',
        band_low: null, band_high: null, note: '家里同一台秤；不同秤的读数不合并',
        points: [
          pt('2026-04-16', 61.2, '复发评估', null, null), pt('2026-07-21', 59.4, '改口服靶向', null, null),
          pt('2026-10-14', 60.1, '复查', null, null),
        ],
      },
    ],
    events: [
      { d: '2026-04-28', label: '复查 CT 见新增病灶' },
      { d: '2026-05-06', label: '复发灶穿刺' },
      { d: '2026-05-11', label: 'MDT：不可切除' },
      { d: '2026-05-19', label: '一线治疗开始' },
      { d: '2026-07-21', label: '改口服靶向' },
      { d: '2026-09-17', label: '复查 MRI' },
    ],
  };
}

/* ---------- 试验：本轮不内置登记条目 ----------
   research/STS-FACTCHECK-2026-10-25.md §F 只核到"数百至一千余项量级"与第三方镜像口径，
   没有一条可引用的登记号 + 标题 + 分期。编一个 NCT/CTR 号就是伪造，故 trials 表留空；
   原型在「临床研究 › 2026 线索」如实写"本档案没有登记摘录"，并把 NCCN 四条分子路径
   作为解释层内容单列（SARC-G 原文口径）。 */
const TRIAL_ROWS = [];

/* ---------- 组装 ---------- */
function assemble(profile) {
  const { meta, ...rest } = profile;
  return { ...meta, ...rest, activity: meta.activity, familyTalk: meta.family_talk };
}

const DATA = {
  profiles: { A: assemble(profileA()), B: assemble(profileB()) },
  trials: TRIAL_ROWS,
  window_label: '档案 A：2026-04-02 → 2026-10-06；档案 B：2026-04-16 → 2026-10-14（各约 6 个月）',
};

/** 演示档案的纯数据：digest 稳定、不含时间戳。开发版播种与两个产物都从这里取。 */
export function buildDemoProfiles() {
  return { profiles: DATA.profiles, trials: DATA.trials, meta: buildMeta() };
}

function buildMeta() {
  const metrics = Object.values(DATA.profiles).reduce((a, p) => a + p.metrics.length, 0);
  const points = Object.values(DATA.profiles).reduce((a, p) => a + p.metrics.reduce((b, m) => b + m.points.length, 0), 0);
  return [
    ['disclaimer', '全部患者数据为虚构模拟，仅供原型演示；不含真实患者信息'],
    ['source', 'demo/build-demo-data.mjs（唯一数据源）'],
    ['subjects', '2'],
    ['window_label', DATA.window_label],
    ['schema', 'schema/0001_initial.sql（冻结版，27 表）'],
    ['metrics_rows', String(metrics)],
    ['points_rows', String(points)],
    ['trials_rows', String(DATA.trials.length)],
    ['note_stability', '不写生成时间；连跑两次 md5 一致'],
  ];
}

/** 只有 `node demo/build-demo-data.mjs` 才落盘；被 import 时不写任何东西。 */
function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(resolve(entry)) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

/* ---------- 产 1：SQLite ---------- */
/* 建表直接执行冻结的 schema 文件，不在本文件里复制第二份 CREATE TABLE。 */
function createSchema(db) {
  db.exec(readFileSync(SCHEMA, 'utf8'));
}

/* 显式列名 INSERT：不写 INSERT INTO t VALUES (?,?,…)，列序变了不会静默错位。 */
function insert(db, table, columns, rows) {
  if (!rows.length) return;
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
  const stmt = db.prepare(sql);
  for (const row of rows) stmt.run(...row);
}

export function seedDatabase(db) {
  for (const [key, p] of Object.entries(DATA.profiles)) {
    const t = p.titles;
    insert(db, 'subjects', [
      'profile_key', 'name', 'sex', 'age', 'meta', 'headline', 'stage', 'mindset', 'dash_keys', 'path',
      'activity', 'family_talk', 'pathology_title', 'site_title', 'staging_title', 'grade_title',
      'molecular_title', 'diagnosis_title', 'surgery_title', 'margin_title', 'wound_title', 'lines_title',
      'rt_title', 'tox_title', 'function_title', 'tess_title', 'rhythm_title', 'imaging_title', 'question_title',
    ], [[
      key, p.name, p.sex, p.age, p.meta, p.headline, p.stage, p.mindset,
      JSON.stringify(p.dash_keys), JSON.stringify(p.path), p.activity, p.familyTalk,
      t.pathology, t.site, t.staging, t.grade, t.molecular, t.diagnosis, t.surgery, t.margin,
      t.wound, t.lines, t.rt, t.tox, t.function, t.tess, t.rhythm, t.imaging, t.question,
    ]]);

    insert(db, 'metrics', ['profile_key', 'key', 'name', 'unit', 'cat', 'color', 'dec', 'kind', 'band_low', 'band_high', 'note'],
      p.metrics.map((m) => [key, m.key, m.name, m.unit, m.cat, m.color, m.dec, m.kind, m.band_low, m.band_high, m.note]));

    const pointRows = [];
    for (const m of p.metrics) {
      m.points.forEach((row, i) => pointRows.push([
        key, m.key, row.d, typeof row.v === 'number' ? row.v : null,
        typeof row.v === 'number' ? null : row.v, row.src, row.ref_low, row.ref_high, i,
      ]));
    }
    insert(db, 'metric_points', ['profile_key', 'metric_key', 'd', 'v_num', 'v_text', 'src', 'ref_low', 'ref_high', 'ord'], pointRows);

    insert(db, 'events', ['profile_key', 'd', 'label'], p.events.map((e) => [key, e.d, e.label]));
    insert(db, 'rhythm', ['profile_key', 'item', 'freq', 'guideline', 'next', 'ord'],
      p.rhythm.map((r) => [key, r.item, r.freq, r.guideline, r.next, r.ord]));
    insert(db, 'cycles', ['profile_key', 'name', 'date', 'drugs', 'status', 'done', 'ord'],
      p.cycles.map((c) => [key, c.name, c.date, c.drugs, c.status, c.done, c.ord]));
    insert(db, 'lines_rows', ['profile_key', 'line_no', 'name', 'detail', 'start', 'end', 'status', 'src', 'ord'],
      p.lines.map((l) => [key, l.line_no, l.name, l.detail, l.start, l.end, l.status, l.src, l.ord]));
    insert(db, 'viewpoints', ['profile_key', 'd', 'mood', 'text', 'ord'],
      p.viewpoints.map((v) => [key, v.d, v.mood, v.text, v.ord]));
    insert(db, 'documents', ['profile_key', 'id', 'name', 'date', 'type', 'status', 'ord'],
      p.docs.map((d) => [key, d.id, d.name, d.date, d.type, d.status, d.ord]));
    insert(db, 'candidate_fields', ['profile_key', 'id', 'name', 'value', 'source', 'status', 'ord'],
      p.candidates.map((c) => [key, c.id, c.name, c.value, c.source, c.status, c.ord]));
    insert(db, 'question_rows', ['profile_key', 'd', 'q', 'asked', 'answer', 'ord'],
      p.questions.map((q) => [key, q.d, q.q, q.asked, q.answer, q.ord]));

    insert(db, 'pathology_rows', ['profile_key', 'd', 'subtype', 'institution', 'consult', 'note', 'ord'],
      p.pathology.map((r) => [key, r.d, r.subtype, r.institution, r.consult, r.note, r.ord]));
    insert(db, 'site_rows', ['profile_key', 'd', 'site', 'size_text', 'depth', 'src', 'ord'],
      p.site.map((r) => [key, r.d, r.site, r.size_text, r.depth, r.src, r.ord]));
    insert(db, 'staging_rows', ['profile_key', 'd', 'tnm', 'system', 'source', 'note', 'ord'],
      p.staging.map((r) => [key, r.d, r.tnm, r.system, r.source, r.note, r.ord]));
    insert(db, 'grade_rows', ['profile_key', 'd', 'grade', 'components', 'institution', 'note', 'ord'],
      p.grade.map((r) => [key, r.d, r.grade, r.components, r.institution, r.note, r.ord]));
    insert(db, 'molecular_rows', ['profile_key', 'd', 'item', 'result', 'institution', 'ord'],
      p.molecular.map((r) => [key, r.d, r.item, r.result, r.institution, r.ord]));
    insert(db, 'diagnosis_rows', ['profile_key', 'd', 'kind', 'detail', 'institution', 'ord'],
      p.diagnosis.map((r) => [key, r.d, r.kind, r.detail, r.institution, r.ord]));
    insert(db, 'surgery_rows', ['profile_key', 'd', 'kind', 'extent', 'recon', 'institution', 'note', 'ord'],
      p.surgery.map((r) => [key, r.d, r.kind, r.extent, r.recon, r.institution, r.note, r.ord]));
    insert(db, 'margin_rows', ['profile_key', 'd', 'margin_text', 'surgery_ref', 'src', 'ord'],
      p.margin.map((r) => [key, r.d, r.margin_text, r.surgery_ref, r.src, r.ord]));
    insert(db, 'wound_rows', ['profile_key', 'd', 'text', 'care', 'ord'],
      p.wound.map((r) => [key, r.d, r.text, r.care, r.ord]));
    insert(db, 'rt_rows', ['profile_key', 'start', 'end', 'site', 'timing', 'note', 'ord'],
      p.rt.map((r) => [key, r.start, r.end, r.site, r.timing, r.note, r.ord]));
    insert(db, 'symptom_rows', ['profile_key', 'd', 'symptom', 'ctcae_text', 'note', 'ord'],
      p.tox.map((r) => [key, r.d, r.symptom, r.ctcae_text, r.note, r.ord]));
    insert(db, 'function_rows', ['profile_key', 'd', 'action', 'limitation', 'ord'],
      p.function.map((r) => [key, r.d, r.action, r.limitation, r.ord]));
    insert(db, 'tess_rows', ['profile_key', 'd', 'limb', 'answers', 'ord'],
      p.tess.map((r) => [key, r.d, r.limb, JSON.stringify(r.answers), r.ord]));
    insert(db, 'imaging_rows', ['profile_key', 'd', 'method', 'region', 'conclusion', 'institution', 'ord'],
      p.imaging.map((r) => [key, r.d, r.method, r.region, r.conclusion, r.institution, r.ord]));
  }
  insert(db, 'trials', ['nct_id', 'title', 'phase', 'status', 'sponsor', 'url'],
    DATA.trials.map((t) => [t.id, t.title, t.phase, t.status, t.sponsor, t.url]));
  insert(db, 'demo_meta', ['k', 'v'], buildMeta());
}

function writeSqlite() {
  const file = join(ROOT, 'demo/demo-data.sqlite');
  for (const extra of ['', '-wal', '-shm']) {
    if (existsSync(file + extra)) rmSync(file + extra);
  }
  const db = new DatabaseSync(file);
  createSchema(db);
  seedDatabase(db);
  db.close();
}

/* ---------- 产 2：原型数据层 ---------- */
function writePrototypeJs() {
  /* 经典 <script> 不能含 export（file:// 下 ES module 被 CORS 拦），
     所以这份产物只挂 window.DEMO；Node 侧的唯一出口是 buildDemoProfiles()。 */
  const payload = { profiles: DATA.profiles, trials: DATA.trials, window_label: DATA.window_label };
  /* 包 IIFE：经典 script 共用全局词法作用域，顶层 var DEMO 会和 app.js 里的
     const DEMO 撞 "Identifier has already been declared"，整页白屏。 */
  const js = '/* 由 demo/build-demo-data.mjs 生成；勿手改，改数据请改生成器后重新运行。 */\n'
    + '(function () {\n'
    + '  var DEMO = ' + JSON.stringify(payload) + ';\n'
    + '  window.DEMO = DEMO;\n'
    + '  if (typeof globalThis !== "undefined") globalThis.DEMO = DEMO;\n'
    + '})();\n';
  writeFileSync(join(P2, 'demo-data.js'), js);
}

/* ---------- 直接运行才落盘 ---------- */
if (isDirectRun()) {
  writeSqlite();
  writePrototypeJs();
  const metrics = Object.values(DATA.profiles).reduce((a, p) => a + p.metrics.length, 0);
  const points = Object.values(DATA.profiles).reduce((a, p) => a + p.metrics.reduce((b, m) => b + m.points.length, 0), 0);
  console.log(`demo-data.sqlite + demo-data.js 生成完毕：2 档案 / ${metrics} 项指标 / ${points} 个数据点 / ${DATA.trials.length} 条试验登记`);
}

/* 家族出口别名：演示数据只有这一份定义。 */
export function finalize() {
  return buildDemoProfiles();
}
