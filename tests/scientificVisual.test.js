import test from 'node:test'
import assert from 'node:assert/strict'
import { createScientificVisualIdentity, scientificMarkerGeometry } from '../src/config/scientificVisual.js'

test('mantém identidade matemática distinta da projeção e da geometria', () => {
  const a = createScientificVisualIdentity({ id: 'curva-a', kind: 'curve', sourceId: 'original', projectionSide: 'minus' })
  const b = createScientificVisualIdentity({ id: 'curva-b', kind: 'curve', sourceId: 'original', projectionSide: 'plus' })
  assert.notEqual(a.id, b.id)
  assert.equal(a.sourceId, b.sourceId)
  assert.equal(a.projectionSide, 'minus')
  assert.equal(b.projectionSide, 'plus')
  assert.equal(a.family, 'none')
})
test('não aceita categorias não auditadas', () => {
  assert.throws(() => createScientificVisualIdentity({ id: 'a', kind: 'volume' }))
  assert.throws(() => createScientificVisualIdentity({ id: '', kind: 'curve' }))
})
test('marcadores 2D e 3D têm correspondência declarada', () => {
  assert.equal(scientificMarkerGeometry.square.three, 'box')
  assert.equal(scientificMarkerGeometry.diamond.three, 'octahedron')
})
