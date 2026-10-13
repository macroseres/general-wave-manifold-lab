import {useEffect,useMemo,useRef,useState} from 'react'
import WorkspaceLayout from './WorkspaceLayout.jsx'
import WorkspaceDrawer from './WorkspaceDrawer.jsx'
import WorkspaceRail from './WorkspaceRail.jsx'
import WorkspacePanelHeader from './WorkspacePanelHeader.jsx'
import WorkspacePanelBody from './WorkspacePanelBody.jsx'
import {documentationSections} from './DocumentationContent.jsx'
import {MathLabel} from './math/MathLabel.jsx'

// Each mathematical subject has one primary reading location.
// Detailed derivations are incorporated into their primary sections.
const groups = [
  {title:'I. O problema de Riemann', description:'Formulação, fluxo quadrático geral, soluções fracas e similaridade.', indices:[0,1]},
  {title:'II. Soluções contínuas e rarefações', description:'Espectro, direções características e leques de rarefação.', indices:[2,3]},
  {title:'III. Soluções fracas e choques', description:'Rankine–Hugoniot, Hugoniot, Lax e entropia.', indices:[4,5]},
  {title:'IV. Variedade de Ondas', description:'Construção de W, cartas, projeções e fibras de Hugoniot.', indices:[6,7,8,9,10,11,12]},
  {title:'V. Geometria característica e sônica', description:'Coincidência, sônicas, inflexão e dupla sônica.', indices:[13,14,15]},
  {title:'VI. Campos e construções geométricas', description:'Rarefação, separatrizes e duas construções de ondas compostas.', indices:[16,17,18]},
  {title:'VII. Soluções do problema de Riemann', description:'Cadeias orientadas, velocidades e admissibilidade.', indices:[19]},
  {title:'VIII. Transformações e parâmetros', description:'Invariância afim e classificação espectral.', indices:[20,21]},
  {title:'IX. Métodos e uso do laboratório', description:'Limites numéricos, auditoria e ambientes.', indices:[22,23,24,25]},
]
// All surviving section indices are canonical. Do not redirect them to unrelated topics.
const resolveSection = index => index
const orderedIndices = groups.flatMap(group=>group.indices)
const availableIndices = new Set(orderedIndices)
const locationByIndex = new Map(groups.flatMap((group,chapter)=>group.indices.map((index,section)=>[index,{chapter,section,label:`${chapter+1}.${section+1}`}])) )
const glossary = [
 ['\\mathcal W','Variedade de Ondas',6],['\\mathcal C','Característica',13],['\\mathcal E','Coincidência',13],['D','Discriminante espectral',2],['N(z)','Denominador da carta finita',8],['\\mathcal S^-','Sônica negativa',14],['\\mathcal S^+','Sônica positiva',14],['\\mathcal J','Inflexão',15],['\\mathcal{DS}','Dupla sônica',15],['\\mathcal R','Rarefação',16],['\\mathcal K_-','Composta negativa',18],['\\mathcal K_+','Composta positiva',18],['\\pi_-','Projeção negativa',9],['\\pi_+','Projeção positiva',9]
]
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
// Extract textual JSX content without rendering a second copy of the reference.
function extractText(node){
 if(node==null||typeof node==='boolean')return ''
 if(typeof node==='string'||typeof node==='number')return String(node)
 if(Array.isArray(node))return node.map(extractText).join(' ')
 if(typeof node==='object'&&node.props)return [node.props.children, node.props.title].map(extractText).join(' ')
 return ''
}

