import test from 'node:test'
import assert from 'node:assert/strict'
import {curvePoints3D} from '../src/rendering/curvePoints.js'

test('rarefaction orbit on characteristic surface has finite 3D coordinates',()=>{
  const orbit=[{tau:-1,zc:-0.2},{tau:1,zc:0.3}]
  const points=curvePoints3D(orbit.map(q=>({...q,Y:0})),'tauYzc',{yOffset:0.026})
  assert.deepEqual(points,[[-1,0.026,-0.2],[1,0.026,0.3]])
  assert.ok(points.flat().every(Number.isFinite))
})
