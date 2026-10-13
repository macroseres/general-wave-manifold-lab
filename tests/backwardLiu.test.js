import test from 'node:test'
import assert from 'node:assert/strict'
import {liuSpeedAlongBackwardFibre,seededLiuAtBackwardContact} from '../src/math/solution/backwardLiu.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:3}
test('backward Liu: convex scalar shock with left larger than fixed right',()=>{
 const q=liuSpeedAlongBackwardFibre([0,0],[[0,0],[1,0],[2,0]],p)
 assert.equal(q.status,'sampled-backward-liu-compatible')
 assert.equal(q.passes,true)
})
test('backward Liu: left smaller than fixed right violates reverse ordering',()=>{
 const q=liuSpeedAlongBackwardFibre([0,0],[[0,0],[-1,0],[-2,0]],p)
 assert.equal(q.status,'sampled-backward-liu-violation')
 assert.equal(q.violations.length,1)
})
test('backward Liu rejects off-fibre intermediate state',()=>{
 const q=liuSpeedAlongBackwardFibre([0,0],[[0,0],[1,1],[2,0]],p)
 assert.equal(q.status,'off-hugoniot-arc')
})
test('backward Liu requires anchored, nontrivial arc',()=>{
 assert.equal(liuSpeedAlongBackwardFibre([0,0],[[1,0],[1.5,0],[2,0]],p).status,'unanchored-arc')
 assert.equal(liuSpeedAlongBackwardFibre([0,0],[[0,0],[1,0]],p).status,'invalid-arc')
})
test('backward Liu does not certify an unrefined contact',()=>{
 const q=seededLiuAtBackwardContact([0,0],null,oldWavePreset())
 assert.equal(q.passes,false)
})
