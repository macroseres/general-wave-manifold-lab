import test from 'node:test'
import assert from 'node:assert/strict'
import {localCharacteristicAdvance,projectContactToCharacteristicTrace} from '../src/math/solution/trajectoryContactProjection.js'
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:3}
test('local RK4 continuation follows the normalized slow eigenvector',()=>{
 const U=localCharacteristicAdvance([0,0],p,'slow',[1,0],0.4)
 assert.ok(Math.abs(U[0]-0.4)<1e-10)
 assert.ok(Math.abs(U[1])<1e-10)
})
test('closest point on a re-integrated arc lies in the segment interior',()=>{
 const result=projectContactToCharacteristicTrace([0.37,0.1],{family:'slow',points:[[0,0],[1,0]]},p)
 assert.ok(Math.abs(result.point[0]-0.37)<1e-4)
 assert.ok(Math.abs(result.distance-0.1)<1e-4)
 assert.ok(Math.abs(result.segmentFraction-0.37)<1e-4)
})
test('projection checks segment endpoints',()=>{
 const result=projectContactToCharacteristicTrace([2,0],{family:'slow',points:[[0,0],[1,0]]},p)
 assert.equal(result.segmentFraction,1)
 assert.ok(Math.abs(result.distance-1)<1e-10)
})
test('invalid or nonhyperbolic trajectory is not matched',()=>{
 const bad={...p,b01:0}
 assert.equal(localCharacteristicAdvance([0,0],bad,'slow',[1,0],0.1),null)
 assert.equal(projectContactToCharacteristicTrace([0,0],{family:'slow',points:[[0,0],[1,0]]},bad),null)
})
