import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicData } from '../src/math/sonic/sonic.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
import { zFromZc } from '../src/math/charts/zChart.js'

// Offline differential investigation at the vertex found by the topology audit.
// All derivatives are taken in display coordinates (tau, Y, zc).
const domain = { tauMin:-5, tauMax:5, YMin:-6, YMax:6, zcMin:-.999, zcMax:.999, nTau:34, nY:28, nZ:50 }
const target = [0, 0, 0.9979731775]
const closestPoint = (side) => {
  const mesh = sonicSurfaceTriangles(defaultCoefficients, {...domain, side, diagnostics:false})
  let best=Infinity, P=null
  for(let i=0;i<mesh.positions.length;i+=3){
    const q=Array.from(mesh.positions.slice(i,i+3))
    const d=Math.hypot(...q.map((v,j)=>v-target[j]))
    if(d<best){best=d;P=q}
  }
  return P
}
const h = [1e-5, 1e-5, 1e-7]
const p = defaultCoefficients
const evaluate = (q, side) => {
  const d = sonicData(q[0], zFromZc(q[2]), p)
  return d.kind === 'regular' ? q[1] * d.detM + (side === 'minus' ? -2 : 2) * d.K : NaN
}
const gradient = (q, side, steps=h) => q.map((_, i) => {
  const plus = [...q], minus = [...q]
  plus[i] += steps[i]; minus[i] -= steps[i]
  return (evaluate(plus, side) - evaluate(minus, side)) / (2 * steps[i])
})
const norm = a => Math.hypot(...a)
const dot = (a,b) => a.reduce((s,x,i) => s + x*b[i],0)
const point = (zc) => [0,0,zc]
const zcSamples = [0.95904, 0.99, 0.997, target[2], 0.998, 0.9989, 0.999]
const results = ['minus','plus'].map(side => {
  const P = closestPoint(side)
  const g = gradient(P, side)
  const gNorm = norm(g)
  const samples = zcSamples.map(zc => {
    const q=point(zc), d=sonicData(0,zFromZc(zc),p)
    const grad=gradient(q,side)
    return {zc, phi:evaluate(q,side), K:d.K, detM:d.detM, gradient:grad, gradientNorm:norm(grad), geometricNewtonDistanceEstimate: Math.abs(evaluate(q,side))/norm(grad)}
  })
  const sensitivity = [1, 0.1, 0.01].map(scale => { const steps=h.map(x=>x*scale); const gg=gradient(P,side,steps); return {scale,gradient:gg,gradientNorm:norm(gg)} })
  return {side, derivativeStepSensitivity:sensitivity, atP:{point:P, phi:evaluate(P,side), gradient:g, gradientNorm:gNorm, regularByGradient:Number.isFinite(gNorm)&&gNorm>0, tangentPlaneNormal:g.map(x=>x/gNorm)}, axisSamples:samples}
})
const gMinus=results[0].atP.gradient, gPlus=results[1].atP.gradient
const cosine=dot(gMinus,gPlus)/(norm(gMinus)*norm(gPlus))
console.log(JSON.stringify({mode:'sonic-local-differential-audit',coordinates:['tau','Y','zc'],target,finiteDifferenceSteps:h,notes:['Numerical central differences; zc near 1 is ill-conditioned.','Gradient nonzero certifies local regularity only if the implicit function is differentiable at the point.','A small residual or Newton distance estimate does not certify a correct mesh boundary.','No production geometry or Worker changes.'],normalComparison:{cosine,absoluteCosine:Math.abs(cosine)},results},null,2))
