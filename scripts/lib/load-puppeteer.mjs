/* puppeteer-core 解析（评审 P2-3）
 *
 * 原来四个探针 + 截图脚本都硬编码 createRequire('/Users/<某人>/.workbuddy/…')，
 * 换一台机器、换一个用户目录就直接跑不起来，而且报错文案说的是「家族 workspace 未装」，
 * 会把人引到错误的方向排查。
 *
 * 解析顺序：
 *   ① PUPPETEER_PATH —— 指向「装着 puppeteer-core 的目录」，可以是 node_modules 本身，
 *      也可以是它的上级（两种都试）。换机时只设这一个变量，不改代码。
 *   ② 本仓库 node_modules
 *   ③ 家族 workspace（本机默认位置，保留以免老用法失效）
 *   ④ 常规 require 解析链（全局安装、npm link 等）
 *
 * 全失败返回 null。调用方必须按「跳过等于没有这条闸门」exit(2)，不要静默 PASS。
 */
import { createRequire } from 'node:module'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..')

export function loadPuppeteer() {
  const cands = [
    process.env.PUPPETEER_PATH && join(process.env.PUPPETEER_PATH, 'noop.js'),
    process.env.PUPPETEER_PATH && join(process.env.PUPPETEER_PATH, 'node_modules', 'noop.js'),
    join(REPO, 'node_modules', 'noop.js'),
    join(homedir(), '.workbuddy', 'binaries', 'node', 'workspace', 'noop.js')
  ].filter(Boolean)

  for (const anchor of cands) {
    try {
      return createRequire(anchor)('puppeteer-core')
    } catch {
      /* 试下一个候选；全都失败时由末尾返回 null */
    }
  }
  try {
    return createRequire(import.meta.url)('puppeteer-core')
  } catch {
    return null
  }
}

export const PUPPETEER_HINT =
  '缺少 puppeteer-core：设置 PUPPETEER_PATH 指向装着它的目录（如 ~/.workbuddy/binaries/node/workspace）后重试。跳过等于没有这条闸门。'
