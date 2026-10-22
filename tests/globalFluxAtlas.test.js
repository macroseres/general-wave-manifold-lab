import test from 'node:test'
import assert from 'node:assert/strict'
import { globalFluxAtlas } from '../src/math/flux/globalFluxAtlas.js'
import { quadraticAtlasData } from '../src/math/flux/scalarStratification.js'
import { coefficientKeys, transformQuadraticFlux } from '../src/math/flux/affineClassification.js'
import { flux } from '../src/math/flux/quadraticFlux.js'
import { discriminant } from '../src/math/characteristic/spectrum.js'

const fromPair = (t, [A, B, C, D], L = [2, 3, 5, -2]) => ({
  a20: (2 * t - B) / 6, a11: -C / 3, a02: -D / 2,
  b20: A / 2, b11: (t + B) / 3, b02: C / 6,
  a10: L[0], a01: L[1], b10: L[2], b01: L[3],
})
const fixtures = [
  ['trace-cubic', fromPair(3, [1, 2, 3, 1])],
  ['trace-cubic', fromPair(3, [0, 6, 0, -1])],
  ['trace-cubic', fromPair(3, [0, 1.5, 0, 1])],
  ['trace-cubic', fromPair(3, [0, 1.5, 0, -1])],
  ['trace-quadratic', fromPair(3, [2, 0, 3, 0])],
  ['trace-linear', fromPair(3, [1, 6, 0, 0])],
  ['trace-linear', fromPair(3, [0, 1.5, 0, 0])],
  ['trace-linear', fromPair(3, [0, -3, 0, 0])],
  ['trace-constant', fromPair(3, [2, 0, 0, 0])],
  ['trace-radial', fromPair(3, [0, 0, 0, 0])],
  ['traceless-three-real', fromPair(0, [0, 3, -3, 0])],
  ['traceless-one-real', fromPair(0, [3, 0, 3, 0])],
  ['traceless-double', fromPair(0, [0, 3, 0, 0])],
  ['traceless-triple', fromPair(0, [3, 0, 0, 0])],
]
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`)
const apply = (A, v) => A.map(row => row[0] * v[0] + row[1] * v[1])

test('exact binary-cubic data separates projective root types and trace branches', () => {
  assert.equal(quadraticAtlasData(fixtures[10][1]).rootType, 'three-real')
  assert.equal(quadraticAtlasData(fixtures[11][1]).rootType, 'one-real')
  assert.equal(quadraticAtlasData(fixtures[12][1]).rootType, 'double')
  assert.equal(quadraticAtlasData(fixtures[13][1]).rootType, 'triple')
  assert.equal(quadraticAtlasData(fixtures[9][1]).cubicZero, true)
})

test('canonical rational quadratic coefficients preserve trace and repeated-root strata', () => {
  for (const [family, p] of fixtures) {
    const result = globalFluxAtlas(p)
    assert.equal(result.status, 'normalized', result.reason)
    const data = quadraticAtlasData({ ...p, ...result.canonicalQuadraticCoefficients })
    assert.equal(data.traceZero, family.startsWith('traceless-'))
    if (family.startsWith('traceless-')) assert.equal(data.rootType, result.exactQuadraticData.rootType)
    if (family === 'trace-radial') assert.equal(data.cubicZero, true)
  }
})

test('every quadratic family and rank-one exceptional family has a normal representative', () => {
  for (const [family, p] of fixtures) {
    const result = globalFluxAtlas(p)
    assert.equal(result.status, 'normalized', `${family}: ${result.reason}`)
    assert.equal(result.family, family)
  }
})

test('all quadratic charts return transformations that reconstruct the full original flux', () => {
  for (const [family, p] of fixtures) {
    const result = globalFluxAtlas(p)
    assert.equal(result.status, 'normalized', `${family}: ${result.reason}`)
    const { A, translation: u, positiveSpeedScale: k, speedShift: d } = result.transformation
    assert.ok(k > 0)
    for (const V of [[0, 0], [1, -2], [-0.3, 0.7]]) {
      const U = apply(A, V).map((x, i) => x + u[i]), base = flux(u, p)
      const direct = apply(result.inverseStateMatrix, flux(U, p).map((x, i) => x - base[i])).map((x, i) => k * x - d * V[i])
      flux(V, result.coefficients).forEach((x, i) => near(x, direct[i]))
      near(discriminant(V, result.coefficients), k * k * discriminant(U, p))
    }
  }
})

test('normal representatives agree after integer unimodular coordinate changes and translations', () => {
  for (const [family, p] of fixtures) {
    const baseline = globalFluxAtlas(p)
    for (const A of [[[1, 2], [0, 1]], [[0, 1], [1, 0]], [[0, -1], [1, 0]]]) {
      const moved = transformQuadraticFlux(p, A, [2, -1]).coefficients
      for (const key of coefficientKeys) moved[key] *= 2
      moved.a10 -= 3; moved.b01 -= 3
      const result = globalFluxAtlas(moved)
      assert.equal(result.status, 'normalized', `${family}: ${result.reason}`)
      assert.equal(result.family, baseline.family)
      assert.equal(result.residualClass, baseline.residualClass, family)
      for (const key of coefficientKeys) {
        try { near(result.coefficients[key], baseline.coefficients[key]) }
        catch (error) { throw new Error(`${family} ${key}: ${error.message}`) }
      }
    }
  }
})

test('all four linear classes are normalized with reconstruction', () => {
  for (const L of [[2, 0, 0, 2], [2, 0, 0, -2], [0, -2, 2, 0], [3, 2, 0, 3]]) {
    const p = fromPair(0, [0, 0, 0, 0], L), result = globalFluxAtlas(p)
    assert.equal(result.status, 'normalized', result.reason)
    assert.equal(result.family, 'linear')
    const again = globalFluxAtlas(result.coefficients)
    assert.equal(again.residualClass, result.residualClass)
  }
})

test('rank-one exceptional quotients distinguish every discrete residual class', () => {
  const cases = [
    { t: 1, P: [0, 0.5, 0, 0], values: [
      [[0, 0, 0, 0], 'zero'], [[0, 1, 0, 0], 'upper'],
      ...[-1, 1].flatMap(x => [0, 1].map(y => [[x, y, 0, -x], `diagonal-${x}-upper-${y}`])),
    ] },
    { t: 1, P: [0, -1, 0, 0], values: [
      [[0, 0, 0, 0], 'zero'], [[0, 1, 0, 0], 'upper'], [[0, 0, 1, 0], 'lower'],
      [[0, 1, 1, 0], 'product-positive'], [[0, 1, -1, 0], 'product-negative'],
    ] },
    { t: 0, P: [1, 0, 0, 0], values: [
      [[0, 0, 0, 0], 'zero'], [[0, 1, 0, 0], 'upper'],
      [[1, 0, 0, -1], 'positive'], [[-1, 0, 0, 1], 'negative'],
    ] },
  ]
  for (const { t, P, values } of cases) for (const [L, expected] of values) {
    const p = fromPair(t, P, L), baseline = globalFluxAtlas(p)
    assert.equal(baseline.status, 'normalized', baseline.reason)
    assert.equal(baseline.residualClass, expected)
    for (const A of [[[0, 1], [1, 0]], [[1, 2], [0, 1]]]) {
      const result = globalFluxAtlas(transformQuadraticFlux(p, A, [2, -1]).coefficients)
      if (result.status === 'ill-conditioned') {
        // A rounded change of basis can make an exact axis indistinguishable from a tiny nonzero coordinate.
        assert.equal(result.reason, 'residual-axis-unresolved')
        assert.ok(['upper', 'lower', 'positive', 'negative', 'diagonal-1-upper-0', 'diagonal--1-upper-0'].includes(expected))
        assert.equal(result.residualClass, undefined)
        continue
      }
      assert.equal(result.status, 'normalized', result.reason)
      assert.equal(result.residualClass, expected)
      for (const key of coefficientKeys) near(result.coefficients[key], baseline.coefficients[key])
    }
  }
})

test('small nonzero exceptional coordinates are inconclusive at every common positive scale', () => {
  for (const [t, P, L] of [
    [1, [0, 0.5, 0, 0], [1, 1e-10, 0, -1]],
    [1, [0, 0.5, 0, 0], [1e-10, 1, 0, -1e-10]],
    [1, [0, -1, 0, 0], [0, 1, 1e-10, 0]],
    [0, [1, 0, 0, 0], [1, 1e-10, 0, -1]],
  ]) for (const k of [1e-12, 1, 100, 1e12]) {
    const result = globalFluxAtlas(fromPair(t, P, L.map(x => k * x)))
    assert.equal(result.status, 'ill-conditioned')
    assert.equal(result.reason, 'residual-axis-unresolved')
    assert.equal(result.residualClass, undefined)
    assert.equal(result.coefficients, undefined)
  }
})

test('exact axes and resolved nonzero coordinates keep their classes even at small common scales', () => {
  for (const [L, expected] of [
    [[1, 0, 0, -1], 'diagonal-1-upper-0'],
    [[1, 0.5, 0, -1], 'diagonal-1-upper-1'],
    [[0, 1, 0, 0], 'upper'],
  ]) for (const k of [1e-12, 1, 100, 1e12]) {
    const result = globalFluxAtlas(fromPair(1, [0, 0.5, 0, 0], L.map(x => k * x)))
    assert.equal(result.status, 'normalized', result.reason)
    assert.equal(result.residualClass, expected)
  }
})

test('rank-one cubic quotients retain the continuous semicircle invariant', () => {
  for (const delta of [-1, 1]) for (const [x, u] of [[0, 0], [-1, 0], [1, 0], [0, 1], [3, 4]]) {
    const p = fromPair(1, [0, 0.5, 0, delta], [x, delta * u, u / 2, -x])
    const baseline = globalFluxAtlas(p)
    assert.equal(baseline.status, 'normalized', baseline.reason)
    if (x || u) near(baseline.parameters.linearAngle, x / Math.hypot(x, u))
    const moved = transformQuadraticFlux(p, [[0, 1], [1, 0]], [1, -2]).coefficients
    const result = globalFluxAtlas(moved)
    assert.equal(result.status, 'normalized', result.reason)
    for (const key of coefficientKeys) near(result.coefficients[key], baseline.coefficients[key])
  }
})

test('non-generic homogeneous families stay homogeneous after changing the center', () => {
  for (const [family, p] of fixtures) {
    const homogeneous = { ...p, a10: 0, a01: 0, b10: 0, b01: 0 }
    // Integer/half-integer fixtures keep this translated identity exact as supplied decimals.
    if (!Object.values(homogeneous).every(x => Number.isInteger(2 * x))) continue
    const moved = transformQuadraticFlux(homogeneous, [[0, 1], [1, 0]], [2, -1]).coefficients
    const result = globalFluxAtlas(moved)
    assert.equal(result.status, 'normalized', `${family}: ${result.reason}`)
    for (const key of ['a10', 'a01', 'b10', 'b01']) near(result.coefficients[key], 0)
  }
})
