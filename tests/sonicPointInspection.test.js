import test from 'node:test'
import assert from 'node:assert/strict'
import {inspectSonicPoint} from '../src/math/sonic/pointInspection.js'
import {sonicImplicit} from '../src/math/sonic/sonic.js'
const p={a20:4.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
test('sonic inspection shares both implicit evaluations',()=>{
 const q={tau:.5,Y:.3,zc:.25,side:'minus'}
 const result=inspectSonicPoint(q,p)
 assert.equal(result.kind,'regular')
 assert.ok(Math.abs(result.phiMinus-sonicImplicit(q.tau,q.Y,result.z,p,'minus'))<1e-9)
 assert.ok(Math.abs(result.phiPlus-sonicImplicit(q.tau,q.Y,result.z,p,'plus'))<1e-9)
 assert.ok(result.relativeResidual>=0)
})
test('sonic inspection handles projective boundaries without invented finite coordinates',()=>{
 assert.equal(inspectSonicPoint({tau:0,Y:0,zc:1,side:'plus'},p).kind,'outside-finite-chart')
})
