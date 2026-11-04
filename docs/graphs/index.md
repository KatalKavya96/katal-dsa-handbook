# Graphs

> Goal: read an unfamiliar Codeforces or CodeChef problem and naturally ask **what are the nodes, what are the edges, what is the query?** before naming an algorithm.

## Why this chapter restarted

In October 2026 I solved **Rooftop Rescue** and **Frog Messages** only after seeing the solutions. My last graph study was seven months earlier, so I decided on a full revision: theory to the core, dry runs that come easily, complexity calculated automatically while solving, foundational LeetCode, and then CF/CodeChef problems.

## The method for every concept

Intuition → Diagram → Algorithm → Implementation (Python **and** Java) → Manual dry run → Complexity → LeetCode practice → Variations → Independent solving.

## The questions to ask about any problem

1. What is the underlying structure? Could I model this as a graph?
2. What should be the nodes and edges?
3. Is the question about **reachability, shortest paths, connected groups, cycles, or ordering**?
4. Which algorithm fits, and why?
5. Can I dry-run it, argue it's correct, and count its time and space?
6. Will it pass the constraints?

## Roadmap

| # | Concept | Practice | Status |
|---|---|---|---|
| 1 | [Terminology](./01-foundations), [representations](./02-representations) | checkpoints (3/4, 5/5) | ✅ Done |
| 2 | [BFS](./03-bfs) / [DFS](./04-dfs), visited timing, complexity | [LC 1971](./problems/lc-1971), [interview rounds](./interview/bfs-vs-dfs) 1 to 2.1 | 🟡 Round 2.2 pending |
| 3 | [Connected components](./05-connected-components) | [LC 547](./problems/lc-547), LC 323, LC 1319 | ⬜ Next |
| 4 | Grid graphs, flood fill, multi-source BFS | LC 200, 695, 994, 542, 1020 | ⬜ |
| 5 | Bipartite / 2-colouring | LC 785, 886 | ⬜ |
| 6 | Cycle detection (undirected; directed with 3 colours) | LC 207, 802 | ⬜ |
| 7 | Topological sort (Kahn and DFS), DP on DAG | LC 210, 1136, 329 | ⬜ |
| 8 | DSU (path compression, union by size) | LC 684, 721, 1579 | ⬜ |
| 9 | Shortest paths: BFS, 0-1 BFS, Dijkstra, Bellman-Ford, Floyd-Warshall | LC 743, 787, 1631, 1368, 1334 | ⬜ |
| 10 | MST: Kruskal, Prim | LC 1584, 1135 | ⬜ |
| 11 | Implicit / state-space graphs | LC 752, 773, 847 | ⬜ |

After this: graph CP (modelling drills, trees: diameter / rerooting / LCA, bridges and articulation points, SCC, 2-SAT, DSU offline), using the CSES Graph section and CF problems rated 1400 to 2100.

## Cheat sheet (so far)

| I need... | Reach for | Time | Aux. space |
|---|---|---|---|
| Can A reach B? | BFS or iterative DFS | O(V + E) | O(V) |
| Min edges, unweighted | BFS (distance array) | O(V + E) | O(V) |
| Count / label groups | DFS/BFS from each unvisited node | O(V + E) | O(V) |
| Groups on a number line with gap ≤ K | Sort + scan gaps | O(N log N) | O(N) |
| Neighbours of u | Adjacency list | O(deg(u)) | — |
| Is u–v an edge, dense graph | Adjacency matrix | O(1) | O(V²) total |
