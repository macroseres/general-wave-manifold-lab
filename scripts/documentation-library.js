import katex from 'katex'
import {readFileSync,readdirSync} from 'node:fs'
import {resolve,relative,sep} from 'node:path'

const mathSymbols=new Map([
  ['U_L','U_L'],['U_M','U_M'],['U_R','U_R'],['U_-','U_-'],['U_+','U_+'],
  ['Ubar',String.raw`\bar U`],['z_c','z_c'],['Y=0','Y=0'],['Z=1/z','Z=1/z'],
  ['ξ=x/t',String.raw`\xi=x/t`],['P ∈ W',String.raw`P\in\mathcal W`],
  ['U_- = pi_-(P)',String.raw`U_-=\pi_-(P)`],
  ['U_+ = pi_+(P)',String.raw`U_+=\pi_+(P)`],
])

const phaseMath=new Map([
  ['Z=0','Z=0'],['z != 0','z\\ne 0'],
  ['tau','\\tau'],['zc','z_c'],['(tau,Y)','(\\tau,Y)'],
  ['(tau,Y,zc)','(\\tau,Y,z_c)'],['Y(tau,zc)','Y(\\tau,z_c)'],
  ['zc=±1','z_c=\\pm1'],['U_±','U_\\pm'],
  ['det=0','\\det=0'],['det&gt;0','\\det>0'],['det &gt;= 0','\\det\\ge 0'],
  ['d^±=0','d^\\pm=0'],['Δ^±=0','\\Delta^\\pm=0'],
  ['X=Y/Z','X=Y/Z'],['eta=tau/Z²','\\eta=\\tau/Z^2'],
  ['trace(DF(U±)-sI)=0','\\operatorname{tr}(DF(U_\\pm)-sI)=0'],
])

function renderMath(tex,original,displayMode=false){
  const entities={'&lt;':'<','&gt;':'>','&amp;':'&','&quot;':'"','&#39;':"'"}
  try {
    const formula=katex.renderToString(tex.replace(/&(?:lt|gt|amp|quot|#39);/g,entity=>entities[entity]),{displayMode,strict:'ignore'})
    return displayMode?`<div class="libraryEquation" tabindex="0">${formula}</div>`:formula
  } catch {
    return original
  }
}

function formatLibraryMath(html,isPhase){
  return html.replace(/<body>([\s\S]*?)<\/body>/i,(_,body)=>{
    const content=body.replace(
      /<pre\b[^>]*>[\s\S]*?<\/pre>|<code>([^<]*)<\/code>|<p>\s*\\\[([\s\S]*?)\\\]\s*<\/p>|\\\(([^<]*?)\\\)|<[^>]+>|(?<![\w])(?:U_[LMR]|z_c|Y=0|Z=1\/z|ξ=x\/t)(?![\w])/g,
      (original,code,block,inline)=>{
        if(block!==undefined)return renderMath(block,original,true)
        if(inline!==undefined)return renderMath(inline,original)
        if(code!==undefined){
          const tex=mathSymbols.get(code)??(isPhase?phaseMath.get(code):undefined)??(/\\(?:mathcal|mathbb|bar|frac|lambda|Delta|tau|pi|subset)\b/.test(code)?code:null)
          return tex?renderMath(tex,original):original
        }
        const tex=mathSymbols.get(original)
        return tex?renderMath(tex,original):original
      })
    return '<body>'+content+'</body>'
  })
}

export default function documentationLibrary(){
  const moduleId='virtual:documentation-library'
  const prefix='biblioteca/'
  const docsRoot=resolve('docs')
  const files=new Map(readdirSync(docsRoot,{recursive:true,withFileTypes:true})
    .filter(entry=>entry.isFile())
    .map(entry=>{
      const file=resolve(entry.parentPath??entry.path,entry.name)
      return [relative(docsRoot,file).split(sep).join('/'),file]
    }))
  files.set('CONTRIBUTING.html',resolve('CONTRIBUTING.html'))
  files.set('leitura.css',resolve('src/styles/documentation-library.css'))
  const katexRoot=resolve('node_modules/katex/dist')
  files.set('katex.min.css',resolve(katexRoot,'katex.min.css'))
  let base='/'

  function readAsset(path,file){
    const source=readFileSync(file)
    if(path==='katex.min.css'){
      return source.toString('utf8').replace(/url\(fonts\/([^)]*\.woff2)\)[^;}]*/g,(_,font)=>
        'url(data:font/woff2;base64,'+readFileSync(resolve(katexRoot,'fonts',font)).toString('base64')+') format("woff2")')
    }
    if(!path.endsWith('.html'))return source
    const sourceHtml=source.toString('utf8')
    const core=/^mathematics\/(?:0[1-9]|1\d|2[0-6])-/.test(path)
    const title=/<title>([^<]*)<\/title>/.exec(sourceHtml)?.[1]
    const html=core&&title?sourceHtml.replace('<body>','<body><h1>'+title+'</h1>'):formatLibraryMath(sourceHtml,path.startsWith('fases/'))
    const assets=path.split('/').slice(1).map(()=> '../').join('')
    return html.replace('</head>',`<link rel="stylesheet" href="${assets}katex.min.css">
<link rel="stylesheet" href="${assets}leitura.css">
</head>`)
  }

  return {
    name:'documentation-library',
    configResolved(config){base=config.base},
    resolveId(id){if(id===moduleId)return '\0'+id},
    load(id){
      if(id!=='\0'+moduleId)return
      const catalog=[...files].filter(([path])=>path.endsWith('.html'))
        .map(([path,file])=>{
          const html=readFileSync(file,'utf8')
          const heading=/<h1\b[^>]*>(.*?)<\/h1>/s.exec(html)?.[1]
          const title=(heading??path.split('/').at(-1).replace(/\.html$/,'').replace(/[-_]+/g,' '))
            .replace(/<[^>]*>/g,'').replace(/&amp;/g,'&')
          return {path,title}
        })
        .sort((a,b)=>a.path.localeCompare(b.path,'pt-BR',{numeric:true}))
      return 'export default '+JSON.stringify(catalog)
    },
    configureServer(server){
      server.middlewares.use((req,res,next)=>{
        const route=(req.url??'').split('?')[0]
        if(!route.startsWith(base+prefix))return next()
        let path
        try{path=decodeURIComponent(route.slice((base+prefix).length))}
        catch{res.statusCode=400;return res.end()}
        const file=files.get(path)
        if(!file){res.statusCode=404;return res.end()}
        const type={html:'text/html; charset=utf-8',svg:'image/svg+xml',png:'image/png',pdf:'application/pdf',css:'text/css; charset=utf-8',woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf'}[path.split('.').at(-1)]
        if(type)res.setHeader('Content-Type',type)
        res.end(readAsset(path,file))
      })
    },
    generateBundle(){
      for(const [path,file] of files){
        this.emitFile({type:'asset',fileName:prefix+path,source:readAsset(path,file)})
      }
    },
  }
}
