import test from 'node:test'
import assert from 'node:assert/strict'
import {refineMixedMiddle} from '../src/math/solution/mixedWaveChains.js'

const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:3}

test('refines rarefaction-shock join on an RK4 characteristic arc',()=>{
 const branch={family:'slow',points:[[.5,0],[1.5,0]]}
 const result=refineMixedMiddle([0,0],[1,-1],branch,p,'rarefaction-shock',0)
 assert.equal(result.status,'refined-candidate')
 assert.ok(Math.abs(result.middle[0]-1)<1e-7)
 assert.ok(Math.abs(result.middle[1])<1e-10)
 assert.equal(result.entropyCertified,false)
})
test('does not invent a root outside the rarefaction segment',()=>{
 const branch={family:'slow',points:[[.1,0],[.4,0]]}
 assert.equal(refineMixedMiddle([0,0],[1,-1],branch,p,'rarefaction-shock',0).status,'unbracketed')
})
test('rejects invalid or zero-length segments',()=>{
 assert.equal(refineMixedMiddle([0,0],[1,-1],{family:'slow',points:[[0,0],[0,0]]},p,'rarefaction-shock',0).status,'degenerate-segment')
 assert.equal(refineMixedMiddle(null,[1,-1],{},p,'rarefaction-shock',0).status,'invalid-input')
})
