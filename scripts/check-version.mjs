#!/usr/bin/env node
/* 版本副本一致性：VERSION / package.json / lib/version.js / 客户端字面量 / 页面字面量。
 * 客户端与页面都是手写副本（没有构建注入步），所以必须有闸门——否则改版只改一处，
 * 用户看到的是「包里 0.2.6、页面上 0.2.2」。
 * 用法：node scripts/check-version.mjs [--root .]
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(process.argv.includes('--root') ? process.argv[process.argv.indexOf('--root') + 1] : join(dirname(fileURLToPath(import.meta.url)), '..'))
const read = (p) => { try { return readFileSync(join(root, p), 'utf8') } catch { return '' } }
const version = read('VERSION').trim()
const fails = []
const ok = []

const pkg = JSON.parse(read('package.json') || '{}')
if (pkg.version === version) ok.push(`package.json = ${version}`)
else fails.push(`package.json = ${pkg.version}，VERSION = ${version}`)

const libV = read('lib/version.js').match(/export const version = '([^']+)'/)?.[1]
if (libV === version) ok.push(`lib/version.js = ${version}`)
else fails.push(`lib/version.js = ${libV ?? '（缺失）'}，VERSION = ${version}`)

const clientV = read('lib/client.js').match(/const VERSION\s*=\s*'([^']+)'/)?.[1]
if (clientV && clientV !== version) fails.push(`lib/client.js VERSION = ${clientV}，VERSION = ${version}`)

for (const page of ['public/index.html', 'prototypes/v0.2/index.html']) {
  if (!existsSync(join(root, page))) continue
  const literals = [...new Set([...read(page).matchAll(/v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/g)].map((m) => m[1]))]
  const bad = literals.filter((v) => v !== version)
  if (bad.length) fails.push(`${page} 里有版本字面量 ${bad.join(', ')}，VERSION = ${version}`)
  else ok.push(`${page} 字面量 = ${version}`)
}

for (const o of ok) console.log(`✓ ${o}`)
for (const f of fails) console.error(`✗ ${f}`)
process.exit(fails.length ? 1 : 0)
