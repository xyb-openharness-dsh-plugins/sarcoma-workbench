# 小肉宝 SarcoPal · 开发计划（DEV-PLAN）v0.1

- 项目：`sarcoma-workbench` · 版本：0.1.0（M0 骨架）
- 状态口径：**✅ 实测 / 🔧 骨架 / ⏳ 未实现**；"装上了能打开"≠可用。
- 本文件是进度**唯一权威**；汇报与 README 数字打架时以本文件为准并当场修正。

## 1. 里程碑

| 里程碑 | 交付物 | 验收判据 | 状态 | 证据 |
| --- | --- | --- | --- | --- |
| **M0 骨架** | 认领（issue #32 `claimed`）+ private 仓 + init（168 文件）+ cordis `config.root` + 文档 9 件 | `npm run check` 的 `staticPass=true`；9 件文档原创 | ✅ 实测（check 绿 + 已 push e584ea1） | `check` 输出见 §3 |
| **M1 调研SPEC** | 三路调研（医学 10 主题 / NMPA / 家族对比）+ DIFF-MATRIX 实测 + SPEC + USER-RESEARCH + INTERACTION-DESIGN 全量 | 一级重名率实测 ≤70%；K1–K6 落文档 | 🔧 三路调研完成、文档全量，**G1 待签认** | `DIFF-MATRIX.md` §1 · `research/medical/`（510 行 36 条）· `research/regulatory/NMPA-VERIFICATION.md` |
| **M2 原型** | demo 构建器（双档案 × 6 月唯一源）+ prototypes/v0.2 四件套 + 折叠卡 + HVT X1–X4 + 独立评审 + README ≥4 截图 | 页签走查数字；computed fill=none；窄宽 0 问题；禁词 0 | ⏳ | — |
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
