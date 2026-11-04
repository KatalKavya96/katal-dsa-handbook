---
outline: false
---

# Playground

Write code, type your own input, press **Run** (or Ctrl/⌘ + Enter). There are no test cases and no judge, on purpose: this is for reading a problem and trying an idea on the spot. Keep the problem open in another tab on its original site; problem pages here link to it.

<Playground id="scratch" height="420px" />

## How to use it well

- **State the example first.** Before you run anything, write the sample input into the box and say out loud what the output should be. If you can't, you don't understand the problem yet.
- **You are the judge.** Since nothing hidden checks you, list edge cases before coding (empty input, n = 1, duplicates, max values) and run each one by hand.
- **LeetCode problems** take function arguments, not stdin. Pick a simple input format (for example `n m`, then `m` edge lines), parse it in `main`, call your function and print the result.
- Code and input are saved in this browser, separately for each page. **Reset** restores the starter template.

## What runs where

| | Python | Java |
|---|---|---|
| Engine | [Pyodide](https://pyodide.org) (CPython 3.14 compiled to WebAssembly) | [CheerpJ](https://cheerpj.com) (OpenJDK 17 compiled to WebAssembly) |
| First run | downloads ~13 MB from this site, then cached | downloads the JVM from CheerpJ's CDN, then cached; the first compile takes several seconds |
| Time limit | 10 s, then the run is killed | none: a stuck run needs a page reload |
| Output | stdout, and stderr in red | stdout and stderr merged |

Everything runs inside your browser. Your code is never sent to a server.

Timings are **not** comparable to a judge. WebAssembly is slower than native, and the first Java run includes warming up `javac`. Use the complexity you derive, not the milliseconds shown here, to decide whether a solution is fast enough.
