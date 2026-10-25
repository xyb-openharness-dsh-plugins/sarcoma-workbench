# 小肉宝 SarcoPal · 开发计划（DEV-PLAN）v0.1

- 项目：`sarcoma-workbench` · 版本：0.1.0（M0 骨架）
- 状态口径：**✅ 实测 / 🔧 骨架 / ⏳ 未实现**；"装上了能打开"≠可用。
- 本文件是进度**唯一权威**；汇报与 README 数字打架时以本文件为准并当场修正。

## 1. 里程碑

| 里程碑 | 交付物 | 验收判据 | 状态 | 证据 |
| --- | --- | --- | --- | --- |
| **M0 骨架** | 认领（issue #32 `claimed`）+ private 仓 + init（168 文件）+ cordis `config.root` + 文档 9 件 | `npm run check` 的 `staticPass=true`；9 件文档原创 | ✅ 实测（check 绿 + 已 push e584ea1） | `check` 输出见 §3 |
| **M1 调研SPEC** | 三路调研（医学 10 主题 / NMPA / 家族对比）+ DIFF-MATRIX 实测 + SPEC + USER-RESEARCH + INTERACTION-DESIGN 全量 | 一级重名率实测 ≤70%；K1–K6 落文档 | 🔧 三路调研完成、文档全量，**G1 待签认** | `DIFF-MATRIX.md` §1 · `research/medical/`（510 行 36 条）· `research/regulatory/NMPA-VERIFICATION.md` |
| **M2 原型** | demo 构建器 + prototypes/v0.2（11 一级 / 35 二级）+ 折叠卡 + 指标卡 3D + 一图秀 + 试验匹配 + HVT X1–X4 + 独立评审 + 第二轮用户反馈 | 页签走查；独立评审 P0 = 0；27/16/35 号规范逐条实测 | 🔧 P0 = 0；第二轮三条反馈已实现并实测（35/35 页签、276px 3D、一图秀 2 线、匹配 T1–T9）；待 G2 复签 | `docs/PROTOTYPE-INDEPENDENT-REVIEW.md` · `docs/P0-FIX-TRAIL.md` · `docs/SPEC.md` §14 |
| **M3 数据模型** | schema/0001 + freeze-contract(sha256) + 判读列断言 | 内存全建；无 diagnosis/risk_level 类列 | ⏳ | — |
| **M4 临床库** | fetch-sarcoma-trials 脚本（四通道）+ research 四件套 | manifest=jsonl=sqlite；FAILED 如实 | ⏳ | — |
| **M5 开发版** | 七步移植 + MinerU 六部件 + apiBase 契约 + test 五套 | 版本同源；单测全过；tgz 占位=0 | ⏳ | — |
| **M6 装机** | 升版 → pack → 四要素对照 → 装 profile → bundles → 新建会话 → 真机走查 + 截图 | 四要素+五要素；V2/V3 用户确认 | ⏳ | — |
| **M7 发布** | tag + Release（tgz+sha256）+ CHANGELOG | release 链接 | ⏳ | — |
| **M8 回填** | BACKLOG 状态行 PR（31 号） | PR 合并 | ⏳ | — |
| **M9 回流** | 项目追补 + starter LESSONS + 编号文档 + 检查器 + CHANGELOG | ≥1 条"下一轮直接受益" | ⏳ | — |

## 2. 任务分解（M0 已完成项）

| # | 任务 | 文件边界 | 验收 | 状态 |
| --- | --- | --- | --- | --- |
| T0.1 | 认领 issue + `/claim` + `claimed` 标签 | `.github`（远端） | issue #32 有 claimed | ✅ |
| T0.2 | 建 private 仓并绑 remote | `sarcoma-workbench` | `gh repo view` 可见 | ✅ |
| T0.3 | `dsh-wb-cli init` | 168 文件 | 目录结构齐全 | ✅ |
| T0.4 | 接线：`cordis.patch.yml` 补 `config.root` + Config 声明并读取 | `cordis.patch.yml`、`dsh/index.js` | `check` 无 root 警告；health 返回 storage | ✅ |
| T0.5 | 文档 9 件 | `docs/*.md` | 存在且为原创本癌种版 | ✅ |
| T0.6 | 基线 check | — | `staticPass=true` | ✅ |
| T1.1 | 医学约束调研（10 主题 36 条事实） | `research/medical/MEDICAL-CONSTRAINTS.md` | 每条带来源+核验状态 | ✅ |
| T1.2 | 监管核实（NMPA/目录/通道） | `research/regulatory/NMPA-VERIFICATION.md` | 实测 412 并如实记"未核实" | ✅ |
| T1.3 | 家族对比（cervical/breast 一级实测） | `docs/DIFF-MATRIX.md` | 一致率实测 8.3% / 12.5% | ✅ |
| T1.4 | 医学更正回灌文档（AJCC8 取消深浅、亚型数口径、患者版标注） | SPEC/CLINICAL-DATA/DEV-REQ/SCENARIOS | 7 处替换，无残留旧口径 | ✅ |
| T1.5 | K1–K6 红线落 SPEC §13 | `docs/SPEC.md` | 六条可断言 | ✅ |

