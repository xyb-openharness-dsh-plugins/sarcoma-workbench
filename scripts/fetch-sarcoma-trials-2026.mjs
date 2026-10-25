#!/usr/bin/env node
/**
 * M3 · 软组织肉瘤临床试验采集（多通道）
 *
 * 通过 unified-trial-mcp（v0.3.1）的 MCP stdio 服务检索六个通道，生成：
 *   research/sarcoma/trials-2026.jsonl
 *   research/sarcoma/sarcoma_cancer_trials_2026.sqlite
 *   research/sarcoma/manifest.json
 *
 * 设计约束（与 README / docs/CLINICAL-DATA-2026.md 对齐）：
 *   1. 不伪造任何一条记录；通道失败就写失败，零条就写零条并给原因。
 *   2. 六个通道逐个查询、逐个记账；离线通道无肉瘤覆盖时明确写“无覆盖”。
 *   3. 检索词、时间窗、去重键全部写死在脚本里，manifest 记录同一份口径。
 *   4. raw_json 保留每一条来源返回的完整 canonical record，不丢原文。
 *
 * 用法：
 *   node scripts/fetch-sarcoma-trials-2026.mjs
 *   UNIFIED_TRIAL_MCP_ROOT=/path/to/unified_search_trials node scripts/fetch-sarcoma-trials-2026.mjs
 */

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = join(ROOT, 'research', 'sarcoma');
const TOOL_ROOT = process.env.UNIFIED_TRIAL_MCP_ROOT
  ? resolve(process.env.UNIFIED_TRIAL_MCP_ROOT)
  : '/Users/qinxiaoqiang/Downloads/unified_search_trials';

const JSONL_PATH = join(OUT_DIR, 'trials-2026.jsonl');
const SQLITE_PATH = join(OUT_DIR, 'sarcoma_cancer_trials_2026.sqlite');
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json');

const WINDOW_FROM = '2019-01-01';

/** 病种检索词（OR 口径，脚本写死）。英文 + 中文。 */
const TERMS = [
  'soft tissue sarcoma',
  'sarcoma',
  'leiomyosarcoma',
  'liposarcoma',
  'synovial sarcoma',
  'undifferentiated pleomorphic sarcoma',
  'rhabdomyosarcoma',
  'angiosarcoma',
  'fibrosarcoma',
  'epithelioid sarcoma',
  'desmoid',
  'GIST',
  '软组织肉瘤',
  '肉瘤',
  '脂肪肉瘤',
  '平滑肌肉瘤',
  '滑膜肉瘤',
  '横纹肌肉瘤',
  '血管肉瘤',
  '纤维肉瘤',
  '上皮样肉瘤',
];

const SOURCE_ORDER = [
  'ictrp',
  'ctv',
  'chictr_online',
  'chinadrugtrials',
  'chictr_pancreatic_archive',
  'xyb_chinadrugtrials_archive',
];

/**
 * 每通道单次返回上限。
 * ChiCTR 上游硬限制 max_results <= 100；传 200 会被上游拒绝（实测）。
 */
const SOURCE_LIMITS = {
  ictrp: 200,
  ctv: 200,
  chictr_online: 100,
  chinadrugtrials: 200,
  chictr_pancreatic_archive: 200,
  xyb_chinadrugtrials_archive: 200,
};

const SOURCE_LABELS = {
  ictrp: 'WHO ICTRP',
  ctv: 'ClinicalTrials.gov（CTV 本地索引）',
  chictr_online: 'ChiCTR 在线',
  chinadrugtrials: 'ChinaDrugTrials（受控归档）',
  chictr_pancreatic_archive: 'ChiCTR 胰腺癌离线语料',
  xyb_chinadrugtrials_archive: 'XYB ChinaDrugTrials 数据包（只读离线）',
};