/** Navigation is separate from the mathematical reference shared with HelpDialog. */
export default function DocumentationWorkspace(){
 const [expanded,setExpanded]=useState(true)
 const [active,setActive]=useState('index')
 const [selectedSection,setSelectedSection]=useState(0)
 const [query,setQuery]=useState('')
 const [glossaryQuery,setGlossaryQuery]=useState('')
 const [openGroups,setOpenGroups]=useState(()=>groups.map((_,index)=>index))
 const scrollRef=useRef(null)
 const searchRef=useRef(null)
 const manualNavigation=useRef(false)
 const titles=useMemo(()=>documentationSections.map(([title])=>title.replace(/^(?:\d+[A-Z]?\.|Apêndice [A-Z]\.)\s*/,'')),[])
 const searchEntries=useMemo(()=>documentationSections.map(([title,content],index)=>({index,title,body:extractText(content)})),[])
 const matches=useMemo(()=>searchEntries.map(({title,body})=>normalize(title+' '+body).includes(normalize(query.trim()))),[searchEntries,query])

 const jumpToChapter=chapter=>{
  const index=groups[chapter]?.indices[0]
  if(index===undefined)return
  manualNavigation.current=true
  setSelectedSection(index)
  setActive('index')
  scrollRef.current?.querySelector(`[id="documentation-chapter-${chapter}"]`)?.scrollIntoView({behavior:'smooth',block:'start'})
  window.history.replaceState(null,'',`#documentation-${index}`)
  window.setTimeout(()=>{manualNavigation.current=false},650)
 }
 const jumpTo=rawIndex=>{
  const index=resolveSection(rawIndex)
  manualNavigation.current=true
  setSelectedSection(index)
  setActive('index')
  const section=scrollRef.current?.querySelector(`[id="documentation-${index}"]`)
  section?.scrollIntoView({behavior:'smooth',block:'start'})
  window.history.replaceState(null,'',`#documentation-${index}`)
  window.setTimeout(()=>{manualNavigation.current=false},650)
 }
 useEffect(()=>{
  const hash=window.location.hash.match(/^#documentation-(\d+)$/)
  if(!hash)return
  const index=resolveSection(Number(hash[1]))
  if(!availableIndices.has(index))return
  setSelectedSection(index)
  const group=groups.findIndex(item=>item.indices.includes(index))
  if(group>=0)setOpenGroups(old=>old.includes(group)?old:[...old,group])
  window.requestAnimationFrame(()=>scrollRef.current?.querySelector(`[id="documentation-${index}"]`)?.scrollIntoView({block:'start'}))
 },[])
 useEffect(()=>{
  const root=scrollRef.current
  if(!root||typeof IntersectionObserver==='undefined')return
  const observer=new IntersectionObserver(entries=>{
   if(manualNavigation.current)return
   const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)
   if(visible.length)setSelectedSection(Number(visible[0].target.dataset.docIndex))
  },{root,rootMargin:'-8% 0px -65% 0px',threshold:0})
  root.querySelectorAll('[data-doc-index]').forEach(section=>observer.observe(section))
  return ()=>observer.disconnect()
 },[])
 return <WorkspaceLayout kind="docs" expanded={expanded} className="documentationShell">
  <WorkspaceRail ariaLabel="Navegação da documentação" items={[{id:'index',label:'Índice'},{id:'search',label:'Buscar'},{id:'glossary',label:'Glossário'}]} active={active} expanded={expanded} onSelect={id=>{setActive(id);setExpanded(true);if(id==='search')window.requestAnimationFrame(()=>searchRef.current?.focus())}} onCollapse={()=>setExpanded(v=>!v)}/>
  <WorkspaceDrawer as="aside" className="documentationDrawer" aria-label="Índice da documentação">
   <WorkspacePanelHeader title={{index:'Índice',search:'Buscar',glossary:'Glossário'}[active]} onCollapse={()=>setExpanded(false)}/>
   {active==='search'&&<div className="documentationSearch"><input ref={searchRef} type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar no texto e nas equações..." aria-label="Buscar na documentação" />{query&&<button type="button" onClick={()=>setQuery('')} aria-label="Limpar busca">×</button>}</div>}
   {active==='glossary'?<WorkspacePanelBody as="nav" className="documentationIndex documentationGlossary" aria-label="Glossário matemático">
    <div className="documentationSearch"><input type="search" value={glossaryQuery} onChange={event=>setGlossaryQuery(event.target.value)} placeholder="Filtrar termos..." aria-label="Filtrar glossário" /></div>
    {glossary.filter(([symbol,label])=>normalize(symbol+' '+label).includes(normalize(glossaryQuery))).map(([symbol,label,index])=><button type="button" key={symbol} onClick={()=>jumpTo(index)}><span className="documentationGlossarySymbol"><MathLabel>{symbol}</MathLabel></span><span>{label}</span></button>)}
   </WorkspacePanelBody>:<WorkspacePanelBody as="nav" className="documentationIndex" aria-label="Seções da documentação">
    {groups.map((group,groupIndex)=>{
     const filtered=group.indices.filter(index=>active!=='search'||matches[index])
     if(!filtered.length)return null
     const isOpen=active==='search'||openGroups.includes(groupIndex)
     return <div className={`documentationIndexGroup${group.indices.includes(selectedSection)?' documentationIndexGroup--current':''}`} key={group.title}>
      <div className="documentationGroupHeading">
       <button type="button" className="documentationGroupExpand" aria-label={`${isOpen?'Recolher':'Expandir'} seções de ${group.title}`} aria-expanded={Boolean(isOpen)} onClick={()=>setOpenGroups(old=>old.includes(groupIndex)?old.filter(value=>value!==groupIndex):[...old,groupIndex])} disabled={active==='search'}>
        <span aria-hidden="true">{isOpen?'▾':'▸'}</span>
       </button>
       <button type="button" className="documentationGroupTitle" aria-current={group.indices.includes(selectedSection)?'location':undefined} onClick={()=>jumpToChapter(groupIndex)}>{group.title}</button>
       <small>{filtered.length}</small>
      </div>
      {isOpen&&filtered.map(index=><a key={index} href={`#documentation-${index}`} aria-current={selectedSection===index?'location':undefined} onClick={event=>{event.preventDefault();jumpTo(index)}}>{locationByIndex.get(index).label} · {titles[index]}</a>)}
     </div>
    })}
    {active==='search'&&query.trim()&&<p className="documentationSearchCount">{orderedIndices.filter(index=>matches[index]).length} de {orderedIndices.length} seções encontradas</p>}
    {active==='search'&&!matches.some(Boolean)&&<p className="documentationNoResults">Nenhum assunto encontrado.</p>}
   </WorkspacePanelBody>}
  </WorkspaceDrawer>
  <div className="documentationWorkspace workspaceCanvas" id="documentation-top" ref={scrollRef}>
   <div className="documentationReadingLayout">
   <article className="documentationArticle">{groups.map((group,chapter)=><div className="documentationChapter" id={`documentation-chapter-${chapter}`} key={group.title}>
    <header className="documentationChapterHeader"><span>Capítulo {chapter+1} de {groups.length}</span><h2>{group.title.replace(/^[IVX]+\.\s*/, '')}</h2><p>{group.description}</p></header>
    {group.indices.map(index=>{const [title,content]=documentationSections[index];return <section id={`documentation-${index}`} data-doc-index={index} key={index}><div className="documentationSectionMeta"><span>Seção {locationByIndex.get(index).label}</span><button type="button" onClick={()=>{navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}#documentation-${index}`)}} aria-label={`Copiar link da seção ${title}`}>Copiar link</button></div><h3>{locationByIndex.get(index).label} · {titles[index]}</h3><div className="documentationSectionContent">{content}</div></section>})}
   </div>)}<p className="documentationCaution">Esta referência descreve construções geométricas e diagnósticos numéricos. Candidatos de Riemann não são automaticamente soluções entrópicas certificadas.</p><nav className="documentationPager" aria-label="Navegação ao final da documentação"><button type="button" onClick={()=>scrollRef.current?.scrollTo({top:0,behavior:'smooth'})}>↑ Voltar ao início</button><button type="button" onClick={()=>{setActive('index');setExpanded(true)}}>Abrir índice →</button></nav></article>
   </div>
  </div>
 </WorkspaceLayout>
}
