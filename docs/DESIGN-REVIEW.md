# 设计独立审查记录

状态：**已执行（第一轮，2026-10-25）**。自审与独立模型审查分开，不以模板存在宣称 review 完成。

## 一、元信息

| 项 | 内容 |
| --- | --- |
| 产品 / 仓库 | 小韧宝 SarcPal · 软组织肉瘤患者工作台（`sarcoma-workbench`） |
| 评审对象 | `055a8f4ee55be917a4571fcb71b8cbd1bc52852f`（短哈希 `055a8f4`，分支 `main`） |
| 工作树 | `git status --porcelain` 输出 0 行（评审期间未产生改动） |
| 评审人 | 独立子代理（不共享主线上下文；未参与该仓库构建） |
| 模型标识 / 推理档位 | `custom-local:deepseek-4.1-flash` / 档位**未获取**（运行环境未暴露档位参数，按实测记录，不推断） |
| 日期 | 2026-10-25 |
| 运行环境 | macOS arm64 · Node v22.22.2 · Google Chrome 145.0.7632.75（puppeteer-core 经 `createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')` 加载） |
| 输入范围（设计文档） | `docs/SPEC.md`、`docs/SCENARIOS.md`、`docs/INTERACTION-DESIGN.md`、`docs/CLINICAL-DATA-2026.md`、`docs/DIFF-MATRIX.md`、`docs/DEV-PLAN.md`、`docs/HVT-X-WALKTHROUGH.md`、`docs/FULL-PAGE-VIEW.md`、`docs/DISEASE-PRIMER.md`、`docs/DEV-REQUIREMENTS-2026-10-25.md`、`docs/ACCEPTANCE.md`、`docs/PROTOTYPE-REVIEW.md`、`docs/PARITY.csv`、`docs/26-CANCER-FEATURE-LINES.md`、`README.md`、`AGENTS.md`、`research/STS-FACTCHECK-2026-10-25.md` |
| 输入范围（原型） | `prototypes/v0.2/`：`index.html`(495)、`app.js`(1585)、`style.css`、`demo-data.js`、`primer.js`、`primer-data.js`；数据源 `demo/build-demo-data.mjs` |
| 输入范围（脚本） | `scripts/probe-page-view.mjs`、`probe-prototype.mjs`、`probe-interaction.mjs`、`probe-disease-primer.mjs`、`check-conformance.mjs` |
| 输入范围（提示词） | `prompts/ZERO-TO-DEV.md` §1.7、`prompts/NEW-CANCER-WORKBENCH.md` §七 |
| 开工前缺件 | `docs/CORE-MODULES.md` **不存在**；`docs/36-DISEASE-PRIMER.md` **不存在**（实际文件为 `docs/DISEASE-PRIMER.md`）。两处按「缺件」记录，未按缺件内容核对 |
| 评审边界 | M4 收口刚完成、G1 未签认。M6（`lib/version.js`、`lib/layout.js`、customFrame 宿主接线、四条检查链、`test/*.test.mjs`）未授权，缺失记「未做（M6 范围）」；指南三层 G1/G2/G3 均未做（CSCO 2025 原件未取得），记「未做 + 原因」，不判造假 |
| 本轮只改 | 本文件 |

## 二、复跑核对（与构建方自报比对）

全部命令加 `NODE_OPTIONS=` 前缀在本机跑通，无报错。

| # | 命令 | 期望 / 构建方自报 | 实测末行 | 一致？ |
| --- | --- | --- | --- | --- |
| 1 | `node scripts/probe-page-view.mjs` | 13/13（`docs/DEV-PLAN.md:15`、`docs/FULL-PAGE-VIEW.md:96`） | `PASS  13/13` | 一致 |
| 2 | `node scripts/probe-prototype.mjs` | 28/28（`docs/DEV-PLAN.md:15`） | `PASS  28/28` | 一致 |
| 3 | `node scripts/probe-interaction.mjs` | 94/94（`docs/DEV-PLAN.md:15`、`docs/HVT-X-WALKTHROUGH.md:32`） | `PASS  94/94` | 一致 |
| 4 | `node scripts/probe-disease-primer.mjs` | 9/9（`docs/DEV-PLAN.md:15`、`docs/DISEASE-PRIMER.md:11`） | `9/9 通过` | 一致 |
| 5 | `node scripts/probe-interaction.mjs --self-test` | 3 个注入缺陷全被抓到（`docs/HVT-X-WALKTHROUGH.md:33`） | `FAIL  82/94` + `命中 3/3 条 FAIL：A-09、X3a、X4-03` | 一致 |
| 6 | `node scripts/check-conformance.mjs .` | 用户给定期望 22/30 | `22/30 通过 · 8 失败 · 0 待人工` | 数字一致；**构建方文档未自报该数字**（`grep -rn '22/30' docs/ README.md AGENTS.md research/` 无命中），无法比对，只报实测 |
| 7 | `npm run check`（额外跑，非用户指定） | 未自报 | 末段 `"staticPass": true`、`"errors": []`、1 条 warning（peer ranges / API 签名 / 凭据 / 实际 tgz / Desktop UI 需另行验证） | 无对照；注意该脚本只做语法 + 打包契约（`package.json:23`），**不含探针**，不能当「全绿」用 |

第 6 条 8 项失败全部落在 M6 范围：

```
✗ version/lib      缺少 lib/version.js（生成物，供客户端显示版本）
✗ panel/单一来源    缺少 lib/layout.js（面板参数必须有唯一来源）
✗ panel/customFrame lib/layout.js 里没有 customFrame: true
✗ check/单测        检查链缺少这一项
✗ check/版本一致     检查链缺少这一项
✗ check/schema      检查链缺少这一项
✗ check/文案红线     检查链缺少这一项
✗ check/用例        test/ 下没有 *.test.mjs
```

**复跑结论**：6 条脚本的数字与构建方自报**逐条一致，未发现自报数字与实际不符**。第 5 条自测的 82/94 是设计预期（注入 3 个缺陷），不是回归。

## 三、13 项检验单

结论口径：PASS = 有证据成立；WARN = 成立但有缺口或只能部分成立；FAIL = 不成立。

