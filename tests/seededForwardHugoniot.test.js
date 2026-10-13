import test from 'node:test'
import assert from 'node:assert/strict'
import {traceSeededForwardHugoniot} from '../src/math/solution/seededForwardHugoniot.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:2}
test('seeded continuation follows slow decoupled Hugoniot without a sampled guide',()=>{
 const r=traceSeededForwardHugoniot([0,0],[.3,0],p,{family:'slow',step:.015,targetTolerance:.02})
 assert.equal(r.status,'seeded-target-approach')
 assert.equal(r.family,'slow')
 assert.ok(r.arc.length>4)
 assert.ok(r.arc.slice(1).every(q=>Math.abs(q[1])<1e-6))
})
test('seeded continuation follows fast decoupled Hugoniot without a sampled guide',()=>{
 const r=traceSeededForwardHugoniot([0,0],[0,.3],p,{family:'fast',step:.015,targetTolerance:.02})
 assert.equal(r.status,'seeded-target-approach')
 assert.equal(r.family,'fast')
 assert.ok(r.arc.slice(1).every(q=>Math.abs(q[0])<1e-6))
})
test('unreachable target is not presented as a connecting arc',()=>{
 const r=traceSeededForwardHugoniot([0,0],[.3,.3],p,{maxSteps:30,maxRadius:.5})
 assert.equal(r.arc,null)
})
test('coincident eigenvalues are not assigned a characteristic seed',()=>{
 const r=traceSeededForwardHugoniot([0,0],[.3,0],{...p,b01:0})
 assert.equal(r.status,'characteristic-unresolved')
})
