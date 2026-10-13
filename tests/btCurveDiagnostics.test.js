import test from 'node:test'
import assert from 'node:assert/strict'
import { auditBtPaths } from '../src/geometry/sonic/btCurveDiagnostics.js'
import { btImplicitResidual } from '../src/geometry/sonic/continueBtCurve.js'

const p={a20:-4.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
test('BT diagnostic flags off-locus points without hiding them',()=>{
  const q=[0,0,0]
  const r=btImplicitResidual(q,p)
  assert.ok(r)
  const result=auditBtPaths([[q]],p,{residualTolerance:1e-15})
  assert.equal(result.points,1)
  assert.equal(result.polylines,1)
  assert.equal(result.invalid,Math.max(...r.map(Math.abs))>1e-15?1:0)
})
test('BT diagnostic reports empty geometry without inventing completeness',()=>{
  const result=auditBtPaths([],p)
  assert.equal(result.points,0)
  assert.equal(result.polylines,0)
})
