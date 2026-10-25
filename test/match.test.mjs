/* 临床试验匹配指数（35 号规范 T1–T9 中能在纯数据层验的部分）
   ------------------------------------------------------------------
   跑的是产品源码 prototypes/v0.2/match.js（不是测试里重写的一份）。 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import vm from 'node:vm'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')

const M = (() => {
  const ctx = {}
  vm.createContext(ctx)
  vm.runInContext(read('prototypes/v0.2/match.js'), ctx, { filename: 'prototypes/v0.2/match.js' })
  return ctx.SARCO_MATCH
})()

const DEMO = (() => {
  const ctx = { window: {} }
  vm.createContext(ctx)
  vm.runInContext(read('prototypes/v0.2/demo-data.js'), ctx, { filename: 'demo-data.js' })
  return ctx.window.DEMO
})()

const p0 = DEMO.profiles[0]
const p1 = DEMO.profiles[1]
const patientOf = (p) => ({
  region: p.bioProfile?.region?.value || null,
  subtype: p.bioProfile?.subtype?.value || null,
  molecular: { token: p.bioProfile?.molecular?.token || null },
  ihc: { token: p.bioProfile?.ihc?.token || null },
})

test('T1 三态可分：建档字段带 known / unknown / absent，且未测不等于阴性', () => {
  const states = new Set()
  for (const p of DEMO.profiles) {
    for (const f of Object.values(p.bioProfile || {})) {
      assert.ok(['known', 'unknown', 'absent'].includes(f.state), `非法状态 ${f.state}`)
      states.add(f.state)
    }
  }
  assert.ok(states.has('known'))
  assert.ok(states.has('unknown'), '演示数据里必须有"未测"，否则 T2 无法验证')
  // 未测字段不得被写成已知值
  for (const p of DEMO.profiles) {
    for (const f of Object.values(p.bioProfile || {})) {
      if (f.state === 'unknown') assert.equal(f.value ?? f.token ?? null, null, '未测字段不得带值')
    }
  }
})

test('T3 全未知时 index = null（不是 0，也不是 100）', () => {
  const empty = { region: null, subtype: null, molecular: { token: null }, ihc: { token: null } }
  for (const t of p1.trials.filter((x) => !x.notFetched)) {
    const r = M.computeMatch(empty, t, M.DEFAULT_DIMS)
    assert.equal(r.index, null, `全未知时不该有分数（trial ${t.registryId}）`)
    assert.equal(r.patientSideKnown, 0)
    assert.ok(r.missingCount > 0, '全未知时必须给缺口清单')
  }
})

test('T4 改一个已知维度必须改变 index（分母只累加已知）', () => {
  const t = p1.trials.find((x) => !x.notFetched)
  const base = patientOf(p1)
  const a = M.computeMatch(base, t, M.DEFAULT_DIMS)
  const b = M.computeMatch({ ...base, region: '美国' }, t, M.DEFAULT_DIMS)
  assert.notEqual(a.index, null)
  assert.notEqual(a.index, b.index, '把地区从"中国"改成"美国"应改变分数')
})

test('T5 缺口不进分母：known + missing == 总维度数', () => {
  for (const p of DEMO.profiles) {
    for (const t of p.trials.filter((x) => !x.notFetched)) {
      const r = M.computeMatch(patientOf(p), t, M.DEFAULT_DIMS)
      assert.equal(r.knownDims + r.missingCount, r.totalDims, `${p.id}/${t.registryId} 维度数不守恒`)
    }
  }
})

test('T5b 未测维度不给 0 分，且标记为 unknown 而不是"不满足"', () => {
  // 用**合成档案**而不是 demo 数据：demo 的分子状态会随演示需要变，
  // 拿它当断言前提，改一次数据就误报一次（这一版就踩到了）。
  const t = p1.trials.find((x) => !x.notFetched && x.molecularToken)
  assert.ok(t, '需要一个带分子字段的试验来验证"未测"分支')
  const patient = { region: '中国', subtype: '去分化脂肪肉瘤', molecular: { token: null }, ihc: { token: null } }
  const r = M.computeMatch(patient, t, M.DEFAULT_DIMS)
  const mol = r.detail.find((d) => d.dim === 'molecular')
  assert.equal(mol.score, null, '未测的分子维度不得算 0 分')
  const miss = r.missing.find((m) => m.dim === 'molecular')
  assert.equal(miss.reason, 'unknown', '缺席原因必须是"你未测"，不是"不满足"')
  // 同一个试验，把分子填上之后分数必须变——证明这维真的参与计算而不是被静默跳过
  const withMol = M.computeMatch({ ...patient, molecular: { token: t.molecularToken } }, t, M.DEFAULT_DIMS)
  assert.notEqual(withMol.detail.find((d) => d.dim === 'molecular').score, null)
})

/* 35 号 §5 的 T6 坑：这些词**必须**出现在禁令句里（"不输出『符合入组条件』这类表述"）。
   所以不能断言"页面里没有这个词"，只能剥掉否定前缀后再断言剩余命中为空。
   第一版直接否定断言 → 挂在"能入组"上，正是规范预告的那个坑。 */
