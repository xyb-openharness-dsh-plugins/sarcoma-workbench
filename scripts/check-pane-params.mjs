#!/usr/bin/env node
/* 面板参数与版本副本的一致性检查。
 *
 * 为什么需要它：lib/client.js 是宿主直接加载的单文件，面板参数与版本号都以字面量写死在里面
 * （本仓没有构建注入步）。一旦和 lib/layout.js、根目录 VERSION 分叉，表现是"改了宽度/版本却没生效"，
 * 而既有检查全部不会响——这是"注释里说有注入脚本、实际没有"的典型假绿。
 *
 * 兼容两种写法：`const X = Number('0.65')` 与 `const X = 0.65`（含逗号连写）。
 *
 * 用法：node scripts/check-pane-params.mjs [--root .]
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(process.argv.includes('--root') ? process.argv[process.argv.indexOf('--root') + 1] : join(dirname(fileURLToPath(import.meta.url)), '..'))
const client = readFileSync(join(root, 'lib/client.js'), 'utf8')
const { CLIENT_LAYOUT } = await import(pathToFileURL(join(root, 'lib/layout.js')).href)

const fails = []
const ok = []

const num = (name) => {
  const a = client.match(new RegExp(`${name}\\s*=\\s*Number\\('([0-9.]+)'\\)`))
  if (a) return Number(a[1])
  const b = client.match(new RegExp(`(?:^|[,\\s])${name}\\s*=\\s*([0-9.]+)`))
  return b ? Number(b[1]) : undefined
}

const expect = {
  AGENT_MIN: CLIENT_LAYOUT.agentPane.min,
  AGENT_MAX: CLIENT_LAYOUT.agentPane.max,
  AGENT_DEFAULT: CLIENT_LAYOUT.agentPane.default,
  AGENT_STEP: CLIENT_LAYOUT.agentPane.step,
  NARROW_BELOW: CLIENT_LAYOUT.agentPane.narrowBelowPx,
  DRAWER_MAX: CLIENT_LAYOUT.agentPane.drawerMaxPx,
}
for (const [name, want] of Object.entries(expect)) {
  const got = num(name)
  if (got === undefined) fails.push(`${name} 在 lib/client.js 里找不到`)
  else if (got !== want) fails.push(`${name} = ${got}，lib/layout.js 是 ${want}`)
}
const businessWidth = num('BUSINESS_WIDTH')
if (businessWidth !== undefined && businessWidth !== CLIENT_LAYOUT.businessWidth) fails.push(`BUSINESS_WIDTH = ${businessWidth}，layout 是 ${CLIENT_LAYOUT.businessWidth}`)
const customFrame = client.match(/customFrame["']?\s*[:=]\s*(true|false)/)?.[1]
if (customFrame !== String(CLIENT_LAYOUT.customFrame)) fails.push(`customFrame 必须是 true/false 字面量，实际 ${customFrame}`)
if (!fails.length) ok.push('面板参数与 lib/layout.js 一致（agentPane 六项 / customFrame）')

for (const o of ok) console.log(`✓ ${o}`)
for (const f of fails) console.error(`✗ ${f}`)
process.exit(fails.length ? 1 : 0)
