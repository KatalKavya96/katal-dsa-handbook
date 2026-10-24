import java.util.*;

public class Lc1971 {
    // #region solution
    static List<List<Integer>> build(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }
        return adj;
    }

    // BFS: mark on enqueue, stop when destination is popped.
    public boolean validPathBFS(int n, int[][] edges, int source, int destination) {
        List<List<Integer>> adj = build(n, edges);
        boolean[] visited = new boolean[n];
        Deque<Integer> queue = new ArrayDeque<>();
        visited[source] = true;
        queue.offer(source);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            if (node == destination) return true;
            for (int neighbor : adj.get(node)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.offer(neighbor);
                }
            }
        }
        return false;
    }

    // Recursive DFS with return propagation. Java's default thread stack also overflows
    // on deep chains (tested: fine at 10^4 nodes, StackOverflowError at 5 * 10^4),
    // so for n = 2 * 10^5 prefer the BFS / iterative version.
    public boolean validPathDFS(int n, int[][] edges, int source, int destination) {
        List<List<Integer>> adj = build(n, edges);
        return dfs(adj, source, destination, new boolean[n]);
    }

    private boolean dfs(List<List<Integer>> adj, int node, int destination, boolean[] visited) {
        if (node == destination) return true;
        visited[node] = true;
        for (int neighbor : adj.get(node)) {
            if (!visited[neighbor] && dfs(adj, neighbor, destination, visited)) return true;
        }
        return false;
    }
    // #endregion solution

    public static void main(String[] args) {
        Object[][] cases = {
            {3, new int[][]{{0, 1}, {1, 2}, {2, 0}}, 0, 2, true},
            {6, new int[][]{{0, 1}, {0, 2}, {3, 5}, {5, 4}, {4, 3}}, 0, 5, false},
            {1, new int[][]{}, 0, 0, true},
            {2, new int[][]{}, 0, 1, false},
        };
        for (Object[] c : cases) {
            int n = (int) c[0], s = (int) c[2], d = (int) c[3];
            int[][] e = (int[][]) c[1];
            boolean want = (boolean) c[4];
            check(new Lc1971().validPathBFS(n, e, s, d) == want);
            check(new Lc1971().validPathDFS(n, e, s, d) == want);
        }
        System.out.println("Lc1971.java OK");
    }

    static void check(boolean ok) { if (!ok) throw new AssertionError(); }
}
