import test from 'node:test'
import assert from 'node:assert/strict'
import {example,buildHugoniotReference} from '../scripts/hugoniot-reference.mjs'
import {flux} from '../src/math/flux/quadraticFlux.js'
import {stateFiberPoint} from '../src/math/state/fibers.js'
import {liftHugoniotSample} from '../src/math/state/hugoniotWaveLift.js'

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-11,`${a} != ${b}`)

test('capítulo de Hugoniot: ponto exato, salto e realização física conservativa',()=>{
  const data=buildHugoniotReference(),p=example.coefficients
  assert.deepEqual(flux(example.left,p),[2,1.5])
  assert.deepEqual(flux(example.right,p),[0,.5])
  assert.deepEqual(data.left,example.left)
  assert.deepEqual(data.right,example.right)
  for(const key of ['tau','Y'])close(data.point[key],example.expected[key])
  close(data.speed,1)
  // Ordered spectra are (0,2) on the left and (-1,0) on the right.
  // All strict Lax-2 inequalities are independently away from equality.
  assert.ok(0<data.speed&&data.speed<2)
  assert.equal(data.directDiagnostic.rankineHugoniot,true)
  const lift=liftHugoniotSample(example.left,example.right,p)
  assert.equal(lift.kind,'regular')
  close(lift.tau,-1/8);close(lift.Y,-1);close(lift.z,2)
  // The integrated conservation defect across x=t is exactly zero.
  const leftFlux=flux(example.left,p),rightFlux=flux(example.right,p)
  for(let i=0;i<2;i++)close(rightFlux[i]-leftFlux[i]-data.speed*(example.right[i]-example.left[i]),0)
})

test('capítulo de Hugoniot: curva simbólica, transição recíproca e exclusões',()=>{
  const data=buildHugoniotReference()
  for(const q of data.curve){
    const Y=(4-1.5*q.z)/(1-q.z)
    close(q.Y,Y);close(q.right[0],2+Y*q.z);close(q.right[1],Y)
    assert.ok(q.rhResidual<1e-11)
  }
  for(const key of ['eta','Upsilon','Z'])close(data.reciprocal[key],example.expected[key])
  close(data.point.tau,data.reciprocal.eta*data.reciprocal.Z**2)
  close(data.point.Y,data.reciprocal.Upsilon*data.reciprocal.Z)
  assert.equal(stateFiberPoint(example.left,0,example.coefficients).kind,'singular-parameterization')
  assert.equal(stateFiberPoint(example.left,1,example.coefficients).kind,'no-finite-point')
})
