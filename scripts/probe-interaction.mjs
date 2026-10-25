#!/usr/bin/env node
/**
 * X 层交互路径走查 · 小韧宝 SarcPal 软组织肉瘤工作台
 *
 * 判据：docs/28-INTERACTION-PATH-DESIGN.md 第 5 节 IP1–IP10 +
 *       skills/hvt-requirement-review/references/interaction-path-consistency.md X1–X4。
 * 合同：docs/INTERACTION-DESIGN.md 表 1 的场景路径与覆盖页签。
 *
 * 本脚本只做 DOM 断言：不看截图、不读肉眼结论。
 *   X1  页面覆盖：从合同表 1 的「⑥ 覆盖页签」列解析 key，与 PAGES/TABS 做集合差，孤儿=0。
 *   X2  场景路径：A/B/C 三条路径从看板入口逐步真点，每步断言导航 key、标题、页签、内容指纹；
 *       末尾断言回看板；再从看板记录详情进出一次，断言滚动位置还原。
 *   X3  通道一致：逐页统计手工编辑入口；检查「⋯ 更多」、表单字段、数字键盘、更正语言。
 *   X4  无头断言：资料整理四步（上传→解析候选→逐项核对→入库），断言未核对不入库、候选与事实分表。
 *
 * 用法：
 *   export NODE_OPTIONS=
 *   node scripts/probe-interaction.mjs
 *   node scripts/probe-interaction.mjs --self-test   # 注入 3 个缺陷，要求至少 2 条 FAIL
 *   node scripts/probe-interaction.mjs --port 8126
 *
 * 依赖：puppeteer-core（家族 workspace 已装）+ 本机 Chrome。
 *
 * 两个必须记住的坑（与 probe-prototype.mjs 同源）：
 *   ① render() 会整块重建 #main；每步都要重新 querySelector，不能缓存元素。
 *   ② 页面里的页签文字也在 #main 里；内容指纹必须先扣掉 .subnav，否则断言自动变绿。
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const argOf = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }
const SELF_TEST = args.includes('--self-test')
const PORT = Number(argOf('--port') || 8126)
const DOC = join(ROOT, 'docs/INTERACTION-DESIGN.md')
const PROTOTYPE = join(ROOT, 'prototypes/v0.2')
const BASE_PATH = '/prototypes/v0.2/index.html'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json'
}

const PAGE_LABEL = {
  dashboard: '看板',
  tumor: '我的肿瘤',
  diagnosis: '确诊路径',
  surgery: '手术与伤口',
  treatment: '治疗与线序',
  tox: '副作用与不适',
  function: '功能与康复',
  labs: '化验与指标',
  followup: '复查与随访',
  imaging: '影像与报告',
  life: '生活与照护',
  trials: '临床研究'
}

/* X3 口径：能直接改数据的手工入口。
   data-action 里属于新增/保存的按钮 + 带保存动作的整页表单入口（手术档案、TESS 作答）。
   查看类 data-pv（切缘、伤口、线序、随访五档、报告原文）不计。 */
const EDIT_ACTIONS = ['add-cost', 'add-contact', 'add-question', 'add-trial', 'save-cost', 'save-contact', 'save-question', 'save-trial', 'save-draft', 'tess-save']
const EDIT_PV = ['surgery', 'tess']

/* ---------------- 工程骨架 ---------------- */
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

/* ---------------- 小工具 ---------------- */
async function gotoFresh(page, base) {
  await page.goto(base, { waitUntil: 'networkidle0' })
  await sleep(80)
  if (SELF_TEST) await injectDefects(page)
}

async function clickNav(page, view) {
  const ok = await page.evaluate((v) => {
    const b = document.querySelector(`#nav [data-view="${v}"]`)
    if (!b) return false
    b.click()
    return true
  }, view)
  await sleep(50)
  return ok
}

async function clickTab(page, name) {
  const ok = await page.evaluate((n) => {
    const b = [...document.querySelectorAll('.subnav [data-sub]')].find((x) => x.textContent.trim() === n)
    if (!b) return false
    b.click()
    return true
  }, name)
  await sleep(50)
  return ok
}

async function clickTabIndex(page, i) {
  const ok = await page.evaluate((i) => {
    const b = document.querySelectorAll('.subnav [data-sub]')[i]
    if (!b) return false
    b.click()
    return true
  }, i)
  await sleep(50)
  return ok
}

async function clickEntry(page, selector, text) {
  return page.evaluate(({ selector, text }) => {
    const els = [...document.querySelectorAll(selector)]
    const el = els.find((e) => e.textContent.includes(text))
    if (!el) return { found: false, count: els.length }
    const visibleText = el.textContent.replace(/\s+/g, ' ').trim()
    el.click()
    return { found: true, visibleText, count: els.length }
  }, { selector, text })
}

