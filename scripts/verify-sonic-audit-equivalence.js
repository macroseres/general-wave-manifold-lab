import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'

const domain={tauMin:-5,tauMax:5,YMin:-6,YMax:6,nTau:34,nY:28,nZ:50}
const results=[]
for(const side of ['minus','plus']){
  const started=performance.now()
  const audited=sonicSurfaceTriangles(defaultCoefficients,{...domain,side,diagnostics:true})
  const auditMs=Math.round(performance.now()-started)
  const fastStart=performance.now()
  const fast=sonicSurfaceTriangles(defaultCoefficients,{...domain,side,diagnostics:false})
  const fastMs=Math.round(performance.now()-fastStart)
  assert.deepStrictEqual(fast.positions,audited.positions,`${side}: positions differ`)
  assert.deepStrictEqual(fast.indices,audited.indices,`${side}: indices differ`)
  assert.deepStrictEqual(Float32Array.from(fast.positions),Float32Array.from(audited.positions),`${side}: Float32 positions differ`)
  assert.deepStrictEqual(Uint32Array.from(fast.indices),Uint32Array.from(audited.indices),`${side}: Uint32 indices differ`)
  results.push({side,identical:true,vertices:fast.vertexCount,triangles:fast.triangleCount,sharedFaceViolationsWithAudit:audited.sharedFaceViolationCount,auditMs,fastMs})
}
console.log(JSON.stringify({mode:'manual-sonic-audit-equivalence',resolution:{nTau:34,nY:28,nZ:50},results,note:'Exact array equality at default coefficients and domain; not a proof for every parameter choice.'},null,2))
