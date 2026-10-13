/**
 * Canonical state roles used by the wave-manifold kernel.
 *
 * U* is a generic state-space probe: neither left nor right by itself.
 * (UL,UR) are global Riemann data.
 * (U-,U+) are local, moving endpoint states attached to P in W.
 */
import { projectLeft, projectRight } from './projections.js'

export function genericState(U) {
  const q = Array.isArray(U) ? U : [U?.u, U?.v]
  return { kind: 'generic-state', U: [Number(q[0]), Number(q[1])] }
}

export function riemannData(UL, UR) {
  return { kind: 'riemann-data', UL: genericState(UL).U, UR: genericState(UR).U }
}

export function localEndpointStates(P) {
  const minus = projectLeft(P), plus = projectRight(P)
  if (!minus || !plus) return null
  return {
    kind: 'local-endpoints',
    minus: [minus.u, minus.v],
    plus: [plus.u, plus.v],
  }
}

/** A generic U* has both inverse images; no orientation is imposed on U*. */
export function genericInverseImages(U) {
  const state = genericState(U).U
  return {
    forward: { projection: 'minus', fixedRole: 'U*', fixedState: state },
    backward: { projection: 'plus', fixedRole: 'U*', fixedState: state },
  }
}

/** Riemann orientation: waves leave UL through pi_- and arrive at UR through pi_+. */
export function riemannInverseImages(UL, UR) {
  const data = riemannData(UL, UR)
  return {
    forward: { projection: 'minus', fixedRole: 'UL', fixedState: data.UL },
    backward: { projection: 'plus', fixedRole: 'UR', fixedState: data.UR },
  }
}
