import test from 'node:test'
import assert from 'node:assert/strict'
import {stateInflectionProjection} from '../src/geometry/sharedProjectedLoci.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'

test('projected inflection extends beyond both viewport edges and follows zoom and pan',()=>{
  for(const [uMin,uMax,vMin,vMax] of [[-5,5,-5,5],[-10,10,-10,10],[2,12,-5,5]]){
    const points=stateInflectionProjection(defaultCoefficients,{uMin,uMax,vMin,vMax}).flat()
    assert.ok(points.length>100)
    assert.ok(points.every(q=>Number.isFinite(q.u)&&Number.isFinite(q.v)))
    assert.ok(Math.min(...points.map(q=>q.u))<uMin)
    assert.ok(Math.max(...points.map(q=>q.u))>uMax)
  }
})
