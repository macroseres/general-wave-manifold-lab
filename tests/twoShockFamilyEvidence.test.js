import test from 'node:test'
import assert from 'node:assert/strict'
import {classifyLaxShock,assessTwoShockFamilyChain} from '../src/math/solution/twoShockFamilyEvidence.js'
// Decoupled Burgers fields with separated eigenvalues on the chosen states.
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:5}
test('slow shock meets strict Lax endpoint inequalities',()=>{
 const r=classifyLaxShock([2,0],[0,0],p)
 assert.equal(r.status,'strict-lax-endpoint-candidate');assert.deepEqual(r.families,['slow'])
})
test('fast shock meets strict Lax endpoint inequalities',()=>{
 const r=classifyLaxShock([0,2],[0,0],p)
 assert.equal(r.status,'strict-lax-endpoint-candidate');assert.deepEqual(r.families,['fast'])
})
test('expansive shock is rejected',()=>{
 const r=classifyLaxShock([0,0],[2,0],p)
 assert.equal(r.status,'strict-lax-failed')
})
test('ordered slow then fast chain is retained as endpoint candidate',()=>{
 const r=assessTwoShockFamilyChain([2,2],[0,2],[0,0],p)
 assert.equal(r.status,'ordered-lax-endpoint-candidate');assert.equal(r.entropyCertified,false)
})
test('wrong family order is not accepted',()=>{
 const r=assessTwoShockFamilyChain([2,2],[2,0],[0,0],p)
 assert.notEqual(r.status,'ordered-lax-endpoint-candidate')
})
