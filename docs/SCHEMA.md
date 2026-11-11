# 数据模型（SCHEMA）· 软组织肉瘤 v0.1

> 物理模型：`schema/0001_initial.sql`（**已冻结**，sha256 见 `schema/freeze-contract.md`）。
> 改结构只能新增 `0002_*.sql`。读模型与演示数据必须同形（parity 是 M6 唯一验收标准）。

## 一、27 张表

### 档案级（1）

| 表 | 用途 |
| --- | --- |
| `subjects` | 一个演示档案一行：姓名/性别/年龄/阶段/心境/看板指标键/路径 + 每节标题列 19 个（`*_title`） |

### 指标 3 张

| 表 | 关键点 |
| --- | --- |
| `metrics` | `dec IS NULL` 且 `kind ∈ {qual,grade}` 即分类指标；`band_low/band_high` 只是**通用显示带** |
| `metric_points` | **`ref_low` / `ref_high` 是这张化验单自带的参考范围**——×ULN 只认 `ref_high`；缺了返回 `needsUln`，绝不借 `metrics.band_high` |
| `events` | 一图秀事件竖线（手术/活检/病理回报/方案开始/影像） |

### 通用 10 张

`rhythm`（随访节奏原文）· `cycles`（化疗周期）· `lines_rows`（治疗线序）·
`viewpoints`（**无 `is_conclusion` 列**）· `trials`（登记摘录，状态未核实）· `demo_meta` ·
`documents`（原件）· `candidate_fields`（AI/解析候选）· `question_rows`（问题清单）

### 肉瘤专属 14 张

| 表 | 对应页签 | 契约要点 |
| --- | --- | --- |
| `pathology_rows` | 我的肿瘤·亚型与病理 | `subtype` 照抄病理原文，不翻译；`consult` 记"在哪会诊"（事实） |
| `site_rows` | 我的肿瘤·部位与大小 | 部位（四肢/躯干/头颈/腹膜后/内脏/眼眶）与大小原文；**与 staging 分开存** |
| `staging_rows` | 我的肿瘤·分期与分级 | `tnm` **可空**；`note` 可写"该部位 AJCC 8 未定义分期组" |
| `grade_rows` | 我的肿瘤·分期与分级 | FNCLCC，与 `staging_rows` **分表不互推**；`components` 存三成分原文 |
| `molecular_rows` | 我的肿瘤·分子检测 | 只记"做了什么、结果原文"，不做"该查什么"的建议 |
| `diagnosis_rows` | 确诊路径·时间轴 | `kind` ∈ 发现肿块/首次就诊/影像/活检/切除/病理回报/会诊/转诊 |
| `surgery_rows` | 手术与伤口·手术档案 | 术式与范围照抄 |
| `margin_rows` | 手术与伤口·切缘 | **只存 R0/R1/R2 或病理原文措辞**，不存任何评价 |
| `wound_rows` | 手术与伤口·伤口与恢复 | 患者自己的话，不是并发症诊断 |
| `rt_rows` | 治疗与线序·放疗 | `timing` 抄病历原文（术前/术后） |
| `symptom_rows` | 副作用与不适 | `ctcae_text` 照抄，**不叫 grade**、不自动分级 |
| `function_rows` | 功能与康复·日常动作 | 患者自述的受限动作，不是评分 |
| `tess_rows` | 功能与康复·TESS 自评 | `answers` 存逐题原始作答 JSON，**不存总分、不画趋势** |
| `imaging_rows` | 复查与随访 / 影像与报告 | `conclusion` 存报告原文，不判读 |

## 二、四契约在本 schema 上的落点

| 契约 | 落点 |
| --- | --- |
| ① 看法恒不为结论 | `viewpoints` 无 `is_conclusion` 列 |
| ② 缺数据不生成派生值 | `staging_rows.tnm` / `grade_rows.grade` 可空；**无**"分期组""预后评分""复发判定"列；NULL ≠ 0 |
| ③ 更正只新增版本 | 明细表都有 `ord`；更正 = 新增行，旧行不动 |
| ④ 事实四层不合并 | 原件 / 候选 / 记录 / 指标四层分表 |

## 三、肉瘤专属的"不许有"清单（改 schema 时逐条对照）

- 不许有「由 T/N/M/G 计算出的分期组」列 —— 分期组判定是病理/临床的事（AJCC 8 且按部位分表）。
- 不许有 MSTS 相关字段 —— 医生填写的 ClinRO。
- 不许有 `tess_total` 或任何分数聚合列 —— 分数解读属医学判断。
- 不许有切缘评价列（如 `margin_adequate`）—— 只有 `margin_text` 原文。
- 不许有"是否进展 / 是否复发"列 —— 那是 RECIST 判读。
- 不许有"建议转院 / 建议二次手术"类标记 —— 只记机构名与是否 MDT。

## 四、复合主键与排序

- `metric_points` / `documents` / `candidate_fields` 是复合主键 → 裸 `SELECT` 必须 `ORDER BY rowid`。
- 手写倒序数组只 `ORDER BY ord`，**不叠 `DESC`**（叠了会把倒序再倒回来）。
