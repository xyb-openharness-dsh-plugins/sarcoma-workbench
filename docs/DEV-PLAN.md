# 小肉宝 SarcoPal · 开发计划（DEV-PLAN）v0.1

- 项目：`sarcoma-workbench` · 版本：0.1.0（M0 骨架）
- 状态口径：**✅ 实测 / 🔧 骨架 / ⏳ 未实现**；"装上了能打开"≠可用。
- 本文件是进度**唯一权威**；汇报与 README 数字打架时以本文件为准并当场修正。

## 1. 里程碑

| 里程碑 | 交付物 | 验收判据 | 状态 | 证据 |
| --- | --- | --- | --- | --- |
| **M0 骨架** | 认领（issue #32 `claimed`）+ private 仓 + init（168 文件）+ cordis `config.root` + 文档 9 件 | `npm run check` 的 `staticPass=true`；9 件文档原创作 | 🔧 骨架（文档齐，check 绿） | `check` 输出见 §3 |
| **M1 调研SPEC** | 三路调研（医学 10 主题 / NMPA / 家族对比）+ DIFF-MATRIX 实测 + SPEC + USER-RESEARCH + INTERACTION-DESIGN 全量 | 一级重名率实测 ≤70%；K1–K6 落文档 | 🔧 进行中（家族对比已实测；医学/监管调研中） | `DIFF-MATRIX.md` §1 |
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
