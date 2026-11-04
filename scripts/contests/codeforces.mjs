// Codeforces: the official public API (https://codeforces.com/apiHelp), no key needed.
//   user.info        current rating and rank title
//   user.rating      every rated contest: rank, old and new rating
//   user.status      every submission with verdict and participant type (contest vs practice)
//   contest.standings?handles=<me>  the problem list and my per-problem result in the contest
// The API never returns source code, so code for Codeforces is added by hand (or by any tool that
// writes into code/contests/codeforces/<contestId><index>/kavya_*).
// Unrated participations (Div. 1+2 out of competition, virtuals) are not in user.rating, so they are skipped.

import { date, clock, getJson, sleep } from './common.mjs'

const API = 'https://codeforces.com/api'
const GAP_MS = 2100 // Codeforces allows about one call every two seconds

async function call(method, params) {
  const q = new URLSearchParams(params).toString()
  const body = await getJson(`${API}/${method}?${q}`)
  await sleep(GAP_MS)
  if (body.status !== 'OK') throw new Error(`Codeforces ${method}: ${body.comment}`)
  return body.result
}

export async function fetchSnapshot(handle, prev = {}) {
  const [info] = await call('user.info', { handles: handle })
  const rating = await call('user.rating', { handle })
  const submissions = await call('user.status', { handle })
  const known = new Set((prev.contests || []).map((c) => c.contestId))
  const standings = {}
  for (const r of rating) {
    if (known.has(r.contestId)) continue
    const s = await call('contest.standings', { contestId: r.contestId, handles: handle, showUnofficial: false })
    standings[r.contestId] = {
      contest: s.contest,
      problems: s.problems.map((p) => ({ index: p.index, name: p.name, points: p.points })),
      row: s.rows[0] && { rank: s.rows[0].rank, results: s.rows[0].problemResults },
    }
  }
  return {
    handle,
    info: { rating: info.rating, maxRating: info.maxRating, rank: info.rank },
    rating,
    // keep only what we use: accepted outside the contest, i.e. upsolves
    upsolves: submissions
      .filter((s) => s.verdict === 'OK' && s.author.participantType !== 'CONTESTANT')
      .map((s) => ({ contestId: s.problem.contestId, index: s.problem.index, time: s.creationTimeSeconds })),
    standings,
  }
}

export function build(prev, snap) {
  const old = Object.fromEntries((prev.contests || []).map((c) => [c.contestId, c.raw]))
  const upsolved = {}
  for (const u of snap.upsolves) {
    const k = `${u.contestId}${u.index}`
    upsolved[k] = Math.min(upsolved[k] ?? Infinity, u.time)
  }
  const contests = snap.rating.map((r) => {
    const raw = snap.standings[r.contestId] || old[r.contestId]
    const start = raw?.contest?.startTimeSeconds ?? r.ratingUpdateTimeSeconds
    const results = raw?.row?.results || []
    const problems = (raw?.problems || []).map((p, i) => {
      const res = results[i] || {}
      const wrong = res.rejectedAttemptCount ? `, ${res.rejectedAttemptCount} wrong` : ''
      const key = `${r.contestId}${p.index}`
      let status
      if (res.points > 0) status = `Accepted in contest (${clock(res.bestSubmissionTimeSeconds)}${wrong})`
      else if (upsolved[key]) status = `Upsolved ${date(upsolved[key])}`
      else status = res.rejectedAttemptCount ? `Not solved (${res.rejectedAttemptCount} wrong)` : 'Not solved yet'
      return {
        label: p.index,
        title: p.name,
        url: `https://codeforces.com/contest/${r.contestId}/problem/${p.index}`,
        points: p.points,
        status,
        code: key,
      }
    })
    const solved = results.filter((x) => x.points > 0)
    return {
      contestId: r.contestId,
      slug: `round-${r.contestId}`,
      title: r.contestName,
      links: [
        ['Contest', `https://codeforces.com/contest/${r.contestId}`],
        ['My submissions', `https://codeforces.com/submissions/${snap.handle}/contest/${r.contestId}`],
      ],
      startTime: start,
      rank: r.rank,
      solved: raw ? solved.length : null,
      total: raw ? raw.problems.length : null,
      finish: solved.length ? clock(Math.max(...solved.map((x) => x.bestSubmissionTimeSeconds))) : null,
      rating: r.newRating,
      ratingChange: r.newRating - r.oldRating,
      raw,
      problems,
    }
  })
  const i = snap.info
  const profile = {
    summary: `**Rating ${i.rating ?? 'unrated'}** (${i.rank ?? '—'}) · max ${i.maxRating ?? '—'} · ${snap.rating.length} rated contests · [profile](https://codeforces.com/profile/${snap.handle})`,
  }
  return { state: { handle: snap.handle, contests }, profile, contests }
}
