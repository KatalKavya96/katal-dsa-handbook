# Katal DSA Handbook

My living notebook for DSA interviews and competitive programming: concepts derived from first principles, dry runs, complexity derivations, interview rounds with my real first answers and the corrections, and every implementation in Python and Java.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # runs every Python and Java snippet (needs python3 and a JDK)
npm run build     # static site in docs/.vitepress/dist
```

## Deploy

Vercel: import the repo, framework preset **VitePress**, build command `npm run build`, output directory `docs/.vitepress/dist`. Works with a private repo.

## Layout

- `docs/` notes, one folder per topic (`graphs/` so far), plus `learning/` (progress, mistake log, revision queue)
- `code/` tested Python and Java, imported into the notes
- `AGENTS.md` the conventions any agent updating this repo must follow
