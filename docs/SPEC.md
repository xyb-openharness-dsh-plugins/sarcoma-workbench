# 小肉宝 SarcoPal · 软组织肉瘤患者工作台 SPEC v0.1

- 项目：`sarcoma-workbench`（private）· 包名 `@xyb-community/sarcoma-workbench`
- 状态：**草案，G1 待签认**（签认人/日期：待补）
- 配套：`DEV-REQUIREMENTS-2026-10-25.md`（强约束）· `DIFF-MATRIX.md` · `SCENARIOS.md` · `PATIENT-FLOW.md` · `USER-RESEARCH.md` · `INTERACTION-DESIGN.md` · `CLINICAL-DATA.md` · `DEV-PLAN.md`
- 不得把本草案当成已确认业务；G1 签认前不进入 HTML 原型之后的工作。

## 1. 问题、用户与最小闭环

### 1.1 问题

软组织肉瘤（STS）患者在信息上有三个**结构性的**困难，而不是"资料不够多"：

1. **亚型碎片化**：STS 的亚型高度碎片化（WHO 2020 第 5 版分 11 类、另单列未分化小圆细胞肉瘤；文献常引「约 70 种恶性亚型」，WHO 本身不设总数，见 `CLINICAL-DATA.md` §2）。公开中文信息几乎只到"软组织肉瘤"这一层，患者拿到"滑膜肉瘤""去分化脂肪肉瘤""上皮样肉瘤"这些词之后，**搜不到自己能用的那一层**。
2. **部位决定路径**：同一个亚型长在肢体、腹膜后、头颈，手术方式、放疗安排、复查影像、复发模式都不同（AJCC 第 8 版的分期组按部位分列，见 `CLINICAL-DATA.md` §3）。网上把"肉瘤"写成一种病，患者会把不同部位的方案混算。
3. **治疗是并行的**：手术（局部）、放疗（局部）、化疗/靶向（全身）、临床试验常常**同期进行**，不是"一线失败换二线"的单链。患者的真实记录是"我 3 月手术、4 月开始放疗、同时进了组"，而现有工具都按单链设计。

### 1.2 用户

| 用户 | 占比判断 | 主要任务 | 工作台给他的 |
| --- | --- | --- | --- |
| 术后随访期患者（肢体/躯干） | 多数 | 记复查、看影像报告、准备复诊 | 影像基线 + 复查日历 + 问题清单 |
| 腹膜后肉瘤患者 | 少数但最复杂 | 记多次手术、腹部影像、营养与肾功能 | 部位分轨 + 多次手术档案 |
| 晚期/复发换线患者 | 少数 | 记多条治疗线、试验、副作用 | 并行治疗轨道 + 换线原因原文 |
| 家属代记者 | 常见 | 替患者记、陪诊 | 代记标记 + 一页时间线 |
| 年轻患者（生育议题） | 少数 | 治疗前生育保存、亲密关系 | 私密生育线 |

### 1.3 最小闭环

```text
输入：一份病理报告（照片/PDF/手输）+ 一次影像报告 + 一次治疗事件
动作：AI 候选或手工录入 → 逐项核对 → 确认入事实层 → 挂到部位/治疗线
输出：一页时间线（亚型 + 部位 + 局部/全身轨道 + 基线影像 + 下次复查）
成功：患者能在 3 分钟内说清"我是什么亚型、做过什么、哪次影像是对照基线"
失败恢复：AI 说错 → 拒收零副作用 → 转手工；没资料 → 空态给"先记这一条"
```

## 2. 方案与 ADR

### ADR-1：为什么按「部位」而不是按「亚型」做一级导航

- 候选 A：按亚型分（滑膜/脂肪/平滑肌/上皮样…）。否决：约 70 个亚型无法做成导航；且患者往往**先知道部位、后知道亚型**。
- 候选 B：按治疗阶段分（术前/术后/复发）。否决：STS 的局部与全身治疗并行，阶段划分会把同期事件撕成两半。
- **选择 C：部位作为记录的属性（`site`），治疗按「局部/全身」两条轨道分页**。理由：部位决定复查影像与手术方式，是**记录维度**不是导航维度；局部/全身是**任务维度**，患者问"我手术之后还要放疗吗"和"我化疗到第几周期了"是两个不同问题。