| # | 检验项 | 结论 | 证据（文件:行号 / 命令输出） | 问题编号 |
| --- | --- | --- | --- | --- |
| 1 | 是否以医生任务冒充患者需要 | WARN | 看板 6 张任务卡是患者动作（`app.js:386-394`：「补一次分期记录 / 看一眼一图秀 / 带问题清单去复诊 / 整理一份报告 / 看一眼手术档案 / 做一次 TESS 自评」）；但手术档案主表单 6 字段含「切除范围」「重建方式」「术前诊断」（`app.js:968`），是手术记录语言，页内只有一句「字段结构在整页表单里演示」(`app.js:508`)，**没有「照抄手术记录原文，不要自己描述」的就地提示** | P2-4 |
| 2 | 患者证据成立性 | WARN | `SCENARIOS.md:3`「本轮 0 访谈。以下六条全是假设，不是已确认需求。」；H1 非计划切除比例有出处（Grimer 2019，19.4%–35.5%），H5 异地就医中国比例自标「未核实」；`DEV-REQUIREMENTS` §四:88「0 访谈，场景全假设」。假设被如实标注，但证据本身不成立（无访谈） | — |
| 3 | 解释价值 vs 记录本 | PASS | 解释层有实体：疾病概要四段（`primer-data.js` + `docs/DISEASE-PRIMER.md`，探针 9/9）、随访五档带「NCCN STS V3.2026 · EXTSARC-2~5 / RETSARC-3 · 页码待核」（`demo-data.js:3` 与 `research/STS-FACTCHECK-2026-10-25.md:222-225` 逐字对应）、切缘 R0/R1/R2 定义引 CSCO 共识（`app.js:513`）、×ULN 契约整段解释（`app.js:621`）、FNCLCC 三组件换算（`app.js:463`）。不是纯记录本 | — |
| 4 | 营养 / 心理 / 照护是否有内容 | WARN | 有：花费表 + 「记一笔」（`app.js:689-694`）、情绪记录与「想跟家里人说的一句话」（`app.js:699-703`）、体重与日常（`app.js:705-711`）、不设营养页并给理由（`app.js:711`）；情绪与照护者负担明确「无权威量化数据（本轮未核实），不设评分」（`app.js:702`）。缺口：照护者侧只有被动展示，没有照护者自己的记录口或代记（`DEV-REQUIREMENTS:93` 已声明本轮不做） | P2-5 |
| 5 | 四核心模块完整 | PASS | `docs/CORE-MODULES.md` **不存在**，四模块无官方定义；按 SPEC 范围与 12 页结构推定四模块 = 病理与分型 / 治疗与线序 / 影像与随访 / 生活与照护，四者在 `PAGES`（`app.js:25-52`）均有独立一级页且各有写入口或整页视图。推定口径见本行说明，非引用文档 | P2-6 |
| 6 | 患者与照护者冲突与负担 | WARN | 只有一处：档案 B 家属「电话里总问还要吃多久，我不知道怎么答」（`demo-data.js:3` B.familyTalk）+ 一句量化缺口说明（`app.js:702`）。冲突没有进入任何流程（无「这句话要不要说给家人」的记录、无照护者视角页签） | P2-5 |
| 7 | 范围是否过大 / 缩水 | PASS | 12 一级页、36 页签（`app.js:25-52`），排除清单 14 条（`research/STS-FACTCHECK-2026-10-25.md` §H），不含 GIST / 骨肉瘤 / 卡波西 / 硬纤维瘤（`SPEC.md:14-16`）；既不缩成「只有病理 + 随访」的记录本，也没有把骨肿瘤、GIST 并进来 | — |
| 8 | 是否错误分期 | PASS | 分期只抄原文、不合并计算（`app.js:456-466`）；AJCC 8 未定义分期组写明「头颈、胸腹腔内脏、眼眶」（`app.js:461`）；FNCLCC 三组件 1–3 + 1–3 + 0–2 = 2–8、G1/G2/G3 区间（`app.js:463`）；「分级 ≠ 分期 ≠ 亚型，三词不互推」（`app.js:466`）；切缘只抄原文不给评价（`app.js:513`）。未见自动算期别、未见把 G 当分期用 | P1-6 |
| 9 | 医学来源是否当前适用 | WARN | 正文只引 NCCN STS **V3.2026**、AJCC **8 版**、WHO **第 5 版(2020)**，与 `research/STS-FACTCHECK-2026-10-25.md:15/17/35/72` 一致；但同文件 `:11` 记「NCCN 官网列为当前版 **V5.2026**」、`:18` 记「UICC TNM 第 9 版 2026-01-01 生效」，产品与 `docs/DIFF-MATRIX.md` 版式表**没有一句说明为何锁 V3.2026、为何只写 AJCC 8**。引用可回溯，选择理由缺失 | P2-7 |
| 10 | 场景 / 功能 / 验收同源一致 | WARN | `SCENARIOS.md` 孤儿页签对照表 12 项全「否」；`INTERACTION-DESIGN.md` §2.2 覆盖 37 状态、A 11 / B 14 / C 23、并集 37、孤儿 0（实测 `probe-interaction.mjs` X1 通过，94/94 内含）；路径内每步断言 nav 文案 = 页面 h1 = key（IP3 过）。缺口：`SCENARIOS.md:44-48` 五条「本癌种额外断言」，探针里 **0 条**（`grep -nE '未定义\|MSTS\|R0\|R1\|R2\|获批状态未核实\|上限未提供\|未回报' scripts/probe-*.mjs` 无输出）；分期空态实现与断言口径不一致（见 P1-6） | P1-6、P2-4 |
| 11 | 未知与假设是否被伪装成事实 | PASS | 三态与「未核实」逐处在场：分期「未回报」（`app.js:459-460`）、TESS「未记录」（`app.js:425`）、药名「获批状态未核实」（`app.js:139`）、指南「页码待核」（`demo-data.js:3` rhythm）、疾病概要「未取得原件，据二次来源」（`primer-data.js`）、试验「本原型不内置登记条目」（`app.js:718`）、情绪「本轮未核实」（`app.js:702`）。未见把假设写成已确认需求 | — |
| 12 | 差异化真实性 | PASS | 50 余种亚型（`app.js` 亚型与病理页断言，`SCENARIOS.md:9` H2 引 WHO 第 5 版）；R0/R1/R2 只抄原文 + 定义出处 CSCO（`app.js:513`）；TESS 分肢体**实测**：下肢 `n=30` → 点「上肢」后 `n=29`、`aria-pressed` 正确翻转（本轮自建静态服务 + puppeteer 实测，输出 `{"before":{"title":"TESS 自评作答","n":30,"limbs":["下肢 · 30 题:true","上肢 · 29 题:false"]},"after":{"n":29,"limbs":["下肢 · 30 题:false","上肢 · 29 题:true"]}}`）；非计划切除 → 二次扩大切除是档案 A 主线（`demo-data.js:3` A.path/surgery/grade）；12 页与基准同名 5/12（`DIFF-MATRIX.md:46`） | — |
| 13 | 红线与交互门槛（判读字段 / 建议性文案 / 三态 / private 三出口 / 候选闭环 / IP1–IP10） | **FAIL** | 判读结论以**档案标题**上屏：切档案 B 后看板 h1 实测为「腹膜后复发不可切除：口服靶向治疗中，按周期记录」，页面无出处标注（`app.js:405` 渲染 `p.headline`；数据源 `demo/build-demo-data.mjs:270-271`），与 `SPEC.md:10`「任何诊断、分期判定、分级赋值、切缘评价、复发与进展判读…一句都不能出现」冲突 → P0-1。产品自带自检抓不到：切 B 后点「检查判断类措辞」输出「本页文本未命中 5 个硬禁词与 5 个软判断词」（词表 `app.js:1198-1199` 不含「不可切除 / 复发」，扫描范围 `app.js:1243` 只取 `#main` 文本）。红线词 grep 另命中 5 处，逐条判定**均非违规**：`app.js:7`（边界声明）、`app.js:897`（免责句列举禁词）、`app.js:1198-1199`（禁词表定义）、`app.js:1209`（示例提问「现在算稳定吗？」，IP10 只预写不发送）、`app.js:630`（NCCN 脚注 o 原文「10 年后复发可能性小」，渲染处标明「这是 NCCN 的标准，不是给你的安排」，`app.js:639`）。private 三出口（`docs/26-CANCER-FEATURE-LINES.md:131` 定义「一图秀 / 摘要 / 导出 各自过滤」）在肉瘤 SPEC 与原型中**无落点** → P2-5。IP 表：IP1 未过、IP5 未过、IP9 部分过，其余过（`INTERACTION-DESIGN.md:165-174`） | P0-1、P2-5 |