async function getState(page) {
  return page.evaluate(() => {
    const nav = document.querySelector('#nav [aria-current="page"]')
    const h1 = document.querySelector('.page-head h1')
    const tabs = [...document.querySelectorAll('.subnav [data-sub]')]
    const sel = tabs.find((b) => b.getAttribute('aria-selected') === 'true')
    const main = document.querySelector('#main')
    const clone = main ? main.cloneNode(true) : null
    if (clone) clone.querySelectorAll('.subnav').forEach((n) => n.remove())
    return {
      view: nav?.dataset.view || null,
      navText: (nav?.textContent || '').trim(),
      h1: (h1?.textContent || '').trim(),
      tab: (sel?.textContent || '').trim(),
      tabIndex: sel ? Number(sel.dataset.sub) : null,
      scrollY: Math.round(window.scrollY),
      text: clone ? (clone.textContent || '').replace(/\s+/g, ' ').trim() : ''
    }
  })
}

async function expectPage(page, id, view, subName, needle = '', extra = '') {
  const s = await getState(page)
  const label = PAGE_LABEL[view]
  const tabOk = subName ? s.tab === subName : s.tabIndex === null
  const needleOk = !needle || s.text.includes(needle)
  const ok = s.view === view && s.h1 === label && s.navText === label && tabOk && needleOk
  check(id, `${label}${subName ? ' › ' + subName : ''}`, ok,
    `view=${s.view} h1=${s.h1} nav=${s.navText} tab=${s.tab || '—'}${needle ? ` 指纹含「${needle}」=${needleOk}` : ''}${extra ? '  ' + extra : ''}`)
  return s
}

/* ---------------- 自测缺陷注入 ---------------- */
/* 三个缺陷各自打一条断言，且互不阻断流程：
   ① 删掉「加一条问题」按钮                → A-09
   ② 把候选节点塞进「档案里已有的事实」卡  → X4-03 / C-11-03
   ③ 在看板塞 2 个 data-action=add-cost    → X3a
   注入后任何一次 page.goto 都会冲掉，gotoFresh 每次重新注入。 */
async function injectDefects(page) {
  await page.evaluate(() => {
    if (window.__stObs) window.__stObs.disconnect()
    const obs = new MutationObserver(() => {
      document.querySelectorAll('[data-action="add-question"]').forEach((n) => n.remove())

      const body = document.querySelector('.pv-body')
      if (body && body.textContent.includes('解析候选') && body.textContent.includes('档案里已有的事实')) {
        const cards = [...body.querySelectorAll('.grid.two > .card')]
        const fact = cards[1]
        if (fact && !fact.querySelector('.selftest-leak')) {
          const d = document.createElement('div')
          d.className = 'mini-item selftest-leak'
          d.textContent = '自测泄漏：候选已写入业务事实'
          ;(fact.querySelector('.mini-list') || fact).appendChild(d)
        }
      }

      const main = document.querySelector('#main')
      if (main && main.querySelector('.hero') && !main.querySelector('.selftest-edit')) {
        for (let i = 0; i < 2; i++) {
          const b = document.createElement('button')
          b.type = 'button'
          b.className = 'primary selftest-edit'
          b.dataset.action = 'add-cost'
          b.textContent = `自测编辑入口 ${i + 1}`
          main.appendChild(b)
        }
      }
    })
    obs.observe(document.body, { childList: true, subtree: true })
    window.__stObs = obs
  })
  await sleep(60)
}

/* ---------------- X1 页面覆盖 ---------------- */
function keysFromDoc(doc) {
  const keys = new Set()
  for (const line of doc.split('\n')) {
    if (!/^\|\s*[ABC]\s*\|/.test(line)) continue
    const cells = line.split('|')
    const last = cells[cells.length - 2] || ''
    for (const m of last.matchAll(/`([a-z]+(?:\/\d+)?)`/g)) keys.add(m[1])
  }
  return keys
}

async function x1(page, base) {
  const doc = await readFile(DOC, 'utf8')
  const docKeys = keysFromDoc(doc)
  await gotoFresh(page, base)

  const impl = new Set()
  const views = await page.evaluate(() => [...document.querySelectorAll('#nav [data-view]')].map((b) => b.dataset.view))
  for (const view of views) {
    await clickNav(page, view)
    const n = await page.evaluate(() => document.querySelectorAll('.subnav [data-sub]').length)
    /* 有页签的页：状态是 (view, sub)，view 本身只是默认 sub=0 的入口，不单算一个状态。
       无页签的页（看板）：状态就是 view。 */
    if (!n) impl.add(view)
    for (let i = 0; i < n; i++) impl.add(`${view}/${i}`)
  }

  const missing = [...docKeys].filter((k) => !impl.has(k))
  const orphans = [...impl].filter((k) => !docKeys.has(k))
  check('X1a', '合同表 1 解析出的状态数 = 37', docKeys.size === 37, `文档 key=${docKeys.size}`)
  check('X1b', '实现侧状态数 = 37（12 一级 + 36 页签）', impl.size === 37, `DOM key=${impl.size}`)
  check('X1c', '文档里的 key 在实现中都存在（无缺失）', missing.length === 0, missing.length ? missing.join('、') : '缺失 0')
  check('X1d', '实现里的 key 都被至少一条路径覆盖（孤儿=0）', orphans.length === 0, orphans.length ? orphans.join('、') : '孤儿 0')

  let reach = 0
  for (const key of docKeys) {
    const [view, sub] = key.includes('/') ? key.split('/') : [key, null]
    await clickNav(page, view)
    if (sub !== null) await clickTabIndex(page, Number(sub))
    const s = await getState(page)
    const ok = s.view === view && (sub === null ? s.tabIndex === null : s.tabIndex === Number(sub))
    if (ok) reach++
    else console.log(`      · 不可达：${key} → view=${s.view} tabIndex=${s.tabIndex}`)
  }
  check('X1e', '文档里的每个 key 可点达且选中态正确', reach === docKeys.size, `${reach}/${docKeys.size}`)
  check('X1', 'X1 页面覆盖：37 个状态 / 覆盖 37 / 孤儿 0', docKeys.size === 37 && impl.size === 37 && missing.length === 0 && orphans.length === 0 && reach === 37,
    `doc=${docKeys.size} impl=${impl.size} missing=${missing.length} orphan=${orphans.length} reach=${reach}`)
}

