import test from 'node:test'
import assert from 'node:assert/strict'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'
import {stateRarefactionGeometry} from '../src/geometry/state/stateRarefactionGeometry.js'

const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:5}
const states={left:[0,0],right:[2,2]}

test('display selects only slow forward and fast backward expansive arcs, preserving solver inputs',()=>{
  const branches=riemannMonotoneRarefactions(states,p)
  const original=structuredClone(branches)
  const curves=stateRarefactionGeometry(states,branches)
  assert.equal(curves.length,2)
  for(const b of curves){
    assert.equal(b.family,b.side==='left'?'slow':'fast')
    assert.deepEqual(b.points[0],states[b.side])
    for(let i=1;i<b.speeds.length;i++)assert.ok((b.side==='left'?1:-1)*(b.speeds[i]-b.speeds[i-1])>0)
    assert.equal(b.entropyCertified,false)
  }
  assert.deepEqual(branches,original)
})

test('constant-speed contacts do not become rarefaction arcs',()=>{
  const linear={...p,a20:0,a10:1,b02:0,b01:2}
  assert.deepEqual(stateRarefactionGeometry(states,riemannMonotoneRarefactions(states,linear)),[])
  assert.deepEqual(stateRarefactionGeometry({},[]),[])
})

test('selection stops at the first plateau or reversal without restarting or retaining later events',()=>{
  for(const speeds of [[0,1,1,2],[0,1,.5,2]]){
    const curves=stateRarefactionGeometry({left:[0,0]},[{side:'left',family:'slow',
      points:[[0,0],[1,0],[2,0],[3,0]],speeds,events:[{index:1},{index:3}]}])
    assert.equal(curves.length,1)
    assert.deepEqual(curves[0].points,[[0,0],[1,0]])
    assert.deepEqual(curves[0].events,[{index:1}])
    assert.equal(curves[0].termination.reason,'strict-speed-order-unverified')
  }
})

test('explicit exploration draws only the selected family and orientation before any chain is built',async()=>{
  const server=await createServer({server:{middlewareMode:true,watch:null,hmr:false},appType:'custom'})
  try{
    const {default:Workspace}=await server.ssrLoadModule('/src/components/StateSpaceDialog.jsx')
    const props={open:true,inline:true,state:{kind:'degenerate'},p,tauMin:-1,tauMax:1,
      showRarefaction:false,riemannStates:states,constructionRequested:false,selectedCandidateIndex:-1,exploreWaveBranches:true}
    const html=renderToStaticMarkup(createElement(Workspace,props))
    assert.equal((html.match(/aria-label="Arco de rarefação lenta de U L"/g)??[]).length,1)
    assert.equal((html.match(/aria-label="Arco de rarefação rápida retrospectiva de U R"/g)??[]).length,1)
    assert.doesNotMatch(html,/aria-label="Cadeia candidata selecionada"/)
    const linear={...p,a20:0,a10:1,b02:0,b01:2}
    const contactHtml=renderToStaticMarkup(createElement(Workspace,{...props,p:linear}))
    assert.doesNotMatch(contactHtml,/aria-label="Arco de rarefação (lenta|rápida)/)
  }finally{await server.close()}
})