## 四、问题清单

级别口径：P0 = 结构性断链或用户可见红线违规（必须修复留痕后才可交 G1 签认）；P1 = 文档与实现不一致（改文档/口径即可）；P2 = 记录项、覆盖面缺口、可移植性，不阻塞。

| 编号 | 级别 | 问题 | 证据 | 建议落点 | 状态 |
| --- | --- | --- | --- | --- | --- |
| P0-1 | P0 | 档案 B 把「复发不可切除」当产品陈述放在看板大标题，去掉出处；产品判读词自检机制覆盖不到标签层，「任何诊断…一句都不能出现」被绕过 | `SPEC.md:10`；`demo/build-demo-data.mjs:270-271`（`meta` / `headline`）；`app.js:405`（h1 渲染）；实测看板文本「今日一页 · 张女士 / 腹膜后复发不可切除：口服靶向治疗中，按周期记录」；实测自检输出「未命中 5 个硬禁词与 5 个软判断词」；词表 `app.js:1198-1199`、扫描范围 `app.js:1243`。记录层有出处：同档案 `diagnosis` 2026-05-11「MDT 记录原文：复发灶不可切除」 | ①`demo/build-demo-data.mjs:270-271` 标签加出处（如「复发灶不可切除（MDT 记录原文）」），并检查 `path` 里「局部复发 / 不可切除」节点同样带出处；②`app.js:1198-1199` 词表补「不可切除 / 复发 / 转移 / 进展 / 缓解」等，或改为「档案标签必须带出处」的结构校验；③修完重跑第 1–5 条探针 + 切 B 看板目视 | 未修复（修复留痕 commit 待补，复评后可签认） |
| P1-1 | P1 | 交互设计文档记的 HEAD 已过时：写「当前 HEAD `20c46e1`」，实际评审对象 `055a8f4`，中间隔 2 个提交（`4e04fdc`、`055a8f4`），而这两提交正是改交互的 | `docs/INTERACTION-DESIGN.md:10`；`git log --oneline` 前 5 条 | 同文件 :10 改为「本文件基线 `20c46e1`，评审对象 `055a8f4`」 | 未修复 |
| P1-2 | P1 | 走查记录对象 HEAD 过时：写 `18356b6`，实际为 `055a8f4`（差 2 个提交，且 94/94 是 `055a8f4` 跑出来的） | `docs/HVT-X-WALKTHROUGH.md:3`；实测 `probe-interaction.mjs` 94/94 在 `055a8f4` | 同文件 :3 改为 `055a8f4` | 未修复 |
| P1-3 | P1 | 原型现状表仍是修复前状态，与同文档结论/修复记录自相矛盾：表内写「13（12 个 `.field` + 1 个 textarea）」「未收在「⋯ 更多」」「「上肢 29 题」未生效」，而 :156 写「已全部收进」「压到 6 字段」、:194 标「已修」 | `docs/INTERACTION-DESIGN.md:147-152` vs `:156`、`:194`；实现侧 `app.js:968`（6 字段）、实测 TESS 29 | 同文件 :145-154 表按 `055a8f4` 重写，保留「修前」值就加一列「修前/修后」 | 未修复 |
| P1-4 | P1 | 版本号三处一致（`package.json` 0.2.1 / `app.js:11` 0.2.1 / `index.html:185` v0.2.1），浏览器标题仍写 v0.2.0 | `prototypes/v0.2/index.html:6` vs `package.json:3`、`app.js:11`、`index.html:185` | `index.html:6` 改 v0.2.1（或改为不写版本号） | 未修复 |
| P1-5 | P1 | README 首段仍写「这是接入骨架，尚未实现真实业务」，与已交付 12 页原型、94/94 走查并存 | `README.md:5` vs `app.js:25-52`、`DEV-PLAN.md:15` | `README.md:5` 分段改写：设计包状态 / 原型状态 / M6–M8 未做 | 未修复 |
| P1-6 | P1 | 分期空态口径与文档不一致：`SCENARIOS.md:46` 要求「分期为空时显示『该部位 AJCC 8 未定义分期组』」，实现对所有空档案一律显示「未回报」+「分期报告出来以后，可以按报告原文补一行」；档案 B 是腹膜后（确属未定义分期组），患者会读成「报告还没出」 | `docs/SCENARIOS.md:46`、`docs/SPEC.md:17`；`app.js:459-460`（空态文案）、`app.js:461`（未定义分期组只作为通用 notice 出现） | `app.js:459-461` 按部位分支：头颈/胸腹腔内脏/眼眶的空态写「该部位 AJCC 8 未定义分期组」，其余写「未回报」；同步补探针断言（见 P2-4） | 未修复 |
| P2-1 | P2 | 疾病概要有肝癌分期残留：「国内分期（CNLC 一类）与 AJCC 在此病种不做换算」，CNLC 是肝癌分期，肉瘤无此分期 | `prototypes/v0.2/primer-data.js:48` | 改为肉瘤实际并存的国内口径（CSCO / CACA），或删去 CNLC 字样；改动后重跑 primer 探针 9/9 | 未修复 |
| P2-2 | P2 | 注释引用了不存在的文档名 | `prototypes/v0.2/primer.js:11`「规范见 `docs/36-DISEASE-PRIMER.md`」；实际文件 `docs/DISEASE-PRIMER.md` | `primer.js:11` 改文件名 | 未修复 |
| P2-3 | P2 | 探针硬编码本机绝对路径加载 puppeteer-core，换机/换 CI 直接跑不起来 | `scripts/probe-interaction.mjs:745`（`createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')`），另三条探针同款 | 改为 `createRequire(import.meta.url)` + 可选 `PUPPETEER_PATH` 环境变量；或把依赖写进 `devDependencies` | 未修复 |
| P2-4 | P2 | 探针未覆盖 `SCENARIOS.md` 的癌种专属断言，94/94 只证明通用路径：五条断言（未定义分期组 / 切缘不出现「切干净」/ 功能页不出现 MSTS / 药名带获批未核实 / ×ULN 缺上限徽章）在 `scripts/probe-*.mjs` 中 **0 命中**；TESS 上肢 29 题也无断言（`probe-interaction.mjs:507` 只断言 30 题） | `grep -nE '未定义\|MSTS\|R0\|R1\|R2\|获批状态未核实\|上限未提供\|未回报' scripts/probe-*.mjs` → 无输出；`probe-interaction.mjs:496-508`；实现侧 `app.js:117/461/630` 确实成立（人工读码 + DOM 实测已确认），但没有自动回归 | `scripts/probe-interaction.mjs` 增 5+1 条断言：切 B 看「未回报」、切 A/腹膜后看未定义分期组文案、`grep` 切缘区不含「切干净」、功能页断言 MSTS 字符串 0 次、药名行断言含「获批状态未核实」、ALT 卡片断言 `上限未提供 · ×ULN 不计算`、TESS 点上肢后 29 题 | 未修复 |
| P2-5 | P2 | 私密内容「三出口」契约未承接：家族口径要求 `visibility` 是数据属性、一图秀/摘要/导出各自过滤；肉瘤 SPEC、SCENARIOS、INTERACTION-DESIGN 均无此条，原型无 `visibility`、无摘要、无导出，一图秀也不含看法记录 | `docs/26-CANCER-FEATURE-LINES.md:131`、`docs/LESSONS.md:173`；`grep -rnE '三出口\|private' docs/*.md prototypes/v0.2/app.js` 在肉瘤项目内只命中「仓库 private」「private 卡样式」，无实现落点；`app.js:699-703` 看法只出现在生活与照护页 | 在 `docs/SPEC.md` 补「看法/情绪记录默认 shared，写入口显式选择，摘要与导出各自过滤」；若本轮不做，在 `DEV-REQUIREMENTS` §四 明列「私密三出口未做」 | 未修复（未核实是否已排入 M6） |
| P2-6 | P2 | 模板要求的 `docs/CORE-MODULES.md` 不存在，「四核心模块完整」只能由评审人推定口径 | `prompts/NEW-CANCER-WORKBENCH.md:80`（产物清单）、`prompts/ZERO-TO-DEV.md:213`；仓库内 `ls docs/CORE-MODULES.md` 不存在 | 补 `docs/CORE-MODULES.md`（四模块 + 每模块的挂载页与不做项），或把四模块口径写进 `docs/SPEC.md` 并在 REVIEW 复评时引用 | 未修复 |
| P2-7 | P2 | 来源版本选择无理由：NCCN 官网当前 V5.2026、UICC TNM 9 已 2026-01-01 生效，产品锁 V3.2026 + AJCC 8，仅写「版本」未写「为何用这版」 | `research/STS-FACTCHECK-2026-10-25.md:11/18`；`docs/DIFF-MATRIX.md` 版本表；`SPEC.md:20` | `docs/DIFF-MATRIX.md` 版本表加一列「选取理由 / 已核到的原文范围」，并在 `SPEC.md:20` 补一句 | 未修复 |

