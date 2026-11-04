// Shared rendering and file writing for the contest sync. Platform modules (leetcode.mjs,
// codeforces.mjs, codechef.mjs) turn public data into this normalised shape:
//
//   contest = { slug, title, url, links: [[text, url]], startTime, rank, solved, total,
//               finish, rating, ratingChange, problems: [{ label, title, url, points, status, code }] }
//
// `problem.code` is the folder name under code/contests/<platform>/ where my verbatim code lives.
//
// Pages are created once. Afterwards only the block between the sync markers is rewritten, so
// everything I write on a contest page (the upsolve) survives every future sync.

import fs from 'node:fs'
import path from 'node:path'

export const START = '<!-- contest-sync:start (generated, do not edit inside) -->'
export const END = '<!-- contest-sync:end -->'

export const PLATFORMS = {
  leetcode: { name: 'LeetCode' },
  codeforces: { name: 'Codeforces' },
  codechef: { name: 'CodeChef' },
}

export const LANGS = { py: 'Python', java: 'Java', cpp: 'C++', cc: 'C++', c: 'C', js: 'JavaScript', ts: 'TypeScript', go: 'Go', kt: 'Kotlin', rs: 'Rust' }

export const slugify = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const date = (sec) =>
  new Date(sec * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
export const clock = (sec) => (sec || sec === 0 ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : '—')
export const signed = (n) => (n == null ? '—' : n > 0 ? `+${n}` : `${n}`)
const num = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'))

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function getJson(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { 'User-Agent': 'katal-dsa-handbook-sync', ...(init.headers || {}) } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

// ---------- code files ----------

const codeDir = (root, platform, key) => path.join(root, 'code', 'contests', platform, key)

export function codeFiles(root, platform, key) {
  const dir = codeDir(root, platform, key)
  if (!key || !fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.startsWith('kavya_') && LANGS[path.extname(f).slice(1)]).sort()
}

export function copyCode(root, platform, key, srcFile) {
  const dest = codeDir(root, platform, key)
  fs.mkdirSync(dest, { recursive: true })
  const name = `kavya_${path.basename(srcFile)}`
  fs.copyFileSync(srcFile, path.join(dest, name))
  return `${platform}/${key}/${name}`
}

// ---------- rendering ----------

export function renderBlock(platform, c, root) {
  const lines = [
    START,
    '',
    [date(c.startTime), ...c.links.map(([t, u]) => `[${t}](${u})`)].join(' · '),
    '',
    '| Rank | Solved | Finish time | Rating after | Change |',
    '|---|---|---|---|---|',
    `| ${num(c.rank)} | ${c.solved ?? '—'} / ${c.total ?? '—'} | ${c.finish ?? '—'} | ${c.rating ?? '—'} | ${signed(c.ratingChange)} |`,
    '',
  ]
  if (c.problems.length) {
    lines.push('| # | Problem | Points | Status |', '|---|---|---|---|')
    for (const p of c.problems) {
      lines.push(`| ${p.label} | [${p.title}](${p.url}) | ${p.points ?? '—'} | ${p.status} |`)
    }
    for (const p of c.problems) {
      const files = codeFiles(root, platform, p.code)
      if (!files.length) continue
      lines.push(
        '',
        `### ${p.label} ${p.title}: my code {#${slugify(p.label)}-code}`,
        '',
        'My accepted code, verbatim. It may be from after the contest (an upsolve), not the in-contest submission.',
        '',
        '::: code-group',
        ...files.map((f) => `<<< @/../code/contests/${platform}/${p.code}/${f} [${LANGS[path.extname(f).slice(1)]}]`),
        ':::',
      )
    }
  } else {
    lines.push(`Problem list: **Needs import** (${PLATFORMS[platform].name} does not expose it publicly).`)
  }
  lines.push('', END)
  return lines.join('\n')
}

export function newContestPage(platform, c, root) {
  return `# ${c.title}

<span class="verdict pending">Upsolve pending</span>

${renderBlock(platform, c, root)}

::: warning Not reviewed yet
The numbers above are synced automatically. Nothing below is filled in until we upsolve this contest together. A synced accepted submission is not the same as understanding the problem.
:::

## During the contest

**Needs import.** Which problems I attempted, in what order, where time went, and what I was thinking when I got stuck (verbatim).

## Upsolve

One section per problem I did not solve, or solved slowly or with wrong attempts: restate, example, edge cases, my approach (verbatim), review, the key insight, Python and Java code, complexity by counting operations.

## Takeaways

**Needs import.** Patterns to add to the [mistake log](/learning/mistake-log) and problems for the [revision queue](/learning/revision-queue).
`
}

export function replaceBlock(page, block) {
  const a = page.indexOf(START)
  const b = page.indexOf(END)
  if (a === -1 || b === -1 || b < a) return null
  return page.slice(0, a) + block + page.slice(b + END.length)
}

export function renderPlatformIndex(platform, profile, contests) {
  const name = PLATFORMS[platform].name
  const rows = contests.map(
    (c) => `| ${date(c.startTime)} | [${c.title}](./${c.slug}) | ${num(c.rank)} | ${c.solved ?? '—'} / ${c.total ?? '—'} | ${c.rating ?? '—'} (${signed(c.ratingChange)}) |`,
  )
  return `# ${name} contests

${START}

${profile?.summary || `Not synced yet. Set the \`${platform.toUpperCase()}_HANDLE\` repository variable (see [how contest sync works](/contests/)).`}

| Date | Contest | Rank | Solved | Rating |
|---|---|---|---|---|
${rows.join('\n') || '| — | No contests synced yet | | | |'}

${END}
`
}

// ---------- writing ----------

export function statePath(root, platform) {
  return path.join(root, 'data', 'contests', `${platform}.json`)
}

export function loadState(root, platform) {
  const f = statePath(root, platform)
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}
}

export function writePlatform(root, platform, { state, profile, contests }) {
  fs.mkdirSync(path.dirname(statePath(root, platform)), { recursive: true })
  fs.writeFileSync(statePath(root, platform), JSON.stringify(state, null, 2) + '\n')
  const dir = path.join(root, 'docs', 'contests', platform)
  fs.mkdirSync(dir, { recursive: true })
  const sorted = [...contests].sort((a, b) => b.startTime - a.startTime)
  fs.writeFileSync(path.join(dir, 'index.md'), renderPlatformIndex(platform, profile, sorted))
  const created = []
  for (const c of sorted) {
    const file = path.join(dir, `${c.slug}.md`)
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, newContestPage(platform, c, root))
      created.push(c.slug)
      continue
    }
    const updated = replaceBlock(fs.readFileSync(file, 'utf8'), renderBlock(platform, c, root))
    if (updated === null) console.warn(`skip ${platform}/${c.slug}: sync markers missing, page left untouched`)
    else fs.writeFileSync(file, updated)
  }
  writeSidebar(root)
  return created
}

// Sidebar entries for docs/.vitepress/config.mts, newest first per platform.
export function writeSidebar(root) {
  const out = {}
  for (const platform of Object.keys(PLATFORMS)) {
    const dir = path.join(root, 'docs', 'contests', platform)
    if (!fs.existsSync(dir)) continue
    const state = loadState(root, platform)
    out[platform] = (state.contests || [])
      .slice()
      .sort((a, b) => b.startTime - a.startTime)
      .filter((c) => fs.existsSync(path.join(dir, `${c.slug}.md`)))
      .map((c) => ({ text: c.title, link: `/contests/${platform}/${c.slug}` }))
  }
  fs.mkdirSync(path.join(root, 'data', 'contests'), { recursive: true })
  fs.writeFileSync(path.join(root, 'data', 'contests', 'sidebar.json'), JSON.stringify(out, null, 2) + '\n')
}
