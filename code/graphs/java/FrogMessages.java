import java.io.*;
import java.util.*;

public class FrogMessages {
    // #region solution
    static String solve(String input) {
        StringTokenizer st = new StringTokenizer(input);
        int n = Integer.parseInt(st.nextToken());
        long k = Long.parseLong(st.nextToken());
        int p = Integer.parseInt(st.nextToken());
        long[][] frogs = new long[n][2];              // {position, original index}
        for (int i = 0; i < n; i++) {
            frogs[i][0] = Long.parseLong(st.nextToken());
            frogs[i][1] = i;
        }
        Arrays.sort(frogs, (x, y) -> Long.compare(x[0], y[0]));   // O(N log N)

        int[] component = new int[n];
        int group = 0;
        for (int i = 1; i < n; i++) {
            if (frogs[i][0] - frogs[i - 1][0] > k) group++;
            component[(int) frogs[i][1]] = group;
        }

        StringBuilder out = new StringBuilder();      // one print at the end: fast I/O
        for (int q = 0; q < p; q++) {
            int u = Integer.parseInt(st.nextToken()) - 1;
            int v = Integer.parseInt(st.nextToken()) - 1;
            out.append(component[u] == component[v] ? "Yes" : "No").append('\n');
        }
        return out.toString().trim();
    }
    // #endregion solution

    public static void main(String[] args) throws IOException {
        if (args.length > 0 && args[0].equals("--test")) {
            check(solve("6 3 4\n10 1 7 4 15 18\n2 1\n3 4\n1 5\n5 6").equals("Yes\nYes\nNo\nYes"));
            check(solve("4 0 3\n5 9 5 12\n1 3\n1 2\n4 4").equals("Yes\nNo\nYes"));
            System.out.println("FrogMessages.java OK");
            return;
        }
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line).append(' ');
        System.out.println(solve(sb.toString()));
    }

    static void check(boolean ok) { if (!ok) throw new AssertionError(); }
}
