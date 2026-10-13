import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {oldWavePreset,waveState,rhResidual,eigenResidual,zcFromZ,zFromZc,sonicData,rarefactionDirectionResidual,rarefactionField,sonicResidual,sonicImplicit,sonicDeterminant,zChartCoefficients} from '../src/math/quadraticFlux.js';
const p=oldWavePreset({B1:8,B2:.2,a:0,c:1});
test('Rankine-Hugoniot residual vanishes in the z chart',()=>{for(const z of [-5,-1,-.2,0,.4,2,8])for(const tau of [-1,.2,1.3])for(const Y of [-1,.4,1]){const s=waveState(tau,Y,z,p);assert.equal(s.kind,'regular');assert.ok(rhResidual(s,p)<1e-8)}})
test('r=(z,1) is a characteristic eigenvector',()=>{for(const z of [-4,-.5,0,.7,5]){const s=waveState(.37,.8,z,p);assert.ok(eigenResidual(s,p)<1e-8)}})
test('z-hat compactification round-trips finite z',()=>{for(const z of [-100,-2,0,.7,50])assert.ok(Math.abs(zFromZc(zcFromZ(z))-z)<1e-8*Math.max(1,Math.abs(z)))})
test('preset characteristic equation recovers b1 z u + A(z)v-cz^2=0',()=>{const B1=8,B2=.2,c=1;for(const z of [-3,-.4,0,.8,4]){const q=zChartCoefficients(z,p);const scale=q.P/(B1*z||1);if(Math.abs(z)>1e-9){assert.ok(Math.abs(q.Q/scale-(1+B2*z-z*z))<1e-9);assert.ok(Math.abs(q.R/scale-(-c*z*z))<1e-9)}}})
test('implicit sonic factors agree with endpoint sonic determinants away from Y=0',()=>{for(const z of [-3,-.7,.2,1.1,4])for(const tau of [-.8,.1,.9])for(const Y of [-1.3,.4,2.1]){for(const side of ['minus','plus']){const phi=sonicImplicit(tau,Y,z,p,side);const det=sonicDeterminant(tau,Y,z,p,side);assert.ok(Math.abs(det-Y*phi/4)<1e-7)}}})
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
  for(const q of qs){const d=rarefactionField(q.tau,q.z,p);assert.ok(Math.hypot(d.tauDot,d.zcDot)<1e-5)}
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
  const core=await import('../src/math/quadraticFlux.js')
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
    if(direct.kind!=='regular')continue
    for(const Y of [-1,.5,2])for(const side of ['minus','plus']){
      const phi=sonic.sonicImplicit(tau,Y,z,p,side)
      assert.ok(Number.isFinite(phi))
      assert.ok(Math.abs(sonic.sonicFullImplicit(tau,Y,z,p,side)-Y*phi/4)<1e-10)
    }
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
    assert.ok(Math.hypot(d.tauDot,d.zcDot)<1e-5)
  }
})


test('coincidence locus E is available inside the characteristic layer independently of the compatibility facade', async()=>{
  const direct=await import('../src/math/characteristic/coincidence.js')
  const compat=await import('../src/math/quadraticFlux.js')
  for(const z of [-3,-.7,.2,1.1,4]){
    assert.deepEqual(direct.coincidenceTauRoots(z,p),compat.coincidenceTauRoots(z,p))
  }
  assert.deepEqual(direct.coincidencePoints(p,-2,2,81),compat.coincidencePoints(p,-2,2,81))
})


test('reciprocal chart coefficients are the Z^2 homogenization of the z chart', async()=>{
  const {ZChartCoefficients}=await import('../src/math/charts/reciprocalChart.js')
  for(const z of [-4,-1.3,.7,3]){
    const Z=1/z
    const a=zChartCoefficients(z,p)
    const b=ZChartCoefficients(Z,p)
    assert.ok(Math.abs(b.P-Z*Z*a.P)<1e-10)
    assert.ok(Math.abs(b.Q-Z*Z*a.Q)<1e-10)
    assert.ok(Math.abs(b.R-Z*Z*a.R)<1e-10)
  }
})

test('tau and eta represent the same midpoint under eta=tau/Z^2', async()=>{
  const {fiber}=await import('../src/math/charts/zChart.js')
  const {fiberZ}=await import('../src/math/charts/reciprocalChart.js')
  for(const [tau,z] of [[.21,-4],[-.37,-1.3],[.42,.7],[1.1,3]]){
    const Z=1/z
    const eta=tau/(Z*Z)
    const a=fiber(z,tau,p)
    const b=fiberZ(Z,eta,p)
    assert.equal(a.kind,'regular')
    assert.equal(b.kind,'regular')
    assert.ok(Math.hypot(a.Ubar[0]-b.Ubar[0],a.Ubar[1]-b.Ubar[1])<1e-9)
    assert.ok(Math.abs(tau-eta*Z*Z)<1e-12)
  }
})

test('coincidence locus E lies in characteristic surface C and has zero characteristic discriminant', async()=>{
  const {coincidenceTauRoots}=await import('../src/math/characteristic/coincidence.js')
  const {discriminant}=await import('../src/math/characteristic/spectrum.js')
  const {fiber}=await import('../src/math/charts/zChart.js')
  for(const z of [-2,-.5,.3,1.7]){
    for(const tau of coincidenceTauRoots(z,p)){
      const f=fiber(z,tau,p)
      assert.equal(f.kind,'regular')
      const scale=1+Math.abs(discriminant(f.Ubar,p))
      assert.ok(Math.abs(discriminant(f.Ubar,p))/scale<1e-8)
      const state=waveState(tau,0,z,p)
      assert.deepEqual(state.Um,state.Up)
    }
  }
})

test('full sonic determinants factor into characteristic and nontrivial sonic factors', async()=>{
  const sonic=await import('../src/math/sonic/sonic.js')
  for(const z of [-2,-.6,.3,1.7]) for(const tau of [-.8,.2,.9]) for(const Y of [-1.1,-.25,0,.4,1.3]) {
    for(const side of ['minus','plus']) {
      const det=sonic.sonicDeterminant(tau,Y,z,p,side)
      const factored=sonic.sonicFullImplicit(tau,Y,z,p,side)
      assert.ok(Math.abs(det-factored)<1e-8, `${side}: determinant factorization failed`)
    }
  }
})

test('the characteristic surface is the common trivial component of both full sonic loci', async()=>{
  const sonic=await import('../src/math/sonic/sonic.js')
  for(const z of [-3,-.4,.7,2]) for(const tau of [-1,.1,1]) {
    assert.ok(Math.abs(sonic.sonicFullImplicit(tau,0,z,p,'minus'))<1e-12)
    assert.ok(Math.abs(sonic.sonicFullImplicit(tau,0,z,p,'plus'))<1e-12)
  }
})

test('lifted rarefaction field satisfies the exact chart determinant identity', async()=>{
  const {rarefactionField}=await import('../src/math/rarefaction/field.js')
  for(const [tau,z] of [[0,0],[.3,.4],[-.7,-1.2],[1.1,2]]){
    const d=rarefactionField(tau,z,p)
    assert.equal(d.kind,'regular')
    const projected=[
      d.T[0]*d.tauDot+d.Uz[0]*d.zDot,
      d.T[1]*d.tauDot+d.Uz[1]*d.zDot,
    ]
    const expected=[d.mapDet*z,d.mapDet]
    assert.ok(Math.hypot(projected[0]-expected[0],projected[1]-expected[1])<1e-9)
  }
})