### ADR-2：为什么不做自动分期

FNCLCC 分级需要分化/核分裂/坏死三项，AJCC 分期需要部位特异的分组表；两者都是**病理科与临床医生的判读结果**。工作台自动算 = 把医生任务伪装成患者功能（红线）。**选择：只存医生原文 + 出处，界面并列展示"报告写的"与"我记的"。**

### ADR-3：为什么影像不做趋势线

RECIST 需要目标病灶测量与阅片者判断，患者手里的报告只有文字描述。把"较前增大"画成折线 = 伪造数据。**选择：影像只做「基线锚点 + 原文并列对照 + 时间间距」，不做数值趋势。**

### ADR-4：宿主能力表（本机核验）

| 能力 | 官方合同 | 本机核验 | 替代路径 |
| --- | --- | --- | --- |
| 服务端注册 | `webServer.register` + `connection.requestRejection` | ✅ M0 静态契约检查通过（`check-host-contract`） | 无 |
| 客户端外壳 | `desktopWorkbenches.register` + `dsh-desktop-workbenches` inject | 🔧 模板已带，M5 接真链路 | 无 |
| 数据根 | `config.root` + `dshHomePath` | ✅ patch 已注入，服务端读取并建目录 | 缺省时空串=未接线（会显形，不静默） |
| 原生 AI 面板 | 右侧可拖/可隐藏/可按会话复用 | ⏳ 未接（M5） | 未接入时按钮显“未接入”，不自制聊天窗 |

## 3. 功能范围

### 3.1 一级 / 二级（11 / 32）

| # | 一级（id） | 回答的患者原话 | 二级 |
| --- | --- | --- | --- |
| 1 | 看板（dashboard） | "我现在整体什么情况？" | —（首页） |
| 2 | 我的亚型（subtype） | "我这个到底叫什么病？" | 病理原文 / 分级与部位 / 分子与免疫组化 / 会诊与二次意见 |
| 3 | 影像与基线（imaging） | "这次复查和哪次比？" | 基线锚点 / 复查记录 / 报告原文对照 |
| 4 | 局部治疗（local） | "手术和放疗做到哪一步了？" | 手术记录 / 放疗疗程 / 切缘与并发症 |
| 5 | 全身治疗（systemic） | "我化疗到第几周期？换过什么药？" | 治疗线总览 / 周期与用药 / 换线记录 |
| 6 | 功能与康复（function） | "腿抬不起来、肿、伤口不好，正常吗？" | 肢体功能 / 淋巴水肿 / 伤口与皮肤 |
| 7 | 指标与报告（metrics） | "白细胞低了、肝功高了，意味着什么？" | 血象 / 肝肾与心肌 / 趋势对照 |
| 8 | 复诊与随访（followup） | "下次什么时候、带什么？" | 复查日历 / 待办与问题 / 就诊准备 |
| 9 | 试验与线索（trials） | "还有没有我能参加的研究？" | 检索入口 / 关注与入组 |
| 10 | 心理与家庭（mind） | "我很怕，家里怎么办？还能要孩子吗？" | 当下感受 / 私密记录 / 支持资源 / 生育与亲密 |
| 11 | 资料与导出（records） | "能不能整理好拿去给医生看？" | 资料库 / 草稿核对 / 导出快照 / 隐私与分享 |

合计 **11 一级 / 32 二级**（26 号下限：≥8 / ≥20）。与 cervical（12/…）、breast（8/27）的**一级名称一致率见 `DIFF-MATRIX.md`（实测）**。

### 3.2 明确不做的页面

- 「我的分期」独立一级：否决。分期是医生写的，且 STS 分期组依赖部位，独立成页会诱导患者自己算。改为「我的亚型 · 分级与部位」二级页。
- 「营养支持」独立一级：否决（与乳腺/肝不同）。STS 患者的营养问题集中在腹膜后术后与化疗期，并入「功能与康复」与「指标与报告」，不单列——**理由写在这里，不是漏了**。
- 「一图秀」独立一级：否决。STS 没有一条贯穿全病程的数值指标（不像 CML 的 BCR-ABL），强行做图会变成假趋势。影像与血象各自有页。

