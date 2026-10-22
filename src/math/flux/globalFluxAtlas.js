// Exhaustive algebraic chart construction; floating-point realization with explicit failures.
// The atlas classifies flux orbits, not wave foliations or physical admissibility.
import { coefficientKeys } from './affineClassification.js'
import { classifyScalarStratum, quadraticAtlasData, quadraticCoefficientsFromPair } from './scalarStratification.js'

const det = A => A[0][0] * A[1][1] - A[0][1] * A[1][0]
const mv = (A, x) => A.map(row => row[0] * x[0] + row[1] * x[1])
const mm = (A, B) => A.map(row => B[0].map((_, j) => row[0] * B[0][j] + row[1] * B[1][j]))
const sm = (A, k) => A.map(row => row.map(x => k * x))
const inv = A => sm([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]], 1 / det(A))
const I = [[1, 0], [0, 1]], reflection = [[1, 0], [0, -1]]
const numeric = text => String(text).split('/').map(Number).reduce((a, b) => a / b)
const H = (p, x) => [[2 * p.a20 * x[0] + p.a11 * x[1], p.a11 * x[0] + 2 * p.a02 * x[1]],
  [2 * p.b20 * x[0] + p.b11 * x[1], p.b11 * x[0] + 2 * p.b02 * x[1]]]
const linear = p => [[p.a10, p.a01], [p.b10, p.b01]]
const cubic = p => [2 * p.b20, 2 * (p.b11 - p.a20), 2 * (p.b02 - p.a11), -2 * p.a02]
const cubicValue = (p, x) => p[0] * x[0] ** 3 + p[1] * x[0] ** 2 * x[1] + p[2] * x[0] * x[1] ** 2 + p[3] * x[1] ** 3
const tf = M => [(M[0][0] - M[1][1]) / 2, M[0][1], M[1][0]]

