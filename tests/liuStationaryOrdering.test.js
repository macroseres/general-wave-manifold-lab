import test from 'node:test'
import assert from 'node:assert/strict'
import {liuStationaryOrdering} from '../src/math/solution/liuStationaryOrdering.js'
import {refinedLiuInterior} from '../src/math/solution/liuInteriorExtrema.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:4}

test('a refined stationary point below target speed is a Liu violation',()=>{
  const result=liuStationaryOrdering([0,0],[2,0],{status:'refined-candidates',roots:[{status:'refined-candidate',point:[1,0]}]},p)
  assert.equal(result.status,'stationary-liu-violation')
  assert.equal(result.violations.length,1)
  assert.equal(result.passes,false)
})
test('no detected stationary violation is not an admissibility certificate',()=>{
  const result=liuStationaryOrdering([2,0],[0,0],{status:'refined-candidates',roots:[{status:'refined-candidate',point:[1,0]}]},p)
  assert.equal(result.status,'stationary-no-violation-detected')
  assert.equal(result.passes,false)
})
test('unresolved brackets remain inconclusive',()=>{
  const result=liuStationaryOrdering([2,0],[0,0],{status:'partially-refined',unresolved:1,roots:[]},p)
  assert.equal(result.status,'stationary-inconclusive')
})
test('near-zero samples are not treated as refined extrema',()=>{
  const result=liuStationaryOrdering([0,0],[2,0],{status:'refined-candidates',roots:[{status:'near-zero-sample',point:[1,0]}]},p)
  assert.equal(result.checked.length,0)
})
test('interior Liu diagnostics expose stationary comparison',()=>{
  const result=refinedLiuInterior([2,0],[[2,0],[1,0],[0,0]],p,{depth:1})
  assert.ok(result.stationaryOrdering)
  assert.equal(result.stationaryOrdering.passes,false)
})
