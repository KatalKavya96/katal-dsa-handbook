# 4. DFS (Depth-First Search)

## Intuition

Follow **one route as far as it goes**, then come back and try the next unexplored turn. Like exploring a maze with your hand on the wall.

DFS uses a **stack** (LIFO): either the call stack, through recursion, or an explicit one.

## Recursive DFS

::: code-group
<<< @/../code/graphs/python/dfs.py#solution [Python]
<<< @/../code/graphs/java/Dfs.java#solution [Java]
:::

The recursive version is shorter because the call stack remembers where to resume after each neighbour is fully explored.

## Dry run: recursive DFS from 0

Same graph as [BFS](./03-bfs#the-lesson-graph): `[[1,2],[0,3,4],[0,5,6],[1],[1],[2],[2]]`.

| Event | Call stack (bottom → top) | First-visit order |
|---|---|---|
| call dfs(0) | 0 | 0 |
| call dfs(1) | 0 1 | 0 1 |
| call dfs(3) | 0 1 3 | 0 1 3 |
| 3 has only visited neighbours, return | 0 1 | |
| call dfs(4) | 0 1 4 | 0 1 3 4 |
| return from 4, then from 1 | 0 | |
| call dfs(2) | 0 2 | 0 1 3 4 2 |
| call dfs(5) | 0 2 5 | 0 1 3 4 2 5 |
| return from 5 | 0 2 | |
| call dfs(6) | 0 2 6 | 0 1 3 4 2 5 6 |
| return from 6, 2, 0 | (empty) | |

Order: **0 → 1 → 3 → 4 → 2 → 5 → 6**.

::: tip Not edges
"3 → 4" and "4 → 2" in that order are **not graph edges**. It's the order of first visits; between them DFS backtracks along real edges (3 → 1 → 4, and 4 → 1 → 0 → 2).
:::

## Iterative DFS with an explicit stack

`dfs_iterative` / `dfsIterative` above. On the same graph it visits **0, 2, 6, 5, 1, 4, 3**, which is a valid DFS but **not** the recursive order: the neighbour pushed last pops first. To reproduce the recursive order, push neighbours in reverse and mark on pop, or keep an iterator index per stack frame.

::: info Marking on push in iterative DFS
Marking on push (as in this code) keeps the stack at O(V) and each vertex enters it once. It does change the exact order vs. recursion, but it is still a correct traversal for reachability and components.
:::

## The recursion-depth risk

| Language | Default limit | Tested on a chain |
|---|---|---|
| Python | ~1000 frames (`sys.getrecursionlimit()`) | 100,000 nodes → `RecursionError` |
| Java | thread stack size | 10⁴ nodes OK, 5 × 10⁴ → `StackOverflowError` |

For CP with N = 10⁵ or more, **prefer iterative DFS or BFS**. (In Python, `sys.setrecursionlimit` alone can still crash the interpreter, because the C stack runs out. In Java, you can run the solve inside `new Thread(null, runnable, "", 1 << 26)` for a bigger stack.)

## Complexity

Identical argument to BFS: each vertex is visited once (O(V)) and each adjacency entry is examined once (O(2E)), so **O(V + E)** time. Auxiliary space O(V) for `visited` plus O(V) for the stack (a chain makes it V deep).

## BFS vs DFS: when to use which

| Question | BFS | DFS |
|---|---|---|
| Can A reach B? | ✅ | ✅ |
| Connected components | ✅ | ✅ |
| Min edges in an unweighted path | ✅ best fit | ❌ not guaranteed |
| Cycle detection | possible | common |
| Topological sort (DFS finish order) | (Kahn's is BFS-like) | ✅ |
| Deep graphs in Python | ✅ safe | recursive ❌, iterative ✅ |

Both are O(V + E). Which one *finds a target sooner* depends on graph shape and neighbour order, not on a guarantee. That's [Interview Round 1.1](./interview/bfs-vs-dfs#round-1-1).
