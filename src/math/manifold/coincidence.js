import { fiber, zFromZHat } from '../charts/zChart.js'
import { discriminant } from './waveState.js'
import { quadraticRoots } from '../numerics/polynomialRoots.js'

export function coincidenceTauRoots(z, p) {
  const f0 = fiber(z, 0, p)
  if (f0.kind !== 'regular') return []
  const d0 = discriminant(f0.Ubar, p)
  const fm = fiber(z, -1, p)
  const fp = fiber(z, 1, p)
  const dm = discriminant(fm.Ubar, p)
  const dp = discriminant(fp.Ubar, p)
  return quadraticRoots((dp + dm - 2 * d0) / 2, (dp - dm) / 2, d0)
}

export function coincidencePoints(p, tauMin, tauMax, samples = 721) {
  const branches = []
  for (let i = 0; i < samples; i++) {
    const zHat = -1 + 2 * (i + 0.5) / samples
    const z = zFromZHat(zHat)
    const roots = coincidenceTauRoots(z, p)
      .filter(tau => Number.isFinite(tau) && tau >= tauMin && tau <= tauMax)
      .sort((a, b) => a - b)
    roots.forEach((tau, j) => {
      if (!branches[j]) branches[j] = []
      branches[j].push({ tau, z, zHat })
    })
  }
  return branches.filter(Boolean)
}