## 3. 实测记录（M0）

```text
$ npm run check
{
  "package": "@xyb-community/sarcoma-workbench",
  "version": "0.1.0",
  "staticPass": true,
  "errors": [],
  "warnings": ["Peer ranges, API signatures, credentials/assets, actual tgz contents and Desktop UI require separate verification"]
}
宿主注册契约自查（lib/client.js + lib/layout.js）
  customFrame=true · 符合宿主 register() 校验
```

## 4. 风险与对策

| 风险 | 影响 | 对策 |
| --- | --- | --- |
| 0 访谈导致场景错位 | 做了一堆没人用的页面 | 全文 HYPOTHESIS 标注；G1 显式声明；下一轮补 E0 |
| 亚型/分级术语写错 | 医疗信息错误 | 只照录医生原文；术语只做中性解释；🩺 评审待补 |
| 影像"趋势"诱惑 | 伪造数据 | 硬约束 H6：只做基线锚点与原文对照 |
| 治疗单链化 | 结构错 | 硬约束 H7：局部/全身双轨 |
| 试验通道不可用 | 空列表误导 | H14：显式"未查过/未取回" |
| 装机静默空库 | 用户数据丢失观感 | config.root 已接线 + check 断言；M6 真机复核 |

## 5. 未验证清单（诚实账本）

- 宿主真机加载：⏳（未装机）
- 真机业务闭环：⏳
- 医学内容核对：⏳（无 🩺）
- 用户访谈：⏳（0 人）
- 市场投稿：不适用（private）

## 6. 版本簿记

| 版本 | 日期 | 内容 |
| --- | --- | --- |
| 0.1.0 | 2026-10-25 | M0 骨架：init + 接线 + 文档 9 件 + check 绿 |

## 7. G1 签认包（决策点清单）

> G1 = 需求与调研签认。以下每一条都需要签认人明确答复"认可/改"，**未签认不进入 M2 原型**。

| # | 决策点 | 本轮取值 | 备选 | 影响面 |
| --- | --- | --- | --- | --- |
| G1-1 | 服务主体 | 患者本人 + 家属代记（双主体） | 仅患者 / 仅家属 | 数据层 recorder 字段、隐私区 |
| G1-2 | 病程覆盖 | 全病程（确诊→治疗→随访→复发） | 仅术前术后 / 仅晚期 | 11 一级的分工 |
| G1-3 | 一级/二级规模 | 11 一级 / 32 二级 | 合并「功能与康复」+「心理与家庭」→ 10/28 | 导航与走查 |
| G1-4 | 是否做分期/分级计算 | **不做**（只照录） | 做 FNCLCC 算分器 | K4 红线 |
| G1-5 | 影像是否做数值趋势 | **不做**（基线锚点 + 原文对照） | 做大小折线 | H6 |
| G1-6 | 营养是否独立成线 | **不独立**（并入功能与指标） | 独立一级 | 26 号十线完整性 |
| G1-7 | MinerU 接入 | 接，可降级 | 不接 | M5 |
| G1-8 | 试验库通道 | 四在线通道 + 如实"未配置" | 只 CT.gov | M4 |
| G1-9 | 品牌占位名 | 小肉宝 SarcoPal | 小间宝/小瘤宝 | 全局文案 |
| G1-10 | 医学文案风险 | **0 访谈 + 0 临床核对**，全部标注 | 等评审再开工 | 全项目 |

## 8. M1 调研结论摘要（供签认时阅读）

