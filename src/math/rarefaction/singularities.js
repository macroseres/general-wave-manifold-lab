import { zFromZHat, zHatFromZ } from '../charts/zChart.js'
import { cubicRealRoots } from '../numerics/polynomialRoots.js'
import { rarefactionField, rarefactionFieldZ } from './field.js'

function classify2x2(J, eps = 1e-7) {
  const tr = J[0][0] + J[1][1], det = J[0][0] * J[1][1] - J[0][1] * J[1][0], disc = tr * tr - 4 * det
  let type = 'degenerada'
  if (det < -eps) type = 'sela'
  else if (det > eps && disc > eps) type = tr < 0 ? 'nó atrator' : 'nó repulsor'
  else if (det > eps && disc < -eps) type = tr < 0 ? 'foco atrator' : tr > 0 ? 'foco repulsor' : 'centro/linearmente neutra'
  else if (det > eps && Math.abs(disc) <= eps) type = tr < 0 ? 'nó degenerado atrator' : 'nó degenerado repulsor'
  const root = disc >= 0 ? Math.sqrt(Math.max(0, disc)) : NaN
  const eigenvalues = disc >= 0 ? [(tr + root) / 2, (tr - root) / 2] : null
  return { trace: tr, det, disc, type, eigenvalues }
}

function eigvec2(J, lambda) {
  const a = J[0][0] - lambda, b = J[0][1], c = J[1][0], d = J[1][1] - lambda
  let v = Math.abs(b) + Math.abs(a) > Math.abs(c) + Math.abs(d) ? [-b, a] : [-d, c]
  let n = Math.hypot(...v)
  if (n < 1e-12) { v = [1, 0]; n = 1 }
  return v.map(x => x / n)
}

export function rarefactionJacobian(tau, z, p) {
  const zh = zHatFromZ(z), ht = Math.max(1e-5, 1e-5 * (1 + Math.abs(tau))), hh = 1e-5
  const evalAt = (t, h) => {
    const zz = zFromZHat(Math.max(-.999999, Math.min(.999999, h))), d = rarefactionField(t, zz, p)
    return [d.tauDot, d.zHatDot]
  }
  const ap = evalAt(tau + ht, zh), am = evalAt(tau - ht, zh), bp = evalAt(tau, zh + hh), bm = evalAt(tau, zh - hh)
  return [[(ap[0] - am[0]) / (2 * ht), (bp[0] - bm[0]) / (2 * hh)], [(ap[1] - am[1]) / (2 * ht), (bp[1] - bm[1]) / (2 * hh)]]
}

export function rarefactionSingularities(p, tauMin = -2, tauMax = 2) {
  const roots = cubicRealRoots(p.b20, p.b11 - p.a20, p.b02 - p.a11, -p.a02)
  const out = []
  for (const z of roots) {
    if (!Number.isFinite(z)) continue
    const d0 = rarefactionField(0, z, p), d1 = rarefactionField(1, z, p)
    if (d0.kind !== 'regular' || d1.kind !== 'regular') continue
    const slope = d1.tauDot - d0.tauDot
    if (Math.abs(slope) < 1e-10) continue
    const tau = -d0.tauDot / slope
    if (!Number.isFinite(tau) || tau < tauMin - 1e-7 || tau > tauMax + 1e-7) continue
    const d = rarefactionField(tau, z, p)
    if (Math.hypot(d.tauDot, d.zHatDot) > 1e-6) continue
    const J = rarefactionJacobian(tau, z, p), cls = classify2x2(J)
    const eigenvectors = cls.eigenvalues ? cls.eigenvalues.map(l => eigvec2(J, l)) : null
    out.push({ tau, z, zHat: zHatFromZ(z), J, ...cls, eigenvectors, atInfinity: false })
  }
  return out
}

export function infinityRarefactionSingularities(p, etaMin = -100, etaMax = 100, eps = 1e-9) {
  if (Math.abs(2 * p.b20) > eps) return []
  const d0 = rarefactionFieldZ(0, 0, p), d1 = rarefactionFieldZ(1, 0, p)
  if (d0.kind !== 'regular' || d1.kind !== 'regular') return []
  const slope = d1.etaDot - d0.etaDot
  if (Math.abs(slope) < eps) return []
  const eta = -d0.etaDot / slope
  if (!Number.isFinite(eta) || eta < etaMin || eta > etaMax) return []
  const hE = 1e-5, hZ = 1e-5
  const ev = (e, Z) => { const d = rarefactionFieldZ(e, Z, p); return [d.etaDot, d.ZDot] }
  const ep = ev(eta + hE, 0), em = ev(eta - hE, 0), zp = ev(eta, hZ), zm = ev(eta, -hZ)
  const J = [[(ep[0] - em[0]) / (2 * hE), (zp[0] - zm[0]) / (2 * hZ)], [(ep[1] - em[1]) / (2 * hE), (zp[1] - zm[1]) / (2 * hZ)]]
  const cls = classify2x2(J), eigenvectors = cls.eigenvalues ? cls.eigenvalues.map(l => eigvec2(J, l)) : null
  return [{ eta, Z: 0, J, ...cls, eigenvectors, atInfinity: true }]
}
