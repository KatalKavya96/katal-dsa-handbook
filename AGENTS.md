# AGENTS.md: working context for any agent maintaining this repo

## Mission

Katal DSA Handbook is Kavya Katal's living DSA and competitive-programming notebook. It grows topic by topic as Kavya studies with a mentor (interview-style questioning, LeetCode foundations, then Codeforces / CodeChef). Goal: crack MAANG-level DSA rounds and reach ~2000 on CF / LC, with intuition rather than memorised templates.

## Architecture

- **VitePress 1.6.3** static site, Markdown in `docs/`, Mermaid via `vitepress-plugin-mermaid`, local search.
- **Code** lives in `code/<topic>/python/*.py` and `code/<topic>/java/*.java`. Each file has a `#region solution` that pages import with `<<< @/../code/...#solution [Python]` inside a `::: code-group`. Every file self-tests (`python3 f.py --test`, `java F --test`; Python files without the flag also run their checks).
- `scripts/verify.sh` (`npm run verify`) runs every snippet under `code/<topic>/`; `code/contests/` holds verbatim contest submissions and is not executed. Files containing `kavya` in the name are Kavya's verbatim submissions and are imported whole and not executed by the verifier directly.

```
docs/
  index.md                      home
  graphs/                       one folder per topic
    index.md                    overview, roadmap, cheat sheet
    01-…md                      concept chapters, numbered
    interview/                  interview rounds
    problems/                   one page per problem
  learning/
    progress.md  mistake-log.md  revision-queue.md  conventions.md
code/<topic>/{python,java}/
```

New topic: add `docs/<topic>/`, a sidebar group in `docs/.vitepress/config.mts`, a row on the home page and `learning/progress.md`. Don't create topics before they're studied.

## Contest sync

- `scripts/contests/sync.mjs` (`npm run sync:contests`) pulls **public** data for LeetCode (GraphQL), Codeforces (official API) and CodeChef (rating history scraped from the profile page) and writes `data/contests/<platform>.json`, `docs/contests/<platform>/index.md` and one page per contest. `.github/workflows/contest-sync.yml` runs it daily and opens a PR on branch `contest-sync`.
- Handles are repo variables `LEETCODE_HANDLE`, `CODEFORCES_HANDLE`, `CODECHEF_HANDLE`. LeetCode code comes from the LeetHub repo in `LEETHUB_REPO` (secret `LEETHUB_TOKEN` if private), copied verbatim to `code/contests/leetcode/<slug>/kavya_*`. Never use a LeetCode session cookie.
- Contest pages are created once; only the block between `<!-- contest-sync:start … -->` and `<!-- contest-sync:end -->` is regenerated. Write upsolve notes **outside** that block. Change the verdict from `Upsolve pending` to `Upsolved` only after the upsolve is actually done.
- `npm run test:sync` runs offline fixture tests (no network needed).

## Content rules (non-negotiable)

1. **Kavya's answers are verbatim**, typos included, in a `::: info` box headed "My answer, verbatim". Never paraphrase, improve or invent them. Keep them separate from the model answer.
2. Every interview round: question → verbatim answer → verdict tag (`<span class="verdict ok|partial|wrong|pending">`) → counterexample / challenge → model answer → key insight.
3. **Don't publish solutions to questions Kavya hasn't attempted yet** (currently Round 2.2, LC 547, the Lesson 3 checkpoint, the Frog Messages follow-up). Mark them Pending.
4. **Never reconstruct from memory.** Missing source material is marked "Needs import".
5. **Corrections win.** If a mentor's in-session answer was wrong, publish the verified version and flag it with a `::: danger Correction` box (example: Round 2.1 is exponential, not O(V·E)).
6. Complexity is derived by counting operations, never just stated.
7. Every implementation in **Python and Java**, tested.
8. Each problem page says honestly whether Kavya solved it alone or needed the solution.
9. Headings that contain a verdict span need an explicit `{#id}` at the end, or the slug includes the span text.
10. Voice: first person ("I", Kavya) for history and mistakes; neutral voice for reference material.

## Update procedure (after each study milestone)

1. Read the new material (question, Kavya's first answer, counter-question, corrected answer, code).
2. Update the existing topic page rather than creating duplicates.
3. Add/refresh code in `code/`, run `npm run verify`.
4. Update `learning/progress.md`, `learning/mistake-log.md` (instances + patterns), `learning/revision-queue.md` (tick answered questions), the topic roadmap, and the home page's "Currently studying".
5. `npm run build` must pass (it also checks dead links).
6. Commit with a topic-scoped message, e.g. `graphs: add Round 2.2 answer and review`, then push.

**Commit identity (Kavya's standing rule):** every commit is authored and committed as `Kavya Katal <kavyakatal09@gmail.com>`. Never add `Co-Authored-By`, `Claude-Session` or any other AI/agent trailer to commit messages.

## Current state (24 Oct 2026)

- Graphs: Lessons 1 to 3, LC 1971, Frog Messages, interview rounds 1 to 2.1 imported. Round 2.2 and LC 547 pending. Rooftop Rescue needs import (statement not in the transcript).
- Source of the import: Kavya's ChatGPT transcript (pasted into the Claude project) plus `journey/chatgpt-handover-summary.md` and `journey/master-plan.md` in the project files.
- Deployment: not yet configured. Vercel (framework preset VitePress, output `docs/.vitepress/dist`) works with private repos.
