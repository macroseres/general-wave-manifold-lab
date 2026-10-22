// Exact algebra over the decimal values supplied by the caller.
// Numbers mean their String(value) decimal representation; strings may also be fractions.
import { coefficientKeys } from './affineClassification.js'

const gcd = (a, b) => b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b)
function rational(n, d = 1n) {
  if (d === 0n) throw new Error('Denominador nulo')
  const g = gcd(n, d), sign = d < 0n ? -1n : 1n
  return [sign * n / g, sign * d / g]
}
const add = (a, b) => rational(a[0] * b[1] + b[0] * a[1], a[1] * b[1])
const neg = a => [-a[0], a[1]]
const sub = (a, b) => add(a, neg(b))
const mul = (a, b) => rational(a[0] * b[0], a[1] * b[1])
const div = (a, b) => rational(a[0] * b[1], a[1] * b[0])
const zero = a => a[0] === 0n
const format = a => a[1] === 1n ? String(a[0]) : `${a[0]}/${a[1]}`

function parse(value) {
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Coeficiente não finito')
  if (!['number', 'string', 'bigint'].includes(typeof value)) throw new Error('Coeficiente ausente ou inválido')
  const text = String(value).trim()
  if (/^[+-]?\d+\/[+-]?\d+$/.test(text)) {
    const [n, d] = text.split('/').map(BigInt)
    return rational(n, d)
  }
  const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(text)
  if (!match) throw new Error('Use inteiro, decimal, notação científica ou fração')
  const decimals = match[3] || '', exponent = Number(match[4] || 0) - decimals.length
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 1000) throw new Error('Expoente fora do limite')
  const n = BigInt(`${match[1]}${match[2]}${decimals}`)
  return exponent >= 0 ? rational(n * 10n ** BigInt(exponent)) : rational(n, 10n ** BigInt(-exponent))
}

function reduce(matrix, columnCount) {
  const rows = matrix.map(row => row.slice()), pivots = []
  for (let col = 0; col < columnCount && pivots.length < rows.length; col++) {
    const row = rows.findIndex((values, index) => index >= pivots.length && !zero(values[col]))
    if (row < 0) continue
    const index = pivots.length
    ;[rows[index], rows[row]] = [rows[row], rows[index]]
    const pivot = rows[index][col]
    rows[index] = rows[index].map(value => div(value, pivot))
    for (let j = 0; j < rows.length; j++) {
      if (j === index) continue
      const factor = rows[j][col]
      rows[j] = rows[j].map((value, k) => sub(value, mul(factor, rows[index][k])))
    }
    pivots.push(col)
  }
  return { rows, pivots }
}

// Binary cubic P(U)=det(U,H(U,U)) and trace covector, over exact supplied decimals.
export function quadraticAtlasData(coefficients) {
  const p = Object.fromEntries(coefficientKeys.map(key => [key, parse(coefficients[key])]))
  const n = value => parse(value), times = (a, b) => mul(n(a), b)
  const t = [add(times(2, p.a20), p.b11), add(p.a11, times(2, p.b02))]
  const cubic = [times(2, p.b20), times(2, sub(p.b11, p.a20)), times(2, sub(p.b02, p.a11)), times(-2, p.a02)]
  const [A, B, C, D] = cubic
  const discriminant = add(add(times(18, mul(mul(A, B), mul(C, D))), times(-4, mul(mul(B, B), mul(B, D)))),
    add(mul(mul(B, B), mul(C, C)), add(times(-4, mul(A, mul(mul(C, C), C))), times(-27, mul(mul(A, A), mul(D, D))))))
  const hessian = [sub(times(3, mul(A, C)), mul(B, B)), sub(times(9, mul(A, D)), mul(B, C)), sub(times(3, mul(B, D)), mul(C, C))]
  const traceZero = t.every(zero), cubicZero = cubic.every(zero)
  let traceChart = null
  if (!traceZero) {
    const length2 = add(mul(t[0], t[0]), mul(t[1], t[1]))
    const u = [div(t[0], length2), div(t[1], length2)], v = [neg(t[1]), t[0]]
    const polynomialProduct = (a, b) => {
      const values = Array.from({ length: a.length + b.length - 1 }, () => n(0))
      a.forEach((x, i) => b.forEach((y, j) => { values[i + j] = add(values[i + j], mul(x, y)) }))
      return values
    }
    const linearX = [u[0], v[0]], linearY = [u[1], v[1]]
    const transformed = Array.from({ length: 4 }, () => n(0))
    cubic.forEach((coefficient, j) => {
      let monomial = [n(1)]
      for (let i = 0; i < 3; i++) monomial = polynomialProduct(monomial, i < 3 - j ? linearX : linearY)
      monomial.forEach((value, i) => { transformed[i] = add(transformed[i], mul(coefficient, value)) })
    })
    const degree = transformed.findLastIndex(value => !zero(value))
    let depressedLinear = null, depressedConstant = null
    if (degree === 3) {
      const [a, b, c, d] = transformed
      depressedLinear = sub(b, div(mul(c, c), times(3, d)))
      depressedConstant = add(sub(a, div(mul(b, c), times(3, d))), div(times(2, mul(mul(c, c), c)), times(27, mul(d, d))))
    }
    traceChart = { coefficients: transformed.map(format), degree,
      depressedLinear: depressedLinear && format(depressedLinear), depressedConstant: depressedConstant && format(depressedConstant),
      reflection: degree === 3 && zero(depressedConstant) }
  }
  return { trace: t.map(format), traceZero, cubic: cubic.map(format), cubicZero,
    discriminant: format(discriminant), discriminantSign: Math.sign(Number(discriminant[0] > 0n ? 1 : discriminant[0] < 0n ? -1 : 0)),
    rootType: cubicZero ? 'zero' : !zero(discriminant) ? (discriminant[0] > 0n ? 'three-real' : 'one-real') : hessian.every(zero) ? 'triple' : 'double',
    traceChart }
}

