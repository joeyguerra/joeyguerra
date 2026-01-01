#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const DEFAULTS = {
  strictThreshold: 70,
  warnThreshold: 85,
  minWords: 600,
  maxWords: 1200,
  maxIntroWords: 120,
  maxFileBytes: 2_000_000,
  mbaTerms: [
    'synergy', 'synergistic', 'leverage', 'leveraged', 'transformational', 'innovative',
    'optimize', 'optimization', 'best practices', 'stakeholders', 'alignment', 'scalable',
    'scalability', 'paradigm', 'thought leadership', 'holistic', 'robust', 'ecosystem'
  ],
  concreteTerms: [
    'crew', 'dispatch', 'dispatcher', 'job site', 'invoice', 'billing', 'warehouse', 'inventory',
    'purchase order', 'truck', 'route', 'field', 'foreman', 'ap clerk', 'ar clerk', 'work order',
    'handoff', 'approval', 'reconciliation', 'timesheet', 'maintenance', 'equipment', 'sap',
    'r365', 'harri', 'service bus', 'queue', 'integration'
  ],
  roleTerms: [
    'owner', 'ops', 'operations', 'sales', 'finance', 'accounting', 'pm', 'product', 'engineer',
    'dispatcher', 'crew lead', 'foreman', 'superintendent', 'controller'
  ]
}

