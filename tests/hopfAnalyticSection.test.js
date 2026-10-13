import test from 'node:test'
import assert from 'node:assert/strict'
import {analyticHopfSection} from '../src/geometry/hopf/analyticSection.js'
import {hopfAtlasAt} from '../src/math/sonic/hopfAtlas.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'

for(const side of ['minus','plus']){
  test(`quadratic Hopf section reproduces exact determinant (${side})`,()=>{
    for(const z of [-.8,-.3,0,.3,.8]){
      const section=analyticHopfSection(z,defaultCoefficients,side)
      if(!section)continue
      for(const u of [-.75,-.2,.15,.7]){
        const [tau,Y]=section.point(u)
        const actual=hopfAtlasAt(tau,Y,z,defaultCoefficients,side)
        assert.equal(actual.kind,'regular')
        const scale=1+Math.abs(actual.det)
        assert.ok(Math.abs(actual.trace)<1e-7*(1+Math.abs(tau)+Math.abs(Y)))
        assert.ok(Math.abs(section.determinant(u)-actual.det)<1e-7*scale)
      }
    }
  })
}
