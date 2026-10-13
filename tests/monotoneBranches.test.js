import test from 'node:test'
import assert from 'node:assert/strict'
import { monotoneRarefactionSegment, riemannMonotoneRarefactions } from '../src/math/rarefaction/monotoneBranches.js'
const p={a20:1,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:2}
test('left slow rarefaction keeps increasing characteristic speed',()=>{
 const q=monotoneRarefactionSegment({side:'left',family:'slow',points:[[0,0],[.1,0],[.2,0]]},p)
 assert.equal(q.points.length,3);assert.ok(q.speedEnd>q.speedStart)
})
test('left compression direction is rejected',()=>{
 const q=monotoneRarefactionSegment({side:'left',family:'slow',points:[[0,0],[-.1,0],[-.2,0]]},p)
 assert.equal(q.points.length,1);assert.equal(q.status,'not-expansive')
})
test('right backward rarefaction requires decreasing characteristic speed',()=>{
 const q=monotoneRarefactionSegment({side:'right',family:'slow',points:[[0,0],[-.1,0],[-.2,0]]},p)
 assert.equal(q.points.length,3)
})
test('absent states create no rarefactions',()=>assert.deepEqual(riemannMonotoneRarefactions({left:null,right:null},p),[]))
