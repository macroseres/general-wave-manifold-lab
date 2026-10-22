import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const document = readFileSync(new URL('../docs/mathematics/01-problema-de-riemann.md', import.meta.url),'utf8')
const reference = readFileSync(new URL('../src/components/DocumentationContent.jsx', import.meta.url),'utf8')

test('a primeira seção usa Markdown como fonte única', () => {
  assert.match(reference,/riemannMarkdown from '\.\.\/\.\.\/docs\/mathematics\/01-problema-de-riemann\.md\?raw'/)
  assert.match(reference,/\['1\. Problema de Riemann: formulação',<DocumentationMarkdown source=\{riemannMarkdown\}\/>\]/)
  assert.match(document,/## Definição — Problema de Riemann/)
  assert.match(document,/## Dedução da equação de similaridade/)
  assert.match(document,/### Lema — Equação nas regiões suaves/)
  assert.match(document,/### Corolário — Direções características/)
  assert.equal((document.match(/^\$\$$/gm)||[]).length, 6)
})

test('as 26 seções usam Markdown sem texto científico duplicado em JSX', () => {
  const sections=[...reference.matchAll(/\['(\d+)\. [^']+',<DocumentationMarkdown source=\{\w+\}\/>\]/g)]
  assert.deepEqual(sections.map(match=>Number(match[1])),Array.from({length:26},(_,i)=>i+1))
  assert.equal((reference.match(/\.md\?raw'/g)||[]).length,26)
  assert.doesNotMatch(reference,/<Statement|<Proof|<MathBlock|<MathLabel|<p>/)
})

test('pesquisa textual inclui a fonte Markdown', () => {
  const workspace = readFileSync(new URL('../src/components/DocumentationWorkspace.jsx', import.meta.url),'utf8')
  assert.match(workspace,/node\.props\.children, node\.props\.title, node\.props\.source/)
})

test('DOC-02: os enunciados e as demonstrações possuem apresentação semântica', () => {
  const renderer = readFileSync(new URL('../src/components/DocumentationMarkdown.jsx', import.meta.url),'utf8')
  const css = readFileSync(new URL('../src/styles/workspace-panel-content.css', import.meta.url),'utf8')
  assert.match(renderer,/groupDocumentationBlocks/)
  assert.match(renderer,/Definição\|Teorema\|Lema\|Proposição\|Corolário\|Observação/)
  assert.match(renderer,/documentationStatement documentationMarkdownStatement/)
  assert.match(renderer,/documentationProof documentationMarkdownProof/)
  assert.match(css,/documentationMarkdownStatement/)
  assert.match(css,/documentationMarkdownProof/)
})