**已判定为不违规、不入问题清单的项**（避免下一轮重复提）：

- `app.js:630` NCCN 脚注 o 原文含「复发可能性小」——原文引用带出处，渲染处附「这是 NCCN 的标准，不是给你的安排」（`app.js:639`）。
- `app.js:1209` 示例按钮「现在算稳定吗？」——是提问不是结论，点击只预写输入框不发消息（IP10，`app.js:1476-1482`）。
- `app.js:7/897/1198-1199` 三处红线词——均为边界声明或禁词表自身。
- `demo-data.js` 全部机构为泛称虚构（县人民医院 / 省肿瘤医院 / 体检中心 / 自述），无真实医院名、无可识别个人信息。
- 12 个一级页逐一跑产品自带「判断类措辞自检」，全部输出「未命中 5 个硬禁词与 5 个软判断词」（但该自检抓不到「不可切除」，见 P0-1）。

## 五、结论

| 级别 | 条数 | 说明 |
| --- | --- | --- |
| P0 | 1 | P0-1 判读结论以档案标题上屏 + 自检机制覆盖不到标签层 |
| P1 | 6 | 5 条文档/版本滞后 + 1 条分期空态口径不一致 |
| P2 | 7 | CNLC 残留、错文档名、硬编码路径、探针缺癌种断言、私密三出口无落点、CORE-MODULES 缺件、来源版本无理由 |

**G1 能否交签认：不能（本轮否决）**。理由是 P0-1 触及 `SPEC.md:10` 的硬约束「任何诊断…一句都不能出现」，且发生在用户打开就看到的看板标题上。修复面很小（一处演示标签加出处 + 一处判读词/标签来源校验 + 补 6 条癌种断言），修复留痕 commit 后复评同一条路径即可，不需要重做设计。

其余方面**没有发现造假**：6 条脚本复跑数字与自报逐条一致；M3 数据独立复算 263 = 263 = 263（jsonl / sqlite / manifest），8 张药物卡引用的 22 个登记号 22/22 命中；医学口径（AJCC 8 未定义分期组、FNCLCC 三组件、切缘只抄原文、MSTS 不给、TESS 不给分、×ULN 上限不借）在源码中成立。M6 缺失、指南三层未做、0 访谈都写在文档里，属已声明缺口，未计入 P0/P1。

## 六、本轮没审到什么

- **M6 全部**：`lib/version.js`、`lib/layout.js`、customFrame 宿主接线、四条检查链、`test/*.test.mjs` —— 未授权，`check-conformance` 的 8 条失败即此范围，未按缺陷计。
- **指南三层 G1/G2/G3**：CSCO《骨与软组织肿瘤诊疗指南》2025 版原件未取得，页码全部「待核」，无法核对原文措辞与页码。NCCN 只核到 V3.2026 的表号级引用，未逐条对原文句。
- **真机与宿主**：未装机、未在 DSH Desktop 加载、未看窄宽与字体缩放的真实表现（只读代码与 `HVT-X-WALKTHROUGH` 记录）；`npm run check` 的 warning 明确「Desktop UI 需另行验证」。
- **AI 能力**：原型未接模型，「AI 面板」是固定文案 + 词表自检；无法评审真实模型的解释质量与越界率。
- **真实患者**：0 访谈、0 可用性测试，六条场景全为假设，无法证伪「患者真的需要这些页」。
- **数据通道**：ICTRP FAILED、ChiCTR 离线无覆盖、XYB CDE 离线无覆盖、CTV 只覆盖本地索引 1434 条子集；临床研究页 `trials` 留空，未审真实拉取。
- **中国获批状态**：药名统一标「获批状态未核实」，未逐条核 NMPA 适应症。
- **发布相关**：市场投稿、包体大小、许可证、Logo 授权、`private/` 清理均未审。
- **可移植性**：探针硬编码本机路径（P2-3），未在干净环境复跑。

---

# 第二轮独立评审（复核构建方的「已全清」声称）

## 七、元信息

