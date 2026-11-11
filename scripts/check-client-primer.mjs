#!/usr/bin/env node
/**
 * 36 号 v2 · 装机客户端（lib/client.js）结构断言
 *
 * 与 probe-disease-primer.mjs（原型渲染探针）互补：
 * 装机走 `package.json.dsh.client` → `lib/client.js`（模块加载器 React 客户端），
 * 没有 public/ 与构建链，无法用浏览器探针直接量 DOM，所以这里做静态断言：
 *   ① 顶栏「?」入口与 aria-label 四段说明；
 *   ② 四段顺序 definition → evidence → landscape → trend；
 *   ③ 返回 / 关闭 / Esc 三个关闭路径 + history.pushState/back + 焦点回收；
 *   ④ §2.5 缺链接红标（wb-dp-miss）与仅 https；
 *   ⑤ §2.6 状态卡四件（eyebrow / 大字天数 / 现状行 / 出口按钮排）+ 待初始化；
 *   ⑥ 数据已内联、package.json.files 含 lib（装了才有入口）。
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CLIENT = join(ROOT, 'lib', 'client.js')
const src = readFileSync(CLIENT, 'utf8')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

let pass = 0
const fails = []
function ok(name, cond, detail = '') {
  if (cond) { pass++; console.log(`PASS  ${name}`) }
  else { fails.push(name + (detail ? ' — ' + detail : '')); console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`) }
}

/* ① 入口 */
ok('顶栏「?」入口存在（data-primer-open）', /data-primer-open/.test(src))
ok('入口 aria-label 说明四段内容', src.includes("'aria-label': '疾病概要：定义、医学资料与指南情况、治疗全景、发展趋势'"))
ok('装机层另有状态卡副按钮（疾病概要：软组织肉瘤是什么？）', src.includes('疾病概要：软组织肉瘤是什么？'))

/* ② 四段顺序 */
const ids = [...src.matchAll(/id:\s*'(definition|evidence|landscape|trend)'/g)].map((m) => m[1])
ok('四段数据齐全且顺序固定', ids.join(',') === 'definition,evidence,landscape,trend', ids.join(','))

/* ③ 关闭路径 */
ok('返回按钮存在（独立入口）', src.includes("'← 返回'"))
ok('关闭按钮存在（独立入口）', src.includes("'✕ 关闭'"))
ok('Esc 只收浮窗', /e\.key === 'Escape'/.test(src))
ok('open 压一条 history', /history\.pushState/.test(src))
ok('close 走 history.back()', /history\.back\(\)/.test(src))
ok('关闭后焦点回触发按钮', /\.focus\(\)/.test(src) && /triggerRef/.test(src))

/* ④ §2.5 链接 */
ok('缺链接红标类存在', src.includes('wb-dp-miss'))
ok('只接受 https 链接', /\/\^https:\\\/\\\/\//.test(src))
ok('官方入口（entry）不得写成已取得', !/entry[\s\S]{0,200}原件已取得/.test(src))
ok('nolink 必带 note 才渲染', src.includes('未取得原件（') && src.includes('s.note'))

/* ⑤ §2.6 状态卡四件 */
ok('状态卡 eyebrow', src.includes('wb-status-eyebrow') && src.includes('状态卡 · 待初始化'))
ok('状态卡大字天数', src.includes('wb-status-day') && src.includes('待初始化'))
ok('状态卡现状行（阶段 + 状态 + 下次）', src.includes('wb-status-now') && src.includes('下次：'))
ok('状态卡出口按钮排（主 + 副）', src.includes('wb-status-actions') && src.includes('重新检查连接 →'))

/* ⑥ 装机可用性 */
ok('客户端内联四段数据（不依赖相对 require）', src.includes('const PRIMER = {'))
ok('package.json.files 含 lib（装包带客户端）', Array.isArray(pkg.files) && pkg.files.includes('lib'))
ok('dsh.client 指向模块客户端路线', !!(pkg.dsh && pkg.dsh.client))

console.log(`\n${fails.length ? '✗' : '✓'} 客户端断言：${pass + fails.length} 项，${pass} 通过，${fails.length} 失败`)
if (fails.length) process.exit(1)
