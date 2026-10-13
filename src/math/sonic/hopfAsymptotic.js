import { hopfAt } from './hopf.js'

/** Diagnostics in the *fixed computational slab*, not a compactification theorem.
 * At each chart slice the trace-zero locus is an affine line in (tau,Y).
 * We clip that line to the slab and sample its determinant. A positive sample
 * certifies a Hopf point at that slice; absence is not proof of nonexistence.
 */
export function hopfSliceDiagnostic(p, { side, zc, tauMin=-1, tauMax=1, YMin=-6, YMax=6, samples=128 }={}) {
  if (!['minus','plus'].includes(side) || !Number.isFinite(zc) || Math.abs(zc)>=1 ||
      ![tauMin,tauMax,YMin,YMax].every(Number.isFinite) || tauMin>=tauMax || YMin>=YMax || samples<2) {
    return {kind:'invalid-input'}
  }
  const h0=hopfAt(0,0,zc,p,side),ht=hopfAt(1,0,zc,p,side),hy=hopfAt(0,1,zc,p,side)
  if ([h0,ht,hy].some(h=>h.kind!=='regular')) return {kind:'invalid-chart'}
  const a=ht.trace-h0.trace,b=hy.trace-h0.trace,c=h0.trace
  const norm=Math.hypot(a,b)
  if (!(norm>1e-12)) return {kind:Math.abs(c)<1e-10?'trace-identically-zero':'trace-no-zero'}
  const points=[]
  const add=(tau,Y)=>{
    if (tau<tauMin-1e-9||tau>tauMax+1e-9||Y<YMin-1e-9||Y>YMax+1e-9) return
    if(!points.some(v=>Math.hypot(v[0]-tau,v[1]-Y)<1e-8)) points.push([tau,Y])
  }
  if(Math.abs(b)>1e-12){add(tauMin,(-c-a*tauMin)/b);add(tauMax,(-c-a*tauMax)/b)}
  if(Math.abs(a)>1e-12){add((-c-b*YMin)/a,YMin);add((-c-b*YMax)/a,YMax)}
  if(points.length<2) return {kind:'outside-window',a,b,c}
  points.sort((u,v)=>(u[0]-v[0])*b-(u[1]-v[1])*a)
  const start=points[0],end=points[points.length-1]
  let minimum=Infinity,maximum=-Infinity
  const samplesOnLine=[]
  for(let i=0;i<=samples;i++){
    const f=i/samples,tau=start[0]+f*(end[0]-start[0]),Y=start[1]+f*(end[1]-start[1])
    const h=hopfAt(tau,Y,zc,p,side)
    if(h.kind!=='regular'||!Number.isFinite(h.det))return {kind:'numerical-failure'}
    minimum=Math.min(minimum,h.det);maximum=Math.max(maximum,h.det)
    samplesOnLine.push({tau,Y,det:h.det})
  }
  const detTolerance=1e-10*Math.max(1,Math.abs(minimum),Math.abs(maximum))
  const positivePoints=samplesOnLine.filter(v=>v.det>detTolerance)
  return {kind:'sampled',a,b,c,segment:[start,end],minDet:minimum,maxDet:maximum,detTolerance,positiveSamples:positivePoints.length,totalSamples:samples+1,positiveExample:positivePoints[0]??null}
}

export function hopfEndDiagnostics(p, options={}) {
  const margins=options.margins??[0.1,0.03,0.01,0.003,0.001]
  return ['minus','plus'].flatMap(side=>[-1,1].flatMap(end=>margins.map(margin=>({
    side,end,margin,zc:end*(1-margin),
    ...hopfSliceDiagnostic(p,{...options,side,zc:end*(1-margin)})
  }))))
}
