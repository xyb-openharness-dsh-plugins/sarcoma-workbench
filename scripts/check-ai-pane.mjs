#!/usr/bin/env node
/* 静态断言：AI 会话面板 / 分隔线是否按家族基线落地。
 * 只读 lib/client.js，不启动宿主；DSH 原生会话的实机渲染仍需装机验收。
 * 依据：prompts/FAMILY-SPLITTER-ALIGNMENT.md 与 prompts/DSH-AGENT-PANE-INTEGRATION.md。
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = await readFile(path.join(root, 'lib/client.js'), 'utf8')

const results = []
const check = (ok, label) => results.push({ ok: Boolean(ok), label })
const at = (needle) => source.indexOf(needle)

const sepAt = at("role: 'separator'")
const asideAt = at("h('aside', {")
check(sepAt !== -1 && asideAt !== -1 && sepAt < asideAt, 'DOM 顺序：业务区 → splitter → aside（separator 在 aside 之前）')
check(/function Panel\(\{ conversation \}\)/.test(source), 'Panel 接收 conversation')
check(/"?customFrame"?\s*:\s*true/.test(source), '注册描述符 customFrame: true')

check(/width: 1,\s*marginRight: -0\.5/.test(source), '分隔线 width: 1 + marginRight: -0.5（1px 细线不占位）')
check(/left: -5, width: 11/.test(source), '11px 透明热区子元素')
check(/right: `\$\{percent\}%`/.test(source), '分隔线 right: percent%')
check(/const dragShieldStyle = \{[\s\S]{0,240}?zIndex: 4/.test(source), '拖动遮罩 dragShieldStyle 且 zIndex: 4')
check(/style: dragShieldStyle/.test(source), '拖动遮罩已渲染')
check(/const SPLITTER_BRAND = '#[0-9a-fA-F]{3,6}'/.test(source), 'SPLITTER_BRAND 品牌色（不写死蓝色）')
check(/splitterRgba/.test(source), 'splitterRgba 从品牌色派生光晕')
check(/0 0 6px/.test(source) && /0 0 10px/.test(source), '悬停 6px / 拖动 10px 发光')
check(/hovering \? splitterHoverStyle : splitterStyle/.test(source), 'hovering 驱动悬停样式')
check(/setPointerCapture/.test(source), 'setPointerCapture')
check(/document\.addEventListener\('pointermove'/.test(source), '失败降级：document 监听 pointermove/pointerup')
check(/width: 14, height: 22/.test(source), '⠿ 把手 14×22 胶囊')
check(/⠿/.test(source), '⠿ 把手字符')
check(/pointerEvents: 'none'/.test(source), '把手 pointer-events: none（不挤压内容）')

check(/AGENT_MIN = 0\.25, AGENT_MAX = 0\.45, AGENT_DEFAULT = 0\.35, AGENT_STEP = 0\.02/.test(source), '25%–45% / 默认 35% / 步进 2%')
check(/NARROW_BELOW = 760/.test(source) && /DRAWER_MAX = 420/.test(source), '窄屏 760px 覆盖式抽屉')
check(/ArrowLeft[\s\S]{0,40}ArrowRight/.test(source) && /'Home'/.test(source) && /'End'/.test(source), '键盘 ←/→/Home/End')
check(/localStorage\.setItem\(WIDTH_KEY/.test(source), 'localStorage 持久化宽度')

check(/display: paneVisible \? 'flex' : 'none'/.test(source), 'aside 常挂载，仅用 display 控显隐')
check(/'aria-label': 'AI 对话'/.test(source), 'aside aria-label="AI 对话"')
check(/'aria-label': `AI 对话：\$\{agentLabel\}`/.test(source), '顶栏 AI 对话按钮带 aria-label')
check(/disabled: connecting \|\| !canOpenSession/.test(source), '无能力/连接中按钮禁用')
check(/canOpenSession[\s\S]{0,160}?ensureSession/.test(source), '能力判定来自 ensureSession')
check(/ensureSession/.test(source), '点击打开/复用归属会话（ensureSession）')
check(/setDraft/.test(source) && !/input\.submit/.test(source), '开场白只进草稿，不自动发送')
check(/inject: \['desktopWorkbenches', 'sessions'\]/.test(source), '注入 sessions 以写原生草稿')

const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.label}`)
if (failed.length) {
  console.error(`\ncheck-ai-pane: ${failed.length} 项未通过`)
  process.exit(1)
}
console.log(`\ncheck-ai-pane: ${results.length}/${results.length} 通过`)