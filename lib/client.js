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

    /* ---------------- AI 会话面板（customFrame 分栏，家族基线） ----------------
     * 宿主把 DSH 原生会话节点作为 conversation prop 交给我们排版：
     * - 右侧 aside 常挂载，显隐只用 display（卸载会丢输入框与草稿）；
     * - 宽度 25%–45%、默认 35%、步进 2%，localStorage 持久化，键盘 ←/→/Home/End；
     * - 容器窄于 760px 改覆盖式抽屉，业务区不让位；
     * - 点击「AI 对话」复用本工作台归属会话，没有才 ensureSession 建一次；
     *   开场白只填进原生草稿，不自动发送。
     */
    const AGENT_MIN = 0.25, AGENT_MAX = 0.45, AGENT_DEFAULT = 0.35, AGENT_STEP = 0.02
    const NARROW_BELOW = 760, DRAWER_MAX = 420
    const WIDTH_KEY = 'xyb.sarcoma.agent-pane.v1'
    const DRAFT_QUEUE_KEY = 'xyb.sarcoma.initial-draft.v1'
    const DRAFT_LIMIT = 8000

    const clampRatio = (value) => {
      const n = Number(value)
      if (!Number.isFinite(n)) return AGENT_DEFAULT
      return Math.min(AGENT_MAX, Math.max(AGENT_MIN, n))
    }
    const snapRatio = (value) => clampRatio(Math.round(value / AGENT_STEP) * AGENT_STEP)
    const round4 = (n) => Math.round(n * 10000) / 10000
    const loadWidth = () => {
      try { return clampRatio(localStorage.getItem(WIDTH_KEY)) } catch { return AGENT_DEFAULT }
    }
    const saveWidth = (value) => {
      try { localStorage.setItem(WIDTH_KEY, String(round4(value))) } catch { /* 隐私模式写不进去，不挡使用 */ }
    }

    /* 分隔线品牌色（本仓赭紫）；悬停/拖动光晕由它派生，不写死蓝色 */
    const SPLITTER_BRAND = '#7B4C9A'
    const splitterRgba = (hex, alpha) => {
      const raw = String(hex).replace('#', '')
      const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
      const n = parseInt(full, 16)
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
    }

    let bridge = null

    function currentSession() {
      const service = bridge && bridge.desktopWorkbenches
      if (service && typeof service.currentSession === 'function') return service.currentSession() || null
      const snapshot = bridge && bridge.sessions && bridge.sessions.list && bridge.sessions.list.getSnapshot
        ? bridge.sessions.list.getSnapshot()
        : null
      return (snapshot && (snapshot.current || Object.keys(snapshot.byId || {}).find((id) =>
        ((snapshot.byId[id] && snapshot.byId[id].retainedBy && snapshot.byId[id].retainedBy.mainView) || 0) > 0))) || null
    }
    function workbenchOwnsSession(id) {
      const service = bridge && bridge.desktopWorkbenches
      return Boolean(id && service && typeof service.ownsSession === 'function' && service.ownsSession(id))
    }
    function ownedSession() {
      const id = currentSession()
      return workbenchOwnsSession(id) ? id : null
    }

    /* 只填草稿：不覆盖已有内容、不合并引用态、不自动发送 */
    function fillDraft(sessionId, prompt) {
      if (!sessionId || ownedSession() !== sessionId) throw new Error('会话已切换，请回到本工作台再操作')
      const actx = bridge.sessions.scope(sessionId)
      const conversation = actx && actx.get ? actx.get('conversation') : null
      if (!conversation) throw new Error('对话输入不可用')
      const input = conversation.input.for(actx)
      const snapshot = input.state.getSnapshot()
      if ((snapshot.occurrences && snapshot.occurrences.length) || (snapshot.phase && snapshot.phase !== 'plain')) {
        throw new Error('当前草稿含引用或特殊输入，请先在原生会话里处理')
      }
      const current = snapshot.draft || ''
      input.setDraft(current.trim() ? `${current}\n\n${prompt}` : prompt)
    }

    let pendingDraft = null
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_QUEUE_KEY) || 'null')
      if (saved && saved.sessionId && saved.prompt) pendingDraft = saved
    } catch { /* 隐私模式忽略 */ }
    function rememberDraft(entry) {
      pendingDraft = entry
      try {
        if (entry) localStorage.setItem(DRAFT_QUEUE_KEY, JSON.stringify(entry))
        else localStorage.removeItem(DRAFT_QUEUE_KEY)
      } catch { /* 隐私模式忽略 */ }
    }
    function flushDraft() {
      if (!pendingDraft) return false
      try {
        fillDraft(pendingDraft.sessionId, pendingDraft.prompt)
        rememberDraft(null)
        return true
      } catch { return false /* composer 未就绪：留给下一轮 */ }
    }

    function onboardingPrompt(dir) {
      return [
        '你正在协助我使用「小韧宝 SarcPal 软组织肉瘤工作台」。它只做本机资料整理，不提供诊疗建议。',
        `资料目录：${dir || '（首次打开时在面板里选择）'}`,
        '里面是我的病理与分型、手术与切缘记录、治疗线序与副作用、复查影像与功能变化、就诊问题清单。',
        '分工：你帮我汇总、找缺漏、把报告里的数值和日期整理成对照表（数值照抄、单位随报告原文）；判断和决定由我和治疗团队做。',
      ].join('\n')
    }

    function Panel({ conversation }) {
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
      /* ---- AI 会话面板状态 ---- */
      const [note, setNote] = React.useState('')
      const [width, setWidth] = React.useState(loadWidth)
      const [paneOpen, setPaneOpen] = React.useState(true)
      const [connecting, setConnecting] = React.useState(false)
      const [narrow, setNarrow] = React.useState(false)
      const [dragging, setDragging] = React.useState(false)
      const [hovering, setHovering] = React.useState(false)
      const shellRef = React.useRef(null)
      const dragHostRef = React.useRef(null)
      const frameRef = React.useRef(null)
      const hasConversation = Boolean(conversation)
      const canOpenSession = Boolean(bridge && bridge.desktopWorkbenches && typeof bridge.desktopWorkbenches.ensureSession === 'function')

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

      /* ---------------- AI 会话：调起/复用、草稿队列、分栏 ---------------- */
      React.useEffect(() => {
        const timer = setInterval(() => { if (flushDraft()) setNote('草稿已填入会话，按回车发送') }, 500)
        const service = bridge && bridge.desktopWorkbenches
        const unsubscribe = service && service.subscribe ? service.subscribe(() => setNote('')) : null
        return () => { clearInterval(timer); if (unsubscribe) unsubscribe() }
      }, [])

      React.useEffect(() => {
        if (!canOpenSession) setNote('当前 Desktop 版本不支持从面板调起会话；请从左侧会话列表新建会话')
      }, [canOpenSession])

      /* 窄屏判定用**容器宽度**，不是窗口宽度：宿主主区宽度 ≠ 窗口宽度 */
      React.useEffect(() => {
        const host = shellRef.current
        if (!host || typeof ResizeObserver !== 'function') return undefined
        const observer = new ResizeObserver((entries) => {
          const w = (entries[0] && entries[0].contentRect && entries[0].contentRect.width) || 0
          setNarrow(w > 0 && w < NARROW_BELOW)
        })
        observer.observe(host)
        return () => observer.disconnect()
      }, [])

      const applyWidth = React.useCallback((next) => {
        const snapped = round4(snapRatio(next))
        setWidth(snapped)
        saveWidth(snapped)
      }, [])
      const stopDrag = React.useCallback(() => {
        dragHostRef.current = null
        setDragging(false)
      }, [])
      React.useEffect(() => {
        if (!dragging) return undefined
        const onMove = (event) => {
          const host = dragHostRef.current
          if (!host) return
          const rect = host.getBoundingClientRect()
          if (!rect.width) return
          /* 会话在右侧：指针越靠左，会话越宽 */
          applyWidth((rect.right - event.clientX) / rect.width)
        }
        document.addEventListener('pointermove', onMove)
        document.addEventListener('pointerup', stopDrag)
        document.addEventListener('pointercancel', stopDrag)
        return () => {
          document.removeEventListener('pointermove', onMove)
          document.removeEventListener('pointerup', stopDrag)
          document.removeEventListener('pointercancel', stopDrag)
        }
      }, [dragging, applyWidth, stopDrag])

      const onSplitterPointerDown = (event) => {
        event.preventDefault()
        try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* 旧宿主无指针捕获：document 监听兜住 */ }
        dragHostRef.current = shellRef.current
        setDragging(true)
      }
      const onSplitterKeyDown = (event) => {
        const delta = { ArrowLeft: AGENT_STEP, ArrowRight: -AGENT_STEP }[event.key]
        if (delta !== undefined) { event.preventDefault(); applyWidth(width + delta); return }
        if (event.key === 'Home') { event.preventDefault(); applyWidth(AGENT_MAX); return }
        if (event.key === 'End') { event.preventDefault(); applyWidth(AGENT_MIN) }
      }

      async function openAgent(prompt) {
        setNote('')
        if (!canOpenSession) {
          setNote('当前 Desktop 版本不支持从面板调起会话；请从左侧会话列表新建会话')
          return
        }
        setConnecting(true)
        try {
          let dir = null
          try {
            const res = await fetch('/api/sarcoma/health')
            dir = (await res.json()).dir || null
          } catch { /* 拿不到目录也照样调起 */ }
          /* ensureSession 复用本工作台归属会话；没有才创建一次 */
          const id = await bridge.desktopWorkbenches.ensureSession({ folder: dir })
          rememberDraft({ sessionId: id, prompt: (prompt || onboardingPrompt(dir)).slice(0, DRAFT_LIMIT) })
          flushDraft()
          setPaneOpen(true)
          setNote('会话已就绪：开场白只填进草稿，按回车才会发送')
        } catch (error) {
          setNote(`没能调起会话：${(error && error.message) || error}`)
        } finally {
          setConnecting(false)
        }
      }
      /* 收起只是隐藏，不结束会话；再点「打开 AI 对话」回到同一会话 */
      function onAgentClick() {
        if (!hasConversation) { void openAgent(null); return }
        setPaneOpen((v) => !v)
        setNote('')
      }

      const agentLabel = !canOpenSession
        ? 'AI 对话暂不可用'
        : connecting ? '正在连接…'
          : !hasConversation ? 'AI 对话'
            : paneOpen ? '收起 AI 对话' : '打开 AI 对话'
      const percent = Math.round(width * 100)
      const paneVisible = paneOpen && (hasConversation || connecting)

      /* ---- 外壳样式（顶栏 / 业务区 / 会话区 / 分隔线） ---- */
      const rootStyle = { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0, width: '100%', background: '#FAF8FB', color: '#4A2D5C', font: '13px/1.55 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif' }
      const headerStyle = {
        display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto', flexWrap: 'wrap',
        padding: '6px 12px', paddingInlineStart: 'calc(12px + var(--dsh-frame-leading-clearance, 0px))',
        borderBottom: '1px solid #E6DFEC', background: '#fff',
      }
      const brandStyle = { fontSize: 12.5, fontWeight: 700, color: '#7B4C9A', whiteSpace: 'nowrap' }
      const verStyle = { fontSize: 11, color: '#8A7A96', background: '#F3EDF8', borderRadius: 999, padding: '1px 8px', whiteSpace: 'nowrap' }
      const hintStyle = { flex: 1, minWidth: 180, fontSize: 11.5, color: '#8A7A96' }
      const headerActionsStyle = { display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto', marginLeft: 'auto', flexWrap: 'wrap' }
      const buttonStyle = { border: 0, borderRadius: 999, padding: '5px 14px', minHeight: 32, minWidth: 44, whiteSpace: 'nowrap', background: '#7B4C9A', color: '#fff', font: 'inherit', fontWeight: 600, cursor: 'pointer' }
      const ghostStyle = { ...buttonStyle, background: 'transparent', color: '#7B4C9A', border: '1px solid #E6DFEC' }
      const smallStyle = { ...ghostStyle, minWidth: 36, padding: '4px 10px' }
      const noteStyle = { color: '#7B4C9A', fontWeight: 600, fontSize: 11.5, maxWidth: 340 }
      const bodyStyle = { position: 'relative', display: 'flex', flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }
      const businessStyle = { flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }
      const frameStyle = { flex: '1 1 auto', width: '100%', minHeight: 0, border: 0, display: 'block', background: '#f7faf8' }
      const paneStyle = {
        display: 'flex', flexDirection: 'column', flex: '0 0 auto', minWidth: 0, minHeight: 0,
        borderLeft: '1px solid #E6DFEC', background: '#fff', overflow: 'hidden',
      }
      const drawerStyle = {
        position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 3,
        boxShadow: '-8px 0 24px rgba(43, 28, 56, 0.18)',
      }
      /* 1px 视觉细线：绝对定位在业务区/会话边界上，不占布局宽度 */
      const splitterStyle = {
        position: 'absolute', top: 0, bottom: 0, width: 1, marginRight: -0.5,
        zIndex: 2, background: '#E6DFEC', cursor: 'col-resize', touchAction: 'none',
        transition: 'background .15s ease, box-shadow .15s ease',
      }
      const splitterHoverStyle = {
        ...splitterStyle, background: SPLITTER_BRAND,
        boxShadow: `0 0 6px ${splitterRgba(SPLITTER_BRAND, 0.55)}`,
      }
      const splitterDragStyle = {
        ...splitterHoverStyle,
        boxShadow: `0 0 10px ${splitterRgba(SPLITTER_BRAND, 0.8)}`,
      }
      /* 拖动命中面积由 11px 透明热区提供，线条本身不变粗 */
      const splitterHitStyle = {
        position: 'absolute', top: 0, bottom: 0, left: -5, width: 11,
        background: 'transparent', cursor: 'col-resize',
      }
      const splitterGripStyle = {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 14, height: 22, borderRadius: 4, background: SPLITTER_BRAND,
        color: '#fff', fontSize: 11, lineHeight: '22px', letterSpacing: '-1px', textAlign: 'center',
        opacity: 0.95, pointerEvents: 'none', userSelect: 'none',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.18)',
      }
      /* 拖动遮罩：指针掠过业务 iframe 时事件仍归文档，拖动不断 */
      const dragShieldStyle = {
        position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
        zIndex: 4, cursor: 'col-resize', background: 'transparent', touchAction: 'none',
      }
      const padStyle = { display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', padding: 20, color: '#8A7A96', fontSize: 12.5, lineHeight: 1.75 }

      /* 业务区：iframe 原样保留；探不到界面才退回原骨架（原顶栏按钮移入外壳顶栏） */
      const business = uiBroken
        ? h('main', { className: 'wb-sarcoma', 'data-font': large ? 'large' : 'standard', style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 20, overflow: 'auto' } },
          h('style', null, theme + primerCss),
          h(StatusCard, { onOpenPrimer: openPrimer, onRetry: () => setAttempt((value) => value + 1) }),
          h('section', { style: { background: 'var(--wb-surface)', border: '1px solid var(--wb-line)', borderRadius: 'var(--wb-radius)', padding: 20 } },
            h('h1', { style: { fontSize: '1.6em', margin: '0 0 12px' } }, metadata.title),
            h('p', null, metadata.description),
            h('p', { role: 'status' }, error || (health ? '接入骨架：服务已连接，业务功能待按 spec 实现。' : '正在连接本机服务…')),
            h('button', { type: 'button', className: 'wb-primary', onClick: () => setAttempt((value) => value + 1) }, '重新检查连接')))
        : h('iframe', {
            key: attempt,
            ref: frameRef,
            src: UI_ENTRY,
            title: '软组织肉瘤工作台',
            style: frameStyle,
            sandbox: 'allow-scripts allow-same-origin allow-forms allow-downloads',
            onLoad: () => setNote(''),
          })

      return h(React.Fragment, null,
        h('div', { style: rootStyle },
          /* 顶栏：保留原结构（标题 / 版本 / 大字 / 疾病概要），右侧按钮组加「AI 对话」入口 */
          h('header', { style: headerStyle },
            h('strong', { style: brandStyle }, metadata.title),
            h('span', { 'aria-live': 'polite', style: verStyle }, health ? `v${health.version}` : '版本待连接'),
            h('span', { style: hintStyle }, hasConversation
              ? '右侧是 DSH 原生会话：可拖中间分隔边调整宽度（25%–45%），收起不会结束会话。'
              : '还没有会话。点右侧「AI 对话」调起原生会话，开场白只填进草稿，不自动发送。'),
            h('div', { style: headerActionsStyle },
              uiBroken ? h('button', { type: 'button', style: smallStyle, 'aria-pressed': large, onClick: () => setLarge(!large) }, large ? '标准字' : '大字') : null,
              uiBroken ? h('button', { type: 'button', style: smallStyle, ref: triggerRef, 'data-primer-open': '', 'aria-haspopup': 'dialog', 'aria-expanded': open ? 'true' : 'false', 'aria-label': '疾病概要：定义、医学资料与指南情况、治疗全景、发展趋势', onClick: openPrimer }, '?') : null,
              h('button', {
                type: 'button',
                style: buttonStyle,
                onClick: onAgentClick,
                disabled: connecting || !canOpenSession,
                'aria-label': `AI 对话：${agentLabel}`,
              }, agentLabel),
              hasConversation && paneOpen
                ? h('button', { type: 'button', style: ghostStyle, onClick: () => setPaneOpen(false), 'aria-label': '收起 AI 对话面板' }, '×')
                : null,
              note ? h('span', { role: 'status', style: noteStyle }, note) : null)),
          h('div', { ref: shellRef, style: bodyStyle },
            h('div', { style: businessStyle }, business),
            /* splitter 必须夹在业务区与 aside 之间：DOM 顺序为 业务区 → splitter → aside */
            !narrow && paneVisible ? h('div', {
              role: 'separator',
              'aria-orientation': 'vertical',
              'aria-label': '调整 AI 对话面板宽度',
              'aria-valuemin': Math.round(AGENT_MIN * 100),
              'aria-valuemax': Math.round(AGENT_MAX * 100),
              'aria-valuenow': percent,
              tabIndex: 0,
              style: {
                ...(dragging ? splitterDragStyle : hovering ? splitterHoverStyle : splitterStyle),
                right: `${percent}%`,
              },
              onPointerDown: onSplitterPointerDown,
              onPointerEnter: () => setHovering(true),
              onPointerLeave: () => setHovering(false),
              onKeyDown: onSplitterKeyDown,
            },
              h('span', { style: splitterHitStyle, 'aria-hidden': 'true' }),
              (hovering || dragging) ? h('span', { style: splitterGripStyle, 'aria-hidden': 'true' }, '⠿') : null) : null,
            /* 原生会话常挂载：显隐只用 display，卸载会丢输入框与草稿 */
            h('aside', {
              style: {
                ...paneStyle,
                ...(narrow ? drawerStyle : null),
                width: narrow ? `min(92%, ${DRAWER_MAX}px)` : `${percent}%`,
                display: paneVisible ? 'flex' : 'none',
              },
              'aria-label': 'AI 对话',
              'aria-hidden': paneVisible ? undefined : 'true',
            }, conversation || h('div', { style: padStyle },
              h('b', null, 'AI 对话还没开始'),
              h('span', null, '点顶栏「AI 对话」调起 DSH 原生会话后，它会固定出现在这一侧。'),
              h('span', null, '没有会话也不影响记录：业务区照常可用。'))),
            /* 拖动遮罩：指针掠过业务 iframe 时事件仍归文档，拖动不断 */
            dragging && !narrow ? h('div', { style: dragShieldStyle, 'aria-hidden': 'true' }) : null)),
        open ? h(PrimerOverlay, { onBack: closeViaHistory, onClose: closeViaHistory, panelRef }) : null)
    }
    function apply(ctx) {
      bridge = ctx
      ctx.effect(() => ctx.desktopWorkbenches.register({"title":"软组织肉瘤工作台","repository":"https://github.com/xyb-openharness-dsh-plugins/sarcoma-workbench","description":"软组织肉瘤（STS）患者与照护者的本机病程资料工作台：把散落的病理与分型、手术与切缘记录、治疗线序与副作用、复查影像与功能变化整理成可核对、可回溯的材料，并整理成就诊能带着走的问题清单。","customFrame":true}, Panel))
    }
    return { apply, inject: ['desktopWorkbenches', 'sessions'] }
  }
})
