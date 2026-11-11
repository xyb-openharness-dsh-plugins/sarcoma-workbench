import Schema from '@deepseek-ai/schemastery'
import { readFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createStaticHandler } from './static.js'

export const name = 'sarcoma-workbench-main'
export const inject = ['webServer', 'connection']
export const Config = Schema.object({
  root: Schema.string().description('本工作台本地数据根目录；由 cordis.patch.yml 的 dshHomePath 注入，缺省时空串表示未接线'),
})
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const PUBLIC_DIR = new URL('../public/', import.meta.url).pathname
/* 注册路径不带尾斜杠：宿主按前缀匹配，带斜杠会让 /ui 本身 404 */
export const UI_PREFIX = '/api/sarcoma-workbench/ui'
const UI_ENTRY = `${UI_PREFIX}/`

/** 数据根必须真的被创建并回报——只声明不读取=静默内存库（LESSONS 装机面坑）。 */
export function resolveDataRoot(root) {
  const value = typeof root === 'string' ? root.trim() : ''
  if (!value) return { ok: false, root: '', reason: 'config.root 未注入' }
  try {
    mkdirSync(value, { recursive: true })
    return { ok: true, root: value, dbPath: join(value, 'workbench.sqlite') }
  } catch (error) {
    return { ok: false, root: value, reason: `无法创建数据根：${error.message}` }
  }
}

export function apply(ctx, config) {
  if (!ctx.webServer?.register) throw new Error('Desktop webServer.register is unavailable')
  const storage = resolveDataRoot(config?.root)
  /* 业务界面：public/ 由 scripts/build-public.mjs 从 prototypes/v0.2 产出，外壳用 iframe 装进来 */
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: UI_PREFIX, handler: createStaticHandler(PUBLIC_DIR, UI_ENTRY) }), 'sarcoma-workbench ui')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: '/api/sarcoma-workbench/health',
    handler(req, res) {
      const send = (status, body) => {
        res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify(body))
      }
      if (typeof ctx.connection?.requestRejection !== 'function') return send(503, { error: 'connection authentication capability unavailable' })
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) return send(rejection, { error: 'Authentication required' })
      if (req.method !== 'GET') return send(405, { error: 'Method not allowed' })
      send(200, {
        ok: true,
        version: manifest.version,
        apiVersion: 'v1',
        capabilities: ['health'],
        storage: { ready: storage.ok, root: storage.root, reason: storage.ok ? undefined : storage.reason },
      })
    },
  }), 'sarcoma-workbench health')
}
