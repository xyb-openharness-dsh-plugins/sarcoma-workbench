/* 关键页截图（G1 交付物用，不作为断言证据）
 *
 * 用途：给第一次确认时"能直接看"的一组图。断言证据仍然只认 probe-*.mjs 的输出——
 * 截图不算证据（docs/32 §5、docs/22 都写了这条），这里只解决"人能看见"。
 *
 * 跑法：NODE_OPTIONS= node scripts/shoot-pages.mjs [--out docs/shots]
 * 产物：docs/shots/<序号>-<名字>-<宽度>.png
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPuppeteer, PUPPETEER_HINT } from './lib/load-puppeteer.mjs'

/* 解析顺序见 scripts/lib/load-puppeteer.mjs；换机设 PUPPETEER_PATH 即可（评审 P2-3）。 */
const puppeteer = loadPuppeteer()
if (!puppeteer) { console.log(PUPPETEER_HINT); process.exit(2) }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROTO = path.join(ROOT, 'prototypes', 'v0.2')
const argOf = (k, d) => {
  const i = process.argv.indexOf(k)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d
}
const OUT = path.resolve(ROOT, argOf('--out', 'docs/shots'))
const PORT = Number(argOf('--port', '8166'))

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8'
}

function serve() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0])
    if (url === '/favicon.ico') { res.writeHead(204); return res.end() }
    const file = path.join(PROTO, url === '/' ? 'index.html' : url)
    if (!file.startsWith(PROTO) || !fs.existsSync(file)) { res.writeHead(404); return res.end('not found') }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  return new Promise((r) => server.listen(PORT, () => r(server)))
}

function findChrome() {
  const list = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ]
  return list.find((p) => fs.existsSync(p))
}

const SHOTS = [
  { name: 'dashboard', view: 'dashboard' },
  { name: 'tumor-pathology', view: 'tumor', sub: 0 },
  { name: 'diagnosis-timeline', view: 'diagnosis', sub: 0 },
  { name: 'surgery-margin', view: 'surgery', sub: 1 },
  { name: 'treatment-lines', view: 'treatment', sub: 0 },
  { name: 'tox-records', view: 'tox', sub: 0 },
  { name: 'function-tess', view: 'function', sub: 1 },
  { name: 'labs-onechart', view: 'labs', sub: 1 },
  { name: 'followup-cadence', view: 'followup', sub: 1 },
  { name: 'imaging-intake', view: 'imaging', sub: 2 },
  { name: 'trials-2026', view: 'trials', sub: 0 }
]

async function main() {
  const chrome = findChrome()
  if (!chrome) { console.error('找不到 Chrome'); process.exit(2) }
  fs.mkdirSync(OUT, { recursive: true })
  const server = await serve()
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--proxy-server=' + (process.env.http_proxy || 'http://127.0.0.1:7890')]
  })
  const made = []
  try {
    for (const w of [1280, 390]) {
      const page = await browser.newPage()
      await page.setViewport({ width: w, height: w > 800 ? 900 : 844, deviceScaleFactor: 1 })
      await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle0' })
      let n = 0
      for (const s of SHOTS) {
        // render() 会重建 DOM，每次都要重新取按钮
        await page.evaluate(({ view, sub }) => {
          const nav = Array.from(document.querySelectorAll('#nav button'))
          const b = nav.find((x) => x.dataset.view === view || (x.getAttribute('data-go') === view))
          if (b) b.click()
        }, s)
        await new Promise((r) => setTimeout(r, 120))
        if (typeof s.sub === 'number') {
          await page.evaluate(({ idx }) => {
            const tabs = Array.from(document.querySelectorAll('#main .subnav button'))
            if (tabs[idx]) tabs[idx].click()
          }, { idx: s.sub })
          await new Promise((r) => setTimeout(r, 120))
        }
        n += 1
        const file = path.join(OUT, `${String(n).padStart(2, '0')}-${s.name}-${w}.png`)
        await page.screenshot({ path: file, fullPage: false })
        made.push(file)
      }
      // 三个特色态：整页视图 / 疾病概要「?」/ 医疗记录详情
      if (w === 1280) {
        await page.evaluate(() => {
          const nav = Array.from(document.querySelectorAll('#nav button'))
          const b = nav.find((x) => x.dataset.view === 'surgery')
          if (b) b.click()
        })
        await new Promise((r) => setTimeout(r, 150))
        await page.evaluate(() => document.querySelector('[data-pv="surgery"]')?.click())
        await new Promise((r) => setTimeout(r, 350))
        const f1 = path.join(OUT, `90-fullpage-surgery-${w}.png`)
        await page.screenshot({ path: f1 })
        made.push(f1)
        await page.keyboard.press('Escape')
        await new Promise((r) => setTimeout(r, 300))
        await page.evaluate(() => document.querySelector('[data-primer-open]')?.click())
        await new Promise((r) => setTimeout(r, 350))
        const f2 = path.join(OUT, `91-primer-top-${w}.png`)
        await page.screenshot({ path: f2 })
        made.push(f2)
        await page.evaluate(() => {
          const panel = document.querySelector('.dp-panel .dp-body')
          if (panel) panel.scrollTop = panel.scrollHeight * 0.45
        })
        await new Promise((r) => setTimeout(r, 200))
        const f3 = path.join(OUT, `92-primer-mid-${w}.png`)
        await page.screenshot({ path: f3 })
        made.push(f3)
      }
      await page.close()
    }
  } finally {
    await browser.close()
    server.close()
  }
  console.log(`已生成 ${made.length} 张，目录：${path.relative(ROOT, OUT)}`)
  for (const f of made) console.log('  ' + path.relative(ROOT, f))
}

main().catch((e) => { console.error('截图脚本出错：', e); process.exit(2) })