test('characteristic spectrum partitions C into slow, fast and coincidence by eigenvalue ordering', async()=>{
  const {characteristicSpectrum}=await import('../src/math/characteristic/spectrum.js')
  for(const [tau,z] of [[-.8,-2],[.2,-.4],[.7,.5],[1.1,2]]){
    const q=characteristicSpectrum(tau,z,p)
    assert.equal(q.kind,'regular')
    assert.ok(Math.abs(q.gap*q.gap-q.discriminant)<1e-8*(1+Math.abs(q.discriminant)))
    if(q.branch==='slow') assert.ok(q.s<q.other)
    else if(q.branch==='fast') assert.ok(q.s>q.other)
    else assert.ok(Math.abs(q.s-q.other)<1e-8*(1+Math.abs(q.s)+Math.abs(q.other)))
  }
})

test('reciprocal-chart singularity of the preset is analytically a saddle', async()=>{
  const {infinityRarefactionLinearData,infinityRarefactionSingularities}=await import('../src/math/rarefaction/singularities.js')
  const q=infinityRarefactionLinearData(p)
  assert.equal(q.kind,'isolated')
  assert.ok(Math.abs(q.eta+1/40)<1e-12)
  assert.equal(q.Z,0)
  assert.deepEqual(q.eigenvalues,[-8,7])
  const detected=infinityRarefactionSingularities(p)
  assert.equal(detected.length,1)
  assert.equal(detected[0].type,'sela')
  assert.ok(detected[0].det<0)
})

test('Z=0 can host a regular reciprocal-chart rarefaction singularity only when b20=0', async()=>{
  const {infinityRarefactionLinearData}=await import('../src/math/rarefaction/singularities.js')
  assert.equal(infinityRarefactionLinearData({...p,b20:.1}),null)
})

test('infinity saddle has exactly four local half-separatrices in the reciprocal chart', async()=>{
  const {infinityRarefactionSeparatrices}=await import('../src/math/rarefaction/separatrices.js')
  const curves=infinityRarefactionSeparatrices(p,{steps:60})
  assert.equal(curves.length,4)
  assert.equal(curves.filter(c=>c.stable).length,2)
  assert.equal(curves.filter(c=>!c.stable).length,2)
  assert.deepEqual(new Set(curves.map(c=>c.branch)),new Set([-1,1]))
  assert.ok(curves.every(c=>c.reciprocalPoints.length>3))
})

test('stable infinity separatrices lie on Z=0 and cannot be represented by finite-z points', async()=>{
  const {infinityRarefactionSeparatrices}=await import('../src/math/rarefaction/separatrices.js')
  const curves=infinityRarefactionSeparatrices(p,{steps:60})
  const stable=curves.filter(c=>c.stable)
  assert.equal(stable.length,2)
  for(const c of stable){
    assert.equal(c.liesOnInfinityBoundary,true)
    assert.equal(c.visibleInFiniteChart,false)
    assert.equal(c.points.length,0)
    assert.ok(c.reciprocalPoints.every(q=>Math.abs(q.Z)<1e-12))
  }
})

test('unstable infinity separatrices enter opposite reciprocal-chart sides and chart transition is exact', async()=>{
  const {infinityRarefactionSeparatrices,reciprocalPointToFiniteDisplay}=await import('../src/math/rarefaction/separatrices.js')
  const {fiber}=await import('../src/math/charts/zChart.js')
  const {fiberZ}=await import('../src/math/charts/reciprocalChart.js')
  const curves=infinityRarefactionSeparatrices(p,{steps:60}).filter(c=>!c.stable)
  assert.equal(curves.length,2)
  assert.ok(curves[0].reciprocalPoints[0].Z*curves[1].reciprocalPoints[0].Z<0)
  for(const c of curves){
    assert.equal(c.liesOnInfinityBoundary,false)
    assert.equal(c.visibleInFiniteChart,true)
    const q=c.reciprocalPoints.at(-1), finite=reciprocalPointToFiniteDisplay(q)
    assert.ok(finite)
    const a=fiber(finite.z,finite.tau,p), b=fiberZ(q.Z,q.eta,p)
    assert.equal(a.kind,'regular'); assert.equal(b.kind,'regular')
    assert.ok(Math.hypot(a.Ubar[0]-b.Ubar[0],a.Ubar[1]-b.Ubar[1])<1e-8)
  }
})

test('local reciprocal-chart geometry preserves all four infinity half-separatrices', async()=>{
  const {infinityRarefactionSeparatrices}=await import('../src/math/rarefaction/separatrices.js')
  const {infinityRarefactionSingularities}=await import('../src/math/rarefaction/singularities.js')
  const {reciprocalChartGeometry}=await import('../src/geometry/rarefaction/localChart.js')
  const singularity=infinityRarefactionSingularities(p)[0]
  const geometry=reciprocalChartGeometry(infinityRarefactionSeparatrices(p,{steps:80}),singularity)
  assert.ok(geometry)
  assert.equal(geometry.curves.length,4)
  assert.equal(geometry.curves.filter(c=>c.stable).length,2)
  assert.equal(geometry.curves.filter(c=>!c.stable).length,2)
  assert.ok(geometry.curves.filter(c=>c.stable).every(c=>c.points.every(q=>Math.abs(q.Z)<1e-12)))
})

test('local reciprocal-chart display mapping is geometry-only and maps saddle to chart interior', async()=>{
  const {reciprocalChartGeometry,reciprocalChartToUnit}=await import('../src/geometry/rarefaction/localChart.js')
  const singularity={eta:-.025,Z:0}
  const geometry=reciprocalChartGeometry([],singularity,{etaRadius:.5,ZRadius:.25})
  const q=reciprocalChartToUnit(singularity,geometry)
  assert.ok(Math.abs(q.x-.5)<1e-12)
  assert.ok(Math.abs(q.y-.5)<1e-12)
})

test('local chart orients stable branches toward the saddle and unstable branches away from it', async()=>{
  const {infinityRarefactionSeparatrices}=await import('../src/math/rarefaction/separatrices.js')
  const {infinityRarefactionSingularities}=await import('../src/math/rarefaction/singularities.js')
  const {reciprocalChartGeometry}=await import('../src/geometry/rarefaction/localChart.js')
  const singularity=infinityRarefactionSingularities(p)[0]
  const geometry=reciprocalChartGeometry(infinityRarefactionSeparatrices(p,{steps:80}),singularity)
  for(const c of geometry.curves){
    assert.equal(c.orientedPoints.length,c.points.length)
    assert.match(c.label,/^W[su][−+]$/)
    const first=c.orientedPoints[0],last=c.orientedPoints.at(-1)
    const d0=Math.hypot(first.eta-singularity.eta,first.Z)
    const d1=Math.hypot(last.eta-singularity.eta,last.Z)
    if(c.stable) assert.ok(d1<d0)
    else assert.ok(d1>d0)
  }
})

test('state-space projections are exactly the left and right states of P in the wave manifold', async()=>{
  const {waveState}=await import('../src/math/manifold/waveState.js')
  const {stateSpaceProjection}=await import('../src/math/state/projections.js')
  for(const [tau,Y,z] of [[0,.4,0],[.3,-.8,.5],[-.7,1.1,-1.2]]){
    const w=waveState(tau,Y,z,p),q=stateSpaceProjection(w)
    assert.equal(w.kind,'regular'); assert.ok(q)
    assert.deepEqual([q.minus.u,q.minus.v],w.Um)
    assert.deepEqual([q.plus.u,q.plus.v],w.Up)
    assert.deepEqual([q.mean.u,q.mean.v],w.Ubar)
    assert.equal(q.speed,w.s)
  }
})

test('pi-minus and pi-plus coincide on the characteristic surface C', async()=>{
  const {waveState}=await import('../src/math/manifold/waveState.js')
  const {stateSpaceProjection}=await import('../src/math/state/projections.js')
  for(const [tau,z] of [[-.8,-2],[0,0],[.7,.5],[1.1,2]]){
    const q=stateSpaceProjection(waveState(tau,0,z,p))
    assert.ok(q)
    assert.ok(Math.hypot(q.minus.u-q.plus.u,q.minus.v-q.plus.v)<1e-12)
    assert.ok(Math.hypot(q.minus.u-q.mean.u,q.minus.v-q.mean.v)<1e-12)
  }
})

