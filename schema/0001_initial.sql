/* 软组织肉瘤工作台 · 初始 schema（冻结版）
   冻结日期：2026-10-25｜冻结后改结构只能新增 0002_*.sql，不改本文件。
   四契约：① 看法恒不为结论（viewpoints 无 is_conclusion 列）
           ② 缺数据不生成派生值（NULL ≠ 0；分期/分级可空，不补、不互推）
           ③ 更正只新增版本（新增行，不 UPDATE 旧行；ord 只增不重用）
           ④ 事实四层不合并（documents / candidate_fields / 记录表 / metric_points 各是一层）
   医学口径来源：research/STS-FACTCHECK-2026-10-25.md
   （NCCN STS V3.2026 / AJCC TNM 第 8 版 / WHO 第 5 版 2020）
*/

/* ---------- 档案级 ---------- */
CREATE TABLE subjects (
  profile_key   TEXT PRIMARY KEY,
  name          TEXT,
  sex           TEXT,
  age           INTEGER,
  meta          TEXT,
  headline      TEXT,
  stage         TEXT,
  mindset       TEXT,
  dash_keys     TEXT,      -- JSON 数组
  path          TEXT,      -- JSON 数组
  activity      TEXT,
  family_talk   TEXT,
  /* 每节的标题列：UI 每一节 {title, rows} 都必须有对应列，缺一列前端就少一个标题 */
  pathology_title TEXT,
  site_title      TEXT,
  staging_title   TEXT,
  grade_title     TEXT,
  molecular_title TEXT,
  diagnosis_title TEXT,
  surgery_title   TEXT,
  margin_title    TEXT,
  wound_title     TEXT,
  lines_title     TEXT,
  rt_title        TEXT,
  tox_title       TEXT,
  function_title  TEXT,
  tess_title      TEXT,
  rhythm_title    TEXT,
  imaging_title   TEXT,
  question_title  TEXT
);

/* ---------- 指标 3 张 ---------- */
CREATE TABLE metrics (
  profile_key TEXT,
  key         TEXT,
  name        TEXT,
  unit        TEXT,
  cat         TEXT,
  color       TEXT,
  dec         INTEGER,    -- 分类指标为 NULL
  kind        TEXT,       -- numeric | qual | grade
  band_low    REAL,       -- 通用参考下限（可空；×ULN 严禁借它当上限）
  band_high   REAL,       -- 通用参考上限（可空）
  note        TEXT,
  PRIMARY KEY (profile_key, key)
);

CREATE TABLE metric_points (
  profile_key TEXT,
  metric_key  TEXT,
  d           TEXT,
  v_num       REAL,       -- 数值型；定性为 NULL
  v_text      TEXT,       -- 定性型（照抄报告原文）；数值型为 NULL
  src         TEXT,
  ref_low     REAL,       -- 这张化验单自带的参考下限（可空）
  ref_high    REAL,       -- 这张化验单自带的参考上限（可空）。×ULN 只认这一列
  ord         INTEGER,
  PRIMARY KEY (profile_key, metric_key, d, ord)
);
CREATE INDEX idx_points ON metric_points (profile_key, metric_key);

CREATE TABLE events (          -- 一图秀事件竖线：手术/活检/病理回报/方案开始/影像
  profile_key TEXT,
  d           TEXT,
  label       TEXT
);

/* ---------- 通用 8 张 ---------- */
CREATE TABLE rhythm (          -- 随访节奏（并列指南原文，不排计划）
  profile_key TEXT,
  item        TEXT,
  freq        TEXT,            -- 指南原文间隔
  guideline   TEXT,            -- 机构 + 版本 + 表号（页码待核时写"页码待核"）
  next        TEXT,            -- 参考节点（不是预约）
  ord         INTEGER
);

CREATE TABLE cycles (          -- 化疗/用药周期
  profile_key TEXT,
  name        TEXT,
  date        TEXT,
  drugs       TEXT,
  status      TEXT,
  done        INTEGER,
  ord         INTEGER
);

CREATE TABLE lines_rows (      -- 治疗线序
  profile_key TEXT,
  line_no     INTEGER,
  name        TEXT,
  detail      TEXT,
  start       TEXT,
  end         TEXT,
  status      TEXT,
  src         TEXT,
  ord         INTEGER
);

CREATE TABLE viewpoints (      -- 契约①：看法恒不为结论，故无 is_conclusion 列
  profile_key TEXT,
  d           TEXT,
  mood        TEXT,
  text        TEXT,
  ord         INTEGER
);

CREATE TABLE trials (          -- 临床研究登记摘录（状态未核实）
  nct_id  TEXT PRIMARY KEY,
  title   TEXT,
  phase   TEXT,
  status  TEXT,
  sponsor TEXT,
  url     TEXT
);

CREATE TABLE demo_meta (
  k TEXT PRIMARY KEY,
  v TEXT
);

CREATE TABLE documents (       -- 事实层第 1 层：原件
  profile_key TEXT,
  id          TEXT,
  name        TEXT,
  date        TEXT,
  type        TEXT,
  status      TEXT,
  ord         INTEGER,
  PRIMARY KEY (profile_key, id)
);

CREATE TABLE candidate_fields (-- 事实层第 2 层：候选（AI/解析产出，待用户核对）
  profile_key TEXT,
  id          TEXT,
  name        TEXT,
  value       TEXT,
  source      TEXT,
  status      TEXT,
  ord         INTEGER,
  PRIMARY KEY (profile_key, id)
);

