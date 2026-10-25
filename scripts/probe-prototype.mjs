#!/usr/bin/env node
/**
 * M4 原型验收探针 · prototypes/v0.2（小韧宝 SarcPal 软组织肉瘤工作台）
 *
 * 判据：prompts/ZERO-TO-DEV.md §1.4「演示数据 + HTML demo」的四个必查件 +
 *       无头实测（页签穷举 / aria-selected / 内容指纹 / body.scrollWidth === innerWidth /
 *       控制台 0 error / 0 个 4xx）+ 窄宽（30 号）竖排单字 = 0。
 *
 * 本探针只测「原型自身」的 P1–P8，整页视图 A1–A10 由 scripts/probe-page-view.mjs 负责，
 * 疾病概要的独立断言由 scripts/probe-disease-primer.mjs 负责；这里只测它与顶栏「?」入口
 * 和 history 的互不打架。
 *
 * 用法：
 *   node scripts/probe-prototype.mjs                 # 正常模式
 *   node scripts/probe-prototype.mjs --self-test     # 注入 4 个已知缺陷，必须 ≥3 条 FAIL
 *   node scripts/probe-prototype.mjs --url http://127.0.0.1:8125/prototypes/v0.2/index.html
 *   node scripts/probe-prototype.mjs --port 8125
 *
 * 依赖：puppeteer-core（家族 workspace 已装）+ 本机 Chrome。无构建步骤。
 * 本机跑之前先 `export NODE_OPTIONS=`（机器上有 --require 注入，会干扰探针启动）。
 *
 * 两条实测踩到的坑（写在这里，防止后来人「优化」掉）：
 *   ① render() 会整块重建 #main，连页签按钮一起重建。所以每次点击都必须重新 query，
 *      不能先抓一个按钮数组再 forEach 点——第二次点到的元素已经不在文档里。
 *   ② 页面里的 tab 标签本身也在 #main 内（.subnav），直接抓 #main.textContent 会让
 *      「页签标题命中」永远为真。指纹必须扣掉 .subnav，否则 P1 是一条自动变绿的假闸门。
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPuppeteer, PUPPETEER_HINT } from './lib/load-puppeteer.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const argOf = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }
const SELF_TEST = args.includes('--self-test')
const PORT = Number(argOf('--port') || 8125)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json'
}

/* AI 面板调宽的三档宽度写死在 app.js 的 data-agent-size 处理里（300 / 372 / 500）。
   P2d 的 min/max 就取这两个极值；改 app.js 时这里要一起改。 */
const AGENT_MIN = 300
const AGENT_MAX = 500

/* P1 内容指纹关键词表。
   只有「页签标题原样出现在正文里」的页签才走默认的 label 匹配；其余页签的正文
   不会复述自己的页签名（例如「影像时间轴」页正文只写「影像按日期并列摆放」），
   一律在这里显式给出该页独有的正文关键词。每条都对应 2026-10-25 实测的正文原句，
   不是「差不多相关」的泛词——泛词（如只写「影像」）会让错页也过闸。 */
const TAB_KEYWORDS = {
  'dashboard/-': ['只回答三件事'],
  'tumor/0': ['恶性亚型'],
  'tumor/1': ['部位只记报告原文'],
  'tumor/2': ['分期（AJCC 第 8 版）'],
  'tumor/3': ['MDM2（FISH）'],
  'diagnosis/0': ['发现肿块'],
  'diagnosis/1': ['活检与病理会诊'],
  'diagnosis/2': ['关键日期'],
  'surgery/0': ['打开手术档案'],
  'surgery/1': ['切缘未见明确肿瘤'],
  'surgery/2': ['打开伤口与恢复'],
  'treatment/0': ['线序是事实'],
  'treatment/1': ['没有化疗周期记录'],
  'treatment/2': ['放疗记录'],
  'treatment/3': ['口服靶向或免疫治疗记录'],
  'tox/0': ['放射性皮炎'],
  'tox/1': ['「同日」'],
  'tox/2': ['联系人'],
  'function/0': ['蹲不下去'],
  'function/1': ['最近一次 TESS'],
  'function/2': ['康复观察项'],
  'labs/0': ['迷你折线'],
  'labs/1': ['一图秀'],
  'labs/2': ['×ULN 契约'],
  'followup/0': ['影像按日期并列'],
  'followup/1': ['随访五档'],
  'followup/2': ['问题整理成清单'],
  'imaging/0': ['MRI · 右大腿'],
  'imaging/1': ['报告原文只能从记录详情'],
  'imaging/2': ['1 上传'],
  'life/0': ['在哪看的'],
  'life/1': ['还没有记花费'],
  'life/2': ['情绪与照护者负担'],
  'life/3': ['体重（自测）'],
  'trials/0': ['试验登记条目'],
  'trials/1': ['分子路径'],
  'trials/2': ['记一条试验线索']
}

/* ---------------- 工程骨架（照 probe-page-view / probe-disease-primer） ---------------- */
function serve() {
  return new Promise((res) => {
    const server = createServer(async (req, rsp) => {
      const path = decodeURIComponent((req.url || '/').split('?')[0])
      if (path === '/favicon.ico') { rsp.writeHead(204).end(); return }
      const file = join(ROOT, normalize(path).replace(/^([/\\])+/, ''))
      if (!file.startsWith(ROOT)) { rsp.writeHead(403).end(); return }
      try {
        const body = await readFile(file)
        rsp.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body)
      } catch { rsp.writeHead(404).end('not found') }
    })
    server.listen(PORT, '127.0.0.1', () => res(server))
  })
}

