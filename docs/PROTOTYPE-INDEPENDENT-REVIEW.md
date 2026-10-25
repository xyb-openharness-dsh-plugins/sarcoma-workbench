# 原型独立评审 · 小肉宝 SarcoPal v0.1.0

- **评审员**：独立评审员（非开发者；只读被评审代码，除本文件外未改动仓库任何文件，未 `git commit`）
- **日期**：2026-10-25
- **评审方式**：Playwright 真跑（`file://` 直开，Chromium 1440×1000）+ 66 页全量截图留档 + 逐页 DOM `innerText` 全文抽取 + 计算样式/打印产物测量 + 代码逐行走读 + 自建禁词宽表扫描 + 数据层直接调用断言
- **被评审版本（SHA-256）**：
  - `prototypes/v0.2/app.js` = `36ea4138e81f9451d6436e1a7e4a27dbd182d33c868f5d8b564360b0e1803e42`（1095 行）
  - `prototypes/v0.2/demo-data.js` = `58d8a2e429aa6999e2e2d9b5f1ca33506e269bd13af279ac66f3f58559ebd11c`
  - `prototypes/v0.2/style.css` = `ff987b57bf5762ae1b7e02b293c4043f2616e176e1ec027a17e998ba9325b687`
  - `prototypes/v0.2/index.html` = `ee032804caec171bea5f038d6184d31d6d6b42b0b7e8cafa87ab132c6706145a`

> **评审对象漂移声明（必须记录）**：评审过程中被评审文件被并发修改。开始时 `app.js` 为 1043 行 / `edf51ddd…`，13:54 与 13:56 两次改写后变为 1095 行 / `36ea4138…`，`demo-data.js` 亦于 13:55 变更。**本报告全部结论均基于最终的 `36ea4138` / `58d8a2e4` 版本**；66 页扫描脚本在抓取前后各计算一次 SHA-256，实测 `stable during sweep: true`（`/tmp/sweep-real.json` 的 `sha_before` 与 `sha_after` 完全一致），故数据可信。13:56 之后至出稿（14:24）哈希未再变化。
>
> 补充核对：该版本已被提交为 `1a8b67a`（M2），`git show HEAD:prototypes/v0.2/app.js | shasum -a 256` = `36ea4138…`、`git show HEAD:prototypes/v0.2/demo-data.js | shasum -a 256` = `58d8a2e4…`，与工作树逐字节一致 —— 即**本报告评审的就是已提交的 M2 版本**，不存在"评审了一个中途脏状态"的风险。

> **工具限制声明**：本评审模型不接受图片输入（`read_image` 返回 `model "deepseek-4.1-flash" does not declare image input`），因此**无法做到"逐页读截图"**。替代证据为：① 每页 `#main` 的 `innerText` 全文（`/tmp/sweep-real.json`，66 条）② `getComputedStyle` / `offsetHeight` / `scrollWidth` 测量 ③ Playwright `pdf()` 打印产物文本抽取 ④ 直接调用 `window.__SARCO_PAL__` 的数据层函数断言。**截图（66 张，`/tmp/review-shots/`）仅作留档，不构成本报告的证据链**。
>
> 为遵守"没有测量就不许写通过"，本报告**不包含任何未经上述手段验证的判断**：凡无法用文字/DOM/数据层证伪或证实的，一律不写；确实存在但本轮未验的，在 §6 末与 §7 明确列出（如真机、屏幕阅读器、真实点击键盘 Tab 序），并**不计入任何"合规"结论**。

---

## 0. 结论

**不通过。** 原型在"不判读 / 不预后 / 不做算分器"这三条上守得住（K1、K3、K4 通过），但在**私密数据主权（K5）、指令式文案（K2）、未核实显形（K6）**上存在 6 处 P0，其中 3 处是**患者可见的真实泄露或错误归因**。16 条场景中，真正接住 4 条、部分接住 9 条、未接住 3 条 —— 多数场景是"页面长得像，产物与失败恢复没有兑现"。

| 分级 | 计数 | 说明 |
| --- | --- | --- |
| **P0（必须修，违反红线或等同患者安全事件）** | **6** | K5 ×4、K2 ×1、患者安全/归因 ×1 |
| P1（应修） | 19 | 交互哑火、数据口径、自述不实、空态缺失等 |
| P2（建议） | 9 | 细节与可访问性 |
| 已确认合规（逐条实测通过，非"看起来没问题"） | 16 | 清单见下（每条都给出实测依据，未测量者不列入） |

**已确认合规的 16 项（每项均有实测依据，未测量者不写入）**：
1. K1 不判读 —— 无判读类字段；80 词宽表跨 66 页扫描，命中全部落在否定/释义语境
2. K3 不预后 —— 无生存率/复发概率/风险分级；`高危` 仅在医生原话引用内
3. K4 不做算分器/分期器/切缘判读器 —— 输入控件普查 + 关键词语境判定 + 代码路径检查三轮穷举
4. 页数结构 11 一级 / 32 二级（`totalSub=32`、`navs=11`）
5. 66 页 1440 宽横向溢出 = 0（`overflowX` 分布 `[0]`）
6. 66 页页脚贴底 = true
7. console error / pageerror / failed request = 0 / 0 / 0
8. 折叠卡默认展开数 = 0（66 页 `<details>` open 计数合计 0）
9. 折叠卡五块顺序固定 = 方案 / 指标和趋势 / 影像发现 / 副作用总结 / 心理·营养措施和效果
10. 折叠卡张数 = 4（p0 = 1、p1 = 3），与开发者"两档案 4 张卡"一致
11. `50 余种` 全仓 0 命中
12. `不可恢复` 全仓 0 命中
13. AI 出口与一页纸出口**无**"放开私密"开关（实测 `ctxViewpoint=0`、`prepViewpoint=0`）—— 这一点设计得比导出更严，值得保留
14. 每条记录都带 `in_use` 与 `visibility`（38 + 35 条普查，字段缺失 0 条）
15. `mind/1` 遮罩页在未解锁时正确隐藏私密正文（`hasPlainText=false`）—— 问题是 `mind/0` 漏了，不是遮罩机制本身坏了
16. 试验页**有条目时** `未查过` / `未取回` 状态正确渲染且带 `通道 · 采集于 fetchedAt` —— 问题是 0 条时没有占位

**一句话**：这不是"页面不好看"的问题——是**一个患者在"遮住状态"下打开"当下感受"页，输入框里已经躺着他自己那条私密原文**；从陈女士档案切到王先生，私密遮罩依然是打开的；给医生的就诊一页纸看不出这叠资料是女儿代记的。

**为了找 P0 我做了哪些尝试（证明不是走过场）**：见 §4 K4 段落，我为 K4 专门做了「全站数字输入普查」「算分器/分期器/切缘判读器关键词全仓 grep」「FNCLCC 公式出现点逐个语境判定」三轮，结论是 K4 确实找不到（这是本次唯一"刻意找不到"的方向，如实记录）；K1/K3 同样做了 80 词宽表跨 66 页扫描并逐条判别语境。

---

## 1. P0 问题（6 条）

### P0-1 私密记录正文被无条件预填进「当下感受」输入框，遮罩形同虚设

