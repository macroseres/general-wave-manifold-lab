import test from 'node:test'
import assert from 'node:assert/strict'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'

test('Markdown matemático: interpretação, agrupamento e renderização dos capítulos migrados', async () => {
  const server = await createServer({server:{middlewareMode:true,watch:null},appType:'custom'})
  try {
    const {default:Markdown,parseDocumentationMarkdown:parse,groupDocumentationBlocks:group} = await server.ssrLoadModule('/src/components/DocumentationMarkdown.jsx')
    assert.throws(()=>parse('$$\nx+y'),/não encerrado/)
    assert.deepEqual(parse('## Título\r\n\r\nPrimeira linha\r\nsegunda linha'),[
      {type:'heading',level:2,text:'Título'},
      {type:'paragraph',text:'Primeira linha segunda linha'},
    ])
    const blocks = group(parse('## Lema — Exemplo\n\nEnunciado.\n\n**Demonstração.** Prova.\n\n## Próximo assunto\n\nTexto.'))
    assert.equal(blocks[0].type,'statement')
    assert.equal(blocks[0].children[1].type,'proof')
    assert.equal(blocks[1].type,'heading')
    const linked=renderToStaticMarkup(createElement(Markdown,{source:'[Fonte](https://example.org/paper)\n\n![Figura](/docs/hugoniot-reference.svg)'}))
    assert.match(linked,/href="https:\/\/example.org\/paper"/)
    assert.match(linked,/rel="noopener noreferrer"/)
    assert.match(linked,/<img[^>]+src="\/docs\/hugoniot-reference.svg"/)
    const rejected=renderToStaticMarkup(createElement(Markdown,{source:'[Fonte](javascript:alert)\n\n![Figura](/docs/../private.svg)'}))
    assert.doesNotMatch(rejected,/<a |<img/)

    const {documentationSections}=await server.ssrLoadModule('/src/components/DocumentationContent.jsx')
    assert.equal(documentationSections.length,26)
    for (const [name,content] of documentationSections) {
      const source=content.props.source
      assert.equal(typeof source,'string')
      for (const line of source.split('\n')) {
        if (line.includes('$$')) assert.equal(line.trim(),'$$',`${name}: delimitador de bloco fora de linha própria`)
      }
      const html=renderToStaticMarkup(createElement(Markdown,{source}))
      if (source.includes('$')) assert.match(html,/class="katex/)
      if (/^#{2,4} (?:Definição|Teorema|Lema|Proposição|Corolário|Observação|Convenç|Critério|Procedimento)/m.test(source)) assert.match(html,/documentationStatement/)
      assert.doesNotMatch(html,/katex-error/)
      assert.doesNotMatch(html,/<h1>/)
    }
    const html=renderToStaticMarkup(createElement(Markdown,{source:'# Título\n\n<script>alert(1)</script>'}))
    assert.doesNotMatch(html,/<script>/)
    assert.match(html,/&lt;script&gt;/)
  } finally {
    await server.close()
  }
})