CREATE TABLE question_rows (   -- 问题清单（产品只整理，不生成答案）
  profile_key TEXT,
  d           TEXT,
  q           TEXT,
  asked       INTEGER,
  answer      TEXT,
  ord         INTEGER
);

/* ---------- 肉瘤专属 ---------- */
CREATE TABLE pathology_rows (  -- 我的肿瘤 · 亚型与病理（WHO 第 5 版 2020 命名，照抄原文）
  profile_key  TEXT,
  d            TEXT,
  subtype      TEXT,           -- 病理报告原文亚型名，不翻译成通俗名
  institution  TEXT,
  consult      TEXT,           -- 是否/在哪会诊（事实，不是"该不该会诊"）
  note         TEXT,
  ord          INTEGER
);

CREATE TABLE site_rows (       -- 我的肿瘤 · 部位与大小
  profile_key TEXT,
  d           TEXT,
  site        TEXT,            -- 四肢/躯干/头颈/腹膜后/内脏/眼眶，照抄报告
  size_text   TEXT,            -- 大小原文（含单位）
  depth       TEXT,            -- 深度描述原文（非分期字段，AJCC 8 已删除深度作为分期项）
  src         TEXT,
  ord         INTEGER
);

CREATE TABLE staging_rows (    -- 我的肿瘤 · 分期（允许空：部分部位 AJCC 8 未定义分期组）
  profile_key TEXT,
  d           TEXT,
  tnm         TEXT,            -- 原文 TNM；未回报就 NULL
  system      TEXT,            -- AJCC 8 / 其他
  source      TEXT,
  note        TEXT,            -- 可写"该部位 AJCC 8 未定义分期组"
  ord         INTEGER
);

CREATE TABLE grade_rows (      -- 我的肿瘤 · 分级（FNCLCC；与 staging 分开存，不互推）
  profile_key TEXT,
  d           TEXT,
  grade       TEXT,            -- 病理原文 G1/G2/G3；未回报就 NULL
  components  TEXT,            -- 三成分原文（分化/核分裂/坏死），可空
  institution TEXT,
  note        TEXT,
  ord         INTEGER
);

CREATE TABLE molecular_rows (  -- 我的肿瘤 · 分子检测（只记结果原文，不做"该查什么"的建议）
  profile_key TEXT,
  d           TEXT,
  item        TEXT,            -- 检测项（如 SS18、MDM2、NTRK…）
  result      TEXT,            -- 报告原文
  institution TEXT,
  ord         INTEGER
);

CREATE TABLE diagnosis_rows (  -- 确诊路径 · 时间轴（非计划切除语境）
  profile_key TEXT,
  d           TEXT,
  kind        TEXT,            -- 发现肿块/首次就诊/影像/活检/切除/病理回报/会诊/转诊
  detail      TEXT,
  institution TEXT,
  ord         INTEGER
);

CREATE TABLE surgery_rows (    -- 手术与伤口 · 手术档案
  profile_key  TEXT,
  d            TEXT,
  kind         TEXT,           -- 术式名称（照抄）
  extent       TEXT,           -- 切除范围描述原文
  recon        TEXT,           -- 重建方式（可空）
  institution  TEXT,
  note         TEXT,
  ord          INTEGER
);

CREATE TABLE margin_rows (     -- 手术与伤口 · 切缘（肉瘤核心字段；只抄原文，不评价）
  profile_key TEXT,
  d           TEXT,
  margin_text TEXT,            -- R0/R1/R2 或病理原文措辞
  surgery_ref TEXT,            -- 关联哪一次手术（日期字符串）
  src         TEXT,
  ord         INTEGER
);

CREATE TABLE wound_rows (      -- 手术与伤口 · 伤口与恢复（患者自述，不是并发症诊断）
  profile_key TEXT,
  d           TEXT,
  text        TEXT,            -- 患者自己的话
  care        TEXT,            -- 在哪处理的（可空）
  ord         INTEGER
);

CREATE TABLE rt_rows (         -- 治疗与线序 · 放疗
  profile_key TEXT,
  start       TEXT,
  end         TEXT,
  site        TEXT,
  timing      TEXT,            -- 术前 / 术后（抄病历原文）
  note        TEXT,
  ord         INTEGER
);

CREATE TABLE symptom_rows (    -- 副作用与不适（CTCAE 语境；ctcae_text 照抄，不叫 grade）
  profile_key TEXT,
  d           TEXT,
  symptom     TEXT,
  ctcae_text  TEXT,
  note        TEXT,
  ord         INTEGER
);

CREATE TABLE function_rows (   -- 功能与康复 · 日常动作（患者自述的受限，不是评分）
  profile_key TEXT,
  d           TEXT,
  action      TEXT,            -- 蹲/上下楼/提物/走多远…
  limitation  TEXT,            -- 患者自己的话
  ord         INTEGER
);

CREATE TABLE tess_rows (       -- 功能与康复 · TESS 自评（只存原始作答，不给总分不解读）
  profile_key TEXT,
  d           TEXT,
  limb        TEXT,            -- 上肢 / 下肢
  answers     TEXT,            -- JSON 数组，逐题原始作答（0–5）；不给总分
  ord         INTEGER
);

CREATE TABLE imaging_rows (    -- 复查与随访 / 影像与报告 · 影像时间轴
  profile_key TEXT,
  d           TEXT,
  method      TEXT,            -- CT / MRI / 超声 / PET-CT
  region      TEXT,            -- 检查部位（胸部/腹部/原发部位…）
  conclusion  TEXT,            -- 报告结论原文（不判读）
  institution TEXT,
  ord         INTEGER
);
