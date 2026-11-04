// LeetCode: public GraphQL only (no login, no cookie).
//   userContestRanking, userContestRankingHistory: rating, rank, solved count per contest
//   recentAcSubmissionList: my last ~20 accepted submissions (title, time, language), no code
//   /contest/api/info/<slug>/: the contest's problem list
// Code comes from the repo the LeetHub browser extension pushes to (one folder per problem,
// "<number>-<slug>" or "<slug>"), copied verbatim into code/contests/leetcode/<slug>/.

import fs from 'node:fs'
import path from 'node:path'
import { slugify, date, clock, getJson, copyCode, LANGS } from './common.mjs'

const CONTEST_SECONDS = 90 * 60 // weekly and biweekly both run 90 minutes
const BASE_RATING = 1500
const HEADERS = { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' }

const QUERY = `query ($username: String!) {
  userContestRanking(username: $username) { attendedContestsCount rating globalRanking topPercentage }
  userContestRankingHistory(username: $username) {
    attended rating ranking problemsSolved totalProblems finishTimeInSeconds
    contest { title startTime }
  }
  recentAcSubmissionList(username: $username, limit: 20) { id title titleSlug timestamp lang }
}`

export async function fetchSnapshot(username, prev = {}) {
  const body = await getJson('https://leetcode.com/graphql', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ query: QUERY, variables: { username } }),
  })
  if (body.errors) throw new Error(`LeetCode GraphQL: ${JSON.stringify(body.errors)}`)
  const d = body.data
  if (!d.userContestRankingHistory) throw new Error(`LeetCode: no contest data for "${username}"`)
  const known = new Set((prev.contests || []).filter((c) => c.problems.length).map((c) => c.slug))
  const questions = {}
  for (const h of d.userContestRankingHistory) {
    const slug = slugify(h.contest.title)
    if (!h.attended || known.has(slug)) continue
    try {
      const info = await getJson(`https://leetcode.com/contest/api/info/${slug}/`, { headers: HEADERS })
      questions[slug] = (info.questions || []).map((q) => ({ title: q.title, slug: q.title_slug, credit: q.credit }))
    } catch {
      // best effort: the page just says the problem list needs import
    }
  }
  return {
    username,
    ranking: d.userContestRanking,
    history: d.userContestRankingHistory,
    recentAc: d.recentAcSubmissionList || [],
    questions,
  }
}

function status(q, startTime, accepted, acceptedSince) {
  const hits = Object.values(accepted).filter((s) => s.slug === q.slug)
  const end = startTime + CONTEST_SECONDS
  if (hits.length) {
    const first = Math.min(...hits.map((s) => s.timestamp))
    if (first >= startTime && first <= end) return `Accepted in contest (${clock(first - startTime)})`
    if (first > end) return `Upsolved ${date(first)}`
  }
  // older than the submission history we hold: unknown, not unsolved
  return startTime < acceptedSince ? 'Unknown (before sync history)' : 'Not accepted yet'
}

export function importLeetHub(root, dir, slugs) {
  const copied = []
  if (!dir || !fs.existsSync(dir)) return copied
  const want = new Set(slugs)
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const slug = e.name.replace(/^\d+-/, '')
    if (!e.isDirectory() || !want.has(slug)) continue
    for (const f of fs.readdirSync(path.join(dir, e.name))) {
      if (LANGS[path.extname(f).slice(1)]) copied.push(copyCode(root, 'leetcode', slug, path.join(dir, e.name, f)))
    }
  }
  return copied
}

export function build(prev, snap) {
  const accepted = { ...(prev.accepted || {}) }
  for (const s of snap.recentAc) accepted[s.id] = { title: s.title, slug: s.titleSlug, timestamp: Number(s.timestamp) }
  // The list returns at most 20 items. If the first ever fetch was full, anything accepted before
  // its oldest item is invisible to us; daily runs keep it complete from then on.
  const acceptedSince =
    prev.acceptedSince ?? (snap.recentAc.length >= 20 ? Math.min(...snap.recentAc.map((s) => Number(s.timestamp))) : 0)
  const oldQuestions = Object.fromEntries((prev.contests || []).map((c) => [c.slug, c.rawQuestions || []]))

  let last = BASE_RATING
  const contests = snap.history
    .filter((h) => h.attended)
    .sort((a, b) => a.contest.startTime - b.contest.startTime)
    .map((h) => {
      const slug = slugify(h.contest.title)
      const rating = Math.round(h.rating)
      const qs = snap.questions[slug] || oldQuestions[slug] || []
      const c = {
        slug,
        title: h.contest.title,
        links: [
          ['Contest', `https://leetcode.com/contest/${slug}/`],
          ['Ranking', `https://leetcode.com/contest/${slug}/ranking/`],
        ],
        startTime: h.contest.startTime,
        rank: h.ranking,
        solved: h.problemsSolved,
        total: h.totalProblems,
        finish: clock(h.finishTimeInSeconds || null),
        rating,
        ratingChange: rating - last,
        rawQuestions: qs,
        problems: qs.map((q, i) => ({
          label: `Q${i + 1}`,
          title: q.title,
          url: `https://leetcode.com/problems/${q.slug}/`,
          points: q.credit,
          status: status(q, h.contest.startTime, accepted, acceptedSince),
          code: q.slug,
        })),
      }
      last = rating
      return c
    })

  const r = snap.ranking
  const profile = r && {
    summary: `**Rating ${Math.round(r.rating)}** · ${r.attendedContestsCount} contests · global rank ${Number(r.globalRanking).toLocaleString('en-US')} · top ${r.topPercentage}% · [profile](https://leetcode.com/u/${snap.username}/)`,
  }
  return { state: { username: snap.username, acceptedSince, accepted, contests }, profile, contests }
}
