import test from 'node:test'
import assert from 'node:assert/strict'
import { auditCoincidenceProjection } from '../src/math/characteristic/coincidenceProjectionAudit.js'
import { defaultCoefficients } from '../src/math/flux/quadraticFlux.js'
const window={uMin:-3,uMax:3,vMin:-3,vMax:3}
test('missing coincidence samples are explicitly inconclusive',()=>{
 const result=auditCoincidenceProjection([],defaultCoefficients,window)
 assert.equal(result.minus.status,'no-samples')
 assert.equal(result.plus.status,'no-samples')
})
test('audit checks both projections independently and rejects non-finite samples',()=>{
 const e=[{id:'E',projected:{minus:[[{u:0,v:0}]],plus:[[{u:NaN,v:0}]]}}]
 const result=auditCoincidenceProjection(e,defaultCoefficients,window)
 assert.equal(result.minus.samples,1)
 assert.equal(result.plus.invalid,1)
 assert.equal(result.plus.status,'no-samples')
})