function printUsage() {
  console.log(`
signal-check: local SIGNAL hygiene gate (no LLM)

Usage:
  signal-check <file1.md> <file2.md> ...
  signal-check --staged
  signal-check --staged --strict=70 --warn=85

Exit codes:
  0 = PASS
  1 = FAIL (score < strict or missing required frontmatter fields)
  2 = WARN-only mode triggered (optional; not used by default)
`.trim())
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function wordCount(text) {
  const m = text.trim().match(/\S+/g)
  return m ? m.length : 0
}

function splitWords(text) {
  return (text.toLowerCase().match(/[a-z0-9']+/g) ?? [])
}

function countRegex(text, re) {
  const m = text.match(re)
  return m ? m.length : 0
}

function hasAny(textLower, terms) {
  return terms.some(t => textLower.includes(t))
}

// Very small frontmatter parser for YAML-ish "key: value" and nested "signal:" keys.
// This expects frontmatter like:
//
// ---
// signal:
//   claim: "ROI is mostly coordination cost, not license cost."
//   decision: "Whether to buy a tool or build a system change should be driven by synchronization vs speed."
//   system: "Mid-sized ops teams coordinating across sales/ops/finance and multiple systems."
//   failure_modes: "handoffs, reconciliation rituals, status meetings, re-explaining work"
//   lever: "Ask: is our bottleneck speed or synchronization?"
// ---
// It’s intentionally minimal and strict.
function parseFrontmatter(md) {
  if (!md.startsWith('---\n')) return { fm: null, body: md }

  const end = md.indexOf('\n---\n', 4)
  if (end === -1) return { fm: null, body: md }

  const raw = md.slice(4, end).trimEnd()
  const body = md.slice(end + '\n---\n'.length)

  const lines = raw.split('\n')
  const fm = {}
  let currentSection = null

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue

    // section header: "signal:"
    const sec = line.match(/^([A-Za-z0-9_-]+):\s*$/)
    if (sec) {
      currentSection = sec[1]
      fm[currentSection] = fm[currentSection] ?? {}
      continue
    }

    // nested key: "  claim: ..."
    const nested = line.match(/^\s{2,}([A-Za-z0-9_-]+):\s*(.*)\s*$/)
    if (nested && currentSection) {
      const key = nested[1]
      let val = nested[2] ?? ''
      val = val.replace(/^['"]|['"]$/g, '')
      fm[currentSection][key] = val
      continue
    }

    // top-level key: "title: ..."
    const top = line.match(/^([A-Za-z0-9_-]+):\s*(.*)\s*$/)
    if (top) {
      const key = top[1]
      let val = top[2] ?? ''
      val = val.replace(/^['"]|['"]$/g, '')
      fm[key] = val
      continue
    }
  }

  return { fm, body }
}

function requiredSignalFields(fm) {
  const s = fm?.signal
  const missing = []

  if (!s || typeof s !== 'object') {
    return ['signal (frontmatter block)']
  }

  for (const key of ['claim', 'decision', 'system', 'lever']) {
    if (!s[key] || String(s[key]).trim().length < 8) missing.push(`signal.${key}`)
  }

  // failure_modes can be a string (comma-separated) or omitted (but required)
  if (!s.failure_modes || String(s.failure_modes).trim().length < 8) {
    missing.push('signal.failure_modes')
  }

  return missing
}

// Heuristic scoring (0–100)
// It’s not "insight". It’s "signal hygiene".
function scoreContent(body, fm, cfg) {
  const text = body.trim()
  const textLower = text.toLowerCase()
  const words = wordCount(text)

  // A) Time Respect (0–15)
  let timeScore = 0
  if (words >= cfg.minWords && words <= cfg.maxWords) timeScore = 15
  else if (words < cfg.minWords) timeScore = clamp(Math.round((words / cfg.minWords) * 15), 0, 15)
  else timeScore = clamp(Math.round((cfg.maxWords / words) * 15), 0, 15)

  // B) Specificity (0–20)
  const digits = countRegex(text, /\b\d+(\.\d+)?\b/g)
  const money = countRegex(text, /\$\s?\d+([,.\d]*)/g)
  const properish = countRegex(text, /(^|[\s(])([A-Z][a-z]+)(?=[\s),.!?])/g)
  const concreteHits = cfg.concreteTerms.reduce((acc, t) => acc + (textLower.includes(t) ? 1 : 0), 0)
  const roleHits = cfg.roleTerms.reduce((acc, t) => acc + (textLower.includes(t) ? 1 : 0), 0)

  // Normalize: we want "some", not spam
  const specRaw =
    clamp(digits, 0, 10) * 1.2 +
    clamp(money, 0, 5) * 1.6 +
    clamp(properish, 0, 12) * 0.6 +
    clamp(concreteHits, 0, 12) * 1.1 +
    clamp(roleHits, 0, 8) * 0.9

  const specificityScore = clamp(Math.round(specRaw), 0, 20)

  // C) MBA Sludge penalty (0 to -20)
  const mbaHits = cfg.mbaTerms.reduce((acc, t) => acc + (textLower.includes(t) ? 1 : 0), 0)
  const mbaPenalty = clamp(mbaHits * 3, 0, 20) * -1

  // D) Standalone Punch (0–10)
  const introWords = text.split(/\s+/).slice(0, cfg.maxIntroWords).join(' ')
  const introLower = introWords.toLowerCase()

  // Proxy: does intro contain claim-ish and stakes/system?
  const hasContrast = /wrong|trap|but|however|the question|stop asking|start asking/.test(introLower)
  const hasDecisionLanguage = /decide|decision|choose|should|rule|test|if you/.test(introLower)
  const hasSystemAnchor = hasAny(introLower, cfg.concreteTerms) || hasAny(introLower, cfg.roleTerms)
  const standaloneScore = clamp(
    (hasContrast ? 4 : 0) + (hasDecisionLanguage ? 3 : 0) + (hasSystemAnchor ? 3 : 0),
    0,
    10
  )

  // E) Agency (0–20)
  const ifThen = countRegex(textLower, /\bif\b.{0,80}\bthen\b/g)
  const rules = countRegex(textLower, /\b(rule|decision rule|diagnostic|test)\b/g)
  const questions = countRegex(text, /\?/g)
  const imperatives = countRegex(textLower, /\b(do|stop|start|avoid|use|ask|ship|kill|cut)\b/g)

  const agencyRaw =
    clamp(ifThen, 0, 4) * 4 +
    clamp(rules, 0, 3) * 4 +
    clamp(questions, 0, 6) * 1.5 +
    clamp(imperatives, 0, 10) * 0.8

  const agencyScore = clamp(Math.round(agencyRaw), 0, 20)

  // F) Friction / Edge (0–10)
  const boundaryLang = /won't get along|not for you|repels|non-negotiable|kill|trap|wrong question/.test(textLower)
  const contradiction = /isn't|is not|wrong|trap|but|however/.test(textLower)
  const edgeScore = clamp((boundaryLang ? 6 : 0) + (contradiction ? 4 : 0), 0, 10)

  // G) Repetition / Fluff penalty (0 to -5)
  const tokens = splitWords(text)
  const bigrams = new Map()
  for (let i = 0; i < tokens.length - 1; i++) {
    const bg = `${tokens[i]} ${tokens[i + 1]}`
    bigrams.set(bg, (bigrams.get(bg) ?? 0) + 1)
  }
  const repeated = [...bigrams.values()].filter(n => n >= 6).length
  const fluffPenalty = clamp(repeated, 0, 5) * -1

  // Bonus: frontmatter presence nudges (0–5)
  const fmBonus = fm?.signal ? 5 : 0

  const total =
    timeScore +
    specificityScore +
    standaloneScore +
    agencyScore +
    edgeScore +
    fmBonus +
    mbaPenalty +
    fluffPenalty

  return {
    total: clamp(total, 0, 100),
    breakdown: {
      timeScore,
      specificityScore,
      standaloneScore,
      agencyScore,
      edgeScore,
      fmBonus,
      mbaPenalty,
      fluffPenalty,
      words,
      mbaHits,
      digits,
      concreteHits,
      roleHits
    }
  }
}

function verdict(total, missing, cfg) {
  if (missing.length > 0) return 'FAIL'
  if (total < cfg.strictThreshold) return 'FAIL'
  if (total < cfg.warnThreshold) return 'WARN'
  return 'PASS'
}

function formatReport(file, result, missing, score) {
  const b = score.breakdown
  const lines = []

  lines.push(`\n${path.basename(file)}`)
  lines.push(`RESULT: ${result}`)
  lines.push(`SCORE: ${score.total}/100  (strict>=${CONFIG.strictThreshold}, warn>=${CONFIG.warnThreshold})`)
  lines.push(`WORDS: ${b.words}`)
  if (missing.length) lines.push(`MISSING: ${missing.join(', ')}`)

  lines.push('BREAKDOWN:')
  lines.push(`  Time respect:      ${b.timeScore}/15`)
  lines.push(`  Specificity:       ${b.specificityScore}/20  (digits=${b.digits}, concrete=${b.concreteHits}, roles=${b.roleHits})`)
  lines.push(`  Standalone punch:  ${b.standaloneScore}/10`)
  lines.push(`  Agency:            ${b.agencyScore}/20`)
  lines.push(`  Edge/Friction:     ${b.edgeScore}/10`)
  lines.push(`  Frontmatter bonus: ${b.fmBonus}/5`)
  lines.push(`  MBA penalty:       ${b.mbaPenalty}  (hits=${b.mbaHits})`)
  lines.push(`  Fluff penalty:     ${b.fluffPenalty}`)

  // Quick actionable hints
  const hints = []
  if (b.timeScore < 10) hints.push('Tighten length into 600–1200 words')
  if (b.specificityScore < 10) hints.push('Add concrete roles, constraints, numbers, and named failure modes')
  if (b.agencyScore < 10) hints.push('Add a decision rule / diagnostic test / checklist')
  if (b.standaloneScore < 6) hints.push('Make the first ~120 words state claim + stakes + system')
  if (b.mbaHits >= 2) hints.push('Remove MBA sludge words; replace with mechanisms + constraints')
  if (hints.length) lines.push(`HINTS: ${hints.join(' | ')}`)

  return lines.join('\n')
}

async function getStagedMarkdownFiles() {
  const { stdout } = await execFileAsync('git', ['diff', '--cached', '--name-only', '--diff-filter=AM'])
  return stdout
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
}

async function readStagedFile(file) {
  const { stdout } = await execFileAsync('git', ['show', `:${file}`], { maxBuffer: 10 * 1024 * 1024 })
  return stdout
}

function parseArgs(argv) {
  const args = {
    staged: false,
    files: [],
    strict: DEFAULTS.strictThreshold,
    warn: DEFAULTS.warnThreshold
  }

  for (const a of argv) {
    if (a === '--help' || a === '-h') args.help = true
    else if (a === '--staged') args.staged = true
    else if (a.startsWith('--strict=')) args.strict = Number(a.split('=')[1])
    else if (a.startsWith('--warn=')) args.warn = Number(a.split('=')[1])
    else if (!a.startsWith('-')) args.files.push(a)
  }

  return args
}

const ARGS = parseArgs(process.argv.slice(2))
if (ARGS.help) {
  printUsage()
  process.exit(0)
}

const CONFIG = {
  ...DEFAULTS,
  strictThreshold: Number.isFinite(ARGS.strict) ? ARGS.strict : DEFAULTS.strictThreshold,
  warnThreshold: Number.isFinite(ARGS.warn) ? ARGS.warn : DEFAULTS.warnThreshold
}

async function main() {
  let files = []

  if (ARGS.staged) {
    files = await getStagedMarkdownFiles()
    if (files.length === 0) {
      process.exit(0)
    }
  } else {
    files = ARGS.files
  }

  if (!files.length) {
    printUsage()
    process.exit(1)
  }

  let anyFail = false
  let anyWarn = false

  for (const file of files) {
    let content = ''
    try {
      if (ARGS.staged) {
        content = await readStagedFile(file)
      } else {
        const stat = await fs.stat(file)
        if (stat.size > CONFIG.maxFileBytes) throw new Error(`File too large (${stat.size} bytes)`)
        content = await fs.readFile(file, 'utf8')
      }
    } catch (e) {
      console.error(`\n${file}\nRESULT: FAIL\nERROR: ${e.message}`)
      anyFail = true
      continue
    }

    const { fm, body } = parseFrontmatter(content)
    const missing = requiredSignalFields(fm)

    const score = scoreContent(body, fm, CONFIG)
    const result = verdict(score.total, missing, CONFIG)

    console.log(formatReport(file, result, missing, score))

    if (result === 'FAIL') anyFail = true
    if (result === 'WARN') anyWarn = true
  }

  if (anyFail) {
    console.log('\n❌ SIGNAL CHECK: FAIL (commit blocked)')
    process.exit(1)
  }

  if (anyWarn) {
    console.log('\n⚠️  SIGNAL CHECK: WARN (below 85; consider tightening)')
    // still allow commit by default
  } else {
    console.log('\n✅ SIGNAL CHECK: PASS')
  }

  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})