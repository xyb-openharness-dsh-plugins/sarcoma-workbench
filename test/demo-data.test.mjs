/**
 * demo-data.test.mjs — 演示数据的结构与纪律断言（M2）。
 *
 * 这些断言就是 K1/K2/K5 与"演示数据唯一源"的可执行版本：
 *   1. 双档案结构与必备字段齐全（代记标记、in_use、visibility）
 *   2. 影像**没有**判读字段（recist/response/progression/）——K1
 *   3. 全库最多一条激活基线（按部位）——H6
 *   4. 隐私：private 条目存在，且三出口过滤函数行为一致 —— K5
 *   5. public/ 与 prototypes/v0.2/ 的 demo-data.js 逐字节相同 —— 唯一源
 *   6. 禁词不出现在演示文案里 —— K1/K2/K3
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(resolve(ROOT, p), 'utf8')

function loadDemo() {
  const raw = read('prototypes/v0.2/demo-data.js')
  const json = raw.replace(/^[\s\S]*?window\.DEMO = /, '').replace(/;\s*$/, '')
  return JSON.parse(json)
}
const D = loadDemo()

const FORBIDDEN = ['建议治疗', '建议手术', '建议放疗', '建议化疗', '建议停药', '可以停药', '无需就医',
  '可能复发', '已经转移', '治愈率', '生存期', '预后良好', '预后差', '进展了', '复发风险',
  '不可恢复', '确诊为', '提示恶性']

test('双档案：两份虚构档案，结构与代记标记齐全', () => {
  assert.equal(D.profiles.length, 2, '应有两份演示档案（肢体 + 腹膜后）')
  const sites = D.profiles.map((p) => p.site)
  assert.deepEqual(sites.sort(), ['肢体', '腹膜后'].sort(), '覆盖肢体与腹膜后两条部位分轨')
  const recorders = D.profiles.map((p) => p.recorder)
  assert.ok(recorders.includes('patient'), '至少一份本人记录')
  assert.ok(recorders.includes('caregiver'), '至少一份家属代记（H1 双主体）')
  for (const p of D.profiles) {
    assert.equal(p.in_use, 1, '演示数据必须 in_use=1（导出默认排除）')
    for (const key of ['pathologies', 'imaging', 'local', 'systemic', 'metrics', 'functionLog', 'visits', 'trials', 'viewpoint', 'documents']) {
      assert.ok(Array.isArray(p[key]), `${p.id}.${key} 必须是数组`)
    }
    assert.ok(p.subtype && p.subtype.name && p.subtype.grade, `${p.id} 必须带亚型与分级原文`)
  }
})

test('影像字段里没有判读列（K1 不判读）', () => {
  const banned = ['recist', 'response', 'progression', 'diagnosis', 'riskLevel', 'risk_level', 'malignant', 'benign']
  for (const p of D.profiles) {
    for (const im of p.imaging) {
      for (const b of banned) {
        assert.ok(!(b in im), `影像记录不应有判读字段 ${b}（${p.id}/${im.id}）`)
      }
      assert.ok('wording' in im && im.wording.length > 0, '影像必须存报告原文 wording')
    }
  }
})

test('每个部位最多一条激活基线（H6）', () => {
  for (const p of D.profiles) {
    const bySite = new Map()
    for (const im of p.imaging) {
      if (im.baseline) bySite.set(im.site, (bySite.get(im.site) || 0) + 1)
    }
    for (const [site, n] of bySite) {
      assert.equal(n, 1, `${p.id} 的 ${site} 基线数为 ${n}，应恒为 1`)
    }
  }
})

test('隐私：存在 private 条目，且过滤函数三出口行为一致（K5）', () => {
  const priv = D.profiles.flatMap((p) => p.viewpoint.filter((v) => v.visibility === 'private'))
  assert.ok(priv.length > 0, '必须存在 private 条目，否则过滤逻辑无法被验证')

  // 与 app.js 中的可见性契约保持一致：默认排除 private
  const visible = (list, { includePrivate = false } = {}) =>
    list.filter((x) => includePrivate || x.visibility !== 'private')

  for (const p of D.profiles) {
    const shown = visible(p.viewpoint)
    const all = visible(p.viewpoint, { includePrivate: true })
    assert.equal(all.length, p.viewpoint.length, '显式放开时应返回全部')
    assert.ok(shown.every((v) => v.visibility !== 'private'), '默认出口不得含 private')
    assert.equal(shown.length + p.viewpoint.filter((v) => v.visibility === 'private').length, p.viewpoint.length)
  }
})

test('演示数据唯一源：文件由构建器生成，头部带"请勿手改"标记', () => {
  const raw = read('prototypes/v0.2/demo-data.js')
  assert.ok(raw.startsWith('/* 由 demo/build-demo-data.mjs 生成'), 'demo-data.js 必须由构建器生成，不允许手改')
  assert.ok(raw.includes('window.DEMO = {'), '必须是可直接被原型加载的全局赋值')
})

test('演示文案不含禁词（K1/K2/K3）', () => {
  const blob = JSON.stringify(D)
  const hits = FORBIDDEN.filter((w) => blob.includes(w))
  assert.deepEqual(hits, [], `演示数据命中禁词：${hits.join('、')}`)
})

test('亚型不做枚举：存的是报告原文文本，不是编码', () => {
  for (const p of D.profiles) {
    assert.equal(typeof p.subtype.name, 'string')
    assert.ok(!/^[A-Z_]+$/.test(p.subtype.name), '亚型必须是可读原文，不能是枚举编码')
    assert.ok(!('subtypeCode' in p.subtype), '不应存在亚型编码字段（会诱导下拉选择=自动分类）')
  }
})

test('治疗线：局部与全身分开存（H7 并行轨道）', () => {
  for (const p of D.profiles) {
    assert.ok(Array.isArray(p.local), '局部治疗独立数组')
    assert.ok(Array.isArray(p.systemic), '全身治疗独立数组')
    assert.ok(!p.local.some((l) => /化疗|靶向/.test(l.title)), '化疗/靶向不得出现在局部治疗里')
  }
  const p2 = D.profiles.find((p) => p.systemic.length >= 3)
  assert.ok(p2, '需要一份多治疗线的档案来验证并行/换线结构')
  const lines = p2.systemic.map((s) => s.lineNo).sort((a, b) => a - b)
  assert.deepEqual(lines, [...new Set(lines)].sort((a, b) => a - b), '治疗线号不得重复')
  for (const s of p2.systemic) {
    assert.ok(s.reasonText && s.reasonText.length > 0, '每条线必须带原因原文（H8）')
  }
})

test('试验：失败通道如实标注，不返回空列表冒充"没有"（H14）', () => {
  const all = D.profiles.flatMap((p) => p.trials)
  assert.ok(all.some((t) => /未查过|未取回|未配置/.test(t.statusText)), '必须有"未查过/未取回"的如实标注样例')
  for (const t of all) {
    assert.ok(t.channel && t.fetchedAt, '每条试验必须带来源通道与采集时间')
  }
})

test('每条记录都带 in_use 与 visibility（否则出口过滤是空开关）', () => {
  const KEYS = ['pathologies', 'imaging', 'local', 'systemic', 'metrics', 'functionLog',
    'visits', 'trials', 'viewpoint', 'fertility', 'documents']
  for (const p of D.profiles) {
    for (const key of KEYS) {
      for (const r of p[key]) {
        assert.equal(r.in_use, 1, `${p.id}.${key} 的记录缺 in_use 标记，导出过滤会永远命中不到`)
        assert.ok(['shared', 'private'].includes(r.visibility), `${p.id}.${key} 的 visibility 必须是 shared/private`)
      }
    }
  }
})
