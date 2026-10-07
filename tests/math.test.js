import test from 'node:test';import assert from 'node:assert/strict';
import {oldWavePreset,waveState,rhResidual,eigenResidual,zHatFromZ,zFromZHat,sonicData,rarefactionDirectionResidual,rarefactionField,sonicResidual,zChartCoefficients} from '../src/math/quadraticFlux.js';
const p=oldWavePreset({B1:8,B2:.2,a:0,c:1});
test('Rankine-Hugoniot residual vanishes in the z chart',()=>{for(const z of [-5,-1,-.2,0,.4,2,8])for(const tau of [-1,.2,1.3])for(const Y of [-1,.4,1]){const s=waveState(tau,Y,z,p);assert.equal(s.kind,'regular');assert.ok(rhResidual(s,p)<1e-8)}})
test('r=(z,1) is a characteristic eigenvector',()=>{for(const z of [-4,-.5,0,.7,5]){const s=waveState(.37,.8,z,p);assert.ok(eigenResidual(s,p)<1e-8)}})
test('z-hat compactification round-trips finite z',()=>{for(const z of [-100,-2,0,.7,50])assert.ok(Math.abs(zFromZHat(zHatFromZ(z))-z)<1e-8*Math.max(1,Math.abs(z)))})
test('preset characteristic equation recovers b1 z u + A(z)v-cz^2=0',()=>{const B1=8,B2=.2,c=1;for(const z of [-3,-.4,0,.8,4]){const q=zChartCoefficients(z,p);const scale=q.P/(B1*z||1);if(Math.abs(z)>1e-9){assert.ok(Math.abs(q.Q/scale-(1+B2*z-z*z))<1e-9);assert.ok(Math.abs(q.R/scale-(-c*z*z))<1e-9)}}})
test('nontrivial sonic sheets satisfy endpoint sonic determinants',()=>{for(const z of [-3,-.7,.2,1.1,4])for(const tau of [-.8,.1,.9]){const d=sonicData(tau,z,p);if(d.kind!=='regular'||d.yMinus===null)continue;assert.ok(sonicResidual(tau,d.yMinus,z,p,'minus')<1e-7);assert.ok(sonicResidual(tau,d.yPlus,z,p,'plus')<1e-7);assert.ok(Math.abs(d.yMinus+d.yPlus)<1e-9)}})
test('Y=0 is the trivial sonic component',()=>{for(const z of [-2,-.2,.6,3])for(const tau of [-1,.4,1]){assert.ok(sonicResidual(tau,0,z,p,'minus')<1e-8);assert.ok(sonicResidual(tau,0,z,p,'plus')<1e-8)}})

test('rarefaction field projects to the characteristic eigenvector direction',()=>{
  const p=oldWavePreset()
  for(const [tau,z] of [[0,0],[.3,.4],[-.7,-1.2],[1.1,2.0]]){
    const d=rarefactionField(tau,z,p)
    assert.equal(d.kind,'regular')
    assert.ok(rarefactionDirectionResidual(tau,z,p)<1e-9)
  }
})

test('finite rarefaction singularities satisfy the vector-field equations',async()=>{
  const {rarefactionSingularities}=await import('../src/math/quadraticFlux.js')
  const qs=rarefactionSingularities(p,-20,20)
  for(const q of qs){const d=rarefactionField(q.tau,q.z,p);assert.ok(Math.hypot(d.tauDot,d.zHatDot)<1e-5)}
})

test('finite singularity detector finds and classifies an isolated saddle',async()=>{
  const {rarefactionSingularities}=await import('../src/math/quadraticFlux.js')
  const q={a20:.1343645781182241,a11:-.7297449434335905,a02:.30032803661043106,a10:-.3478441614460568,a01:-.12068521462094717,b20:.5562426790359116,b11:.27141191531855213,b02:.4162423170929892,b10:-.49116961019312644,b01:-.8931050358479689}
  const ss=rarefactionSingularities(q,-3,3)
  assert.ok(ss.some(x=>x.type==='sela'&&Math.abs(x.tau-.5337080474)<1e-5&&Math.abs(x.z-.2473997196)<1e-5))
})

test('Z chart agrees with z chart on the overlap',async()=>{
  const {fiberZ,rarefactionFieldZ}=await import('../src/math/quadraticFlux.js')
  for(const z of [-4,-1.3,.7,3]){const Z=1/z,tau=.21,eta=tau*z*z,a=waveState(tau,0,z,p),b=fiberZ(Z,eta,p);assert.equal(b.kind,'regular');assert.ok(Math.hypot(a.Ubar[0]-b.Ubar[0],a.Ubar[1]-b.Ubar[1])<1e-9);const dz=rarefactionField(tau,z,p),dZ=rarefactionFieldZ(eta,Z,p);assert.ok(Number.isFinite(dz.tauDot)&&Number.isFinite(dZ.etaDot))}
})
test('preset has an isolated rarefaction singularity in the Z=0 chart',async()=>{
 const {infinityRarefactionSingularities,rarefactionFieldZ}=await import('../src/math/quadraticFlux.js');const q=infinityRarefactionSingularities(p);assert.equal(q.length,1);const d=rarefactionFieldZ(q[0].eta,0,p);assert.ok(Math.hypot(d.etaDot,d.ZDot)<1e-8)
})

