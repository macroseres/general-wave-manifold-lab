import test from 'node:test'
import assert from 'node:assert/strict'
import {liuSpeedAlongFibre} from '../src/math/solution/liuSpeedAlongFibre.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:4}
test('compressive Burgers forward shock satisfies sampled Liu ordering',()=>{
 const d=liuSpeedAlongFibre([2,0],[[2,0],[1.5,0],[1,0],[0,0]],p)
 assert.equal(d.status,'sampled-liu-compatible');assert.equal(d.checked,2)
})
test('expansion shock violates sampled Liu ordering',()=>{
 const d=liuSpeedAlongFibre([0,0],[[0,0],[.5,0],[1,0],[2,0]],p)
 assert.equal(d.status,'sampled-liu-violation');assert.ok(d.violations.length>0)
})
test('rejects off-Hugoniot intermediate points',()=>{
 const d=liuSpeedAlongFibre([2,0],[[2,0],[1,1],[0,0]],p)
 assert.equal(d.status,'off-hugoniot-arc')
})
test('rejects unanchored or undersampled arcs',()=>{
 assert.equal(liuSpeedAlongFibre([2,0],[[1,0],[.5,0],[0,0]],p).status,'unanchored-arc')
 assert.equal(liuSpeedAlongFibre([2,0],[[2,0],[0,0]],p).status,'insufficient-intermediate-samples')
})
