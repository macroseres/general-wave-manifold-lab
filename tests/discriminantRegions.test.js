import test from 'node:test'
import assert from 'node:assert/strict'
import {stateDiscriminant,sampleDiscriminantRegions} from '../src/math/characteristic/discriminantRegions.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
const window={uMin:-2,uMax:2,vMin:-2,vMax:2}
test('discriminant equals trace squared minus four determinant',()=>{
  const p={...defaultCoefficients,a20:1,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0}
  assert.equal(stateDiscriminant([2,1],p),16)
})
test('constant positive discriminant produces only hyperbolic cells',()=>{
  const p={...defaultCoefficients,a20:0,a11:0,a02:0,a10:1,a01:0,b20:0,b11:0,b02:0,b10:0,b01:-1}
  const r=sampleDiscriminantRegions(p,window,{steps:8})
  assert.equal(r.cells.length,64);assert.equal(r.segments.length,0)
  assert.ok(r.cells.every(c=>c.kind==='hyperbolic'))
})
test('elliptic constant Jacobian produces elliptic cells',()=>{
  const p={...defaultCoefficients,a20:0,a11:0,a02:0,a10:0,a01:-1,b20:0,b11:0,b02:0,b10:1,b01:0}
  assert.ok(sampleDiscriminantRegions(p,window,{steps:8}).cells.every(c=>c.kind==='elliptic'))
})
test('crossing the parabolic boundary produces contour segments',()=>{
  const p={...defaultCoefficients,a20:0,a11:0,a02:0,a10:0,a01:1,b20:.5,b11:0,b02:0,b10:0,b01:0}
  const r=sampleDiscriminantRegions(p,window,{steps:15})
  assert.ok(r.cells.some(c=>c.kind==='elliptic'))
  assert.ok(r.cells.some(c=>c.kind==='hyperbolic'))
  assert.ok(r.segments.length>0)
  assert.ok(r.segments.flat().every(q=>Math.abs(q.u)<.3))
})
test('adaptive contour follows the curved discriminant zero set',()=>{
  const r=sampleDiscriminantRegions(defaultCoefficients,window,{steps:16})
  assert.ok(r.segments.length>0)
  assert.ok(r.segments.some(segment=>segment.length>2),'curved segments should be refined')
  const residuals=r.segments.flat().map(q=>Math.abs(stateDiscriminant([q.u,q.v],defaultCoefficients)))
  assert.ok(Math.max(...residuals)<.02,`maximum contour residual: ${Math.max(...residuals)}`)
})
