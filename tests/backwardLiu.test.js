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

test('RS orientation: right-fixed Hugoniot arc is ordered U_R to U_M and obeys backward Liu',()=>{
 const right=[0,0],middle=[2,0],arc=[right,[0.5,0],[1,0],[1.5,0],middle]
 const result=liuSpeedAlongBackwardFibre(right,arc,p)
 assert.deepEqual(arc[0],right)
 assert.deepEqual(arc.at(-1),middle)
 assert.equal(result.status,'sampled-backward-liu-compatible')
 assert.equal(result.checked,3)
 assert.equal(result.targetSpeed,1)
 assert.equal(result.maximumIntermediateSpeed,0.75)
 assert.equal(result.violations.length,0)
 assert.equal(result.qualification.includes('no global or entropy certification'),true)
})

test('RS orientation: reversed speed ordering is a detected backward Liu violation',()=>{
 const right=[0,0],middle=[-2,0],arc=[right,[-0.5,0],[-1,0],[-1.5,0],middle]
 const result=liuSpeedAlongBackwardFibre(right,arc,p)
 assert.equal(result.status,'sampled-backward-liu-violation')
 assert.equal(result.checked,3)
 assert.equal(result.targetSpeed,-1)
 assert.equal(result.maximumIntermediateSpeed,-0.25)
 assert.equal(result.violations.length,3)
})

test('RS orientation: an unanchored or off-Hugoniot branch is not approved',()=>{
 const right=[0,0]
 assert.equal(liuSpeedAlongBackwardFibre(right,[[0.2,0],[1,0],[2,0]],p).status,'unanchored-arc')
 assert.equal(liuSpeedAlongBackwardFibre(right,[right,[1,1],[2,0]],p).status,'off-hugoniot-arc')
})