## 4. 数据与 API

### 4.1 实体（详见 `docs/SCHEMA.md` 与 `schema/0001_initial.sql`）

| 实体 | 关键字段 | 说明 |
| --- | --- | --- |
| `profile` | id, display_name, role(patient/caregiver), birth_year | 双主体档案 |
| `pathology` | subtype_text, grade_text, site, depth_text, margin_text, ihc_json, molecular_json, source_doc_id, report_date | 亚型卡；**无 diagnosis 列** |
| `imaging` | site, modality, baseline(0/1), compared_to_text, radiologist_wording, report_date | 基线锚点；**无 recist/response 列** |
| `treatment_local` | kind(surgery/rt), date_start, date_end, detail_text, margin_text, status | 手术/放疗 |
| `treatment_systemic` | line_no, regimen_text, cycle_no, date_start, date_end, reason_text, status | 化疗/靶向 |
| `function_log` | domain(function/lymphedema/wound), measure_text, value_num, unit, date | 功能与康复 |
| `metric` | name, value_num, unit, ref_range_text, date, source_doc_id | 血象/肝肾/心肌 |
| `visit` | date, purpose, questions_json, summary_text | 复诊 |
| `trial` | registry_id, title, phase_text, site_filter, status_text, source, fetched_at | 试验 |
| `document` | file_name, kind, parse_status, source | 资料库 |
| `candidate` | entity_type, payload_json, status(pending/accepted/rejected), source | AI/解析候选 |
| `viewpoint` | text, visibility(shared/private), recorder(patient/caregiver) | 心理/私密 |

### 4.2 硬性数据纪律（与 04 号一致）

- 全部表 `ORDER BY rowid` 读；不依赖时间排序的隐式稳定。
- 空值显式 `NULL`，不用空串冒充"没有"。
- `in_use` 标记演示数据，导出默认排除。
- 分节标题 `*_title` 存库，不前端拼。
- 分类字段（site/kind/domain）**不进趋势图**。
- 演示数据唯一源：`demo/build-demo-data.mjs` → public/demo-data.js + sqlite 同一份。

### 4.3 外部信息合同

| 信息 | 来源 | 获取时点 | 有效期/刷新 | 未取到怎么办 |
| --- | --- | --- | --- | --- |
| 试验登记 | ChiCTR / ClinicalTrials.gov / CTV / 药物临床试验登记平台（四通道 MCP stdio） | 采集时写 `fetched_at` | 每次打开提示"采集于 X，可能已变" | 显示"未查过/未取回"，不显示空列表 |
| 药物获批状态 | NMPA 公开信息（`research/regulatory/`） | 2026-10-25 核一次 | 界面上标"核于 2026-10-25" | 标"未核实" |
| 指南口径 | NCCN STS 1.2025 / CSCO 目录级 | 引用名称与版本 | 版本号显形 | 标"未取得原文" |

**获取成功 ≠ 已核实**：`source` 与 `verified_at` 分两列，缺一列界面显示"未核实"。

## 5. 设置与配置页面

引用 `docs/SETTINGS-DESIGN.md`。本项目设置页必须含：资料目录位置与迁移、导出范围（含"排除私密""排除演示数据"）、AI 与云端解析的逐次同意开关、试验库刷新时间显示、数据备份/恢复、清空演示数据。功能 ID 见 `FEATURE-INVENTORY.csv`（M1 产出）。

## 6. UI 与原型一致性

- 原型：`prototypes/v0.2/index.html`（M2 产出），开发版 `public/` 与之逐字符对齐（`ui-parity`）。
- 语义 token 用家族 `assets/tokens.*`；字号 12.5–15px；页脚贴底。
- 图表：SVG 根 `class="chart"`，`smoothPath` 用 Fritsch–Carlson；单点不连线。
- 动效尊重 `prefers-reduced-motion`；键盘可达。
- 偏差逐条记 `PARITY.csv`（含依据与替代）。

