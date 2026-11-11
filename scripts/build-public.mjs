#!/usr/bin/env node
/**
 * 生成 public/（装机界面）：从 prototypes/v0.2 原样复制业务前端，只改版本字面量。
 *
 * 为什么需要它：这个仓原先只注册了 /health，没有 public/，也没注册静态 UI 路由，
 * 装进 Desktop 后外壳（lib/client.js）没有可加载的业务页，面板只剩骨架卡片。
 *
 * 纪律：与原型**同一份渲染代码**，只替换版本字面量（title / 版本章 / 页脚 / 说明条），
 * 不在这里改任何视图逻辑。改业务要改 prototypes/v0.2，再回来重新生成。
 *
 * 用法：
 *   node scripts/build-public.mjs          写入
 *   node scripts/build-public.mjs --check  只校验，不同步退出 1
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'prototypes', 'v0.2')
const OUT = join(root, 'public')
const checkOnly = process.argv.includes('--check')
const version = readFileSync(join(root, 'VERSION'), 'utf8').trim()

const FILES = ['style.css', 'demo-data.js', 'exits.js', 'metrics.js', 'match.js', 'app.js']
const read = (name) => readFileSync(join(SRC, name), 'utf8')

function fail(messages) {
  for (const m of messages) console.error(`✗ ${m}`)
  process.exit(1)
}

/* 版本字面量用锚点正则替换，不写死原型当时的版本号：原型与包版本本来就不是同一条线，
   写死会让"原型动过一次字面量"之后整条生成链断掉。锚点缺一个就报错，不静默跳过。 */
function patchIndex(html) {
  const edits = [
    {
      from: /<title>[^<]*?（交互原型 v[\d.]+）<\/title>/,
      to: `<title>小肉宝 SarcoPal · 软组织肉瘤患者工作台（开发版 v${version}）</title>`,
      what: '<title>',
    },
  ]
  let out = html
  for (const { from, to, what } of edits) {
    if (!from.test(out)) fail(`prototypes/v0.2/index.html 结构变了，找不到锚点：${what}`)
    out = out.replace(from, to)
  }
  return out
}

const outputs = { 'index.html': patchIndex(read('index.html')) }
for (const name of FILES) outputs[name] = read(name)

if (checkOnly) {
  const problems = []
  for (const [name, content] of Object.entries(outputs)) {
    const file = join(OUT, name)
    if (!existsSync(file)) problems.push(`缺 public/${name}`)
    else if (readFileSync(file, 'utf8') !== content) problems.push(`public/${name} 与 prototypes/v0.2 不同步（或版本字面量过期）`)
  }
  if (problems.length) fail(problems)
  console.log(`✓ public/ 与 prototypes/v0.2 同步（v${version}，${Object.keys(outputs).length} 个文件）`)
  process.exit(0)
}

mkdirSync(OUT, { recursive: true })
for (const [name, content] of Object.entries(outputs)) writeFileSync(join(OUT, name), content)
console.log(`已生成 public/：${Object.keys(outputs).join(', ')}（v${version}）`)