# 疾病概要 · 软组织肉瘤

> 本项目实例文件。规范：starter `docs/36-DISEASE-PRIMER.md`。四段固定、顺序不变，缺段不合格。

- 项目 / 品牌：小韧宝 SarcPal
- 病种：软组织肉瘤（Soft Tissue Sarcoma，STS）
- 最后更新：2026-10-27
- 数据文件：`prototypes/v0.2/primer-data.js`（`window.DISEASE_PRIMER`）
- README 对应段：`## 疾病概要`
- 实现：`prototypes/v0.2/primer.js` + `primer.css`（来自 starter `assets/patterns/`，逻辑未改）；顶栏「?」在 `index.html` 手写（L40）
- 装机层：`lib/client.js` 内联同一份四段数据 + 四段整页浮窗（返回 / 关闭 / Esc、history、焦点回收、缺链接红标）+ §2.6 状态卡
- 探针：`node scripts/probe-disease-primer.mjs --port 8208 --url http://127.0.0.1:8208/prototypes/v0.2/index.html` → 10/10
- 链接闸门：`node scripts/check-primer-links.mjs`（22 项结构 18 通过 / 0 失败；`--http` 23 通过 / 0 失败；`--self-test` 10/10）

## 0 原件状态（本项目的前提）

NCCN / AJCC / WHO / CSCO 四份文件的**指南原件均未取得**。可点链接只有官方入口页与二次来源页，
逐条用真浏览器验活（`verify-links.mjs` 只接受 OK）：
NCCN 患者版/临床版详情页、AJCC 官方分期体系页、IARC 出版页、ClinicalTrials.gov 检索入口。
CSCO 与 NMPA 登记平台无脚本可验活的公开页，如实写 `nolink` + note。
所有页码写「页码待核」，不假装看到原件。这一条与 `docs/DEV-REQUIREMENTS-2026-10-25.md` 的 G1 出处层决策一致。

## 1 定义（`definition`）

软组织肉瘤不是一种病，而是一组起源于间叶组织（脂肪、肌肉、纤维、血管、神经鞘等）的恶性肿瘤的统称。
分型看病理，不看部位。

- WHO 第 5 版（2020）分类口径：脂肪细胞性、成纤维细胞性与肌纤维母细胞性、血管性与周细胞性、平滑肌、骨骼肌、胃肠道间质、神经鞘、未确定分化等大类。
- 常见首发部位：肢体（大腿最常见）、躯干与腹膜后、头颈。**部位不推导分期**——头颈、胸腹腔内脏、眼眶在 AJCC 8 未定义分期组。
- FNCLCC 分级（G）不是与 TNM 并列的第二套分期：G 是 AJCC 分期组的输入变量，两者不互推。

**来源**：WHO · Soft Tissue and Bone Tumours, 5th ed.（2020）· 未取得原件，据二次来源 · 页码待核 ｜ AJCC · Cancer Staging Manual, 8th ed.（2017）· 未取得原件，据二次来源 · 页码待核

## 2 医学资料规范和指南情况（`evidence`）

