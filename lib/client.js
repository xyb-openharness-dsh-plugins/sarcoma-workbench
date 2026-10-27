window.__ModuleLoader__.load({
  id: "@xyb-community/sarcoma-workbench",
  factory(require) {
    const UI_ENTRY = '/api/sarcoma/ui/'
    const React = require('react')
    const h = React.createElement
    const metadata = {"title":"软组织肉瘤工作台","description":"软组织肉瘤（STS）患者与照护者的本机病程资料工作台：把散落的病理与分型、手术与切缘记录、治疗线序与副作用、复查影像与功能变化整理成可核对、可回溯的材料，并整理成就诊能带着走的问题清单。"}
    const theme = "/* Scope to business content; never style host navigation globally. */\n.wb-sarcoma {\n  --wb-paper: #f7faf8; --wb-surface: #ffffff; --wb-ink: #34413c;\n  --wb-muted: #596c62; --wb-line: #dce7df; --wb-mint: #e2f2ea;\n  --wb-mint-ink: #22664e; --wb-action: #b95023; --wb-action-ink: #ffffff;\n  --wb-pink: #f8e8eb; --wb-blue: #eaf1f6; --wb-yellow: #faf2d8;\n  --wb-radius: 18px; --wb-gap: 16px; --wb-group-gap: 24px;\n  color: var(--wb-ink); background: var(--wb-paper); font: 16px/1.65 -apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n  font-variant-numeric: tabular-nums; min-width: 0; min-height: 0; container-type: inline-size;\n}\n.wb-sarcoma[data-font=large] { font-size: 19px; }\n.wb-sarcoma * { box-sizing: border-box; }\n.wb-sarcoma button,.wb-sarcoma input,.wb-sarcoma select { font: inherit; }\n.wb-sarcoma button { min-height: 44px; cursor: pointer; }\n.wb-sarcoma :focus-visible { outline: 3px solid var(--wb-mint-ink); outline-offset: 3px; }\n.wb-sarcoma .wb-primary { background: var(--wb-action); color: var(--wb-action-ink); border: 0; border-radius: 999px; padding: 9px 20px; }\n.wb-sarcoma .wb-flower { display: inline-block; width: 24px; height: 24px; flex: 0 0 auto; margin-inline-end: 10px; animation: wb-flower-turn 12s linear infinite; }\n@keyframes wb-flower-turn { to { transform: rotate(360deg); } }\n@media (prefers-color-scheme: dark) {\n  .wb-sarcoma { --wb-paper:#17231f; --wb-surface:#20322a; --wb-ink:#edf5ef; --wb-muted:#c0d2c6; --wb-line:#496354; --wb-mint:#294f3f; --wb-mint-ink:#a0ddbd; --wb-action:#f3a578; --wb-action-ink:#39200e; --wb-pink:#45333a; --wb-blue:#283d4c; --wb-yellow:#473e25; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .wb-sarcoma .wb-flower { animation:none; }\n}\n"
    /* 36 号 §2.6 / §2.1：装机层（模块客户端）样式。四段浮窗是整页视图，不是弹窗。 */
    const primerCss = `
.wb-sarcoma .wb-status { display:flex; flex-direction:column; gap:6px; background:var(--wb-surface); border:1px solid var(--wb-line); border-radius:var(--wb-radius); padding:16px 18px; }
.wb-sarcoma .wb-status-eyebrow { margin:0; font-size:12px; letter-spacing:.04em; font-weight:600; color:var(--wb-mint-ink); }
.wb-sarcoma .wb-status-day { margin:0; display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }
.wb-sarcoma .wb-status-day b { font-size:28px; line-height:1.15; color:var(--wb-mint-ink); }
.wb-sarcoma .wb-status-anchor, .wb-sarcoma .wb-note { font-size:12px; color:var(--wb-muted); }
.wb-sarcoma .wb-status-now { margin:0; display:flex; gap:8px; flex-wrap:wrap; font-size:14px; }
.wb-sarcoma .wb-status-state, .wb-sarcoma .wb-status-next { color:var(--wb-muted); }
.wb-sarcoma .wb-status-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:2px; }
.wb-sarcoma .wb-dp-overlay { position:fixed; inset:0; z-index:90; display:flex; background:rgba(18,32,26,.42); }
.wb-sarcoma .wb-dp-panel { position:absolute; inset:12px; display:flex; flex-direction:column; background:var(--wb-paper); border:1px solid var(--wb-line); border-radius:16px; overflow:hidden; }
.wb-sarcoma .wb-dp-head { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:10px 14px; background:var(--wb-surface); border-bottom:1px solid var(--wb-line); }
.wb-sarcoma .wb-dp-head strong { font-size:17px; }
.wb-sarcoma .wb-dp-head .wb-grow { flex:1 1 auto; min-width:0; }
.wb-sarcoma .wb-dp-body { flex:1 1 auto; overflow:auto; padding:22px 18px 60px; }
.wb-sarcoma .wb-dp-inner { max-width:980px; margin:0 auto; }
.wb-sarcoma .wb-dp-section { margin:0 0 30px; }
.wb-sarcoma .wb-dp-section h3 { margin:0 0 8px; font-size:21px; }
.wb-sarcoma .wb-dp-lead { margin:0 0 10px; }
.wb-sarcoma .wb-dp-points { margin:0 0 10px; padding-left:0; list-style:none; }
.wb-sarcoma .wb-dp-points li { position:relative; padding-left:18px; margin-bottom:5px; }
.wb-sarcoma .wb-dp-points li::before { content:""; position:absolute; left:6px; top:.72em; width:5px; height:5px; border-radius:50%; background:var(--wb-muted); }
.wb-sarcoma .wb-dp-group { margin:0 0 12px; }
.wb-sarcoma .wb-dp-group h4 { margin:0 0 5px; font-size:16px; }
.wb-sarcoma .wb-dp-table-wrap { overflow-x:auto; margin:6px 0 12px; }
.wb-sarcoma .wb-dp-table { width:100%; min-width:640px; border-collapse:collapse; font-size:14px; }
.wb-sarcoma .wb-dp-table th, .wb-sarcoma .wb-dp-table td { border:1px solid var(--wb-line); padding:7px 9px; text-align:left; vertical-align:top; }
.wb-sarcoma .wb-dp-table th { background:var(--wb-mint); }
.wb-sarcoma .wb-dp-src { margin:6px 0 0; font-size:12.5px; color:var(--wb-muted); }
.wb-sarcoma .wb-dp-link { color:inherit; font-weight:600; text-decoration:underline; text-underline-offset:3px; }
.wb-sarcoma .wb-dp-miss { color:#b3372e; font-weight:600; }
.wb-sarcoma .wb-dp-close { border:1px solid var(--wb-line); background:var(--wb-surface); border-radius:10px; padding:6px 12px; }
.wb-sarcoma .wb-dp-back { border:1px solid var(--wb-line); background:var(--wb-surface); border-radius:10px; padding:6px 12px; }
`

    /* 36 号 §2.1 四段数据：与 prototypes/v0.2/primer-data.js 同源（装机层模块加载器不保证相对 require，故内联）。
       链接口径同 §2.5：entry=官方入口（需自行注册），nolink 必须带 note；不编 URL。 */
    const PRIMER = {
      brand: '小韧宝 SarcPal',
      name: '软组织肉瘤',
      en: 'Soft Tissue Sarcoma（STS）',
      updated: '2026-10-27',
      sections: [
        {
          id: 'definition',
          title: '定义',
          intro: '软组织肉瘤不是一种病，而是一组起源于间叶组织（脂肪、肌肉、纤维、血管、神经鞘等）的恶性肿瘤的统称。同样大小、同样部位的两个肉瘤，可能是完全不同的两种病——分型看的是病理，不是长在哪里。',
          points: [
            '世界卫生组织（WHO）《软组织与骨肿瘤分类》第 5 版（2020）按分化方向分类：脂肪细胞性、成纤维细胞性与肌纤维母细胞性、血管性与周细胞性、平滑肌、骨骼肌、胃肠道间质、神经鞘、未确定分化等大类。',
            '病理报告上的「亚型」是这台工作台里所有记录的第一层背景：不同亚型的治疗路径与随访节奏本来就不同。',
            '常见首发部位是肢体（大腿最常见），其次躯干与腹膜后、头颈。部位只记事实，本身不推导分期——头颈、胸腹腔内脏、眼眶在 AJCC 第 8 版里没有定义分期组。',
            '组织学分级（常用 FNCLCC 三级）与 TNM 分期不是并列的两套东西：分级是分期组的输入变量之一，两者不能互推。'
          ],
          sources: [
            { org: 'WHO', doc: 'Classification of Tumours: Soft Tissue and Bone Tumours, 5th ed.', version: '2020', original: false, secondaryUrl: 'https://publications.iarc.fr/Book-And-Report-Series/Who-Classification-Of-Tumours/Soft-Tissue-And-Bone-Tumours-2020', page: '页码待核', note: '第 5 版全书需购买；二次来源为 IARC 官方出版页' },
            { org: 'AJCC', doc: 'Cancer Staging Manual, 8th ed.（STS 章节）', version: '2017', original: false, secondaryUrl: 'https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/cancer-staging-systems/', page: '页码待核', note: '手册为付费书；二次来源为 AJCC 官方分期体系页' }
          ]
        },
        {
          id: 'evidence',
          title: '医学资料规范和指南情况',
          intro: '这台工作台里出现的每一条「该查什么、该怎么分期」，都应能追到下面某一份文件。本项目没有取得 NCCN / AJCC / WHO / CSCO 的指南原件，表格里照实写，不假装看过。',
          table: {
            head: ['机构', '文件', '版本 / 年份', '原件', '本台的用途'],
            rows: [
              ['NCCN', 'NCCN Guidelines for Patients · Soft Tissue Sarcoma', '2025（据临床版 V1.2025 改编，66 页）',
                { text: '官方入口页 · 患者版（免费）', kind: 'hub', url: 'https://www.nccn.org/patientresources/patient-resources/guidelines-for-patients/guidelines-for-patients-details?patientGuidelineId=37', note: '详情页可下载患者版 PDF；PDF 直链在无头浏览器中正文为空（THIN），本台未存档该 PDF' },
                '分期检查、治疗路径与随访节奏的患者版并列引用'],
              ['NCCN', 'NCCN Guidelines · Soft Tissue Sarcoma（临床版）', 'V5.2026（官网现行；本台正文引用仍为 V3.2026）',
                { text: '官方入口页 · 临床版（需注册）', kind: 'hub', url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1464', note: '临床版全文需在 NCCN 官网注册后取得；本台未取得该版原件' },
                '分期检查、治疗路径与随访节奏的并列引用（机构 + 版本 + 表号）'],
              ['AJCC', 'Cancer Staging Manual, 8th ed.（STS 章节）', '2017',
                { text: '官方入口页 · 分期体系（手册付费）', kind: 'hub', url: 'https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/cancer-staging-systems/', note: '第 8 版手册为付费书，官方仅免费第 1 章分期总则；STS 章节未取得' },
                'TNM 与组织学分级如何进入分期组；哪些部位未定义分期组'],
              ['WHO', 'Soft Tissue and Bone Tumours, 5th ed.', '2020',
                { text: '官方入口页 · IARC 出版页（全书付费）', kind: 'hub', url: 'https://publications.iarc.fr/Book-And-Report-Series/Who-Classification-Of-Tumours/Soft-Tissue-And-Bone-Tumours-2020', note: '第 5 版全书需购买；在线版需机构订阅；本台未取得原件' },
                '病理亚型命名的唯一口径'],
              ['CSCO', '骨与软组织肿瘤诊疗指南', '2025 版',
                { text: '未取得原件 · 无官方免费全文', nolink: true, note: 'CSCO 指南以纸质/合订本发行，官网未提供公开 PDF（2026-10-27 检索）' },
                '国内可及药物与本土实践差异，本版暂不作引用依据']
            ]
          },
          points: [
            '指南给的是「通常怎么做」，不是「你该怎么做」。版本号必须写清：同一份指南隔一年，条目会变。',
            '本台对未取得原件的文件只记「存在」与「大致讲什么」，不引用其具体条文，页码一律写待核。',
            '国内指南（CSCO 骨与软组织肿瘤诊疗指南）与 AJCC 分期回答的不是同一个问题：前者讲治疗怎么选，后者讲解剖范围到了哪一步。两者不互推、不换算，引用时各自标注出处。'
          ],
          sources: [
            { org: 'NCCN', doc: 'NCCN Guidelines for Patients · Soft Tissue Sarcoma', version: '2025（据临床版 V1.2025 改编）', entry: true, kind: 'hub', url: 'https://www.nccn.org/patientresources/patient-resources/guidelines-for-patients/guidelines-for-patients-details?patientGuidelineId=37', note: '免费患者版详情页；临床版全文需另行注册，本台未取得原件' },
            { org: 'NCCN', doc: 'NCCN Guidelines · Soft Tissue Sarcoma', version: 'V5.2026', entry: true, kind: 'hub', url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1464', note: '临床版全文需在 NCCN 官网注册后取得；本台未取得该版原件' },
            { org: 'AJCC', doc: 'AJCC Cancer Staging Manual, 8th ed.', version: '2017', original: false, secondaryUrl: 'https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/cancer-staging-systems/', page: '页码待核' },
            { org: 'WHO', doc: 'Soft Tissue and Bone Tumours, 5th ed.', version: '2020', original: false, secondaryUrl: 'https://publications.iarc.fr/Book-And-Report-Series/Who-Classification-Of-Tumours/Soft-Tissue-And-Bone-Tumours-2020', page: '页码待核' },
            { org: 'CSCO', doc: '骨与软组织肿瘤诊疗指南', version: '2025 版', nolink: true, note: 'CSCO 指南以纸质/合订本发行，官网未提供公开 PDF（2026-10-27 检索）' }
          ]
        },
        {
          id: 'landscape',
          title: '目前治疗全景概要',
          intro: '下面按期别与线序列出指南里出现过的手段类别。这是「世界上大致有哪些办法」的地图，不是给你排的先后顺序，也不含任何剂量、疗程与适用条件——那些必须由医生按你的病理与影像决定。',
          groups: [
            { label: '局限期（可以手术切除时）', points: [
              '手术：保肢切除是主流目标；截肢在无法保肢时才被讨论。切缘状态按病理报告原文记录（R0 / R1 / R2），本台不改写、不解读。',
              '放疗：术前、术后、或术中近距离照射都被列出过，各有适用情形；不同情形的取舍属于医生判断。',
              '化疗：在部分高危情形下被列为可讨论选项；是否使用、用哪种方案，指南没有给出「一刀切」答案。'
            ] },
            { label: '晚期 / 转移后', points: [
              '全身治疗：以蒽环类为基础的化疗是长期存在的选项；后续线序可包含其他化疗药、靶向药与免疫治疗。具体药物是否在国内获批、是否在医保内，需要单独核实。',
              '局部处理：寡转移灶的放疗或手术，在特定情形下被列出。',
              '临床研究：指南把「参加登记良好的临床试验」列为一项正式选项，而不是最后手段。'
            ] },
            { label: '贯穿全程的两件事', points: [
              '功能与康复：手术后肢体功能变化、放疗后的关节活动度，属随访内容；本台只记录你自己的动作与感受（TESS 自评），不给总分、不画趋势、不和别人比。',
              '复查节奏：影像与随访间隔按指南与医生安排执行，本台只把「约在哪天、做了没有」整理成时间线。'
            ] }
          ],
          points: ['以上是文献与指南里列出的手段，按病期与线序排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。'],
          sources: [
            { org: 'NCCN', doc: 'NCCN Guidelines · Soft Tissue Sarcoma', version: 'V5.2026', entry: true, kind: 'hub', url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1464', note: '临床版全文需在 NCCN 官网注册后取得；本台未取得该版原件' }
          ]
        },
        {
          id: 'trend',
          title: '发展趋势',
          intro: '这一段只写已经发生的事：哪份文件换了版本、哪一天生效、分类体系改了什么、登记平台上多了多少条。不写预测，不做评价，也不给任何倾向。',
          points: [
            '2013 年：WHO 第 4 版《软组织与骨肿瘤分类》出版。',
            '2020 年：WHO 第 5 版出版，取代第 4 版；软组织与骨肿瘤合并为一卷，部分亚型被重命名或重新归类。',
            '2025-05-02：NCCN 软组织肉瘤临床指南 V1.2025 生效；患者版《Soft Tissue Sarcoma, 2025》即据此版改编（66 页）。',
            '截至 2026-10-27：NCCN 官网 Soft Tissue Sarcoma 指南条目显示版本为 V5.2026（临床版全文需注册）；本台正文引用仍锁 V3.2026，换版需逐条复核（见 docs/DIFF-MATRIX.md）。',
            '截至 2026-10：中国药物临床试验登记与信息公示平台可检索到软组织肉瘤相关登记 60 条，其中 I 期与 II 期占多数；本项目另有 150 条被按病种排除（骨肉瘤、尤文、软骨肉瘤、GIST、硬纤维瘤、脊索瘤、卡波西等），排除清单见 research/sarcoma/。数字随检索日期变化，检索式与日期须一并记录。'
          ],
          sources: [
            { org: 'WHO', doc: 'Soft Tissue and Bone Tumours, 5th ed.', version: '2020', original: false, secondaryUrl: 'https://publications.iarc.fr/Book-And-Report-Series/Who-Classification-Of-Tumours/Soft-Tissue-And-Bone-Tumours-2020', page: '页码待核' },
            { org: 'NCCN', doc: 'NCCN Guidelines · Soft Tissue Sarcoma', version: 'V5.2026', entry: true, kind: 'hub', url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1464', note: '版本号取自官网条目；临床版全文需注册，本台未取得原件' },
            { org: 'NMPA 药品审评中心', doc: '药物临床试验登记与信息公示平台（chinadrugtrials.org.cn）', version: '检索日 2026-10', nolink: true, note: '平台检索页对脚本返回 202/空正文，无法验活；60 条为项目自采快照，检索式与日期见 research/sarcoma/manifest.json' },
            { org: 'ClinicalTrials.gov', doc: 'Soft Tissue Sarcoma 检索入口', version: '检索日 2026-10-27', original: true, kind: 'registry', url: 'https://clinicaltrials.gov/search?cond=Soft%20Tissue%20Sarcoma', note: '国际登记库检索入口，作交叉核对；本台未在该库自采快照' }
          ]
        }
      ]
    }

    const safeHref = (u) => {
      if (!u || typeof u !== 'string') return ''
      const t = u.trim()
      return /^https:\/\//i.test(t) ? t : ''
    }

    function link(url, label) {
      return h('a', { className: 'wb-dp-link', href: url, target: '_blank', rel: 'noopener noreferrer' }, label)
    }

    /* §2.5：原件/二次来源/官方入口三种状态；缺链接一律红标，不静默放过。 */
    function sourceStatus(s) {
      if (s.nolink) return h('span', { className: 'wb-dp-miss' }, '未取得原件（' + (s.note || '无说明') + '）')
      if (s.entry) {
        const u = safeHref(s.url)
        return h(React.Fragment, null,
          '官方入口',
          u ? link(u, '需自行注册 · 打开 ↗') : h('span', { className: 'wb-dp-miss' }, '（缺链接，违反 36 号 §2.5）'),
          s.note ? h('span', { className: 'wb-note' }, ' · ' + s.note) : null)
      }
      if (s.original) {
        const u = safeHref(s.url)
        return u ? link(u, '原件已取得 · 打开/下载 ↗') : h('span', { className: 'wb-dp-miss' }, '原件已取得（缺链接，违反 36 号 §2.5）')
      }
      const sec = safeHref(s.secondaryUrl)
      return sec ? link(sec, '未取得原件，据二次来源 ↗') : h('span', { className: 'wb-dp-miss' }, '未取得原件，据二次来源（缺二次链接，违反 36 号 §2.5）')
    }

    function cellStatus(c) {
      if (c && typeof c === 'object' && !Array.isArray(c)) {
        if (c.nolink) return h('span', { className: 'wb-dp-miss' }, c.text + '（' + (c.note || '无说明') + '）')
        if (c.kind === 'hub') {
          const u = safeHref(c.url)
          return h(React.Fragment, null,
            u ? link(u, c.text + ' ↗') : h('span', { className: 'wb-dp-miss' }, c.text + '（缺 https 链接，违反 36 号 §2.5）'),
            c.note ? h('span', { className: 'wb-note' }, ' · ' + c.note) : null)
        }
        const u = safeHref(c.url)
        return u ? link(u, c.text + ' ↗') : h('span', { className: 'wb-dp-miss' }, c.text + '（缺 https 链接，违反 36 号 §2.5）')
      }
      return h('span', { className: 'wb-dp-miss' }, String(c == null ? '' : c) + '（原件列必须是可点链接，违反 36 号 §2.5）')
    }

    function SourceLine({ sources }) {
      if (!sources || !sources.length) return null
      const parts = []
      sources.forEach((s, i) => {
        if (i) parts.push(' ｜ ')
        parts.push(h('span', { key: 'o' + i }, s.org + ' · ' + s.doc + '（' + (s.version || '') + '）· '))
        parts.push(h('span', { key: 's' + i }, sourceStatus(s)))
        if (s.page) parts.push(' · ' + s.page)
      })
      return h('p', { className: 'wb-dp-src' }, '来源：', parts)
    }

    function Points({ points }) {
      if (!points || !points.length) return null
      return h('ul', { className: 'wb-dp-points' }, points.map((p, i) => h('li', { key: i }, p)))
    }

    function SectionView({ section }) {
      const body = []
      if (section.intro) body.push(h('p', { className: 'wb-dp-lead', key: 'intro' }, section.intro))
      if (section.table) {
        const t = section.table
        body.push(h('div', { className: 'wb-dp-table-wrap', key: 'table' },
          h('table', { className: 'wb-dp-table' },
            h('thead', null, h('tr', null, t.head.map((x, i) => h('th', { key: i }, x)))),
            h('tbody', null, t.rows.map((row, r) => h('tr', { key: r }, row.map((c, i) => h('td', { key: i }, i === 3 ? cellStatus(c) : String(c))))))
          )))
      }
      if (section.groups) {
        section.groups.forEach((g, i) => {
          body.push(h('div', { className: 'wb-dp-group', key: 'g' + i }, h('h4', null, g.label), h(Points, { points: g.points })))
        })
      }
      body.push(h(Points, { points: section.points, key: 'points' }))
      body.push(h(SourceLine, { sources: section.sources, key: 'src' }))
      return h('section', { className: 'wb-dp-section', key: section.id, 'data-dp-section': section.id },
        h('h3', null, section.title), body)
    }

    function PrimerOverlay({ onBack, onClose, panelRef }) {
      return h('div', { className: 'wb-dp-overlay' },
        h('div', { className: 'wb-dp-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'wb-dp-title', tabIndex: -1, ref: panelRef },
          h('div', { className: 'wb-dp-head' },
            h('button', { type: 'button', className: 'wb-dp-back', onClick: onBack, 'aria-label': '返回工作台' }, '← 返回'),
            h('strong', { id: 'wb-dp-title' }, '疾病概要 · ' + PRIMER.name),
            h('span', { className: 'wb-grow wb-note' }, PRIMER.en + ' · 更新 ' + PRIMER.updated),
            h('button', { type: 'button', className: 'wb-dp-close', onClick: onClose, 'aria-label': '关闭疾病概要' }, '✕ 关闭')),
          h('div', { className: 'wb-dp-body' },
            h('div', { className: 'wb-dp-inner' }, PRIMER.sections.map((s) => h(SectionView, { section: s, key: s.id }))))))
    }

    function StatusCard({ onOpenPrimer, onRetry }) {
      return h('section', { className: 'wb-status', 'aria-label': '病程状态卡' },
        h('p', { className: 'wb-status-eyebrow' }, 'D+N 状态卡 · 待初始化'),
        h('p', { className: 'wb-status-day' }, h('b', null, '待初始化'), h('span', { className: 'wb-status-anchor' }, '还没有可派生天数的锚点日')),
        h('p', { className: 'wb-status-now' },
          h('span', null, '三步向导'),
          h('span', { className: 'wb-status-state' }, '① 连接本机服务　② 记录确诊与分级　③ 写入下次复查日期'),
          h('span', { className: 'wb-status-next' }, '下次：待初始化后按锚点计算')),
        h('div', { className: 'wb-status-actions' },
          h('button', { type: 'button', className: 'wb-primary', onClick: onRetry }, '重新检查连接 →'),
          h('button', { type: 'button', onClick: onOpenPrimer }, '疾病概要：软组织肉瘤是什么？')))
    }

    function Panel() {
      /* 业务界面在 public/（原型提升而来）；探不到才退回骨架 */
      const [health, setHealth] = React.useState(null)
      const [error, setError] = React.useState('')
      const [large, setLarge] = React.useState(false)
      const [attempt, setAttempt] = React.useState(0)
      const [open, setOpen] = React.useState(false)
      const [uiBroken, setUiBroken] = React.useState(false)
      React.useEffect(() => {
        const controller = new AbortController()
        fetch(UI_ENTRY, { method: 'HEAD', signal: controller.signal, credentials: 'same-origin' })
          .then((response) => { if (!response.ok) setUiBroken(true) })
          .catch(() => setUiBroken(true))
        return () => controller.abort()
      }, [])
      const openRef = React.useRef(false)
      const triggerRef = React.useRef(null)
      const panelRef = React.useRef(null)
      const scrollRef = React.useRef(0)
      const pushedRef = React.useRef(false)

      React.useEffect(() => {
        const controller = new AbortController()
        setHealth(null); setError('')
        fetch('/api/sarcoma/health', { signal: controller.signal, credentials: 'same-origin' })
          .then(async (response) => {
            if (!response.ok) throw new Error(`服务连接失败 (${response.status})`)
            const result = await response.json()
            if (!controller.signal.aborted) setHealth(result)
          })
          .catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
        return () => controller.abort()
      }, [attempt])

      const hardClose = React.useCallback(() => {
        if (!openRef.current) return
        openRef.current = false
        pushedRef.current = false
        setOpen(false)
        document.documentElement.style.overflow = ''
        try { window.scrollTo(0, scrollRef.current) } catch {}
        const t = triggerRef.current
        if (t && t.focus) t.focus()
      }, [])

      const openPrimer = React.useCallback((event) => {
        if (openRef.current) return
        triggerRef.current = (event && event.currentTarget) || null
        try { scrollRef.current = window.scrollY || 0 } catch { scrollRef.current = 0 }
        openRef.current = true
        setOpen(true)
        document.documentElement.style.overflow = 'hidden'
        try { window.history.pushState({ wbPrimer: true }, ''); pushedRef.current = true } catch { pushedRef.current = false }
        window.setTimeout(() => { if (panelRef.current) panelRef.current.focus() }, 30)
      }, [])

      const closeViaHistory = React.useCallback(() => {
        if (!openRef.current) return
        if (pushedRef.current) { try { window.history.back(); return } catch {} }
        hardClose()
      }, [hardClose])

      React.useEffect(() => {
        const onPop = () => { if (openRef.current) hardClose() }
        const onKey = (e) => {
          if (!openRef.current) return
          if (e.key === 'Escape') { e.preventDefault(); closeViaHistory() }
        }
        window.addEventListener('popstate', onPop)
        document.addEventListener('keydown', onKey)
        return () => { window.removeEventListener('popstate', onPop); document.removeEventListener('keydown', onKey) }
      }, [closeViaHistory, hardClose])

      if (!uiBroken) {
        return h('main', { className: 'wb-sarcoma', style: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 } },
          h('iframe', {
            src: UI_ENTRY,
            title: '软组织肉瘤工作台',
            style: { flex: 1, width: '100%', border: 0, minHeight: 0, background: '#f7faf8' },
          }))
      }

      return h('main', { className: 'wb-sarcoma', 'data-font': large ? 'large' : 'standard', style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 20, overflow: 'auto' } },
        h('header', { style: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', paddingInlineStart: 'var(--dsh-frame-leading-clearance, 0px)' } },
          h('strong', null, metadata.title),
          h('span', { 'aria-live': 'polite' }, health ? `v${health.version}` : '版本待连接'),
          h('button', { type: 'button', 'aria-pressed': large, onClick: () => setLarge(!large) }, large ? '标准字' : '大字'),
          h('button', { type: 'button', ref: triggerRef, 'data-primer-open': '', 'aria-haspopup': 'dialog', 'aria-expanded': open ? 'true' : 'false', 'aria-label': '疾病概要：定义、医学资料与指南情况、治疗全景、发展趋势', onClick: openPrimer }, '?')),
        h('style', null, theme + primerCss),
        h(StatusCard, { onOpenPrimer: openPrimer, onRetry: () => setAttempt((value) => value + 1) }),
        h('section', { style: { background: 'var(--wb-surface)', border: '1px solid var(--wb-line)', borderRadius: 'var(--wb-radius)', padding: 20 } },
          h('h1', { style: { fontSize: '1.6em', margin: '0 0 12px' } }, metadata.title),
          h('p', null, metadata.description),
          h('p', { role: 'status' }, error || (health ? '接入骨架：服务已连接，业务功能待按 spec 实现。' : '正在连接本机服务…')),
          h('button', { type: 'button', className: 'wb-primary', onClick: () => setAttempt((value) => value + 1) }, '重新检查连接')),
        open ? h(PrimerOverlay, { onBack: closeViaHistory, onClose: closeViaHistory, panelRef }) : null)
    }
    function apply(ctx) {
      ctx.effect(() => ctx.desktopWorkbenches.register({"title":"软组织肉瘤工作台","repository":"https://github.com/xyb-openharness-dsh-plugins/sarcoma-workbench","description":"软组织肉瘤（STS）患者与照护者的本机病程资料工作台：把散落的病理与分型、手术与切缘记录、治疗线序与副作用、复查影像与功能变化整理成可核对、可回溯的材料，并整理成就诊能带着走的问题清单。","customFrame":true}, Panel))
    }
    return { apply, inject: ['desktopWorkbenches'] }
  }
})