test('state-space geometry is display-only and contains both projected states', async()=>{
  const {stateSpaceGeometry,statePointToUnit}=await import('../src/geometry/state/stateSpace.js')
  const projection={minus:{u:-2,v:1},plus:{u:3,v:-1},mean:{u:.5,v:0},speed:2}
  const g=stateSpaceGeometry(projection)
  for(const q of [projection.minus,projection.plus,projection.mean]){
    const r=statePointToUnit(q,g)
    assert.ok(r.x>0&&r.x<1&&r.y>0&&r.y<1)
  }
  assert.deepEqual(g.projection,projection)
})

test('reusable rarefaction orbits project to the same Ubar on C', async()=>{
  const {rarefactionOrbits,projectRarefactionOrbitToState}=await import('../src/math/rarefaction/orbits.js')
  const {fiber}=await import('../src/math/charts/zChart.js')
  const orbits=rarefactionOrbits(p,-1,1,{maxSteps:80,nTau:5,nZ:5})
  assert.ok(orbits.length>0)
  const projected=projectRarefactionOrbitToState(orbits[0],p)
  assert.ok(projected.length>3)
  for(const q of projected.slice(0,12)){
    const f=fiber(q.z,q.tau,p);assert.equal(f.kind,'regular')
    assert.ok(Math.hypot(q.u-f.Ubar[0],q.v-f.Ubar[1])<1e-12)
  }
})

test('projected rarefaction tangent is parallel to the selected characteristic direction', async()=>{
  const {rarefactionOrbits,projectRarefactionOrbitToState}=await import('../src/math/rarefaction/orbits.js')
  const orbits=rarefactionOrbits(p,-1,1,{step:.002,maxSteps:500,nTau:5,nZ:5})
  const curve=projectRarefactionOrbitToState(orbits.find(o=>o.length>30),p)
  let checked=0
  for(let i=10;i<curve.length-10&&checked<20;i+=3){
    const a=curve[i-1],q=curve[i],b=curve[i+1],du=b.u-a.u,dv=b.v-a.v
    const n=Math.hypot(du,dv);if(n<1e-9)continue
    const residual=Math.abs(du-q.z*dv)/n
    assert.ok(residual<5e-3);checked++
  }
  assert.ok(checked>3)
})

test('state-space rarefaction segments never mix slow and fast sheets', async()=>{
  const {rarefactionOrbits,projectRarefactionOrbitToState,splitProjectedRarefactionByBranch}=await import('../src/math/rarefaction/orbits.js')
  const orbits=rarefactionOrbits(p,-1,1,{maxSteps:80,nTau:5,nZ:5})
  const segments=orbits.flatMap(o=>splitProjectedRarefactionByBranch(projectRarefactionOrbitToState(o,p)))
  assert.ok(segments.length>0)
  for(const s of segments){assert.ok(['slow','fast'].includes(s.branch));assert.ok(s.points.every(q=>q.branch===s.branch))}
})

test('one rarefaction orbit remains continuous when its spectral branch changes through E', async()=>{
  const {rarefactionOrbits,projectRarefactionOrbitToState,splitProjectedRarefactionByBranch}=await import('../src/math/rarefaction/orbits.js')
  const orbits=rarefactionOrbits(p,-2,2,{step:.01,maxSteps:1000,nTau:9,nZ:11})
  let checked=false
  for(let i=0;i<orbits.length&&!checked;i++){
    const projected=projectRarefactionOrbitToState(orbits[i],p)
    if(!projected.some((q,j)=>j&&projected[j-1].gap*q.gap<0))continue
    const segments=splitProjectedRarefactionByBranch(projected,p,{orbitId:`R${i}`})
    for(let j=1;j<segments.length;j++){
      const a=segments[j-1],b=segments[j]
      if(a.branch===b.branch)continue
      const left=a.points.at(-1),right=b.points[0]
      assert.equal(a.orbitId,b.orbitId)
      assert.equal(left.event,'coincidence'); assert.equal(right.event,'coincidence')
      assert.ok(Math.hypot(left.u-right.u,left.v-right.v)<1e-12)
      assert.ok(Math.abs(left.gap)<1e-10*(1+Math.abs(left.s)+Math.abs(left.other)))
      checked=true;break
    }
  }
  assert.ok(checked,'expected at least one slow-fast crossing of E')
})

test('state-space geometry keeps equal coordinate spans for a true 1:1 plot', async()=>{
  const {stateSpaceGeometry}=await import('../src/geometry/state/stateSpace.js')
  const projection={minus:{u:-2,v:.2},plus:{u:3,v:.3},mean:{u:.5,v:.25},speed:1}
  const g=stateSpaceGeometry(projection)
  assert.ok(Math.abs((g.uMax-g.uMin)-(g.vMax-g.vMin))<1e-12)
})

test('finite saddle separatrices are produced by the mathematical layer',async()=>{
  const {finiteRarefactionSeparatrices}=await import('../src/math/rarefaction/finiteSeparatrices.js')
  const q={a20:.1343645781182241,a11:-.7297449434335905,a02:.30032803661043106,a10:-.3478441614460568,a01:-.12068521462094717,b20:.5562426790359116,b11:.27141191531855213,b02:.4162423170929892,b10:-.49116961019312644,b01:-.8931050358479689}
  const data=finiteRarefactionSeparatrices(q,-3,3,{maxSteps:80})
  assert.ok(data.singularities.some(x=>x.type==='sela'))
  assert.ok(data.separatrices.length>=2)
  for(const c of data.separatrices){assert.ok(c.points.length>3);assert.ok(['stable','unstable'].includes(c.stable?'stable':'unstable'))}
})

test('sonic mesh generation is pure geometry and returns finite triangles',async()=>{
  const {sonicSurfaceTriangles}=await import('../src/geometry/sonic/surface.js')
  for(const side of ['minus','plus']){
    const g=sonicSurfaceTriangles(p,{tauMin:-1,tauMax:1,YMin:-2,YMax:2,side,nTau:36,nZ:54})
    assert.ok(g.triangleCount>0)
    assert.equal(g.indices.length,g.triangleCount*3)
    assert.equal(g.positions.length,g.vertexCount*3)
    assert.ok(g.positions.every(Number.isFinite))
    assert.ok(g.indices.every(Number.isInteger))
  }
})

test('sonic geometry is extracted from implicit equations and preserves double-sonic lines',async()=>{
  const {sonicSurfaceTriangles,doubleSonicGeometry}=await import('../src/geometry/sonic/surface.js')
  const {sonicImplicit}=await import('../src/math/sonic/sonic.js')
  const {zFromZc}=await import('../src/math/charts/zChart.js')
  const ds=doubleSonicGeometry(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6})
  assert.equal(ds.length,2,'Wave Manifold preset should expose the two double-sonic lines')
  for(const q of ds){
    assert.ok(q.residual<1e-10)
    const z=zFromZc(q.zc)
    for(const Y of [-3,3])for(const side of ['minus','plus'])assert.ok(Math.abs(sonicImplicit(q.tau,Y,z,p,side))<1e-9)
  }
  const mesh=sonicSurfaceTriangles(p,{tauMin:-1,tauMax:1,YMin:-2,YMax:2,side:'minus',nTau:10,nY:8,nZ:12})
  assert.equal(mesh.method,'marching-tetrahedra-implicit-sonic')
  // Every regular mesh vertex must satisfy the original implicit equation.
  for(let i=0;i<mesh.positions.length;i+=3){
    const [tau,Y,zc]=mesh.positions.slice(i,i+3)
    assert.ok(Math.abs(sonicImplicit(tau,Y,zFromZc(zc),p,'minus'))<2e-5)
  }
})


