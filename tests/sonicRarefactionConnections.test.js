import test from 'node:test'
import assert from 'node:assert/strict'
import {sonicRarefactionConnections} from '../src/math/solution/sonicRarefactionConnections.js'
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:3}
const contact=(point,speed)=>({family:'slow',sonicSide:'plus',refinement:{status:'converged',point,speed,rhResidual:0,sonicResidual:0}})
test('matches S+ with right-anchored rarefaction of same family',()=>{
 const c=sonicRarefactionConnections({left:[contact([1,0],1)],right:[]},[{side:'right',family:'slow',points:[[2,0],[1,0],[0,0]]}],p)
 assert.equal(c.length,1);assert.equal(c[0].kind,'shock-rarefaction');assert.equal(c[0].status,'ordered-geometric-candidate')
})
test('does not confuse S+ with left-anchored branch',()=>{
 const c=sonicRarefactionConnections({left:[contact([1,0],1)]},[{side:'left',family:'slow',points:[[0,0],[1,0]]}],p)
 assert.equal(c.length,0)
})
test('rejects geometrically distant candidate',()=>{
 const c=sonicRarefactionConnections({left:[contact([1,2],1)]},[{side:'right',family:'slow',points:[[2,0],[1,0]]}],p)
 assert.equal(c[0].status,'unmatched')
})
test('ignores unrefined sonic seeds',()=>{
 assert.deepEqual(sonicRarefactionConnections({left:[{refinement:{status:'stalled'}}]},[],p),[])
})
test('rejects speed reversal even when the polyline passes exactly through the contact',()=>{
 const c=sonicRarefactionConnections({left:[contact([1,0],1)]},[
  {side:'right',family:'slow',points:[[2,0],[2.5,0],[1,0]]}
 ],p)
 assert.equal(c.length,1)
 assert.equal(c[0].status,'speed-order-reversal')
 assert.equal(c[0].ordered,false)
})
test('checks S- using left-anchored increasing-speed trace',()=>{
 const right=[{family:'slow',sonicSide:'minus',refinement:{status:'converged',point:[1,0],speed:1,rhResidual:0,sonicResidual:0}}]
 const c=sonicRarefactionConnections({right},[{side:'left',family:'slow',points:[[0,0],[1,0]]}],p)
 assert.equal(c[0].status,'ordered-geometric-candidate')
 assert.equal(c[0].kind,'rarefaction-shock')
})
test('does not accept a contact with the wrong sonic side',()=>{
 const c=sonicRarefactionConnections({left:[{...contact([1,0],1),sonicSide:'minus'}]},[{side:'right',family:'slow',points:[[2,0],[1,0]]}],p)
 assert.deepEqual(c,[])
})
test('connection reports a re-integrated characteristic arc projection',()=>{
 const c=sonicRarefactionConnections({left:[contact([1.4,0],1.4)]},[{side:'right',family:'slow',points:[[2,0],[1,0]]}],p)
 assert.equal(c[0].projectionMethod,'local-rk4-arc')
 assert.ok(Math.abs(c[0].segmentFraction-0.6)<1e-3)
 assert.ok(c[0].distance<1e-5)
})
