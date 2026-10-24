import java.util.*;

public class VisitedTiming {
    // #region solution
    // Round 2.1 (buggy): mark on dequeue, check before append, no skip of re-popped nodes.
    static long[] bfsRound21(List<List<Integer>> graph, int start) {
        Set<Integer> visited = new HashSet<>();
        Deque<Integer> queue = new ArrayDeque<>();
        queue.offer(start);
        long pops = 0, scans = 0;
        while (!queue.isEmpty()) {
            int node = queue.poll();
            pops++;
            visited.add(node);
            for (int neighbor : graph.get(node)) {
                scans++;
                if (!visited.contains(neighbor)) queue.offer(neighbor);
            }
        }
        return new long[]{pops, scans};
    }

    static List<List<Integer>> ladder(int k) {
        int n = 2 * k + 1;
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        List<int[]> levels = new ArrayList<>();
        levels.add(new int[]{0});
        for (int i = 0; i < k; i++) levels.add(new int[]{2 * i + 1, 2 * i + 2});
        for (int l = 0; l + 1 < levels.size(); l++)
            for (int u : levels.get(l))
                for (int v : levels.get(l + 1)) { g.get(u).add(v); g.get(v).add(u); }
        return g;
    }
    // #endregion solution

    public static void main(String[] args) {
        for (int k : new int[]{5, 8, 11}) {
            long[] r = bfsRound21(ladder(k), 0);
            if (r[0] != (1L << (k + 1)) - 1) throw new AssertionError();
            System.out.printf("k=%d V=%d pops=%d scans=%d%n", k, 2 * k + 1, r[0], r[1]);
        }
        System.out.println("VisitedTiming.java OK");
    }
}