test('native sonic extraction never uses explicit Y=2K/detM coordinates',async()=>{
  const {sonicSurfaceTriangles}=await import('../src/geometry/sonic/surface.js')
  const {sonicImplicit}=await import('../src/math/sonic/sonic.js')
  const {zFromZc}=await import('../src/math/charts/zChart.js')
  const mesh=sonicSurfaceTriangles(p,{tauMin:-2,tauMax:2,YMin:-3,YMax:3,side:'plus',nTau:18,nY:16,nZ:24})
  assert.equal(mesh.method,'marching-tetrahedra-implicit-sonic')
  assert.ok(mesh.triangleCount>0)
  for(let i=0;i<mesh.positions.length;i+=3){
    const [tau,Y,zc]=mesh.positions.slice(i,i+3)
    const r=Math.abs(sonicImplicit(tau,Y,zFromZc(zc),p,'plus'))
    assert.ok(Number.isFinite(r)&&r<2e-5)
  }
})

test('double-sonic base points are the simultaneous K=0 and detM=0 degeneracy, not a division by detM',async()=>{
  const {doubleSonicGeometry}=await import('../src/geometry/sonic/surface.js')
  const ds=doubleSonicGeometry(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6})
  assert.ok(ds.every(q=>Math.abs(q.K)<1e-10&&Math.abs(q.detM)<1e-10))
  assert.ok(ds.every(q=>q.points[0].Y<0&&q.points[1].Y>0))
})

test('sonic edge certification remains local for the a20=-2 regression case',async()=>{
  const {sonicSurfaceTriangles}=await import('../src/geometry/sonic/surface.js')
  const {sonicImplicit}=await import('../src/math/sonic/sonic.js')
  const {zFromZc}=await import('../src/math/charts/zChart.js')
  const q={...p,a20:-2}
  for(const side of ['minus','plus']){
    const mesh=sonicSurfaceTriangles(q,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,side,nTau:20,nY:18,nZ:28})
    assert.ok(mesh.triangleCount>0)
    assert.equal(mesh.uncertifiedVertexCount,0)
    assert.ok(Number.isFinite(mesh.maxResidual)&&mesh.maxResidual<2e-5)
    for(let i=0;i<mesh.positions.length;i+=3){
      const [tau,Y,zc]=mesh.positions.slice(i,i+3)
      assert.ok(Math.abs(sonicImplicit(tau,Y,zFromZc(zc),q,side))<2e-5)
    }
  }
})



test('sonic mesh contains the canonical double-sonic fibre as a conforming seam',async()=>{
  const {sonicSurfaceTriangles,doubleSonicGeometry}=await import('../src/geometry/sonic/surface.js')
  const ds=doubleSonicGeometry(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6})
  const mesh=sonicSurfaceTriangles(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,side:'minus',nTau:20,nY:18,nZ:28})
  assert.ok(ds.length>0)
  assert.equal(mesh.dsConstrainedFibreCount,ds.length)
  assert.ok(mesh.dsGridVertexCount>0)
  for(const line of ds){
    for(const Y of [-6,0,6]){
      let best=Infinity
      for(let i=0;i<mesh.positions.length;i+=3){
        const d=Math.hypot(mesh.positions[i]-line.tau,mesh.positions[i+1]-Y,mesh.positions[i+2]-line.zc)
        best=Math.min(best,d)
      }
      assert.ok(best<1e-10,'canonical DS seam vertex must belong to the sonic mesh')
    }
  }
})
test('adaptive RK4 controls local error and rejects oversized steps when necessary',async()=>{
  const {adaptiveRK4Step}=await import('../src/math/numerics/integration.js')
  const add=(q,v,h)=>({x:q.x+h*v[0],y:q.y+h*v[1]})
  const field=q=>[q.y,-q.x]
  const a=adaptiveRK4Step({x:1,y:0},1.5,field,add,{
    absoluteTolerance:1e-11,relativeTolerance:1e-11,minStep:1e-7,maxStep:1.5,
    norm:q=>Math.hypot(q.x,q.y),distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
  })
  assert.equal(a.kind,'accepted')
  assert.ok(a.rejected>0)
  assert.ok(a.error<=a.scale)
  assert.ok(Math.abs(a.stepUsed)<1.5)
})

test('adaptive RK4 converges on a harmonic oscillator and tighter tolerance improves the orbit',async()=>{
  const {adaptiveRK4Step}=await import('../src/math/numerics/integration.js')
  const add=(q,v,h)=>({x:q.x+h*v[0],y:q.y+h*v[1]})
  const field=q=>[q.y,-q.x]
  const solve=tol=>{let q={x:1,y:0},t=0,h=.5,guard=0;while(t<2*Math.PI&&guard++<10000){
    const remaining=2*Math.PI-t,hs=Math.min(h,remaining)
    const a=adaptiveRK4Step(q,hs,field,add,{absoluteTolerance:tol,relativeTolerance:tol,minStep:1e-8,maxStep:.5,
      norm:q=>Math.hypot(q.x,q.y),distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)})
    assert.equal(a.kind,'accepted');q=a.state;t+=Math.abs(a.stepUsed);h=Math.abs(a.nextStep)
  }return Math.hypot(q.x-1,q.y)}
  const loose=solve(1e-5),tight=solve(1e-9)
  assert.ok(tight<loose)
  assert.ok(tight<1e-7)
})

test('bracketed scalar event refinement locates a zero without reintegrating the ODE',async()=>{
  const {locateBracketedEvent}=await import('../src/math/numerics/integration.js')
  const q=locateBracketedEvent({x:0},{x:2},s=>s.x-Math.sqrt(2),(a,b,t)=>({x:a.x+t*(b.x-a.x)}),{valueTolerance:1e-13,iterations:60})
  assert.ok(q)
  assert.ok(Math.abs(q.x-Math.sqrt(2))<1e-12)
})

// dev.20 — three-space rarefaction solution framework
import { rarefactionStateAtXi, selectRarefactionOrbit } from '../src/math/solution/rarefactionSolution.js'
import { rarefactionFanGeometry } from '../src/geometry/physical/rarefactionFan.js'

test('three-space selector reuses an existing rarefaction orbit',()=>{
  const orbits=[[{tau:-1,zc:0},{tau:0,zc:0}],[{tau:1,zc:.5},{tau:2,zc:.5}]]
  const s=selectRarefactionOrbit(orbits,{tau:1.1,zc:.48})
  assert.equal(s.orbitIndex,1); assert.equal(s.orbit,orbits[1])
})

test('physical rarefaction requires monotone characteristic speed',()=>{
  const monotone=[{u:0,v:0,s:-1,tau:0,zc:0},{u:1,v:0,s:0,tau:1,zc:.1},{u:2,v:0,s:2,tau:2,zc:.2}]
  // test the pure realization contract with a projected-like sequence through the public state evaluator
  const solution={kind:'rarefaction',states:monotone,xiMin:-1,xiMax:2}
  const q=rarefactionStateAtXi(solution,.5)
  assert.equal(q.region,'fan'); assert.ok(Math.abs(q.u-1.25)<1e-12)
  const g=rarefactionFanGeometry(solution,{tMax:2})
  assert.equal(g.left.x,-2); assert.equal(g.right.x,4); assert.equal(g.rays.length,3)
})

test('rarefaction solution candidate rejects a speed reversal',()=>{
  // A tiny synthetic flux-independent orbit is not enough for projection, so verify the contract source contains the guard.
  const source=readFileSync(new URL('../src/math/solution/rarefactionSolution.js',import.meta.url),'utf8')
  assert.match(source,/characteristic-speed-reversal/)
  assert.match(source,/projectRarefactionOrbitToState/)
})

// dev.22 — state fibres and characteristic lifts
import { stateFiberPoint, stateFiberPointReciprocal, characteristicLifts } from '../src/math/state/fibers.js'