/* ---------------- X4 资料整理四步（C 路径也用） ---------------- */
async function intakeState(page) {
  return page.evaluate(() => {
    const body = document.querySelector('.pv-body')
    const on = body?.querySelector('.flow-steps .on')?.textContent.trim() || ''
    const cards = body ? [...body.querySelectorAll('.grid.two > .card')] : []
    const btn = body?.querySelector('[data-action="intake-next"]')
    return {
      on,
      cards: cards.length,
      cardCands: cards.map((c) => c.querySelectorAll('.candidate').length),
      titles: cards.map((c) => c.querySelector('h2')?.textContent.trim() || ''),
      cands: body ? body.querySelectorAll('.candidate').length : 0,
      pending: body ? [...body.querySelectorAll('.mini-item')].filter((n) => n.textContent.includes('待核对')).length : 0,
      btn: btn ? { text: btn.textContent.trim(), disabled: btn.disabled } : null,
      leak: body ? body.querySelectorAll('.selftest-leak').length : 0,
      text: (body?.textContent || '').replace(/\s+/g, ' ').trim()
    }
  })
}

async function walkIntake(page, prefix) {
  const opened = await page.evaluate(() => {
    const b = document.querySelector('[data-pv="intake"]')
    if (!b) return false
    b.click()
    return true
  })
  await sleep(300)
  const s1 = await intakeState(page)
  check(`${prefix}-01`, '进入资料整理：第 1 步「上传」可达', opened && s1.on.includes('1 上传') && s1.text.includes('用演示文件模拟上传'),
    `on=${s1.on} 上传按钮=${s1.text.includes('用演示文件模拟上传')}`)

  await page.evaluate(() => document.querySelector('[data-action="intake-demo"]')?.click())
  await sleep(250)
  const s2 = await intakeState(page)
  check(`${prefix}-02`, '上传后到第 2 步「解析候选」：3 条候选全为待核对，且无入库按钮',
    s2.on.includes('2 解析候选') && s2.pending >= 3 && !s2.text.includes('入库（已采用'),
    `on=${s2.on} 待核对=${s2.pending} 入库按钮=${s2.text.includes('入库（已采用')}`)

  await page.evaluate(() => document.querySelector('[data-action="intake-next"]')?.click())
  await sleep(250)
  const s3 = await intakeState(page)
  check(`${prefix}-03`, '第 3 步「逐项核对」：候选与业务事实分表（3 条候选 / 事实卡 0 条候选，无候选泄漏）',
    s3.on.includes('3 逐项核对') && s3.cards === 2 && s3.cardCands[0] === 3 && s3.cardCands[1] === 0 && s3.leak === 0,
    `on=${s3.on} 卡片=${s3.cards} 候选分布=${s3.cardCands.join('/')} 泄漏=${s3.leak} 标题=${s3.titles.join('｜')}`)

  const before = await intakeState(page)
  await page.evaluate(() => document.querySelector('[data-action="intake-next"]')?.click())
  await sleep(200)
  const afterClick = await intakeState(page)
  check(`${prefix}-04`, '未核对不入库：0 条采用时入库按钮 disabled，点击不前进',
    !!before.btn && before.btn.disabled && before.btn.text.includes('已采用 0 条') && afterClick.on.includes('3 逐项核对'),
    `按钮=${before.btn ? before.btn.text + ' disabled=' + before.btn.disabled : '无'} 点击后=${afterClick.on}`)

  const rejected = await page.evaluate(() => {
    const b = document.querySelector('[data-intake="c3"][data-decision="reject"]')
    if (!b) return false
    b.click()
    return true
  })
  await sleep(200)
  const s5 = await intakeState(page)
  const rejectedText = await page.evaluate(() => document.querySelector('[data-intake="c3"][data-decision="reject"]')?.textContent.trim() || '')
  check(`${prefix}-05`, '拒收候选零副作用：不采用只改候选决定，采用数仍 0，入库仍 disabled',
    rejected && rejectedText.includes('已不采用') && s5.btn && s5.btn.disabled && s5.btn.text.includes('已采用 0 条'),
    `c3=${rejectedText || '—'} 按钮=${s5.btn ? s5.btn.text + ' disabled=' + s5.btn.disabled : '无'}`)

  const accepted = await page.evaluate(() => {
    const b = document.querySelector('[data-intake="c2"][data-decision="accept"]')
    if (!b) return false
    b.click()
    return true
  })
  await sleep(200)
  const s6 = await intakeState(page)
  const enabled = !!s6.btn && !s6.btn.disabled && s6.btn.text.includes('已采用 1 条')
  check(`${prefix}-06`, '逐项核对后入库按钮启用（已采用 1 条）', accepted && enabled,
    `按钮=${s6.btn ? s6.btn.text + ' disabled=' + s6.btn.disabled : '无'}`)

  await page.evaluate(() => document.querySelector('[data-action="intake-next"]')?.click())
  await sleep(250)
  const s7 = await intakeState(page)
  check(`${prefix}-07`, '第 4 步「入库」：只入采用的 1 条，不采用的 1 条保留',
    s7.on.includes('4 入库') && s7.text.includes('已入库 1 条候选') && s7.text.includes('采用 1 条') && s7.text.includes('不采用 1 条'),
    `on=${s7.on} 已入库=${s7.text.includes('已入库 1 条候选')} 采用/不采用=${s7.text.includes('采用 1 条')}/${s7.text.includes('不采用 1 条')}`)

  await page.evaluate(() => document.querySelector('.pv-head-actions .pv-btn-icon')?.click())
  await sleep(500)
  return s7
}

