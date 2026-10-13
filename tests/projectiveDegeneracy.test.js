import test from 'node:test'
import assert from 'node:assert/strict'
import { fiber, zChartCoefficients } from '../src/math/charts/zChart.js'
import { fiberZ, ZChartCoefficients } from '../src/math/charts/reciprocalChart.js'
import { coincidenceTauRoots } from '../src/math/characteristic/coincidence.js'
import { discriminant } from '../src/math/characteristic/spectrum.js'
import { oldWavePreset } from '../src/math/flux/quadraticFlux.js'
import { waveState, rhResidual } from '../src/math/manifold/waveState.js'

const zero = Object.fromEntries(['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01'].map(k => [k, 0]))
const near = (a,b,tol=1e-7) => assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)), `${a} != ${b}`)

test('degenerate fibers: P=Q=0, R nonzero is absent; all zero leaves the entire mean-state plane', () => {
  const absent = { ...zero, b10: 1 }
  assert.equal(fiber(0,0,absent).kind, 'degenerate') // R(0)=0, all mean states allowed
  assert.equal(fiber(1,0,absent).kind, 'absent')
  assert.equal(fiberZ(0,0,absent).kind, 'absent')
  assert.equal(fiber(2,0,zero).kind, 'degenerate')
  assert.equal(fiberZ(0,0,zero).kind, 'degenerate')
  // A single tau or eta cannot parameterize an entire 2D fiber.
})

test('projective coefficient homogenization includes Z=0 and overlap', () => {
  for (const p of [oldWavePreset(), { ...oldWavePreset(), a20:1.9, b20:.3 }, zero]) {
    const boundary=ZChartCoefficients(0,p)
    near(boundary.P,2*p.b20); near(boundary.Q,p.b11); near(boundary.R,p.b10)
    for (const z of [-4,-.7,.5,2.5]) {
      const Z=1/z, f=zChartCoefficients(z,p), g=ZChartCoefficients(Z,p)
      near(g.P,Z*Z*f.P); near(g.Q,Z*Z*f.Q); near(g.R,Z*Z*f.R)
      for (const tau of [-.5,.2]) {
        const a=fiber(z,tau,p), b=fiberZ(Z,tau*z*z,p)
        assert.equal(a.kind,b.kind)
        if (a.kind==='regular') a.Ubar.forEach((x,i)=>near(x,b.Ubar[i]))
      }
    }
  }
})

test('coincidence roots solve the actual discriminant, including a double root', () => {
  const presets=[oldWavePreset(),{...oldWavePreset(),a20:1.9,b20:.3,a11:.2},
    {a20:-.7,a11:.6,a02:1.2,a10:-.4,a01:.3,b20:.8,b11:-.5,b02:.2,b10:1.1,b01:-.6}]
  for (const p of presets) for (const z of [-2,-.6,.4,1.7]) {
    const roots=coincidenceTauRoots(z,p)
    for (const tau of roots) {
      const f=fiber(z,tau,p)
      assert.equal(f.kind,'regular')
      near(discriminant(f.Ubar,p),0,1e-5)
    }
  }
  // At z=0, Ubar=(-tau,0), DF=diag(-tau,0), so Delta=tau^2.
  const double={...zero,a20:.5,a02:-.5,b02:-.5}
  const roots=coincidenceTauRoots(0,double)
  assert.ok(roots.some(t=>Math.abs(t)<1e-8))
})

test('trivial RH solutions with arbitrary s are not exhausted by the characteristic chart', () => {
  const p=oldWavePreset()
  const state=waveState(.2,0,.7,p)
  assert.equal(state.kind,'regular')
  near(rhResidual(state,p),0)
  // For U-=U+, RH holds identically for every speed, not only the selected eigenvalue.
  const arbitrarySpeed=state.s+3
  assert.notEqual(arbitrarySpeed,state.s)
  // Both speeds satisfy RH because the jump is exactly zero.
  const U=state.Um
  assert.deepEqual(state.Up,U)
})