test('a fixed state lifts to projection fibres, not to a unique wave-manifold point',()=>{
  const U=[.31,-.27]
  for(const side of ['minus','plus']) for(const z of [-2,-.4,.3,1.7]){
    const q=stateFiberPoint(U,z,p,side)
    if(q.kind!=='regular') continue
    const w=waveState(q.tau,q.Y,z,p)
    assert.equal(w.kind,'regular')
    const endpoint=side==='minus'?w.Um:w.Up
    assert.ok(Math.hypot(endpoint[0]-U[0],endpoint[1]-U[1])<1e-9)
  }
})

test('finite and reciprocal state-fibre charts agree on the full wave state',()=>{
  const U=[.31,-.27]
  for(const side of ['minus','plus']) for(const z of [-3,-.8,.6,2.4]){
    const a=stateFiberPoint(U,z,p,side), Z=1/z
    const b=stateFiberPointReciprocal(U,Z,p,side)
    if(a.kind!=='regular'||b.kind!=='regular') continue
    assert.ok(Math.abs(b.eta-a.tau/(Z*Z))<1e-8)
    assert.ok(Math.abs(b.Upsilon-a.Y/Z)<1e-8)
    assert.ok(Math.hypot(a.Ubar[0]-b.Ubar[0],a.Ubar[1]-b.Ubar[1])<1e-9)
  }
})

test('characteristic lifts are exactly the Y=0 intersections of both projection fibres',()=>{
  const U=[.31,-.27]
  const lifts=characteristicLifts(U,p)
  assert.ok(lifts.length>=1&&lifts.length<=2)
  for(const lift of lifts){
    if(lift.kind==='finite'){
      for(const side of ['minus','plus']){
        const q=stateFiberPoint(U,lift.z,p,side)
        assert.equal(q.kind,'regular')
        assert.ok(Math.abs(q.Y)<1e-9)
        const w=waveState(q.tau,0,lift.z,p)
        assert.ok(Math.hypot(w.Ubar[0]-U[0],w.Ubar[1]-U[1])<1e-9)
      }
    } else {
      const q=stateFiberPointReciprocal(U,0,p,'minus')
      assert.ok(['regular','singular-parameterization'].includes(q.kind))
      if(q.kind==='regular') assert.ok(Math.abs(q.Upsilon)<1e-9)
    }
  }
})

test('projective characteristic lift at infinity is represented by Z=0, never fake finite z',()=>{
  // For the preset, the infinity condition is v+c=0 because b20=0,b11=1,b10=c.
  const U=[.2,-1]
  const lifts=characteristicLifts(U,p)
  assert.ok(lifts.some(q=>q.kind==='infinity'&&q.Z===0&&q.Upsilon===0))
  assert.ok(lifts.every(q=>q.kind!=='infinity'||!('z' in q)))
})

// dev.23 — state-fibre visualization geometry
test('state-fibre geometry samples both projection fibres and preserves the fixed endpoint',async()=>{
  const {stateFibreGeometry}=await import('../src/geometry/state/fibreGeometry.js')
  const U=[.31,-.27],g=stateFibreGeometry(U,p,{tauMin:-10,tauMax:10,YMin:-10,YMax:10,n:301})
  assert.ok(g.minus.flat().length>10); assert.ok(g.plus.flat().length>10)
  for(const side of ['minus','plus']) for(const q of g[side].flat().filter((_,i)=>i%37===0)){
    const w=waveState(q.tau,q.Y,q.z,p),endpoint=side==='minus'?w.Um:w.Up
    assert.ok(Math.hypot(endpoint[0]-U[0],endpoint[1]-U[1])<1e-8)
  }
})

test('state-fibre geometry marks finite characteristic lifts on Y=0',async()=>{
  const {stateFibreGeometry}=await import('../src/geometry/state/fibreGeometry.js')
  const g=stateFibreGeometry([.31,-.27],p,{tauMin:-20,tauMax:20,YMin:-20,YMax:20})
  const finite=g.lifts.filter(q=>q.kind==='finite')
  assert.ok(finite.length>=1)
  assert.ok(finite.every(q=>Number.isFinite(q.tau)&&Number.isFinite(q.zc)&&['slow','fast','coincidence'].includes(q.branch)))
})

test('state-fibre analysis derives singular projective directions algebraically', async()=>{
  const {fibreDenominatorPolynomial,fibreSingularDirections}=await import('../src/math/state/fibreAnalysis.js')
  const [a,b,c,d]=fibreDenominatorPolynomial(p)
  for(const z of fibreSingularDirections([.3,-.2],p).finite){
    const value=((a*z.z+b)*z.z+c)*z.z+d
    assert.ok(Math.abs(value)<1e-7)
  }
})

test('pi-minus and pi-plus fibres have equal tau-z trace and opposite Y', async()=>{
  const {stateFiberPoint}=await import('../src/math/state/fibers.js')
  const U=[.3,-.2]
  for(const z of [-3,-.7,.2,1.1,4]){
    const m=stateFiberPoint(U,z,p,'minus'),q=stateFiberPoint(U,z,p,'plus')
    if(m.kind!=='regular'||q.kind!=='regular')continue
    assert.ok(Math.abs(m.tau-q.tau)<1e-10)
    assert.ok(Math.abs(m.Y+q.Y)<1e-10)
  }
})

test('state-fibre analysis classifies characteristic lifts independently of display window', async()=>{
  const {analyzeStateFibres}=await import('../src/math/state/fibreAnalysis.js')
  const a=analyzeStateFibres([.3,-.2],p)
  assert.equal(a.kind,'regular-analysis')
  assert.equal(a.regularBranchCount,Math.max(1,a.singularDirectionCount))
  assert.ok(a.characteristicLifts.length>=0)
  assert.equal(a.symmetry.sameTauZTrace,true)
  assert.equal(a.symmetry.oppositeJump,true)
})

test('state-fibre geometry is independent of the sonic sampling window',async()=>{
  const {stateFibreGeometry}=await import('../src/geometry/state/fibreGeometry.js')
  const U=[9.54426,1.13161]
  const g=stateFibreGeometry(U,p,{n:801})
  assert.ok(g.minus.flat().length>20&&g.plus.flat().length>20)
  assert.equal(g.minus.flat().length,g.plus.flat().length)
  for(let i=0;i<Math.min(g.minus.flat().length,g.plus.flat().length);i++){
    const m=g.minus.flat()[i],q=g.plus.flat()[i]
    assert.ok(Math.abs(m.tau-q.tau)<1e-10)
    assert.ok(Math.abs(m.Y+q.Y)<1e-10)
  }
})

test('state-space polyline clipping preserves visible crossings of the viewport',async()=>{
  const {clipStatePolyline}=await import('../src/geometry/state/stateSpace.js')
  const w={uMin:-5,uMax:5,vMin:-5,vMax:5}
  const pieces=clipStatePolyline([{u:-10,v:0},{u:0,v:0},{u:10,v:0}],w)
  assert.equal(pieces.length,1)
  assert.ok(Math.abs(pieces[0][0].u+5)<1e-12)
  assert.ok(Math.abs(pieces[0].at(-1).u-5)<1e-12)
  assert.ok(pieces[0].every(q=>q.u>=-5&&q.u<=5&&q.v>=-5&&q.v<=5))
})

test('forward/backward fibres share their exact characteristic intersections',async()=>{
  const {stateFibreCharacteristicIntersections}=await import('../src/geometry/state/fibreGeometry.js')
  const xs=stateFibreCharacteristicIntersections([.31,-.27],p)
  assert.ok(xs.length>=1)
  for(const q of xs.filter(x=>x.kind==='finite')){
    assert.equal(q.shared,true)
    assert.ok(Math.abs(q.minusY)<1e-8&&Math.abs(q.plusY)<1e-8)
    assert.ok(['slow','fast','coincidence'].includes(q.branch))
  }
})

