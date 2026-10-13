import { sonicData, sonicImplicit } from './sonic.js'
import { quadraticRoots } from '../numerics/polynomialRoots.js'

/** Canonical implicit data for the intersection of the two nontrivial sonic sheets.
 * Phi_- = Y detM - 2K, Phi_+ = Y detM + 2K.
 * Away from C (Y != 0), Phi_-=Phi_+=0 iff K=detM=0: the double-sonic locus DS.
 * On C (Y=0), their common intersection is K=0: the inflection locus J.
 */
export function sonicIntersectionData(tau, Y, z, p) {
  const d = sonicData(tau, z, p)
  if (d.kind !== 'regular') return { ...d, phiMinus: NaN, phiPlus: NaN }
  return {
    ...d,
    Y,
    phiMinus: sonicImplicit(tau, Y, z, p, 'minus'),
    phiPlus: sonicImplicit(tau, Y, z, p, 'plus'),
  }
}

export function doubleSonicBaseResidual(tau, z, p) {
  const d = sonicData(tau, z, p)
  return d.kind === 'regular' ? Math.hypot(d.K, d.detM) : Infinity
}

export function doubleSonicResidual(tau, Y, z, p) {
  if (Y === 0) return Infinity
  const d = sonicIntersectionData(tau, Y, z, p)
  return Number.isFinite(d.phiMinus) && Number.isFinite(d.phiPlus)
    ? Math.hypot(d.phiMinus, d.phiPlus)
    : Infinity
}

export function inflectionResidual(tau, z, p) {
  const d = sonicData(tau, z, p)
  return d.kind === 'regular' ? Math.abs(d.K) : Infinity
}


/** Real finite projective directions where det(M)=0 for a general quadratic flux. */
export function doubleSonicDirections(p) {
  const A = 2 * (p.a20 * p.b11 - p.a11 * p.b20)
  const B = 4 * (p.a20 * p.b02 - p.a02 * p.b20)
  const C = 2 * (p.a11 * p.b02 - p.a02 * p.b11)
  return quadraticRoots(A, B, C).filter(Number.isFinite)
}

/**
 * Isolated base points (tau,z) of DS, computed from the canonical equations
 * det(M)=0 and K=0. No contour intersection and no division by det(M).
 */
export function doubleSonicBasePoints(p, { tauMin, tauMax, zcMin = -.999, zcMax = .999 } = {}) {
  if (!Number.isFinite(tauMin) || !Number.isFinite(tauMax) || tauMax < tauMin) return []
  const lerp = (a, b, t) => a + t * (b - a)
  const out = []
  for (const z of doubleSonicDirections(p)) {
    const zc = (2 / Math.PI) * Math.atan(z)
    if (zc < zcMin - 1e-12 || zc > zcMax + 1e-12) continue
    const probes = [tauMin, tauMax, lerp(tauMin, tauMax, .25), lerp(tauMin, tauMax, .5), lerp(tauMin, tauMax, .75)]
      .map(tau => ({ tau, d: sonicData(tau, z, p) }))
      .filter(q => q.d.kind === 'regular' && Number.isFinite(q.d.K))
    let best = null
    for (let i = 0; i < probes.length; i++) for (let j = i + 1; j < probes.length; j++) {
      const a = probes[i], b = probes[j], den = b.d.K - a.d.K
      if (Math.abs(den) < 1e-14) continue
      const tau = a.tau - a.d.K * (b.tau - a.tau) / den
      if (tau < tauMin - 1e-10 || tau > tauMax + 1e-10) continue
      const d = sonicData(tau, z, p)
      if (d.kind !== 'regular') continue
      const residual = Math.hypot(d.K, d.detM)
      if (!best || residual < best.residual) best = { tau, z, zc, K: d.K, detM: d.detM, residual }
    }
    if (best && best.residual < 1e-10) out.push(best)
  }
  return out.sort((a, b) => a.zc - b.zc || a.tau - b.tau)
}
