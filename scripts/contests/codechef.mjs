// CodeChef: there is no public API for user data any more, so this reads the rating history that
// the public profile page (codechef.com/users/<handle>) embeds as `var all_rating = [...]`.
// That is scraping: if CodeChef changes the page, this fails loudly and nothing is overwritten.
// It gives contest name, code, date, rank and rating. It does NOT give which problems I solved,
// so CodeChef pages list problems as "Needs import" and I fill them in during the upsolve.

import { slugify } from './common.mjs'

export async function fetchSnapshot(handle) {
  const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(handle)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (katal-dsa-handbook-sync)' },
  })
  if (!res.ok) throw new Error(`CodeChef profile HTTP ${res.status}`)
  return { handle, ...parseProfile(await res.text()) }
}

export function parseProfile(html) {
  const m = html.match(/var\s+all_rating\s*=\s*(\[[\s\S]*?\]);/)
  if (!m) throw new Error('CodeChef: rating history not found on the profile page (page layout changed?)')
  const ratingMatch = html.match(/<div class="rating-number">\s*(\d+)/)
  const starsMatch = html.match(/<span class="rating">\s*([^<]+)</)
  return {
    history: JSON.parse(m[1]),
    rating: ratingMatch ? Number(ratingMatch[1]) : null,
    stars: starsMatch ? starsMatch[1].trim() : null,
  }
}

// end_date is IST, e.g. "2026-10-29 22:00:00"
const toEpoch = (s) => Math.floor(Date.parse(s.replace(' ', 'T') + '+05:30') / 1000)

export function build(_prev, snap) {
  let last = null
  const contests = snap.history
    .slice()
    .sort((a, b) => toEpoch(a.end_date) - toEpoch(b.end_date))
    .map((h) => {
      const rating = Number(h.rating)
      const c = {
        slug: slugify(h.code),
        title: h.name,
        links: [
          ['Contest', `https://www.codechef.com/${h.code}`],
          ['My submissions', `https://www.codechef.com/${h.code}/status?usernames=${snap.handle}`],
        ],
        startTime: toEpoch(h.end_date),
        rank: Number(h.rank),
        solved: null,
        total: null,
        finish: null,
        rating,
        ratingChange: last == null ? null : rating - last,
        problems: [],
      }
      last = rating
      return c
    })
  const profile = {
    summary: `**Rating ${snap.rating ?? last ?? '—'}**${snap.stars ? ` (${snap.stars})` : ''} · ${contests.length} rated contests · [profile](https://www.codechef.com/users/${snap.handle})`,
  }
  return { state: { handle: snap.handle, contests }, profile, contests }
}
