import test from 'node:test'
import assert from 'node:assert/strict'
import { refineFiniteSonicContact, refineFiniteSonicContacts } from '../src/math/solution/refineFiniteSonicContact.js'
const linear = { a20:0,a11:0,a02:0,a10:1,a01:0,b20:0,b11:0,b02:0,b10:0,b01:2 }
const burgers = { a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:0 }
test('exact finite forward contact on a linearly degenerate family',()=>{
 const r=refineFiniteSonicContact([0,0],[2,0],linear,'forward','slow')
 assert.equal(r.status,'converged'); assert.ok(r.rhResidual<1e-10); assert.equal(r.speed,1)
})
test('exact finite backward contact on a linearly degenerate family',()=>{
 const r=refineFiniteSonicContact([2,0],[0,0],linear,'backward','slow')
 assert.equal(r.status,'converged'); assert.equal(r.speed,1)
})
test('trivial jump excluded from finite contact',()=>assert.notEqual(refineFiniteSonicContact([0,0],[0,0],linear,'forward','slow').status,'converged'))
test('invalid family rejected',()=>assert.equal(refineFiniteSonicContact([0,0],[1,0],linear,'forward','other').status,'invalid-input'))
test('nonsonic Burgers jump cannot be certified as finite contact',()=>assert.notEqual(refineFiniteSonicContact([0,0],[2,0],burgers,'forward','fast').status,'converged'))
test('batch preserves event and appends refinement',()=>{
 const events=[{point:[2,0],family:'slow',kind:'sample-near-zero'}]
 const result=refineFiniteSonicContacts([0,0],events,linear,'forward')
 assert.equal(result[0].kind,'sample-near-zero'); assert.equal(result[0].refinement.status,'converged')
})
