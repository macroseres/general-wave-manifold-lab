import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyScalarStratum } from '../src/math/flux/scalarStratification.js'
import { coefficientKeys, transformQuadraticFlux } from '../src/math/flux/affineClassification.js'
import { flux } from '../src/math/flux/quadraticFlux.js'

const p = values => ({ ...Object.fromEntries(coefficientKeys.map(key => [key, 0])), ...values })

test('covers all six feasible scalar-locus strata, including incompatible rank one', () => {
  for (const [coefficients, stratum, dimension] of [
    [p({}), 'rank-0-0', 2], [p({ a10: 1 }), 'rank-0-1', undefined],
    [p({ a02: '1/2' }), 'rank-1-1', 1],
    [p({ a02: '1/2', b10: 1 }), 'rank-1-2', undefined],
    [p({ a20: '3/2', a02: '1/2', b11: 1 }), 'rank-2-2', 0],
    [p({ a20: '3/2', a02: '1/2', b11: 1, b10: 1 }), 'rank-2-3', undefined],
  ]) {
    const result = classifyScalarStratum(coefficients)
    assert.equal(result.stratum, stratum)
    assert.equal(result.scalarLocus?.dimension, dimension)
  }
})

test('recovers the exact scalar center and kernel instead of only reporting rank', () => {
  const result = classifyScalarStratum(p({ a20: 1, b02: 1, a10: -2, b01: 4 }))
  assert.deepEqual(result.scalarLocus, { dimension: 1, origin: ['3', '0'], basis: [['1', '1']] })
})

test('does not discard arbitrarily small nonzero obstructions or quadratic terms', () => {
  assert.equal(classifyScalarStratum(p({ a02: '1e-200', b10: '1e-250' })).stratum, 'rank-1-2')
  assert.equal(classifyScalarStratum(p({ a02: '1e-200' })).linearClass, null)
})

test('homogeneous representative transports the full flux and speed', () => {
  const source = p({ a20: 1, b02: 1, a10: -2, b01: 4 })
  const result = classifyScalarStratum(source).homogeneousRepresentative
  assert.deepEqual(result.translation, ['3', '0'])
  assert.equal(result.speedShift, '4')
  const normalized = Object.fromEntries(Object.entries(result.coefficients).map(([key, value]) => [key, Number(value)]))
  for (const V of [[0, 0], [2, -1], [-3, 4]]) {
    const at = flux([V[0] + 3, V[1]], source), base = flux([3, 0], source)
    assert.deepEqual(flux(V, normalized), at.map((value, i) => value - base[i] - 4 * V[i]))
  }
  assert.equal(classifyScalarStratum(p({ a02: 1, b10: 1 })).homogeneousRepresentative, null)
})

test('classifies all linear sectors under similarity, positive scaling and scalar shifts', () => {
  for (const [values, expected] of [
    [{ a10: 3, b01: 3 }, 'scalar'], [{ a10: 1, b01: -1 }, 'real-distinct'],
    [{ a01: -1, b10: 1 }, 'complex-pair'], [{ a10: 2, b01: 2, a01: 1 }, 'jordan'],
  ]) assert.equal(classifyScalarStratum(p(values)).linearClass, expected)
})

test('scalar stratum survives nonsymmetric affine changes of states', () => {
  for (const values of [{ a20: 2, a02: 1, b11: 2 }, { a20: 2, a02: 1, b11: 2, b10: 1 }, { b02: 1, a10: 3 }]) {
    const source = p(values)
    const target = transformQuadraticFlux(source, [[1, 2], [0, 1]], [2, -3]).coefficients
    assert.equal(classifyScalarStratum(target).stratum, classifyScalarStratum(source).stratum)
  }
})

test('rejects missing, nonfinite and invalid rational coefficients', () => {
  for (const value of [undefined, Infinity, '1/0', 'invalid']) {
    assert.throws(() => classifyScalarStratum(p({ a20: value })))
  }
})