/* ---------------- X2 场景 A ---------------- */
async function pathA(page, base) {
  const start = results.length
  await gotoFresh(page, base)

  const e1 = await clickEntry(page, '#main [data-view="diagnosis"]', '打开确诊路径')
  check('A-01a', '入口文案「打开确诊路径」逐字存在', e1.found, e1.found ? `DOM 文案「${e1.visibleText}」` : `候选 ${e1.count} 个，未命中`)
  await sleep(100)
  await expectPage(page, 'A-01b', 'diagnosis', '时间轴', '只记事实与日期')

  await clickTab(page, '活检与病理会诊')
  await expectPage(page, 'A-02', 'diagnosis', '活检与病理会诊', '送了哪家会诊')
  await clickTab(page, '关键日期')
  await expectPage(page, 'A-03', 'diagnosis', '关键日期', '日期之间不计算「延误」')

  await clickNav(page, 'tumor')
  await expectPage(page, 'A-04', 'tumor', '亚型与病理', '50 余种恶性亚型')
  await clickTab(page, '分期与分级')
  await expectPage(page, 'A-05', 'tumor', '分期与分级', '分期（AJCC 第 8 版）')

  await clickNav(page, 'surgery')
  await expectPage(page, 'A-06', 'surgery', '手术档案', '打开手术档案（整页表单）')
  await clickTab(page, '切缘记录')
  await expectPage(page, 'A-07', 'surgery', '切缘记录', '切缘只抄原文')

  await clickNav(page, 'followup')
  await expectPage(page, 'A-08', 'followup', '影像时间轴', '影像按日期并列摆放')
  await clickTab(page, '问题清单')
  await expectPage(page, 'A-09a', 'followup', '问题清单', '加一条问题')

  const before = await page.evaluate(() => document.querySelectorAll('#main .card .row').length)
  const opened = await page.evaluate(() => {
    const b = document.querySelector('[data-action="add-question"]')
    if (!b) return false
    b.click()
    return true
  })
  await sleep(120)
  let saved = false
  let countAfter = before
  if (opened) {
    await page.evaluate(() => {
      document.querySelector('#q-d').value = '2026-10-20'
      document.querySelector('#q-q').value = '第二次手术切缘那行字，门诊怎么解释？'
      document.querySelector('#dialog-foot [data-action="save-question"]')?.click()
    })
    await sleep(220)
    saved = await page.evaluate(() => document.querySelector('#dialog')?.open === false)
    countAfter = await page.evaluate(() => document.querySelectorAll('#main .card .row').length)
  }
  check('A-09', '产物：问题清单 +1（保存后行数 +1）', opened && saved && countAfter === before + 1,
    `按钮=${opened} 弹窗关闭=${saved} 行数 ${before}→${countAfter}`)

  await clickNav(page, 'life')
  await expectPage(page, 'A-10', 'life', '异地就医与资源', '在哪看的')

  await clickNav(page, 'dashboard')
  const home = await expectPage(page, 'A-11', 'dashboard', null, '只回答三件事')
  check('A-11b', '回首页：看板在顶部（scrollY=0）', home.scrollY === 0, `scrollY=${home.scrollY}`)

  const target = await page.evaluate(() => {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight)
    const t = Math.min(600, max)
    window.scrollTo(0, t)
    return t
  })
  await sleep(100)
  const openedPv = await page.evaluate(() => {
    const b = document.querySelector('#main [data-record]')
    if (!b) return false
    b.click()
    return true
  })
  await sleep(350)
  const pv = await page.evaluate(() => ({ hidden: document.querySelector('.pv-overlay')?.hidden, title: document.querySelector('.pv-title')?.textContent || '' }))
  await page.evaluate(() => document.querySelector('.pv-head-actions .pv-btn-icon')?.click())
  await sleep(700)
  const back = await page.evaluate(() => ({ hidden: document.querySelector('.pv-overlay')?.hidden, scrollY: Math.round(window.scrollY), lock: document.documentElement.classList.contains('pv-lock') }))
  check('A-12', '记录详情进出后回到看板，滚动位置还原', openedPv && pv.hidden === false && back.hidden === true && !back.lock && Math.abs(back.scrollY - target) <= 2,
    `目标=${target} 打开=${pv.title || '无'} 关闭后 scrollY=${back.scrollY} lock=${back.lock}`)

  const fails = results.slice(start).filter((r) => !r.ok)
  check('X2-A', '场景 A 走通（看板 → 确诊路径 → 我的肿瘤 → 手术与伤口 → 复查与随访 → 生活与照护 → 看板）', fails.length === 0,
    fails.length ? `${fails.length} 条失败：${fails.map((f) => f.id).join(',')}` : '全部通过')
}