function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ].filter(Boolean)
  return cands.find((p) => existsSync(p)) || null
}

const results = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: !!ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${name}${detail ? '  — ' + detail : ''}`)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ---------------- 页面操作小工具 ---------------- */
const clickView = (page, v) => page.evaluate((v) => {
  document.querySelector(`#nav [data-view="${v}"]`)?.click()
}, v)

/* 读指纹：扣掉 .subnav，只留正文。用 textContent 而不是 innerText：
   离屏/未排版的克隆节点上 innerText 会退化，跨次比较会假抖。 */
const readFingerprint = (page) => page.evaluate(() => {
  const main = document.querySelector('#main')
  if (!main) return ''
  const clone = main.cloneNode(true)
  clone.querySelectorAll('.subnav').forEach((n) => n.remove())
  return (clone.textContent || '').replace(/\s+/g, ' ').trim()
})

/* ---------------- P1 页签穷举 ---------------- */
async function p1(page) {
  const views = await page.evaluate(() => [...document.querySelectorAll('#nav [data-view]')].map((b) => b.dataset.view))
  const fails = []
  const fps = new Map()
  let total = 0, ok = 0, tabSum = 0

  for (const view of views) {
    await clickView(page, view)
    const tabCount = await page.evaluate(() => document.querySelectorAll('.subnav [data-sub]').length)
    tabSum += tabCount
    const subs = tabCount ? [...Array(tabCount).keys()] : [null]

    for (const sub of subs) {
      total++
      /* 每次重新取按钮再点：render() 会重建 DOM（见文件头坑①） */
      const state = await page.evaluate((view, sub) => {
        document.querySelector(`#nav [data-view="${view}"]`)?.click()
        if (sub !== null) document.querySelectorAll('.subnav [data-sub]')[sub]?.click()
        const tabs = [...document.querySelectorAll('.subnav [data-sub]')]
        const selected = tabs.map((b) => b.getAttribute('aria-selected'))
        const main = document.querySelector('#main')
        const clone = main ? main.cloneNode(true) : null
        if (clone) clone.querySelectorAll('.subnav').forEach((n) => n.remove())
        return {
          navCurrent: document.querySelector(`#nav [data-view="${view}"]`)?.getAttribute('aria-current') === 'page',
          navCount: document.querySelectorAll('.subnav [data-sub]').length,
          selTrue: selected.filter((x) => x === 'true').length,
          selIndex: selected.indexOf('true'),
          label: (tabs[sub ?? 0]?.textContent || '').trim(),
          fp: clone ? (clone.textContent || '').replace(/\s+/g, ' ').trim() : ''
        }
      }, view, sub)

      const key = `${view}/${sub === null ? '-' : sub}`
      const label = state.label || (sub === null ? '（无页签）' : '')
      const problems = []

      if (sub === null) {
        if (!state.navCurrent) problems.push('一级导航未标 aria-current=page')
      } else {
        if (state.selTrue !== 1) problems.push(`选中态数量=${state.selTrue}（应为 1）`)
        if (state.selIndex !== sub) problems.push(`选中索引=${state.selIndex}（应为 ${sub}）`)
      }
      if (!state.fp || state.fp.length < 30) problems.push(`内容指纹过短（${state.fp.length} 字）`)

      const kws = TAB_KEYWORDS[key] || [label]
      if (state.fp && !kws.some((k) => k && state.fp.includes(k))) {
        problems.push(`关键词未命中（${kws.join(' | ')}）`)
      }

      /* 幂等：同一个页签连点两次，指纹必须一致 */
      const fp2 = await page.evaluate((view, sub) => {
        document.querySelector(`#nav [data-view="${view}"]`)?.click()
        if (sub !== null) document.querySelectorAll('.subnav [data-sub]')[sub]?.click()
        const main = document.querySelector('#main')
        const clone = main ? main.cloneNode(true) : null
        if (clone) clone.querySelectorAll('.subnav').forEach((n) => n.remove())
        return clone ? (clone.textContent || '').replace(/\s+/g, ' ').trim() : ''
      }, view, sub)
      if (fp2 !== state.fp) problems.push('连点两次指纹不同（非幂等）')

      /* 跨页签去重：两个不同页签渲染出同一段正文，说明页签没有真的切内容 */
      if (state.fp) {
        if (fps.has(state.fp) && fps.get(state.fp) !== key) problems.push(`与 ${fps.get(state.fp)} 内容相同`)
        else fps.set(state.fp, key)
      }

      if (problems.length) fails.push({ key, label, problems })
      else ok++
    }
  }

  check('P1', '页签穷举：每个 (view, sub) 都有唯一选中态、非空正文、可幂等复现',
    fails.length === 0,
    `${total} 个状态（12 一级页 = 1 个无页签页 + ${tabSum} 个二级页签）· 通过 ${ok}/${total}`)
  for (const f of fails) console.log(`      · ${f.key} 「${f.label}」：${f.problems.join('；')}`)
}

