/** Geometry adapter for a self-similar rarefaction fan in physical space (x,t). */
export function rarefactionFanGeometry(solution,{tMax=1}={}){
  if(solution?.kind!=='rarefaction'||!(tMax>0))return null
  const xiMin=solution.xiMin,xiMax=solution.xiMax
  return {origin:{x:0,t:0},left:{x:xiMin*tMax,t:tMax},right:{x:xiMax*tMax,t:tMax},xiMin,xiMax,tMax,rays:solution.states.map(q=>({x:q.s*tMax,t:tMax,xi:q.s,u:q.u,v:q.v,tau:q.tau,zc:q.zc}))}
}
