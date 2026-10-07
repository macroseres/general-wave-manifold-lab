import { zHatFromZ } from '../charts/zChart.js'
import { rarefactionFieldZ } from './field.js'
import { infinityRarefactionSingularities } from './singularities.js'

export function infinityRarefactionSeparatrices(p, { steps = 1800, step = .008, ZMax = 2.5, tauMin = -Infinity, tauMax = Infinity } = {}) {
  const ss = infinityRarefactionSingularities(p)
  if (!ss.length || ss[0].type !== 'sela' || !ss[0].eigenvectors) return []
  const q = ss[0], curves = []
  const vf = x => {
    const d = rarefactionFieldZ(x.eta, x.Z, p)
    if (d.kind !== 'regular') return null
    const n = Math.hypot(d.etaDot, d.ZDot)
    return n > 1e-12 ? [d.etaDot / n, d.ZDot / n] : null
  }
  const rk4 = (x, sgn) => {
    const f = y => { const v = vf(y); return v && [sgn * v[0], sgn * v[1]] }
    const k1 = f(x); if (!k1) return null
    const a = { eta: x.eta + step * k1[0] / 2, Z: x.Z + step * k1[1] / 2 }, k2 = f(a); if (!k2) return null
    const b = { eta: x.eta + step * k2[0] / 2, Z: x.Z + step * k2[1] / 2 }, k3 = f(b); if (!k3) return null
    const c = { eta: x.eta + step * k3[0], Z: x.Z + step * k3[1] }, k4 = f(c); if (!k4) return null
    return { eta: x.eta + step * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6, Z: x.Z + step * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6 }
  }
  const toDisplay = x => {
    if (Math.abs(x.Z) < 1e-10) return { tau: 0, zHat: Math.sign(x.Z) || 1, eta: x.eta, Z: x.Z }
    const z = 1 / x.Z
    return { tau: x.eta * x.Z * x.Z, zHat: zHatFromZ(z), eta: x.eta, Z: x.Z }
  }
  for (let j = 0; j < 2; j++) for (const branch of [-1, 1]) {
    const v = q.eigenvectors[j], vn = Math.hypot(v[0], v[1]) || 1, eps = 2e-4
    let x = { eta: q.eta + branch * eps * v[0] / vn, Z: branch * eps * v[1] / vn }
    const sgn = q.eigenvalues[j] >= 0 ? 1 : -1, pts = [toDisplay(x)]
    for (let k = 0; k < steps; k++) {
      const nx = rk4(x, sgn)
      if (!nx || !Number.isFinite(nx.eta) || !Number.isFinite(nx.Z) || Math.abs(nx.Z) > ZMax) break
      const d = toDisplay(nx)
      if (d.tau < tauMin - .2 || d.tau > tauMax + .2) break
      pts.push(d); x = nx
    }
    if (pts.length > 3) curves.push({ eigenvalue: q.eigenvalues[j], stable: q.eigenvalues[j] < 0, branch, points: pts })
  }
  return curves
}