- **现象**：`心理与家庭 · 当下感受`（`mind/0`）的"一句话（≤140 字）"输入框，在**未点"我要看"、`showPrivate === false`** 的干净初始状态下，已经含有该档案最后一条私密记录的原文。
- **证据**：
  - 代码：`prototypes/v0.2/app.js:874`
    ```
    <textarea id="mood-text" rows="3" placeholder="...">${esc(p.viewpoint.filter((v) => v.visibility === 'private').slice(-1)[0]?.text || '')}</textarea>
    ```
    这不是"渲染保存的草稿"，是每次 `render()` 都把**私密记录的 text 字段**写进可编辑控件。
  - 实测（Chromium，`showPrivate` 显式置 false 后取 `#mood-text.value`）：
    - 陈女士 → `'医生提过化疗可能影响生育，我想问清楚但不知道怎么开口。'`，而该档案 `viewpoint.visibility==='private'` 的条目正是 `['每次复查前一周都睡不好，总担心片子有问题。', '医生提过化疗可能影响生育，我想问清楚但不知道怎么开口。']`
    - 王先生 → `'第三次住院了，不知道还能撑几轮，家里人都瞒着他说。'`（王先生唯一私密条目）
  - 对照：同一档案的 `mind/1`（私密记录页）在同样状态下正确显示"2 条私密记录已遮住"、正文正则匹配私密原文 = `false`。**即同一个状态变量，一个页面遮住了，另一个页面直接摊开。**
- **违反**：**K5**「private 三出口代码级过滤」中的"不进摘要/AI/导出"精神被绕过——这里不是出口，是**入口**：私密记录被当作"草稿"回填到公开输入区，截图、投屏、旁人一眼可见，正是 `mind/1` 页面自己承诺"遮住状态下截图、投屏都不会露出内容"的反例。
- **建议修法**：`#mood-text` 永远只回填**本次会话新输入**（独立的 `state.moodDraft`），或回填 `null`；任何 `visibility==='private'` 的 `text` 不得进入任何 `<textarea>` / `<input value>` / `title` / `aria-label`。加一条 grep 级断言：`grep -n 'visibility === .private.' app.js` 的每一处命中都不得出现在可编辑控件的 value 位置。

### P0-2 档案切换不重置"私密已解锁"状态 → 跨档案私密泄露（真实可复现路径）

- **现象**：在陈女士档案点开"我要看"解锁私密后，切到王先生档案，私密遮罩**仍然是打开的**，王先生的私密原文直接显示。
- **证据**：
  - 代码：`app.js:1047`
    ```
    $$('[data-profile]').forEach((b) => b.onclick = () => { state.profile = Number(b.dataset.profile); state.sub = 0; render(); });
    ```
    只重置 `sub`，不重置 `showPrivate`（也不重置 `metricPick` / `agentDraft` / `trialFilter` / `large`）。
  - 实测（真点 `.profile-item` 与真点 `私密记录` 二级页签，非直接改 state）：
    1. 陈女士 → `mind/1` → 点"我要看" → `state.showPrivate = true`，显示 `2025-09-18 · 很怕 / 「每次复查前一周都睡不好…」`
    2. 点 `.profile-item[1]`（王先生，女儿代记）→ `state = {profile: 1, view: 'mind', sub: 0, showPrivate: true}`
    3. 点"私密记录"页签 → 页面直接渲染出：`2026-09-12 · 累 / 「第三次住院了，不知道还能撑几轮，家里人都瞒着他说。」情绪与家庭 · 家属代记 私密`
  - 攻击面扩大：`window.__SARCO_PAL__` 暴露了 `state`，`window.DEMO` 可被任意脚本直读（`window.DEMO.profiles[0].viewpoint.filter(v=>v.visibility==='private').length` → `2`）。原型无后端，这一点不可避免，但**至少不应让同一 UI 状态跨主体残留**。
- **违反**：**K5**「数据主权与代记」——"双主体"场景（陈女士本人 / 王先生女儿代记）下，代记人点一次"我要看"即获得另一位患者（另一个主体）的全部私密正文，且无二次确认。这正是 HVT-8 声称覆盖的场景（"家属代记，患者本人不想让家人看到情绪记录"）。
- **建议修法**：`[data-profile]` 的点击处理里必须 `state.showPrivate = false; state.metricPick = null; state.agentDraft = null;`（凡与主体绑定的 UI 状态全部重置）；更稳的做法是把 `showPrivate` 改为 `showPrivate: {0:false, 1:false}` 按档案键控。

### P0-3 就诊一页纸（给医生的摘要出口）完全丢失代记标记

- **现象**：`复诊与随访 · 就诊准备` 生成的"一页纸"，在**女儿代记**的王先生档案下，看不出这份材料是家属代记的；正文里 0 处"代记/家属/女儿"。
- **证据**：
  - 代码：`app.js:147-159` `buildVisitPrepSheet(p)` 返回字段 keys = `['kind','name','site','subtype','grade','stageText','baseline','lines','questions','viewpoint','viewpointFiltered']` —— **无 `recorder` / `recorderLabel`**（实测 `prepHasRecorder: false`，两档案皆然）。
  - 页面：`app.js:801-818` 的 `.print-page` 里只有 `p.name · p.site · p.subtype.name`，无 `recorderBadge`。而 `recorderBadge` 在 `app.js:299/426/476/607/732` 以及顶栏都在用 —— 说明组件存在，只是这一个出口漏了。
  - 实测正文字数 p0 = 322、p1 = 437；对两档案正文做正则 `代记|家属|女儿` → **均为 false**。
- **违反**：**K5** 明文「代记标记不可丢」。SPEC §13 K5 的验法写的就是"代记字段非空断言"；这条出口连字段都没有，断言无从谈起。
- **建议修法**：`buildVisitPrepSheet` 增加 `recorder` 与 `recorderLabel`，`.print-head` 渲染成"`王先生 · 腹膜后 · 去分化脂肪肉瘤 · 记录人：女儿（代记）`"；并加断言 `prep.recorder != null`。

### P0-4 「应接受康复评估」——指令式表述，且与同页自述直接矛盾

- **现象**：`心理与家庭 · 生育与亲密` 页，标题写着"出处（只列文件，不给建议）"的卡片里，第二行写"**…应接受康复评估**"。
- **证据**：
  - 代码：`app.js:913`
    ```
    ${row('NCCN 患者版 2025 p.27', '写明手术存在肢体/身体功能障碍风险，应接受康复评估', 'data-action="noop"')}
    ```
  - 同页 `app.js:905` 的 notice 原文：`这一页<b>不输出"你应当去保存生育力/做康复"</b>这类句子。`
    同一屏内，"不输出你应当去…做康复"与"应接受康复评估"并列。
  - 实测 `mind/3` 两档案正文均含 `应接受`，语境为**肯定式**（不是引用医生原话，是工作台自己在转述指南并给出行动要求）。
- **违反**：**K2**「不推荐不指令」——"应接受"与禁词表里的"建议手术/建议放疗"同级，是祈使语气；且它是**工作台自己的话**，不是"医生记录为"的引用，无法用"引用原文"豁免。
- **建议修法**：改为描述性转述，例如"`NCCN 患者版 2025 p.27：提到手术存在肢体/身体功能障碍风险，并讨论了康复评估（原文语气为建议性，此处仅记录该议题存在）`"；或干脆只保留"是否被医生提过康复评估"这一记录项。**同时把"应/应当/需/务必/建议你"纳入禁词正则**（见 §6：开发者 20 词表漏了这整类）。

### P0-5 折叠卡「副作用总结」把术后并发症错挂到第 2/3 线治疗下（事实错误，患者安全）

