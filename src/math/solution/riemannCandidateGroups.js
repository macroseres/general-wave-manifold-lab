/** Group only numerically indistinguishable profiles; never discard a candidate. */
const point = U => Array.isArray(U) && U.length === 2 && U.every(Number.isFinite)
const near = (a,b,tol) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a-b) <= tol*(1+Math.max(Math.abs(a),Math.abs(b)))
const nearPoint = (a,b,tol) => point(a) && point(b) && near(a[0],b[0],tol) && near(a[1],b[1],tol)
const endpoints = c => c.kind === 'two-shock' ? [c.states?.[0],c.states?.[2]] : [c.left,c.right]
const middle = c => c.kind === 'two-shock' ? c.states?.[1] : c.middle
const speeds = c => c.kind === 'two-shock' ? c.speeds : [c.shockSpeed]
const evidenceKey = c => {
  const e=c.evidence??{}
  return [e.status??'',e.geometry??'',e.lax??'',e.fan??'',e.liu??''].join('|')
}
const interpolate = (arr,t) => {
  const x=t*(arr.length-1),i=Math.min(Math.floor(x),arr.length-2),a=x-i
  return [arr[i][0]*(1-a)+arr[i+1][0]*a,arr[i][1]*(1-a)+arr[i+1][1]*a]
}
function equivalent(a,b,stateTolerance,speedTolerance){
  if(a?.status!=='sampled-candidate'||b?.status!=='sampled-candidate'||a.kind!==b.kind||evidenceKey(a)!==evidenceKey(b))return false
  const ea=endpoints(a),eb=endpoints(b)
  if(!ea.every((p,i)=>nearPoint(p,eb[i],stateTolerance))||!nearPoint(middle(a),middle(b),stateTolerance))return false
  const sa=speeds(a),sb=speeds(b)
  if(!Array.isArray(sa)||!Array.isArray(sb)||sa.length!==sb.length||!sa.every((s,i)=>near(s,sb[i],speedTolerance)))return false
  if(a.kind==='two-shock')return true
  const fa=a.fanStates,fb=b.fanStates,la=a.fanSpeeds,lb=b.fanSpeeds
  if(!Array.isArray(fa)||!Array.isArray(fb)||fa.length<2||fb.length<2||!fa.every(point)||!fb.every(point)||!Array.isArray(la)||!Array.isArray(lb)||la.length!==fa.length||lb.length!==fb.length)return false
  // A distinct path or characteristic-speed profile is not a duplicate, even if U_M matches.
  for(const t of [0,.25,.5,.75,1]){
    if(!nearPoint(interpolate(fa,t),interpolate(fb,t),stateTolerance))return false
    const scalar=(arr)=>{const x=t*(arr.length-1),i=Math.min(Math.floor(x),arr.length-2);return arr[i]+(arr[i+1]-arr[i])*(x-i)}
    if(!near(scalar(la),scalar(lb),speedTolerance))return false
  }
  return true
}
/** Return one record per input candidate, with conservative duplicate-group metadata. */
export function groupRiemannCandidates(candidates,{stateTolerance=1e-5,speedTolerance=1e-6}={}){
  const values=candidates??[]
  const groups=[]
  const result=values.map((candidate,index)=>{
    let group=groups.find(g=>equivalent(g.representative,candidate,stateTolerance,speedTolerance))
    if(!group){group={id:groups.length+1,representative:candidate,indices:[]};groups.push(group)}
    group.indices.push(index)
    return {index,groupId:group.id}
  })
  return result.map(r=>({...r,groupSize:groups[r.groupId-1].indices.length,groupMembers:[...groups[r.groupId-1].indices],possibleDuplicate:groups[r.groupId-1].indices.length>1}))
}