/* ---------------- X2 场景 B ---------------- */
async function pathB(page, base) {
  const start = results.length
  await gotoFresh(page, base)

  /* 看板没有直接到「手术与伤口」「功能与康复」的任务卡。B 用看板任务卡 ③
     「带问题清单去复诊」作为复诊前入口，再从复诊链走到伤口、功能、放疗、报告原文。
     这条入口缺口本身记在 docs/INTERACTION-DESIGN.md §六 第 4 条。 */
  const e1 = await clickEntry(page, '#main .task-entry[data-view="followup"][data-sub="2"]', '带问题清单去复诊')
  check('B-01a', '入口文案「带问题清单去复诊」逐字存在（看板任务卡 ③）', e1.found, e1.found ? `DOM 文案「${e1.visibleText}」` : `候选 ${e1.count} 个，未命中`)
  await sleep(120)
  await expectPage(page, 'B-01b', 'followup', '问题清单', '加一条问题')

  await clickNav(page, 'surgery')
  await expectPage(page, 'B-02a', 'surgery', '手术档案', '打开手术档案（整页表单）')
  await clickTab(page, '伤口与恢复')
  await expectPage(page, 'B-02b', 'surgery', '伤口与恢复', '伤口记录是你自己的话')

  await page.evaluate(() => document.querySelector('[data-pv="wound"]')?.click())
  await sleep(300)
  const wound = await page.evaluate(() => ({ title: document.querySelector('.pv-title')?.textContent || '', cards: document.querySelectorAll('.pv-body .card').length, text: document.querySelector('.pv-body')?.textContent || '' }))
  check('B-03', '伤口与恢复（整页）：5 条时间序列可见', wound.title === '伤口与恢复' && wound.cards === 5 && wound.text.includes('照片位'),
    `title=${wound.title} 记录卡=${wound.cards}`)
  await page.evaluate(() => document.querySelector('.pv-head-actions .pv-btn-icon')?.click())
  await sleep(500)

  await clickNav(page, 'tumor')
  await expectPage(page, 'B-04a', 'tumor', '亚型与病理', '50 余种恶性亚型')
  await clickTab(page, '部位与大小')
  await expectPage(page, 'B-04b', 'tumor', '部位与大小', '部位只记报告原文')

  await clickNav(page, 'function')
  await expectPage(page, 'B-05a', 'function', '日常动作', '这是你自己的话')
  await clickTab(page, 'TESS 自评')
  await expectPage(page, 'B-05b', 'function', 'TESS 自评', '最近一次 TESS')

  await page.evaluate(() => document.querySelector('[data-pv="tess"]')?.click())
  await sleep(300)
  const tess0 = await page.evaluate(() => ({ title: document.querySelector('.pv-title')?.textContent || '', items: document.querySelectorAll('.pv-body .tess-item').length }))
  await page.evaluate(() => {
    const r = document.querySelector('input[data-tess-i="0"][value="3"]')
    if (r) r.click()
    document.querySelector('[data-action="tess-save"]')?.click()
  })
  await sleep(220)
  const tess1 = await page.evaluate(() => ({ status: document.querySelector('#tess-status')?.textContent.trim() || '', text: document.querySelector('.pv-body')?.textContent || '' }))
  check('B-06', '产物：TESS 原始作答 +1（保存后显示「已记录 1 题」，不显示总分/趋势）',
    tess0.title === 'TESS 自评作答' && tess0.items === 30 && tess1.status.includes('已记录 1 题') && !tess1.text.includes('总分：'),
    `title=${tess0.title} 题数=${tess0.items} status=${tess1.status}`)
  await page.evaluate(() => document.querySelector('.pv-head-actions .pv-btn-icon')?.click())
  await sleep(500)

  await clickTab(page, '康复记录')
  await expectPage(page, 'B-07', 'function', '康复记录', '康复观察项')

  await clickNav(page, 'treatment')
  await expectPage(page, 'B-08a', 'treatment', '线序时间轴', '线序是事实')
  await clickTab(page, '放疗')
  await expectPage(page, 'B-08b', 'treatment', '放疗', '放疗是局部治疗')

  await clickNav(page, 'imaging')
  await expectPage(page, 'B-09a', 'imaging', '影像时间轴', '影像方式、部位、日期、结论原文并列')
  await clickTab(page, '报告原文')
  await expectPage(page, 'B-09b', 'imaging', '报告原文', '报告原文只能从记录详情')

  await clickNav(page, 'followup')
  const staleTab = (await getState(page)).tab
  await clickTab(page, '影像时间轴')
  const coll = await expectPage(page, 'B-10', 'followup', '影像时间轴', '影像按日期并列摆放',
    `仅点一级导航时页签=「${staleTab || '—'}」（保留上次），点页签后=影像时间轴`)

  await clickNav(page, 'dashboard')
  const home = await expectPage(page, 'B-11', 'dashboard', null, '只回答三件事')
  check('B-11b', '回首页：看板在顶部（scrollY=0）', home.scrollY === 0 && coll.scrollY >= 0, `scrollY=${home.scrollY}`)

  const fails = results.slice(start).filter((r) => !r.ok)
  check('X2-B', '场景 B 走通（看板任务卡 → 问题清单 → 伤口 → 部位 → 功能/TESS → 放疗 → 报告原文 → 复查 → 看板）', fails.length === 0,
    fails.length ? `${fails.length} 条失败：${fails.map((f) => f.id).join(',')}` : '全部通过')
}


