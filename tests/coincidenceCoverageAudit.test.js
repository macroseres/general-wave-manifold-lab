import test from 'node:test'
import assert from 'node:assert/strict'
import {auditCoincidenceCoverage} from '../src/math/characteristic/coincidenceCoverageAudit.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
const window={uMin:-3,uMax:3,vMin:-3,vMax:3}
test('reverse audit reports missing projected curves without claiming coverage',()=>{
 const result=auditCoincidenceCoverage([],defaultCoefficients,window)
 for(const side of ['minus','plus']) {
  assert.ok(['no-contour','no-lift'].includes(result[side].status))
  assert.equal(result[side].covered,0)
 }
})
test('reverse audit does not conflate the two projection sides',()=>{
 const loci=[{id:'E',projected:{minus:[[{u:-1,v:0},{u:1,v:0}]],plus:[]}}]
 const result=auditCoincidenceCoverage(loci,defaultCoefficients,window)
 assert.equal(result.plus.projectedSegments,0)
 assert.equal(result.minus.projectedSegments,1)
})
