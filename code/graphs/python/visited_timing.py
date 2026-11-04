# #region solution
# Interview Round 2 / 2.1: what happens when BFS marks visited on DEQUEUE.
from collections import deque


def bfs_round2(graph, start):
    """Mark on dequeue, skip already-visited pops (has `continue`)."""
    visited, queue = set(), deque([start])
    pops = scans = 0
    while queue:
        node = queue.popleft()
        pops += 1
        if node in visited:
            continue
        visited.add(node)
        for neighbor in graph[node]:
            scans += 1
            queue.append(neighbor)
    return pops, scans


def bfs_round2_1(graph, start):
    """Mark on dequeue, check before append, NO `continue` (the buggy version)."""
    visited, queue = set(), deque([start])
    pops = scans = 0
    while queue:
        node = queue.popleft()
        pops += 1
        visited.add(node)
        for neighbor in graph[node]:
            scans += 1
            if neighbor not in visited:
                queue.append(neighbor)
    return pops, scans


def ladder(k):
    """Node 0, then k levels of 2 nodes; every node links to both nodes of the next level."""
    n = 2 * k + 1
    graph = [[] for _ in range(n)]
    levels = [[0]] + [[2 * i + 1, 2 * i + 2] for i in range(k)]
    edges = 0
    for upper, lower in zip(levels, levels[1:]):
        for u in upper:
            for v in lower:
                graph[u].append(v)
                graph[v].append(u)
                edges += 1
    return graph, n, edges
# #endregion solution


if __name__ == "__main__":
    triangle = [[1, 2], [0, 2], [0, 1]]
    assert bfs_round2(triangle, 0) == (7, 6)          # 2E = 6 scans: each list scanned once
    print(f"{'k':>3} {'V':>4} {'E':>4} {'V*E':>6} {'pops 2':>7} {'pops 2.1':>9} {'scans 2.1':>10}")
    for k in (5, 8, 11):
        g, v, e = ladder(k)
        p2, s2 = bfs_round2(g, 0)
        p21, s21 = bfs_round2_1(g, 0)
        assert s2 == 2 * e                            # Round 2 stays O(V + E)
        assert p21 == 2 ** (k + 1) - 1                # Round 2.1 is exponential
        print(f"{k:>3} {v:>4} {e:>4} {v*e:>6} {p2:>7} {p21:>9} {s21:>10}")
    print("visited_timing.py OK")