- **现象**：王先生档案（`systemic/0` 治疗线总览）有 3 条治疗线，展开任意一条，五块里的"副作用总结"**内容完全相同**，都是 2024-12-02 / 2025-01-08 两条**术后**记录；第 2 线（帕唑帕尼，2025-11-02 起）与第 3 线（临床试验，2026-07-15 起）时段内根本没有这两条记录。
- **证据**：
  - 代码：`app.js:569`
    ```
    const aelist = (p.local.find((l) => l.complications)?.complications || []).slice(0, 2);
    ```
    取"`p.local` 中**第一条**带 `complications` 的记录"的前 2 条，**完全未按 `line.dateStart/dateEnd` 过滤**。同一张卡的另外三块（指标和趋势 `app.js:565` 附近按日期过滤、影像发现、心理/营养）都过滤了 —— 只有副作用块漏了。
  - 实测（展开 p1 三条线）：
    - 第 1 线（2025-01-06 → 06-20）：`2024-12-02 伤口愈合良好，术后第 12 天出院。` + `2025-01-08 左下腹偶有牵拉痛，自述可忍。`
    - 第 2 线（2025-11-02 →）：**同上两条，逐字相同**
    - 第 3 线（2026-07-15 →）：**同上两条，逐字相同**
  - 反证：同卡"指标和趋势"块第 1 线只显示 1 条（CREA 118 / 2025-03-20），第 2/3 线显示 3 条（CREA 141 / ALT 58 / TSH 2.1 / 2026-09-10），说明过滤逻辑在别处是对的。
- **违反**：严格说不是 K1–K6 任一条的字面条文，但性质等同 **K4**（工作台代替医生做"某治疗线引起了什么反应"的**因果归因**），且直接误导患者把术后并发症记成靶向药/试验药的副作用。按"违反即 P0"的患者安全口径，计 P0。
- **建议修法**：`aelist` 改为从**该线上的局部记录**取，即 `p.local.filter(l => l.dateStart >= line.dateStart && (!line.dateEnd || l.dateStart <= line.dateEnd)).flatMap(l => l.complications || []).slice(0, 2)`；并为"本线无记录"给出明确文案`本阶段没有记录到不良反应`（该分支 `app.js:582` 已存在，只是永远走不到）。加断言：三条线的副作用数组两两不相等。

### P0-6 导出默认**包含**演示数据，违反 SPEC §4.2 硬性数据纪律，且与页面自述相反

- **现象**：`资料与导出 · 导出快照` 页顶部写"私密与演示数据默认排除"，但"排除演示数据（in_use=1）"复选框**默认未勾选**；默认点"生成"会导出一份含全部 30 条演示记录的快照。
- **证据**：
  - 代码：`app.js:88`
    ```
    // demoOff 默认 false：本原型里每条记录都 in_use=1，勾上会导出 0 条——
    // 那正好证明开关生效，但不能当默认值，否则演示看起来像坏了。
    exportOpts: { privateOn: false, demoOff: false, from: '2025-01-01', to: TODAY },
    ```
    注释本身承认了"为了让演示好看"而放弃默认排除。
  - 实测：`#exp-demo.checked === false`；`buildExportSnapshot(p0, {privateOn:false, demoOn: !demoOff})` → `counts = {pathologies:2, imaging:5, local:2, systemic:1, metrics:10, functionLog:6, visits:2, trials:2, viewpoint:0}`，**总计 30 条，全部 `in_use:1`**。
  - 页面自述（`app.js:958` 与 `app.js:983`）与其自身默认值矛盾：`导出的是"资料快照"，不是病历。私密与演示数据默认排除。` / `不含：私密记录（除勾选）、演示数据（除取消勾选）…`
- **违反**：**K5** 与 SPEC §4.2 原文「`in_use` 标记演示数据，**导出默认排除**」。这是"硬性数据纪律"，不是建议。
- **建议修法**：`exportOpts.demoOff` 默认 `true`；若担心"导出看起来是空的"，正确做法是给出空态说明（"本原型全部记录均为演示数据（in_use=1），因此默认导出为空——这是开关在起作用；取消勾选可导出 30 条用于演示"），而不是把默认值改反。**默认值必须由纪律决定，不能由演示观感决定。**

---

## 2. P1 问题（19 条）

### P1-1 全部交互动作零可见反馈：toast 被 `render()` 同步抹掉

- 代码：`act()` 每个分支都是 `showToast(...); return render();`；`showToast`（`app.js:1037`）往 `#app` 末尾插 `.toast`，而 `render()`（`app.js:1008-1010`）紧接着 `$('#app').innerHTML = ...` 整体重建，**同一个 tick 内 toast 被销毁**；`app.js:1027` 的 `if (state.toast) showToast(state.toast)` 因 `state.toast` 恒为 `null` 永不触发。
- 实测：对 `agent-draft / set-baseline / add-question / save-mood / do-export / trial-search / toggle-private / accept-cand` 共 8 个动作，点击后 t0 / +50ms / +450ms 查询 `document.querySelector('.toast')` **全部为 null**，`state.toast` 全部为 null。
- 影响：`S04/S06/S08/S09/S10/S13/S15/S16` 的"完成 Toast"与"失败恢复"提示全部不可见；IP4「回首页一步：完成 Toast 内嵌"回到看板"」中 `grep 回到看板` = **0 次命中**，该路径整体不存在。
- 修法：把 toast 挂到 `#app` 之外（如 `document.body`），或先 `render()` 再 `showToast()`，或把 toast 提升为 `state.toast` 由 `render()` 渲染。

### P1-2 除 UI 开关外，没有任何"写入"发生（产物全部缺失）

- 实测（点按钮后直接读 `window.DEMO`）：`accept-cand` → `candidates` 仍全部 `status:'pending'`、`pathologies.length` 仍 2；`add-question` → `visits.length` 仍 2；`save-mood` → textarea 值不变、私密条数仍 2；`set-baseline` → `imaging.filter(i=>i.baseline).map(i=>i.id)` 点击前后同为 `['im2','im3']`。
- 只有 3 个 UI 态动作真生效：`toggle-private`（遮罩解除）、`toggle-large`（`.shell` 加 `large`）、`open-glossary`（弹术语卡）。
- 影响：S01/S02/S04/S05/S06/S08/S09/S10/S13/S15/S16 的"产物（+1 条记录）"全部不可演示。

### P1-3 导出无任何产物、无结果回显（S16 失败恢复未兑现）

- `do-export` 后：`state.lastExport = {kind:'snapshot', filtered:2, items:30}`，但页面 `已排除` 正则 = false、`已生成` = false；`a[download]` = 0、blob 链接 = 0、`pre` = 0；`expect_download(timeout=2000)` 抛 `TimeoutError`。
- INTERACTION-DESIGN §二 S16 要求"私密未勾 → 默认排除并在结果页写明'已排除 N 条私密'"，**未实现**。

### P1-4 导出计数 pill 恒为 "约 0 / 33 条"（参数名不匹配）

- `app.js:960` 把 `state.exportOpts` 直接当 opts 传入 `exportable()`，而 `canLeave`（`app.js:108-112`）读的是 `opts.demoOn`；`exportOpts` 里只有 `demoOff`，没有 `demoOn` → `x.in_use && !opts.demoOn` 恒真 → 恒排除。
- 实测三种状态（默认 / 取消勾选演示数据 / 勾选私密）pill 均显示 `约 0 / 33 条`；而 `canLeave(one, exportOpts) = false`、`canLeave(one, {demoOn:true}) = true`。
- 同页"会包含什么"明细行却用未过滤的 `p.local.length` 等（`2 条局部 · 1 条全身` / `5 次影像` / `10 条数值`），与"约 0 / 33 条"自相矛盾。

### P1-5 导出日期范围不生效

- `#exp-from` / `#exp-to` **无任何监听器**（`bind()` 只绑了 `#exp-private` / `#exp-demo` / `#trial-status`）；`buildExportSnapshot` 也完全不使用 `opts.from/to`。
- 实测：填 `2026-01-01` 后 DOM value 变了但 `state.exportOpts.from` 仍 `'2025-01-01'`，再 `render()` 输入被丢弃回退；`buildExportSnapshot(pr,{from:'2026-01-01',to:'2026-01-31'})` 与 `{from:'2000-01-01'}` 返回条数同为 30。

