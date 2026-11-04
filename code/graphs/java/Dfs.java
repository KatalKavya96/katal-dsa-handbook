import java.util.*;

public class Dfs {
    // #region solution
    static void dfsRecursive(List<List<Integer>> graph, int node, boolean[] visited, List<Integer> order) {
        visited[node] = true;
        order.add(node);
        for (int neighbor : graph.get(node)) {
            if (!visited[neighbor]) dfsRecursive(graph, neighbor, visited, order);
        }
    }

    static List<Integer> dfsIterative(List<List<Integer>> graph, int start) {
        boolean[] visited = new boolean[graph.size()];
        Deque<Integer> stack = new ArrayDeque<>();    // use ArrayDeque, not the legacy Stack class
        stack.push(start);
        visited[start] = true;
        List<Integer> order = new ArrayList<>();

        while (!stack.isEmpty()) {
            int node = stack.pop();
            order.add(node);
            for (int neighbor : graph.get(node)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    stack.push(neighbor);
                }
            }
        }
        return order;
    }
    // #endregion solution

    public static void main(String[] args) {
        List<List<Integer>> graph = Bfs.lessonGraph();
        List<Integer> order = new ArrayList<>();
        dfsRecursive(graph, 0, new boolean[7], order);
        check(order.equals(List.of(0, 1, 3, 4, 2, 5, 6)));
        check(dfsIterative(graph, 0).equals(List.of(0, 2, 6, 5, 1, 4, 3)));
        System.out.println("Dfs.java OK");
    }

    static void check(boolean ok) { if (!ok) throw new AssertionError(); }
}
