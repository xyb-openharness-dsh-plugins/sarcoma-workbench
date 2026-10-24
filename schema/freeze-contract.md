# schema 冻结合同 · 软组织肉瘤工作台

- **冻结对象**：`schema/0001_initial.sql`
- **冻结日期**：2026-10-25
- **sha256**：`939cd7a02f5967543d26ce4af60358b8108e7cd130ce6207aa9111013b2d3779`
- **表数**：27（`CREATE INDEX` 1 条：`idx_points`）

## 冻结规则

1. 本文件内容**只增不改**。改结构一律新增 `0002_<主题>.sql`（走 ALTER 追加），不修改 0001。
2. 发布前发现漏列（例如某节缺 `*_title`）也走 `0002` 追加，不改 0001、不重算本 sha256。
3. `npm run check:schema` 校验本 sha256；对不上即视为破坏冻结，必须说明原因并新增迁移。
4. 迁移只增不改：已有表的列只能加，不能删、不能改类型、不能改语义。

## 内容边界（这张表里**不许**出现的东西）

| 边界 | 本 schema 怎么落地 |
| --- | --- |
| 契约① 看法恒不为结论 | `viewpoints` **没有** `is_conclusion` 列；用户记的是"我的看法"，不是结论 |
| 契约② 缺数据不生成派生值 | `staging_rows.tnm`、`grade_rows.grade` 允许 NULL；**不设**"由 T/N/M/G 算出的分期组"列；`site_rows` 与 `staging_rows` 分开存，不许互推 |
| ×ULN 上限不能借 | `metric_points.ref_high` 是**这张化验单自带**的上限（可空）；`metrics.band_high` 只是通用显示带，任何 ×ULN 计算只认 `ref_high` |
| 契约③ 更正只新增版本 | 所有明细表都有 `ord`；更正 = 新增一行，旧行不动。不设 `is_deleted` / `superseded_by` 这类覆盖语义列 |
| 契约④ 事实四层不合并 | `documents`（原件）/ `candidate_fields`（候选）/ `*_rows`（记录）/ `metric_points`（指标）四层各是一张表，不合并 |
| 医学判断不落库 | **没有**这些列：分期组、预后评分、复发判定、切缘评价、方案优劣、功能评分总分。`margin_rows` 只存原文措辞；`tess_rows` 只存逐题原始作答，**不存总分** |
| 保留字 | 不使用 `using` 等 SQLite 保留字作列名 |

## 肉瘤专属表（11 张，会随 12 个一级页走）

`pathology_rows`（亚型与病理）· `site_rows`（部位与大小）· `staging_rows`（分期，**可空**）·
`grade_rows`（FNCLCC 分级，与 staging 分开）· `molecular_rows`（分子检测）·
`diagnosis_rows`（确诊路径时间轴，非计划切除语境）· `surgery_rows`（手术）·
`margin_rows`（切缘，只抄原文）· `wound_rows`（伤口与恢复，患者自述）· `rt_rows`（放疗）·
`function_rows`（日常动作自述）· `tess_rows`（TESS 逐题作答，**不给总分**）· `imaging_rows`（影像时间轴）。

> 说明：`function_rows` 与 `tess_rows` 是为「功能与康复」页单列的。
> **MSTS 不落库也不上界面**——它是 clinician-reported outcome，患者自填等于伪造临床评估
> （依据 `research/STS-FACTCHECK-2026-10-25.md` §E19 / §H-10）。
