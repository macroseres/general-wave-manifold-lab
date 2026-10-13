import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultCoefficients, oldWavePreset } from '../src/math/flux/quadraticFlux.js'
import { waveState, rhResidual, eigenResidual } from '../src/math/manifold/waveState.js'
import { characteristicSpectrum, discriminant } from '../src/math/characteristic/spectrum.js'
import { sonicData, sonicDeterminant, sonicFullImplicit, sonicImplicit } from '../src/math/sonic/sonic.js'
import { inflectionResidual, doubleSonicBaseResidual } from '../src/math/sonic/intersections.js'

const params = [defaultCoefficients, oldWavePreset({B1:0,B2:0.2,a:0,c:1}), {
  a20:1.2,a11:.3,a02:-.4,a10:.2,a01:.1,b20:.4,b11:1.1,b02:.2,b10:1,b01:-.3,
}]
const approx=(actual,expected,scale=1)=>assert.ok(Math.abs(actual-expected)<=2e-8*(1+Math.abs(expected)+scale),`${actual} != ${expected}`)

test('Rankine–Hugoniot and characteristic direction on finite regular fibres',()=>{
 let checked=0
 for(const p of params)for(const tau of [-1,0,.8])for(const z of [-2,-.4,.3,1.7])for(const Y of [-2,0,2]){
  const state=waveState(tau,Y,z,p)
  if(state.kind!=='regular')continue
  assert.ok(rhResidual(state,p)<1e-8)
  assert.ok(eigenResidual(state,p)<1e-8)
  checked++
 }
 assert.ok(checked>40)
})

test('characteristic signed gap squared equals state discriminant',()=>{
 let checked=0
 for(const p of params)for(const tau of [-1,0,1])for(const z of [-2,-.4,.3,1.7]){
  const spectrum=characteristicSpectrum(tau,z,p)
  if(spectrum.kind!=='regular')continue
  approx(spectrum.gap**2,discriminant(spectrum.Ubar,p))
  checked++
 }
 assert.ok(checked>15)
})

test('sonic determinant equals full implicit equation on each sheet',()=>{
 let checked=0
 for(const p of params)for(const tau of [-1,0,1])for(const z of [-2,-.4,.3,1.7])for(const Y of [-2,0,2])for(const side of ['minus','plus']){
  const state=waveState(tau,Y,z,p)
  if(state.kind!=='regular')continue
  approx(sonicDeterminant(tau,Y,z,p,side),sonicFullImplicit(tau,Y,z,p,side))
  checked++
 }
 assert.ok(checked>50)
})

test('J and DS residuals coincide with the canonical K and detM equations',()=>{
 let checked=0
 for(const p of params)for(const tau of [-1,0,1])for(const z of [-2,-.4,.3,1.7]){
  const d=sonicData(tau,z,p)
  if(d.kind!=='regular')continue
  approx(inflectionResidual(tau,z,p),Math.abs(d.K))
  approx(doubleSonicBaseResidual(tau,z,p),Math.hypot(d.K,d.detM))
  approx(sonicImplicit(tau,2,z,p,'minus'),2*d.detM-2*d.K)
  approx(sonicImplicit(tau,2,z,p,'plus'),2*d.detM+2*d.K)
  checked++
 }
 assert.ok(checked>15)
})
