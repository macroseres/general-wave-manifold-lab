import test from 'node:test'
import assert from 'node:assert/strict'
import { scientificCurveStyle, SCIENTIFIC_CURVE_RULES, scientificLocusKind } from '../src/config/scientificCurveRules.js'

test('estilos 2D e 3D compartilham categorias, não unidades de largura', () => {
  for (const kind of Object.keys(SCIENTIFIC_CURVE_RULES)) {
    assert.ok(scientificCurveStyle(kind, '2d').strokeWidth > 0)
    assert.ok(scientificCurveStyle(kind, '3d').lineWidth > 0)
  }
})
test('curva principal contínua; auxiliar tracejada; seleção sem mudança semântica de cor', () => {
  assert.equal(scientificCurveStyle('primary', '2d').strokeDasharray, undefined)
  assert.equal(scientificCurveStyle('auxiliary', '2d').strokeDasharray, '7 5')
  assert.equal(scientificCurveStyle('auxiliary', '3d').dashed, true)
  assert.equal(scientificCurveStyle('selected', '3d').color, undefined)
})

test('loci especiais distinguem-se por espessura sem mudar cor ou tracejar', () => {
  assert.equal(scientificLocusKind('DS'), 'specialLocus')
  assert.equal(scientificLocusKind('E'), 'locus')
  assert.equal(scientificCurveStyle(scientificLocusKind('DS'),'2d').strokeDasharray, undefined)
  assert.ok(scientificCurveStyle('specialLocus','3d').lineWidth > scientificCurveStyle('locus','3d').lineWidth)
})
test('famílias integrais usam padrões diferentes nas duas dimensões', () => {
  assert.notEqual(scientificCurveStyle('integralSlow','2d').strokeDasharray, scientificCurveStyle('integralFast','2d').strokeDasharray)
  assert.notEqual(scientificCurveStyle('integralSlow','3d').dashSize, scientificCurveStyle('integralFast','3d').dashSize)
})
