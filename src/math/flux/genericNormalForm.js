// Intrinsic moving frame on an explicitly restricted generic sector.
// Numerical conditioning gates are not exact algebraic tests of exceptional strata.
import { coefficientKeys } from './affineClassification.js'
import { classifyScalarStratum } from './scalarStratification.js'

const trace = A => A[0][0] + A[1][1]
const det = A => A[0][0] * A[1][1] - A[0][1] * A[1][0]
const scale = (A, k) => A.map(row => row.map(x => k * x))
const product = (A, B) => A.map(row => B[0].map((_, j) => row[0] * B[0][j] + row[1] * B[1][j]))
const apply = (A, x) => A.map(row => row[0] * x[0] + row[1] * x[1])
const inverse = A => scale([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]], 1 / det(A))
const pair = (A, B) => trace(product(A, B))
const traceFree = A => [[(A[0][0] - A[1][1]) / 2, A[0][1]], [A[1][0], (A[1][1] - A[0][0]) / 2]]
const norm = A => Math.max(...A.flat().map(Math.abs))
const wellInvertible = (A, tolerance) => norm(A) > 0 && Math.abs(det(A)) > tolerance * norm(A) ** 2

export function genericNormalForm(p, tolerance = 1e-10) {
  if (!(tolerance > 0 && tolerance < 1)) throw new Error('Tolerância inválida')
  if (!coefficientKeys.every(key => typeof p[key] === 'number' && Number.isFinite(p[key]))) {
    throw new Error('Esta normalização numérica requer dez coeficientes numéricos finitos')
  }
  const scalar = classifyScalarStratum(p)
  const unavailable = reason => ({ status: 'outside-chart-or-ill-conditioned', reason,
    scalarStratum: scalar.stratum, evidence: 'numerical', tolerance })
  const H = x => [
    [2 * p.a20 * x[0] + p.a11 * x[1], p.a11 * x[0] + 2 * p.a02 * x[1]],
    [2 * p.b20 * x[0] + p.b11 * x[1], p.b11 * x[0] + 2 * p.b02 * x[1]],
  ]
  const H1 = H([1, 0]), H2 = H([0, 1]), tau = [trace(H1), trace(H2)]
  if (Math.max(...tau.map(Math.abs)) <= tolerance * Math.max(norm(H1), norm(H2))) return unavailable('trace-covector-zero-or-small')
  const B = [[pair(H1, H1), pair(H1, H2)], [pair(H1, H2), pair(H2, H2)]]
  if (!wellInvertible(B, tolerance)) return unavailable('trace-form-singular-or-ill-conditioned')
  const v = apply(inverse(B), tau), pairing = tau[0] * v[0] + tau[1] * v[1]
  if (Math.abs(pairing) <= tolerance * Math.hypot(...tau) * Math.hypot(...v)) return unavailable('trace-covector-isotropic-or-near')
  const e1 = v.map(x => x / pairing), He1e1 = apply(H(e1), e1)
  const a = tau[0] * He1e1[0] + tau[1] * He1e1[1]
  const e2 = He1e1.map((x, i) => x - a * e1[i])
  const C = [[e1[0], e2[0]], [e1[1], e2[1]]]
  if (!wellInvertible(C, tolerance)) return unavailable('moving-frame-dependent-or-ill-conditioned')
  const S1 = traceFree(H1), S2 = traceFree(H2)
  const G = [[pair(S1, S1), pair(S1, S2)], [pair(S1, S2), pair(S2, S2)]]
  if (!wellInvertible(G, tolerance)) return unavailable('centering-form-singular-or-ill-conditioned')
  const L = [[p.a10, p.a01], [p.b10, p.b01]], L0 = traceFree(L)
  const U0 = apply(inverse(G), [pair(S1, L0), pair(S2, L0)]).map(x => -x)
  const HU0 = H(U0), J0 = L.map((row, i) => row.map((x, j) => x + HU0[i][j]))
  const lambda = trace(J0) / 2, invC = inverse(C)
  const N = product(product(invC, traceFree(J0)), C)
  let residualScale = 1, residualSign = 0, pivot = null
  if (!scalar.homogenizable) {
    // Largest entry avoids a small arbitrary pivot; ties are resolved by fixed order.
    const values = [N[0][0], N[0][1], N[1][0]]
    pivot = values.reduce((best, value, i) => Math.abs(value) > Math.abs(values[best]) ? i : best, 0)
    residualScale = Math.abs(values[pivot])
    if (residualScale <= tolerance * Math.max(norm(L), norm(HU0), Number.MIN_VALUE)) return unavailable('linear-obstruction-below-resolution')
    residualSign = Math.sign(values[pivot])
  }
  const quadratic = (x, y) => apply(invC, apply(H(x), y))
  const q11 = quadratic(e1, e1), q12 = quadratic(e1, e2), q22 = quadratic(e2, e2)
  const linear = scalar.homogenizable ? [[0, 0], [0, 0]] : scale(N, 1 / residualScale)
  const coefficients = {
    a20: q11[0] / 2, a11: q12[0], a02: q22[0] / 2,
    b20: q11[1] / 2, b11: q12[1], b02: q22[1] / 2,
    a10: linear[0][0], a01: linear[0][1], b10: linear[1][0], b01: linear[1][1],
  }
  const A = scale(C, residualScale), k = 1 / residualScale
  if (![...Object.values(coefficients), ...A.flat(), k, ...U0, lambda].every(Number.isFinite)) return unavailable('nonfinite-intermediate-result')
  return {
    status: 'normalized', evidence: 'numerical', tolerance, scalarStratum: scalar.stratum,
    parameters: { a: q11[0], b: q12[0], linearSign: residualSign, linearPivot: pivot },
    coefficients,
    transformation: { A, translation: U0, positiveSpeedScale: k, speedShift: k * lambda },
    inverseTransformation: { A: inverse(A), originalTranslation: U0 },
    conditions: { detB: det(B), tracePairing: pairing, detFrame: det(C), detG: det(G) },
    canonicalResidual: Math.max(Math.abs(q11[1] - 1), Math.abs(q12[1] - (1 - q11[0])),
      Math.abs(q22[1] + q12[0]), Math.abs(q22[0] + q11[0] * q12[0])),
    scope: 'generic affine orbits of fluxes; not a wave-foliation classification',
  }
}