### P1-6 "打印时全部展开"是假陈述（`@media print` 无法展开 `<details>`）

- 页面自述：`app.js:596` `打印时全部展开（@media print），一页拿到完整病程。`
- CSS 实际（`style.css:187-193`）：只做 `.phase-detail{display:grid !important}`、隐藏 `.ph-hint`、`break-inside:avoid`、`.phase-fold>summary{background:#fff}`；**`<details>` 的闭合状态由浏览器内部管理，CSS 无法展开**。
- 实测：`emulate_media('print')` 后闭合态 `.phase-detail` 计算 `display: grid`、`offsetHeight: 3121`，但 **`innerText.length = 0`**；`pdf(format='A4')` 产物仅 1 页 229 字符（展开态对比 772977 B vs 248723 B，差 3.1×）；PDF 抽文本对 `副作用总结 / 心理·营养 / 指标和趋势 / 影像发现 / 方案原文` 关键词**全部 false**。

### P1-7 基线唯一性被数据违反；"设为基线"按钮无效

- 页头 `app.js:448` 称"**全库最多一条激活基线**"，小注 `app.js:468` 称"库里同时只允许一条激活基线"，但实测 `baseline:1` 共 **4 条**：陈女士 `['肢体:2025-06-02','内脏:2025-06-02']`、王先生 `['腹膜后:2024-12-15','内脏:2024-12-15']`。
- `set-baseline` 只 `showToast`（`app.js:1069`），不改 `state`、不改数据（实测点击前后 id 列表一致）。
- 影响：S05 的验收判据"全库只有一条激活基线"未接住。

### P1-8 指标趋势跨单位合并（页头自述"跨单位不合并"被代码否定）

- 页头 `app.js:699` 与口径栏写"同一指标、同一单位才画线""跨单位不合并"；代码 `app.js:701-703` 只按 `m.name === pick` 过滤，**不看 unit**。
- 实测：注入一条 `血红蛋白 HGB / 11.6 / g/dL / 2025-10-20` 后，同图三个点 = `['08-29 108.00 g/L','09-18 116.00 g/L','10-20 11.60 g/L']`，即 g/L 与 g/dL 画进一条线 —— 单位差 10 倍，视觉上表现为"从 116 骤降到 11.6"。

### P1-9 淋巴水肿图同样跨测量位置/跨单位合并

- 页面自述 `app.js:653` 附近"只画同一测量位置、同一单位的数值。换位置或换单位不合并成一条线"，代码 `picked = nums`（该 domain 全部有值记录）**未按 `measure` / `unit` 分组**。
- 实测：注入 `左上臂周径（肘上 5 cm）/ 30.2 cm` 与 `右大腿周径（髌上 10 cm）/ 0.485 m` 后，图表标题仍为"右大腿周径（髌上 10 cm）"、副标"单位 cm"，但点集 = `['06-05 45.00 cm','07-10 47.20 cm','09-15 48.50 cm','10-01 30.20 cm','10-05 0.48 cm']` —— 混入了另一部位（上臂 30.2）与另一单位（0.48 m 被当作 0.48 cm 显示）。

### P1-10 私密计数三处不一致（看板重复计数）

- `app.js:276`：`privateCount(p.viewpoint) + p.viewpoint.filter(v => v.visibility === 'private' && v.domain === 'fertility').length` —— 把 `domain==='fertility'` 的私密条目**加了两遍**。
- 实测同一档案：看板"我的记录构成"显示 **3 条私密**，导出页"包含私密记录（当前 **2** 条）"，隐私页"**2** 条"。真实私密条数 = 2（vp1、vp2）。

### P1-11 空态缺失 / 把"无数据"渲染成"单点"（部分违反 K6）

- `p1 metrics/0`（王先生无任何血象指标）：整页正文仅 115 字符，只有页头 + 一条免责 notice，**无"还没有血象记录"空态**。
- `p.metrics=[]` 时趋势页渲染成：`0 个点 ·` + `只有一个点` + `单点不连线（doc 16）。再记一次就能看到走向。`+ `参考区间：这张单没印` —— **把"没有任何数据"说成"只有一个点"，且引用了一句不存在的 doc 16**。
- 影响：K6 的"通道失败不得显示空列表"精神在指标出口同样失守。

### P1-12 K6 药物获批状态字段全站不存在

- `grep -rn "获批\|NMPA\|核于\|verified_at\|approval" prototypes/v0.2/` → **0 命中**（唯一相关的是 `app.js:840` 支持资源页"未联系核实任何公益组织"，属公益项目不是药物）。
- SPEC §4.3 要求"药物获批状态 | NMPA 公开信息 | 2026-10-25 核一次 | 界面上标'核于 2026-10-25' | 标'未核实'"，`systemic/1`、`systemic/2` 两页对两档案均 **0** 处体现。
- 影响：K6 的"药物必须带来源与核实时点"在原型层面完全没有落地物可验。

### P1-13 试验 0 条时显示"结果 0 条"而非"未取回/未查过"（K6 直接违反）

- 页面小注 `app.js:841` 自己承诺"任一通道失败会显示'未取回'，**不会显示空列表冒充'没有试验'**"；但结果区 `app.js:844` 只有 `${filtered.length} 条 · 采集于 2026-10-25`。
- 实测（把 `statusText` 全改为"已结束" + 筛选"仅招募中"）：渲染出 `结果 / 0 条 · 采集于 2026-10-25` + 一片空白，**无任何"未取回/未查过/通道未配置"占位**。
- 另：`#trial-q` 无监听器，输入任意文本后 `state.trialsQuery` 不变；且该值恒为 `'滑膜肉瘤'`，在**王先生（去分化脂肪肉瘤·腹膜后）**档案下检索框照样显示"滑膜肉瘤"。

### P1-14 AI 候选卡硬编码，两档案完全相同且内容张冠李戴

- `app.js:1066-1071`：`items` 是三个字面量字符串——`'白细胞降到 2.8 那一次，下一次化疗还能按原计划打吗？'`、`'ALT 从 32 升到 78，需要调整方案吗？'`、`'右腿肿胀和放疗有关系吗？要不要做康复评估？'`
- 实测两档案 `agentDraft.items` **逐字相同**（`same: true`）；而王先生是**腹膜后**去分化脂肪肉瘤、无任何血象指标、"右腿"与"放疗"在其档案中不存在。`buildAgentContext(P())` 的返回值只被用来取 `viewpointFiltered`，items 与档案无关。
- 影响：S13「AI 把我想问的整理成条目候选」在代记档案下给出的是另一位患者的事实。

### P1-15 IP3 入口文案逐字一致基本未落地（16 条中仅 3 条命中）

- `grep` `app.js` 结果：`看这份报告写了什么` **0**、`拍一张检测报告` **0**、`看看分级和分期` **0**、`准备去别的医院` **0**、`把这次设为基线` **0**、`和上次对照看` **0**、`记这一周期` **0**、`准备这次要问的` **0**；仅 `看看基线是哪次` **1**、`准备下次复诊` **1**、`我拍一张化疗单` **1**。
- 看板实测无"最近一份病理""我的档案""下一步"三张卡（实际卡头为：`接下来` / `今天可以做的事` / `基线锚点` / `我的记录构成` / `术语卡`）。

### P1-16 图表 `aria-label` 用 `state.metricPick`，与实际指标无关

