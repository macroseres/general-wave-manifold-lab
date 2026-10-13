import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultCoefficients } from '../src/math/flux/quadraticFlux.js'
import { fiber } from '../src/math/charts/zChart.js'
import { discriminant, characteristicSpectrum } from '../src/math/characteristic/spectrum.js'
import { coincidencePoints, coincidenceTauRoots } from '../src/math/characteristic/coincidence.js'

const presets = [
  ['default', defaultCoefficients],
  ['general', { a20:1.3,a11:.35,a02:.7,a10:.2,a01:-.1,b20:.18,b11:.8,b02:-.3,b10:1.1,b01:.15 }],
]

for (const [name,p] of presets) {
  test(`coincidence projection and shared spectral boundary: ${name}`, () => {
    let checked = 0
    for (let i=0;i<151;i++) {
      const z=Math.tan(Math.PI*(-.96+1.92*(i+.5)/151)/2)
      for (const tau of coincidenceTauRoots(z,p)) {
        if (!Number.isFinite(tau) || Math.abs(tau)>100) continue
        const f=fiber(z,tau,p)
        if(f.kind!=='regular') continue
        const spectrum=characteristicSpectrum(tau,z,p)
        const d=discriminant(f.Ubar,p)
        const scale=1+Math.abs(spectrum.s)+Math.abs(spectrum.other)
        assert.ok(Math.abs(spectrum.gap)<1e-8*scale,`gap=${spectrum.gap}`)
        assert.ok(Math.abs(d)<1e-7*scale*scale,`D=${d}`)
        const h=Math.max(1e-6,1e-5/(1+Math.abs(tau)))
        const left=characteristicSpectrum(tau-h,z,p).gap
        const right=characteristicSpectrum(tau+h,z,p).gap
        assert.ok(left*right<=1e-12*scale*scale,'boundary must separate signed branches')
        checked++
      }
    }
    assert.ok(checked>0,'expected regular coincidence samples')
    const curves=coincidencePoints(p,-100,100,241)
    for(const curve of curves) for(const q of curve) {
      assert.equal(q.Y,0)
      const state=fiber(q.z,q.tau,p)
      assert.equal(state.kind,'regular')
      const d=discriminant(state.Ubar,p)
      const s=characteristicSpectrum(q.tau,q.z,p)
      assert.ok(Math.abs(d)<1e-7*(1+Math.abs(s.s)+Math.abs(s.other))**2)
    }
  })
}
