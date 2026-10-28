import test from 'node:test'
import assert from 'node:assert/strict'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'
import {stateShockBranches} from '../src/math/solution/stateShockBranches.js'
import {stateShockGeometry} from '../src/geometry/state/stateShockGeometry.js'
import {classifyLaxShock} from '../src/math/solution/twoShockFamilyEvidence.js'

const p={a20:3.3977518519014067,a11:0,a02:.5,a10:0,a01:0,b20:-.09349436579634296,b11:1,b02:-.1,b10:1,b01:0}
const states={left:[.24980173142209872,-1.1058589181489928],right:[.2324975347029804,.15172581931988416]}

test('reported graph case has independent slow and backward fast shock branches',()=>{
  const curves=stateShockGeometry(states,stateShockBranches(states,p),p)
  for(const side of ['left','right']){
    const found=curves.filter(c=>c.side===side)
    assert.ok(found.length,side)
    for(const c of found)for(const q of c.points){
      const U=[q.u,q.v],fixed=states[side]
      if(Math.hypot(U[0]-fixed[0],U[1]-fixed[1])<1e-12)continue
      const check=side==='left'?classifyLaxShock(fixed,U,p):classifyLaxShock(U,fixed,p)
      assert.ok(check.families.includes(c.family))
      assert.equal(check.entropyCertified,false)
    }
  }
})

test('one selected state suffices; no opposite state or Riemann construction is needed',()=>{
  for(const side of ['left','right']){
    const single={[side]:states[side]}
    const curves=stateShockGeometry(single,stateShockBranches(single,p),p)
    assert.ok(curves.some(c=>c.side===side))
  }
  assert.deepEqual(stateShockGeometry({},stateShockBranches({},p),p),[])
})

test('Lax failures split paths instead of drawing across rejected samples',()=>{
  const b={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:5}
  const s={left:[2,2]}
  const curves=stateShockGeometry(s,{curves:{left:[{id:'split',family:'slow',points:
    [[2,2],[1.9,2],[1.8,2],[2.2,2],[1.6,2],[1.5,2]].map(([u,v])=>({u,v}))}],right:[]}},b)
  assert.equal(curves.length,2)
  assert.equal(curves[0].points.at(-1).u,1.8)
  assert.equal(curves[1].points[0].u,1.6)
})

test('actual workspace renders shock branches with both projected Hugoniot curves hidden and no selected chain',async()=>{
  const server=await createServer({server:{middlewareMode:true,watch:null,hmr:false},appType:'custom'})
  try{
    const {default:Workspace}=await server.ssrLoadModule('/src/components/StateSpaceDialog.jsx')
    const html=renderToStaticMarkup(createElement(Workspace,{open:true,inline:true,state:{kind:'degenerate'},p,
      tauMin:-1,tauMax:1,showRarefaction:false,riemannStates:states,constructionRequested:false,
      selectedCandidateIndex:-1,showLeftRiemannHugoniot:false,showRightRiemannHugoniot:false}))
    assert.match(html,/aria-label="Ramo de choque lento de U L"/)
    assert.match(html,/aria-label="Ramo de choque rápido para U R"/)
    assert.match(html,/Choques nos estados|Ramos de choque nos estados/)
    assert.doesNotMatch(html,/aria-label="Cadeia candidata selecionada"/)
    assert.doesNotMatch(html,/NaN|Infinity/)
  }finally{await server.close()}
})
