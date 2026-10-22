import {MathBlock,MathLabel} from './math/MathLabel.jsx'

// Renderer limitado ao subconjunto Markdown usado pela referência matemática.
// O conteúdo é interpretado como texto, nunca como HTML executável.
function inlineNodes(value) {
  const pieces = String(value).split(/(\$[^$\n]+\$|\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\(https?:\/\/[^()\s]+\))/g)
  return pieces.filter(Boolean).map((part, index) => {
    const link=/^\[([^\]]+)\]\((https?:\/\/[^()\s]+)\)$/.exec(part)
    if(link)return <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a>
    if (part.startsWith('$') && part.endsWith('$')) return <MathLabel key={index}>{part.slice(1, -1)}</MathLabel>
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>
    return part
  })
}

export function parseDocumentationMarkdown(source) {
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let paragraph = []
  const flush = () => {
    if (paragraph.length) {
      blocks.push({type:'paragraph',text:paragraph.join(' ')})
      paragraph = []
    }
  }
  for (let i=0; i<lines.length; i++) {
    const line = lines[i].trim()
    if (!line) { flush(); continue }
    const figure=/^!\[([^\]]+)\]\((\/docs\/[A-Za-z0-9_./-]+)\)$/.exec(line)
    if(figure&&!figure[2].split('/').includes('..')) {
      flush()
      blocks.push({type:'figure',text:figure[1],src:figure[2]})
      continue
    }
    if (line === '$$') {
      flush()
      const math = []
      while (++i < lines.length && lines[i].trim() !== '$$') math.push(lines[i])
      if (i === lines.length) throw new Error('Bloco matemático Markdown não encerrado')
      blocks.push({type:'math',text:math.join('\n')})
      continue
    }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line)
    if (heading) { flush(); blocks.push({type:'heading',level:heading[1].length,text:heading[2]}); continue }
    paragraph.push(line)
  }
  flush()
  return blocks
}

const statementKinds = new Set(['Definição','Teorema','Lema','Proposição','Corolário','Observação','Convenção','Convenções','Convenção editorial','Critério de auditoria','Procedimento'])

function headingStatement(text) {
  const match = /^(Definição|Teorema|Lema|Proposição|Corolário|Observação|Convenção|Convenções|Convenção editorial|Critério de auditoria|Procedimento)\s+—\s+(.+)$/.exec(text)
  return match && statementKinds.has(match[1]) ? {kind:match[1],title:match[2]} : null
}

// Semantic grouping is independent of the visual style and preserves the
// Markdown document as the only scientific text source.
export function groupDocumentationBlocks(blocks) {
  const result = []
  for (let i=0;i<blocks.length;i++) {
    const block = blocks[i]
    const statement = block.type === 'heading' && block.level >= 2 ? headingStatement(block.text) : null
    if (statement) {
      const children = []
      while (i+1 < blocks.length && !(blocks[i+1].type === 'heading' && blocks[i+1].level <= block.level)) children.push(blocks[++i])
      result.push({type:'statement',...statement,children:groupDocumentationBlocks(children)})
    } else if (block.type === 'paragraph' && block.text.startsWith('**Demonstração.**')) {
      result.push({...block,type:'proof'})
    } else result.push(block)
  }
  return result
}

function RenderBlock({block}) {
  if (block.type === 'figure') return <figure className="documentationFigure"><a href={block.src} target="_blank" rel="noopener noreferrer"><img src={block.src} alt={block.text} loading="lazy"/></a><figcaption>{block.text}</figcaption></figure>
  if (block.type === 'math') return <MathBlock>{block.text}</MathBlock>
  if (block.type === 'proof') return <div className="documentationProof documentationMarkdownProof"><p>{inlineNodes(block.text)}</p></div>
  if (block.type === 'statement') return <div className="documentationStatement documentationMarkdownStatement"><div className="documentationStatementHeading"><strong>{block.kind}</strong><span> — {block.title}</span></div><div>{block.children.map((child,index)=><RenderBlock key={index} block={child}/>)}</div></div>
  if (block.type === 'heading') {
    // The workspace already renders the document title.
    if (block.level === 1) return null
    if (block.level === 2) return <h4>{inlineNodes(block.text)}</h4>
    return <h5>{inlineNodes(block.text)}</h5>
  }
  return <p>{inlineNodes(block.text)}</p>
}

export default function DocumentationMarkdown({source}) {
  return <div className="documentationMarkdown">{groupDocumentationBlocks(parseDocumentationMarkdown(source)).map((block,index)=><RenderBlock key={index} block={block}/>)}</div>
}