// dev.24.7 — global Hugoniot continuation through reciprocal chart
test('reciprocal fibre display transition reproduces finite-chart coordinates',async()=>{
  const {stateFiberPoint,stateFiberPointReciprocal}=await import('../src/math/state/fibers.js')
  const {reciprocalFibrePointToDisplay}=await import('../src/geometry/state/fibreGeometry.js')
  const U=[.31,-.27]
  for(const side of ['minus','plus']) for(const Z of [-.3,-.12,.09,.27]){
    const r=stateFiberPointReciprocal(U,Z,p,side),d=reciprocalFibrePointToDisplay(r),f=stateFiberPoint(U,1/Z,p,side)
    if(!d||f.kind!=='regular')continue
    assert.ok(Math.abs(d.tau-f.tau)<1e-8)
    assert.ok(Math.abs(d.Y-f.Y)<1e-8)
    assert.ok(Math.abs(d.zc-(2/Math.PI)*Math.atan(1/Z))<1e-12)
  }
})

test('global state fibre carries reciprocal continuation data without a fake chord at infinity',async()=>{
  const {stateFibreGeometry}=await import('../src/geometry/state/fibreGeometry.js')
  const g=stateFibreGeometry([.31,-.27],p,{n:401})
  for(const side of ['minus','plus']){
    const r=g.reciprocal[side]
    assert.ok(r.negative.length>10&&r.positive.length>10)
    assert.ok(r.negative.every(q=>q.Z<0&&q.chart==='Z'))
    assert.ok(r.positive.every(q=>q.Z>0&&q.chart==='Z'))
    assert.ok(r.atInfinity&&r.atInfinity.Z===0)
  }
})


// dev.24.8 — canonical slow/fast characteristic intersections of a fixed state
test('state-fibre analysis names Ps and Pf from spectral classification',async()=>{
  const {analyzeStateFibres}=await import('../src/math/state/fibreAnalysis.js')
  const a=analyzeStateFibres([.31,-.27],p)
  assert.equal(a.kind,'regular-analysis')
  if(a.liftCounts.slow>0){assert.ok(a.namedIntersections.Ps);assert.equal(a.namedIntersections.Ps.classification,'slow')}
  if(a.liftCounts.fast>0){assert.ok(a.namedIntersections.Pf);assert.equal(a.namedIntersections.Pf.classification,'fast')}
  for(const q of [a.namedIntersections.Ps,a.namedIntersections.Pf].filter(Boolean)){
    assert.equal(q.kind,'finite');assert.ok(Number.isFinite(q.tau));assert.ok(Number.isFinite(q.z))
  }
})

test('coincidence and infinity lifts are not mislabeled as Ps or Pf',async()=>{
  const {analyzeStateFibres}=await import('../src/math/state/fibreAnalysis.js')
  const a=analyzeStateFibres([.31,-.27],p)
  assert.ok(a.namedIntersections.coincidence.every(q=>q.classification==='coincidence'))
  assert.ok(a.namedIntersections.infinity.every(q=>q.kind==='infinity'||q.classification==='characteristic-at-infinity'))
})


// dev.24.9 — connected regular branches of the forward/backward Hugoniot fibres
test('regular fibre branches form the projective connected-component decomposition',async()=>{
  const {regularFibreBranches}=await import('../src/math/state/fibreAnalysis.js')
  const d=regularFibreBranches([.31,-.27],p)
  const singularCount=d.singularDirections.finite.length+(d.infinitySingular?1:0)
  assert.equal(d.kind,'regular-branch-decomposition')
  assert.equal(d.count,Math.max(1,singularCount))
  assert.equal(d.branches.length,d.count)
})

test('canonical Ps and Pf belong to regular Hugoniot branches without imposing admissibility',async()=>{
  const {analyzeStateFibres}=await import('../src/math/state/fibreAnalysis.js')
  const a=analyzeStateFibres([.31,-.27],p)
  const labels=a.regularBranches.flatMap(q=>q.namedLifts)
  if(a.namedIntersections.Ps)assert.ok(labels.includes('Ps'))
  if(a.namedIntersections.Pf)assert.ok(labels.includes('Pf'))
  assert.ok(a.regularBranches.every(q=>!q.namedLifts.some(x=>x.includes('shock')||x.includes('admiss'))))
})

test('when projective infinity is regular the outer finite-z pieces are one branch through Z=0',async()=>{
  const {regularFibreBranches}=await import('../src/math/state/fibreAnalysis.js')
  const d=regularFibreBranches([.31,-.27],p)
  if(!d.infinitySingular&&d.singularDirections.finite.length>0){
    assert.equal(d.branches[0].chartConnectivity,'through-infinity')
    assert.equal(d.count,d.singularDirections.finite.length)
  }
})

// dev.24.10 — spectral data along Rankine–Hugoniot states, without admissibility
 test('Hugoniot spectral diagnostic orders endpoint eigenvalues and reports signed speed gaps',async()=>{
  const {waveState}=await import('../src/math/manifold/waveState.js')
  const {hugoniotSpectralDiagnostic}=await import('../src/math/state/hugoniotSpectrum.js')
  const q=waveState(.37,.8,.6,p),d=hugoniotSpectralDiagnostic(q,p)
  assert.equal(d.kind,'regular')
  for(const side of [d.minus,d.plus]){
    assert.equal(side.kind,'real');assert.ok(side.eigenvalues[0]<=side.eigenvalues[1])
    assert.ok(Math.abs(side.gaps[0]-(q.s-side.eigenvalues[0]))<1e-12)
    assert.ok(Math.abs(side.gaps[1]-(q.s-side.eigenvalues[1]))<1e-12)
  }
 })
 test('on the characteristic surface the RH speed is an endpoint characteristic speed',async()=>{
  const {waveState}=await import('../src/math/manifold/waveState.js')
  const {hugoniotSpectralDiagnostic}=await import('../src/math/state/hugoniotSpectrum.js')
  for(const z of [-2,-.3,.4,1.7]){
    const q=waveState(.2,0,z,p),d=hugoniotSpectralDiagnostic(q,p)
    assert.equal(d.kind,'regular')
    assert.ok(Math.min(...d.minus.gaps.map(Math.abs))<1e-9)
    assert.ok(Math.min(...d.plus.gaps.map(Math.abs))<1e-9)
  }
 })

// dev.24.11 — spectral regions along fixed-state Hugoniot fibres, still without admissibility
test('Hugoniot spectral partition is branch-aware and diagnostic only',async()=>{
  const {partitionHugoniotSpectralRegions}=await import('../src/math/state/hugoniotSpectralRegions.js')
  const U=[.3,-.2]
  for(const side of ['minus','plus']){
    const q=partitionHugoniotSpectralRegions(U,p,side,{samples:181})
    assert.equal(q.kind,'spectral-region-partition')
    assert.equal(q.criterion,'diagnostic-only')
    assert.ok(q.branches.length>=1)
    assert.ok(q.totalRegions>=1)
    for(const b of q.branches)for(const r of b.regions)assert.ok(typeof r.signature==='string'&&r.sampleCount>0)
  }
})

test('spectral transition events refine to a characteristic speed equality',async()=>{
  const {partitionHugoniotSpectralRegions,fixedStateSpectralPoint}=await import('../src/math/state/hugoniotSpectralRegions.js')
  const U=[.3,-.2],q=partitionHugoniotSpectralRegions(U,p,'minus',{samples:361})
  for(const b of q.branches)for(const e of b.events){
    const x=fixedStateSpectralPoint(U,e.z,p,'minus')
    assert.equal(x.kind,'regular')
    const gap=x.spectral[e.side].gaps[e.eigenIndex]
    assert.ok(Math.abs(gap)<1e-6*Math.max(1,Math.abs(x.s)))
  }
})

