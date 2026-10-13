import test from 'node:test'
import assert from 'node:assert/strict'
import {refinedLiuInterior} from '../src/math/solution/liuInteriorExtrema.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:4}
test('refined Liu detects a compressive forward shock without violation',()=>{
 const result=refinedLiuInterior([2,0],[[2,0],[1,0],[0,0]],p,{depth:2})
 assert.equal(result.status,'refined-liu-compatible')
 assert.ok(result.inserted>=4)
 assert.ok(result.checked>1)
})
test('refined Liu detects expansion-shock violation',()=>{
 const result=refinedLiuInterior([0,0],[[0,0],[1,0],[2,0]],p,{depth:2})
 assert.equal(result.status,'refined-liu-violation')
 assert.ok(result.violations.length>0)
})
test('rejects invalid input and unanchored arc',()=>{
 assert.equal(refinedLiuInterior([0,0],[[0,0],[1,0]],p).status,'invalid-input')
 assert.equal(refinedLiuInterior([0,0],[[1,0],[1.5,0],[2,0]],p).status,'unanchored-arc')
})
test('rejects intermediate points outside Hugoniot',()=>{
 const result=refinedLiuInterior([2,0],[[2,0],[1,1],[0,0]],p,{depth:0})
 assert.equal(result.status,'off-hugoniot')
})
