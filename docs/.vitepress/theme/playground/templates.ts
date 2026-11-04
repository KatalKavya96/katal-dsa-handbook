import type { Lang } from './types'

// Starter code only shows the fast-input pattern. It never contains a solution.
export const TEMPLATES: Record<Lang, string> = {
  python: `import sys
input = sys.stdin.readline


def main():
    n = int(input())
    arr = list(map(int, input().split()))
    print(sum(arr))


main()
`,
  java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        long sum = 0;
        for (int i = 0; i < n; i++) sum += Long.parseLong(st.nextToken());
        System.out.println(sum);
    }
}
`,
}

export const DEFAULT_STDIN = `5
1 2 3 4 5
`

export const LABELS: Record<Lang, string> = { python: 'Python 3', java: 'Java 17' }