- `app.js:265`：`aria-label="${esc(state.metricPick)} 趋势"` —— 全局选中指标，不是本图指标。
- 实测：`p0__function__1`（淋巴水肿图）aria-label = **"白细胞计数 WBC 趋势"**；`p0__metrics__2` = "白细胞计数 WBC 趋势"；`p1__metrics__2` = "肌酐 CREA 趋势"。屏幕阅读器会把淋巴水肿读成血象。

### P1-17 `fertility` 条目 visibility 全为 `shared`，页面却标"私密"胶囊

- 实测 `fertility` 全部条目 `visibility:'shared'`（fe1/fe2/fe3/fep1），而 `app.js:907` 卡片头渲染 `pill('私密','violet')`。
- 影响：三出口过滤器按 `visibility==='private'` 判定，因此**生育与亲密记录会进入导出/AI/摘要**，与页面标签和 S15"生育与亲密（私密）"的意图相反。

### P1-18 单元测试在测自己写的一份实现，不是产品代码

- `test/demo-data.test.mjs:72-87` 自称验证"三出口过滤一致性"，实际文件内**自己重写了一个局部 `visible`**（第 77-78 行）并断言它，从未 import 或调用 `app.js` 的 `exportable` / `buildAgentContext` / `buildVisitPrepSheet`。
- `node --test test/*.mjs` = **14 pass / 0 fail** —— 全绿，但与被测代码无连接。
- 禁词测试（`test/demo-data.test.mjs:95-99`）用 20 词表扫 `JSON.stringify(D)`，**不扫 `app.js` 模板文案**，因此漏掉 P0-4 的"应接受"。

### P1-19 复查日历/看板时间逻辑错误："已安排的复诊 2025-12-18"已过去 10 个月仍标"下次复诊"

- `TODAY = '2026-10-25'`（`app.js:26`），但看板"接下来"卡与 `followup/0` 均显示 `下次复诊 · 2025-12-18 · 术后半年复查`，`v.planned = 1`。
- 同一页"距上次复查 肢体 13 个月"与"已安排的复诊"并列，患者无法判断哪个是未来。

---

## 3. P2 建议（9 条）

1. **情绪词 chip 是死交互**：`data-action="mood"` 无对应 case（`act()` 无 `'mood'` 分支），点击后 `aria-pressed` 不变、无任何反馈。实测"平稳"→点"很怕"仍为 `aria-pressed=false`。
2. **顶栏 hero 文案嵌套错误**：实测渲染为 `FNCLCC G2 · 报告写的分期：医生记录：IIIA 期（四肢） · 肢体 · 分期由医生给出，本工作台不计算。`（`报告写的分期：` 后面又接 `医生记录：`，语义重复；`app.js:283`）。
3. **淋巴水肿 y 轴刻度与数据同精度易误读**：轴标签 `44.6 / 46.8 / 48.9`（`num(v,1)`），与数据点 `45 / 47.2 / 48.5` 混在一起时，患者容易把轴标签读成一次测量值。
4. **LVEF 卡片自相矛盾**：正文写"参考 ≥50"，pill 却显示"无范围"（`inRef()` 的正则只认 `a–b` 区间，`≥50` 不匹配）。
5. **第 2 线状态自相矛盾**：`2025-11-02 · 进行中 · 已换线` 同一行并存（数据 `status='已换线'` 而 `dateEnd` 为空，模板 `${line.dateEnd ? … : ' · 进行中'}` 无条件补）。
6. **单条影像时对照页显示"约 — 个月"**：`viewImagingDiff` 用 `slice(-2)` 不校验长度，`monthsBetween(undefined, date)` 返回 `'—'`，渲染成"约 — 个月"而非"还没有可对照的记录"（S06 失败恢复要求）。
7. **支持资源页有弱指令**："`医院康复科 / 营养科 · 术后功能与进食问题，可挂号评估`"（`app.js:899`）——"可挂号评估"接近行动建议，建议改为"这类问题通常由…科室承接（仅列渠道，不构成建议）"。
8. **`window.__SARCO_PAL__` / `window.DEMO` 暴露面**：任何脚本可直读全部私密原文（`window.DEMO.profiles[0].viewpoint` 含 2 条 private）。原型无后端时无法根治，但建议在 `__SARCO_PAL__` 上不要挂 `state` 的可变引用，或对 `DEMO` 的私密条目做只读脱敏代理，以免把"可绕过"固化成产品形态。
9. **`export-prep`（生成一页纸）按钮存在但只在 `followup/2`**：`data-action="export-prep"` 实测在 33 页中仅 `就诊准备` 页 1 处；此前按页扫描时在其他页 `found:false`，建议确认这是设计意图而非遗漏。

---

## 4. 红线逐条判定

| 红线 | 判定 | 证据（可复现） |
| --- | --- | --- |
| **K1 不判读**（不判影像良恶性/进展、不判病理亚型、不判分期分级、不做 RECIST 结论） | **通过** | ① 全库无 `diagnosis / risk_level / recist / response / progression` 字段（记录级字段清点仅 `visibility` + `in_use` 两个元字段）。② 自建 80 词宽表跨 66 页扫，"好转/恶化/良恶性/疾病进展"仅出现在**否定或释义语境**：`不写'进展/稳定/好转'`、`不解释"这意味着好转还是恶化"`、`不是良恶性结论`、CR/PR/SD/PD 词表释义。③ 影像页只照录 report 原文 + 词表，`monthsBetween` 只给月数。④ 分级与部位页无"你属于哪期"。 |
| **K2 不推荐不指令** | **不通过** | P0-4：`app.js:913` "`应接受康复评估`"（肯定祈使）。P2-7：`app.js:899` "`可挂号评估`"（弱指令）。其余"建议/可以考虑"命中均为**医生原话或报告原文引用**（`demo-data.js:91/96/242/649/655`），按 CLINICAL-DATA 允许词规则可豁免。 |
| **K3 不预后** | **通过** | 无生存率、无复发概率、无风险高低分级；`高危` 仅出现在医生原话引用 `医生记录为「高危因素，建议辅助化疗」` 中；随访页明确 `这不是"逾期提醒"：工作台不判断该不该复查`。 |
| **K4 医生任务不冒充患者需求**（FNCLCC 算分器 / AJCC 分期器 / 切缘判读器 = 一票否决） | **通过**（专项穷举见下） | 见下方"K4 专项"。**注意**：P0-5 折叠卡副作用错挂属归因错误，不构成 K4 功能，但性质相邻，已在 P0 单列。 |
| **K5 数据主权与代记** | **不通过** | P0-1（私密正文预填）、P0-2（跨档案解锁残留）、P0-3（一页纸无代记）、P0-6（导出默认含演示数据）；P1-10（私密计数不一致）、P1-17（fertility 实为 shared）、P1-18（测试未测产品函数）。三出口**函数**确实存在（`buildExportSnapshot`/`buildAgentContext`/`buildVisitPrepSheet`，`app.js:116/134/147`），但**口径不一致**：只有导出走 `canLeave()` 判 `in_use`，AI 上下文与一页纸只走 `visible()` 判 `private`。 |
| **K6 未核实必须显形** | **不通过** | P1-12（药物获批状态字段全站 0 命中）、P1-13（试验 0 条显示"结果 0 条"而非"未取回/未查过"）、P1-11（指标无空态）。**部分合规**：试验通道卡本身带"通道 · 采集于 fetchedAt"，`未查过`/`未取回` 状态在有条目时正确渲染，小注"标'未配置'的通道就是真的没查过"存在。 |

### K4 专项（按要求苛刻，三轮穷举）

