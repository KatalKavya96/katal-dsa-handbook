# #region solution
from collections import deque


def bfs_order(graph, start):
    n = len(graph)
    visited = [False] * n                     # O(V) time and space
    queue = deque([start])
    visited[start] = True                     # mark on ENQUEUE
    order = []

    while queue:                              # each vertex enters the queue at most once -> <= V iterations
        node = queue.popleft()                # O(1) with deque (list.pop(0) would be O(V))
        order.append(node)
        for neighbor in graph[node]:          # summed over all vertices: 2E entries
            if not visited[neighbor]:
                visited[neighbor] = True
                queue.append(neighbor)
    return order


def shortest_distances(graph, start):
    dist = [-1] * len(graph)                  # -1 = undiscovered, doubles as the visited array
    dist[start] = 0
    queue = deque([start])

    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if dist[neighbor] == -1:
                dist[neighbor] = dist[node] + 1
                queue.append(neighbor)
    return dist
# #endregion solution


if __name__ == "__main__":
    graph = [[1, 2], [0, 3, 4], [0, 5, 6], [1], [1], [2], [2]]
    assert bfs_order(graph, 0) == [0, 1, 2, 3, 4, 5, 6]
    assert shortest_distances(graph, 0) == [0, 1, 1, 2, 2, 2, 2]
    print("bfs.py OK")
