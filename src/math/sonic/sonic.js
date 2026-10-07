import { jacobian } from '../flux/quadraticFlux.js'
import { waveState } from '../manifold/waveState.js'

export function det2(M) {
  return M[0][0] * M[1][1] - M[0][1] * M[1][0]
}

export function directionalJacobian(z, p) {
  return [
    [2 * p.a20 * z + p.a11, p.a11 * z + 2 * p.a02],
    [2 * p.b20 * z + p.b11, p.b11 * z + 2 * p.b02],
  ]
}

export function sonicData(tau, z, p, eps = 1e-10) {
  const state = waveState(tau, 0, z, p)
  if (state.kind !== 'regular') return { ...state, kind: state.kind }

  const J = jacobian(state.Ubar, p)
  const M = directionalJacobian(z, p)
  const s = state.s
  const A = [
    [J[0][0] - s, J[0][1]],
    [J[1][0], J[1][1] - s],
  ]
  const K = A[0][0] * M[1][1] + M[0][0] * A[1][1]
    - A[0][1] * M[1][0] - M[0][1] * A[1][0]
  const detM = det2(M)

  if (Math.abs(detM) > eps) {
    return {
      ...state,
      kind: 'regular',
      K,
      detM,
      yMinus: 2 * K / detM,
      yPlus: -2 * K / detM,
      exceptional: false,
    }
  }

  return {
    ...state,
    kind: 'regular',
    K,
    detM,
    yMinus: null,
    yPlus: null,
    exceptional: Math.abs(K) <= eps,
  }
}

export function sonicImplicit(tau, Y, z, p, side) {
  const d = sonicData(tau, z, p)
  if (d.kind !== 'regular') return NaN
  return side === 'minus' ? Y * d.detM - 2 * d.K : Y * d.detM + 2 * d.K
}

export function sonicResidual(tau, Y, z, p, side) {
  const state = waveState(tau, Y, z, p)
  if (state.kind !== 'regular') return Infinity
  const U = side === 'minus' ? state.Um : state.Up
  const J = jacobian(U, p)
  const s = state.s
  return Math.abs((J[0][0] - s) * (J[1][1] - s) - J[0][1] * J[1][0])
}
