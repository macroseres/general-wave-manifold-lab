// Reproducible numerical audit of the general formulas in chapter 27.
// Algebraic derivations in the document, rather than sampling, justify exact claims.
import assert from 'node:assert/strict'
import { flux, jacobian } from '../src/math/flux/quadraticFlux.js'
import { coefficientKeys, transformQuadraticFlux } from '../src/math/flux/affineClassification.js'
import { discriminant } from '../src/math/characteristic/spectrum.js'

const near = (a, b) => assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`)
const multiply = (A, x) => A.map(row => row.reduce((s, value, i) => s + value * x[i], 0))
const dot = (a, b) => a.reduce((s, value, i) => s + value * b[i], 0)
const matrices = [[[1, 2], [0, 1]], [[0, -1], [1, 0]], [[2, 1], [1, -1]]]
let comparisons = 0

for (let seed = 1; seed <= 24; seed++) {
  const p = Object.fromEntries(coefficientKeys.map((key, i) => [key, ((seed * (i + 3) + i * i) % 19) - 9]))
  const U0 = [seed / 3, -seed / 5]
  const A = matrices[seed % matrices.length]
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
  const inverse = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]]
  const k = (seed + 1) / 7, d = (seed - 4) / 3
  const transformed = transformQuadraticFlux(p, A, U0)
  const normalized = Object.fromEntries(coefficientKeys.map(key => [key, k * transformed.coefficients[key]]))
  normalized.a10 -= d
  normalized.b01 -= d

  const M = [[p.a11, 2 * p.a02], [2 * p.b20, p.b11], [2 * p.a20 - p.b11, p.a11 - 2 * p.b02]]
  const ell = [p.a01, p.b10, p.a10 - p.b01]
  const H = X => [
    [2 * p.a20 * X[0] + p.a11 * X[1], p.a11 * X[0] + 2 * p.a02 * X[1]],
    [2 * p.b20 * X[0] + p.b11 * X[1], p.b11 * X[0] + 2 * p.b02 * X[1]],
  ]
  const h = [2 * p.a20 - p.b11, p.a11 - 2 * p.b02, p.a10 - p.b01]
  const e = [p.a11, 2 * p.a02, p.a01]
  const f = [2 * p.b20, p.b11, p.b10]
  const C = h.map((hi, i) => h.map((hj, j) => hi * hj + 2 * (e[i] * f[j] + f[i] * e[j])))

  for (const V of [[0, 0], [1, -2], [-0.7, 1.3]]) {
    const U = multiply(A, V).map((value, i) => value + U0[i])
    const J = jacobian(U, p), w = [...U, 1]
    near(dot(w, multiply(C, w)), discriminant(U, p))
    const scalarConditions = multiply(M, U).map((value, i) => value + ell[i])
    scalarConditions.forEach((value, i) => near(value, [J[0][1], J[1][0], J[0][0] - J[1][1]][i]))
    near(discriminant(V, normalized), k * k * discriminant(U, p))
    const direct = multiply(inverse, flux(U, p).map((value, i) => value - flux(U0, p)[i])).map((value, i) => k * value - d * V[i])
    flux(V, normalized).forEach((value, i) => near(value, direct[i]))
    const L = [[p.a10, p.a01], [p.b10, p.b01]], HU0 = H(U0)
    const HV = H(multiply(A, V)), AV = multiply(A, V)
    const tensorQuadratic = multiply(inverse, multiply(HV, AV)).map(value => k * value / 2)
    const tensorLinear = multiply(inverse, multiply(L.map((row, i) => row.map((value, j) => value + HU0[i][j])), AV)).map((value, i) => k * value - d * V[i])
    direct.forEach((value, i) => near(value, tensorQuadratic[i] + tensorLinear[i]))
    comparisons++
  }
}
console.log(`General ten-coefficient atlas: ${comparisons} state comparisons passed (24 fluxes, 3 changes of basis).`)