1. **医学**：36 条事实，三个会改产品的更正——① AJCC 第 8 版**取消 T 深浅 a/b**（所以"深浅"只能作影像/手术描述）；② WHO 不公布亚型总数，常用"约 70 种"是综述口径；③ NCCN 只拿到**患者版**，随访间隔必须标"患者版转述"。
2. **监管**：NMPA/卫健委全站 412，**中国获批状态整列未核实**；CDE 与药物登记平台有 JS 挑战 → 中国获批在界面只能是"未核实"，不是"没有"。
3. **家族对比**：一级名称一致率 vs cervical **8.3%**、vs breast **12.5%**（阈值 ≤70%），差异化成立。
4. **用户研究**：**0 访谈**，全部场景为 HYPOTHESIS；H1–H6 已列成可证伪假设，下一轮访谈直接可用。

## 9. 闸口签认记录

| 闸口 | 签认人 | 日期 | 原话/结论 | 范围 |
| --- | --- | --- | --- | --- |
| **G1** 需求与调研 | samqin123（用户） | 2026-10-25 | 「签认 G1，继续 M2 原型（推荐）」 | 10 条决策点全按现值；0 访谈与 0 临床核对已显形 |

## 10. M2 实测记录（2026-10-25）

工具：`scripts/verify-prototype.py`（Playwright 无头，跑 `prototypes/v0.2/index.html` 本体）。原始 JSON 见 `docs/validation-prototype-v0.2.json`。

| 判据 | 实测 |
| --- | --- |
| 一级导航 = 11，名称逐字一致 | 11/11，`names_match=true` |
| 二级页签 = 35，全部点开 | 35/35，visited=36 |
| 空页 | 0 |
| 0 未捕获异常 / 0 console error / 0 失败请求 | 0 / 0 / 0 |
| 折叠卡：卡数 / 默认展开 / 五块顺序 | 4 张（两档案）/ 0 / 4 张全对 |
| `@media print` 规则 | 存在（含 break-inside:avoid） |
| 禁词命中（K1–K4，20 词） | 0 |
| 垃圾值（undefined/NaN/[object Object]） | 0 |
| 三档宽度溢出（1440/1080/860 × 33 页） | 0 / 0 / 0 |
| 页脚贴底 | 三档 true |
| `[hidden]` 生效 | true |
| `npm test` | 14/14 pass（含 8 条 demo 纪律断言） |

### 三出口过滤（K5）实测 — 本项是自审抓出来的真缺陷

首轮实现里 `exportable()` **定义了但没人调用**，且 `in_use` 只打在档案层、每条记录上都没有 → `demoOff` 开关永远命中不到任何记录（空开关）。已修：

1. `demo/build-demo-data.mjs` 的 `build()` 把 `in_use:1` 与 `visibility:'shared'` 打到 `pathologies/imaging/local/systemic/metrics/functionLog/visits/trials/viewpoint/fertility/documents/candidates` 的**每一条**记录上。
2. `app.js` 新增三个真实出口函数：`buildExportSnapshot(p, opts)` / `buildAgentContext(p)` / `buildVisitPrepSheet(p)`，全部经 `canLeave()` 单点判定；AI 与摘要出口**不提供"勾选放开私密"**。
3. 导出页计数改为实时计算（`约 N / M 条`），两个勾选框绑定 `onchange`。

修后实测（Playwright 直调出口函数）：

| 档案 | 私密条数 | 快照默认带私密 | 勾选后可带 | AI 上下文带私密 | 一页纸带私密 | 排除演示前/后条数 |
| --- | --- | --- | --- | --- | --- | --- |
| 陈女士 | 2 | 0 | 3 | 0 | 0 | 17 / 0 |
| 王先生 | 1 | 0 | 2 | 0 | 0 | 17 / 0 |

> 「勾选后可带 3 > 私密 2」是因为私密条目里含 1 条 shared 记录（可分享的那条），不是漏过滤。

### 已知未做的 M2 项（不写"通过"）

| 项 | 状态 |
| --- | --- |
| 全量 16 条路径逐字 diff（当前抽验 6 条） | ⏳ 待 M5 的 `check-ip3-wording.mjs` |
| 键盘 Tab 序全量走查 | ⏳ |
| 大字模式（17px）三档宽度复跑 | ⏳ |
| 真机 DSH Desktop 内嵌渲染 | ⏳ 待 M6 |

## 11. M2 独立评审与修复轮（2026-10-25）

**评审**：独立评审员（非开发者）写 `docs/PROTOTYPE-INDEPENDENT-REVIEW.md`（521 行）。
结论 **不通过：P0 = 6 / P1 = 19 / P2 = 9**。K1、K3、K4 通过（K4 经三轮穷举"刻意去找但确实找不到"），K2、K5、K6 不通过。