| 项 | 内容 |
| --- | --- |
| 评审对象 | **`02cd3d7`**（最终 HEAD，分支 `main`）。P0-1 修复在 `acf7d39`；版本徽章收口在 `d6c782d`；自测判据在 `d8bfe28`；768 逐页签用例在 `02cd3d7`。四提交之间 `prototypes/v0.2/demo-data.js` 逐字节相同（sha256 `fce2af8a…`） |
| 提交沿革（必须记） | 评审**开始**时 HEAD=`acf7d39`、工作树干净；评审**中途**构建方连提三笔：`d6c782d`（`#ver-chip`/`#proto-ver` 改由 `APP_INFO` 渲染 + 填 `PROTOTYPE-REVIEW.md` + 重出 25 张截图）、`d8bfe28`（自测阈值 `≥3`→`===4`）、`02cd3d7`（`P5-tab`：768 宽逐页签）。三笔都不动 `prototypes/v0.2/app.js` 的断言面（`acf7d39→d6c782d` 只多 8 行版本渲染），故本轮所有实测数字对 `02cd3d7` 同样成立。本章曾随 `d8bfe28`/`02cd3d7` 被构建方连带提交（内容未改），本报告以当前工作树的这版为准 |
| 评审人 | 独立子代理（第二轮；不参与构建，不共享主线上下文） |
| 模型标识 / 推理档位 | `custom-local:deepseek-4.1-flash` / 档位**未获取**（运行环境未暴露该参数） |
| 日期 | 2026-10-26（`date +%F`） |
| 运行环境 | macOS arm64 · Node v22.22.2 · Chrome 145 · `puppeteer-core` 经 `scripts/lib/load-puppeteer.mjs` 候选③（`homedir()/.workbuddy/binaries/node/workspace`）解析 |
| 输入范围 | 第一轮本文件 §四（14 行）；`docs/CORE-MODULES.md`（新增）；`docs/PROTOTYPE-REVIEW.md`；`prototypes/v0.2/app.js`（`PAGES`/`TABS`、`stageEmptyLabel()`、`scanJudge()`）；`scripts/probe-interaction.mjs`（X3i、X3j–X3p、自测阈值）；四条探针 + `check-conformance` 的实跑输出；`git show <commit>:<file>` 与 `shasum -a 256` |
| 本轮只改 | 本文件（在文末追加本章；第一轮内容未删改。反向对照的临时改动已还原，见 §九） |

## 八、复跑核对（自报 vs 实测）

全部命令加 `NODE_OPTIONS=` 前缀，在本机跑通。

| # | 命令 | 构建方自报 | 实测末行 | 一致？ |
| --- | --- | --- | --- | --- |
| 1 | `probe-interaction.mjs` | `PASS 102/102`（`HVT-X-WALKTHROUGH.md:32`、`README.md:8`、`DEV-PLAN.md:15`） | `PASS  102/102` | 一致 |
| 2 | `probe-interaction.mjs --self-test` | `FAIL 89/102` + 「4/4 全部被抓到：A-09、X3a、X4-03、X3i」（`HVT-X-WALKTHROUGH.md:33`，措辞随 `d8bfe28` 更新） | `FAIL  89/102`；追加行 `自测：注入 4 个缺陷…4/4 全部被抓到：A-09、X3a、X4-03、X3i`（`acf7d39`/`d6c782d` 上是旧措辞「命中 4/4 条 FAIL」，`d8bfe28` 收紧阈值后改了这句） | 一致（89/102 与 4/4 两个数字都对得上） |
| 3 | `probe-page-view.mjs` | `13/13`（`DEV-PLAN.md:15`、`FULL-PAGE-VIEW.md:96`） | `PASS  13/13` | 一致 |
| 4 | `probe-prototype.mjs` | `28/28`（`DEV-PLAN.md:15`） | 评审开始时 `PASS  28/28`；`02cd3d7` 加了一条 768 宽用例，复跑 `PASS  29/29` | 一致（原有 28 条逐条过；新增断言不是把原有断言放松） |
| 5 | `probe-disease-primer.mjs` | `9/9`（`DEV-PLAN.md:15`、`DISEASE-PRIMER.md:11`） | `9/9 通过` | 一致 |
| 6 | `npm run check` | 未自报数字（只写「静态契约」口径） | `"staticPass": true`、`"errors": []`、1 条 warning（peer 范围 / API 签名 / 凭据 / tgz 内容 / Desktop UI 需另行验证） | 无对照；该脚本**不含探针**，不能当「全绿」 |
| 7 | `check-conformance.mjs .` | `22/30`（`PROTOTYPE-REVIEW.md:34`） | `22/30 通过 · 8 失败 · 0 待人工` | 一致；8 项失败仍全部落在 M6 范围（`lib/version.js`、`lib/layout.js`、三条检查链、`test/*.test.mjs`） |

> 关于 `P5-tab`：探针实际打印「768px 逐页签无横向溢出（**39 个页签全量**）」，而提交信息、`README.md:8`、`DEV-PLAN.md:15`、`PROTOTYPE-REVIEW.md:25` 都写 36。两者差 3，探针没有输出这 3 个的分解（`TABS` 表合计 36），属统计口径差异，不影响 `PASS`；但文档与探针输出不一致，记录在此备查（N7）。

**核对结论**：构建方自报的 6 个数字（102/102、89/102、4/4、13/13、28/28、9/9）与实测**逐条一致**，本轮未发现数字造假。但「自测 4/4」在 `acf7d39` 上的通过阈值是 `≥3`（注 4 条允许漏 1 条），本轮指出的这个问题在评审期间被 `d8bfe28` 修掉，见 §十一 N3。

### 8.1 评审结束时的未提交改动（不属于对象 `02cd3d7`）

定稿前最后一次查看时 HEAD=`a8d3622`（`docs: 原型探针 28/28 → 29/29`），构建方已把 N1/N4/N5 与 N6 的修法写进工作树但尚未提交（N6 的那张更正表又有一格不准，见末行）：

| 位置 | 改动 | 我的核对 |
| --- | --- | --- |
| `app.js:394-400`、`:446` | 看板分期行改走新增的 `stageNote`（按 `stageEmptyLabel()` 分支），不再写死「界面显示『未回报』」 | 未单独复跑（未提交改动，且非本人所写）；代码路径正确 |
| `probe-interaction.mjs:707-720` | 新增 `X3j-b`：抓看板「档案位置」卡的「分期」行，断言「未回报」与「未定义分期组」不同时出现 | 实测 `PASS  X3j-b …「分期 这个部位在 AJCC 第 8 版里没有定义分期组，不是报告还没出 该部位未定义分期组」`，总分 `PASS 103/103` |
| `scripts/fetch-sarcoma-trials-2026.mjs:31-38` | 删掉硬编码兜底，未设 `UNIFIED_TRIAL_MCP_ROOT` 时 `exit(2)` | 改法与 N4 建议一致；提交后 `grep -rn "Users/qinxiaoqiang" scripts/` 应为 0 |
| `docs/SCENARIOS.md:48` | 徽章文案改为「上限未提供 · ×ULN 不计算」 | 与实现、`X3o` 对齐（N5 关闭） |
| `docs/CORE-MODULES.md` | 补「二次扩大切除」限定、重写治疗线序的肉瘤专属理由、把 followup 的降级理由改为「档位属核心一验收面」，并新增一张更正表承认核心一无写入口/整页（N6） | 方向与 §12.3 一致。**但更正表又把核心三写成「整页视图 ❌」**，与 `app.js:541` 的 `data-pv="timeline"`「打开线序全景（整页）」冲突——这次更正自身又错了一格 |

这些改动**不在 `02cd3d7` 里**，因此不改变 §十 的状态与 §十四 的结论；一旦提交并复跑通过，N1/N4/N5 可以关闭（N6 需把更正表里核心三的「整页视图」改回 ✅）。留一句提醒：`PROTOTYPE-REVIEW.md` 的提交与 SHA 还没跟上（见 N2）。

## 九、P0-1 复评专章

### 9.1 正向：判读结论已不在看板标题上

