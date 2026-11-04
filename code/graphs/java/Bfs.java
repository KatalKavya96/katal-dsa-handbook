import java.util.*;

public class Bfs {
    // #region solution
    static List<Integer> bfsOrder(List<List<Integer>> graph, int start) {
        boolean[] visited = new boolean[graph.size()];
        Deque<Integer> queue = new ArrayDeque<>();
        queue.offer(start);
        visited[start] = true;                        // mark on ENQUEUE
        List<Integer> order = new ArrayList<>();

        while (!queue.isEmpty()) {
            int node = queue.poll();
            order.add(node);
            for (int neighbor : graph.get(node)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.offer(neighbor);
                }
            }
        }
        return order;
    }

    static int[] shortestDistances(List<List<Integer>> graph, int start) {
        int[] dist = new int[graph.size()];
        Arrays.fill(dist, -1);                        // -1 = undiscovered
        dist[start] = 0;
        Deque<Integer> queue = new ArrayDeque<>();
        queue.offer(start);

        while (!queue.isEmpty()) {
            int node = queue.poll();
            for (int neighbor : graph.get(node)) {
                if (dist[neighbor] == -1) {
                    dist[neighbor] = dist[node] + 1;
                    queue.offer(neighbor);
                }
            }
        }
        return dist;
    }

    static List<List<Integer>> lessonGraph() {
        return List.of(List.of(1, 2), List.of(0, 3, 4), List.of(0, 5, 6),
                       List.of(1), List.of(1), List.of(2), List.of(2));
    }
    // #endregion solution

    public static void main(String[] args) {
        check(bfsOrder(lessonGraph(), 0).equals(List.of(0, 1, 2, 3, 4, 5, 6)));
        check(Arrays.equals(shortestDistances(lessonGraph(), 0), new int[]{0, 1, 1, 2, 2, 2, 2}));
        System.out.println("Bfs.java OK");
    }

    static void check(boolean ok) { if (!ok) throw new AssertionError(); }
}