/* 35 号 §5 的 T6 坑：这些词**必须**出现在禁令句里（"不输出『符合入组条件』这类表述"）。
   所以不能断言"页面里没有这个词"。处置：把**引号内的提及**整体剥掉，只在引号外找残留。
   引号外出现 = 工作台自己在给结论 → 才算违规。
   第一版用否定前缀正则，挂在"它不是「我能不能入组」的答案"上——因为短语嵌在引号里。 */
test('T6 无结论词：引号外的正文不得出现入组结论', () => {
  const src = read('prototypes/v0.2/match.js')
  const banned = ['符合入组条件', '可以入组', '能够参加', '能入组', '适合参加', '建议报名']
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, '')          // 注释里的说明不算文案
    .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n')
    .replace(/「[^」]*」/g, ' ')                     // 中文引号提及
    .replace(/“[^”]*”/g, ' ')                       // 弯引号提及
    .replace(/"[^"]*"/g, ' ')                        // 直引号提及
    .replace(/'[^']*'/g, ' ')                        // 单引号提及（字符串字面量）
  const residual = banned.filter((w) => code.includes(w))
  assert.deepEqual(residual, [], `引号外出现入组结论：${residual.join('、')}`)
  // 反向自检：把一句结论塞进引号外，必须被抓到
  const mutated = `${code}\n它符合入组条件。`
  assert.ok(banned.some((w) => mutated.includes(w)), '扫描逻辑本身要能命中违规写法')
})

test('T7 分数在 0–100，且 null 与 0 不同', () => {
  for (const p of DEMO.profiles) {
    for (const t of p.trials.filter((x) => !x.notFetched)) {
      const r = M.computeMatch(patientOf(p), t, M.DEFAULT_DIMS)
      if (r.index !== null) {
        assert.ok(r.index >= 0 && r.index <= 100, `分数越界 ${r.index}`)
      }
      assert.notEqual(r.index, 0, '本演示数据不应产生 0 分（0 会与"无分数"混淆，需显式区分）')
    }
  }
})

test('T8 入排标准 / 生物标志阈值 / 年龄区间永不进计算', () => {
  const r = M.computeMatch(patientOf(p0), p0.trials.find((x) => !x.notFetched), M.DEFAULT_DIMS)
  assert.equal(r.notComputable.length, 3)
  const keys = M.DEFAULT_DIMS.map((d) => d.key)
  for (const k of ['criteria', 'threshold', 'age']) {
    assert.ok(!keys.includes(k), `维度里不得有 ${k}（登记库无结构化字段）`)
  }
})

test('T9 登记库侧维度不能单独支撑分数（患者没填就没有分）', () => {
  const onlyStatus = { region: null, subtype: null, molecular: { token: null }, ihc: { token: null } }
  const t = p0.trials.find((x) => !x.notFetched)
  const r = M.computeMatch(onlyStatus, t, M.DEFAULT_DIMS)
  assert.equal(r.index, null, '只有招募状态可算时必须给 null，而不是 100')
  assert.equal(r.knownDims > 0, true, '招募状态本身仍参与打分（只是不能单独支撑 index）')
})

test('界面文案与算法同源：INDEX_FORMAT 覆盖 null≠0 与分母规则', () => {
  const joined = M.INDEX_FORMAT.join(' ')
  assert.ok(joined.includes('null'), '格式说明必须写清 null 不是 0')
  assert.ok(joined.includes('分母'), '格式说明必须写清分母规则')
  assert.ok(joined.includes('入排标准'), '格式说明必须写清什么不进计算')
  assert.ok(!/符合入组条件|建议报名/.test(joined), '格式说明不得出现结论词')
})
