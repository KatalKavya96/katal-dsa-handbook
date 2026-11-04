#!/usr/bin/env node
// Syncs my public contest results into the handbook.
//
//   node scripts/contests/sync.mjs                         all platforms whose handle is set
//   node scripts/contests/sync.mjs --only codeforces
//   node scripts/contests/sync.mjs --fixtures <dir>        offline: reads <dir>/<platform>.json snapshots
//
// Handles come from env (GitHub repository variables in the workflow):
//   LEETCODE_HANDLE, CODEFORCES_HANDLE, CODECHEF_HANDLE
// LEETHUB_DIR: optional checkout of the repo LeetHub pushes to; LeetCode code is copied from it.
//
// One platform failing (site down, layout changed) does not stop the others, but the run exits 1
// so the workflow shows red instead of silently going stale.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PLATFORMS, loadState, writePlatform, writeSidebar } from './common.mjs'
import * as leetcode from './leetcode.mjs'
import * as codeforces from './codeforces.mjs'
import * as codechef from './codechef.mjs'

const MODULES = { leetcode, codeforces, codechef }
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

export async function run({ root = ROOT, only, fixtures, env = process.env } = {}) {
  let failed = false
  for (const platform of Object.keys(PLATFORMS)) {
    if (only && only !== platform) continue
    const mod = MODULES[platform]
    const prev = loadState(root, platform)
    try {
      let snap
      if (fixtures) {
        const f = path.join(fixtures, `${platform}.json`)
        if (!fs.existsSync(f)) continue
        snap = JSON.parse(fs.readFileSync(f, 'utf8'))
      } else {
        const handle = env[`${platform.toUpperCase()}_HANDLE`]
        if (!handle) {
          console.log(`${platform}: no ${platform.toUpperCase()}_HANDLE set, skipped`)
          continue
        }
        snap = await mod.fetchSnapshot(handle, prev)
      }
      const result = mod.build(prev, snap)
      if (platform === 'leetcode') {
        const slugs = result.contests.flatMap((c) => c.problems.map((p) => p.code))
        const copied = leetcode.importLeetHub(root, env.LEETHUB_DIR, slugs)
        if (copied.length) console.log(`leetcode: copied from LeetHub ${copied.join(', ')}`)
      }
      const created = writePlatform(root, platform, result)
      console.log(`${platform}: ${result.contests.length} contests, new pages: ${created.join(', ') || 'none'}`)
    } catch (e) {
      failed = true
      console.error(`${platform}: FAILED, nothing written. ${e.message}`)
    }
  }
  writeSidebar(root)
  return !failed
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
  run({ only: opt('--only'), fixtures: opt('--fixtures') }).then((ok) => process.exit(ok ? 0 : 1))
}
