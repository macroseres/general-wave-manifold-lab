import library from 'virtual:documentation-library'
import {useMemo,useRef,useState} from 'react'
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
const coreDocuments=library.filter(({path})=>/^mathematics\/(?:0[1-9]|1\d|2[0-6])-/.test(path))
const corePaths=new Set(coreDocuments.map(doc=>doc.path))
const locationByIndex = new Map(groups.flatMap((group,chapter)=>group.indices.map((index,section)=>[index,{chapter,section,label:`${chapter+1}.${section+1}`}])) )
const glossary = [
 ['\\mathcal W','Variedade de Ondas',6],['\\mathcal C','Característica',13],['\\mathcal E','Coincidência',13],['\\Delta','Discriminante espectral',2],['N(z)','Denominador da carta finita',8],['\\mathcal S^-','Sônica no extremo esquerdo',14],['\\mathcal S^+','Sônica no extremo direito',14],['\\mathcal J','Inflexão',15],['\\mathcal{DS}','Dupla sônica',15],['\\mathcal R','Rarefação',16],['\\mathcal K_-','Composta negativa',18],['\\mathcal K_+','Composta positiva',18],['\\pi_-','Projeção negativa',9],['\\pi_+','Projeção positiva',9]
]
const libraryCategories={
 mathematics:'Atlas de fluxos e parâmetros · capítulos 27 a 29',
 traditional:'Construção tradicional',
 architecture:'Arquitetura e verificação',
}
const libraryGroups=Object.entries(libraryCategories).map(([key,title])=>({
 key,title,documents:library.filter(({path})=>!corePaths.has(path)&&(path.includes('/')?path.split('/')[0]===key:key==='general')),
})).filter(group=>group.documents.length)
const libraryHash=path=>'#biblioteca-'+encodeURIComponent(path)
function initialLibraryPath(){
 return libraryGroups.flatMap(group=>group.documents).find(({path})=>libraryHash(path)===window.location.hash)?.path??null
}