## 7. 资源与 Agent

- 无外部 assets 依赖（自绘 SVG 图标）。
- DSH 原生 AI 对话：顶栏入口 + 右侧面板，默认 35%、25%–45% 可拖、可隐藏重开、按会话复用；`xxx:agent-draft` 一键把提示词 + 当前病情上下文放进输入框，**不自动发送**（IP10）。M5 接真链路前，按钮显"未接入"。

## 8. 实施与验证

顺序：接入基线 → 数据/API → 共享组件 → 完整 Tab → 跨页回归 → 包/实机。每步见 `DEV-PLAN.md` 的任务表与验收证据。已有代码先比较再补齐。

## 9. 交付与发布

- 包版本：`package.json` / `VERSION` / `dsh` health / README / CHANGELOG / tag 同源（`check-version`）。
- 装机：profile 内 `corepack pnpm` 装 tgz → bundles 登记 → 重启 → **先新建会话**。
- 发布：tag + GitHub Release（附 tgz + sha256）+ CHANGELOG 发版段。
- 市场投稿：**不适用**（private 仓，未授权）。

## 10. 互动设计与确认关口

- 交互路径文档：`docs/INTERACTION-DESIGN.md`（G1 同批签认，IP1）。
- 状态：场景清单 / 页面树 / 路径表 **已写，未签认**。
- 未签认范围不记为开发完成。

## 11. HTML 原型先行（业务开发前关口）

- 路径：`prototypes/v0.2/index.html` + `app.js` + `style.css` + `demo-data.js`
- hash / 浏览器 / 尺寸 / 关键交互证据：M2 填
- 用户确认：待确认（G2）；未确认不进入正式业务开发。

## 12. 数据模型演进关口

- 领域事实（病理/影像/治疗）由患者录入与更正链维护；工作流实例（复诊）与偏好（面板宽度）分开。
- SCHEMA 变化矩阵：新增亚型字段、新增部位取值、治疗轨道增删、旧库迁移，均在 `docs/SCHEMA.md` 记录兼容策略。
- 迁移/回退证据：M3 的 `freeze-contract`（sha256）+ 迁移脚本单测。

## 13. 患者视角红线 K1–K6（G1 必签）

> 这六条是本项目的"不可让步"，任何实现与之冲突以本节为准。每条都在独立评审（M2 之后）逐条过。

| # | 红线 | 具体禁止 | 怎么验（可断言） |
| --- | --- | --- | --- |
| **K1** | 不判读 | 不判影像良恶性/进展、不判病理亚型、不判分期、不判 FNCLCC 分级、不做 RECIST 结论 | schema 无 `diagnosis`/`risk_level`/`recist`/`response`/`progression` 列；全仓禁词 grep = 0 |
| **K2** | 不推荐、不指令 | 无"建议手术/放疗/化疗/停药/可以考虑"；无"该复查了/已逾期/立即就医" | 禁词表断言 + 文案走查 |
| **K3** | 不预后 | 无生存率、无复发概率、无风险高低分级、无"可能已经转移" | 数字与禁词双查 |
| **K4** | 医生任务不冒充患者需求 | 不做 FNCLCC 算分器、不做 AJCC 分期器、不做切缘判读器；这些若出现=评审一票否决 | 功能清单评审 + 独立评审报告逐条勾 |
| **K5** | 数据主权与代记 | 本机优先；private 三出口（导出/AI/摘要）代码级过滤；代记标记不可丢；演示数据 `in_use` 隔离 | 三出口共用过滤函数单测；代记字段非空断言；导出默认排除 `in_use` |
| **K6** | 未核实必须显形 | 药物/指南/试验信息必须带来源与核实时点；"未核实"不得渲染成"没有/未获批"；通道失败不得显示空列表 | 界面字段断言 + fetch 失败用例 |

> 与 26 号「医生任务冒充患者需要是独立评审一票否决项」对应：K4 是本项目的落点。
