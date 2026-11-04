# Mistake log

Patterns first, then every instance. Revise this before contests and interviews.

## Patterns

### 1. Concluding before tracing <Badge type="danger" text="#1 to fix" />

I state a conclusion without simulating. Instances: the bridge question, skipping the Lesson 3 dry run, Round 2.1.
**Fix:** never skip a dry run. Trace a 3 to 5 node example before answering any "does X happen?" question.

### 2. "In the queue" vs "visited"

When marking on dequeue these are different states. Root of Round 2.1.
**Fix:** for every traversal, say out loud *when* a node is marked and what that means for nodes still waiting.

### 3. Guessing complexity instead of counting

Round 2 (said worse than V², really O(V + E)), and `[False]*n` called O(1).
**Fix:** count (a) how many times each line can run in total and (b) what each run costs. Also count how many times a node can be popped.

### 4. Guarantee vs performance on one input

BFS guarantees *shortest distance*, not *less work*. Fixed myself in Round 1.1.

### 5. Problem modelling

Rooftop Rescue and Frog Messages needed solutions.
**Fix:** write "nodes = …, edges = …, query = …" before choosing an algorithm.

### 6. Imprecise claims

"Queue doesn't take extra space", "long chain means DFS is better".
**Fix:** attach the condition to every claim (which DFS? which language? which input shape?).

## Instances

| Date | Where | What I said | What's true | Pattern |
|---|---|---|---|---|
| Oct 2026 | [Checkpoint 1 Q4](/graphs/01-foundations#what-went-wrong-in-q4) | Removing 3–4 disconnects the graph | 3 → 1 → 0 → 2 → 4 still works; an edge on a cycle is never a bridge | 1 |
| Oct 2026 | [Lesson 3](/graphs/03-bfs#lesson-3-checkpoint) | (skipped the dry-run checkpoint) | — | 1 |
| Oct 2026 | [LC 1971](/graphs/problems/lc-1971#the-one-correction) | `visited = [False]*n` is O(1) creation | O(n) time and space | 3 |
| Oct 2026 | [Round 1](/graphs/interview/bfs-vs-dfs#round-1-which-would-you-choose) | BFS finds the destination earlier; DFS better on long chains | No guarantee on work; recursive DFS crashes on long chains in Python | 4, 6 |
| Oct 2026 | [Round 2](/graphs/interview/visited-timing#round-2-complexity-trap) | Probably more than V² | O(V + E): each list scanned once thanks to `continue` | 3 |
| Oct 2026 | [Round 2.1](/graphs/interview/visited-timing#round-2-1-remove-the-continue) | Queue takes no extra space, still O(V + E), no re-entry | Nodes re-enter; lists rescanned; worst case **exponential** | 1, 2, 3, 6 |
| Oct 2026 | [Rooftop Rescue](/graphs/problems/rooftop-rescue), [Frog Messages](/graphs/problems/frog-messages) | Couldn't model them | BFS on jumps; sort + gaps for components | 5 |
