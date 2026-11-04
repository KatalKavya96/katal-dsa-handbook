# Kavya's original submission (accepted), kept exactly as written, comments included.
# The "#O(1) creation" comment on visited is the mistake reviewed in the notes: it is O(n).
class Solution:
    def validPath(self, n: int, edges: list[list[int]], source: int, destination: int) -> bool:
        adj = [[] for i in range(n)]
        #O(n) space for this
        if source==destination:
            return True
        # O(1) time complexity
        for u,v in edges:
            adj[u].append(v)
            adj[v].append(u)
        # O(E) time complexity
        visited = [False]*n
        #O(1) creation
        #O(n) Time complexity
        visited[source]=True
        def dfs (root):
            for neigh in adj[root]:
                if neigh == destination:
                    return True
                if not visited[neigh]:
                    visited[neigh]=True
                    if dfs(neigh):
                        return True
            return False
        #O(V+E) time complexity
        ans = dfs(source)
        if ans:
            return ans
        return False
