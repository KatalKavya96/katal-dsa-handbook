import java.util.*;

public class Representations {
    // #region solution
    static int[][] buildMatrix(int n, int[][] edges) {
        int[][] matrix = new int[n][n];               // O(V^2), zero-initialised
        for (int[] e : edges) {
            matrix[e[0]][e[1]] = 1;
            matrix[e[1]][e[0]] = 1;                   // undirected
        }
        return matrix;
    }

    static List<List<Integer>> buildAdjList(int n, int[][] edges, boolean directed) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());   // O(V)
        for (int[] e : edges) {                       // O(E)
            graph.get(e[0]).add(e[1]);
            if (!directed) graph.get(e[1]).add(e[0]);
        }
        return graph;
    }
    // #endregion solution

    public static void main(String[] args) {
        int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}};
        check(buildMatrix(4, edges)[1][3] == 1 && buildMatrix(4, edges)[0][3] == 0);
        check(buildAdjList(4, edges, false).toString().equals("[[1, 2], [0, 3], [0, 3], [1, 2]]"));
        check(buildAdjList(5, new int[][]{{2, 4}}, true).get(2).equals(List.of(4)));
        System.out.println("Representations.java OK");
    }

    static void check(boolean ok) { if (!ok) throw new AssertionError(); }
}
