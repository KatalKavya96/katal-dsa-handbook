# #region solution
# Graph representations: edge list -> adjacency matrix and adjacency list.

def build_matrix(n, edges):
    matrix = [[0] * n for _ in range(n)]      # O(V^2) time and space
    for u, v in edges:                        # O(E)
        matrix[u][v] = 1
        matrix[v][u] = 1                      # undirected: store both directions
    return matrix


def build_adj_list(n, edges, directed=False):
    graph = [[] for _ in range(n)]            # O(V)
    for u, v in edges:                        # O(E), amortized O(1) per append
        graph[u].append(v)
        if not directed:
            graph[v].append(u)
    return graph                              # V lists + 2E entries -> O(V + E)
# #endregion solution


if __name__ == "__main__":
    edges = [(0, 1), (0, 2), (1, 3), (2, 3)]
    assert build_matrix(4, edges)[1][3] == 1
    assert build_matrix(4, edges)[0][3] == 0
    assert build_adj_list(4, edges) == [[1, 2], [0, 3], [0, 3], [1, 2]]
    assert build_adj_list(5, [(2, 4)], directed=True)[2] == [4]
    print("representations.py OK")