test('quadratic flux core is available as an independent pure module', async()=>{
  const core=await import('../src/math/flux/quadraticFlux.js')
  const q=core.oldWavePreset({B1:8,B2:.2,a:0,c:1})
  const U=[.3,-.7]
  assert.deepEqual(core.flux(U,q),fluxCompat(U,q))
  assert.deepEqual(core.jacobian(U,q),jacobianCompat(U,q))
})

function fluxCompat(U,p){const [u,v]=U;return [p.a20*u*u+p.a11*u*v+p.a02*v*v+p.a10*u+p.a01*v,p.b20*u*u+p.b11*u*v+p.b02*v*v+p.b10*u+p.b01*v]}
function jacobianCompat(U,p){const [u,v]=U;return [[2*p.a20*u+p.a11*v+p.a10,p.a11*u+2*p.a02*v+p.a01],[2*p.b20*u+p.b11*v+p.b10,p.b11*u+2*p.b02*v+p.b01]]}

test('finite z chart is available as an independent geometry module', async()=>{
  const chart=await import('../src/math/charts/zChart.js')
  for(const z of [-3,-.4,0,.8,4]){
    const a=chart.zChartCoefficients(z,p)
    const b=zChartCoefficients(z,p)
    assert.deepEqual(a,b)
    const f=chart.fiber(z,.37,p)
    assert.equal(f.kind,'regular')
  }
})

test('wave-manifold state is available independently of the compatibility facade', async()=>{
  const manifold=await import('../src/math/manifold/waveState.js')
  for(const [tau,Y,z] of [[0,.4,-2],[.3,-.7,.5],[1.1,.2,3]]){
    const a=manifold.waveState(tau,Y,z,p)
    const b=waveState(tau,Y,z,p)
    assert.equal(a.kind,'regular')
    assert.deepEqual(a,b)
    assert.ok(manifold.rhResidual(a,p)<1e-8)
    assert.ok(manifold.eigenResidual(a,p)<1e-8)
  }
})

test('sonic geometry is available as an independent mathematical module', async()=>{
  const sonic=await import('../src/math/sonic/sonic.js')
  for(const z of [-3,-.7,.2,1.1,4])for(const tau of [-.8,.1,.9]){
    const direct=sonic.sonicData(tau,z,p)
    const compat=sonicData(tau,z,p)
    assert.deepEqual(direct,compat)
    if(direct.kind!=='regular'||direct.yMinus===null)continue
    assert.ok(sonic.sonicResidual(tau,direct.yMinus,z,p,'minus')<1e-7)
    assert.ok(sonic.sonicResidual(tau,direct.yPlus,z,p,'plus')<1e-7)
    assert.ok(Math.abs(sonic.sonicImplicit(tau,direct.yMinus,z,p,'minus'))<1e-8)
    assert.ok(Math.abs(sonic.sonicImplicit(tau,direct.yPlus,z,p,'plus'))<1e-8)
  }
})

test('rarefaction layers are available independently of the compatibility facade', async()=>{
  const field=await import('../src/math/rarefaction/field.js')
  const singular=await import('../src/math/rarefaction/singularities.js')
  const chartZ=await import('../src/math/charts/reciprocalChart.js')
  for(const [tau,z] of [[0,0],[.3,.4],[-.7,-1.2],[1.1,2]]){
    const d=field.rarefactionField(tau,z,p)
    assert.equal(d.kind,'regular')
    assert.ok(field.rarefactionDirectionResidual(tau,z,p)<1e-9)
  }
  const Z=.5,eta=.21/(Z*Z)
  assert.equal(chartZ.fiberZ(Z,eta,p).kind,'regular')
  for(const q of singular.rarefactionSingularities(p,-20,20)){
    const d=field.rarefactionField(q.tau,q.z,p)
    assert.ok(Math.hypot(d.tauDot,d.zHatDot)<1e-5)
  }
})


test('coincidence locus is available independently of the compatibility facade', async()=>{
  const direct=await import('../src/math/manifold/coincidence.js')
  const compat=await import('../src/math/quadraticFlux.js')
  for(const z of [-3,-.7,.2,1.1,4]){
    assert.deepEqual(direct.coincidenceTauRoots(z,p),compat.coincidenceTauRoots(z,p))
  }
  assert.deepEqual(direct.coincidencePoints(p,-2,2,81),compat.coincidencePoints(p,-2,2,81))
})