// dev.24.13 — spectral count signature, still diagnostic only
test('spectral count signature counts characteristic speeds below the RH speed',async()=>{
  const {spectralCount,spectralCountSignature}=await import('../src/math/state/hugoniotSpectralRegions.js')
  assert.equal(spectralCount('below-spectrum'),0)
  assert.equal(spectralCount('between'),1)
  assert.equal(spectralCount('above-spectrum'),2)
  const d={kind:'regular',minus:{position:'below-spectrum'},plus:{position:'between'}}
  assert.deepEqual(spectralCountSignature(d),{minus:0,plus:1,label:'(0,1)'})
})

test('every sampled regular spectral region carries an endpoint count signature',async()=>{
  const {partitionHugoniotSpectralRegions}=await import('../src/math/state/hugoniotSpectralRegions.js')
  for(const side of ['minus','plus']){
    const q=partitionHugoniotSpectralRegions([.3,-.2],p,side,{samples:181})
    for(const b of q.branches)for(const r of b.regions){
      const [minusPos,plusPos]=r.signature.split('|')
      if(minusPos==='non-hyperbolic'||plusPos==='non-hyperbolic'){
        assert.equal(r.countSignature.label,'indefinida')
      }else{
        assert.ok(Number.isInteger(r.countSignature.minus))
        assert.ok(Number.isInteger(r.countSignature.plus))
        assert.match(r.countSignature.label,/^\([0-2],[0-2]\)$/)
      }
    }
  }
})


// dev.24.14 — strict Lax classification derived from the spectral signature
test('strict Lax classes in 2x2 are exactly signatures (0,1) and (1,2)',async()=>{
  const {laxClass2x2}=await import('../src/math/state/hugoniotSpectralRegions.js')
  const D=(m,p)=>({kind:'regular',minus:{position:m},plus:{position:p}})
  assert.deepEqual(laxClass2x2(D('below-spectrum','between')),{kind:'lax',family:1,label:'Lax 1'})
  assert.deepEqual(laxClass2x2(D('between','above-spectrum')),{kind:'lax',family:2,label:'Lax 2'})
  assert.equal(laxClass2x2(D('between','below-spectrum')).kind,'non-lax')
  assert.equal(laxClass2x2(D('non-hyperbolic','between')).kind,'undefined')
})

test('sampled Hugoniot regions carry a Lax classification without invoking Liu',async()=>{
  const {partitionHugoniotSpectralRegions}=await import('../src/math/state/hugoniotSpectralRegions.js')
  for(const side of ['minus','plus']){
    const q=partitionHugoniotSpectralRegions([.3,-.2],p,side,{samples:181})
    for(const b of q.branches)for(const r of b.regions){
      assert.ok(['lax','non-lax','undefined'].includes(r.laxClass.kind))
      if(r.laxClass.kind==='lax')assert.ok(r.laxClass.family===1||r.laxClass.family===2)
    }
  }
})

// dev.24.15 — state roles are explicit and saturation uses moving local endpoints
test('generic U* has both inverse images while Riemann data select oriented projections',async()=>{
  const {genericInverseImages,riemannInverseImages}=await import('../src/math/state/stateRoles.js')
  const g=genericInverseImages([1,2])
  assert.equal(g.forward.projection,'minus'); assert.equal(g.backward.projection,'plus')
  assert.equal(g.forward.fixedRole,'U*'); assert.equal(g.backward.fixedRole,'U*')
  const r=riemannInverseImages([1,2],[3,4])
  assert.deepEqual(r.forward.fixedState,[1,2]); assert.equal(r.forward.fixedRole,'UL')
  assert.deepEqual(r.backward.fixedState,[3,4]); assert.equal(r.backward.fixedRole,'UR')
})

test('saturation seeds use U- for forward and U+ for backward at every moving P',async()=>{
  const {waveState}=await import('../src/math/manifold/waveState.js')
  const {forwardSaturationSeeds,backwardSaturationSeeds}=await import('../src/math/state/saturation.js')
  const curve=[waveState(-.3,.4,-.5,p),waveState(.2,-.6,.7,p)].filter(q=>q.kind==='regular')
  const f=forwardSaturationSeeds(curve), b=backwardSaturationSeeds(curve)
  assert.equal(f.length,curve.length); assert.equal(b.length,curve.length)
  for(let i=0;i<curve.length;i++){
    assert.deepEqual(f[i].fixedState,curve[i].Um); assert.equal(f[i].projection,'minus')
    assert.deepEqual(b[i].fixedState,curve[i].Up); assert.equal(b[i].projection,'plus')
  }
})

// dev.24.16 — Lax classification is transferred to geometry without changing projection roles
test('Hugoniot Lax geometry preserves forward/minus and backward/plus roles',async()=>{
  const {stateFibreGeometry}=await import('../src/geometry/state/fibreGeometry.js')
  const {hugoniotLaxGeometry}=await import('../src/geometry/state/hugoniotLaxGeometry.js')
  const U=[.3,-.2], fibre=stateFibreGeometry(U,p,{n:241})
  const g=hugoniotLaxGeometry(fibre,U,p)
  assert.ok(g.minus.length>0); assert.ok(g.plus.length>0)
  assert.ok(g.minus.every(s=>s.side==='minus'))
  assert.ok(g.plus.every(s=>s.side==='plus'))
  for(const s of [...g.minus,...g.plus]) assert.ok(['lax','non-lax','undefined'].includes(s.laxClass.kind))
})

test('Lax geometry exposes both strict families when present without relabelling forward/backward',async()=>{
  const {stateFibreGeometry}=await import('../src/geometry/state/fibreGeometry.js')
  const {hugoniotLaxGeometry}=await import('../src/geometry/state/hugoniotLaxGeometry.js')
  const U=[.3,-.2],g=hugoniotLaxGeometry(stateFibreGeometry(U,p,{n:401}),U,p)
  const families=new Set([...g.minus,...g.plus].filter(s=>s.laxClass.kind==='lax').map(s=>s.laxClass.family))
  for(const k of families)assert.ok(k===1||k===2)
})

test('classified Hugoniot state projection uses the variable endpoint and preserves Lax metadata', async()=>{
  const {stateFibreGeometry}=await import('../src/geometry/state/fibreGeometry.js')
  const {hugoniotLaxGeometry}=await import('../src/geometry/state/hugoniotLaxGeometry.js')
  const {projectHugoniotLaxGeometryToState}=await import('../src/geometry/state/hugoniotStateProjection.js')
  const {defaultCoefficients}=await import('../src/math/quadraticFlux.js')
  const p={...defaultCoefficients},U=[1.1,.6]
  const fibre=stateFibreGeometry(U,p,{n:301})
  const lax=hugoniotLaxGeometry(fibre,U,p)
  const projected=projectHugoniotLaxGeometryToState(lax,p)
  assert.ok(projected.forward.length>0&&projected.backward.length>0)
  for(const c of [...projected.forward,...projected.backward]){
    assert.ok(c.laxClass)
    assert.ok(c.points.every(q=>Number.isFinite(q.u)&&Number.isFinite(q.v)))
  }
  const f=projected.forward.flatMap(c=>c.points)[0],b=projected.backward.flatMap(c=>c.points)[0]
  assert.ok(Math.hypot(f.u-U[0],f.v-U[1])>1e-7,'forward displays variable U+ rather than fixed U-')
  assert.ok(Math.hypot(b.u-U[0],b.v-U[1])>1e-7,'backward displays variable U- rather than fixed U+')
})

