import { sonicImplicit } from '../../math/sonic/sonic.js'
import { betheWendroffData } from '../../math/sonic/betheWendroff.js'
import { zFromZc } from '../../math/charts/zChart.js'
import { stitchBtSegments } from './smoothBtCurve.js'

// Coordinates are (tau,Y,zc). Only the minus locus is integrated;
// the plus locus is its dagger reflection in the renderer.
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0)
const norm=a=>Math.hypot(...a)
const sub=(a,b)=>a.map((v,i)=>v-b[i])
const add=(a,b,k=1)=>a.map((v,i)=>v+k*b[i])
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const finite=a=>a?.every(Number.isFinite)

export function btImplicitResidual(q,p){
  if(!finite(q)||Math.abs(q[2])>=0.999999)return null
  const z=zFromZc(q[2])
  const S=sonicImplicit(q[0],q[1],z,p,'minus')
  const bt=betheWendroffData(q[0],q[1],q[2],p,'minus')
  return bt.kind==='regular'&&Number.isFinite(S)&&Number.isFinite(bt.trace)?[S,bt.trace]:null
}
function differential(q,p){
  const f=btImplicitResidual(q,p)
  if(!f)return null
  const columns=[]
  for(let i=0;i<3;i++){
    const h=1e-5*Math.max(1,Math.abs(q[i]))
    const plus=[...q],minus=[...q]
    plus[i]+=h;minus[i]-=h
    const fp=btImplicitResidual(plus,p),fm=btImplicitResidual(minus,p)
    if(!fp||!fm)return null
    columns.push([(fp[0]-fm[0])/(2*h),(fp[1]-fm[1])/(2*h)])
  }
  const a=columns.map(c=>c[0]),b=columns.map(c=>c[1])
  const tangent=cross(a,b),m=norm(tangent)
  if(!Number.isFinite(m)||m<1e-10*Math.max(1,norm(a)*norm(b)))return null
  return {f,a,b,tangent:tangent.map(v=>v/m)}
}
function solve3(rows,rhs){
  const a=rows.map((r,i)=>[...r,rhs[i]])
  for(let k=0;k<3;k++){
    let pivot=k
    for(let j=k+1;j<3;j++)if(Math.abs(a[j][k])>Math.abs(a[pivot][k]))pivot=j
    if(Math.abs(a[pivot][k])<1e-13)return null
    ;[a[k],a[pivot]]=[a[pivot],a[k]]
    const d=a[k][k]
    for(let j=k;j<4;j++)a[k][j]/=d
    for(let i=0;i<3;i++)if(i!==k){const m=a[i][k];for(let j=k;j<4;j++)a[i][j]-=m*a[k][j]}
  }
  return a.map(r=>r[3])
}
function correct(predictor,tangent,p){
  let q=[...predictor]
  for(let i=0;i<10;i++){
    const d=differential(q,p)
    if(!d)return null
    const f=[...d.f,dot(sub(q,predictor),tangent)]
    if(Math.max(...f.map(Math.abs))<1e-8)return q
    const step=solve3([d.a,d.b,tangent],f)
    if(!step||!finite(step)||norm(step)>0.35)return null
    q=sub(q,step)
  }
  const f=btImplicitResidual(q,p)
  return f&&Math.max(...f.map(Math.abs))<1e-7?q:null
}
function inside(q,b){return q[0]>=b.tauMin&&q[0]<=b.tauMax&&q[1]>=b.YMin&&q[1]<=b.YMax&&Math.abs(q[2])<=b.zcMax}
function integrate(seed,sign,p,b,opts){
  const points=[seed],stepMax=opts.step??0.035,steps=opts.maxSteps??1000
  let step=stepMax
  for(let i=0;i<steps;i++){
    const current=points.at(-1),d=differential(current,p)
    if(!d)break
    let t=d.tangent
    if(points.length>1){const previous=sub(current,points.at(-2));if(dot(t,previous)<0)t=t.map(v=>-v)}
    else t=t.map(v=>sign*v)
    let next=null,trial=step
    for(let retry=0;retry<12;retry++){
      const predictor=add(current,t,trial)
      if(!inside(predictor,b)){trial/=2;continue}
      const q=correct(predictor,t,p)
      if(q&&inside(q,b)&&norm(sub(q,current))<=trial*1.6&&dot(sub(q,current),t)>trial*0.25){
        if(points.length>1){
          const old=sub(current,points.at(-2)),newStep=sub(q,current)
          const cosine=dot(old,newStep)/(norm(old)*norm(newStep))
          // A sharp turn in one short step is more likely a branch jump
          // or underresolved fold than a faithful continuation step.
          if(!Number.isFinite(cosine)||cosine<Math.cos(Math.PI/9)){trial/=2;continue}
        }
        next=q;break
      }
      trial/=2
    }
    if(!next||trial<stepMax/4096)break
    if(points.length>12&&norm(sub(next,seed))<stepMax*0.6&&dot(sub(next,current),sub(points[1],seed))>0){points.push(seed);break}
    points.push(next)
    step=Math.min(stepMax,trial*1.35)
  }
  return points
}