/** 明确不属于“软组织肉瘤”范围、但可能被通用 sarcoma 词命中的病种。 */
const OUT_OF_SCOPE_PATTERNS = [
  { type: 'osteosarcoma', re: /osteosarcoma|osteogenic sarcoma|骨肉瘤/i },
  { type: 'ewing', re: /ewing|尤文/i },
  { type: 'chondrosarcoma', re: /chondrosarcoma|软骨肉瘤/i },
  { type: 'gist', re: /\bgist\b|gastrointestinal stromal|胃肠(道)?间质瘤/i },
  { type: 'desmoid', re: /desmoid|硬纤维瘤|韧带样纤维瘤/i },
  { type: 'chordoma', re: /chordoma|脊索瘤/i },
  // 卡波西肉瘤：本项目按 G1 决策点排除（见 docs/DIFF-MATRIX.md 覆盖范围、
  // research/STS-FACTCHECK §H 排除清单）。它名字里带 sarcoma，不加这条会被
  // IN_SCOPE_PATTERNS 的 /sarcoma/ 吃掉，误算成范围内的软组织肉瘤。
  { type: 'kaposi', re: /kaposi|卡波西|卡波济/i },
  { type: 'bone_other', re: /bone sarcoma|primary bone|骨肿瘤|骨巨细胞瘤|骨恶性肿瘤/i },
];

/** 标题中明确指向软组织肉瘤（含各亚型）的词。 */
const IN_SCOPE_PATTERNS = [
  /soft tissue sarcoma/i,
  /sarcoma/i,
  /软组织肉瘤/,
  /肉瘤/,
  /leiomyosarcoma/i,
  /liposarcoma/i,
  /synovial sarcoma/i,
  /undifferentiated pleomorphic sarcoma/i,
  /rhabdomyosarcoma/i,
  /angiosarcoma/i,
  /fibrosarcoma/i,
  /epithelioid sarcoma/i,
  /平滑肌肉瘤/,
  /脂肪肉瘤/,
  /滑膜肉瘤/,
  /横纹肌肉瘤/,
  /血管肉瘤/,
  /纤维肉瘤/,
  /上皮样肉瘤/,
];

/** 只写“软组织肿瘤”、没有具体亚型词的标题，归入“其余”。 */
const SOFT_TISSUE_ONLY_PATTERNS = [/soft tissue (tumou?r|neoplasm)/i, /软组织肿瘤/, /软组织占位/];

/** 条件字段里出现这些词，说明该记录与肉瘤有关，即使标题没写。 */
const SARCOMA_RELATED_PATTERNS = [/sarcoma/i, /肉瘤/, /soft tissue (tumou?r|neoplasm)/i, /软组织(肿瘤|占位)/];

/** 与肉瘤无关的命中，按条件字段粗分，便于在文档里解释“为什么会被检索到”。 */
const UNRELATED_CATEGORIES = [
  { type: 'breast', re: /breast|乳腺/i },
  { type: 'lung', re: /lung|pulmonary|non-small|nsclc|肺/i },
  { type: 'renal', re: /renal|kidney|肾/i },
  { type: 'hematologic', re: /leukemia|lymphoma|myeloma|白血病|淋巴瘤|骨髓瘤/i },
  { type: 'colorectal', re: /colorectal|colon|rectal|结直肠|结肠|直肠/i },
  { type: 'gynecologic', re: /ovarian|uterine|cervical|endometrial|卵巢|子宫|宫颈|内膜/i },
  { type: 'solid_tumor_generic', re: /solid tumou?r|neoplasm|实体瘤|恶性肿瘤|肿瘤/i },
];

const CJK_RE = /[\u3400-\u9fff]/;

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function readToolVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(TOOL_ROOT, 'package.json'), 'utf8'));
    return pkg.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function normDate(value) {
  if (!value) return null;
  const s = String(value).trim();
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return null;
}

function joinList(value) {
  if (!Array.isArray(value)) return null;
  const items = value.map((v) => String(v).trim()).filter(Boolean);
  return items.length ? items.join('; ') : null;
}

function uniq(list) {
  return [...new Set(list)];
}

function titleHasSarcomaTerm(title) {
  if (!title) return false;
  return IN_SCOPE_PATTERNS.some((re) => re.test(title));
}

