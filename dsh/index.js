import Schema from '@deepseek-ai/schemastery'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createStaticHandler } from './server.js'
import { readFileSync } from 'node:fs'

export const name = 'sarcoma-main'
export const inject = ['webServer', 'connection']
export const Config = Schema.object({})
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

export const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
export const UI_PREFIX = '/api/sarcoma/ui/'

export function apply(ctx) {
  if (!ctx.webServer?.register) throw new Error('Desktop webServer.register is unavailable')
  /* 业务界面：public/（原型提升而来）经 iframe 装进面板 */
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix', path: UI_PREFIX, handler: createStaticHandler(PUBLIC_DIR, UI_PREFIX),
  }), 'sarcoma ui')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: '/api/sarcoma/health',
    handler(req, res) {
      const send = (status, body) => {
        res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify(body))
      }
      if (typeof ctx.connection?.requestRejection !== 'function') return send(503, { error: 'connection authentication capability unavailable' })
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) return send(rejection, { error: 'Authentication required' })
      if (req.method !== 'GET') return send(405, { error: 'Method not allowed' })
      send(200, { ok: true, version: manifest.version, apiVersion: 'v1', capabilities: ['health'] })
    },
  }), 'sarcoma health')
}