// Predictor-corrector continuation with pseudo-arclength constraint.
// Triangulation is used ONLY to supply seeds and identify candidate components;
// no BT vertex is interpolated from a triangle in the resulting curves.
function nearCurve(q,curve,tolerance){
  const tol2=tolerance*tolerance
  for(const v of curve){
    const dx=q[0]-v[0],dy=q[1]-v[1],dz=q[2]-v[2]
    if(dx*dx+dy*dy+dz*dz<tol2)return true
  }
  return false
}
function candidateSeeds(source){
  // Sample the full original component, not just its midpoint: continuation
  // may stop at a fold even when the implicit curve continues beyond it.
  const candidates=[]
  const stride=Math.max(1,Math.floor(source.length/14))
  for(let i=0;i<source.length;i+=stride)candidates.push(source[i])
  if(candidates.at(-1)!==source.at(-1))candidates.push(source.at(-1))
  return candidates
}
function joinCompatible(a,b,tolerance){
  if(a.length<3||b.length<3)return null
  const combinations=[
    [a,b], [a,[...b].reverse()], [[...a].reverse(),b],
    [[...a].reverse(),[...b].reverse()],
  ]
  for(const [left,right] of combinations){
    const u=left.at(-1),v=right[0]
    if(norm(sub(u,v))>tolerance)continue
    const ta=sub(u,left.at(-2)),tb=sub(right[1],v)
    const m=norm(ta)*norm(tb)
    if(m===0||dot(ta,tb)/m<0.93)continue
    const joined=[...left,...right.slice(1)]
    return joined
  }
  return null
}

// Multi-seed, bidirectional pseudo-arclength continuation. Each candidate
// is projected onto BOTH equations. Incompatible branches are never joined.
export function continueBtMinus(segments,p,bounds,options={}){
  const sources=stitchBtSegments(segments)
  const curves=[]
  const step=options.step??0.035
  const coverage=options.coverageTolerance??step*1.2
  for(const source of sources){
    if(source.length<2)continue
    for(const candidate of candidateSeeds(source)){
      if(curves.some(curve=>nearCurve(candidate,curve,coverage)))continue
      const d=differential(candidate,p)
      if(!d)continue
      const seed=correct(candidate,d.tangent,p)
      if(!seed||curves.some(curve=>nearCurve(seed,curve,coverage)))continue
      const forward=integrate(seed,1,p,bounds,options)
      const backward=integrate(seed,-1,p,bounds,options)
      const path=[...backward.slice(1).reverse(),...forward]
      if(path.length<3)continue
      // A seed may be numerically near a different branch of the old mesh;
      // only the projected implicit points are retained.
      curves.push(path)
    }
  }
  // Join only endpoints with aligned tangents; proximity alone can
  // incorrectly connect the two sides of a sharp fold.
  let merged=true
  while(merged){
    merged=false
    outer:for(let i=0;i<curves.length;i++)for(let j=i+1;j<curves.length;j++){
      const joined=joinCompatible(curves[i],curves[j],step*0.6)
      if(joined){curves[i]=joined;curves.splice(j,1);merged=true;break outer}
    }
  }
  return curves
}
