# #region solution
# CodeChef "Frog Messages": connectivity on a number line.
# Sorted by position, frogs i and i+1 are in the same component iff gap <= K,
# because any relay must cross every gap between them.
import sys


def solve(data):
    it = iter(data.split())
    n, k, p = int(next(it)), int(next(it)), int(next(it))
    a = [int(next(it)) for _ in range(n)]

    frogs = sorted((a[i], i) for i in range(n))       # O(N log N)
    component = [0] * n
    group = 0
    for i in range(1, n):                             # O(N)
        if frogs[i][0] - frogs[i - 1][0] > k:
            group += 1
        component[frogs[i][1]] = group

    out = []
    for _ in range(p):                                # O(P), O(1) per query
        u, v = int(next(it)) - 1, int(next(it)) - 1
        out.append("Yes" if component[u] == component[v] else "No")
    return "\n".join(out)
# #endregion solution


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        assert solve("6 3 4\n10 1 7 4 15 18\n2 1\n3 4\n1 5\n5 6") == "Yes\nYes\nNo\nYes"
        assert solve("4 0 3\n5 9 5 12\n1 3\n1 2\n4 4") == "Yes\nNo\nYes"
        print("frog_messages.py OK")
    else:
        print(solve(sys.stdin.read()))
