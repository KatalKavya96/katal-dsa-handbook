// Copies the Pyodide runtime into docs/public/runtime/ for the playground (dev and build).
import '../../scripts/playground-assets.mjs'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  title: 'Katal DSA Handbook',
  description: "Kavya's living notebook for DSA interviews and competitive programming",
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  markdown: { math: false, lineNumbers: false },
  themeConfig: {
    nav: [
      { text: 'Graphs', link: '/graphs/' },
      { text: 'Mistake log', link: '/learning/mistake-log' },
      { text: 'Progress', link: '/learning/progress' },
      { text: 'Playground', link: '/playground' },
    ],
    sidebar: [
      {
        text: 'Graphs',
        collapsed: false,
        items: [
          { text: 'Overview & roadmap', link: '/graphs/' },
          { text: '1. What is a graph', link: '/graphs/01-foundations' },
          { text: '2. Representations', link: '/graphs/02-representations' },
          { text: '3. BFS', link: '/graphs/03-bfs' },
          { text: '4. DFS', link: '/graphs/04-dfs' },
          { text: '5. Connected components', link: '/graphs/05-connected-components' },
          {
            text: 'Interview rounds',
            collapsed: false,
            items: [
              { text: 'BFS vs DFS (Rounds 1, 1.1)', link: '/graphs/interview/bfs-vs-dfs' },
              { text: 'Visited timing (Rounds 2 to 2.2)', link: '/graphs/interview/visited-timing' },
            ],
          },
          {
            text: 'Problems',
            collapsed: false,
            items: [
              { text: 'LC 1971 Find if Path Exists', link: '/graphs/problems/lc-1971' },
              { text: 'CodeChef Frog Messages', link: '/graphs/problems/frog-messages' },
              { text: 'Rooftop Rescue', link: '/graphs/problems/rooftop-rescue' },
              { text: 'LC 547 Number of Provinces', link: '/graphs/problems/lc-547' },
            ],
          },
        ],
      },
      {
        text: 'Learning log',
        items: [
          { text: 'Progress tracker', link: '/learning/progress' },
          { text: 'Mistake log', link: '/learning/mistake-log' },
          { text: 'Revision queue', link: '/learning/revision-queue' },
          { text: 'How this notebook works', link: '/learning/conventions' },
          { text: 'Code playground', link: '/playground' },
        ],
      },
    ],
    outline: { level: [2, 3], label: 'On this page' },
    search: { provider: 'local' },
    docFooter: { prev: 'Previous', next: 'Next' },
    lastUpdated: { text: 'Updated' },
  },
  mermaid: { theme: 'neutral' },
}))
