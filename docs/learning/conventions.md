# How this notebook works

## Page types

- **Concept chapters** (`/graphs/01-…`): intuition → diagram → algorithm → code → dry run → complexity → correctness → comparison → pitfalls.
- **Interview rounds** (`/graphs/interview/…`): the question, **my first answer verbatim** (in an info box), a verdict, the counterexample, and the corrected model answer. My answer and the model answer are always kept separate. Mistakes are never erased.
- **Problems** (`/graphs/problems/…`): statement, modelling (nodes / edges / query), my submission if I wrote one, review, reference code, complexity, edge cases. Each page states honestly whether I solved it alone or needed the solution.

## Verdict tags

<span class="verdict ok">Correct</span> <span class="verdict partial">Partially correct</span> <span class="verdict wrong">Incorrect</span> <span class="verdict pending">Pending</span>

## Code

All code lives in `/code/<topic>/{python,java}` and is pulled into pages with VitePress snippet imports, so what you read is exactly what's tested. `npm run verify` runs every file. Every implementation comes in Python **and** Java.

## Accuracy rules

- If an explanation given during a session turns out to be wrong, the notebook publishes the corrected version and marks the correction (see [Round 2.1](/graphs/interview/visited-timing#correction)).
- Nothing is reconstructed from memory. Missing material is marked **Needs import**.
- Solutions to questions I haven't attempted yet stay out until I've answered.
