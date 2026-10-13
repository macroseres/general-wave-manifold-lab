import test from 'node:test'
import assert from 'node:assert/strict'
import { stitchBtSegments, smoothBtSegments } from '../src/geometry/sonic/smoothBtCurve.js'
import { defaultCoefficients } from '../src/math/flux/quadraticFlux.js'

test('BT segments are stitched without joining disconnected branches', () => {
  const segments = [
    [[1,0,0],[2,0,0]], [[0,0,0],[1,0,0]],
    [[5,0,0],[6,0,0]],
  ]
  const paths = stitchBtSegments(segments)
  assert.deepEqual(paths.map(p=>p.length).sort((a,b)=>a-b),[2,3])
})

test('BT smoothing preserves segment endpoints and never adds unprojected points', () => {
  const a=[0,0,-0.3],b=[0.1,0,-0.2]
  const paths=smoothBtSegments([[a,b]],defaultCoefficients,'minus',5)
  assert.equal(paths.length,1)
  assert.deepEqual(paths[0][0],a)
  assert.deepEqual(paths[0].at(-1),b)
  assert.ok(paths[0].every(q=>q.every(Number.isFinite)))
})
