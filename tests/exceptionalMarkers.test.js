import test from 'node:test'
import assert from 'node:assert/strict'
import {exceptionalMarkers} from '../src/math/characteristic/exceptionalMarkers.js'
const zero={a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0}
test('identically degenerate case does not create infinitely many handles',()=>{
 const result=exceptionalMarkers(zero)
 assert.equal(result.allDirectionsDegenerate,true)
 assert.equal(result.markers.length,0)
})
test('projective handles are within compactified coordinate range',()=>{
 const result=exceptionalMarkers({...zero,a20:1,b11:2,b20:1})
 for(const marker of result.markers) assert.ok(marker.zc>=-1&&marker.zc<=1)
})
