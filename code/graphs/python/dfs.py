# #region solution
import sys


def dfs_recursive(graph, node, visited, order):
    visited[node] = True
    order.append(node)
    for neighbor in graph[node]:
        if not visited[neighbor]:
            dfs_recursive(graph, neighbor, visited, order)


def dfs_iterative(graph, start):
    visited = [False] * len(graph)
    stack = [start]
    visited[start] = True
    order = []

    while stack:
        node = stack.pop()                    # LIFO
        order.append(node)
        for neighbor in graph[node]:
            if not visited[neighbor]:
                visited[neighbor] = True
                stack.append(neighbor)
    return order
# #endregion solution


if __name__ == "__main__":
    graph = [[1, 2], [0, 3, 4], [0, 5, 6], [1], [1], [2], [2]]
    order = []
    dfs_recursive(graph, 0, [False] * 7, order)
    assert order == [0, 1, 3, 4, 2, 5, 6]
    # Valid traversal, but NOT the recursive order: the last-pushed neighbour pops first.
    assert dfs_iterative(graph, 0) == [0, 2, 6, 5, 1, 4, 3]

    # Recursion-depth risk: a chain of 100,000 nodes.
    n = 100_000
    chain = [[] for _ in range(n)]
    for i in range(n - 1):
        chain[i].append(i + 1)
        chain[i + 1].append(i)
    assert len(dfs_iterative(chain, 0)) == n
    try:
        dfs_recursive(chain, 0, [False] * n, [])
        raise AssertionError("expected RecursionError")
    except RecursionError:
        pass                                  # default limit is ~1000 frames
    print("dfs.py OK")
