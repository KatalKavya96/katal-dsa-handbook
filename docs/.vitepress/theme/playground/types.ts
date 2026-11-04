export type Lang = 'python' | 'java'

export interface RunHandlers {
  onOutput: (stream: 'stdout' | 'stderr', text: string) => void
  onStatus: (status: string) => void
}

export interface RunResult {
  status: 'ok' | 'error' | 'compile-error' | 'timeout' | 'stopped' | 'output-limit'
  ms?: number
  compileMs?: number
}
