// Exact symbolic coefficient audit in Z[a,b], without external CAS dependencies.
import assert from 'node:assert/strict'
const constant = n => new Map(n === 0 ? [] : [['0,0', BigInt(n)]])
const a = new Map([['1,0', 1n]]), b = new Map([['0,1', 1n]])
function add(...polynomials) {
  const result = new Map()
  for (const p of polynomials) for (const [key, value] of p) result.set(key, (result.get(key) || 0n) + value)
  return new Map([...result].filter(([, value]) => value !== 0n))
}
const neg = p => new Map([...p].map(([key, value]) => [key, -value]))
function mul(p, q) {
  const terms = []
  for (const [key, value] of p) for (const [other, factor] of q) {
    const [i, j] = key.split(',').map(Number), [k, l] = other.split(',').map(Number)
    terms.push(new Map([[`${i + k},${j + l}`, value * factor]]))
  }
  return add(...terms)
}
const one = constant(1), two = constant(2), three = constant(3)
const subtract = (p, q) => add(p, neg(q))
const equal = (p, q, label) => assert.equal(subtract(p, q).size, 0, label)
const traceProduct = (X, Y) => add(mul(X[0][0], Y[0][0]), mul(X[0][1], Y[1][0]), mul(X[1][0], Y[0][1]), mul(X[1][1], Y[1][1]))
const H1 = [[a, b], [one, subtract(one, a)]]
const H2 = [[b, neg(mul(a, b))], [subtract(one, a), neg(b)]]
const T = add(mul(two, mul(a, a)), neg(mul(two, a)), one, mul(two, b))
const R = mul(mul(two, b), add(b, mul(a, a), neg(a)))
equal(traceProduct(H1, H1), T, 'B11=T')
equal(traceProduct(H1, H2), constant(0), 'B12=0')
equal(traceProduct(H2, H2), R, 'B22=R')
const x = b
const y = neg(mul(b, add(mul(two, b), mul(two, mul(a, a)), neg(a))))
const z = add(mul(two, b), mul(two, mul(a, a)), neg(mul(three, a)), one)
equal(add(mul(subtract(mul(two, a), one), x), y, mul(b, z)), constant(0), 'first residual equation')
equal(add(mul(mul(two, b), x), mul(subtract(one, a), y), neg(mul(mul(a, b), z))), constant(0), 'second residual equation')
console.log('Exact symbolic identities passed in Z[a,b]: trace form and residual linear kernel.')
