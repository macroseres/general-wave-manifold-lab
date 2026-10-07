/**
 * Complementary projective chart Z=1/z for the characteristic direction.
 *
 * The finite-chart fiber equation is homogenized by Z^2. With
 * eta=tau/Z^2 (equivalently tau=eta Z^2), the same physical state is
 * represented regularly at Z=0.
 */
export function ZChartCoefficients(Z, p) {
  return {
    P: 2 * p.b20 + (p.b11 - 2 * p.a20) * Z - p.a11 * Z * Z,
    Q: p.b11 + (2 * p.b02 - p.a11) * Z - 2 * p.a02 * Z * Z,
    R: p.b10 + (p.b01 - p.a10) * Z - p.a01 * Z * Z,
  }
}

export function fiberZ(Z, eta, p, eps = 1e-10) {
  const { P, Q, R } = ZChartCoefficients(Z, p)
  const D = P * P + Q * Q
  if (D <= eps * eps) return { kind: Math.abs(R) > eps ? 'absent' : 'degenerate', P, Q, R, D }

  const base = [-R * P / D, -R * Q / D]
  const tangent = [-Q, P]
  return {
    kind: 'regular', P, Q, R, D, base, tangent,
    Ubar: [base[0] + eta * tangent[0], base[1] + eta * tangent[1]],
  }
}
