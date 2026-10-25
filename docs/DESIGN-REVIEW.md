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
