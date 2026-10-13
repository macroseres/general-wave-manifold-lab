import { characteristicProjectiveFiber } from './chartAudit.js'

/** Local algebraic audit of a projective fiber, without sampling nearby states.
 * P,Q,R are quadratic polynomials in the selected projective coordinate.
 * Their common vanishing order is exact up to floating-point coefficient tolerance.
 * No geometry is manufactured for an exceptional fiber.
 */
export function exceptionalFiberNeighborhood(z, p, tolerance = 1e-10) {
  const fiber = characteristicProjectiveFiber(z, p)
  if (fiber.kind === 'invalid') return { ...fiber, order: null, localType: 'invalid' }
  const reciprocal = fiber.chart === 'reciprocal'
  const x = reciprocal ? 0 : z
  const c = reciprocal
    ? [
      [2 * p.b20, p.b11 - 2 * p.a20, -p.a11],
      [p.b11, 2 * p.b02 - p.a11, -2 * p.a02],
      [p.b10, p.b01 - p.a10, -p.a01],
    ]
    : [
      [-p.a11, p.b11 - 2 * p.a20, 2 * p.b20],
      [-2 * p.a02, 2 * p.b02 - p.a11, p.b11],
      [-p.a01, p.b01 - p.a10, p.b10],
    ]
  // Evaluate the coefficients of the Taylor expansion at x; this is not
  // another evaluation of the Jacobian or the characteristic spectrum.
  const taylor = c.map(([a,b,d]) => [a + b*x + d*x*x, b + 2*d*x, d])
  const scale = Math.max(1, ...c.flat().map(Math.abs))
  const nonzero = v => Math.abs(v) > tolerance * scale
  const order = [0,1,2].find(k => taylor.some(row => nonzero(row[k]))) ?? Infinity
  const localType = fiber.kind === 'regular' ? 'regular'
    : order === Infinity ? 'persistent-exceptional'
    : order === 0 ? 'nonvanishing-equation'
    : 'isolated-exceptional'
  return { ...fiber, order, localType, taylor,
    leadingCoefficients: Number.isFinite(order) ? taylor.map(row => row[order]) : [0,0,0] }
}