/* ---------------- P2 AI 面板三态 ---------------- */
async function p2(page) {
  const dockState = () => page.evaluate(() => {
    const dock = document.querySelector('#agent-dock')
    const toggle = document.querySelector('#agent-toggle')
    const r = dock?.getBoundingClientRect()
    return {
      expanded: toggle?.getAttribute('aria-expanded'),
      hidden: !!dock?.hidden,
      w: Math.round(r?.width || 0),
      h: Math.round(r?.height || 0),
      grid: getComputedStyle(document.querySelector('#work-grid')).gridTemplateColumns
    }
  })

  const initial = await dockState()
  check('P2a', '初始态：AI 面板展开且可见', initial.expanded === 'true' && !initial.hidden && initial.w > 200,
    `aria-expanded=${initial.expanded} hidden=${initial.hidden} 宽=${initial.w}px`)

  await page.evaluate(() => document.querySelector('#agent-toggle')?.click())
  await sleep(60)
  const collapsed = await dockState()
  check('P2b', '点顶栏 AI 对话：面板收起', collapsed.expanded === 'false' && collapsed.hidden && collapsed.w === 0,
    `aria-expanded=${collapsed.expanded} hidden=${collapsed.hidden} 宽=${collapsed.w}px`)

  await page.evaluate(() => document.querySelector('#agent-toggle')?.click())
  await sleep(60)
  const reopened = await dockState()
  check('P2c', '再点一次：面板展开', reopened.expanded === 'true' && !reopened.hidden && reopened.w > 200,
    `aria-expanded=${reopened.expanded} 宽=${reopened.w}px`)

  /* 调宽交互在 app.js 里是「设置」弹窗中的三档按钮（300 / 372 / 500），不是拖拽手柄。
     读代码确认后再测，不按拖拽去伪造 pointer 事件。 */
  await page.evaluate(() => document.querySelector('[data-action="settings"]')?.click())
  const hasSizes = await page.waitForSelector('[data-agent-size="narrow"]', { timeout: 2000 }).then(() => true).catch(() => false)
  if (!hasSizes) {
    check('P2d', '面板宽度可调（300 / 372 / 500 三档按钮）', false, '设置弹窗里找不到 [data-agent-size]，调宽交互缺失')
  } else {
    const before = await dockState()
    await page.evaluate(() => document.querySelector('[data-agent-size="narrow"]')?.click())
    await sleep(60)
    const narrow = await dockState()
    await page.evaluate(() => document.querySelector('[data-agent-size="wide"]')?.click())
    await sleep(60)
    const wide = await dockState()
    const changed = narrow.w !== before.w && wide.w !== narrow.w && wide.grid !== narrow.grid
    check('P2d', '面板宽度可调（设置里的 300 / 372 / 500 三档，按钮非拖拽）', changed,
      `372→${narrow.w}→${wide.w}px · grid ${before.grid} → ${narrow.grid} → ${wide.grid}`)

    /* 边界：最窄 / 最宽都必须落在代码写死的 300–500 之间，且不许把整页撑出横向滚动 */
    const boundsOk = narrow.w >= AGENT_MIN - 24 && narrow.w <= AGENT_MIN + 24 &&
      wide.w >= AGENT_MAX - 24 && wide.w <= AGENT_MAX + 24 &&
      (await page.evaluate(() => document.body.scrollWidth <= innerWidth + 1))
    check('P2e', '调宽到两端不越界（落在 300–500 之间）', boundsOk,
      `最窄=${narrow.w}px 最宽=${wide.w}px · 声明 min=${AGENT_MIN} max=${AGENT_MAX}`)

    await page.evaluate(() => document.querySelector('#dialog-foot [data-action="close"]')?.click())
  }

  /* 面板头上还有一个 × 收起入口，两条路都必须真的收起来 */
  await page.evaluate(() => document.querySelector('#agent-dock [data-action="agent"]')?.click())
  await sleep(60)
  const viaX = await dockState()
  check('P2f', '面板头部 × 也能收起（两个入口一致）', viaX.expanded === 'false' && viaX.hidden,
    `aria-expanded=${viaX.expanded} hidden=${viaX.hidden}`)
}

