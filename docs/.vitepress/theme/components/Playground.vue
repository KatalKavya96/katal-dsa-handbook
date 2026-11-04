<script setup lang="ts">
// Code playground: write code, type your own input, press Run. No test cases and no judging,
// on purpose: it's for trying an idea on the spot while reading a problem.
//
//   <Playground />                              Python + Java tabs, generic starter
//   <Playground id="lc-1971" lang="java" />     own saved draft, opens on Java
//   <Playground stdin="6 5\n0 1\n0 2" />        pre-filled input (\n becomes a newline)
//
// Code and input are saved per `id` (default: the page path) in this browser only.

import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { DEFAULT_STDIN, LABELS, TEMPLATES } from '../playground/templates'
import type { Lang, RunResult } from '../playground/types'

const props = withDefaults(
  defineProps<{ id?: string; lang?: Lang; stdin?: string; height?: string; timeout?: number }>(),
  { lang: 'python', height: '320px', timeout: 10 },
)

const MAX_OUTPUT = 100_000
const route = useRoute()
const { isDark } = useData()
const key = computed(() => `playground:${props.id ?? route.path}`)

const lang = ref<Lang>(props.lang)
const stdin = ref(props.stdin?.replaceAll('\\n', '\n') ?? DEFAULT_STDIN)
const output = ref('')
const errOutput = ref(false)
const status = ref('')
const verdict = ref<'' | 'ok' | 'error'>('')
const running = ref(false)
const editorEl = ref<HTMLElement>()
const view = shallowRef<any>()
const codes: Record<Lang, string> = { python: TEMPLATES.python, java: TEMPLATES.java }
let cm: any = null
let themeSlot: any = null
let langSlot: any = null

// ---------- storage (best effort: private windows can throw) ----------
const load = (k: string) => {
  try { return localStorage.getItem(k) } catch { return null }
}
const save = (k: string, v: string) => {
  try { localStorage.setItem(k, v) } catch { /* ignore */ }
}

function currentCode() {
  return view.value ? view.value.state.doc.toString() : codes[lang.value]
}

function setDoc(text: string) {
  const v = view.value
  if (v) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } })
}

// ---------- editor ----------
onMounted(async () => {
  for (const l of ['python', 'java'] as Lang[]) codes[l] = load(`${key.value}:${l}`) ?? TEMPLATES[l]
  const saved = load(`${key.value}:stdin`)
  if (saved !== null) stdin.value = saved
  const savedLang = load(`${key.value}:lang`) as Lang | null
  if (savedLang === 'python' || savedLang === 'java') lang.value = savedLang

  const [{ EditorView, basicSetup }, { EditorState, Compartment }, { keymap }, { indentWithTab }, { indentUnit }, py, java, { oneDark }] =
    await Promise.all([
      import('codemirror'),
      import('@codemirror/state'),
      import('@codemirror/view'),
      import('@codemirror/commands'),
      import('@codemirror/language'),
      import('@codemirror/lang-python'),
      import('@codemirror/lang-java'),
      import('@codemirror/theme-one-dark'),
    ])
  cm = { python: py.python, java: java.java, oneDark, EditorView }
  themeSlot = new Compartment()
  langSlot = new Compartment()
  view.value = new EditorView({
    parent: editorEl.value!,
    state: EditorState.create({
      doc: codes[lang.value],
      extensions: [
        basicSetup,
        keymap.of([{ key: 'Mod-Enter', run: () => (run(), true) }, indentWithTab]),
        indentUnit.of('    '),
        EditorState.tabSize.of(4),
        langSlot.of(cm[lang.value]()),
        themeSlot.of(isDark.value ? oneDark : []),
        EditorView.updateListener.of((u: any) => {
          if (u.docChanged) save(`${key.value}:${lang.value}`, u.state.doc.toString())
        }),
      ],
    }),
  })
})

onBeforeUnmount(() => view.value?.destroy())

watch(isDark, (dark) => view.value?.dispatch({ effects: themeSlot.reconfigure(dark ? cm.oneDark : []) }))
watch(stdin, (v) => save(`${key.value}:stdin`, v))

function switchLang(l: Lang) {
  if (l === lang.value) return
  codes[lang.value] = currentCode()
  lang.value = l
  save(`${key.value}:lang`, l)
  view.value?.dispatch({ effects: langSlot.reconfigure(cm[l]()) })
  setDoc(codes[l])
}

function reset() {
  if (!confirm(`Replace your ${LABELS[lang.value]} code with the starter template?`)) return
  setDoc(TEMPLATES[lang.value])
}

// ---------- running ----------
let timer: ReturnType<typeof setTimeout> | undefined

function append(stream: 'stdout' | 'stderr', text: string) {
  if (stream === 'stderr') errOutput.value = true
  if (output.value.length >= MAX_OUTPUT) return
  output.value += text
  if (output.value.length >= MAX_OUTPUT) {
    output.value = output.value.slice(0, MAX_OUTPUT) + '\n… output cut at 100,000 characters'
    if (lang.value === 'python') import('../playground/python').then((m) => m.stopPython('output-limit'))
  }
}

const describe = (r: RunResult) =>
  ({
    ok: `Finished in ${r.ms ?? '?'} ms${r.compileMs ? ` (compile ${(r.compileMs / 1000).toFixed(1)} s)` : ''}`,
    error: 'Runtime error',
    'compile-error': 'Compilation error',
    timeout: `Stopped: ran longer than ${props.timeout} s (infinite loop?)`,
    stopped: 'Stopped',
    'output-limit': 'Stopped: too much output',
  })[r.status]