/* ---------------- X3 通道一致 ---------------- */
async function x3(page, base) {
  const start = results.length
  await gotoFresh(page, base)

  const views = await page.evaluate(() => [...document.querySelectorAll('#nav [data-view]')].map((b) => b.dataset.view))
  const counts = {}
  let entries = 0
  let inMenu = 0

  for (const view of views) {
    await clickNav(page, view)
    const n = await page.evaluate(() => document.querySelectorAll('.subnav [data-sub]').length)
    let max = 0
    const subs = n ? [...Array(n).keys()] : [null]
    for (const i of subs) {
      if (i !== null) await clickTabIndex(page, i)
      const c = await page.evaluate(({ actions, pvs }) => {
        const hit = [...document.querySelectorAll('#main button')].filter((b) => actions.includes(b.dataset.action) || pvs.includes(b.dataset.pv))
        return {
          count: hit.length,
          labels: hit.map((b) => b.textContent.trim()),
          inMenu: hit.filter((b) => b.closest('[data-more], .more, [aria-haspopup="menu"]')).length
        }
      }, { actions: EDIT_ACTIONS, pvs: EDIT_PV })
      max = Math.max(max, c.count)
      entries += c.count
      inMenu += c.inMenu
    }
    counts[view] = max
  }

  const over = Object.entries(counts).filter(([, v]) => v > 1)
  check('X3a', '每页显式手工编辑入口 ≤1（逐页计数）', over.length === 0,
    Object.entries(counts).map(([k, v]) => `${PAGE_LABEL[k]}=${v}`).join(' · '))

  check('X3b', '手工入口统一收在「⋯ 更多」', entries > 0 && inMenu === entries,
    `编辑入口 ${entries} 个，其中在「⋯ 更多」内 ${inMenu} 个`)

  await clickNav(page, 'surgery')
  await clickTabIndex(page, 0)
  await page.evaluate(() => document.querySelector('[data-pv="surgery"]')?.click())
  await sleep(300)
  const form = await page.evaluate(() => {
    const fields = [...document.querySelectorAll('.pv-body .form-grid .field')]
    const numericText = fields.filter((f) => {
      const label = f.querySelector('label')?.textContent || ''
      const input = f.querySelector('input')
      return /时长|出血量/.test(label) && input && input.type === 'text'
    }).length
    return { fields: fields.length, labels: fields.map((f) => f.querySelector('label')?.textContent.trim()), numericText }
  })
  check('X3c', '手工表单字段 ≤6/张', form.fields <= 6, `手术档案 ${form.fields} 个字段：${form.labels.join('、')}`)
  check('X3d', '数字输入用键盘组件（手术时长/出血量不用文本框）', form.numericText === 0, `文本框数字字段 ${form.numericText} 个（手术时长、出血量）`)
  await page.evaluate(() => document.querySelector('.pv-head-actions .pv-btn-icon')?.click())
  await sleep(400)

  await clickNav(page, 'dashboard')
  /* X3e 的两处口径修正（2026-10-25，属于「断言写法和它想验的事不是一件」）：
     ① 输入框：原来只认 #agent-body 里的控件。可输入区在面板底部 .agent-foot 里，
        而且**必须**在那儿——#agent-body 每次 render 都重建，放进去打个字就没了。
        所以判据改成「面板 #agent 内有没有输入控件」，不再绑定某个子容器。
     ② 候选：原来在**看板**上数 #main .candidate。看板本来就没有 AI 整理入口，
        AI 产出结构化候选的地方是「影像与报告 › 资料整理」，同一件事 X4-02 已经逐条验过。
        在这里数只会恒为 0，属于假红；改为到资料整理那一步数。 */
  const ai = await page.evaluate(() => ({
    input: document.querySelectorAll('#agent-dock input, #agent-dock textarea, #agent-dock [contenteditable="true"]').length,
    ask: document.querySelectorAll('#agent-body [data-action="ask"]').length
  }))
  await clickNav(page, 'imaging')
  await clickTabIndex(page, 2)
  /* 候选只在「逐项核对」那一步才渲染成 .candidate，而且四步流程在整页视图里。
     这里走进「资料整理」开到第 3 步再数——不是放宽判据，是走到候选真的在页面上的那一步。 */
  await page.evaluate(() => document.querySelector('[data-pv="intake"]')?.click())
  await sleep(300)
  await page.evaluate(() => document.querySelector('[data-action="intake-demo"]')?.click())
  await sleep(250)
  await page.evaluate(() => document.querySelector('[data-action="intake-next"]')?.click())
  await sleep(250)
  const cand = await page.evaluate(() => document.querySelectorAll('.candidate').length)
  await page.evaluate(() => document.querySelector('.pv-head-actions .pv-btn-icon')?.click())
  await sleep(400)
  check('X3e', 'AI 默认通道有输入框，且产出结构化候选（不是固定回复）', ai.input > 0 && cand > 0,
    `输入控件=${ai.input} 固定示例按钮=${ai.ask} 逐项核对页候选=${cand}`)
  await clickNav(page, 'dashboard')

  const askText = await page.evaluate(() => {
    const b = document.querySelector('#agent-body [data-action="ask"]')
    if (!b) return ''
    b.click()
    return document.querySelector('#agent-output')?.textContent.trim() || ''
  })
  check('X3f', 'AI 示例按钮不代替患者发言（不直接产出回复）', !askText.includes('你问：'),
    askText ? `点击后直接回复「${askText.slice(0, 32)}…」` : '没有示例按钮')

  const appSrc = await readFile(join(PROTOTYPE, 'app.js'), 'utf8')
  const idxSrc = await readFile(join(PROTOTYPE, 'index.html'), 'utf8')
  const src = appSrc + idxSrc
  const noRecover = (src.match(/不可恢复/g) || []).length
  const correct = (src.match(/改这一条/g) || []).length
  check('X3g', '全站无「不可恢复」文案', noRecover === 0, `命中 ${noRecover}`)
  check('X3h', '存在「改这一条」更正入口（删除=更正）', correct > 0, `命中 ${correct}`)

  const fails = results.slice(start).filter((r) => !r.ok)
  check('X3', 'X3 通道一致：手工收敛 + AI 候选闭环 + 无裸删除',
    fails.length === 0,
    fails.length ? `${fails.length} 条未过：${fails.map((f) => f.id).join(',')}` : '全部通过')
}