1. **算分器入口普查**：全站 `input/select/textarea` 实测仅 8 个 —— `#trial-q`、`#trial-site`、`#trial-status`、`#mood-text`、`#exp-from`、`#exp-to`、`#exp-private`、`#exp-demo`。**无任何数字输入框** → 无"填分化/核分裂/坏死 → 出 G 分级"的界面可能。
2. **关键词全仓 grep**：`FNCLCC|AJCC|pTNM|分期组|切缘` 命中处逐个判定，**全部为展示或释义**：
   - `app.js:377`：`FNCLCC 三要素（仅说明口径，本工作台不计算）：分化 + 核分裂数 + 坏死，三项加总 2–3 = G1、4–5 = G2、6–8 = G3。` —— 纯文字、无输入、无输出个体结论、且显式声明"本工作台不计算"。
   - `app.js:370`：分级 ≠ 分期 notice（固定提示，符合 S03 要求）。
   - `app.js:392/393`：报告里 `pTNM` / `Histologic Grade` **字段名**释义（"报告里可能带 pTNM；临床分期由医生另行记录"）。
   - `app.js:544`：切缘只照录 `marginText`；`app.js:539` 切缘页自述"不判断是否感染、不评级"。
3. **代码路径检查**：无任何函数以"分级/分期/margin"为输入返回判定值；`viewGradeStage`（`app.js:372-402`）只渲染数据。
- **结论：K4 未触发，判定通过。** 这是本评审唯一"刻意去找但确实找不到"的方向，如实记录。

---

## 5. 场景逐条判定（S01–S16）

| ID | 场景 | 入口位置（实测） | 判定 | 依据 |
| --- | --- | --- | --- | --- |
| S01 | 病理报告看不懂 | 我的亚型 · 病理原文（`subtype/0`）；**看板无"最近一份病理"卡** | **部分** | 两卡四段（亚型/分级/部位/深浅/切缘）+ 出处齐全；但入口文案与 INTERACTION-DESIGN 不一致（`看这份报告写了什么` grep=0），"卡背面是位置解释"未实现为可翻面。 |
| S02 | 分子/免疫组化缩写 | 我的亚型 · 分子与免疫组化（`subtype/2`） | **部分** | IHC 5 项 + 分子 2 项 + 中性说明 ✓；但文档要求 4 字段（检测名称/结果/**方法**/**报告原文**），实测 IHC 表仅 3 列（检测项/结果/这条在测什么），无"报告原文"列。 |
| S03 | 分级与分期被自己混算 | 我的亚型 · 分级与部位（`subtype/1`） | **接住** | 左右两栏 + 中间固定提示"分级是显微镜下的恶性程度，分期是病变范围，两者不能互相换算" + 额外"本工作台不计算"说明；无输入无计算。 |
| S04 | 想去另一家医院会诊 | 我的亚型 · 会诊与二次意见（`subtype/3`）；**看板无"下一步"卡** | **部分** | 两家医院原文并列 ✓、要带资料 5 项 ✓、会诊可问 3 条 ✓；"把这些加进问题清单"按钮无产物（不写回 `visits`）。 |
| S05 | 不知道哪次是基线 | 影像与基线 · 基线锚点（`imaging/0`） | **未接住** | `设为基线`/`改换基线` 按钮点击无效（数据不变、无 toast）；且"全库只有一条激活基线"被数据违反（实测 4 条）。 |
| S06 | 新影像想和上次对照 | 影像与基线 · 报告原文对照（`imaging/2`）；**看板"最近影像"行不可直接进对照** | **接住**（有瑕疵） | 两段原文并列 + `约 3 个月` + 词表 ✓；单条记录时显示"约 — 个月"（P2-6）。 |
| S07 | 手术切缘与伤口问题 | 局部治疗 · 手术记录（`local/0`）+ 切缘与并发症（`local/2`） | **接住** | 术式/切缘（R0，报告原文）/出处分列；并发症 4 条各带"来自：具体治疗"，且明确"不判断是否感染、不评级"。 |
| S08 | 放疗期间皮肤反应与疲劳 | 局部治疗 · 放疗疗程（`local/1`）+ 功能与康复 · 伤口与皮肤（`function/2`） | **接住** | 60 Gy / 30 次照录；皮肤反应 4 条按时间；"拍照可选"未实现（无 file input），但记录路径通。 |
| S09 | 化疗周期与血象低 | 全身治疗 · 周期与用药（`systemic/1`）+ 指标与报告 · 血象（`metrics/0`） | **部分** | p0 完整（6 周期表 + WBC/ANC/HGB 三卡，数值/参考/日期/出处齐全）；**p1 血象页零内容且无空态**（P1-11）。 |
| S10 | 换线：为什么换、换成什么 | 全身治疗 · 换线记录（`systemic/2`） | **部分** | 三条线 + `医生原话` blockquote + "只存'进展/不耐受'这类判定词，等于把医生的话改写成了结论" ✓；第 2 线状态"进行中 · 已换线"自相矛盾（P2-5）。 |
| S11 | 腿肿、走不远 | 功能与康复 · 淋巴水肿（`function/1`）+ 肢体功能（`function/0`） | **部分** | 45 / 47.2 / 48.5 cm + `右大腿周径（髌上 10 cm）` + 患侧 + 日期 ✓；但图表跨测量位置/跨单位合并（P1-9），y 轴刻度易误读（P2-3）。 |
| S12 | 肝肾功能指标异常 | 指标与报告 · 肝肾与心肌（`metrics/1`）+ 趋势对照（`metrics/2`） | **部分** | ALT 32→78 / LVEF 62 / CREA 141 均带参考与出处 ✓；**趋势图跨单位合并**（实测 g/L 与 g/dL 同线，P1-8），与页头自述矛盾。 |
| S13 | 复诊前不知道问什么 | 复诊与随访 · 待办与问题（`followup/1`）；看板有"准备下次复诊"按钮 | **部分** | 清单 2 条 + "AI 只把你说的话整理成条目候选" ✓；但"加一条问题"不写回、toast 不可见、AI 候选硬编码且张冠李戴（P1-1/P1-2/P1-14）。 |
| S14 | 找临床试验 | 试验与线索 · 检索入口（`trials/0`） | **部分** | 结果卡带登记号/期别/地点/状态/`通道 · 采集于 2026-10-25` ✓，`未查过`/`未取回` 状态正确渲染 ✓；但 0 条时无"未取回/未查过"占位（P1-13），检索框无监听且值恒为"滑膜肉瘤"。 |
| S15 | 害怕复发、家里撑不住、生育 | 心理与家庭 · 当下感受/私密记录/支持资源/生育与亲密（`mind/0-3`） | **未接住** | 遮罩机制本身 ✓（`mind/1` 遮挡正确）；但私密正文被预填进 `mind/0` 输入框（P0-1）、跨档案解锁残留（P0-2）、fertility 实为 `shared` 却标私密（P1-17）。 |
| S16 | 把资料整理给医生 | 资料与导出 · 导出快照（`records/2`） | **未接住** | 按钮存在；但无产物、无"已排除 N 条"回显、计数恒 0、日期范围无效、默认含演示数据（P0-6 / P1-3~P1-5）。 |

**统计**：接住 **4**（S03/S06/S07/S08）／部分 **9**（S01/S02/S04/S09/S10/S11/S12/S13/S14）／未接住 **3**（S05/S15/S16）。

---

## 6. 开发者自评与实际不符之处

> 以下逐条点名 `docs/HVT-REVIEW.md` 与 `docs/HVT-PROTOTYPE-WALKTHROUGH.md` 的说法，并给出推翻它的实测。