function classifyScope(title, conditions) {
  const titleText = title ?? '';
  const conditionText = conditions ?? '';
  const combined = `${titleText} ${conditionText}`;

  // 1) 范围外病种：标题优先；标题没写但条件字段明确写了，也照实标范围外。
  for (const item of OUT_OF_SCOPE_PATTERNS) {
    if (item.re.test(titleText)) {
      return { tag: `out_of_scope_${item.type}`, type: item.type, basis: 'title' };
    }
  }
  for (const item of OUT_OF_SCOPE_PATTERNS) {
    if (item.re.test(conditionText)) {
      return { tag: `out_of_scope_${item.type}`, type: item.type, basis: 'conditions' };
    }
  }

  // 2) 标题明确写软组织肉瘤/亚型：范围内。
  if (IN_SCOPE_PATTERNS.some((re) => re.test(titleText))) {
    return { tag: 'in_scope_sts', type: null, basis: 'title' };
  }

  // 3) 标题只写“软组织肿瘤”，没有具体亚型。
  if (SOFT_TISSUE_ONLY_PATTERNS.some((re) => re.test(titleText))) {
    return { tag: 'other_soft_tissue_only', type: null, basis: 'title' };
  }

  // 4) 标题没写，但条件字段写了肉瘤/软组织肿瘤：仍属肉瘤相关，单列“其余”。
  if (SARCOMA_RELATED_PATTERNS.some((re) => re.test(conditionText))) {
    return { tag: 'other_sarcoma_in_conditions', type: null, basis: 'conditions' };
  }

  // 5) 标题和条件都没有肉瘤/软组织词：与肉瘤无关的命中，保留但不计入肉瘤范围。
  const category = UNRELATED_CATEGORIES.find((item) => item.re.test(combined))?.type ?? 'other';
  return { tag: 'out_of_scope_unrelated', type: `unrelated_${category}`, basis: 'none' };
}

function windowStatus(dates) {
  const registered = normDate(dates?.registered);
  const updated = normDate(dates?.updated);
  const candidates = [registered, updated].filter(Boolean);
  if (!candidates.length) return { status: 'unknown', registered, updated, inWindow: true };
  const newest = candidates.sort().at(-1);
  return {
    status: newest >= WINDOW_FROM ? 'in_window' : 'before_window',
    registered,
    updated,
    inWindow: newest >= WINDOW_FROM,
  };
}

function recordKey(record) {
  const source = record?.source?.id ?? 'unknown';
  const registryId =
    record?.source?.sourceRecordId ||
    record?.registryNumbers?.find((n) => n?.primary)?.value ||
    record?.registryNumbers?.[0]?.value ||
    String(record?.recordId ?? '').slice(source.length + 1);
  return { source, registryId: String(registryId) };
}

function mergeCanonical(base, incoming) {
  const out = { ...base };
  for (const field of [
    'title',
    'publicTitle',
    'studyType',
    'recruitmentStatus',
    'sourceUrl',
  ]) {
    if (!out[field] && incoming[field]) out[field] = incoming[field];
  }
  for (const field of ['conditionOrDisease', 'interventions', 'phase', 'sponsorOrInstitution', 'countries']) {
    out[field] = uniq([...(out[field] ?? []), ...(incoming[field] ?? [])]);
  }
  if (!out.dates && incoming.dates) out.dates = { ...incoming.dates };
  else if (out.dates && incoming.dates) out.dates = { ...incoming.dates, ...out.dates };
  out.registryNumbers = out.registryNumbers?.length ? out.registryNumbers : incoming.registryNumbers;
  out.provenance = out.provenance ?? incoming.provenance;
  return out;
}

