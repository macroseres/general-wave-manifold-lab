import test from 'node:test'
import assert from 'node:assert/strict'
import {stateMarkerShape, STATE_MARKER_SHAPES_3D} from '../src/config/scientificMarkerRules.js'

test('U_L e U_R distinguem-se por forma sem depender da cor', () => {
  assert.equal(stateMarkerShape('left'), 'circle')
  assert.equal(stateMarkerShape('right'), 'diamond')
  assert.equal(STATE_MARKER_SHAPES_3D.left, 'sphere')
  assert.equal(STATE_MARKER_SHAPES_3D.right, 'octahedron')
})
test('estado desconhecido não recebe semântica por aproximação', () => {
  assert.throws(() => stateMarkerShape('other'))
})