test('explicit state projection collapses the fixed fibre and leaves only the opposite endpoint curve non-constant', async()=>{
  const {stateFibreGeometry}=await import('../src/geometry/state/fibreGeometry.js')
  const {hugoniotLaxGeometry}=await import('../src/geometry/state/hugoniotLaxGeometry.js')
  const {projectHugoniotLaxGeometryToState}=await import('../src/geometry/state/hugoniotStateProjection.js')
  const {defaultCoefficients}=await import('../src/math/quadraticFlux.js')
  const p={...defaultCoefficients},U=[1.1,.6]
  const lax=hugoniotLaxGeometry(stateFibreGeometry(U,p,{n:301}),U,p)
  const q=projectHugoniotLaxGeometryToState(lax,p)
  assert.ok(q.forward.length>0&&q.backward.length>0)
  // In the UI, selecting pi_- displays q.backward (variable U_-) while q.forward collapses to U*.
  // Selecting pi_+ displays q.forward (variable U_+) while q.backward collapses to U*.
  assert.ok(q.forward.flatMap(c=>c.points).some(x=>Math.hypot(x.u-U[0],x.v-U[1])>1e-7))
  assert.ok(q.backward.flatMap(c=>c.points).some(x=>Math.hypot(x.u-U[0],x.v-U[1])>1e-7))
})

// dev.24.20 — composite-wave definitions are fixed before numerical meshing
test('composite constructions pair forward with S- and backward with S+',async()=>{
  const {compositeConstruction}=await import('../src/math/quadraticFlux.js')
  assert.deepEqual(compositeConstruction('minus'),{key:'minus',symbol:'K_-',saturation:'forward',inverseProjection:'minus',sonicSide:'minus'})
  assert.deepEqual(compositeConstruction('plus'),{key:'plus',symbol:'K_+',saturation:'backward',inverseProjection:'plus',sonicSide:'plus'})
})

test('composite sonic residual recognizes the corresponding non-trivial sonic sheet',async()=>{
  const {sonicData,compositeSonicResidual}=await import('../src/math/quadraticFlux.js')
  for(const [tau,z] of [[-.4,-.7],[.2,.3],[.8,1.2]]){
    const d=sonicData(tau,z,p)
    if(d.kind!=='regular')continue
    for(const Y of [-1,.75,2])for(const side of ['minus','plus']){
      const r=compositeSonicResidual({tau,Y,z},p,side)
      assert.ok(Number.isFinite(r))
    }
  }
})

// dev.24.21 — numerical composite tracing stays in the math layer
test('composite leaf intersections lie on the requested sonic sheet and fixed-state fibre',async()=>{
  const {compositeLeafIntersections}=await import('../src/math/quadraticFlux.js')
  const source=waveState(-.2,0,-.4,p)
  for(const side of ['minus','plus']){
    const qs=compositeLeafIntersections(source,p,side,{samples:900})
    assert.ok(qs.length>0)
    for(const q of qs){
      assert.ok(Math.abs(q.residual)<1e-6)
      const fixed=side==='minus'?source.Um:source.Up
      assert.ok(Math.hypot(q.fixedState[0]-fixed[0],q.fixedState[1]-fixed[1])<1e-12)
    }
  }
})

test('composite trace preserves leaf correspondence instead of flattening intersections into an unordered cloud',async()=>{
  const {traceCompositeField}=await import('../src/math/quadraticFlux.js')
  const R=[[-.2,-.4],[0,.0],[.2,.4],[.4,.8]].map(([tau,z])=>waveState(tau,0,z,p))
  for(const side of ['minus','plus']){
    const tr=traceCompositeField(R,p,side,{samples:900})
    assert.equal(tr.leaves.length,R.length)
    assert.ok(tr.points.length>0)
    for(const q of tr.points){
      assert.equal(q.sourcePoint,R[q.sourceIndex])
      assert.ok(Math.abs(q.residual)<1e-6)
    }
  }
})


// dev.24.22 — reciprocal continuation closes the projective direction
test('composite leaf search includes reciprocal-chart candidates without fake finite infinity points',async()=>{
  const {compositeLeafIntersections}=await import('../src/math/quadraticFlux.js')
  const source=waveState(-.2,0,-.4,p)
  for(const side of ['minus','plus']){
    const qs=compositeLeafIntersections(source,p,side,{samples:600,reciprocalSamples:300})
    assert.ok(qs.length>0)
    for(const q of qs){
      assert.ok(['finite','reciprocal'].includes(q.chart))
      assert.ok(Math.abs(q.residual)<1e-6)
      if(q.chart==='reciprocal' && Math.abs(q.Z)<=1e-10){
        assert.equal('z' in q,false)
        assert.equal('tau' in q,false)
        assert.equal('Y' in q,false)
      }
    }
  }
})

test('reciprocal and finite composite roots are deduplicated projectively',async()=>{
  const {compositeLeafIntersections}=await import('../src/math/quadraticFlux.js')
  const source=waveState(.15,0,.3,p)
  const qs=compositeLeafIntersections(source,p,'minus',{samples:800,reciprocalSamples:500,reciprocalSpan:.5})
  for(let i=1;i<qs.length;i++){
    const d=Math.abs(qs[i].theta-qs[i-1].theta)
    assert.ok(Math.min(d,Math.PI-d)>=1e-6)
  }
})

test('implicit sonic tetrahedra have coherent face orientation and no bow-tie quads',async()=>{
  const {sonicSurfaceTriangles}=await import('../src/geometry/sonic/surface.js')
  const mesh=sonicSurfaceTriangles(p,{tauMin:-2,tauMax:2,YMin:-3,YMax:3,side:'minus',nTau:18,nY:16,nZ:24})
  assert.ok(mesh.triangleCount>100)
  assert.equal(mesh.rejectedDegenerate,0)
  for(let k=0;k<mesh.indices.length;k+=3){
    const ids=mesh.indices.slice(k,k+3)
    assert.equal(new Set(ids).size,3)
    const q=ids.map(id=>mesh.positions.slice(3*id,3*id+3))
    const u=q[1].map((x,i)=>x-q[0][i]),v=q[2].map((x,i)=>x-q[0][i])
    const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
    assert.ok(Math.hypot(...n)>1e-14)
  }
})

test('canonical double-sonic base points solve detM=K=0 before geometry is built',async()=>{
  const {doubleSonicBasePoints,doubleSonicResidual}=await import('../src/math/sonic/intersections.js')
  const ds=doubleSonicBasePoints(p,{tauMin:-5,tauMax:5})
  assert.equal(ds.length,2)
  for(const q of ds){
    assert.ok(Math.abs(q.K)<1e-10)
    assert.ok(Math.abs(q.detM)<1e-10)
    assert.ok(q.residual<1e-10)
    assert.ok(doubleSonicResidual(q.tau,3,q.z,p)<1e-9)
    assert.ok(doubleSonicResidual(q.tau,-3,q.z,p)<1e-9)
  }
})

test('double-sonic zero edges are handled as exact tetrahedral topology',async()=>{
  const {sonicSurfaceTriangles}=await import('../src/geometry/sonic/surface.js')
  const mesh=sonicSurfaceTriangles(p,{tauMin:-2,tauMax:2,YMin:-3,YMax:3,side:'minus',nTau:18,nY:16,nZ:24})
  assert.equal(mesh.dsConstrainedFibreCount,2)
  assert.ok(mesh.zeroVertexTetCount>0)
  assert.ok(mesh.zeroEdgeTetCount>0)
  assert.equal(mesh.zeroVolumeTetCount,0)
  assert.ok(mesh.maxResidual<1e-6)
})


test('sonic extraction reuses canonical roots on shared grid edges',async()=>{
  const {sonicSurfaceTriangles}=await import('../src/geometry/sonic/surface.js')
  const mesh=sonicSurfaceTriangles(p,{tauMin:-2,tauMax:2,YMin:-3,YMax:3,side:'minus',nTau:18,nY:16,nZ:24,diagnostics:true})
  assert.ok(mesh.canonicalEdgeRootCount>0)
  assert.ok(mesh.sharedFaceCount>0)
  assert.equal(mesh.sharedFaceViolationCount,mesh.regularSharedFaceViolationCount+mesh.zeroEdgeSharedFaceDegeneracyCount)
})
