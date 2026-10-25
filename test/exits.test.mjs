/* 三出口过滤的真实测试（K5）
   ------------------------------------------------------------------
   关键：这些断言跑的是 **产品源码** prototypes/v0.2/exits.js 本身，
   不是测试文件里另抄的一份实现。app.js 加载同一个文件。
   数据用真实的 demo-data.js（由构建器生成，与原型同源）。 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import vm from 'node:vm'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')

/** 在隔离的 vm 上下文里加载产品源码（classic script，不依赖浏览器）。 */
function loadProduct() {
  const ctx = {}
  vm.createContext(ctx)
  vm.runInContext(read('prototypes/v0.2/exits.js'), ctx, { filename: 'prototypes/v0.2/exits.js' })
  return ctx.SARCO_EXITS
}
const EXITS = loadProduct()

/** 真实演示数据（构建器产物，与原型同源）。 */
const DEMO = (() => {
  const ctx = { window: {} }
  vm.createContext(ctx)
  vm.runInContext(read('prototypes/v0.2/demo-data.js'), ctx, { filename: 'demo-data.js' })
  return ctx.window.DEMO
})()

const P = DEMO.profiles

test('产品源码可加载，且导出的是函数而非桩', () => {
  for (const k of ['visible', 'canLeave', 'exportable', 'allPrivate',
    'buildExportSnapshot', 'buildAgentContext', 'buildVisitPrepSheet', 'optsFromUI']) {
    assert.equal(typeof EXITS[k], 'function', `${k} 必须是函数`)
  }
  assert.ok(P.length >= 2, '需要至少两个档案（本人 / 代记）来验证跨主体隔离')
})

test('canLeave：私密与演示数据各自受开关控制', () => {
  const shared = { visibility: 'shared', in_use: 0 }
  const priv = { visibility: 'private', in_use: 0 }
  const demo = { visibility: 'shared', in_use: 1 }
  assert.equal(EXITS.canLeave(shared, {}), true)
  assert.equal(EXITS.canLeave(priv, {}), false, '私密默认不得离开本机')
  assert.equal(EXITS.canLeave(priv, { privateOn: true }), true, '显式勾选后才可带走')
  assert.equal(EXITS.canLeave(demo, {}), false, '演示数据默认不得离开本机')
  assert.equal(EXITS.canLeave(demo, { demoOn: true }), true, '显式放开后演示数据才可带走')
  assert.equal(EXITS.canLeave(demo, { demoOn: true, privateOn: false }), true, '取消排除演示数据后才可带走')
  assert.equal(EXITS.canLeave(null, {}), false, '空值必须判否，不能默认放行')
})

test('optsFromUI：{demoOff} → {demoOn} 归一（不归一就会恒排除）', () => {
  assert.equal(EXITS.optsFromUI({ demoOff: true }).demoOn, false)
  assert.equal(EXITS.optsFromUI({ demoOff: false }).demoOn, true)
  assert.equal(EXITS.optsFromUI({}).demoOn, true, '未给 demoOff 时应视为"不排除演示数据"')
  assert.equal(EXITS.optsFromUI({ privateOn: true }).privateOn, true)
})

test('导出默认排除私密与演示数据（SPEC §4.2）', () => {
  for (const p of P) {
    const snap = EXITS.buildExportSnapshot(p, {})
    assert.equal(snap.viewpoint.length, 0, `${p.id} 导出默认带了私密 viewpoint`)
    assert.equal(snap.fertility.length, 0, `${p.id} 导出默认带了私密 fertility`)
    assert.equal(snap.viewpointFiltered, EXITS.allPrivate(p), `${p.id} 被排除条数应等于全部私密条数`)
    for (const key of ['pathologies', 'imaging', 'local', 'systemic', 'metrics', 'functionLog', 'visits', 'trials']) {
      assert.equal(snap[key].length, 0, `${p.id}.${key} 演示数据默认不得导出`)
    }
  }
})