**为什么这轮评审有价值**：评审抓出的 6 条 P0 里，有 3 条是自评阶段"显示通过"的项——
- 自评"三出口共用过滤函数 + 单测"→ 实际测试文件里自己重写了一份 `visible()` 在测自己（P1-18）
- 自评"禁词 0 命中"→ 禁词表只扫演示数据不扫模板文案，漏掉"应接受康复评估"整类指令词（P0-4）
- 自评"无空页"→ 判据是"有文字"，115 字的零业务内容页也算通过（P1-11）

**修复**：见 `docs/P0-FIX-TRAIL.md`。6 条 P0 全部修复并逐条复验；13 条 P1 + 4 条 P2 已修；6 条如实标注不修/未修及理由（P1-12 药物获批字段是真缺口，凭空写"核于 X"就是伪造核实记录，留到 M4）。

**根因级修复**：三出口过滤抽到 `prototypes/v0.2/exits.js`，`app.js` 与 `test/exits.test.mjs` 用 vm 加载**同一份源码**；新增两条元断言：app.js 不得重新定义过滤函数、禁词扫描必须覆盖模板文案。禁词扫描做过**变异测试**（塞回"应接受康复评估"→ 测试变红 # fail 1；还原 → 25 pass），证明它不是又一个自欺的测试。

**复验**：

| 项 | 结果 |
| --- | --- |
| P0 复验 | 6/6 通过（每条独立复现路径，见 P0-FIX-TRAIL §1–§6） |
| `npm test` | 25 pass / 0 fail（原 14 pass，其中 1 条是自欺，已删并换成 9 条跑产品源码的） |
| `verify-prototype.py` | ok=true；0 空页 / 0 禁词 / 0 溢出 / 0 异常 |
| `npm run check` | staticPass: true, errors: [] |

## 12. M2 第二轮：用户三条反馈（2026-10-25 晚）

用户看原型后提三条（原话见 `docs/SPEC.md` §14）：
① 指标卡要有"有序、分系列、动态 3D 反转"；② 一图秀要加指标选择窗口；③ 临床试验应按"建档 → 匹配 → 库 → 结论边界"做，带匹配指数与格式。

**这三条推翻了 ADR-3 的一半**：原 ADR-3 写"STS 无贯穿指标，故不做一图秀"。用户要求做，决定作废——**理由修正为**：STS 没有单一贯穿指标是对的，但正因如此"多指标同轴、各自归一化、明写不可比"才更有用。ADR-3 里"影像不做数值趋势"的部分保留（那涉及判读）。

| 项 | 落点 | 规范 | 实测 |
| --- | --- | --- | --- |
| 指标卡 | `metrics/0` 全部指标卡 + 按轨道分系列（血象 / 肝肾与心肌 / 功能测量） | 27 号 | 外框 276px、翻面后卡高仍 276、内层 `matrix3d(...)`、翻一张其余 `aria-pressed=false`、6 个面 / 3 张卡 |
| 一图秀 | `metrics/3` 多指标 + 指标选择窗口（≤4、独立滚动、各显最新值） | 16 号 | 2 条线 6 个点、两条线各自占满（186/186）、aria 逐字含"不可比"、选择数 2 ≤ 4 |
| 试验匹配 | `trials/0` 建档（三态）/ `trials/1` 匹配（指数+维度+缺口）/ `trials/2` 库（通道终态）/ `trials/3` 关注 | 35 号 | 建档 6 项含 2 项"未测"+1 项"本癌种无此项"；匹配 3 张卡指数 100/87/50；引号外无入组结论词；`test/match.test.mjs` 10 条 T1–T9 |

**结构变化**：二级 32 → **35**（指标线拆 4：全部指标卡/血象/肝肾与心肌/一图秀；试验线拆 4：建档/匹配/库/关注）。26 号下限 ≥20 仍满足，单条一级内二级最多 4。

**本轮审计抓到的三个问题（并行实现里带进来的）**：
1. 匹配页 notice 里 `N`/`M` 是**字面占位符**没有插值 → 改为按实际维度数插值。
2. 建档页数据只有"已知"一种态，页面却宣称"三态可分"（35 号 T1 不成立）→ 补 `NTRK（未测）`、`MDM2（本癌种无此项）`，统计行加"无此项"计数。
3. `test/match.test.mjs` 的 T5b 拿 demo 数据的分子状态当断言前提，改一次演示数据就误报 → 改用**合成档案**，并补一条"填上分子后分数必须变"的反向断言。
