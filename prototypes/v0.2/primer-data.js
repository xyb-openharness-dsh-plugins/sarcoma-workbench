/* 小韧宝 SarcPal · 疾病概要数据（36 号）
 * 口径：docs/DISEASE-PRIMER.md；规范：starter docs/36-DISEASE-PRIMER.md。
 * 全部内容属第 ② 层（解释）：只写定义、文件、指南列举过的手段、已发生的变化。
 * 任何「你该怎么办」的判断都不在这里，固定出口是「这一句需要问你的医生」。
 *
 * 原件状态照实写：本项目未取得 NCCN / CSCO / AJCC / WHO 的指南原件，
 * 因此所有页码一律「页码待核」，来源栏统一标「未取得原件，据二次来源」。
 */
window.DISEASE_PRIMER = {
  brand: '小韧宝 SarcPal',
  name: '软组织肉瘤',
  en: 'Soft Tissue Sarcoma（STS）',
  updated: '2026-10-25',
  sections: [
    {
      id: 'definition',
      title: '定义',
      intro: '软组织肉瘤不是一种病，而是一组起源于间叶组织（脂肪、肌肉、纤维、血管、神经鞘等）的恶性肿瘤的统称。'
        + '同样大小、同样部位的两个肉瘤，可能是完全不同的两种病——分型看的是病理，不是长在哪里。',
      points: [
        '世界卫生组织（WHO）《软组织与骨肿瘤分类》第 5 版（2020）按分化方向分类：脂肪细胞性、成纤维细胞性与肌纤维母细胞性、血管性与周细胞性、平滑肌、骨骼肌、胃肠道间质、神经鞘、未确定分化等大类。',
        '病理报告上的「亚型」是这台工作台里所有记录的第一层背景：不同亚型的治疗路径与随访节奏本来就不同。',
        '常见首发部位是肢体（大腿最常见），其次躯干与腹膜后、头颈。部位只记事实，本身不推导分期——头颈、胸腹腔内脏、眼眶在 AJCC 第 8 版里没有定义分期组。',
        '组织学分级（常用 FNCLCC 三级）与 TNM 分期不是并列的两套东西：分级是分期组的输入变量之一，两者不能互推。'
      ],
      sources: [
        { org: 'WHO', doc: 'Classification of Tumours: Soft Tissue and Bone Tumours, 5th ed.', version: '2020', original: false, page: '页码待核' },
        { org: 'AJCC', doc: 'Cancer Staging Manual, 8th ed.（STS 章节）', version: '2017', original: false, page: '页码待核' }
      ]
    },
    {
      id: 'evidence',
      title: '医学资料规范和指南情况',
      intro: '这台工作台里出现的每一条「该查什么、该怎么分期」，都应能追到下面某一份文件。'
        + '本项目对这几份文件都只拿到公开页与版本号，没有拿到原件——表格里照实写，不假装看过。',
      table: {
        head: ['机构', '文件', '版本 / 年份', '原件', '本台的用途'],
        rows: [
          ['NCCN', 'NCCN Guidelines · Soft Tissue Sarcoma', 'V3.2026（2026-03-12 生效）', '未取得原件', '分期检查、治疗路径与随访节奏的并列引用（机构 + 版本 + 表号）'],
          ['AJCC', 'Cancer Staging Manual, 8th ed.（STS 章节）', '2017', '未取得原件', 'TNM 与组织学分级如何进入分期组；哪些部位未定义分期组'],
          ['WHO', 'Soft Tissue and Bone Tumours, 5th ed.', '2020', '未取得原件', '病理亚型命名的唯一口径'],
          ['CSCO', '骨与软组织肿瘤诊疗指南', '2025 版', '未取得原件', '国内可及药物与本土实践差异，本版暂不作引用依据']
        ]
      },
      points: [
        '指南给的是「通常怎么做」，不是「你该怎么做」。版本号必须写清：同一份指南隔一年，条目会变。',
        '本台对未取得原件的文件只记「存在」与「大致讲什么」，不引用其具体条文，页码一律写待核。',
        '国内指南（CSCO 骨与软组织肿瘤诊疗指南）与 AJCC 分期回答的不是同一个问题：前者讲治疗怎么选，后者讲解剖范围到了哪一步。两者不互推、不换算，引用时各自标注出处。'
      ],
      sources: [
        { org: 'NCCN', doc: 'NCCN Guidelines · Soft Tissue Sarcoma', version: 'V3.2026', original: false, page: '页码待核' },
        { org: 'AJCC', doc: 'AJCC Cancer Staging Manual, 8th ed.', version: '2017', original: false, page: '页码待核' },
        { org: 'WHO', doc: 'Soft Tissue and Bone Tumours, 5th ed.', version: '2020', original: false, page: '页码待核' },
        { org: 'CSCO', doc: '骨与软组织肿瘤诊疗指南', version: '2025 版', original: false, page: '页码待核' }
      ]
    },
    {
      id: 'landscape',
      title: '目前治疗全景概要',
      intro: '下面按期别与线序列出指南里出现过的手段类别。这是「世界上大致有哪些办法」的地图，不是给你排的先后顺序，'
        + '也不含任何剂量、疗程与适用条件——那些必须由医生按你的病理与影像决定。',
      groups: [
        {
          label: '局限期（可以手术切除时）',
          points: [
            '手术：保肢切除是主流目标；截肢在无法保肢时才被讨论。切缘状态按病理报告原文记录（R0 / R1 / R2），本台不改写、不解读。',
            '放疗：术前、术后、或术中近距离照射都被列出过，各有适用情形；不同情形的取舍属于医生判断。',
            '化疗：在部分高危情形下被列为可讨论选项；是否使用、用哪种方案，指南没有给出「一刀切」答案。'
          ]
        },
        {
          label: '晚期 / 转移后',
          points: [
            '全身治疗：以蒽环类为基础的化疗是长期存在的选项；后续线序可包含其他化疗药、靶向药与免疫治疗。具体药物是否在国内获批、是否在医保内，需要单独核实。',
            '局部处理：寡转移灶的放疗或手术，在特定情形下被列出。',
            '临床研究：指南把「参加登记良好的临床试验」列为一项正式选项，而不是最后手段。'
          ]
        },
        {
          label: '贯穿全程的两件事',
          points: [
            '功能与康复：手术后肢体功能变化、放疗后的关节活动度，属随访内容；本台只记录你自己的动作与感受（TESS 自评），不给总分、不画趋势、不和别人比。',
            '复查节奏：影像与随访间隔按指南与医生安排执行，本台只把「约在哪天、做了没有」整理成时间线。'
          ]
        }
      ],
      points: [
        '以上是文献与指南里列出的手段，按病期与线序排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。'
      ],
      sources: [
        { org: 'NCCN', doc: 'NCCN Guidelines · Soft Tissue Sarcoma', version: 'V3.2026', original: false, page: '页码待核' }
      ]
    },
    {
      id: 'trend',
      title: '发展趋势',
      intro: '这一段只写已经发生的事：哪份文件换了版本、哪一天生效、分类体系改了什么、登记平台上多了多少条。'
        + '不写预测，不做评价，也不给任何倾向。',
      points: [
        '2013 年：WHO 第 4 版《软组织与骨肿瘤分类》出版。',
        '2020 年：WHO 第 5 版出版，取代第 4 版；软组织与骨肿瘤合并为一卷，部分亚型被重命名或重新归类。',
        '2026-03-12：NCCN 软组织肉瘤指南由 V2.2026 更新为 V3.2026 并生效。',
        '截至 2026-10：中国药物临床试验登记与信息公示平台可检索到软组织肉瘤相关登记 60 条，其中 I 期与 II 期占多数；本项目另有 150 条被按病种排除（骨肉瘤、尤文、软骨肉瘤、GIST、硬纤维瘤、脊索瘤、卡波西等），排除清单见 research/sarcoma/。数字随检索日期变化，检索式与日期须一并记录。'
      ],
      sources: [
        { org: 'WHO', doc: 'Soft Tissue and Bone Tumours, 5th ed.', version: '2020', original: false, page: '页码待核' },
        { org: 'NCCN', doc: 'NCCN Guidelines · Soft Tissue Sarcoma', version: 'V3.2026', original: false, page: '更新记录页，页码待核' },
        { org: 'NMPA 药品审评中心', doc: '药物临床试验登记与信息公示平台（chinadrugtrials.org.cn）', version: '检索日 2026-10', original: true, note: '一手登记数据，本项目自采' }
      ]
    }
  ]
}
