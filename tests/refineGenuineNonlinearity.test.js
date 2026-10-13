import test from 'node:test'
import assert from 'node:assert/strict'
import { refineGenuineNonlinearityBracket, refineGenuineNonlinearityEvents } from '../src/math/rarefaction/refineGenuineNonlinearity.js'
const p = { a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:0 }
test('refinement rejects intervals without a sign change',()=>{
  const result=refineGenuineNonlinearityBracket([0,2],[0.5,2],p,'slow')
  assert.equal(result.status,'unresolved')
  assert.equal(result.reason,'not-bracketed')
})
test('refinement does not invent events on empty branches',()=>{
  assert.deepEqual(refineGenuineNonlinearityEvents({family:'slow',points:[],events:[]},p).events,[])
})
test('refinement preserves near-zero observations without certifying them',()=>{
  const event={kind:'near-zero',point:[0,0],index:0,value:0}
  const result=refineGenuineNonlinearityEvents({family:'slow',points:[[0,0]],events:[event]},p)
  assert.deepEqual(result.events,[event])
})
