/**
 * Wave-manifold state in the finite z chart and exact algebraic residuals.
 *
 * No rendering or numerical integration belongs in this module.
 */
import { flux, jacobian } from '../flux/quadraticFlux.js'
import { fiber } from '../charts/zChart.js'

export function waveState(tau, Y, z, p) {
  const f = fiber(z, tau, p)
  if (f.kind !== 'regular') return f

  const r = [z, 1]
  const Um = [f.Ubar[0] - Y * z / 2, f.Ubar[1] - Y / 2]
  const Up = [f.Ubar[0] + Y * z / 2, f.Ubar[1] + Y / 2]
  const J = jacobian(f.Ubar, p)
  const Jr = [J[0][0] * z + J[0][1], J[1][0] * z + J[1][1]]
  const den = 1 + z * z
  const s = (z * Jr[0] + Jr[1]) / den
  return { ...f, r, Um, Up, s }
}

export function discriminant(U, p) {
  const J = jacobian(U, p)
  const A = J[0][0], B = J[0][1], C = J[1][0], D = J[1][1]
  return (A - D) ** 2 + 4 * B * C
}

export function rhResidual(state, p) {
  if (state.kind !== 'regular') return Infinity
  const Fp = flux(state.Up, p), Fm = flux(state.Um, p)
  const du = [state.Up[0] - state.Um[0], state.Up[1] - state.Um[1]]
  return Math.hypot(
    Fp[0] - Fm[0] - state.s * du[0],
    Fp[1] - Fm[1] - state.s * du[1],
  )
}

export function eigenResidual(state, p) {
  if (state.kind !== 'regular') return Infinity
  const J = jacobian(state.Ubar, p)
  const [x, y] = state.r
  return Math.hypot(
    J[0][0] * x + J[0][1] * y - state.s * x,
    J[1][0] * x + J[1][1] * y - state.s * y,
  )
}
