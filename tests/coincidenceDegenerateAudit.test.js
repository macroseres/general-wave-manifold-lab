import test from 'node:test'
import assert from 'node:assert/strict'
import {auditCoincidenceDegeneracies} from '../src/math/characteristic/coincidenceDegenerateAudit.js'
const window={uMin:-2,uMax:2,vMin:-2,vMax:2}
test('scalar Jacobian gives identically zero discriminant',()=>{
 const p={a20:0,a11:0,a02:0,a10:1,a01:0,b20:0,b11:0,b02:0,b10:0,b01:1}
 const r=auditCoincidenceDegeneracies(p,window)
 assert.equal(r.type,'identicamente nulo')
 assert.equal(r.isolatedPoints.length,0)
 assert.ok(r.warning)
})
test('no zero for positive constant discriminant',()=>{
 const p={a20:0,a11:0,a02:0,a10:1,a01:0,b20:0,b11:0,b02:0,b10:0,b01:-1}
 const r=auditCoincidenceDegeneracies(p,window)
 assert.equal(r.isolatedPoints.length,0)
})