test('显式放开后私密才进导出，shared 记录不受影响', () => {
  for (const p of P) {
    const snap = EXITS.buildExportSnapshot(p, { privateOn: true, demoOn: true })
    // 放开的是"私密能不能出去"，不是"只导出私密"——shared 本来就该在。
    assert.equal(snap.viewpoint.length, p.viewpoint.length, `${p.id} 放开后应带全部 viewpoint`)
    assert.equal(snap.fertility.length, (p.fertility || []).length, `${p.id} 放开后应带全部 fertility`)
    // 关键断言：所有私密条目都必须真的在里面（没有静默漏掉）
    for (const v of p.viewpoint.filter((x) => x.visibility === 'private')) {
      assert.ok(snap.viewpoint.some((x) => x.id === v.id), `${p.id} 放开后仍漏了私密 ${v.id}`)
    }
    assert.equal(snap.viewpointFiltered, 0, '已放开时"被排除"计数应为 0')
    assert.ok(snap.pathologies.length > 0, '放开演示数据后应有记录')
  }
})

test('AI 上下文与一页纸：私密永远不进，且没有放开开关', () => {
  for (const p of P) {
    const ctx = EXITS.buildAgentContext(p)
    const sheet = EXITS.buildVisitPrepSheet(p)
    assert.equal(ctx.viewpoint.length, 0)
    assert.equal(ctx.fertility.length, 0)
    assert.equal(sheet.viewpoint.length, 0)
    assert.equal(sheet.fertility.length, 0)
    assert.equal(ctx.viewpointFiltered, EXITS.allPrivate(p))
    assert.equal(sheet.viewpointFiltered, EXITS.allPrivate(p))
    // 这两个出口的签名里没有 privateOn —— 传进去也不该生效
    const ctx2 = EXITS.buildAgentContext(p, { privateOn: true })
    assert.equal(ctx2.viewpoint.length, 0, 'AI 出口不得因为外部传参而放开私密')
    const sheet2 = EXITS.buildVisitPrepSheet(p, { privateOn: true })
    assert.equal(sheet2.viewpoint.length, 0, '一页纸出口不得因为外部传参而放开私密')
  }
})

test('一页纸必须带代记标记（K5「代记标记不可丢」）', () => {
  for (const p of P) {
    const sheet = EXITS.buildVisitPrepSheet(p)
    assert.ok(sheet.recorder, `${p.id} 一页纸缺 recorder`)
    assert.ok(sheet.recorderLabel, `${p.id} 一页纸缺 recorderLabel`)
    assert.equal(sheet.recorder, p.recorder)
  }
  assert.ok(P.some((p) => p.recorder === 'caregiver'), '需要一个代记档案才能验证这条')
})

test('日期范围：空范围不限制，越界记录被排除', () => {
  const rec = { date: '2025-06-01' }
  assert.equal(EXITS.inRange(rec, null, null), true, '空范围必须不限制')
  assert.equal(EXITS.inRange(rec, '2025-01-01', '2025-12-31'), true)
  assert.equal(EXITS.inRange(rec, '2026-01-01', null), false)
  assert.equal(EXITS.inRange(rec, null, '2025-01-01'), false)
  assert.equal(EXITS.inRange({}, '2026-01-01', null), true, '无日期记录不因范围判断被误删')
})

test('跨主体隔离：一个档案的出口里不出现另一个档案的私密原文', () => {
  const texts = P.map((p) => (p.viewpoint || []).filter((v) => v.visibility === 'private').map((v) => v.text))
  for (let i = 0; i < P.length; i++) {
    const blob = JSON.stringify(EXITS.buildExportSnapshot(P[i], { privateOn: false, demoOn: true }))
    for (let j = 0; j < P.length; j++) {
      if (i === j) continue
      for (const t of texts[j]) {
        const probe = t.slice(0, 10)
        assert.ok(!blob.includes(probe), `档案 ${P[i].id} 的导出里出现了档案 ${P[j].id} 的私密原文`)
      }
    }
  }
})
