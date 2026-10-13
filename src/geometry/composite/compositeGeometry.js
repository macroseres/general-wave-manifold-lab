function isReciprocal(Q){return Q?.chart==='reciprocal'||Q?.reciprocal===true}
function finiteCoordinates(Q){
  if(!Q)return null
  if(isReciprocal(Q)){
    if(!Number.isFinite(Q.Z)||Q.Z===0)return null
    const z=1/Q.Z,tau=Q.eta*Q.Z*Q.Z,Y=Q.Upsilon*Q.Z
    return [tau,Y,z].every(Number.isFinite)?{tau,Y,z}:null
  }
  return [Q.tau,Q.Y,Q.z].every(Number.isFinite)?{tau:Q.tau,Y:Q.Y,z:Q.z}:null
}
function zc(z){return (2/Math.PI)*Math.atan(z)}
export function compositeDisplayPoint(Q,{tauScale=1,YScale=1,zScale=1}={}){
  const q=finiteCoordinates(Q); if(!q)return null
  return {x:tauScale*q.tau,y:YScale*q.Y,z:zScale*zc(q.z),mathematical:q}
}
export function auditCompositeBranches(branches,{tauMin=-Infinity,tauMax=Infinity,YMin=-Infinity,YMax=Infinity}={}){
  const audit={points:0,insideWindow:0,outsideWindow:0,segments:0,crossChartSegments:0,maxDeltaTau:0,maxDeltaY:0,maxDeltaZc:0,worstSegment:null}
  for(const branch of branches??[]){
    let previous=null
    for(const point of branch.points??[]){
      const q=finiteCoordinates(point.Q)
      if(!q){previous=null;continue}
      audit.points++
      const inside=q.tau>=tauMin&&q.tau<=tauMax&&q.Y>=YMin&&q.Y<=YMax
      if(inside)audit.insideWindow++;else audit.outsideWindow++
      if(previous){
        const dt=Math.abs(q.tau-previous.q.tau),dy=Math.abs(q.Y-previous.q.Y),rawDz=Math.abs(zc(q.z)-zc(previous.q.z)),dz=Math.min(rawDz,2-rawDz)
        audit.segments++; if(isReciprocal(point.Q)!==isReciprocal(previous.point.Q))audit.crossChartSegments++
        audit.maxDeltaTau=Math.max(audit.maxDeltaTau,dt);audit.maxDeltaY=Math.max(audit.maxDeltaY,dy);audit.maxDeltaZc=Math.max(audit.maxDeltaZc,dz)
        const score=Math.max(dt/Math.max(1,tauMax-tauMin),dy/Math.max(1,YMax-YMin),dz/2)
        if(!audit.worstSegment||score>audit.worstSegment.score)audit.worstSegment={score,deltaTau:dt,deltaY:dy,deltaZc:dz,from:previous.q,to:q}
      }
      previous={q,point}
    }
  }
  return audit
}
function inside(q,w){return q.tau>=w.tauMin&&q.tau<=w.tauMax&&q.Y>=w.YMin&&q.Y<=w.YMax}
function clipSegment(a,b,w){
  let t0=0,t1=1
  const dx=b.tau-a.tau,dy=b.Y-a.Y
  const tests=[[-dx,a.tau-w.tauMin],[dx,w.tauMax-a.tau],[-dy,a.Y-w.YMin],[dy,w.YMax-a.Y]]
  for(const [p,q] of tests){
    if(p===0){if(q<0)return null;continue}
    const r=q/p
    if(p<0){if(r>t1)return null;if(r>t0)t0=r}
    else {if(r<t0)return null;if(r<t1)t1=r}
  }
  const lerp=t=>({tau:a.tau+dx*t,Y:a.Y+dy*t,z:a.z+(b.z-a.z)*t})
  return [lerp(t0),lerp(t1)]
}
export function compositeBranchGeometry(branch,scales={},window=null){
  const segments=[];let current=[]
  const push=()=>{if(current.length){segments.push(current);current=[]}}
  let prev=null
  for(const point of branch.points??[]){
    if(point.certificate&&!point.certificate.valid){push();prev=null;continue}
    const q=finiteCoordinates(point.Q)
    if(!q){push();prev=null;continue}
    if(!window){const display=compositeDisplayPoint(point.Q,scales);if(display)current.push({...display,source:point});prev={q,point};continue}
    if(prev){
      // z=+infinity and z=-infinity are one projective direction, but the
      // visual z-hat chart duplicates that point at opposite borders. Never
      // draw a straight chord across the interior of the plot.
      const rawZcJump=Math.abs(zc(q.z)-zc(prev.q.z))
      if(rawZcJump>1){
        push()
        if(inside(q,window)){
          const display=compositeDisplayPoint(point.Q,scales);if(display)current.push({...display,source:point})
        }
        prev={q,point};continue
      }
      const clipped=clipSegment(prev.q,q,window)
      if(clipped){
        const map=(c,source)=>({x:(scales.tauScale??1)*c.tau,y:(scales.YScale??1)*c.Y,z:(scales.zScale??1)*zc(c.z),mathematical:c,source})
        if(!current.length)current.push(map(clipped[0],prev.point))
        current.push(map(clipped[1],point))
      }else push()
    }else if(inside(q,window)){
      const display=compositeDisplayPoint(point.Q,scales);if(display)current.push({...display,source:point})
    }
    prev={q,point}
  }
  push();return {branchId:branch.branchId,segments}
}
export function compositeGeometry(branches,scales={},window=null){return (branches??[]).map(branch=>compositeBranchGeometry(branch,scales,window))}
