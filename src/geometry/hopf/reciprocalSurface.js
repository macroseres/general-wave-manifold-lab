import { reciprocalHopfAt } from '../../math/sonic/hopfReciprocal.js'

/** Native reciprocal-chart Hopf mesh in (free,X,Z), including Z=0.
 * This is an atlas patch, NOT a mesh in display coordinates (tau,Y,zc).
 * Rendering requires a projective atlas embedding; treating its vertices as
 * (tau,Y,zc) would be mathematically incorrect.
 */
export function reciprocalHopfSurfaceMesh(p,{
  side='minus',freeMin=-6,freeMax=6,XMin=-6,XMax=6,
  ZMin=-0.2,ZMax=0.2,nZ=64,nLine=48,
}={}){
  if(!['minus','plus'].includes(side)||![freeMin,freeMax,XMin,XMax,ZMin,ZMax].every(Number.isFinite)||
    !(freeMin<freeMax&&XMin<XMax&&ZMin<ZMax)||!Number.isInteger(nZ)||nZ<2||
    !Number.isInteger(nLine)||nLine<2)return {kind:'invalid-input',positions:[],indices:[]}
  const rows=[]
  for(let j=0;j<=nZ;j++){
    const Z=ZMin+(ZMax-ZMin)*j/nZ
    const h0=reciprocalHopfAt(0,0,Z,p,side)
    const h1=reciprocalHopfAt(1,0,Z,p,side)
    const h2=reciprocalHopfAt(0,1,Z,p,side)
    if([h0,h1,h2].some(h=>h.kind!=='regular'||h.coordinate!==h0.coordinate)){
      rows.push(null);continue
    }
    const a=h1.trace-h0.trace,b=h2.trace-h0.trace,c=h0.trace
    const ends=[]
    const add=(free,X)=>{
      if(free<freeMin-1e-9||free>freeMax+1e-9||X<XMin-1e-9||X>XMax+1e-9)return
      if(!ends.some(q=>Math.hypot(q[0]-free,q[1]-X)<1e-9))ends.push([free,X])
    }
    if(Math.abs(b)>1e-12){add(freeMin,(-c-a*freeMin)/b);add(freeMax,(-c-a*freeMax)/b)}
    if(Math.abs(a)>1e-12){add((-c-b*XMin)/a,XMin);add((-c-b*XMax)/a,XMax)}
    if(ends.length<2){rows.push(null);continue}
    ends.sort((u,v)=>(u[0]-v[0])*b-(u[1]-v[1])*a)
    const start=ends[0],end=ends[ends.length-1]
    const row=[]
    for(let i=0;i<=nLine;i++){
      const t=i/nLine,free=start[0]+t*(end[0]-start[0]),X=start[1]+t*(end[1]-start[1])
      const h=reciprocalHopfAt(free,X,Z,p,side)
      row.push(h.kind==='regular'&&Number.isFinite(h.det)?{p:[free,X,Z],d:h.det,coordinate:h.coordinate}:null)
    }
    rows.push(row)
  }
  const positions=[],indices=[]
  const clip=(poly)=>{
    const out=[]
    for(let k=0;k<poly.length;k++){
      const a=poly[k],b=poly[(k+1)%poly.length],insideA=a.d>=0,insideB=b.d>=0
      if(insideA)out.push(a)
      if(insideA!==insideB){
        const t=a.d/(a.d-b.d)
        out.push({p:a.p.map((x,i)=>x+t*(b.p[i]-x)),d:0,coordinate:a.coordinate})
      }
    }
    return out
  }
  const emit=(tri)=>{
    if(tri.some(v=>!v)||tri.some(v=>v.coordinate!==tri[0].coordinate))return
    const poly=clip(tri)
    for(let i=1;i+1<poly.length;i++){
      const a=poly[0].p,b=poly[i].p,c=poly[i+1].p
      const ab=b.map((x,k)=>x-a[k]),ac=c.map((x,k)=>x-a[k])
      const area=Math.hypot(ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0])
      if(area<1e-12)continue
      const base=positions.length/3
      positions.push(...a,...b,...c)
      indices.push(base,base+1,base+2)
    }
  }
  for(let j=0;j<nZ;j++){
    if(!rows[j]||!rows[j+1])continue
    for(let i=0;i<nLine;i++){
      const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],d=rows[j+1][i]
      emit([a,b,c]);emit([a,c,d])
    }
  }
  return {kind:'regular',chart:'reciprocal',coordinates:['free','X','Z'],positions,indices,side}
}
