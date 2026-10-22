import test from 'node:test'
import assert from 'node:assert/strict'
import { genericNormalForm } from '../src/math/flux/genericNormalForm.js'
import { coefficientKeys, transformQuadraticFlux } from '../src/math/flux/affineClassification.js'
import { flux } from '../src/math/flux/quadraticFlux.js'
import { discriminant } from '../src/math/characteristic/spectrum.js'

const source = { a20: 1, a11: 0.3, a02: 0.7, b20: 0.2, b11: 1.2, b02: -0.4,
  a10: 0.6, a01: -0.3, b10: 0.8, b01: -0.2 }
const near = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`)
const apply = (A, x) => A.map(row => row[0] * x[0] + row[1] * x[1])

test('generic frame reduces the quadratic tensor to two continuous parameters', () => {
  const result = genericNormalForm(source)
  assert.equal(result.status, 'normalized')
  const { a, b } = result.parameters, p = result.coefficients
  near(p.a20, a / 2); near(p.b20, 1 / 2)
  near(p.a11, b); near(p.b11, 1 - a)
  near(p.a02, -a * b / 2); near(p.b02, -b / 2)
  assert.ok(result.canonicalResidual < 1e-10)
})

test('normal representative is invariant under affine states and positive speed changes', () => {
  const baseline = genericNormalForm(source)
  for (const A of [[[1, 2], [0, 1]], [[0, -1], [1, 0]], [[2, 1], [1, -1]]]) {
    for (const k of [0.5, 2, 3]) {
      const p = transformQuadraticFlux(source, A, [2, -1]).coefficients
      for (const key of coefficientKeys) p[key] *= k
      p.a10 -= 3; p.b01 -= 3
      const target = genericNormalForm(p)
      assert.equal(target.status, 'normalized')
      for (const key of coefficientKeys) near(target.coefficients[key], baseline.coefficients[key])
      assert.equal(target.parameters.linearSign, baseline.parameters.linearSign)
    }
  }
})

test('returned transformation reconstructs the flux, spectrum and inverse states', () => {
  const result = genericNormalForm(source), { A, translation: U0, positiveSpeedScale: k, speedShift: d } = result.transformation
  const inv = result.inverseTransformation.A, determinant = A[0][0] * A[1][1] - A[0][1] * A[1][0]
  assert.notEqual(determinant, 0); assert.ok(k > 0)
  for (const V of [[0, 0], [1, -2], [-3, 4], [0.3, 0.7]]) {
    const U = apply(A, V).map((x, i) => x + U0[i]), F0 = flux(U0, source)
    const direct = apply(inv, flux(U, source).map((x, i) => x - F0[i])).map((x, i) => k * x - d * V[i])
    flux(V, result.coefficients).forEach((x, i) => near(x, direct[i]))
    near(discriminant(V, result.coefficients), k * k * discriminant(U, source))
    apply(inv, U.map((x, i) => x - U0[i])).forEach((x, i) => near(x, V[i]))
  }
})

test('homogeneous flows and exact affine translates keep zero residual linear part', () => {
  const p = { a20: 1, a11: 1, a02: 2, b20: 1, b11: 3, b02: 1, a10: 0, a01: 0, b10: 0, b01: 0 }
  const baseline = genericNormalForm(p)
  assert.equal(baseline.status, 'normalized')
  assert.equal(baseline.parameters.linearSign, 0)
  const moved = transformQuadraticFlux(p, [[1, 2], [0, 1]], [2, -3]).coefficients
  const result = genericNormalForm(moved)
  assert.equal(result.status, 'normalized')
  for (const key of coefficientKeys) near(result.coefficients[key], baseline.coefficients[key])
  for (const key of ['a10', 'a01', 'b10', 'b01']) assert.equal(result.coefficients[key], 0)
})

test('exceptional and linear sectors are reported rather than forced into the generic chart', () => {
  const z = Object.fromEntries(coefficientKeys.map(key => [key, 0]))
  for (const p of [z, { ...z, a20: 1 }, { ...z, a20: 1, b11: -2 }]) {
    assert.equal(genericNormalForm(p).status, 'outside-chart-or-ill-conditioned')
  }
  assert.throws(() => genericNormalForm({ ...source, a20: Infinity }))
  assert.throws(() => genericNormalForm(source, 0))
})

test('normalization is idempotent away from exceptional surfaces', () => {
  const first = genericNormalForm(source), second = genericNormalForm(first.coefficients)
  assert.equal(second.status, 'normalized')
  for (const key of coefficientKeys) near(first.coefficients[key], second.coefficients[key])
})

test('opposite centered linear obstructions retain distinct signs under positive speed scaling', () => {
  const opposite = { ...source }
  for (const key of ['a10', 'a01', 'b10', 'b01']) opposite[key] *= -1
  const first = genericNormalForm(source), second = genericNormalForm(opposite)
  assert.equal(second.status, 'normalized')
  near(first.parameters.a, second.parameters.a)
  near(first.parameters.b, second.parameters.b)
  assert.equal(first.parameters.linearSign, -second.parameters.linearSign)
  for (const key of ['a10', 'a01', 'b10', 'b01']) near(first.coefficients[key], -second.coefficients[key])
})