/* ---------------- P3 一图秀（单调三次插值 / 13px 避让 / 分类只画节点 / 单点不连线） ---------------- */
function cubicSegments(d) {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number)
  const segs = []
  let cur = { x: nums[0], y: nums[1] }
  let i = 2
  while (i + 5 < nums.length) {
    segs.push({
      from: cur,
      c1: { x: nums[i], y: nums[i + 1] },
      c2: { x: nums[i + 2], y: nums[i + 3] },
      to: { x: nums[i + 4], y: nums[i + 5] }
    })
    cur = { x: nums[i + 4], y: nums[i + 5] }
    i += 6
  }
  return segs
}
const bezierY = (a, b, c, d, t) => {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

const toggleMetric = (page, key, on) => page.evaluate((key, on) => {
  const input = document.querySelector(`input[data-metric="${key}"]`)
  if (!input) return false
  if (input.checked !== on) input.click()
  return true
}, key, on)

async function p3(page) {
  await clickView(page, 'labs')
  await page.evaluate(() => document.querySelectorAll('.subnav [data-sub]')[1]?.click())
  await page.waitForSelector('.chart-wrap svg.chart', { timeout: 3000 }).catch(() => {})

  const chart = await page.evaluate(() => {
    const svg = document.querySelector('.chart-wrap svg.chart')
    /* 分类「序列条数」看图例（一条分类指标一行「分类 · 节点」）；
       rect.cat-node 是分类指标的**记录节点数**，5 个节点只代表 1 条序列，别混。 */
    const ranges = [...document.querySelectorAll('.chart-panel .legend .range')]
    return svg ? {
      paths: [...svg.querySelectorAll('path.line')].map((p) => p.getAttribute('d') || ''),
      labels: [...svg.querySelectorAll('.delta-tag')].map((t) => ({ y: parseFloat(t.getAttribute('y')), text: t.textContent })),
      catNodes: svg.querySelectorAll('rect.cat-node').length,
      catSeries: ranges.filter((e) => (e.textContent || '').includes('分类')).length,
      aria: svg.getAttribute('aria-label'),
      text: svg.textContent
    } : null
  })

  if (!chart) {
    check('P3a', '一图秀存在数值曲线', false, '找不到 .chart-wrap svg.chart')
    check('P3b', '末点标签 13px 避让', false, '图上没有 .delta-tag')
    check('P3c', '分类序列只画节点不连线', false, '图表未渲染，无法检验')
    check('P3d', '单点数据不画线', false, '图表未渲染，无法检验')
    return
  }

  /* ① 单调三次插值：每段 Hermite 的两个控制点 y 必须落在该段两端点之间，
        并在 t=0.25/0.5/0.75 采样验证曲线不越界（过冲的 Catmull-Rom 会直接越界）。 */
  const smoothProblems = []
  for (const [i, d] of chart.paths.entries()) {
    if (!/\bC\b/.test(d)) { smoothProblems.push(`第 ${i + 1} 条不是三次曲线（无 C 段）`); continue }
    for (const [j, s] of cubicSegments(d).entries()) {
      const lo = Math.min(s.from.y, s.to.y) - 0.6
      const hi = Math.max(s.from.y, s.to.y) + 0.6
      if (s.c1.y < lo || s.c1.y > hi || s.c2.y < lo || s.c2.y > hi) {
        smoothProblems.push(`第 ${i + 1} 条第 ${j + 1} 段控制点越界（${s.c1.y}/${s.c2.y} ∉ ${lo.toFixed(1)}~${hi.toFixed(1)}）`)
        break
      }
      const sampled = [0.25, 0.5, 0.75].map((t) => bezierY(s.from.y, s.c1.y, s.c2.y, s.to.y, t))
      if (sampled.some((y) => y < lo || y > hi)) {
        smoothProblems.push(`第 ${i + 1} 条第 ${j + 1} 段采样越界（${sampled.map((v) => v.toFixed(1)).join('/')}）`)
        break
      }
    }
  }
  check('P3a', `数值线是单调三次插值（${chart.paths.length} 条，控制点与采样都不越过相邻点 y 区间）`,
    chart.paths.length >= 2 && smoothProblems.length === 0,
    smoothProblems.length ? smoothProblems.slice(0, 2).join('；') : `${chart.paths.length} 条全部单调`)

  /* ② 末点标签：按 y 升序，相邻间距 ≥ 13px（代码里 it.ly = max(y, cursor + 13)） */
  const ys = chart.labels.map((l) => l.y)
  const sorted = ys.every((y, i) => i === 0 || y >= ys[i - 1] - 0.6)
  const gaps = ys.slice(1).map((y, i) => y - ys[i])
  const minGap = gaps.length ? Math.min(...gaps) : Infinity
  check('P3b', '末点数值标签按 y 排序且间距 ≥ 13px',
    chart.labels.length >= 2 && sorted && minGap >= 12.4,
    `${chart.labels.length} 个标签 · y=${ys.map((v) => v.toFixed(1)).join(',')} · 最小间距=${Number.isFinite(minGap) ? minGap.toFixed(1) : '—'}`)

  /* ③ 分类序列：先补选一条分类指标（默认 3 条数值线不含分类），再断言只有节点、没有连线 */
  await toggleMetric(page, 'wound_q', true)
  await sleep(60)
  const cat = await page.evaluate(() => {
    const svg = document.querySelector('.chart-wrap svg.chart')
    if (!svg) return null
    const paths = [...svg.querySelectorAll('path')]
    const lanePaths = []
    for (const p of paths) {
      const d = p.getAttribute('d') || ''
      const nums = (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number)
      /* 事件菱形在 y=56~79，数值线在 132~360；分类车道在 CATY=100。 */
      const near = nums.filter((v, i) => i % 2 === 1 && Math.abs(v - 100) <= 8)
      if (near.length >= 2) lanePaths.push(d.slice(0, 40))
    }
    return {
      nodes: svg.querySelectorAll('rect.cat-node').length,
      labels: svg.querySelectorAll('.cat-label').length,
      lanePaths,
      text: svg.textContent
    }
  })
  check('P3c', '分类序列只画节点不连线',
    !!cat && cat.nodes >= 5 && cat.nodes === cat.labels && cat.lanePaths.length === 0 && cat.text.includes('只画节点不连线'),
    cat ? `节点=${cat.nodes} 标签=${cat.labels} 分类车道上的 path=${cat.lanePaths.length}${cat.lanePaths.length ? ' → ' + cat.lanePaths.join(',') : ''}` : '图表未渲染')

  /* ④ 单点：把数值线全部取消，只留 1 个点的 CRP */
  for (const k of ['hgb', 'alb', 'alt']) await toggleMetric(page, k, false)
  await toggleMetric(page, 'crp', true)
  await sleep(80)
  const single = await page.evaluate(() => {
    const svg = document.querySelector('.chart-wrap svg.chart')
    if (!svg) return null
    return {
      lines: svg.querySelectorAll('path.line').length,
      dots: svg.querySelectorAll('circle.pt').length,
      text: svg.textContent
    }
  })
  const singleOk = !!single && single.lines === 0 && single.dots === 1 && single.text.includes('只有 1 次记录，暂不连线')
  check('P3d', '单点数据不画线，并写「只有 1 次记录，暂不连线」', singleOk,
    single ? `path.line=${single.lines} 点=${single.dots} 文案=${single.text.includes('只有 1 次记录，暂不连线')}` : '图表未渲染')

  /* ⑤ 默认选择是否符合 §1.4 的「默认指标与初始状态同构（数值线 + 一个分类序列）」。
        这不是我们发明的口径：看板任务卡与换档案弹窗都写着「默认 3 条数值线 + 1 条分类序列」。
        计数口径走图例：.legend .range 里文本含「分类」的条目数 = 分类**序列**条数。
        不数 rect.cat-node —— 那是节点数，同一序列 5 个点会被数成「5」。 */
  check('P3e', '一图秀默认选择含 1 条分类序列（与看板/换档案文案一致）',
    chart.catSeries === 1,
    `默认 ${chart.paths.length} 条数值线 + ${chart.catSeries} 条分类序列（该序列 ${chart.catNodes} 个节点）；文案写「默认 3 条数值线 + 1 条分类序列」`)

  /* 还原默认选择（3 条数值线 + 1 条分类序列），后面的用例吃的是同一份状态 */
  await toggleMetric(page, 'crp', false)
  await toggleMetric(page, 'wound_q', false)
  for (const k of ['hgb', 'alb', 'alt']) await toggleMetric(page, k, true)
}

/* ---------------- P4 3D 指标卡 ---------------- */
async function p4(page) {
  await clickView(page, 'labs')
  await page.evaluate(() => document.querySelectorAll('.subnav [data-sub]')[0]?.click())
  await page.waitForSelector('.mcard', { timeout: 3000 }).catch(() => {})

  const cardStyle = await page.evaluate(() => {
    const card = document.querySelector('.mcard[data-mcard="hgb"]')
    const inner = card?.querySelector('.mcard-inner')
    if (!card || !inner) return null
    const cs = getComputedStyle(card)
    return {
      perspective: cs.perspective,
      webkitPerspective: cs.webkitPerspective,
      transformStyle: getComputedStyle(inner).transformStyle
    }
  })
  check('P4a', '指标卡容器有 perspective 且内层 preserve-3d',
    !!cardStyle && cardStyle.perspective !== 'none' && cardStyle.transformStyle === 'preserve-3d',
    cardStyle ? `perspective=${cardStyle.perspective} transform-style=${cardStyle.transformStyle}` : '找不到 hgb 指标卡')

  /* 翻面用程序化 click 触发终态：卡片是 <button>，document 上的 click 处理器与用户点击同一条路径。
     不用 page.mouse 的原因：注入 perspective:none 后 3D 命中测试会挡住真鼠标（实测），
     那是 P4a 的缺陷，不该让 P4b 连带报一个与旋转无关的错。hover 类断言放在 P4d 用真鼠标。 */
  await page.evaluate(() => document.querySelector('.mcard[data-mcard="hgb"]')?.click())
  await sleep(720)                                     // transition 480ms，等终态
  const flipped = await page.evaluate(() => {
    const card = document.querySelector('.mcard[data-mcard="hgb"]')
    const inner = card?.querySelector('.mcard-inner')
    const t = inner ? getComputedStyle(inner).transform : ''
    /* 注意：不能对整串 "matrix3d(...)" 直接抓数字——"3d" 里的 3 会被当成第一个数。
       先剥掉函数名，再按逗号切。 */
    const nums = t.includes('(') ? t.slice(t.indexOf('(') + 1, -1).split(',').map(Number) : []
    return {
      attr: card?.getAttribute('data-flipped'),
      pressed: card?.getAttribute('aria-pressed'),
      transform: t,
      m11: nums[0],
      m33: nums[10]
    }
  })
  check('P4b', '整卡旋转到 180°（rotateY 终态）',
    flipped.attr === 'true' && flipped.pressed === 'true' && Math.abs(flipped.m11 + 1) < 0.05 && Math.abs(flipped.m33 + 1) < 0.05,
    `data-flipped=${flipped.attr} transform=${flipped.transform.slice(0, 60)}`)

  const back = await page.evaluate(() => {
    const card = document.querySelector('.mcard[data-mcard="hgb"]')
    const face = card?.querySelector('[data-face="back"]')
    const svg = face?.querySelector('svg.spark')
    if (!svg) return { svg: false }
    return {
      svg: true,
      dots: svg.querySelectorAll('.sp-dot').length,
      line: !!svg.querySelector('path.sp-line'),
      label: svg.getAttribute('aria-label')
    }
  })
  check('P4c', '背面是迷你折线（sparkline 结构）', back.svg && back.dots >= 2 && back.line,
    back.svg ? `svg.spark=1 点=${back.dots} path.sp-line=${back.line}` : '背面没有 svg.spark')

  /* ④ 分类记录卡：不翻、不连线。它是 data-static=1 的 div，点击处理器直接跳过。
       这条要用真鼠标：hover 有没有触发旋转，只有真指针事件说了算。 */
  const center = async (sel) => {
    await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: 'center' }), sel)
    await sleep(80)
    return page.evaluate((sel) => {
      const r = document.querySelector(sel).getBoundingClientRect()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    }, sel)
  }
  const qualSel = '.mcard[data-static="1"]'
  const hasQual = await page.evaluate((sel) => !!document.querySelector(sel), qualSel)
  if (!hasQual) {
    check('P4d', '分类记录卡不翻不连线', false, '找不到 data-static=1 的分类卡')
  } else {
    const qpt = await center(qualSel)
    await page.mouse.move(qpt.x, qpt.y)
    await sleep(150)
    const hoverT = await page.evaluate((sel) => {
      const inner = document.querySelector(sel)?.querySelector('.mcard-inner')
      return inner ? getComputedStyle(inner).transform : null   // null = 根本没有 3D 内层
    }, qualSel)
    await page.mouse.click(qpt.x, qpt.y)
    await sleep(200)
    const qual = await page.evaluate((sel) => {
      const card = document.querySelector(sel)
      const inner = card?.querySelector('.mcard-inner')
      return {
        hasInner: !!inner,
        flipped: card?.getAttribute('data-flipped'),
        transform: inner ? getComputedStyle(inner).transform : null,
        backSvg: card?.querySelectorAll('[data-face="back"] svg').length,
        role: card?.getAttribute('aria-roledescription')
      }
    }, qualSel)
    /* 「不翻」有两种合法实现：没有 3D 内层，或内层 transform 保持 none。 */
    const hoverOk = hoverT === null || hoverT === 'none'
    const clickOk = qual.hasInner === false || qual.transform === 'none'
    check('P4d', '分类记录卡不翻面、背面没有折线',
      hoverOk && clickOk && qual.flipped !== 'true' && qual.backSvg === 0,
      `3D 内层=${qual.hasInner} hover transform=${hoverT} click transform=${qual.transform} data-flipped=${qual.flipped} 背面 svg=${qual.backSvg} role=${qual.role}`)
  }
}

