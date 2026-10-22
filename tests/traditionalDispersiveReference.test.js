import test from 'node:test'
import assert from 'node:assert/strict'
import {dispersiveReference,verifyTraditionalReference} from '../scripts/verify-traditional-reference.mjs'

test('traditional diffusive-dispersive reference satisfies RH, profile ODE and entropy',()=>{
  const report=verifyTraditionalReference()
  assert.equal(report.profiles,3)
  assert.equal(report.profilePoints,183)
})

test('traditional nonclassical example requires its declared coefficient and amplitude regime',()=>{
  for(const options of [{nu:0},{delta:0},{A:.1}])
    assert.throws(()=>dispersiveReference(options),/Require/)
  const a=dispersiveReference({nu:1}),b=dispersiveReference({nu:2})
  assert.notEqual(a.B,b.B)
})
