// Copies the Pyodide runtime from node_modules into docs/public/runtime/pyodide/ so the
// playground serves Python from the site itself. docs/.vitepress/config.mts imports this file,
// so it runs on every `vitepress dev` / `vitepress build`, whatever command a host uses.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const src = path.dirname(require.resolve('pyodide/package.json'))
const dest = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'docs', 'public', 'runtime', 'pyodide')
const files = ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']

fs.mkdirSync(dest, { recursive: true })
for (const f of files) fs.copyFileSync(path.join(src, f), path.join(dest, f))
const { version } = JSON.parse(fs.readFileSync(path.join(src, 'package.json'), 'utf8'))
console.log(`playground: Pyodide ${version} copied to docs/public/runtime/pyodide/`)