| 开发者说法（出处） | 实测 | 判定 |
| --- | --- | --- |
| "X4 … 三档宽度（1440/1080/860）溢出 0；页脚贴底 true"（HVT-REVIEW.md:135、HVT-PROTOTYPE-WALKTHROUGH.md:18-19） | 1440 宽 `overflowX` 全 0（66/66）、页脚贴底 true（66/66） | **成立，予以确认** |
| "0 未捕获异常 / 0 console error / 0 失败请求"（两文档 X0） | 真实路径下 `console: []`、`pageerror: 0`、`requestfailed: 0` | **成立，予以确认**（注：在 `/tmp` 冻结副本下曾出现 85 条 `ERR_FILE_NOT_FOUND`，因相对路径 `../../assets/` 失效，属快照路径问题，非原型缺陷） |
| "禁词 0 命中（K1–K4，20 个词）"（HVT-PROTOTYPE-WALKTHROUGH.md:21） | 20 词表**覆盖不到**"应/应当/需/建议你/可挂号"这一整类指令式表达；且 `test/demo-data.test.mjs:95-99` 的禁词测试只扫 `JSON.stringify(D)`，**不扫描 app.js 模板文案**，因此 `app.js:913` 的"应接受康复评估"从未进入扫描范围 | **不成立**（漏检，直接导致 P0-4 被自评判为通过） |
| "三出口过滤函数在 app.js 顶部单点实现；**单测覆盖 default/explicit 两态**"（HVT-REVIEW.md:57、HVT-8） | `exportable` 定义 1 处、调用 4 处；但 `test/demo-data.test.mjs:72-87` **自己重写了一份 `visible`** 测自己，从未调用 `exportable` / `buildAgentContext` / `buildVisitPrepSheet`。`node --test` 14 pass 与此无关 | **不成立**（"单测覆盖"不存在） |
| "三出口…导出/AI/摘要 都过滤"（`app.js:985-987` 页面自述） | 只有导出走 `canLeave()` 判 `in_use`；`buildAgentContext`（`app.js:140-142`）与 `buildVisitPrepSheet`（`app.js:154`）只走 `visible()` 判 `private`，**不过滤 `in_use`**。实测同一档案：`prep.lines = 3`（全 `in_use:1`）而 `snap.systemic = 0` | **部分不成立**（口径不一致） |
| "折叠卡五块顺序由走查断言（两档案 4 张卡）"（HVT-REVIEW.md:52） | 卡数 **4 张 ✓**（p0 systemic/0 共 1 张、p1 共 3 张）；默认展开数 **0 ✓**（66 页 `<details>` open 计数 = 0）；五块顺序 **✓**（方案/指标和趋势/影像发现/副作用总结/心理·营养措施和效果） | 顺序与卡数成立；但**未验内容归属** → 漏掉 P0-5（三条线副作用完全相同） |
| "`打印时全部展开（@media print），一页拿到完整病程`"（`app.js:596` 自述；HVT §8 自认未做打印验证） | CSS 无法展开 `<details>`；PDF 抽文本对五块关键词全 false；展开/收起 PDF 体积差 3.1× | **假陈述**（P1-6） |
| "X1 … 穷举 visited=33；孤儿页 0"（HVT-REVIEW.md:132） | 页数 11 一级 / 32 二级 = 33 ✓（`totalSub=32`、`navs=11`） | 页数成立；但"点到过"≠"接住"——S05/S15/S16 点进去是坏的，"孤儿页 0"不能作为质量证据 |
| "X2 6 条入口文案逐字一致"（HVT-REVIEW.md:133、HVT-PROTOTYPE-WALKTHROUGH.md §三） | 我 grep 得 3 条命中（`看看基线是哪次`/`准备下次复诊`/`我拍一张化疗单`）；而表中 S02 一行拿"「我拍一张免疫组化报告」"对文档，文档 INTERACTION-DESIGN 要的是"「拍一张检测报告」"——**这条"一致"是拿原型对原型，不是对文档** | 抽验本身有效，但**抽样偏向已命中的 3 条**，且其中 1 条比对基准错误；全量 16 条实测仅 3 条命中（P1-15） |
| "无空页（正文 <40 字 或 含'尚未实现'）= 0"（HVT-PROTOTYPE-WALKTHROUGH.md:15） | 判据过松：`p1__metrics__0` 正文 115 字但**零业务内容**（只有页头 + 免责 notice），按"有无空态"标准属事实空页 | 判据不成立（P1-11） |
| "全仓 grep『50 余种』= 0"（HVT-REVIEW.md:88） | `grep -rn "50 余种\|50余种\|50+" prototypes/` = **0** | **成立，予以确认** |
| "grep『不可恢复』= 0"（HVT-REVIEW.md:134） | `grep -rn "不可恢复" prototypes/` = **0** | **成立，予以确认** |
| "IP4 回首页一步：完成 Toast 内嵌『回到看板』"（INTERACTION-DESIGN §一） | `grep -c "回到看板" app.js` = **0** | 不存在（并因 P1-1，toast 本身也不可见） |
| HVT-8 "家属代记，患者本人不想让家人看到情绪记录 → private 属性 + 三出口过滤" 自评达成度 2/2/2 | 一页纸无代记字段（P0-3）；跨档案解锁残留（P0-2）；fertility 实为 shared（P1-17） | **不成立**（该场景恰是 P0 最密集处） |

### 6.1 本轮**未**验证的项（如实列出，不作为任何"通过"依据）

| 项 | 为什么没验 | 建议谁补 |
| --- | --- | --- |
| 真机（iOS/Android Safari）渲染与字号 | 无真机，仅 Chromium 1440×1000 | 用户/QA |
| 屏幕阅读器（VoiceOver/NVDA）实际播报 | 只验了 `aria-label` 文本内容（并发现 P1-16），未做 AT 实听 | 无障碍专项 |
| 键盘 Tab 序 / 焦点环 / 焦点陷阱 | 只验证了 `document.activeElement?.blur?.()` 存在，未逐页跑 Tab | 无障碍专项 |
| 大字模式（`state.large`）下的排版复跑 | 仅验证 class 切换生效，未重新跑 66 页布局测量 | 开发自测 |
| 1080 / 860 宽度 | 本轮只跑 1440；开发者脚本声称三档 0 溢出，我未复跑 | 开发自测（我采信其 `verify-prototype.py` 输出，已在 §7.12 记录） |
| 真实数据接入后的行为 | 原型为 `window.DEMO` 全内存，无存储层 | M3+ |
| 色彩对比度（WCAG AA） | 未做像素级测量 | 无障碍专项 |
| 截图逐页目视 | 模型不支持图片输入（见文首声明） | 有图像能力的评审员 |

---

## 7. 我实际执行过的命令与关键输出

### 7.1 环境与版本

```
$ python3 -m playwright --version
Version 1.58.0
$ shasum -a 256 prototypes/v0.2/*
36ea4138…  prototypes/v0.2/app.js          (1095 行)
58d8a2e4…  prototypes/v0.2/demo-data.js
ff987b57…  prototypes/v0.2/style.css
ee032804…  prototypes/v0.2/index.html
$ wc -l prototypes/v0.2/app.js
    1095 prototypes/v0.2/app.js
```

### 7.2 全量 66 页扫描（`/tmp/sweep_real.py`）

- 11 一级 ×（32 二级 / dashboard）→ 33 组合 × 2 档案 = **66 页**，每页全页截图 → `/tmp/review-shots/{p0|p1}__{view}__{sub}.png`（实测 `ls | wc -l` = **66**），结构化结果 → `/tmp/sweep-real.json`。
- 关键输出：
  ```
  totalSub : 32
  navs     : ["dashboard","subtype","imaging","local","systemic","function","metrics","followup","trials","mind","records"]
  console  : []        requestfailed : []
  sha_before == sha_after → stable : true
  ov(overflowX) 分布 = [0]（全 0）
  det 全库 open 计数 = 0（折叠卡默认全收起 ✓）
  charts 非空 = p0__function__1、p0__metrics__2、p1__metrics__2
  ```