/* ---------------- P5 窄宽无横溢 + 竖排单字 ---------------- */
async function p5(page, base) {
  const views = await page.evaluate(() => [...document.querySelectorAll('#nav [data-view]')].map((b) => b.dataset.view))
  const widths = [390, 768, 1280]
  const verticalFails = []

  for (const width of widths) {
    await page.setViewport({ width, height: 900 })
    await sleep(90)
    const overflow = []
    let worst = null
    for (const view of views) {
      await clickView(page, view)
      const m = await page.evaluate(() => {
        /* 竖排单字 = 容器宽不到一个字宽，中文一行放不下只能一个字一行。
           两个排除项都是实测来的，不是放宽：
             · white-space:nowrap / vertical writing-mode —— 本来就不会竖排；
             · 纯 ASCII 文本 ——「kg」「mg/L」这类 2–4 个拉丁字符宽度也可能 < 1.2em，
               但它们是横排的单位（实测 .mface .val small 的 "kg" 宽 12px、字号 10.5px）。 */
        const bad = []
        const seen = new Set()
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        let node
        while ((node = walker.nextNode())) {
          const raw = (node.nodeValue || '').trim()
          if (raw.length < 2) continue
          const el = node.parentElement
          if (!el || el.closest('svg') || seen.has(el)) continue
          seen.add(el)
          if (/^[\x20-\x7E]+$/.test(raw)) continue
          const r = el.getBoundingClientRect()
          if (!r.width || !r.height) continue
          const cs = getComputedStyle(el)
          if (cs.whiteSpace === 'nowrap' || cs.writingMode !== 'horizontal-tb') continue
          const fs = parseFloat(cs.fontSize) || 0
          if (r.width < 1.2 * fs) bad.push(`${raw.slice(0, 10)}=${Math.round(r.width)}×${Math.round(r.height)},fs=${fs}`)
        }
        return { body: document.body.scrollWidth, html: document.documentElement.scrollWidth, iw: innerWidth, vertical: bad }
      })
      if (m.body > m.iw + 1 || m.html > m.iw + 1) overflow.push(`${view}: body=${m.body} html=${m.html} > ${m.iw}`)
      if (!worst || m.body - m.iw > worst.delta) worst = { view, delta: m.body - m.iw, body: m.body, iw: m.iw }
      if (m.vertical.length) verticalFails.push(`${width}px/${view}: ${m.vertical.slice(0, 2).join(' | ')}`)
    }
    check(`P5-${width}`, `${width}px 逐页无横向溢出（body.scrollWidth === innerWidth）`,
      overflow.length === 0,
      overflow.length ? overflow.slice(0, 3).join('；') : `12 个一级页均为 ${worst?.iw ?? width}`)
  }

  check('P5-v', '三档宽度下「竖排单字」为 0', verticalFails.length === 0,
    verticalFails.length ? verticalFails.slice(0, 3).join('；') : '390/768/1280 各 12 页均未发现')

  /* AI 面板展开态：窄宽下 390 再测一轮（面板在 1180 以下改为顺序排列） */
  await page.setViewport({ width: 390, height: 900 })
  await sleep(90)
  const agentNarrow = await page.evaluate(() => ({
    expanded: document.querySelector('#agent-toggle')?.getAttribute('aria-expanded'),
    body: document.body.scrollWidth,
    iw: innerWidth,
    dockW: Math.round(document.querySelector('#agent-dock').getBoundingClientRect().width)
  }))
  check('P5-agent', '390px + AI 面板展开态不横向溢出',
    agentNarrow.expanded === 'true' && agentNarrow.body <= agentNarrow.iw + 1,
    `aria-expanded=${agentNarrow.expanded} body=${agentNarrow.body} innerWidth=${agentNarrow.iw} dock=${agentNarrow.dockW}px`)

  /* 调宽之后再回到窄屏：内联 grid-template-columns 会不会把媒体查询顶掉？
     这是真实用户路径（设置里选过宽度 → 换手机 / 缩窗），不属于「原型的初始态」。 */
  await page.setViewport({ width: 1280, height: 900 })
  await sleep(90)
  await page.evaluate(() => document.querySelector('[data-action="settings"]')?.click())
  await page.waitForSelector('[data-agent-size="wide"]', { timeout: 2000 }).catch(() => {})
  await page.evaluate(() => document.querySelector('[data-agent-size="wide"]')?.click())
  await page.evaluate(() => document.querySelector('#dialog-foot [data-action="close"]')?.click())
  await page.setViewport({ width: 390, height: 900 })
  await sleep(120)
  const afterResize = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    iw: innerWidth,
    grid: getComputedStyle(document.querySelector('#work-grid')).gridTemplateColumns,
    mainW: Math.round(document.querySelector('#main').getBoundingClientRect().width)
  }))
  check('P5-resize', '调过面板宽度后回到 390px 仍不横向溢出', afterResize.body <= afterResize.iw + 1,
    `body=${afterResize.body} innerWidth=${afterResize.iw} grid=${afterResize.grid} main=${afterResize.mainW}px`)

  await page.goto(base, { waitUntil: 'networkidle0' })
}

