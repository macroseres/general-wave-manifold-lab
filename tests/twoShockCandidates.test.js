import test from 'node:test'
import assert from 'node:assert/strict'
import {twoShockCandidates} from '../src/math/solution/twoShockCandidates.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
const curve=(id,points)=>({id,points:points.map(([u,v])=>({u,v}))})
test('missing states produce no intermediate candidates',()=>{
 assert.deepEqual(twoShockCandidates(null,[1,1],[],[],defaultCoefficients),[])
})
test('crossing polylines produce a finite candidate with shock diagnostics',()=>{
 const a=[curve('f',[[0,-1],[0,1]])],b=[curve('b',[[-1,0],[1,0]])]
 const result=twoShockCandidates([-2,-2],[2,2],a,b,defaultCoefficients)
 assert.equal(result.length,1)
 assert.deepEqual(result[0].middle,[0,0])
 assert.ok(Number.isFinite(result[0].first.speed))
 assert.ok(Number.isFinite(result[0].second.speed))
})
test('parallel or disjoint segments do not create candidates',()=>{
 const a=[curve('f',[[0,0],[1,0]])],b=[curve('b',[[0,1],[1,1]])]
 assert.deepEqual(twoShockCandidates([-2,-2],[2,2],a,b,defaultCoefficients),[])
})
test('shared vertex is deduplicated',()=>{
 const a=[curve('f',[[-1,0],[0,0],[1,0]])],b=[curve('b',[[0,-1],[0,1]])]
 assert.equal(twoShockCandidates([-2,-2],[2,2],a,b,defaultCoefficients).length,1)
})


test('bounded four-equation corrector recovers a non-poligonal SS junction',async()=>{
 const {refineTwoShockMiddle,searchTwoShockCandidates}=await import('../src/math/solution/twoShockCandidates.js')
 const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:5}
 const result=refineTwoShockMiddle([2,2],[0,0],[.03,1.98],p)
 assert.equal(result.status,'refined-candidate')
 assert.ok(Math.hypot(result.middle[0],result.middle[1]-2)<1e-6)
 assert.ok(result.residual<1e-8)
 const found=searchTwoShockCandidates([2,2],[0,0],
   [curve('forward',[[-.2,1.8],[.2,2.2]])],
   [curve('backward',[[-.2,2.2],[.2,1.8]])],p)
 assert.ok(found.report)
 assert.equal(found.report.complete,false)
})
test('singular or invalid SS input does not claim refinement',async()=>{
 const {refineTwoShockMiddle}=await import('../src/math/solution/twoShockCandidates.js')
 assert.equal(refineTwoShockMiddle(null,[0,0],[1,1],defaultCoefficients).status,'invalid-input')
})