async function run() {
  if (running.value) return
  running.value = true
  output.value = ''
  errOutput.value = false
  verdict.value = ''
  const code = currentCode()
  const handlers = { onOutput: append, onStatus: (s: string) => (status.value = s) }
  try {
    let result: RunResult
    if (lang.value === 'python') {
      const { runPython, stopPython } = await import('../playground/python')
      timer = setTimeout(() => stopPython('timeout'), props.timeout * 1000 + 30_000)
      const started = runPython(code, stdin.value, {
        ...handlers,
        onStatus: (s) => {
          status.value = s
          // The time limit starts once Python is loaded, not while it downloads.
          if (s === 'Running…') {
            clearTimeout(timer)
            timer = setTimeout(() => stopPython('timeout'), props.timeout * 1000)
          }
        },
      })
      result = await started
    } else {
      const { runJava } = await import('../playground/java')
      result = await runJava(code, stdin.value, handlers)
    }
    verdict.value = result.status === 'ok' ? 'ok' : 'error'
    status.value = describe(result)
  } catch (e: any) {
    verdict.value = 'error'
    status.value = 'Could not start the runtime'
    append('stderr', String(e?.message ?? e) + '\n')
  } finally {
    clearTimeout(timer)
    running.value = false
  }
}

async function stop() {
  const { stopPython } = await import('../playground/python')
  stopPython('stopped')
}
</script>

<template>
  <div class="pg">
    <div class="pg-bar">
      <div class="pg-tabs" role="tablist">
        <button
          v-for="l in (['python', 'java'] as const)"
          :key="l"
          role="tab"
          :aria-selected="lang === l"
          :class="{ active: lang === l }"
          :disabled="running"
          @click="switchLang(l)"
        >{{ LABELS[l] }}</button>
      </div>
      <div class="pg-actions">
        <button class="pg-ghost" :disabled="running" title="Restore the starter template" @click="reset">Reset</button>
        <button v-if="running && lang === 'python'" class="pg-stop" @click="stop">Stop</button>
        <button class="pg-run" :disabled="running" title="Ctrl/⌘ + Enter" @click="run">{{ running ? 'Running…' : 'Run ▶' }}</button>
      </div>
    </div>

    <div ref="editorEl" class="pg-editor" :style="{ height }"></div>

    <div class="pg-io">
      <label class="pg-pane">
        <span class="pg-label">Input (stdin)</span>
        <textarea v-model="stdin" spellcheck="false" rows="6" placeholder="Type the input your program reads"></textarea>
      </label>
      <div class="pg-pane">
        <span class="pg-label">
          Output
          <span v-if="status" class="pg-status" :class="verdict">{{ status }}</span>
        </span>
        <pre class="pg-out" :class="{ err: errOutput && verdict !== 'ok' }">{{ output || (running ? '' : verdict ? '(no output)' : 'Run your code to see its output here.') }}</pre>
      </div>
    </div>
    <p class="pg-note">
      Runs in your browser, nothing is sent anywhere. No hidden tests: you choose the input, so think about edge cases yourself.
      <template v-if="lang === 'java'"> Java via <a href="https://cheerpj.com" target="_blank" rel="noreferrer">CheerpJ</a>; a Java run can't be stopped, reload the page if it hangs.</template>
    </p>
  </div>
</template>

<style scoped>
.pg {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}
.pg-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}
.pg-tabs, .pg-actions { display: flex; gap: 4px; }
.pg button {
  font-size: 13px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  color: var(--vp-c-text-2);
  transition: background 0.15s, color 0.15s;
}
.pg button:disabled { opacity: 0.6; cursor: not-allowed; }
.pg-tabs button.active { background: var(--vp-c-bg); color: var(--vp-c-text-1); border-color: var(--vp-c-divider); }
.pg-ghost:hover:not(:disabled) { color: var(--vp-c-text-1); }
.pg .pg-run { background: var(--vp-c-brand-3); color: var(--vp-c-white); }
.pg .pg-run:hover:not(:disabled) { background: var(--vp-c-brand-2); }
.pg .pg-stop { background: var(--vp-c-danger-soft); color: var(--vp-c-danger-1); }
.pg-editor { overflow: auto; background: var(--vp-c-bg); font-size: 14px; }
.pg-editor :deep(.cm-editor) { height: 100%; }
.pg-editor :deep(.cm-scroller) { font-family: var(--vp-font-family-mono); }
.pg-io {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--vp-c-divider);
}
@media (max-width: 640px) { .pg-io { grid-template-columns: 1fr; } }
.pg-pane { display: flex; flex-direction: column; min-width: 0; }
.pg-pane + .pg-pane { border-left: 1px solid var(--vp-c-divider); }
@media (max-width: 640px) { .pg-pane + .pg-pane { border-left: 0; border-top: 1px solid var(--vp-c-divider); } }
.pg-label {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-2);
  padding: 6px 10px 0;
}
.pg-status { text-transform: none; letter-spacing: 0; font-weight: 500; }
.pg-status.ok { color: var(--vp-c-green-1, var(--vp-c-brand-1)); }
.pg-status.error { color: var(--vp-c-danger-1); }
.pg textarea, .pg-out {
  flex: 1;
  margin: 0;
  padding: 8px 10px 10px;
  min-height: 140px;
  max-height: 320px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.5;
  background: transparent;
  color: var(--vp-c-text-1);
  white-space: pre;
  overflow: auto;
  border: 0;
  resize: vertical;
}
.pg textarea:focus { outline: 2px solid var(--vp-c-brand-soft); outline-offset: -2px; }
.pg-out.err { color: var(--vp-c-danger-1); }
.pg-note {
  margin: 0 !important;
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--vp-c-text-3);
  border-top: 1px solid var(--vp-c-divider);
}
</style>