/* ---------------- X4 资料整理闭环 ---------------- */
async function x4(page, base) {
  const start = results.length
  await gotoFresh(page, base)
  await clickNav(page, 'imaging')
  await clickTabIndex(page, 2)
  const img = await getState(page)
  check('X4-00', '入口：影像与报告 › 资料整理（imaging/2）可达', img.view === 'imaging' && img.tab === '资料整理' && img.text.includes('1 上传'),
    `view=${img.view} tab=${img.tab}`)
  await walkIntake(page, 'X4')
  const fails = results.slice(start).filter((r) => !r.ok)
  check('X4', 'X4 AI 产出候选核对闭环：上传 → 解析候选 → 逐项核对 → 入库',
    fails.length === 0,
    fails.length ? `${fails.length} 条未过：${fails.map((f) => f.id).join(',')}` : '全部通过')
}

/* ---------------- X2 场景 C ---------------- */
async function pathC(page, base) {
  const start = results.length
  await gotoFresh(page, base)

  const e1 = await clickEntry(page, '#main .task-entry[data-view="labs"][data-sub="1"]', '看一眼一图秀')
  check('C-01a', '入口文案「看一眼一图秀」逐字存在（看板任务卡）', e1.found, e1.found ? `DOM 文案「${e1.visibleText}」` : `候选 ${e1.count} 个，未命中`)
  await sleep(120)
  await expectPage(page, 'C-01b', 'labs', '一图秀', '一图秀')
  const chart = await page.evaluate(() => !!document.querySelector('.chart-wrap svg.chart'))
  check('C-01c', '一图秀渲染出数值曲线', chart, chart ? 'svg.chart 存在' : '未找到 svg.chart')

  await clickTab(page, '指标卡')
  await expectPage(page, 'C-02', 'labs', '指标卡', '迷你折线')
  await clickTab(page, '参考范围')
  await expectPage(page, 'C-03', 'labs', '参考范围', '×ULN 契约')

  await clickNav(page, 'tox')
  await expectPage(page, 'C-04', 'tox', '副作用记录', '只记你的原话')
  await clickTab(page, '同日化验')
  await expectPage(page, 'C-05', 'tox', '同日化验', '「同日」')
  await clickTab(page, '该联系谁')
  await expectPage(page, 'C-06', 'tox', '该联系谁', '我填的联系人')

  await clickNav(page, 'followup')
  await expectPage(page, 'C-07a', 'followup', '影像时间轴', '影像按日期并列摆放')
  await clickTab(page, '随访节奏')
  await expectPage(page, 'C-07b', 'followup', '随访节奏', '随访五档')

  await clickNav(page, 'treatment')
  await expectPage(page, 'C-08a', 'treatment', '线序时间轴', '线序是事实')
  await clickTab(page, '化疗周期')
  await expectPage(page, 'C-08b', 'treatment', '化疗周期', '没有化疗周期记录')
  await clickTab(page, '靶向与免疫')
  await expectPage(page, 'C-09', 'treatment', '靶向与免疫', '口服靶向或免疫治疗记录')

  await clickNav(page, 'imaging')
  await expectPage(page, 'C-10a', 'imaging', '影像时间轴', '影像方式、部位、日期、结论原文并列')
  await clickTab(page, '资料整理')
  await expectPage(page, 'C-10b', 'imaging', '资料整理', '1 上传')

  await walkIntake(page, 'C-11')

  await clickNav(page, 'trials')
  await expectPage(page, 'C-12a', 'trials', '2026 线索', '试验登记条目')
  await clickTab(page, '篮子试验说明')
  await expectPage(page, 'C-12b', 'trials', '篮子试验说明', '分子路径')
  await clickTab(page, '我记的试验')
  await expectPage(page, 'C-12c', 'trials', '我记的试验', '记一条试验线索')

  await clickNav(page, 'tumor')
  await expectPage(page, 'C-13a', 'tumor', '亚型与病理', '50 余种恶性亚型')
  await clickTab(page, '分子检测')
  await expectPage(page, 'C-13b', 'tumor', '分子检测', 'MDM2（FISH）')

  await clickNav(page, 'life')
  await expectPage(page, 'C-14a', 'life', '异地就医与资源', '在哪看的')
  await clickTab(page, '花费')
  await expectPage(page, 'C-14b', 'life', '花费', '还没有记花费')
  await clickTab(page, '情绪与照护者')
  await expectPage(page, 'C-14c', 'life', '情绪与照护者', '情绪与照护者负担')
  await clickTab(page, '体重与日常')
  await expectPage(page, 'C-14d', 'life', '体重与日常', '体重（自测）')

  await clickNav(page, 'dashboard')
  const home = await expectPage(page, 'C-15', 'dashboard', null, '只回答三件事')
  check('C-15b', '回首页：看板在顶部（scrollY=0）', home.scrollY === 0, `scrollY=${home.scrollY}`)

  const fails = results.slice(start).filter((r) => !r.ok)
  check('X2-C', '场景 C 走通（看板 → 一图秀 → 副作用 → 随访节奏 → 线序 → 资料整理入库 → 临床研究 → 分子检测 → 生活与照护 → 看板）', fails.length === 0,
    fails.length ? `${fails.length} 条失败：${fails.map((f) => f.id).join(',')}` : '全部通过')
}

