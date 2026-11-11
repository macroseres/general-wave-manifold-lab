import test from 'node:test'
import assert from 'node:assert/strict'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'

test('os capítulos HTML renderizam fórmulas KaTeX sem erros', async () => {
  const server = await createServer({server:{middlewareMode:true,watch:null},appType:'custom'})
  try {
    const {documentationSections}=await server.ssrLoadModule('/src/components/DocumentationContent.jsx')
    assert.equal(documentationSections.length,26)
    let formulas=0
    for(const [name,content] of documentationSections){
      const html=renderToStaticMarkup(content)
      assert.match(html,/<p>/,name)
      assert.doesNotMatch(html,/<h1>|<script\b|katex-error/,name)
      formulas+=(html.match(/role="math"/g)||[]).length
    }
    assert.ok(formulas>100)
  } finally {
    await server.close()
  }
})