const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
// Extract textual JSX content without rendering a second copy of the reference.
function extractText(node){
 if(node==null||typeof node==='boolean')return ''
 if(typeof node==='string'||typeof node==='number')return String(node)
 if(Array.isArray(node))return node.map(extractText).join(' ')
 if(typeof node==='object'&&node.props)return [node.props.children, node.props.title, node.props.source?.split('<body>').at(-1).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')].map(extractText).join(' ')
 return ''
}

/** Navigation is separate from the mathematical reference shared with HelpDialog. */
export default function DocumentationWorkspace(){
 const [expanded,setExpanded]=useState(true)
 const [active,setActive]=useState('index')
 const [selectedSection,setSelectedSection]=useState(()=>{
  const match=/^#documentation-(\d+)$/.exec(window.location.hash)
  const index=Number(match?.[1])
  return locationByIndex.has(index)?index:0
 })
 const [libraryPath,setLibraryPath]=useState(initialLibraryPath)
 const libraryDocument=library.find(doc=>doc.path===libraryPath)
 const [query,setQuery]=useState('')
 const [glossaryQuery,setGlossaryQuery]=useState('')
 const [openGroups,setOpenGroups]=useState(()=>{
  const initialPath=initialLibraryPath()
  if(initialPath?.startsWith('mathematics/'))return [locationByIndex.get(coreDocuments.findIndex(doc=>doc.path===initialPath))?.chapter??7]
  const group=libraryGroups.find(item=>item.documents.some(doc=>doc.path===initialPath))
  return group?[group.key]:[locationByIndex.get(selectedSection).chapter]
 })
 const searchRef=useRef(null)
 const titles=useMemo(()=>documentationSections.map(([title])=>title.replace(/^(?:\d+[A-Z]?\.|Apêndice [A-Z]\.)\s*/,'')),[])
 const searchEntries=useMemo(()=>documentationSections.map(([title,content],index)=>({index,title,body:extractText(content)})),[])
 const matches=useMemo(()=>searchEntries.map(({title,body})=>normalize(title+' '+body).includes(normalize(query.trim()))),[searchEntries,query])

 const documentEntry=doc=>({
  ...doc,href:libraryHash(doc.path),
  number:doc.path.startsWith('mathematics/')?doc.path.split('/')[1].slice(0,2):null,
 })
 const atlasEntries=libraryGroups.find(group=>group.key==='mathematics')?.documents.map(documentEntry)??[]
 const indexGroups=[
  ...groups.map((group,key)=>({key,title:group.title,entries:[
   ...group.indices.map(index=>({index,title:titles[index],number:locationByIndex.get(index).label,href:`#documentation-${index}`})),
   ...(key===7?atlasEntries:[]),
  ]})),
  ...libraryGroups.filter(group=>group.key!=='mathematics').map(group=>({
   ...group,entries:group.documents.map(documentEntry),
  })),
 ]
 const visibleIndex=active==='search'?indexGroups.map(group=>({...group,entries:group.entries.filter(entry=>
  entry.path?normalize(entry.title+' '+entry.path).includes(normalize(query.trim())):matches[entry.index]
 )})).filter(group=>group.entries.length):indexGroups
 const resultCount=visibleIndex.reduce((sum,group)=>sum+group.entries.length,0)
 const currentHref=libraryPath?libraryHash(libraryPath):`#documentation-${selectedSection}`

 const openDocument=(event,path)=>{
  event.preventDefault()
  setLibraryPath(path)
  const group=indexGroups.find(item=>item.entries.some(entry=>entry.path===path))
  if(group)setOpenGroups(old=>old.includes(group.key)?old:[...old,group.key])
  window.history.replaceState(null,'',libraryHash(path))
 }
 const jumpTo=index=>{
  setLibraryPath(null)
  setSelectedSection(index)
  const chapterIndex=locationByIndex.get(index).chapter
  setOpenGroups(old=>old.includes(chapterIndex)?old:[...old,chapterIndex])
  setActive('index')
  window.history.replaceState(null,'',`#documentation-${index}`)
 }
 const readingPath=libraryDocument?.path??coreDocuments[selectedSection].path
 const readingTitle=libraryDocument?.title??titles[selectedSection]
 return <WorkspaceLayout kind="docs" expanded={expanded} className="documentationShell">
  <WorkspaceRail ariaLabel="Navegação da documentação" items={[{id:'index',label:'Índice'},{id:'search',label:'Buscar'},{id:'glossary',label:'Glossário'}]} active={active} expanded={expanded} onSelect={id=>{setActive(id);setExpanded(true);if(id==='search')window.requestAnimationFrame(()=>searchRef.current?.focus())}} onCollapse={()=>setExpanded(v=>!v)}/>
  <WorkspaceDrawer as="aside" className="documentationDrawer" aria-label="Índice da documentação">
   <WorkspacePanelHeader title={{index:'Índice',search:'Buscar',glossary:'Glossário'}[active]} onCollapse={()=>setExpanded(false)}/>
   {active==='search'&&<div className="documentationSearch"><input ref={searchRef} type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar no texto e nas equações..." aria-label="Buscar na documentação" />{query&&<button type="button" onClick={()=>setQuery('')} aria-label="Limpar busca">×</button>}</div>}
   {active==='glossary'?<WorkspacePanelBody as="nav" className="documentationIndex documentationGlossary" aria-label="Glossário matemático">
    <div className="documentationSearch"><input type="search" value={glossaryQuery} onChange={event=>setGlossaryQuery(event.target.value)} placeholder="Filtrar termos..." aria-label="Filtrar glossário" /></div>
    {glossary.filter(([symbol,label])=>normalize(symbol+' '+label).includes(normalize(glossaryQuery))).map(([symbol,label,index])=><button type="button" key={symbol} onClick={()=>jumpTo(index)}><span className="documentationGlossarySymbol"><MathLabel>{symbol}</MathLabel></span><span>{label}</span></button>)}
   </WorkspacePanelBody>:<WorkspacePanelBody as="nav" className="documentationIndex" aria-label="Seções da documentação">
    {visibleIndex.map(group=>{
     const isOpen=active==='search'||openGroups.includes(group.key)
     const current=group.entries.some(entry=>entry.href===currentHref)
     return <div className={`documentationIndexGroup${current?' documentationIndexGroup--current':''}`} key={group.key}>
      <div className="documentationGroupHeading">
       <button type="button" className="documentationGroupTitle" aria-expanded={isOpen} disabled={active==='search'}
        onClick={()=>setOpenGroups(old=>isOpen?old.filter(key=>key!==group.key):[...old,group.key])}>
        <span className="documentationIndexChevron" aria-hidden="true">{isOpen?'▾':'▸'}</span>{group.title}
       </button>
       <small>{group.entries.length}</small>
      </div>
      {isOpen&&group.entries.map(entry=><a key={entry.href} href={entry.href}
       className={entry.number?'':'documentationIndexUnnumbered'} aria-current={entry.href===currentHref?'location':undefined}
       onClick={event=>{if(entry.path)openDocument(event,entry.path);else{event.preventDefault();jumpTo(entry.index)}}}>
       {entry.number&&<span className="documentationIndexNumber">{entry.number}</span>}<span>{entry.title}</span>
      </a>)}
     </div>
    })}
    {active==='search'&&query.trim()&&<p className="documentationSearchCount">{resultCount} resultado(s)</p>}
    {active==='search'&&!resultCount&&<p className="documentationNoResults">Nenhum assunto encontrado.</p>}
   </WorkspacePanelBody>}
  </WorkspaceDrawer>
  <div className="documentationWorkspace workspaceCanvas" id="documentation-top">
   <section className="documentationLibraryReader" aria-label="Painel de leitura">
    <iframe key={readingPath} title={readingTitle} sandbox="allow-scripts"
     src={import.meta.env.BASE_URL+'biblioteca/'+encodeURI(readingPath)}/>
   </section>
  </div>
 </WorkspaceLayout>
}