/* ---------------- 主流程 ---------------- */
async function main() {
  const chrome = findChrome()
  if (!chrome) { console.log('找不到 Chrome：设置 CHROME_PATH 后重试。跳过等于没有这条闸门。'); process.exit(2) }
  let puppeteer
  try {
    const require = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')
    puppeteer = require('puppeteer-core')
  } catch {
    console.log('缺少 puppeteer-core（家族 workspace 未装，或本机路径不同）。跳过等于没有这条闸门。')
    process.exit(2)
  }

  const server = await serve()
  const base = argOf('--url') || `http://127.0.0.1:${PORT}${BASE_PATH}`
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--proxy-server=' + (process.env.http_proxy || 'http://127.0.0.1:7890')]
  })

  const consoleErrors = []
  const pageErrors = []
  try {
    const page = await browser.newPage()
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
    page.on('pageerror', (e) => pageErrors.push(String(e.message)))
    await page.setViewport({ width: 1280, height: 900 })

    await x1(page, base)
    await pathA(page, base)
    await pathB(page, base)
    await x3(page, base)
    await x4(page, base)
    await pathC(page, base)

    check('X-ERR', '全程 0 个 error 级 console、0 个未捕获异常',
      consoleErrors.length === 0 && pageErrors.length === 0,
      [
        consoleErrors.length ? `console.error ${consoleErrors.length}：${consoleErrors.slice(0, 2).join(' | ')}` : '',
        pageErrors.length ? `异常 ${pageErrors.length}：${pageErrors.slice(0, 2).join(' | ')}` : ''
      ].filter(Boolean).join('；') || '两类计数均为 0')
  } finally {
    await browser.close()
    server.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n${failed.length ? 'FAIL' : 'PASS'}  ${results.length - failed.length}/${results.length}`)
  if (SELF_TEST) {
    const injected = ['A-09', 'X3a', 'X4-03']
    const hit = injected.filter((id) => results.some((r) => r.id === id && !r.ok))
    const enough = hit.length >= 2
    console.log(enough
      ? `自测：注入 3 个缺陷（删除「加一条问题」/ 候选泄漏进事实卡 / 伪造 2 个手工编辑入口），命中 ${hit.length}/3 条 FAIL：${hit.join('、')}`
      : `自测失败：注入 3 个缺陷只命中 ${hit.length}/3 条 FAIL（要求 ≥2）：${hit.join('、') || '无'}，闸门漏检`)
    process.exit(enough ? 0 : 1)
  }
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => { console.error('探针自身出错：', e); process.exit(2) })