// Rational realization of the canonical pair, preserving its structural identities.
export function quadraticCoefficientsFromPair(traceCovector, binaryCubic) {
  const [tx, ty] = traceCovector.map(parse), [A, B, C, D] = binaryCubic.map(parse)
  return Object.fromEntries(Object.entries({
    a20: div(sub(mul(parse(2), tx), B), parse(6)),
    a11: div(sub(ty, C), parse(3)), a02: div(neg(D), parse(2)),
    b20: div(A, parse(2)), b11: div(add(tx, B), parse(3)),
    b02: div(add(mul(parse(2), ty), C), parse(6)),
  }).map(([key, value]) => [key, format(value)]))
}

export function classifyScalarStratum(coefficients) {
  const p = Object.fromEntries(coefficientKeys.map(key => [key, parse(coefficients[key])]))
  const two = parse(2), z = parse(0)
  const M = [[p.a11, mul(two, p.a02)], [mul(two, p.b20), p.b11],
    [sub(mul(two, p.a20), p.b11), sub(p.a11, mul(two, p.b02))]]
  const ell = [p.a01, p.b10, sub(p.a10, p.b01)]
  const system = M.map((row, i) => [...row, neg(ell[i])])
  const { rows, pivots } = reduce(system, 2)
  const rank = pivots.length
  const compatible = !rows.some(row => zero(row[0]) && zero(row[1]) && !zero(row[2]))
  const augmentedRank = rank + (compatible ? 0 : 1)
  let scalarLocus = null
  let homogeneousRepresentative = null
  if (compatible) {
    const origin = [z, z]
    pivots.forEach((col, i) => { origin[col] = rows[i][2] })
    const free = [0, 1].filter(col => !pivots.includes(col))
    const basis = free.map(col => {
      const direction = [z, z]
      direction[col] = parse(1)
      pivots.forEach((pivot, i) => { direction[pivot] = neg(rows[i][col]) })
      return direction.map(format)
    })
    scalarLocus = { dimension: 2 - rank, origin: origin.map(format), basis }
    const scalarSpeed = add(p.a10, add(mul(mul(two, p.a20), origin[0]), mul(p.a11, origin[1])))
    homogeneousRepresentative = {
      translation: origin.map(format),
      speedShift: format(scalarSpeed),
      coefficients: Object.fromEntries(coefficientKeys.map(key => [key,
        format(['a10', 'a01', 'b10', 'b01'].includes(key) ? z : p[key])])),
    }
  }
  const quadraticKeys = ['a20', 'a11', 'a02', 'b20', 'b11', 'b02']
  const linear = quadraticKeys.every(key => zero(p[key]))
  let linearClass = null
  if (linear) {
    const delta = add(mul(ell[2], ell[2]), mul(parse(4), mul(p.a01, p.b10)))
    linearClass = compatible ? 'scalar' : delta[0] > 0n ? 'real-distinct' : delta[0] < 0n ? 'complex-pair' : 'jordan'
  }
  return {
    evidence: 'exact-rational-for-supplied-decimals',
    stratum: `rank-${rank}-${augmentedRank}`,
    rank, augmentedRank, homogenizable: compatible, scalarLocus, homogeneousRepresentative,
    linearClass,
    M: M.map(row => row.map(format)), ell: ell.map(format),
    scope: 'scalar-locus-and-linear-sector; not a complete wave classification',
  }
}
