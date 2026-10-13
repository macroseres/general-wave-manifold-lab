import test from 'node:test'
import assert from 'node:assert/strict'
import {refinedBackwardLiuInterior,backwardStationaryOrdering} from '../src/math/solution/backwardLiuInterior.js'
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:3}
test('backward interior: convex branch satisfies sampled reverse inequality',()=>{
 const r=refinedBackwardLiuInterior([0,0],[[0,0],[1,0],[2,0]],p,{depth:2})
 assert.equal(r.status,'refined-backward-liu-compatible')
 assert.equal(r.violations.length,0)
 assert.ok(r.checked>1)
})
test('backward interior: reverse orientation detects violation',()=>{
 const r=refinedBackwardLiuInterior([0,0],[[0,0],[-1,0],[-2,0]],p,{depth:2})
 assert.equal(r.status,'refined-backward-liu-violation')
 assert.ok(r.violations.length>0)
})
test('backward interior rejects off-Hugoniot arcs',()=>{
 assert.equal(refinedBackwardLiuInterior([0,0],[[0,0],[1,1],[2,0]],p).status,'interior-refinement-inconclusive')
})
test('backward stationary comparison uses reversed inequality',()=>{
 const r=backwardStationaryOrdering([0,0],[2,0],{status:'refined-candidates',roots:[{status:'refined-candidate',point:[3,0],derivative:0}]},p)
 assert.equal(r.status,'stationary-backward-liu-violation')
})
test('backward stationary near-zero-only candidates do not claim violations',()=>{
 const r=backwardStationaryOrdering([0,0],[2,0],{status:'refined-candidates',roots:[{status:'near-zero-sample',point:[3,0]}]},p)
 assert.equal(r.status,'stationary-no-violation-detected')
 assert.equal(r.passes,false)
})
