/** Diagnostics of observed refinement order, not a convergence proof.
 * With h, h/2, h/4 and nonzero differences d0,d1, the observed order is
 * log2(d0/d1). A small difference is not evidence of a high order.
 */
const validPoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])
export function middleConvergenceOrder(convergence,{zeroTolerance=1e-11,branchTolerance=0.15}={}){
  const rows=convergence?.rows
  if(!Array.isArray(rows)||rows.length<3||!(zeroTolerance>0)||!(branchTolerance>0))
    return {status:'insufficient-data',orders:[],branchStatus:'undetermined'}
  const matched=rows.every(r=>r.status==='matched'&&validPoint(r.middle)&&Number.isFinite(r.step)&&r.step>0)
  if(!matched)return {status:'inconclusive',orders:[],branchStatus:'undetermined'}
  const distances=rows.slice(1).map((r,i)=>dist(r.middle,rows[i].middle))
  const orders=[]
  for(let i=1;i<distances.length;i++){
    const a=distances[i-1],b=distances[i]
    const ratio=rows[i-1].step/rows[i].step
    orders.push(a>zeroTolerance&&b>zeroTolerance&&ratio>1
      ?{level:i+1,status:'estimated',value:Math.log(a/b)/Math.log(ratio)}
      :{level:i+1,status:'unresolved',value:null})
  }
  const movement=dist(rows[0].middle,rows.at(-1).middle)
  const branchStatus=movement>branchTolerance*(1+Math.hypot(...rows[0].middle))
    ?'large-displacement':'locally-tracked'
  return {status:orders.some(r=>r.status==='estimated')?'observed-order':'unresolved-order',
    distances,orders,branchStatus,endpointDisplacement:movement,
    note:'Acompanhamento baseado em proximidade; não demonstra identidade global do ramo.'}
}
