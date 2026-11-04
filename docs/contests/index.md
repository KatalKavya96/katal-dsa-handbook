# Contests

Every rated contest I give on LeetCode, Codeforces and CodeChef gets a page here. The scores sync automatically; the upsolve does not.

| Platform | Synced automatically | My code |
|---|---|---|
| [LeetCode](./leetcode/) | Rank, rating, solved count, problem list, whether each problem was accepted in the contest or later | Copied from my LeetHub repo |
| [Codeforces](./codeforces/) | Rank, rating change, problem list, per-problem result (time, wrong attempts), upsolves | Added by hand |
| [CodeChef](./codechef/) | Rank and rating per contest | Added by hand; problem list **Needs import** |

## The rule

A contest only counts as done when its page says <span class="verdict ok">Upsolved</span>. Every new page starts as <span class="verdict pending">Upsolve pending</span>. Syncing the score is bookkeeping; the upsolve (restate, example, edge cases, my approach verbatim, review, key insight, Python and Java, complexity) is where the learning is.

## How the sync works

A GitHub Action (`.github/workflows/contest-sync.yml`) runs every day, reads only **public** data, and opens a pull request titled `contests: sync contest results`. Nothing is published until I merge it.

- **LeetCode**: public GraphQL (contest history, recent accepted submissions). No login or session cookie is used. The accepted list only reaches back about 20 submissions, so problems from contests before the first sync show as "Unknown".
- **Codeforces**: the official API (`user.rating`, `user.status`, `contest.standings`). Unrated participations are skipped.
- **CodeChef**: no public API exists, so the sync reads the rating history embedded in my public profile page. If CodeChef changes that page, the CodeChef step fails and the other two still sync.

Each contest page is created once. Later syncs only rewrite the block between the `contest-sync` markers at the top, so my upsolve notes are never overwritten.

## Setup (one time)

1. **Repository variables** (Settings → Secrets and variables → Actions → Variables): `LEETCODE_HANDLE`, `CODEFORCES_HANDLE`, `CODECHEF_HANDLE`. Leave one out to skip that platform.
2. **Settings → Actions → General → Workflow permissions**: tick "Allow GitHub Actions to create and approve pull requests".
3. **LeetCode code (optional)**: install the LeetHub browser extension and point it at a repo of mine, then set the variable `LEETHUB_REPO` (e.g. `KatalKavya96/leetcode-solutions`). If that repo is private, add a fine-grained token with read access to it as the secret `LEETHUB_TOKEN`.
4. Run it once by hand: Actions → Contest sync → Run workflow.
