# #region solution
from collections import deque


class Solution:
    # BFS: mark on enqueue, stop as soon as destination is popped.
    def validPathBFS(self, n, edges, source, destination):
        adj = [[] for _ in range(n)]
        for u, v in edges:
            adj[u].append(v)
            adj[v].append(u)

        visited = [False] * n
        visited[source] = True
        queue = deque([source])
        while queue:
            node = queue.popleft()
            if node == destination:
                return True
            for neighbor in adj[node]:
                if not visited[neighbor]:
                    visited[neighbor] = True
                    queue.append(neighbor)
        return False

    # Iterative DFS: same O(V + E), no recursion-depth risk.
    def validPath(self, n, edges, source, destination):
        adj = [[] for _ in range(n)]
        for u, v in edges:
            adj[u].append(v)
            adj[v].append(u)

        visited = [False] * n
        visited[source] = True
        stack = [source]
        while stack:
            node = stack.pop()
            if node == destination:
                return True
            for neighbor in adj[node]:
                if not visited[neighbor]:
                    visited[neighbor] = True
                    stack.append(neighbor)
        return False
# #endregion solution


if __name__ == "__main__":
    from lc1971_kavya_dfs import Solution as KavyaSolution
    cases = [
        (3, [[0, 1], [1, 2], [2, 0]], 0, 2, True),
        (6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5, False),
        (1, [], 0, 0, True),
        (2, [], 0, 1, False),
    ]
    for n, e, s, d, want in cases:
        assert Solution().validPathBFS(n, e, s, d) == want
        assert Solution().validPath(n, e, s, d) == want
        assert KavyaSolution().validPath(n, e, s, d) == want
    print("lc1971.py OK")
