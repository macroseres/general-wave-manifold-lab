// Exact polynomial audit of the claimed stabilizer generators in Z[x,y,s,r,a,b,p].
import assert from 'node:assert/strict'
const variables = ['x', 'y', 's', 'r', 'a', 'b', 'p']
const key = powers => powers.join(',')
const constant = n => new Map(n ? [[key(variables.map(() => 0)), BigInt(n)]] : [])
const variable = name => new Map([[key(variables.map(v => v === name ? 1 : 0)), 1n]])
function add(...polynomials) {
  const result = new Map()
  for (const p of polynomials) for (const [term, value] of p) result.set(term, (result.get(term) || 0n) + value)
  return new Map([...result].filter(([, value]) => value !== 0n))
}
const neg = p => new Map([...p].map(([term, value]) => [term, -value]))
function mul(p, q) {
  const result = new Map()
  for (const [term, value] of p) for (const [other, coefficient] of q) {
    const a = term.split(',').map(Number), b = other.split(',').map(Number)
    const next = key(a.map((power, i) => power + b[i]))
    result.set(next, (result.get(next) || 0n) + value * coefficient)
  }
  return new Map([...result].filter(([, value]) => value !== 0n))
}
const pow = (p, n) => Array.from({ length: n }).reduce(value => mul(value, p), constant(1))
const [x, y, s, r, a, b, p] = variables.map(variable), zero = constant(0), one = constant(1), minus = constant(-1)
const evaluate = (P, u, v) => add(...P.map((coefficient, i) => mul(coefficient, mul(pow(u, 3 - i), pow(v, i)))))
function verify(P, D, label) {
  const u = add(mul(D[0][0], x), mul(D[0][1], y)), v = add(mul(D[1][0], x), mul(D[1][1], y))
  const determinant = add(mul(D[0][0], D[1][1]), neg(mul(D[0][1], D[1][0])))
  assert.equal(add(evaluate(P, u, v), neg(mul(determinant, evaluate(P, x, y)))).size, 0, label)
}
for (const delta of [one, minus]) verify([zero, p, zero, delta], [[one, zero], [zero, minus]], 'T3 reflection')
verify([zero, b, zero, zero], [[one, zero], [zero, r]], 'T1 scaling')
verify([one, zero, zero, zero], [[one, zero], [s, one]], 'T0 shear')
verify([zero, zero, zero, zero], [[one, zero], [s, r]], 'TR group')
verify([zero, one, minus, zero], [[zero, one], [one, zero]], 'Z3 reflection')
verify([zero, one, minus, zero], [[zero, minus], [one, minus]], 'Z3 cycle')
verify([one, zero, one, zero], [[minus, zero], [zero, one]], 'Z1 reflection')
verify([zero, one, zero, zero], [[one, zero], [zero, r]], 'Z2 scaling')
verify([one, zero, zero, zero], [[a, zero], [s, pow(a, 2)]], 'ZT group')

// The degree-two rank-one exclusion has a constant nonzero minor.
const h = add(one, neg(mul(constant(2), b)))
const determinantT2 = add(mul(h, zero), neg(mul(constant(-2), constant(-2))))
assert.deepEqual(determinantT2, constant(-4))
console.log('Exact symbolic audit passed: all stabilizer generators and the T2 rank minor.')
