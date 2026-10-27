import test from 'node:test'
import assert from 'node:assert/strict'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'
import {rarefactionPairCandidates,searchRarefactionPairs} from '../src/math/solution/rarefactionPairCandidates.js'
import {contactChainCandidates} from '../src/math/solution/contactChainCandidates.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
import {traceStateRarefaction} from '../src/math/rarefaction/stateIntegralCurves.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'
import {compositeBlockChainCandidates} from '../src/math/solution/compositeBlockChainCandidates.js'

test('RR and contact components render fans and distinct contact interfaces',async()=>{
  const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:.75,b01:0}
  const [candidate]=rarefactionPairCandidates({left:[0,-1],right:[1,.25]},[
    {side:'left',family:'slow',sign:1,points:[[0,-1],[0,-.5]]},
    {side:'right',family:'fast',sign:-1,points:[[1,.25],[-.2,-.95]]},
  ],p)
  assert.ok(candidate)
  const server=await createServer({server:{middlewareMode:true,watch:null},appType:'custom'})
  try{
    const {default:Physical}=await server.ssrLoadModule('/src/components/RiemannCandidatePhysical.jsx')
    const {default:Expressions}=await server.ssrLoadModule('/src/components/PhysicalSolutionExpressions.jsx')
    const expressionHtml=renderToStaticMarkup(createElement(Expressions,{candidate}))
    assert.match(expressionHtml,/R_1/)
    assert.match(expressionHtml,/R_2/)
    assert.doesNotMatch(expressionHtml,/Não há expressão por trechos/)
    const badOrder=structuredClone(candidate)
    badOrder.fans[1].speeds[0]=badOrder.fans[0].speeds.at(-1)-1
    assert.match(renderToStaticMarkup(createElement(Expressions,{candidate:badOrder})),/Não há expressão por trechos/)
    const {default:PhysicalWorkspace}=await server.ssrLoadModule('/src/components/PhysicalSpaceDialog.jsx')
    const stale=renderToStaticMarkup(createElement(PhysicalWorkspace,{open:true,inline:true,p,
      tauMin:-1,tauMax:1,point:{tau:0,Y:0,zc:0},profileCandidates:[candidate],candidateIndex:0,candidatesStale:true}))
    assert.match(stale,/candidatos anteriores foram invalidados/)
    assert.match(stale,/Atualizar cadeias em Estados/)
    assert.doesNotMatch(stale,/Perfil candidato|Estado intermediário U_M/)
    const html=renderToStaticMarkup(createElement(Physical,{candidate,tMax:1,time:.5}))
    assert.equal((html.match(/<polygon /g)??[]).length,2)
    assert.doesNotMatch(html,/NaN|Infinity|Não foi possível/)
    const profiles=renderToStaticMarkup(createElement(Physical,{candidate,tMax:1,time:.5,profilesOnly:true}))
    assert.match(profiles,/Perfil candidato u/)
    assert.match(profiles,/Perfil candidato v/)
    assert.doesNotMatch(profiles,/NaN|Infinity|Não foi possível/)
    const linear={...p,a20:0,a10:1,b02:0,b10:0,b01:2}
    const [contacts]=contactChainCandidates({left:[0,0],right:[1,1]},[],{},linear)
    const cc=renderToStaticMarkup(createElement(Physical,{candidate:contacts,tMax:1,time:.5}))
    assert.match(cc,/Contatos \(roxo\)/)
    assert.equal((cc.match(/stroke="#bf5af2"/g)??[]).length,2)
    const cp=renderToStaticMarkup(createElement(Physical,{candidate:contacts,tMax:1,time:.5,profilesOnly:true}))
    assert.equal((cp.match(/<path /g)??[]).length,6)
    assert.doesNotMatch(cp,/NaN|Infinity|Não foi possível/)
    const {default:StateSpace}=await server.ssrLoadModule('/src/components/StateSpaceDialog.jsx')
    const rrPlane=renderToStaticMarkup(createElement(StateSpace,{open:true,inline:true,state:{kind:'degenerate'},
      p,tauMin:-1,tauMax:1,showRarefaction:false,riemannStates:{left:[0,-1],right:[1,.25]},selectedCandidateIndex:0}))
    assert.match(rrPlane,/U_L\\xrightarrow\{R_1\}U_M\\xrightarrow\{R_2\}U_R/)
    const plane=renderToStaticMarkup(createElement(StateSpace,{open:true,inline:true,state:{kind:'degenerate'},
      p:linear,tauMin:-1,tauMax:1,showRarefaction:false,riemannStates:{left:[0,0],right:[1,1]},selectedCandidateIndex:0}))
    assert.match(plane,/Cadeia 1 · CC/)
    assert.match(plane,/Diagnóstico da busca RR/)
    assert.equal((plane.match(/aria-label="Curva de contato selecionada"/g)??[]).length,2)
    assert.doesNotMatch(plane,/O ponto atual não possui fibra regular|NaN|Infinity/)
    const quadratic=oldWavePreset({B2:0})
    const left=traceStateRarefaction([1,-1],quadratic,'slow',-1,{step:.01,maxLength:.15}).points.at(-1)
    const right=traceStateRarefaction([1,1],quadratic,'fast',1,{step:.01,maxLength:.15}).points.at(-1)
    const inputs={left,right},branches=riemannMonotoneRarefactions(inputs,quadratic,{step:.01,maxLength:.6,maxSteps:100})
    const kr=compositeBlockChainCandidates(inputs,branches,{},quadratic,{maxSourceSamples:48}).find(q=>q.pattern==='KR')
    const kp=renderToStaticMarkup(createElement(Physical,{candidate:kr,tMax:1,time:.5}))
    assert.equal((kp.match(/<polygon /g)??[]).length,2)
    assert.doesNotMatch(kp,/NaN|Infinity|Não foi possível/)
    const props={open:true,inline:true,state:{kind:'degenerate'},p:quadratic,tauMin:-1,tauMax:1,showRarefaction:false,riemannStates:inputs}
    const list=renderToStaticMarkup(createElement(StateSpace,props))
    const option=list.match(/<option value="(\d+)">Cadeia \d+ · KR<\/option>/)
    assert.ok(option,'KR must be available in the actual state workspace with default search settings')
    const selected=renderToStaticMarkup(createElement(StateSpace,{...props,selectedCandidateIndex:Number(option[1])}))
    assert.equal((selected.match(/aria-label="Trecho de rarefação do bloco composto"/g)??[]).length,2)
    assert.equal((selected.match(/aria-label="Extremos do salto composto"/g)??[]).length,1)
    assert.doesNotMatch(selected,/NaN|Infinity/)
    const {default:SearchReport}=await server.ssrLoadModule('/src/components/RarefactionSearchReport.jsx')
    const branchPair=[
      {side:'left',family:'slow',sign:1,points:[[0,-1],[0,-.5]]},
      {side:'right',family:'fast',sign:-1,points:[[1,.25],[-.2,-.95]]},
    ]
    const capped=searchRarefactionPairs({left:[0,-1],right:[1,.25]},[...branchPair,{...branchPair[1]}],p,{maxCandidates:1})
    const cappedHtml=renderToStaticMarkup(createElement(SearchReport,{report:capped.report}))
    assert.match(cappedHtml,/Limite de candidatos atingido/)
    assert.match(cappedHtml,/Há sementes ou pares de ramos não examinados/)
    const failed=searchRarefactionPairs({left:[0,-1],right:[1,.25]},branchPair,p,{corrector:{conditioningTolerance:1}})
    const failedHtml=renderToStaticMarkup(createElement(SearchReport,{report:failed.report}))
    assert.match(failedHtml,/Busca inconclusiva/)
    assert.match(failedHtml,/Interseção mal condicionada/)
    assert.doesNotMatch(failedHtml,/NaN|Infinity/)
  }finally{await server.close()}
})
