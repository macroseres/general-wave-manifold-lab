import test from 'node:test'
import assert from 'node:assert/strict'
import { auditCoincidenceLifts } from '../src/math/characteristic/coincidenceLiftAudit.js'
const window={uMin:-2,uMax:2,vMin:-2,vMax:2}
test('identically zero discriminant reports global fiber warning',()=>{
  const p={a20:0,a11:0,a02:0,a10:1,a01:0,b20:0,b11:0,b02:0,b10:0,b01:1}
  const r=auditCoincidenceLifts(p,window)
  assert.equal(r.type,'identicamente nulo')
  assert.match(r.globalWarning,/todo o domínio/)
})
test('strictly hyperbolic constant system has no isolated coincidence lifts',()=>{
  const p={a20:0,a11:0,a02:0,a10:1,a01:0,b20:0,b11:0,b02:0,b10:0,b01:-1}
  const r=auditCoincidenceLifts(p,window)
  assert.equal(r.points.length,0)
  assert.equal(r.globalWarning,null)
})
