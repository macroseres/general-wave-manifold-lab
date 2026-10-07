import { fiber } from '../charts/zChart.js'
import { fiberZ } from '../charts/reciprocalChart.js'

function zChartDerivatives(z, p) {
  return {
    Pz: 4 * p.b20 * z + (p.b11 - 2 * p.a20),
    Qz: 2 * p.b11 * z + (2 * p.b02 - p.a11),
    Rz: 2 * p.b10 * z + (p.b01 - p.a10),
  }
}

function ZChartDerivatives(Z, p) {
  return {
    PZ: (p.b11 - 2 * p.a20) - 2 * p.a11 * Z,
    QZ: (2 * p.b02 - p.a11) - 4 * p.a02 * Z,
    RZ: (p.b01 - p.a10) - 2 * p.a01 * Z,
  }
}

// Lifted rarefaction field on the characteristic surface Y=0 in the finite z chart.
export function rarefactionField(tau, z, p, eps = 1e-12) {
  const f = fiber(z, tau, p, eps)
  if (f.kind !== 'regular') return { ...f, tauDot: NaN, zDot: NaN, zHatDot: NaN, mapDet: NaN }
  const { P, Q, R, D } = f
  const { Pz, Qz, Rz } = zChartDerivatives(z, p)
  const Dz = 2 * (P * Pz + Q * Qz)
  const invD2 = 1 / (D * D)
  const baseUz = -(Rz * P + R * Pz) / D + R * P * Dz * invD2
  const baseVz = -(Rz * Q + R * Qz) / D + R * Q * Dz * invD2
  const Uz = [baseUz - tau * Qz, baseVz + tau * Pz]
  const T = [-Q, P]
  const tauDot = z * Uz[1] - Uz[0]
  const zDot = T[0] - T[1] * z
  const zHatDot = (2 / Math.PI) * zDot / (1 + z * z)
  const mapDet = T[0] * Uz[1] - T[1] * Uz[0]
  return { ...f, Uz, T, tauDot, zDot, zHatDot, mapDet }
}

export function rarefactionDirectionResidual(tau, z, p) {
  const d = rarefactionField(tau, z, p)
  if (d.kind !== 'regular' || ![d.tauDot, d.zDot].every(Number.isFinite)) return Infinity
  const du = [d.T[0] * d.tauDot + d.Uz[0] * d.zDot, d.T[1] * d.tauDot + d.Uz[1] * d.zDot]
  return Math.abs(du[0] - z * du[1]) / (1 + Math.hypot(...du))
}

// Rarefaction field in the complementary chart Z=1/z, eta=tau/Z^2.
export function rarefactionFieldZ(eta, Z, p, eps = 1e-12) {
  const f = fiberZ(Z, eta, p, eps)
  if (f.kind !== 'regular') return { ...f, etaDot: NaN, ZDot: NaN, mapDet: NaN }
  const { P, Q, R, D } = f
  const { PZ, QZ, RZ } = ZChartDerivatives(Z, p)
  const Dz = 2 * (P * PZ + Q * QZ), invD2 = 1 / (D * D)
  const baseUz = -(RZ * P + R * PZ) / D + R * P * Dz * invD2
  const baseVz = -(RZ * Q + R * QZ) / D + R * Q * Dz * invD2
  const UZ = [baseUz - eta * QZ, baseVz + eta * PZ], T = [-Q, P]
  const etaDot = UZ[1] - Z * UZ[0]
  const ZDot = T[0] * Z - T[1]
  const mapDet = T[0] * UZ[1] - T[1] * UZ[0]
  return { ...f, UZ, T, etaDot, ZDot, mapDet }
}
