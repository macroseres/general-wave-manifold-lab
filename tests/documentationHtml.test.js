import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const reference = readFileSync(new URL('../src/components/DocumentationContent.jsx', import.meta.url),'utf8')
const chapter = readFileSync(new URL('../docs/mathematics/01-problema-de-riemann.html', import.meta.url),'utf8')

test('a aba usa os 26 capítulos HTML como fontes únicas', () => {
  const sections=[...reference.matchAll(/\['(\d+)\. [^']+',<DocumentationHtml source=\{\w+\}\/>\]/g)]
  assert.deepEqual(sections.map(match=>Number(match[1])),Array.from({length:26},(_,i)=>i+1))
  assert.equal((reference.match(/\.html\?raw'/g)||[]).length,26)
  assert.doesNotMatch(reference,/\.md\?raw/)
})

test('o primeiro capítulo preserva enunciados, dedução e fórmulas', () => {
  assert.match(chapter,/Problema de Riemann/)
  assert.match(chapter,/Dedução da equação de similaridade/)
  assert.match(chapter,/Equação nas regiões suaves/)
  assert.match(chapter,/Direções características/)
  assert.equal((chapter.match(/class="mathBlock"/g)||[]).length,3)
  assert.match(chapter,/documentationMarkdownStatement/)
  assert.match(chapter,/documentationMarkdownProof/)
})
