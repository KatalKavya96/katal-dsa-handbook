// Java runner: CheerpJ (a full OpenJDK compiled to WebAssembly) runs javac and then the
// program inside the browser. Nothing is sent to a server. CheerpJ is free for personal and
// educational use (https://cheerpj.com/licensing).
//
// How a run works:
//   1. The source and the stdin text are written to CheerpJ's in-memory /str/ filesystem.
//   2. com.sun.tools.javac.Main compiles the source plus a tiny PgRunner class into /files/.
//   3. PgRunner points System.in at the stdin file and calls the user's main().
// CheerpJ prints System.out and System.err into the element with id "console", which we
// clear before each step and read afterwards.

import type { RunHandlers, RunResult } from './types'

const LOADER = 'https://cjrtnc.leaningtech.com/5.0/loader.js'
export const JAVA_VERSION = 17

declare global {
  // Globals installed by the CheerpJ loader.
  function cheerpjInit(options?: object): Promise<void>
  function cheerpjRunMain(className: string, classPath: string, ...args: string[]): Promise<number>
  function cheerpjAddStringFile(path: string, data: string | Uint8Array): void
}

const RUNNER = `public class PgRunner {
  public static void main(String[] args) throws Throwable {
    System.setIn(new java.io.BufferedInputStream(new java.io.FileInputStream("/str/pg/stdin.txt")));
    java.lang.reflect.Method main;
    try {
      main = Class.forName(args[0]).getMethod("main", String[].class);
    } catch (NoSuchMethodException e) {
      System.err.println("No 'public static void main(String[] args)' in class " + args[0] + ".");
      System.exit(1);
      return;
    }
    try {
      main.invoke(null, (Object) new String[0]);
    } catch (java.lang.reflect.InvocationTargetException e) {
      System.out.flush();
      System.err.print("Exception in thread \\"main\\" ");
      e.getCause().printStackTrace();
      System.exit(1);
    }
    System.out.flush();
  }
}
`

let ready: Promise<void> | null = null
let busy = false
let consoleEl: HTMLElement

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Could not load ${src}. Are you offline?`))
    document.head.appendChild(s)
  })
}

function boot(onStatus: (s: string) => void): Promise<void> {
  if (ready) return ready
  onStatus(`Loading Java ${JAVA_VERSION} (first run downloads the JVM, then it is cached)…`)
  ready = (async () => {
    consoleEl = document.getElementById('console') ?? document.createElement('pre')
    consoleEl.id = 'console'
    consoleEl.hidden = true
    document.body.appendChild(consoleEl)
    await loadScript(LOADER)
    await cheerpjInit({ version: JAVA_VERSION, status: 'none' })
  })()
  ready.catch(() => (ready = null))
  return ready
}

/** The class that holds main(): the public class if there is one, else the class declared before main. */
export function mainClass(code: string): { file: string; cls: string } {
  const pkg = code.match(/^\s*package\s+([\w.]+)\s*;/m)?.[1]
  const pub = code.match(/public\s+(?:final\s+|abstract\s+)*class\s+(\w+)/)?.[1]
  let name = pub
  if (!name) {
    const at = code.search(/static\s+void\s+main\s*\(/)
    const before = at === -1 ? code : code.slice(0, at)
    const all = [...before.matchAll(/\bclass\s+(\w+)/g)]
    name = all.length ? all[all.length - 1][1] : 'Main'
  }
  return { file: `${pub ?? 'Main'}.java`, cls: pkg ? `${pkg}.${name}` : name }
}

const settle = () => new Promise((r) => setTimeout(r, 60))

async function step(fn: () => Promise<number>): Promise<{ rc: number; text: string }> {
  consoleEl.textContent = ''
  const rc = await fn()
  await settle()
  return { rc, text: consoleEl.textContent ?? '' }
}

export async function runJava(code: string, stdin: string, handlers: RunHandlers): Promise<RunResult> {
  if (busy) {
    handlers.onOutput('stderr', 'Another Java program is still running. Reload the page to stop it.\n')
    return { status: 'error' }
  }
  busy = true
  try {
    await boot(handlers.onStatus)
    const enc = new TextEncoder()
    const { file, cls } = mainClass(code)
    cheerpjAddStringFile(`/str/pg/${file}`, enc.encode(code))
    cheerpjAddStringFile('/str/pg/PgRunner.java', enc.encode(RUNNER))
    cheerpjAddStringFile('/str/pg/stdin.txt', enc.encode(stdin))

    handlers.onStatus('Compiling… (the first compile warms up javac and is slow)')
    const t0 = performance.now()
    const javac = await step(() =>
      cheerpjRunMain('com.sun.tools.javac.Main', '/files/', `/str/pg/${file}`, '/str/pg/PgRunner.java', '-d', '/files/pg/', '-encoding', 'UTF-8'),
    )
    if (javac.rc !== 0) {
      handlers.onOutput('stderr', javac.text.replaceAll('/str/pg/', '') || `javac exited with code ${javac.rc}\n`)
      return { status: 'compile-error' }
    }

    handlers.onStatus('Running…')
    const t1 = performance.now()
    const run = await step(() => cheerpjRunMain('PgRunner', '/files/pg/', cls))
    // CheerpJ merges System.out and System.err into one console, so they can't be told apart.
    handlers.onOutput('stdout', run.text)
    return { status: run.rc === 0 ? 'ok' : 'error', ms: Math.round(performance.now() - t1), compileMs: Math.round(t1 - t0) }
  } finally {
    busy = false
  }
}