| 机构 | 文件 | 版本 / 年份 | 原件 | 本台的用途 |
|---|---|---|---|---|
| NCCN | NCCN Guidelines for Patients · Soft Tissue Sarcoma | 2025（据临床版 V1.2025 改编，66 页） | [官方入口页 · 患者版（免费）](https://www.nccn.org/patientresources/patient-resources/guidelines-for-patients/guidelines-for-patients-details?patientGuidelineId=37)（PDF 直链判 THIN，未存档） | 分期检查、治疗路径、随访节奏的患者版并列引用 |
| NCCN | NCCN Guidelines · Soft Tissue Sarcoma（临床版） | V5.2026（官网现行；本台正文引用仍为 V3.2026） | [官方入口页 · 临床版（需注册）](https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1464) | 分期检查、治疗路径、随访节奏的并列引用（机构 + 版本 + 表号） |
| AJCC | Cancer Staging Manual, 8th ed.（STS 章节） | 2017 | [官方入口页 · 分期体系（手册付费）](https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/cancer-staging-systems/) | TNM 与 G 如何进入分期组；哪些部位未定义分期组 |
| WHO | Soft Tissue and Bone Tumours, 5th ed. | 2020 | [官方入口页 · IARC 出版页（全书付费）](https://publications.iarc.fr/Book-And-Report-Series/Who-Classification-Of-Tumours/Soft-Tissue-And-Bone-Tumours-2020) | 病理亚型命名的唯一口径 |
| CSCO | 骨与软组织肿瘤诊疗指南 | 2025 版 | 未取得原件 · 无官方免费全文（nolink，官网未提供公开 PDF） | 国内可及药物与本土实践差异；本版**暂不作引用依据** |

- 一台一表，不合并；未取得原件的必须标出来。
- 国内分期与 AJCC 在本病种**不做换算**：两套并存时两行并列，各自标出处。
- `kind: 'hub'` 只作官方入口页（entry），不得写「已取得」；`nolink` 必带 note。

**来源**：见上表逐行。

## 3 目前治疗全景概要（`landscape`）

按期别 / 线序分组，只列指南列举过的手段类别，不排序、不比优劣、不含剂量与疗程。

### 3.1 局限期（可手术切除时）
- 手术：保肢切除是主流目标，截肢在无法保肢时才被讨论；切缘按病理原文记 R0/R1/R2，本台不改写不解读。
- 放疗：术前、术后、术中近距离照射各有适用情形，取舍属医生判断。
- 化疗：部分高危情形下被列为可讨论选项，指南无「一刀切」答案。

### 3.2 晚期 / 转移后
- 全身治疗：蒽环类为基础长期存在；后续线序可含其他化疗药、靶向药、免疫治疗（国内获批状态与医保**需单独核实**）。
- 局部处理：寡转移灶的放疗或手术在特定情形下被列出。
- 临床研究：被列为正式选项，不是最后手段。

### 3.3 贯穿全程
- 功能与康复：只记你自己的动作与感受（TESS 患者自评，**不给总分、不画趋势、不与人比**）。
- 复查节奏：只把「约在哪天、做了没有」整理成时间线。

**固定出口（原话照抄）**：

> 以上是文献与指南里列出的手段，按病期与线序排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。

**来源**：NCCN · NCCN Guidelines · Soft Tissue Sarcoma（V5.2026）· 官方入口页（临床版需注册）· 页码待核

## 4 发展趋势（`trend`）

只写已发生的事实，每条带日期或版本号。

1. 2013：WHO 第 4 版《软组织与骨肿瘤分类》出版。
2. 2020：WHO 第 5 版出版并取代第 4 版；软组织与骨肿瘤合并为一卷，部分亚型重命名或重新归类。
3. 2025-05-02：NCCN STS 临床指南 V1.2025 生效；患者版《Soft Tissue Sarcoma, 2025》据此版改编（66 页）。
4. 截至 2026-10-27：NCCN 官网 STS 指南条目显示版本为 V5.2026（临床版全文需注册）；本台正文引用仍锁 V3.2026，换版需逐条复核（见 docs/DIFF-MATRIX.md）。
5. 截至 2026-10：中国药物临床试验登记与信息公示平台可检索到 STS 相关登记 60 条（I、II 期占多数）；另有 150 条按病种排除（骨肉瘤、尤文、软骨肉瘤、GIST、硬纤维瘤、脊索瘤、卡波西等）。检索式与日期记在 `research/sarcoma/manifest.json`。

**来源**：WHO（2020）· 未取得原件，据二次来源 · 页码待核 ｜ NCCN V5.2026 · 官方入口页（临床版需注册）· 页码待核 ｜ NMPA 药品审评中心 · 药物临床试验登记与信息公示平台（检索日 2026-10）· 平台检索页无法脚本验活，60 条为项目自采快照 ｜ ClinicalTrials.gov · STS 检索入口（检索日 2026-10-27）· OK

## 5 落地清单

- [x] `prototypes/v0.2/primer.css` / `primer.js`（starter 最新模式件原样复制，含 §2.5 链接渲染与 §4.3 排版）
- [x] `prototypes/v0.2/primer-data.js`（四段数据 + 逐条验证过的链接）
- [x] `index.html` 三处引用 + 顶栏「?」手写（L40）
- [x] 看板状态卡四件（§2.6；锚点 = 当前治疗线序开始日，L42 排在业务首卡之上）
- [x] README 的 `## 疾病概要` 四段正文（链接与数据同源）
- [x] 装机层 `lib/client.js`：内联四段 + 浮窗 + 状态卡（`node scripts/check-client-primer.mjs` 21/21）
- [x] `node scripts/probe-disease-primer.mjs --port 8208 --url …/prototypes/v0.2/index.html` → 10/10 PASS
- [x] `node scripts/check-primer-links.mjs` 静态 0 失败；`--http` 0 失败；`--self-test` 10/10

## 6 验收（P1–P9 + E0）

| 编号 | 判据 | 结果 |
|---|---|---|
| P1 | 顶栏有可点「?」，aria-label 说明四段 | ✅ 手写按钮（L40），mount() 补 aria |
| P2 | 整页面板，四段顺序 定义 → 指南 → 治疗全景 → 趋势 | ✅ |
| P3 | 面板宽高 ≥ 视口 90% | ✅ 1249×829 / 1280×860 |
| P4 | 打开压一条 history，`history.back()` 收起 | ✅ |
| P5 | 「返回」「关闭」两个独立入口 | ✅ |
| P6 | 关闭后焦点回触发按钮、滚动位置不变 | ✅ 260→260 |
| P7 | Esc 只退一层 | ✅ |
| P8 | 四段齐全、每段有来源、趋势段无禁止词 | ✅ |
| P9 | 正文/列表/来源行同左基线、右边界极差 ≤2px；表格可横向滚动 | ✅ 1440/900/390 三档 |
| E0 | 无 JS 报错、无 console error | ✅ |

## 7 本项目教训

- **「原件未取得」这条要在趋势段也写**：WHO 第 5 版的分类条目是从公开摘要与二次来源拼的，
  不是原文。写在表格里容易，写进趋势段容易忘——忘了就是假装看到过。
- 治疗全景段最初想写「安罗替尼已在国内获批用于软组织肉瘤」。**撤掉了**：批件号与日期手上没有，
  只拿到二手描述。改写成「具体药物是否国内获批、是否在医保内，需要单独核实」——与家族
  「获批状态未核实」的既有口径对齐。
- 趋势段第 4 条把「60 条」和「150 条排除」一起写，是为了避免读者把 60 当成「全球在研」。
  **数字要连带口径一起给**，只给数字等于误导。
