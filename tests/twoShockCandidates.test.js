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
