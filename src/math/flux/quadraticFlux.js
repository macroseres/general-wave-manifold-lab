/**
 * General quadratic flux F: R² -> R² and its Jacobian.
 *
 * This module is intentionally pure: no geometry, chart, numerical integration,
 * rendering, or UI dependencies belong here.
 */
export const oldWavePreset = ({ B1 = 8, B2 = 0.2, a = 0, c = 1 } = {}) => ({
  a20: (B1 + 1) / 2,
  a11: 0,
  a02: 1 / 2,
  a10: a,
  a01: 0,
  b20: 0,
  b11: 1,
  b02: -B2 / 2,
  b10: c,
  b01: a,
})

export const defaultCoefficients = oldWavePreset()

export function flux(U, p) {
  const [u, v] = U
  return [
    p.a20 * u * u + p.a11 * u * v + p.a02 * v * v + p.a10 * u + p.a01 * v,
    p.b20 * u * u + p.b11 * u * v + p.b02 * v * v + p.b10 * u + p.b01 * v,
  ]
}

export function jacobian(U, p) {
  const [u, v] = U
  return [
    [2 * p.a20 * u + p.a11 * v + p.a10, p.a11 * u + 2 * p.a02 * v + p.a01],
    [2 * p.b20 * u + p.b11 * v + p.b10, p.b11 * u + 2 * p.b02 * v + p.b01],
  ]
}
