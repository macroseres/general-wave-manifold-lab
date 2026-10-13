import test from 'node:test'
import assert from 'node:assert/strict'
import {liuTangentialSpeed,liuTangentialExtrema} from '../src/math/solution/liuTangentialSpeed.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:4}
test('shock speed derivative on scalar quadratic branch matches analytic magnitude',()=>{
 const result=liuTangentialSpeed([2,0],[1,0],p)
 assert.equal(result.status,'regular')
 assert.ok(Math.abs(Math.abs(result.derivative)-.5)<1e-9)
})
test('off-Hugoniot input is rejected',()=>{
 assert.equal(liuTangentialSpeed([2,0],[1,1],p).status,'off-hugoniot')
})
test('tangential diagnostic accepts a regular compressive arc',()=>{
 const result=liuTangentialExtrema([2,0],[[2,0],[1.5,0],[1,0],[.5,0]],p)
 assert.equal(result.status,'sampled-tangential-diagnostic')
 assert.equal(result.candidates.length,0)
})
test('trivial state cannot define a regular tangent',()=>{
 assert.notEqual(liuTangentialSpeed([2,0],[2,0],p).status,'regular')
})