/* ---------------- P6 控制台与网络 ---------------- */
/* 监听器在 main() 里挂，这里只汇总。见文件末尾检查。 */

/* ---------------- P7 字号三档 ---------------- */
async function p7(page) {
  await page.setViewport({ width: 1280, height: 900 })
  await sleep(80)
  const read = () => page.evaluate(() => ({
    tz: getComputedStyle(document.documentElement).getPropertyValue('--tz').trim(),
    body: document.body.scrollWidth,
    iw: innerWidth,
    pressed: document.querySelector('#font-toggle')?.getAttribute('aria-pressed'),
    label: (document.querySelector('#font-toggle')?.textContent || '').trim()
  }))

  const first = await read()
  const seen = [first]
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => document.querySelector('#font-toggle')?.click())
    await sleep(80)
    seen.push(await read())
  }
  const values = seen.map((s) => s.tz)
  const distinct = new Set(values).size === 3
  const noOverflow = seen.every((s) => s.body <= s.iw + 1)

  /* 第三档再点一次回到第一档 */
  await page.evaluate(() => document.querySelector('#font-toggle')?.click())
  await sleep(80)
  const back = await read()

  check('P7a', '字号三档取值互不相同（1 / 1.15 / 1.32）', distinct, values.join(' → '))
  check('P7b', '三档下 1280px 都不横向溢出，且能切回第一档',
    noOverflow && back.tz === first.tz,
    `${seen.map((s) => `${s.tz}:${s.body}/${s.iw}`).join(' ')} · 回到 ${back.tz}`)
}