| 证据 | 内容 |
| --- | --- |
| 数据层 | `prototypes/v0.2/demo-data.js` 档案 B：`"headline":"口服靶向治疗中：按周期记录，把手脚的反应带进门诊"`（`grep -o '"headline":"[^"]*"'` 输出两行，A/B 均是叙述句，无判读词） |
| 判断移到哪了 | 同一档案 `meta`：`腹膜后去分化脂肪肉瘤 · 复发灶不可切除（MDT 记录 2026-05-11）`；`diagnosis` 2026-05-11：`MDT 记录原文：复发灶不可切除，进入系统治疗`；`path` 两个节点写 `局部复发（MDT 记录）` / `不可切除（MDT 记录）`——**保留结论但每次出现都带「谁说的」** |
| DOM（自建静态服务 + puppeteer 实测档案 B 看板） | `h1 = 口服靶向治疗中：按周期记录，把手脚的反应带进门诊`；`chips = 腹膜后肿块 / 手术切除 / 去分化脂肪肉瘤 / 局部复发（MDT 记录）/ 不可切除（MDT 记录）/ 口服靶向` |
| 闸门 | `probe-interaction.mjs` 的 `X3i`（`scripts/probe-interaction.mjs:667-695`）两档案 × 12 页 × 全部页签扫渲染后 DOM，`PASS`；机制在 `app.js:1231-1281`（三桶：硬禁词 / 判读词带出处 / 判读词无出处）、`:1339` 暴露 `__scanJudge` |

### 9.2 反向：闸门是不是死的（第一轮的教训）

做法与结果：

1. 反向对照在 **`acf7d39` 时点**的工作树做（当时 HEAD=`acf7d39`、工作树干净）。`demo-data.js` 在 `acf7d39`/`d6c782d`/`d8bfe28`/`02cd3d7` 四个提交里完全相同（sha256 `fce2af8a…`），故结论对最终对象 `02cd3d7` 同样成立。`cp prototypes/v0.2/demo-data.js /tmp/dd.bak.js`（备份，`shasum` 2b3fe0dc…aa7d 两侧相同）。
2. 只把档案 B 的 `headline` 改回第一轮的违规原文「腹膜后复发不可切除：口服靶向治疗中，按周期记录」（`grep -o` 确认注入成功）。
3. 重跑 `NODE_OPTIONS= node scripts/probe-interaction.mjs`：

```
FAIL  X3i  判读词必须带出处：两档案 × 全部页面与页签，无出处判读词 0 处  — B/dashboard/-：不可切除：腹膜后复发不可切除：口服靶向治疗中，按周期记录 ／ 复发：腹膜后复发不可切除：口服靶向治疗中，按周期记录
FAIL  X3     X3 通道一致：手工收敛 + AI 候选闭环 + 无裸删除  — 1 条未过：X3i
FAIL  100/102
```

4. `cp /tmp/dd.bak.js prototypes/v0.2/demo-data.js` 还原；`shasum` 与备份一致（2b3fe0dc…aa7d）；`git status --short prototypes/v0.2/demo-data.js` **输出为空**（已还原，工作树干净）。

两个额外判断：

- 我注入的文本里带**裸「记录」二字**（「按周期**记录**」）——正是第一轮让闸门假绿的那个词。`ATTRIB_RE`（`app.js:1239`）收紧后仍报 `FAIL`，说明书里写的「第一版栽在裸『记录』上」确已修掉，不是换了个词自欺。
- 闸门报的是**两档案 × 全部页面**，不是只测看板；`B/dashboard/-` 的定位与第一轮人工发现的位置一致。

### 9.3 结论

**P0-1：已消除。** 依据：正向 DOM 无判读标题 + 判断保留在事实层且逐处带出处；反向注入后 `X3i` 立即 FAIL、总分 102→100。正向与反向都成立，不属于「数据改软了但闸门没响」。

## 十、14 行逐条状态（对第一轮 §四）

口径：**已修** = 有证据且证据可复跑；**部分修** = 主症状消失但同一缺陷的残口仍在；**未修** = 原样。

