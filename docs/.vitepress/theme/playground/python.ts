// Main-thread side of the Python runner. One shared worker for the whole site; a run that
// hits the time limit, prints too much or is stopped kills the worker, and the next run
// starts a fresh one (Pyodide reloads from the browser cache in a second or two).

import { withBase } from 'vitepress'
import type { RunHandlers, RunResult } from './types'

let worker: Worker | null = null
let ready: Promise<void> | null = null
let nextId = 1
let active: { id: number; handlers: RunHandlers; resolve: (r: RunResult) => void } | null = null

function boot(onStatus: (s: string) => void): Promise<void> {
  if (ready) return ready
  onStatus('Loading Python (first run downloads ~13 MB, then it is cached)…')
  worker = new Worker(withBase('/runtime/python-worker.mjs'), { type: 'module' })
  ready = new Promise((resolve, reject) => {
    worker!.onmessage = ({ data }) => {
      if (data.type === 'ready') return resolve()
      if (data.type === 'fatal') return reject(new Error(data.message))
      if (!active || (data.id && data.id !== active.id)) return
      if (data.type === 'out') active.handlers.onOutput(data.stream, data.text)
      if (data.type === 'done') {
        const run = active
        active = null
        run.resolve({ status: data.rc === 0 ? 'ok' : 'error', ms: data.ms })
      }
    }
    worker!.onerror = (e) => reject(new Error(e.message || 'Python worker failed to start'))
  })
  ready.catch(() => kill())
  return ready
}

function kill() {
  worker?.terminate()
  worker = null
  ready = null
}

export async function runPython(code: string, stdin: string, handlers: RunHandlers): Promise<RunResult> {
  await boot(handlers.onStatus)
  handlers.onStatus('Running…')
  const id = nextId++
  return new Promise((resolve) => {
    active = { id, handlers, resolve }
    worker!.postMessage({ type: 'run', id, code, stdin })
  })
}

/** Kills the current run, if any. */
export function stopPython(reason: RunResult['status']) {
  if (!active) return
  const run = active
  active = null
  kill()
  run.resolve({ status: reason })
}
