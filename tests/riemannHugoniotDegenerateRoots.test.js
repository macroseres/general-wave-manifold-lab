import test from 'node:test'
import assert from 'node:assert/strict'
import {refineHugoniotSegmentEndpoint} from '../src/math/solution/riemannBranchHighlight.js'

// F(u,v)=(u²/2,uv), fixed=(0,0). Along v=1, the RH determinant
// equals u²/2: an isolated, double (tangential) root at u=0.
const tangentFlux={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:1,b02:0,b10:0,b01:0}
const fixed=[0,0]

test('interior double root is found without any sign change',()=>{
 const r=refineHugoniotSegmentEndpoint([-1,1],[1,1],fixed,[0.003,1],tangentFlux,{tolerance:0.01})
 assert.ok(r)
 assert.ok(Math.abs(r.point[0])<1e-9)
 assert.ok(r.relativeResidual<1e-8)
 assert.ok(Number.isFinite(r.speed))
})
test('tangential root remains detectable under reversed segment orientation',()=>{
 const r=refineHugoniotSegmentEndpoint([1,1],[-1,1],fixed,[0,1],tangentFlux,{tolerance:0.01})
 assert.ok(r)
 assert.ok(Math.abs(r.point[0])<1e-9)
})
test('tangential root is not substituted when U_M lies outside tolerance',()=>{
 assert.equal(refineHugoniotSegmentEndpoint([-1,1],[1,1],fixed,[0.2,1],tangentFlux,{tolerance:0.01}),null)
})
test('degenerate zero-length segment is rejected when it does not satisfy RH',()=>{
 assert.equal(refineHugoniotSegmentEndpoint([0.3,1],[0.3,1],fixed,[0.3,1],tangentFlux,{tolerance:0.01}),null)
})
test('root at the segment boundary is included',()=>{
 const r=refineHugoniotSegmentEndpoint([0,1],[1,1],fixed,[0,1],tangentFlux,{tolerance:0.01})
 assert.ok(r)
 assert.ok(Math.abs(r.point[0])<1e-9)
})
