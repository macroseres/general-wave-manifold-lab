import test from 'node:test'
import assert from 'node:assert/strict'
import {attachForwardSonicEndpoint} from '../src/math/solution/seededContactEndpoint.js'
import {seededLiuAtForwardContact} from '../src/math/solution/orientedLiuArc.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:2}
const left=[0,0]
const arc=[[0,0],[.1,0],[.2,0],[.29,0]]
test('RH-consistent forward endpoint is appended to the traced arc',()=>{
 const result=attachForwardSonicEndpoint(left,arc,[.3,0],p)
 assert.equal(result.status,'endpoint-attached')
 assert.deepEqual(result.arc.at(-1),[.3,0])
})
test('an endpoint outside the forward tangent direction is rejected',()=>{
 const result=attachForwardSonicEndpoint(left,arc,[.28,0],p)
 assert.equal(result.status,'backward-endpoint')
})
test('an endpoint off the Hugoniot is rejected',()=>{
 const result=attachForwardSonicEndpoint(left,arc,[.3,.001],p)
 assert.equal(result.status,'target-off-hugoniot')
})
test('a far-away endpoint is not silently joined',()=>{
 const result=attachForwardSonicEndpoint(left,arc,[.8,0],p)
 assert.equal(result.status,'target-too-far')
})
test('seeded Liu remains explicitly preliminary after endpoint validation',()=>{
 const result=seededLiuAtForwardContact(left,{refinement:{status:'converged',point:[.3,0]}},p,{family:'slow',step:.01,targetTolerance:.01})
 assert.equal(result.endpointStatus,'endpoint-attached')
 assert.equal(result.passes,false)
 assert.equal(result.sampledLiuPasses,false) // increasing Burgers shock speed violates forward Liu
})