/* ---------------- P8 「?」疾病概要入口 ---------------- */
async function p8(page, base) {
  await page.goto(base, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.querySelector('#nav [data-view="trials"]')?.click())
  const mounted = await page.waitForSelector('[data-primer-open]', { timeout: 4000 }).then(() => true).catch(() => false)
  if (!mounted) {
    check('P8a', '顶栏「?」能打开疾病概要（整页）', false, '4s 内没等到 primer.js 挂载 [data-primer-open]')
    check('P8b', 'Esc 关闭且只退一层', false, '面板无法打开')
    check('P8c', '关闭后焦点回到「?」', false, '面板无法打开')
    return
  }

  const urlBefore = page.url()
  const hlen = await page.evaluate(() => history.length)
  await page.evaluate(() => document.querySelector('[data-primer-open]')?.click())
  await sleep(320)
  const opened = await page.evaluate(() => {
    const overlay = document.querySelector('.dp-overlay')
    const panel = overlay?.querySelector('.dp-panel')
    const r = panel?.getBoundingClientRect()
    return {
      visible: !!overlay && !overlay.hidden,
      open: !!(window.DiseasePrimer && window.DiseasePrimer.isOpen()),
      title: (overlay?.querySelector('.dp-title')?.textContent || '').trim(),
      crumb: (overlay?.querySelector('.dp-crumb')?.textContent || '').trim(),
      sections: [...(overlay?.querySelectorAll('.dp-section') || [])].map((s) => s.dataset.dpSection),
      w: Math.round(r?.width || 0), h: Math.round(r?.height || 0),
      vw: innerWidth, vh: innerHeight,
      focused: !!panel && panel.contains(document.activeElement)
    }
  })
  check('P8a', '顶栏「?」打开整页疾病概要，标题与四段可见',
    opened.visible && opened.open && opened.sections.length === 4 && opened.w >= opened.vw * 0.9 && opened.h >= opened.vh * 0.9,
    `title="${opened.title}" crumb="${opened.crumb}" 段=${opened.sections.join('›')} 面板=${opened.w}×${opened.h}/${opened.vw}×${opened.vh}`)

  const histAfterOpen = await page.evaluate(() => history.length)
  await page.keyboard.press('Escape')
  await sleep(520)
  const closed = await page.evaluate(() => {
    const overlay = document.querySelector('.dp-overlay')
    const main = document.querySelector('#main')
    return {
      open: !!(window.DiseasePrimer && window.DiseasePrimer.isOpen()),
      hidden: overlay?.hidden !== false,
      lock: document.documentElement.classList.contains('dp-lock'),
      url: location.href,
      mainLen: (main?.textContent || '').trim().length,
      view: document.querySelector('#nav [aria-current="page"]')?.textContent?.trim(),
      state: JSON.stringify(history.state)
    }
  })
  const oneLayer = !closed.open && closed.hidden && !closed.lock &&
    closed.url.split('#')[0] === urlBefore.split('#')[0] &&
    !closed.url.includes('#disease-primer') &&
    closed.mainLen > 100
  check('P8b', 'Esc 关闭且只退一层：仍在本页、正文没被清空',
    oneLayer,
    `open=${closed.open} hidden=${closed.hidden} lock=${closed.lock} view=${closed.view} 正文=${closed.mainLen} 字 hash=${closed.url.split('#')[1] || '（无）'} history.length ${hlen}→${histAfterOpen} state=${closed.state}`)

  const focus = await page.evaluate(() => {
    const el = document.activeElement
    return {
      tag: el?.tagName,
      isTrigger: el?.hasAttribute?.('data-primer-open') === true,
      expanded: el?.getAttribute?.('aria-expanded')
    }
  })
  check('P8c', '关闭后焦点回到「?」按钮', focus.isTrigger && focus.expanded === 'false',
    `<${focus.tag}> data-primer-open=${focus.isTrigger} aria-expanded=${focus.expanded}`)
}

