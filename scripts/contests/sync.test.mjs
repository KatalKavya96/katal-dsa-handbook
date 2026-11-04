// Offline tests for the contest sync (no network). Run: npm run test:sync
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { run } from './sync.mjs'
import { slugify } from './common.mjs'
import { parseProfile } from './codechef.mjs'

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'contest-sync-'))
const read = (root, p) => fs.readFileSync(path.join(root, p), 'utf8')
const fixture = (name) => JSON.parse(fs.readFileSync(path.join(fixtures, `${name}.json`), 'utf8'))

test('slugs match contest URLs', () => {
  assert.equal(slugify('Weekly Contest 420'), 'weekly-contest-420')
  assert.equal(slugify('START200D'), 'start200d')
})

test('LeetCode: attended contests only, statuses from accepted submissions', async () => {
  const root = tmp()
  assert.equal(await run({ root, fixtures }), true)
  const state = JSON.parse(read(root, 'data/contests/leetcode.json'))
  assert.deepEqual(state.contests.map((c) => [c.slug, c.ratingChange]), [['biweekly-contest-50', 31], ['weekly-contest-200', 31]])
  const page = read(root, 'docs/contests/leetcode/weekly-contest-200.md')
  assert.match(page, /Fixture A.*Accepted in contest \(10:00\)/)
  assert.match(page, /Fixture C.*Upsolved/)
  assert.match(page, /Fixture D.*Not accepted yet/)
  assert.match(read(root, 'docs/contests/leetcode/biweekly-contest-50.md'), /Needs import/)
})

test('LeetCode: contests older than a full first fetch are Unknown, not unsolved', async () => {
  const root = tmp()
  const dir = tmp()
  const snap = fixture('leetcode')
  snap.recentAc = Array.from({ length: 20 }, (_, i) => ({ id: `x${i}`, title: `X${i}`, titleSlug: `x${i}`, timestamp: String(1761500000 + i) }))
  fs.writeFileSync(path.join(dir, 'leetcode.json'), JSON.stringify(snap))
  await run({ root, fixtures: dir })
  assert.match(read(root, 'docs/contests/leetcode/weekly-contest-200.md'), /Fixture D.*Unknown/)
})

test('LeetCode: LeetHub folders are copied verbatim and embedded', async () => {
  const root = tmp()
  const hub = tmp()
  fs.mkdirSync(path.join(hub, '3001-fixture-a'))
  fs.writeFileSync(path.join(hub, '3001-fixture-a', '3001-fixture-a.py'), 'class Solution:  # typo kept\n')
  fs.writeFileSync(path.join(hub, '3001-fixture-a', 'README.md'), 'statement')
  fs.mkdirSync(path.join(hub, 'unrelated'))
  await run({ root, fixtures, env: { LEETHUB_DIR: hub } })
  assert.equal(read(root, 'code/contests/leetcode/fixture-a/kavya_3001-fixture-a.py'), 'class Solution:  # typo kept\n')
  assert.match(read(root, 'docs/contests/leetcode/weekly-contest-200.md'), /<<< @\/\.\.\/code\/contests\/leetcode\/fixture-a\/kavya_3001-fixture-a\.py \[Python\]/)
})

test('Codeforces: in-contest results, wrong attempts and upsolves', async () => {
  const root = tmp()
  await run({ root, fixtures })
  const page = read(root, 'docs/contests/codeforces/round-9002.md')
  assert.match(page, /\| 3,100 \| 2 \/ 3 \| 50:00 \| 1288 \| \+188 \|/)
  assert.match(page, /Fixture A.*Accepted in contest \(10:00\)/)
  assert.match(page, /Fixture B.*Accepted in contest \(50:00, 2 wrong\)/)
  assert.match(page, /Fixture C.*Upsolved/)
  // standings missing for 9001: still a page, problems marked for import
  assert.match(read(root, 'docs/contests/codeforces/round-9001.md'), /Needs import/)
})

test('CodeChef: rating history, rating change, profile parsing', async () => {
  const root = tmp()
  await run({ root, fixtures })
  assert.match(read(root, 'docs/contests/codechef/start200d.md'), /\| 2,345 \| — \/ — \| — \| 1450 \| \+50 \|/)
  const html = '<div class="rating-number">1450</div><script>var all_rating = [{"code":"X","name":"Y","end_date":"2026-01-01 22:00:00","rating":"1400","rank":"9"}];</script>'
  assert.equal(parseProfile(html).history[0].code, 'X')
  assert.throws(() => parseProfile('<html></html>'), /layout changed/)
})

test('re-sync keeps hand-written notes and updates the generated block', async () => {
  const root = tmp()
  await run({ root, fixtures })
  const file = path.join(root, 'docs/contests/codeforces/round-9002.md')
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('## Takeaways', '## Takeaways\n\nMY OWN NOTE'))
  const dir = tmp()
  const cf = fixture('codeforces')
  cf.rating[1].rank = 3000
  fs.writeFileSync(path.join(dir, 'codeforces.json'), JSON.stringify(cf))
  await run({ root, fixtures: dir })
  const page = fs.readFileSync(file, 'utf8')
  assert.match(page, /MY OWN NOTE/)
  assert.match(page, /\| 3,000 \|/)
})

test('LeetCode accepted submissions accumulate across runs', async () => {
  const root = tmp()
  await run({ root, fixtures })
  const dir = tmp()
  fs.writeFileSync(path.join(dir, 'leetcode.json'), JSON.stringify({ ...fixture('leetcode'), recentAc: [] }))
  await run({ root, fixtures: dir })
  assert.equal(Object.keys(JSON.parse(read(root, 'data/contests/leetcode.json')).accepted).length, 3)
})

test('a failing platform reports failure and leaves the others alone', async () => {
  const root = tmp()
  const dir = tmp()
  fs.writeFileSync(path.join(dir, 'codechef.json'), '{"handle":"x"}') // no history -> throws
  fs.copyFileSync(path.join(fixtures, 'codeforces.json'), path.join(dir, 'codeforces.json'))
  assert.equal(await run({ root, fixtures: dir }), false)
  assert.ok(fs.existsSync(path.join(root, 'docs/contests/codeforces/round-9002.md')))
  assert.ok(!fs.existsSync(path.join(root, 'data/contests/codechef.json')))
})
