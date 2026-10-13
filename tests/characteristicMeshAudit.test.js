import test from 'node:test'
import assert from 'node:assert/strict'
import { characteristicMesh } from '../src/geometry/characteristic/mesh.js'
import { defaultCoefficients } from '../src/math/flux/quadraticFlux.js'
import { characteristicSpectrum, discriminant } from '../src/math/characteristic/spectrum.js'
import { fiber } from '../src/math/charts/zChart.js'

const presets = [
  ['padrão', defaultCoefficients],
  ['geral', {a20:1.3,a11:.35,a02:.7,a10:.2,a01:-.1,b20:.18,b11:.8,b02:-.3,b10:1.1,b01:.15}],
  ['misto', {a20:4.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}],
]

for(const [name,p] of presets){
  test(`auditoria da malha característica: ${name}`,()=>{
    const mesh=characteristicMesh(p,-4,4)
    const d=mesh.diagnostics
    assert.equal(d.invalidTriangles,0,'nenhum triângulo de entrada inválido')
    const relativeError=Math.abs(d.slowArea+d.fastArea-d.inputArea)/d.inputArea
    assert.ok(relativeError<1e-7,`área não coberta/sobreposta: ${relativeError}`)
    for(const leaf of mesh.leaves){
      assert.equal(leaf.coords.length%9,0)
      for(let i=0;i<leaf.coords.length;i+=3){
        assert.equal(leaf.coords[i+1],0)
        assert.ok(Number.isFinite(leaf.coords[i]))
        assert.ok(Number.isFinite(leaf.coords[i+2]))
      }
    }
    assert.equal(mesh.boundary.length,2*d.sharedEdges)
    for(const point of mesh.boundary){
      const [tau,y,zc]=point
      assert.equal(y,0)
      const z=Math.tan(Math.PI*zc/2)
      const spectrum=characteristicSpectrum(tau,z,p)
      assert.equal(spectrum.kind,'regular')
      const scale=1+Math.abs(spectrum.s)+Math.abs(spectrum.other)
      assert.ok(Math.abs(spectrum.gap)<(Math.abs(zc)>.995?2e-4:1e-6)*scale,`fronteira fora de G=0: ${spectrum.gap}`)
      const state=fiber(z,tau,p)
      assert.ok(Math.abs(discriminant(state.Ubar,p))<(Math.abs(zc)>.995?1e-6:1e-8)*scale*scale,'projeção fora de D=0')
    }
  })
}