| 编号 | 级别 | 第一轮问题（摘要） | 本轮状态 | 依据（文件:行 / 命令输出 / DOM） |
| --- | --- | --- | --- | --- |
| P0-1 | P0 | 档案 B 把「复发不可切除」当产品标题上屏 | **已消除** | 见 §九；正向 DOM h1 为叙述句，反向注入 `X3i` FAIL / 100/102 |
| P1-1 | P1 | 交互文档记的 HEAD 过时（`20c46e1`） | **已修** | `docs/INTERACTION-DESIGN.md:10` 改为「写成时的基线 `20c46e1`；当前评审对象 `055a8f4`」，`:14` 补充说明版本 0.2.1 落在此后修复提交。遗留：仍未写出 `acf7d39`（属记录滞后，不重复计缺陷） |
| P1-2 | P1 | 走查记录对象 HEAD 过时（`18356b6`） | **已修（弱）** | `docs/HVT-X-WALKTHROUGH.md:3` 改为「首次走查 HEAD `18356b6`；P0 修复后复跑落在 `v0.2.1`」，不再把 `18356b6` 当复核对象。弱在：复跑对象只有版本号、没有提交哈希，而 `v0.2.1` 横跨 `acf7d39`/`d6c782d` 两个提交（并入 §十一 N2） |
| P1-3 | P1 | 原型现状表与结论自相矛盾 | **已修** | `docs/INTERACTION-DESIGN.md:144-158` 改为「现在 / 本轮前」两列，6 个写入口收进「⋯ 更多」、主表单 6 字段、TESS 上肢 29 题均已按现实现重写；由 `X3a/X3b/X3c/X3d/X3p` 与 102/102 背书 |
| P1-4 | P1 | 浏览器标题仍写 v0.2.0 | **已修（按本轮对象 `02cd3d7`）**；`acf7d39` 时点只算部分修 | `git show acf7d39:prototypes/v0.2/index.html` 仍有两处 `v0.2.0`（:152 顶栏徽章、:156 原型条），只有 `:6` 标题改成 v0.2.1；`d6c782d` 把两处改为 v0.2.1 并由 `APP_INFO` 渲染覆盖（`app.js:1184-1190`）。当前工作树 `grep -rn "v0\.2\.0" prototypes/ docs/*.md README.md` 为 0 命中 |
| P1-5 | P1 | README 仍写「接入骨架，尚未实现真实业务」 | **已修** | `README.md:5-10` 改为「设计包 / HTML 原型（v0.2.1）/ M6–M8 未做」三块分述，并写明「G1 尚未签认」 |
| P1-6 | P1 | 分期空态不按部位分支 | **部分修** | 两处已生效、一处自相矛盾：任务卡 DOM = `补一次分期记录 \| 本档案的分期行：该部位未定义分期组`；agent 面板 DOM = `分期行：该部位未定义分期组`；**但看板「档案位置」卡 DOM = `分期 / 本档案没有分期记录行，界面显示「未回报」/ 该部位未定义分期组`**——左文与右 pill 互相打脸。源码 `app.js:439` 的说明文字是写死的，未走 `stageEmptyLabel()`；`X3j` 只测 `tumor/2`（`scripts/probe-interaction.mjs:699-705`），覆盖不到看板 |
| P2-1 | P2 | 疾病概要残留肝癌 CNLC 分期 | **已修** | `prototypes/v0.2/primer-data.js:42/48/54` 已全部换成 CSCO 骨与软组织肿瘤诊疗指南 2025（并标「未取得原件」）；`grep CNLC` 0 命中；primer 探针 9/9 |
| P2-2 | P2 | 注释引用不存在的 `docs/36-DISEASE-PRIMER.md` | **已修** | `prototypes/v0.2/primer.js:11` 现为 `docs/DISEASE-PRIMER.md` |
| P2-3 | P2 | 探针硬编码本机绝对路径 | **部分修** | 四条探针 + `shoot-pages.mjs` 均改为 `scripts/lib/load-puppeteer.mjs`（候选：`PUPPETEER_PATH` → 仓库 `node_modules` → `homedir()` 家族 workspace → 常规解析；全失败 `exit(2)`）；本机四条探针全部跑通，证明候选链有效。**残留 1 处**：`scripts/fetch-sarcoma-trials-2026.mjs:34` 仍有 `/Users/qinxiaoqiang/Downloads/unified_search_trials`（有 `UNIFIED_TRIAL_MCP_ROOT` 可覆盖）。故 `grep -rn "Users/qinxiaoqiang" scripts/` = **1**，不是 0 |
| P2-4 | P2 | 探针缺癌种专属断言 | **已修** | `scripts/probe-interaction.mjs:697-760` 新增 X3j（腹膜后→未定义分期组）、X3k（有分期→不出现未定义）、X3l（切缘无「切干净」）、X3m（功能页无 MSTS）、X3n（药名带获批未核实）、X3o（×ULN 徽章）、X3p（TESS 30→29 + `aria-pressed`）；B-06 另断言不显示总分。全部 PASS |
| P2-5 | P2 | 私密内容三出口契约未承接 | **已修（按第一轮给的第二选项）** | `docs/SPEC.md:99-120` 新增专节，逐条列「要求 / 现状 / 缺口 / 处理方式（M6 做 life/2 时必须落 schema + 三出口过滤 + 单测）」；`docs/DEV-REQUIREMENTS-2026-10-25.md:95-97` 明列「本轮全未做」。没有假称已实现 |
| P2-6 | P2 | `docs/CORE-MODULES.md` 缺件，四模块只能由评审推定 | **部分修** | 文件已补（10.8 KB，见 §十二.1）；但两处不成立：①判据应用不自洽（「治疗线序」按同一把尺子也该降级）；②§七「四模块各有独立一级页 + 写入口或整页视图（成立）」对 `tumor` **不成立**——`sed -n '445,512p' app.js` 无 `data-pv`、无 `writeEntry`，全站 `data-pv` 取值只有 cadence/chart/intake/margin/surgery/tess/timeline/trial/wound，没有病理整页。详见 §十二.2 |
| P2-7 | P2 | 来源版本选择无理由 | **已修** | `docs/DIFF-MATRIX.md:11-22` 新增「版本选取理由」表：逐条写「锁定版本 / 已知更新（V5.2026、TNM 9 生效）/ 为什么仍锁 / 什么时候必须换」，并把「为什么仍锁」明确定性为「本项目的取舍理由」而非事实 |

小计：P0 = 0；P1 已修 5、部分修 1（P1-4 在 `acf7d39` 时点只改了 `<title>`、两处徽章仍是 v0.2.0，`d6c782d` 补齐，按本轮对象计已修；**P1-6 仍部分修**）；P2 已修 5、部分修 2（P2-3、P2-6）。

## 十一、新增问题

| 编号 | 级别 | 问题 | 依据 | 建议 |
| --- | --- | --- | --- | --- |
| N1 | **P1** | 看板「档案位置」卡的分期行自相矛盾（= P1-6 的残口，用户第一屏可见） | DOM 实测档案 B：`分期 / 本档案没有分期记录行，界面显示「未回报」/ 该部位未定义分期组`；源码 `app.js:439` 说明文字写死 | 把 `:439` 的 `'本档案没有分期记录行，界面显示「未回报」'` 改成按 `stageEmptyLabel(p)` 分支（或直接删掉「界面显示」四字）；`X3j` 增加一条看板断言 |
| N2 | **P1** | 签认记录的对象与实际产物错位：`PROTOTYPE-REVIEW.md` 写「提交 `acf7d39`」，但同一表里「顶栏徽章与页脚由 `APP_INFO` 渲染时覆盖，已无写死副本」只在 `d6c782d` 成立；表内 4 个 SHA-256 中 `index.html`/`app.js` 两个是 `acf7d39` 的旧值 | `docs/PROTOTYPE-REVIEW.md:11-13`；实测当前 `index.html` = `3afd6ccd…d13f650b`、`app.js` = `0ecd88c3…f88e`，而文档记 `1361052a…`、`5dde457e…`（与 `git show acf7d39:` 的哈希一致）；`git diff acf7d39..d6c782d` 两文件均有改动 | G1 签认前把「提交」改为原型文件所在的 `d6c782d`（当前 HEAD `d8bfe28` 只改探针与文档，不动 `prototypes/`）并重算 4 个 SHA-256；`HVT-X-WALKTHROUGH.md:3` 同样把「v0.2.1」补成提交哈希 |
| N3 | P2 | 自测通过阈值是「≥3/4」，第 4 个注入缺陷（正是 P0-1 闸门 X3i）漏检时 `--self-test` 仍会 PASS 并 `exit 0` | `acf7d39` 的 `scripts/probe-interaction.mjs:903`：`const enough = hit.length >= 3`。**已于评审期间由 `d8bfe28` 修为 `miss.length === 0`**（`git diff d6c782d..d8bfe28 -- scripts/probe-interaction.mjs`），复跑输出「4/4 全部被抓到」 | 已修，保留记录以免下一版回退；这条与第一轮「闸门是死的」是同一个失效模式 |
| N4 | P2 | 硬编码本机路径残留 1 处（P2-3 未清零） | `scripts/fetch-sarcoma-trials-2026.mjs:34`；`grep -rn "Users/qinxiaoqiang" scripts/` = 1 命中（有 `UNIFIED_TRIAL_MCP_ROOT` 覆盖） | 去掉默认绝对值，改为「未设置环境变量则报错退出」，或落到 `research/` 相对路径 |
| N5 | P2 | 场景文档与实现的徽章文案不一致 | `docs/SCENARIOS.md:48` 写徽章为「需参考上限」；实现是「上限未提供 · ×ULN 不计算」（`app.js:117/184/637`），`X3o` 断言后者 | 改 `SCENARIOS.md:48` 一处文案（或反过来改实现，但探针与页面注释都以后者为准） |
| N7 | P2 | 「768 宽逐页签」的数字三处写 36，探针实际打印 39 | `NODE_OPTIONS= node scripts/probe-prototype.mjs` → `PASS P5-tab 768px 逐页签无横向溢出（39 个页签全量）`；`README.md:8`、`DEV-PLAN.md:15`、`PROTOTYPE-REVIEW.md:25` 均写 36；`TABS` 合计 36 | 统一口径：要么改文案为 39，要么在探针里把「页签」与「页面」分开计数并写清 39 的构成 |
| N6 | P2 | `CORE-MODULES.md` §七的「四模块各有写入口或整页视图（成立）」与实现不符 | 同 P2-6 依据：`tumor` 无 `data-pv`、无 `writeEntry`，`INTERACTION-DESIGN.md:157` 自己也写「无手工新增入口」 | 把该句改为「核心一为只读记录 + 『改这一条』更正，其余三个模块有整页视图/写入口」；或给病理页补一个整页视图 |

