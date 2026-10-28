import {pathToFileURL} from 'node:url'
import {writeFile} from 'node:fs/promises'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
import {traceStateRarefaction} from '../src/math/rarefaction/stateIntegralCurves.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'
import {traceSeededForwardHugoniot} from '../src/math/solution/seededForwardHugoniot.js'
import {stateConstructionSearch} from '../src/math/solution/stateConstructionSearch.js'

const zero={a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0}
export const reportedEmptyCase={p:{...zero,a20:3.3977518519014067,a02:.5,b20:-.09349436579634296,b11:1,b02:-.1,b10:1},
  states:{left:[.4895020103438119,-.31089946517864675],right:[.7062767944010204,.7984334701516398]}}
export const comparisonAuditCase={p:oldWavePreset({B2:0}),
  states:{left:[.27324218675494194,-.6048198388889432],right:[-.7980547267943621,-1.0998454941436648]}}

export function stateAuditFixtures(){
  const p=oldWavePreset({B2:0}),trace=(U,family,sign)=>traceStateRarefaction(U,p,family,sign,{step:.01,maxLength:.15}).points.at(-1)
  const left=trace([1,-1],'slow',-1),right=trace([1,1],'fast',1)
  const fastRight=trace([(1-Math.sqrt(71))/7,0],'fast',1)
  const burgers={...zero,a20:.5,b02:.5,b01:5},fastContact={...zero,a20:.5,b01:3},slowContact={...zero,a10:1,b02:.5,b01:3}
  const fixture=(pattern,p,left,right)=>({pattern,p,states:{left,right}})
  return [fixture('RR',burgers,[0,0],[2,2]),fixture('RS',burgers,[0,2],[2,0]),
    fixture('SR',burgers,[2,0],[0,2]),fixture('SS',burgers,[2,2],[0,0]),
    fixture('RC',fastContact,[1,0],[2,1]),fixture('SC',fastContact,[2,0],[1,1]),
    fixture('CR',slowContact,[0,0],[1,1]),fixture('CS',slowContact,[0,1],[1,0]),
    fixture('CC',{...zero,a10:1,b01:2},[0,0],[1,1]),
    fixture('RK',p,trace([-1,-1],'slow',-1),fastRight),fixture('SK',p,[-.8,-1],fastRight),
    fixture('KR',p,left,right),fixture('KS',p,left,[105/113,111/113])]
}

export function auditEmptyCase(progress=()=>{}){
  const {p,states}=reportedEmptyCase
  return [
    {name:'default',step:.025,maxRadius:2,maxSteps:240,rare:{}},
    {name:'half-step',step:.0125,maxRadius:2,maxSteps:480,rare:{step:.02,maxSteps:640,maxLength:12}},
    {name:'extended',step:.0125,maxRadius:4,maxSteps:960,rare:{step:.02,maxSteps:800,maxLength:16}},
  ].map(({name,rare,...limits})=>{
    progress(`Empty case: ${name}`)
    const branches=riemannMonotoneRarefactions(states,p,rare),curves={left:[],right:[]},stops=[]
    for(const side of ['left','right']){
      const family=side==='left'?'slow':'fast'
      const traced=traceSeededForwardHugoniot(states[side],states[side==='left'?'right':'left'],p,
        {family,includeAttempts:true,stopAtTarget:false,...limits})
      for(const attempt of traced.attempts??[]){
        stops.push({side,sign:attempt.sign,reason:attempt.reason,points:attempt.arc.length})
        if(attempt.arc.length>2)curves[side].push({family,points:attempt.arc.map(([u,v])=>({u,v}))})
      }
    }
    const result=stateConstructionSearch(states,branches,{left:[],right:[]},p,true,0,{curves,stops,limits,complete:false})
    return {name,limits,rare,profiles:result.allProfiles.map(q=>({pattern:q.pattern,middle:q.middle})),
      stops,reports:result.reports}
  })
}

export async function auditStateWorkspace(progress=()=>{},fixtures=stateAuditFixtures()){
  const server=await createServer({server:{middlewareMode:true,watch:null,hmr:false},appType:'custom'})
  try{
    const {default:Workspace}=await server.ssrLoadModule('/src/components/StateSpaceDialog.jsx')
    const rows=[]
    for(const fixture of fixtures){
      progress(`Workspace: ${fixture.pattern}`)
      const props={open:true,inline:true,state:{kind:'degenerate'},p:fixture.p,tauMin:-1,tauMax:1,
        showRarefaction:false,riemannStates:fixture.states,constructionRequested:true,
        showLeftRiemannHugoniot:false,showRightRiemannHugoniot:false}
      const list=renderToStaticMarkup(createElement(Workspace,props))
      const options=[...list.matchAll(/<option value="(\d+)">Cadeia \d+ · ([A-Z]{2})<\/option>/g)]
      const option=options.find(q=>q[2]===fixture.pattern)
      const selected=option?renderToStaticMarkup(createElement(Workspace,{...props,selectedCandidateIndex:Number(option[1])})):''
      rows.push({...fixture,index:option?Number(option[1]):null,available:options.map(q=>q[2]),
        selectedGroup:selected.includes('aria-label="Cadeia candidata selecionada"'),
        inspection:selected.includes('Ondas da cadeia selecionada'),
        incomplete:selected.includes('Construção gráfica parcial'),
        shocks:(selected.match(/aria-label="Arco de choque da cadeia"/g)??[]).length,
        fans:(selected.match(/aria-label="Trecho de rarefação (selecionado|do bloco composto)"/g)??[]).length,
        contacts:(selected.match(/aria-label="Curva de contato selecionada"/g)??[]).length,
        comparisonAvailable:selected.includes('Comparar ondas de outra cadeia'),
        finite:!selected.includes('NaN')&&!selected.includes('Infinity')})
    }
    return rows
  }finally{await server.close()}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const report={empty:auditEmptyCase(console.log),workspace:await auditStateWorkspace(console.log),
    comparison:await auditStateWorkspace(console.log,['SR','SK'].map(pattern=>({...comparisonAuditCase,pattern})))}
  const output=process.argv[2]??'.cache-state-construction-audit.json'
  await writeFile(output,JSON.stringify(report,null,2))
  console.log(JSON.stringify({output,empty:report.empty.map(q=>({name:q.name,profiles:q.profiles.length})),
    workspace:report.workspace.map(q=>({pattern:q.pattern,index:q.index,complete:!q.incomplete,shocks:q.shocks,fans:q.fans,contacts:q.contacts,comparison:q.comparisonAvailable}))},null,2))
}