### 7.3 P0-1 私密预填（真跑）

```
$ python3  # Playwright evaluate
state.showPrivate=false → 打开 mind/0
#mood-text.value = '医生提过化疗可能影响生育，我想问清楚但不知道怎么开口。'
hasPrivateText = True
该档案 private viewpoint = ['每次复查前一周都睡不好，总担心片子有问题。',
                          '医生提过化疗可能影响生育，我想问清楚但不知道怎么开口。']
p1: #mood-text.value = '第三次住院了，不知道还能撑几轮，家里人都瞒着他说。'
mind/1 同状态下：hasMasked=True, hasPlainText=False
```

### 7.4 P0-2 跨档案泄露（真点 UI）

```
陈女士 mind/1 → click [data-action="toggle-private"] → state.showPrivate = True
click .profile-item[1] → state = {profile:1, view:'mind', sub:0, showPrivate:True}
click 二级页签「私密记录」→ 页面正文：
  2026-09-12 · 累
  「第三次住院了，不知道还能撑几轮，家里人都瞒着他说。」
  情绪与家庭 · 家属代记   私密
```

### 7.5 P0-3 代记字段

```
prepKeys = [kind,name,site,subtype,grade,stageText,baseline,lines,questions,viewpoint,viewpointFiltered]
prepHasRecorder = False   (两档案)
visit prep 正文正则 /代记|家属|女儿/ → False   (p0 len=322, p1 len=437)
```

### 7.6 P0-5 副作用错挂

```
p1 三条线展开 → "副作用总结" 块内容两两相同：
  2024-12-02 伤口愈合良好，术后第 12 天出院。
  2025-01-08 左下腹偶有牵拉痛，自述可忍。
同卡"指标和趋势"：第1线 1 条(CREA 118/2025-03-20)；第2/3线 3 条(CREA 141/ALT 58/TSH 2.1/2026-09-10)
代码：app.js:569  p.local.find(l => l.complications)?.complications.slice(0,2)   ← 无日期过滤
```

### 7.7 P0-6 导出默认含演示数据

```
#exp-demo.checked = False            # 默认未勾"排除演示数据"
state.exportOpts = {privateOn:False, demoOff:False, from:'2025-01-01', to:'2026-10-25'}
buildExportSnapshot(p0,{privateOn:False,demoOn:!demoOff}) → counts 合计 30 条（全部 in_use:1）
代码 app.js:88 注释：「demoOff 默认 false：…不能当默认值，否则演示看起来像坏了。」
```

### 7.8 三出口一致性

```
p0: prepLines=1  snap(demoOff)=0  snap(demoOn)=30  ctx=20  ctxViewpoint=0  prepViewpoint=0
p1: prepLines=3  snap(demoOff)=0  snap(demoOn)=29  ctx=22  ctxViewpoint=0  prepViewpoint=0
→ 一页纸不过滤 in_use；AI/摘要无"放开私密"开关 ✓（该部分合规）
in_use 记录级普查：两档案 38 + 35 条，visibility 与 in_use 字段 0 缺失 ✓
fertility visibility = ['shared','shared','shared'] / ['shared']  ← 与页面"私密"pill 不符
```

### 7.9 打印与导出产物

```
emulate_media('print') → .phase-detail display=grid, offsetHeight=3121, innerText.length=0
pdf(A4): 收起态 248723 B / 展开态 772977 B（3.1×）
PDF 文本关键词：方案原文/计划 6 周期/副作用总结/心理·营养/指标和趋势/影像发现 → 全 False
expect_download(2000ms) → playwright._impl._errors.TimeoutError
a[download] = 0    blob = 0    pre = 0
do-export 后 state.lastExport={kind:'snapshot',filtered:2,items:30}；页面 /已排除/ = False
```

### 7.10 动作哑火实测

```
8 个动作（agent-draft/set-baseline/add-question/save-mood/do-export/trial-search/toggle-private/accept-cand）
点击后 t0 / +50ms / +450ms：document.querySelector('.toast') 全为 null；state.toast 全为 null
accept-cand → candidates 仍全 pending；add-question → visits.length 仍 2
set-baseline → imaging.filter(baseline).map(id) 前后同为 ['im2','im3']
#trial-q 输入 'ZZZZ' → state.trialsQuery 仍 '滑膜肉瘤'
#exp-from 填 '2026-01-01' → state.exportOpts.from 仍 '2025-01-01'；render() 后 DOM 回退
```

### 7.11 禁词宽表扫描（自建 ~80 词，跨 66 页 DOM）

```
命中词：高危 / 应当去 / 应接受 / 恶性 / 转移 / 进展 / 复发 / 预后
语境判定：
  应接受      → p0/p1 mind/3 肯定语境                     → P0-4
  应当去      → mind/3 否定语境（"不输出…这类句子"）      → 豁免
  高危        → systemic/1,2 医生原话引用                 → 豁免
  恶性        → glossary/subtype/imaging 释义与否定         → 豁免
  进展/好转/恶化/良恶性 → 否定与词表释义                    → 豁免
  复发/转移   → 报告原文/医生原话/描述性                    → 豁免
  预后        → records/2 "不含…预后" 否定语境              → 豁免
→ UI 自身文案硬禁词命中 = 1 处（应接受）
```

### 7.12 开发者脚本与测试

```
$ python3 scripts/verify-prototype.py   → EXIT=0
  ok / l1 / l2 / empties / foldout / wording / widths / hiddenRule
  consoleErrors=[] pageErrors=[] failedRequests=[] fontRangeOk=true
  → 脚本自检通过与本次发现并不矛盾：它检查的是"页数/溢出/toast 不存在/20 词禁词"，
    不检查私密预填、跨档案状态、代记字段、in_use 默认值、副作用归属。
$ node --test test/*.mjs  → 14 pass / 0 fail（但 test/demo-data.test.mjs:72-87 自测自写的 visible）
```

### 7.13 K4 专项穷举

```
输入控件普查：仅 8 个（trial-q/trial-site/trial-status/mood-text/exp-from/exp-to/exp-private/exp-demo）
             → 无任何数字输入
grep "FNCLCC|AJCC|pTNM|切缘" app.js → 命中点全部为展示/释义，且 app.js:377 显式"本工作台不计算"
→ K4 未触发
```

### 7.14 `docs/PROTOTYPE-REVIEW.md` 状态

该文件当前仍是 starter 的**空模板**（17 行，标题"HTML交互原型确认记录"，正文为"状态：待制作/预览/用户确认。未填入真实依据前不可标已确认。"及一张待填的确认表）。本报告**未改动它**——按评审约定，它是用户在 G2 闸口签字时填写的确认记录，不由评审员覆盖。本评审报告独立存放于 `docs/PROTOTYPE-INDEPENDENT-REVIEW.md`。

---

## 附：P0 修复优先级建议

1. **先修 P0-1 / P0-2 / P0-6**（私密与演示数据主权）—— 三条都在 `state` 初始化与 `render()` 的十几行范围内，改动小、风险低、收益最大。
2. **再修 P0-3 / P0-4**（代记字段 + 一句文案）—— 前者加 2 个字段，后者改 1 句话，但都是红线明文条款。
3. **P0-5 需要先决定产品语义**：副作用到底归属"治疗线"还是"局部治疗事件"？若归属局部治疗，则折叠卡应改为"本阶段相关事件"并按日期区间过滤；若归属治疗线，则需在数据层补 `lineRef`。
4. 修完 P0 后，**P1-1（toast）必须一并修**，否则任何修复都无法在演示中被观察到。

P0 计数：6