## 十二、对 P2-6 的独立判断（新文件是否成立）

### 12.1 补件事实

`docs/CORE-MODULES.md` 存在（10 799 B），结构完整：判定标准（§一）→ 四个核心各一节（§二–§五，含「离开肉瘤为什么成立不了 / 用户任务 / 规则要点 / 验收 / 未核实」）→ 支撑模块表（§六，8 页逐条给降级理由）→ 与评审推定口径的差异（§七）。比第一轮「只能由评审推定」是实质进步。

### 12.2 三处不成立

**(a) 判据本身自洽，但应用不自洽。** 三条判据（离开肉瘤不成立 / 患者反复用 / 有具体失败后果）可操作，问题在打分尺度不一：

- 「治疗线序与放疗窗口」被留作核心，理由是「放疗术前 vs 术后、多少 Gy、为什么停——这三问在乳腺癌语境里不成立」（`CORE-MODULES.md:79`）。**这一句与事实不符**：乳腺癌同样有术前/术后放疗、剂量与中止原因，NCCN 乳腺癌指南也按此分档。按 §一 第 1 条，它应当被降级；但同一份文件用「换成任何癌种都成立」把 `imaging`/`followup`/`life` 降级（`:135-136`）。同一把尺子量出两种结果，是这份文件最大的内部矛盾。
- 「手术与切缘」的理由（「切缘阴性 ≠ 切干净」）在任何实体瘤都成立，靠的是肉瘤特有的「二次扩大切除 + R0/R1/R2 + 距肿瘤 mm」才勉强站住；文档没写这层限定。
- 「功能与康复」用 TESS 立论，最硬，成立（TESS 确实是肢体重建专用量表）。

**(b) 被降级的两页，理由一半成立。** `life` 降级成立（花费/情绪/体重确实通用）。`imaging`+`followup` 降级**理由偏弱**：`rhythm` 五档是按 `EXTSARC-2~5` / `RETSARC-3` 分部位给的（`demo-data.js:3` 逐字带表号），「腹膜后复查跟肢体复查不是一张表」正是肉瘤特有的随访结构；把它归为「通用构件」会丢掉第一轮检验单第 3 项已经认可的差异化实体。文中的护城河只剩「影像并列不连曲线」，这句确实是通用交互。

**(c) 「四模块各有独立一级页 + 写入口或整页视图」对核心一不成立。** `PAGES` 里 `tumor` 是一级页（`app.js:26`），4 个页签齐全，但 `sed -n '445,512p'` 内 0 个 `data-pv`、0 个 `writeEntry`；全站 `data-pv` 只有 9 个取值，没有病理/分期的整页。患者只能看只读记录、点「改这一条」，**不能新增一条病理记录**。`INTERACTION-DESIGN.md:157` 自己也承认「无手工新增入口」。所以 §七 那句「成立」是过度声明（已列 N6）。

### 12.3 我对「换模块」的结论

**接受换模块的方向，不接受它现在的论证。** 把「手术与切缘」「功能与康复」提上来，比第一轮推定的「影像与随访 / 生活与照护」更贴近肉瘤的失败模式（切缘误读、保肢后功能），这个判断我认同。但：①「治疗线序」按文件自己的第 1 条判据应降级，若保留就必须补一条肉瘤专属理由（如「腹膜后 vs 肢体 vs 术后复发的线序不同」），不能拿乳腺癌当反例；②「随访按部位分五档」的肉瘤特异性被误判掉了，建议把 `followup` 的降级理由改写为「表单通用，但档位分部位——属核心一的验收面」，而不是一句「通用构件」。

## 十三、复核第一轮自身

- **第一轮 P0-1 的判断成立**，且本轮反向对照证明修复不是「改软数据」。无需撤回。
- **第一轮 P1-4 漏记了两处**：`055a8f4` 的 `index.html` 实际有 **3 处** `v0.2.0`（`:6` 标题、`:152` 顶栏徽章、`:156` 原型条），第一轮只写了浏览器标题一处。构建方照建议只改 `:6`，于是 `acf7d39` 修完标题、另两处留到 `d6c782d` 返工。级别不变（仍是 P1），但教训是：**「版本号一致」这类检查必须全仓 grep 而不是只看一处**。
- **第一轮「四核心模块」推定口径不算审错**，属缺件下的受限结论；但新文件的论证不能因此反过来给推定的模块判错（它自己也在 §七 这么写，我同意这个态度）。

## 十四、结论

| 级别 | 条数 | 说明 |
| --- | --- | --- |
| P0 | **0** | P0-1 正向 + 反向双向验证，已消除 |
| P1 | 2 | N1 看板分期行自相矛盾（P1-6 残口）；N2 签认记录的对象与 SHA 错位 |
| P2 | 4 | N4 硬编码路径残留；N5 徽章文案；N6 CORE-MODULES §七 过度声明；N7 页签数 36/39 不一致（N3 已在评审期间由 `d8bfe28` 修掉）。其中 N4/N5 的修法已出现在评审结束时的未提交工作树里，见 §8.1 |

**G1 能否交签认：不能。**

理由有两条，都可复核：**P1-6 没有修完**。看板是用户打开就看的第一屏，档案 B 的「档案位置」卡同一行里左边写「本档案没有分期记录行，界面显示『未回报』」、右边写「该部位未定义分期组」——这正是 P1-6 要消灭的那个误读（腹膜后患者以为报告还没出）。`X3j` 只测了「我的肿瘤 › 分期与分级」，所以 102/102 全绿也没照到它。修法是一行模板 + 一条看板断言，规模与 P0-1 同级。

再加 N2：`PROTOTYPE-REVIEW.md` 是这次要签的那张表，表里写的提交（`acf7d39`）和哈希（两个旧值）与现在要签的产物不一致。签认记录对不上产物，本身就不能签。

除此之外本轮没有发现新的 P0，也没有发现数字造假：6 个自报数字逐条复跑一致；P0-1 的闸门不是死的（反向注入立刻 FAIL）；P2 七条里五条清干净，剩两条是范围没收尽（`fetch` 脚本、`CORE-MODULES` 的过度声明）；评审中我提的自测阈值问题（N3）已在 `d8bfe28` 收紧为「注 4 必须抓 4」。

**若要把上面两条降下来**：N1 的修法（`app.js:394-400` + `X3j-b`）在定稿时已出现在工作树里，复跑 `103/103` 且 `X3j-b` 通过；只要它被提交、且 `PROTOTYPE-REVIEW.md` 的「提交 / SHA-256」改成对应产物，这两条就可关闭。**但在 `02cd3d7` 这个对象上，它们都还在**，所以本轮结论仍是「不能」。