/* ---------------- 自测缺陷注入 ---------------- */
/* 四个缺陷各自打一条断言：
   ① #agent-dock 强制 display:none            → P2a/P2b
   ② 分类车道塞一条 <path> 连线                → P3c
   ③ .mcard perspective:none                  → P4a
   ④ body 里塞 600px 宽的块                    → P5-390
   注入后任何一次 page.goto/page.reload 都会冲掉 DOM 注入，所以每次重新加载后都要再调一次。 */
async function injectDefects(page) {
  await page.addStyleTag({ content: '#agent-dock{display:none !important} .mcard{perspective:none !important}' })
  await page.evaluate(() => {
    if (!document.querySelector('#selftest-overflow')) {
      const div = document.createElement('div')
      div.id = 'selftest-overflow'
      div.style.cssText = 'width:600px;height:8px;background:#f00'
      document.body.appendChild(div)
    }
    if (window.__selftestObs) return
    window.__selftestObs = new MutationObserver(() => {
      document.querySelectorAll('svg.chart').forEach((svg) => {
        if (svg.querySelector('.selftest-catline')) return
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        p.setAttribute('class', 'selftest-catline')
        p.setAttribute('d', 'M 60 100 L 300 100')   // CATY=100，正好落在分类车道上
        svg.appendChild(p)
      })
    })
    window.__selftestObs.observe(document.body, { childList: true, subtree: true })
  })
  if (!globalThis.__selftestBanner) {
    globalThis.__selftestBanner = true
    console.log('（自测：已注入「面板隐藏 + 分类车道上加连线 + 去掉 perspective + 600px 溢出块」四个缺陷）\n')
  }
}

/* ---------------- 主流程 ---------------- */
async function main() {
  const chrome = findChrome()
  if (!chrome) { console.log('找不到 Chrome：设置 CHROME_PATH 后重试。跳过等于没有这条闸门。'); process.exit(2) }
  /* puppeteer-core 的解析不再写死本机路径（评审 P2-3）：换机时设 PUPPETEER_PATH 即可。 */
  const puppeteer = loadPuppeteer()
  if (!puppeteer) { console.log(PUPPETEER_HINT); process.exit(2) }

  const server = await serve()
  const base = argOf('--url') || `http://127.0.0.1:${PORT}/prototypes/v0.2/index.html`
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--proxy-server=' + (process.env.http_proxy || 'http://127.0.0.1:7890')]
  })

  const netErrors = []
  const consoleErrors = []
  const pageErrors = []

  try {
    const page = await browser.newPage()
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
    page.on('pageerror', (e) => pageErrors.push(String(e.message)))
    page.on('response', (r) => { if (r.status() >= 400) netErrors.push(`${r.status()} ${r.url()}`) })

    await page.setViewport({ width: 1280, height: 900 })
    await page.goto(base, { waitUntil: 'networkidle0' })
    if (SELF_TEST) await injectDefects(page)

    await p1(page)
    if (SELF_TEST) await injectDefects(page)      // p1 不重载，这里是幂等的保险
    await p2(page)

    /* P2 改过内联 grid，重载回初始态再测图与卡 */
    await page.goto(base, { waitUntil: 'networkidle0' })
    if (SELF_TEST) await injectDefects(page)

    await p3(page)
    await p4(page)

    await page.goto(base, { waitUntil: 'networkidle0' })
    if (SELF_TEST) await injectDefects(page)
    await p5(page, base)                          // p5 末尾自己 goto 回初始态
    if (SELF_TEST) await injectDefects(page)

    await p7(page)
    await p8(page, base)

    /* P6 全程监听（监听器从 goto 之前就挂着） */
    check('P6', '全程 0 个 error 级 console、0 个未捕获异常、0 个 4xx/5xx 响应',
      consoleErrors.length === 0 && pageErrors.length === 0 && netErrors.length === 0,
      [
        consoleErrors.length ? `console.error ${consoleErrors.length}：${consoleErrors.slice(0, 2).join(' | ')}` : '',
        pageErrors.length ? `异常 ${pageErrors.length}：${pageErrors.slice(0, 2).join(' | ')}` : '',
        netErrors.length ? `坏响应 ${netErrors.length}：${netErrors.slice(0, 3).join(' | ')}` : ''
      ].filter(Boolean).join('；') || '三类计数均为 0')
  } finally {
    await browser.close()
    server.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n${failed.length ? 'FAIL' : 'PASS'}  ${results.length - failed.length}/${results.length}`)
  if (SELF_TEST) {
    const enough = failed.length >= 3
    console.log(enough
      ? `自测通过：注入缺陷后 ${failed.length} 条 FAIL（要求 ≥3）`
      : `自测失败：注入缺陷后只有 ${failed.length} 条 FAIL（要求 ≥3），闸门漏检`)
    process.exit(enough ? 0 : 1)
  }
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => { console.error('探针自身出错：', e); process.exit(2) })