async function main() {
  if (!existsSync(join(TOOL_ROOT, 'dist', 'src', 'cli', 'main.js'))) {
    throw new Error(`找不到 ${TOOL_ROOT}/dist/src/cli/main.js；请先在 unified_search_trials 执行 npm run build。`);
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const tempDir = mkdtempSync(join(homedir(), '.xyb-sarcoma-'));
  const queryLog = [];
  const rawRecords = [];
  const startedAt = new Date();

  // ---------- 1. doctor：六通道就绪状态原样记录 ----------
  let doctor = { exitCode: null, statuses: [], warnings: [], error: null, stderr: null };
  try {
    const stdout = execFileSync(process.execPath, ['dist/src/cli/main.js', 'doctor', '--json'], {
      cwd: TOOL_ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    doctor = { ...JSON.parse(stdout), exitCode: 0, stderr: null };
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout) : '';
    const stderr = error?.stderr ? String(error.stderr) : String(error?.message ?? error);
    doctor = { exitCode: error?.status ?? null, statuses: [], warnings: [], error: 'doctor_failed', stderr };
    if (stdout.trim().startsWith('{')) {
      try {
        doctor = { ...JSON.parse(stdout), exitCode: error?.status ?? 1, stderr: stderr.split('\n').slice(0, 5).join('\n') };
      } catch {
        /* keep failure shell */
      }
    }
  }

  // ---------- 2. MCP stdio：tools/list 拿真实 schema ----------
  const sdkClientUrl = pathToFileURL(
    join(TOOL_ROOT, 'node_modules', '@modelcontextprotocol', 'sdk', 'dist', 'esm', 'client', 'index.js'),
  ).href;
  const sdkStdioUrl = pathToFileURL(
    join(TOOL_ROOT, 'node_modules', '@modelcontextprotocol', 'sdk', 'dist', 'esm', 'client', 'stdio.js'),
  ).href;
  const { Client } = await import(sdkClientUrl);
  const { StdioClientTransport } = await import(sdkStdioUrl);

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['dist/src/cli/main.js', 'serve'],
    cwd: TOOL_ROOT,
    stderr: 'pipe',
  });
  let serveStderr = '';
  transport.stderr?.on('data', (chunk) => {
    serveStderr += String(chunk);
    if (serveStderr.length > 20000) serveStderr = serveStderr.slice(-20000);
  });
  const client = new Client({ name: 'sarcoma-workbench-m3', version: '1.0.0' });
  await client.connect(transport);
  const listed = await client.listTools();
  const mcpTools = listed.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));

  const callSearch = async (args) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('MCP_CALL_TIMEOUT_120S')), 120_000),
    );
    const response = await Promise.race([
      client.callTool({ name: 'search_trials', arguments: args }),
      timeout,
    ]);
    const text = response?.content?.find((item) => item.type === 'text')?.text;
    if (!text) throw new Error('search_trials 返回中没有 text 内容');
    const data = JSON.parse(text);
    if (data?.error) throw new Error(`${data.error}: ${data.message ?? ''}`);
    return data;
  };

  // ---------- 3. 逐词 × 逐通道检索 ----------
  // 对每个通道记录“是否因永久错误停止后续词”，避免对已知坏通道刷 20 次。
  const sourceStop = new Map();
  const sourceQueriedTerms = new Map(SOURCE_ORDER.map((s) => [s, []]));
  const sourceFailedTerms = new Map(SOURCE_ORDER.map((s) => [s, []]));

  for (const term of TERMS) {
    for (const source of SOURCE_ORDER) {
      if (sourceStop.has(source)) continue;
      const started = Date.now();
      const entry = {
        term,
        source,
        state: 'NOT_QUERIED',
        reason_code: null,
        explanation: null,
        result_count: 0,
        upstream_reported_total: null,
        rows_returned: null,
        truncated: null,
        warnings: [],
        elapsed_ms: 0,
      };
      try {
        const data = await callSearch({
          keyword: term,
          limit: SOURCE_LIMITS[source],
          sourceIds: [source],
        });
        const status = data.statuses?.find((s) => s.sourceId === source);
        const records = (data.records ?? []).filter((r) => r?.source?.id === source);
        entry.state = status?.state ?? 'FAILED';
        entry.reason_code = status?.reasonCode ?? 'NO_STATUS';
        entry.explanation = status?.explanation ?? null;
        entry.result_count = records.length;
        entry.upstream_reported_total = status?.completeness?.upstreamReportedTotal ?? null;
        entry.rows_returned = status?.completeness?.rowsReturned ?? null;
        entry.truncated = status?.truncated ?? null;
        entry.warnings = (status?.completeness?.warnings ?? []).slice(0, 8);
        entry.elapsed_ms = Date.now() - started;
        sourceQueriedTerms.get(source).push(term);

        if (entry.state === 'SUCCESS' || entry.state === 'NO_RESULTS') {
          for (const record of records) {
            rawRecords.push({ record, term, source });
          }
        } else {
          sourceFailedTerms.get(source).push({ term, state: entry.state, reason: entry.reason_code });
          // ICTRP 的 sidecar FileNotFoundError 是通道级坏掉；ChiCTR 的 CHALLENGE/RATE_LIMITED 也不该强刷。
          const permanent =
            source === 'ictrp' ||
            entry.state === 'CHALLENGE_REQUIRED' ||
            entry.state === 'RATE_LIMITED' ||
            entry.state === 'DENIED';
          if (permanent) {
            sourceStop.set(source, { term, state: entry.state, reason: entry.reason_code, explanation: entry.explanation });
          }
        }
      } catch (error) {
        entry.state = 'FAILED';
        entry.reason_code = 'MCP_CLIENT_ERROR';
        entry.explanation = String(error?.message ?? error);
        entry.elapsed_ms = Date.now() - started;
        sourceQueriedTerms.get(source).push(term);
        sourceFailedTerms.get(source).push({ term, state: entry.state, reason: entry.reason_code });
        if (source === 'ictrp') {
          sourceStop.set(source, { term, state: entry.state, reason: entry.reason_code, explanation: entry.explanation });
        }
      }
      queryLog.push(entry);
      // 对在线通道稍微让一下，不主动提高频率。
      if (source === 'chictr_online' || source === 'ictrp') await new Promise((r) => setTimeout(r, 600));
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  // ---------- 4. 去重（键：source:registry_id） ----------
  const deduped = new Map();
  for (const item of rawRecords) {
    const { source, registryId } = recordKey(item.record);
    const key = `${source}:${registryId}`;
    const existing = deduped.get(key);
    if (existing) {
      existing.record = mergeCanonical(existing.record, item.record);
      existing.query_terms = uniq([...existing.query_terms, item.term]);
    } else {
      deduped.set(key, {
        source,
        registryId,
        record: item.record,
        query_terms: [item.term],
      });
    }
  }

  const uniqueBeforeWindow = [...deduped.values()].sort(
    (a, b) =>
      SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source) ||
      a.registryId.localeCompare(b.registryId),
  );

  // ---------- 5. 时间窗 + 范围标签 ----------
  const finalRows = [];
  const windowExcluded = [];
  for (const item of uniqueBeforeWindow) {
    const record = item.record;
    const dates = record.dates ?? {};
    const win = windowStatus(dates);
    if (!win.inWindow) {
      windowExcluded.push({ source: item.source, registryId: item.registryId, dates });
      continue;
    }
    const conditionsText = joinList(record.conditionOrDisease) ?? '';
    const scope = classifyScope(record.title, conditionsText);
    const hasSarcoma = titleHasSarcomaTerm(record.title);
    finalRows.push({
      source: item.source,
      registry_id: item.registryId,
      title: record.title ?? record.publicTitle ?? '',
      title_zh: record.title && CJK_RE.test(record.title) ? record.title : '',
      status: record.recruitmentStatus ?? '',
      phase: joinList(record.phase) ?? '',
      enrollment: null,
      sponsor: joinList(record.sponsorOrInstitution) ?? '',
      start_date: win.registered ?? normDate(dates.started) ?? '',
      last_update: win.updated ?? '',
      countries: joinList(record.countries) ?? '',
      conditions: conditionsText,
      scope_tag: scope.tag,
      url: record.sourceUrl ?? '',
      raw_json: {
        ...record,
        _query_terms: item.query_terms,
        _window: win,
        _scope: scope,
      },
      query_terms: item.query_terms,
      window_status: win.status,
      scope_note: scope.type ? `out_of_scope:${scope.type}` : scope.tag,
      scope_basis: scope.basis,
      title_has_sarcoma_term: hasSarcoma,
    });
  }

  // ---------- 6. 分层计数 ----------
  const bySourceRaw = Object.fromEntries(SOURCE_ORDER.map((s) => [s, 0]));
  const bySourceQueries = Object.fromEntries(SOURCE_ORDER.map((s) => [s, 0]));
  for (const entry of queryLog) {
    bySourceQueries[entry.source] += 1;
    bySourceRaw[entry.source] += entry.result_count;
  }
  const bySourceFinal = Object.fromEntries(SOURCE_ORDER.map((s) => [s, 0]));
  for (const row of finalRows) bySourceFinal[row.source] += 1;

  const titleSarcomaRows = finalRows.filter((row) => row.title_has_sarcoma_term);
  const outRows = finalRows.filter((row) => row.scope_tag.startsWith('out_of_scope_'));
  const unrelatedRows = finalRows.filter((row) => row.scope_tag === 'out_of_scope_unrelated');
  const specificOutRows = outRows.filter((row) => row.scope_tag !== 'out_of_scope_unrelated');
  const inScopeRows = finalRows.filter((row) => row.scope_tag === 'in_scope_sts');
  const otherRows = finalRows.filter((row) => row.scope_tag.startsWith('other_'));

  const outOfScopeByType = {};
  for (const row of specificOutRows) {
    const type = row.scope_tag.replace('out_of_scope_', '');
    outOfScopeByType[type] = (outOfScopeByType[type] ?? 0) + 1;
  }
  const unrelatedByCategory = {};
  for (const row of unrelatedRows) {
    const category = String(row.scope_note).replace('out_of_scope:unrelated_', '');
    unrelatedByCategory[category] = (unrelatedByCategory[category] ?? 0) + 1;
  }
  const titleOutOfScope = outRows.filter((row) => row.title_has_sarcoma_term).length;

  const counts = {
    raw_by_source: bySourceRaw,
    raw_total: Object.values(bySourceRaw).reduce((a, b) => a + b, 0),
    unique_before_window: uniqueBeforeWindow.length,
    unique_before_window_by_source: Object.fromEntries(
      SOURCE_ORDER.map((s) => [s, uniqueBeforeWindow.filter((x) => x.source === s).length]),
    ),
    window_excluded: windowExcluded.length,
    window_excluded_by_source: Object.fromEntries(
      SOURCE_ORDER.map((s) => [s, windowExcluded.filter((x) => x.source === s).length]),
    ),
    deduped_total: finalRows.length,
    by_source_final: bySourceFinal,
    title_has_sarcoma_term_raw: titleSarcomaRows.length,
    title_has_sarcoma_term_out_of_scope: titleOutOfScope,
    title_has_sarcoma_term_in_scope: inScopeRows.length,
    out_of_scope_total: outRows.length,
    out_of_scope_specific_total: specificOutRows.length,
    out_of_scope_by_type: outOfScopeByType,
    out_of_scope_unrelated_total: unrelatedRows.length,
    out_of_scope_unrelated_by_category: unrelatedByCategory,
    other_total: otherRows.length,
    other_breakdown: {
      soft_tissue_only: otherRows.filter((row) => row.scope_tag === 'other_soft_tissue_only').length,
      sarcoma_in_conditions: otherRows.filter((row) => row.scope_tag === 'other_sarcoma_in_conditions').length,
    },
    reconciliation: {
      partition: `${inScopeRows.length} (in_scope_sts) + ${outRows.length} (out_of_scope) + ${otherRows.length} (other)`,
      equals_deduped_total:
        inScopeRows.length + outRows.length + otherRows.length === finalRows.length,
      note:
        '标题含肉瘤词的原始条数 = in_scope_sts + 范围外但标题含 sarcoma 的条数；' +
        '范围外条数按主标签计，二者可能重叠，因此以三分区对账。' +
        'out_of_scope 内再分“具体骨/尤文/GIST/硬纤维瘤等”和“与肉瘤无关的命中”。',
    },
  };

  // ---------- 7. 通道状态 ----------
  const sources = SOURCE_ORDER.map((source) => {
    const entries = queryLog.filter((e) => e.source === source);
    const failed = entries.filter((e) => !['SUCCESS', 'NO_RESULTS'].includes(e.state));
    const success = entries.filter((e) => ['SUCCESS', 'NO_RESULTS'].includes(e.state));
    let status;
    if (source === 'chictr_pancreatic_archive') status = 'NOT_CONFIGURED';
    else if (source === 'xyb_chinadrugtrials_archive') status = bySourceFinal[source] > 0 ? 'NO_COVERAGE_INCIDENTAL' : 'NO_COVERAGE';
    else if (!entries.length) status = 'NOT_QUERIED';
    else if (!failed.length) status = bySourceRaw[source] > 0 ? 'SUCCESS' : 'NO_RESULTS';
    else if (success.length) status = 'PARTIAL';
    else status = 'FAILED';

    let note;
    if (source === 'chictr_pancreatic_archive') {
      note = '路径不存在：/nonexistent/x.db。该语料按设计仅覆盖胰腺癌，对肉瘤无覆盖；本次 0 条不是“没有肉瘤试验”。';
    } else if (source === 'xyb_chinadrugtrials_archive') {
      note = `离线数据包仅覆盖胰腺癌（139 条，数据截止 2026-09-29）。本次命中 ${bySourceFinal[source]} 条为语料内偶然含“肉瘤”字样的记录，不构成肉瘤覆盖。`;
    } else if (source === 'ictrp') {
      const stop = sourceStop.get(source);
      note = `上游 ictrp_search 返回 isError：FileNotFoundError: [Errno 2] No such file or directory（sidecar 缺陷，非“无结果”）。首次失败后停止后续 ${Math.max(0, TERMS.length - entries.length)} 个检索词。${stop?.explanation ? ` 统一层解释：${stop.explanation}` : ''}`;
    } else if (failed.length) {
      const first = failed[0];
      note = `部分检索词失败（${failed.length}/${entries.length}）：${first.term} → ${first.state}/${first.reason_code}。${first.explanation ?? ''}`;
    } else {
      const doctorStatus = doctor.statuses?.find((s) => s.sourceId === source);
      note = doctorStatus?.explanation ?? '检索完成。';
    }

    return {
      source,
      label: SOURCE_LABELS[source],
      status,
      count: bySourceFinal[source],
      raw_count: bySourceRaw[source],
      queries: entries.length,
      failed_queries: failed.length,
      note,
    };
  });

  // ---------- 8. 写 JSONL ----------
  const jsonl = finalRows.map((row) => JSON.stringify(row)).join('\n') + (finalRows.length ? '\n' : '');
  writeFileSync(JSONL_PATH, jsonl, 'utf8');

  // ---------- 9. 写 SQLite ----------
  if (existsSync(SQLITE_PATH)) rmSync(SQLITE_PATH);
  const db = new DatabaseSync(SQLITE_PATH);
  db.exec(`
    PRAGMA journal_mode = DELETE;
    CREATE TABLE trials (
      source TEXT NOT NULL,
      registry_id TEXT NOT NULL,
      title TEXT,
      title_zh TEXT,
      status TEXT,
      phase TEXT,
      enrollment INTEGER,
      sponsor TEXT,
      start_date TEXT,
      last_update TEXT,
      countries TEXT,
      conditions TEXT,
      scope_tag TEXT,
      url TEXT,
      raw_json TEXT,
      PRIMARY KEY (source, registry_id)
    );
    CREATE TABLE source_status (
      source TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      count INTEGER NOT NULL,
      note TEXT
    );
    CREATE INDEX idx_trials_scope_tag ON trials(scope_tag);
    CREATE INDEX idx_trials_source ON trials(source);
  `);
  const insertTrial = db.prepare(`
    INSERT INTO trials
      (source, registry_id, title, title_zh, status, phase, enrollment, sponsor,
       start_date, last_update, countries, conditions, scope_tag, url, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.exec('BEGIN');
  for (const row of finalRows) {
    insertTrial.run(
      row.source,
      row.registry_id,
      row.title,
      row.title_zh,
      row.status,
      row.phase,
      row.enrollment,
      row.sponsor,
      row.start_date,
      row.last_update,
      row.countries,
      row.conditions,
      row.scope_tag,
      row.url,
      JSON.stringify(row.raw_json),
    );
  }
  const insertStatus = db.prepare(
    'INSERT INTO source_status (source, status, count, note) VALUES (?, ?, ?, ?)',
  );
  for (const src of sources) insertStatus.run(src.source, src.status, src.count, src.note);
  db.exec('COMMIT');
  const verifyRows = db.prepare('SELECT source, COUNT(*) AS n FROM trials GROUP BY source ORDER BY source').all();
  const verifyTotal = db.prepare('SELECT COUNT(*) AS n FROM (SELECT * FROM trials ORDER BY rowid)').get();
  db.close();

  // ---------- 10. manifest ----------
  const jsonlBuf = readFileSync(JSONL_PATH);
  const sqliteBuf = readFileSync(SQLITE_PATH);
  const scriptBuf = readFileSync(fileURLToPath(import.meta.url));
  const manifest = {
    dataset: 'sarcoma-trials-2026',
    generated_at: new Date().toISOString(),
    generated_at_start: startedAt.toISOString(),
    tool: {
      name: 'unified-trial-mcp',
      version: readToolVersion(),
      root: TOOL_ROOT,
      transport: 'MCP stdio（node dist/src/cli/main.js serve）',
      node_version: process.version,
      mcp_tools: mcpTools,
      serve_stderr_tail: serveStderr.slice(-4000),
    },
    doctor,
    query: {
      terms: TERMS,
      window: {
        from: WINDOW_FROM,
        rule: '注册日期或最近更新 >= 2019-01-01；两者都缺失时保留并标记 window_status=unknown',
      },
      dedupe_key: 'source:registry_id',
      source_order: SOURCE_ORDER,
      per_source_limit: SOURCE_LIMITS,
      scope_rule:
        '标题优先、条件字段兜底：骨肉瘤/尤文/软骨肉瘤/GIST/硬纤维瘤/脊索瘤/其他骨肿瘤标为 out_of_scope_<type>；' +
        '标题含软组织肉瘤或亚型词标为 in_scope_sts；标题只写软组织肿瘤标为 other_soft_tissue_only；' +
        '标题没写但条件字段含肉瘤/软组织词标为 other_sarcoma_in_conditions；' +
        '标题与条件都没有肉瘤/软组织词标为 out_of_scope_unrelated。不剔除任何命中结果。',
    },
    counts,
    sources,
    query_log: queryLog,
    window_excluded: windowExcluded,
    files: [
      {
        path: 'research/sarcoma/trials-2026.jsonl',
        sha256: sha256(jsonlBuf),
        bytes: jsonlBuf.length,
        rows: finalRows.length,
      },
      {
        path: 'research/sarcoma/sarcoma_cancer_trials_2026.sqlite',
        sha256: sha256(sqliteBuf),
        bytes: sqliteBuf.length,
        tables: ['trials', 'source_status'],
      },
      {
        path: 'scripts/fetch-sarcoma-trials-2026.mjs',
        sha256: sha256(scriptBuf),
        bytes: scriptBuf.length,
      },
    ],
    sqlite_verification: {
      by_source: verifyRows,
      total: verifyTotal?.n ?? null,
    },
    reproducibility: {
      command: 'node scripts/fetch-sarcoma-trials-2026.mjs',
      note:
        '在线结果会随时间变化；manifest 记录本次生成时间、doctor 快照与每个词/通道的终态，便于判断差异来自数据更新还是通道故障。',
    },
    limitations: [
      'ICTRP 通道本次不可用（sidecar FileNotFoundError），不能把其 0 条解读为“无试验”。',
      'ChiCTR 胰腺癌离线语料路径不存在，且设计上只覆盖胰腺癌，对肉瘤无覆盖。',
      'XYB ChinaDrugTrials 离线包只有胰腺癌 139 条，对肉瘤无覆盖；命中记录为偶然字样，不作为覆盖依据。',
      'CTV 是本地索引，零命中只代表本地索引未命中，不代表 ClinicalTrials.gov 全量无该试验。',
      'ChiCTR 在线单次最多 100 条且无分页参数；若某词命中超过 100 条，只能记录截断。',
      'enrollment 列本次留空：search_trials 的 canonical 记录不含入组数；如需该字段须逐条调用 get_trial_detail。',
    ],
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  // ---------- 11. 控制台摘要 ----------
  console.log(JSON.stringify({
    generated_at: manifest.generated_at,
    counts,
    sources: sources.map((s) => ({ source: s.source, status: s.status, count: s.count, raw: s.raw_count, queries: s.queries, failed: s.failed_queries })),
    files: manifest.files,
    sqlite: manifest.sqlite_verification,
    temp_dir: tempDir,
  }, null, 2));

  await client.close();
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
