export function quadraticRoots(a, b, c, eps = 1e-10) {
  if (Math.abs(a) < eps) {
    if (Math.abs(b) < eps) return []
    return [-c / b]
  }
  let disc = b * b - 4 * a * c
  if (disc < -eps) return []
  disc = Math.max(0, disc)
  const r = Math.sqrt(disc)
  return [(-b - r) / (2 * a), (-b + r) / (2 * a)]
    .filter((x, i, arr) => i === 0 || Math.abs(x - arr[0]) > 1e-8)
}

export function cubicRealRoots(a, b, c, d, eps = 1e-12) {
  if (Math.abs(a) < eps) return quadraticRoots(b, c, d, eps)
  const A = b / a, B = c / a, C = d / a
  const p = B - A * A / 3
  const q = 2 * A * A * A / 27 - A * B / 3 + C
  const disc = q * q / 4 + p * p * p / 27
  if (disc > eps) {
    const s = Math.sqrt(disc), u = Math.cbrt(-q / 2 + s), v = Math.cbrt(-q / 2 - s)
    return [u + v - A / 3]
  }
  if (Math.abs(disc) <= eps) {
    const u = Math.cbrt(-q / 2)
    return [2 * u - A / 3, -u - A / 3].filter((x, i, arr) => i === 0 || Math.abs(x - arr[0]) > 1e-9)
  }
  const rho = 2 * Math.sqrt(-p / 3)
  const phi = Math.acos(Math.max(-1, Math.min(1, (-q / 2) / Math.sqrt(-(p * p * p) / 27))))
  return [0, 1, 2].map(k => rho * Math.cos((phi + 2 * Math.PI * k) / 3) - A / 3).sort((x, y) => x - y)
}
