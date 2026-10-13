import { fiber, zFromZc } from '../charts/zChart.js'
import { characteristicSpectrum } from './spectrum.js'

// The signed spectral gap is affine in tau on each regular fiber.
// Compute its root once; avoid solving the double root of D=gap².
export function coincidenceTauRoots(z, p) {
  const f0 = fiber(z, 0, p)
  if (f0.kind !== 'regular') return []
  const g0 = characteristicSpectrum(0, z, p).gap
  const g1 = characteristicSpectrum(1, z, p).gap
  const slope = g1 - g0
  const tolerance = 1e-11 * (1 + Math.abs(g0) + Math.abs(g1))
  if (Math.abs(slope) <= tolerance) return [] // identically zero or no isolated root
  const tau = -g0 / slope
  return Number.isFinite(tau) ? [tau] : []
}

export function coincidencePoints(p, tauMin, tauMax, samples = 721) {
  const branches = []
  let current = []
  for (let i = 0; i < samples; i++) {
    const zc = -1 + 2 * (i + 0.5) / samples
    const z = zFromZc(zc)
    const tau = coincidenceTauRoots(z, p)[0]
    if (Number.isFinite(tau) && tau >= tauMin && tau <= tauMax) {
      current.push({ tau, Y: 0, z, zc })
    } else if (current.length) {
      branches.push(current)
      current = []
    }
  }
  if (current.length) branches.push(current)
  return branches
}