export function globalFluxAtlas(p, tolerance = 1e-9) {
  if (!coefficientKeys.every(key => typeof p[key] === 'number' && Number.isFinite(p[key]))) throw new Error('Forneça dez coeficientes numéricos finitos')
  if (!(tolerance > 0 && tolerance < 1)) throw new Error('Tolerância inválida')
  const exact = quadraticAtlasData(p), scalar = classifyScalarStratum(p)
  let current = { ...p }, transform = { A: I, translation: [0, 0], positiveSpeedScale: 1, speedShift: 0 }
  let family, parameters = {}, residualClass, symmetry = null
  const fail = reason => ({ status: 'ill-conditioned', reason, evidence: 'numerical-with-exact-input-strata',
    scalarStratum: scalar.stratum, exactQuadraticData: exact })
  const step = (A = I, u = [0, 0], k = 1, d = 0) => {
    if (!Number.isFinite(det(A)) || det(A) === 0 || !(k > 0)) throw new Error('Transformação singular ou escala inválida')
    const inverse = inv(A), e1 = [A[0][0], A[1][0]], e2 = [A[0][1], A[1][1]]
    const q11 = mv(inverse, mv(H(current, e1), e1)).map(x => k * x)
    const q12 = mv(inverse, mv(H(current, e1), e2)).map(x => k * x)
    const q22 = mv(inverse, mv(H(current, e2), e2)).map(x => k * x)
    const L = linear(current), Hu = H(current, u)
    const N = sm(mm(mm(inverse, L.map((row, i) => row.map((x, j) => x + Hu[i][j]))), A), k)
    current = { a20: q11[0] / 2, a11: q12[0], a02: q22[0] / 2,
      b20: q11[1] / 2, b11: q12[1], b02: q22[1] / 2,
      a10: N[0][0] - d, a01: N[0][1], b10: N[1][0], b01: N[1][1] - d }
    transform = { A: mm(transform.A, A), translation: mv(transform.A, u).map((x, i) => x + transform.translation[i]),
      positiveSpeedScale: k * transform.positiveSpeedScale, speedShift: k * transform.speedShift + d }
  }
  const center = u => {
    const L = linear(current), Hu = H(current, u)
    step(I, u, 1, (L[0][0] + L[1][1] + Hu[0][0] + Hu[1][1]) / 2)
  }
  const residual = (D, k) => step(sm(D, 1 / k), [0, 0], k)
  // Never turn a small nonzero quotient coordinate into an exact axis class.
  // Ratios are invariant under a common positive rescaling of the quotient.
  const ambiguous = (values, reference = Math.max(...values.map(Math.abs))) =>
    values.some(x => x !== 0 && Math.abs(x) / reference <= tolerance)
  const finish = () => {
    if (![...Object.values(current), ...transform.A.flat(), ...transform.translation, transform.positiveSpeedScale, transform.speedShift].every(Number.isFinite)) return fail('nonfinite-normalization')
    if (scalar.homogenizable && scalar.rank > 0) {
      const error = Math.max(...tf(linear(current)).map(Math.abs))
      if (error > 100 * tolerance) return fail('homogeneous-roundoff-too-large')
      current.a10 = 0; current.a01 = 0; current.b10 = 0; current.b01 = 0
    }
    const canonicalTrace = family.startsWith('trace-') ? [1, 0] : [0, 0]
    const canonicalCubic = family === 'trace-cubic' ? [parameters.q, parameters.p, 0, parameters.delta]
      : family === 'trace-quadratic' ? [parameters.r, 0, 1, 0]
        : family === 'trace-linear' ? [0, parameters.b, 0, 0]
          : ['trace-constant', 'traceless-triple'].includes(family) ? [1, 0, 0, 0]
            : family === 'traceless-three-real' ? [0, 1, -1, 0]
              : family === 'traceless-one-real' ? [1, 0, 1, 0]
                : family === 'traceless-double' ? [0, 1, 0, 0] : [0, 0, 0, 0]
    return { status: 'normalized', evidence: 'numerical-with-exact-input-strata', tolerance,
      family, parameters, residualClass, scalarStratum: scalar.stratum, coefficients: current,
      canonicalQuadraticPair: { trace: canonicalTrace, cubic: canonicalCubic },
      canonicalQuadraticCoefficients: quadraticCoefficientsFromPair(canonicalTrace, canonicalCubic),
      transformation: transform, inverseStateMatrix: inv(transform.A),
      scope: 'affine flux orbits; not wave structures', exactQuadraticData: exact }
  }

  try {
    if (scalar.linearClass) {
      family = 'linear'; residualClass = scalar.linearClass
      const L = linear(current), lambda = (L[0][0] + L[1][1]) / 2
      const N = [[(L[0][0] - L[1][1]) / 2, L[0][1]], [L[1][0], (L[1][1] - L[0][0]) / 2]]
      if (scalar.linearClass === 'scalar') step(I, [0, 0], 1, lambda)
      else if (scalar.linearClass === 'real-distinct') {
        const r = Math.sqrt(-det(N))
        const eigenvector = value => Math.hypot(N[0][1], value - N[0][0]) > Math.hypot(value - N[1][1], N[1][0])
          ? [N[0][1], value - N[0][0]] : [value - N[1][1], N[1][0]]
        const u = eigenvector(r), v = eigenvector(-r)
        step([[u[0], v[0]], [u[1], v[1]]], [0, 0], 1 / r, lambda / r)
      } else if (scalar.linearClass === 'complex-pair') {
        const r = Math.sqrt(det(N)), u = [1, 0], v = mv(N, u).map(x => x / r)
        step([[u[0], v[0]], [u[1], v[1]]], [0, 0], 1 / r, lambda / r)
      } else {
        const v = Math.hypot(N[0][0], N[1][0]) > Math.hypot(N[0][1], N[1][1]) ? [1, 0] : [0, 1]
        const u = mv(N, v)
        step([[u[0], v[0]], [u[1], v[1]]], [0, 0], 1, lambda)
      }
      return finish()
    }

    if (!exact.traceZero) {
      const t = exact.trace.map(numeric), length2 = t[0] ** 2 + t[1] ** 2
      step([[t[0] / length2, -t[1]], [t[1] / length2, t[0]]])
      const [A, B, C, D] = exact.traceChart.coefficients.map(numeric), degree = exact.traceChart.degree
      if (degree === 3) {
        const s = -C / (3 * D), q = numeric(exact.traceChart.depressedConstant)
        const r = (q < 0 ? -1 : 1) / Math.sqrt(Math.abs(D))
        step([[1, 0], [s, r]])
        family = 'trace-cubic'; parameters = { delta: Math.sign(D), p: numeric(exact.traceChart.depressedLinear), q: Math.abs(q) * Math.sqrt(Math.abs(D)) }
        if (exact.traceChart.reflection) symmetry = reflection
      } else if (degree === 2) {
        step([[1, 0], [-B / (2 * C), 1 / C]])
        family = 'trace-quadratic'; parameters = { r: A * C - B * B / 4 }
      } else if (degree === 1) {
        step([[1, 0], [-A / B, 1]])
        family = 'trace-linear'; parameters = { b: B }; symmetry = reflection
      } else if (degree === 0) {
        step([[1, 0], [0, A]])
        family = 'trace-constant'
      } else {
        family = 'trace-radial'; symmetry = reflection
      }
    } else {
      // Ensure no projective root is at infinity before solving the real cubic.
      const P = exact.cubic.map(numeric)
      const candidates = [[0, 1], [1, 0], [1, 1], [1, -1]]
      const v = candidates.reduce((best, x) => Math.abs(cubicValue(P, x)) / Math.hypot(...x) ** 3 > Math.abs(cubicValue(P, best)) / Math.hypot(...best) ** 3 ? x : best)
      step([[v[1], v[0]], [-v[0], v[1]]])
      const [A, B, C, D] = cubic(current), a = C / D, b = B / D, c = A / D
      const depressedP = b - a * a / 3, depressedQ = 2 * a ** 3 / 27 - a * b / 3 + c
      let frame, coefficientIndex
      if (exact.rootType === 'three-real') {
        const radius = 2 * Math.sqrt(-depressedP / 3), argument = 3 * depressedQ / (depressedP * radius)
        if (!Number.isFinite(argument) || Math.abs(argument) > 1 + tolerance) return fail('cubic-root-resolution')
        const angle = Math.acos(Math.max(-1, Math.min(1, argument))) / 3
        const roots = [0, 1, 2].map(j => radius * Math.cos(angle - 2 * Math.PI * j / 3) - a / 3).sort((x, y) => x - y)
        const [r1, r2, r3] = roots, s1 = (r2 - r3) / (r2 - r1), s2 = (r3 - r1) / (r2 - r1)
        frame = [[s1, s2], [s1 * r1, s2 * r2]]
        family = 'traceless-three-real'; coefficientIndex = 1; symmetry = [[0, 1], [1, 0]]
      } else if (exact.rootType === 'one-real') {
        const cardano = depressedQ ** 2 / 4 + depressedP ** 3 / 27
        if (!(cardano > 0)) return fail('cubic-root-resolution')
        const r = Math.cbrt(-depressedQ / 2 + Math.sqrt(cardano)) + Math.cbrt(-depressedQ / 2 - Math.sqrt(cardano)) - a / 3
        const real = (-a - r) / 2, imaginary = Math.sqrt(b - 2 * r * real - real ** 2)
        frame = [[r - real, imaginary], [real * (r - real) - imaginary ** 2, r * imaginary]]
        family = 'traceless-one-real'; coefficientIndex = 0; symmetry = [[-1, 0], [0, 1]]
      } else if (exact.rootType === 'double') {
        const repeated = (9 * D * A - C * B) / (2 * (C * C - 3 * D * B)), simple = -a - 2 * repeated
        frame = [[1, 1], [simple, repeated]]
        family = 'traceless-double'; coefficientIndex = 1; symmetry = reflection
      } else {
        const r = -a / 3
        frame = [[r, 1], [-1, r]]
        family = 'traceless-triple'; coefficientIndex = 0
      }
      step(frame)
      const coefficient = cubic(current)[coefficientIndex]
      step(sm(I, 1 / coefficient))
    }

    if (scalar.rank === 2) {
      // Translation gauge: remove two coordinates of the traceless linear matrix.
      const gauge = () => {
        const s1 = tf(H(current, [1, 0])), s2 = tf(H(current, [0, 1])), l = tf(linear(current))
        const minors = [[1, 2], [0, 2], [0, 1]].map(([i, j]) => s1[i] * s2[j] - s2[i] * s1[j])
        const omitted = minors.reduce((best, x, i) => Math.abs(x) > Math.abs(minors[best]) ? i : best, 0)
        const rows = [0, 1, 2].filter(i => i !== omitted)
        const system = rows.map(i => [s1[i], s2[i]])
        center(mv(inv(system), rows.map(i => -l[i])))
        return { omitted, value: tf(linear(current))[omitted] }
      }
      const reference = Math.max(...tf(linear(current)).map(Math.abs))
      let result = gauge()
      if (scalar.homogenizable) residualClass = 'zero'
      else {
        if (result.value === 0 || ambiguous([result.value], reference)) return fail('linear-obstruction-below-resolution')
        if (symmetry && result.value < 0) { step(symmetry); result = gauge() }
        residual(I, 1 / Math.abs(result.value))
        residualClass = symmetry ? 'nonzero' : result.value > 0 ? 'positive' : 'negative'
      }
      parameters.linearPivot = result.omitted
    } else if (scalar.rank === 1) {
      let [x, y, z] = tf(linear(current))
      if (family === 'trace-cubic') {
        const delta = parameters.delta
        center([0, (y - 2 * delta * z) / (2 * delta)])
        ;[x, y, z] = tf(linear(current))
        let u = z * 2, radius = Math.hypot(x, u)
        if (scalar.homogenizable) residualClass = 'zero'
        else {
          if (radius === 0) return fail('linear-obstruction-below-resolution')
          if (u < 0) { step(reflection); u = -u }
          residual(I, 1 / radius)
          parameters.linearAngle = x / radius
          residualClass = 'semicircle'
        }
      } else if (family === 'trace-linear' && Math.abs(parameters.b - 0.5) <= tolerance) {
        center([0, -2 * z]); [x, y] = tf(linear(current))
        if (scalar.homogenizable) residualClass = 'zero'
        else if (ambiguous([x, y])) return fail('residual-axis-unresolved')
        else if (x !== 0) {
          const k = 1 / Math.abs(x), t = y === 0 ? 1 : 1 / (k * y)
          residual([[1, 0], [0, t]], k)
          residualClass = `diagonal-${Math.sign(x)}-upper-${y === 0 ? 0 : 1}`
        } else {
          if (y === 0) return fail('linear-obstruction-below-resolution')
          residual([[1, 0], [0, Math.sign(y)]], 1 / Math.abs(y)); residualClass = 'upper'
        }
      } else if (family === 'trace-linear' && Math.abs(parameters.b + 1) <= tolerance) {
        center([-2 * x, 0]); [, y, z] = tf(linear(current))
        if (scalar.homogenizable) residualClass = 'zero'
        else if (ambiguous([y, z])) return fail('residual-axis-unresolved')
        else if (y !== 0 && z !== 0) {
          const k = 1 / (Math.sqrt(Math.abs(y)) * Math.sqrt(Math.abs(z)))
          residual([[1, 0], [0, 1 / (k * y)]], k); residualClass = Math.sign(y) === Math.sign(z) ? 'product-positive' : 'product-negative'
        } else if (y !== 0) { residual([[1, 0], [0, Math.sign(y)]], 1 / Math.abs(y)); residualClass = 'upper' }
        else if (z !== 0) { residual([[1, 0], [0, Math.sign(z)]], 1 / Math.abs(z)); residualClass = 'lower' }
        else return fail('linear-obstruction-below-resolution')
      } else if (family === 'traceless-triple') {
        center([-z, 0]); [x, y] = tf(linear(current))
        if (scalar.homogenizable) residualClass = 'zero'
        else if (ambiguous([x, y])) return fail('residual-axis-unresolved')
        else if (y !== 0) {
          const a = Math.sign(y), s = -a * x / y
          residual([[a, 0], [s, a * a]], 1 / Math.abs(y)); residualClass = 'upper'
        } else if (x !== 0) { residual(I, 1 / Math.abs(x)); residualClass = x > 0 ? 'positive' : 'negative' }
        else return fail('linear-obstruction-below-resolution')
        center([-tf(linear(current))[2], 0])
      } else return fail('rank-one-family-mismatch')
    } else return fail('unexpected-zero-rank-quadratic')
    return finish()
  } catch (error) {
    return fail(error.message)
  }
}
