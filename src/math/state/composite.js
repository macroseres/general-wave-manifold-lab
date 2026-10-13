/**
 * Canonical composite-wave construction boundary.
 *
 * K_- is obtained from the forward saturation and the non-trivial minus
 * sonic sheet; K_+ is obtained from the backward saturation and the
 * non-trivial plus sonic sheet.
 *
 * This module defines the construction and membership residual only.  It
 * deliberately does not mesh a saturation or trace a composite curve.
 */
import { sonicImplicit } from '../sonic/sonic.js'

export const COMPOSITE_CONSTRUCTIONS = Object.freeze({
  minus: Object.freeze({
    key: 'minus',
    symbol: 'K_-',
    saturation: 'forward',
    inverseProjection: 'minus',
    sonicSide: 'minus',
  }),
  plus: Object.freeze({
    key: 'plus',
    symbol: 'K_+',
    saturation: 'backward',
    inverseProjection: 'plus',
    sonicSide: 'plus',
  }),
})

export function compositeConstruction(side) {
  const q = COMPOSITE_CONSTRUCTIONS[side]
  if (!q) throw new Error(`unknown composite side: ${side}`)
  return q
}

/** Residual for the non-trivial sonic sheet used by K_side. */
export function compositeSonicResidual(P, p, side) {
  const q = compositeConstruction(side)
  if (!P || !Number.isFinite(P.tau) || !Number.isFinite(P.Y) || !Number.isFinite(P.z)) return Infinity
  const value = sonicImplicit(P.tau, P.Y, P.z, p, q.sonicSide)
  return Number.isFinite(value) ? Math.abs(value) : Infinity
}

export function isOnCompositeSonicSheet(P, p, side, tolerance = 1e-8) {
  return compositeSonicResidual(P, p, side) <= tolerance
}
