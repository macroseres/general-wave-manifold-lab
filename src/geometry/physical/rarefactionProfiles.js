import {rarefactionStateAtXi} from '../../math/solution/rarefactionSolution.js'

/** Plot data for an already validated self-similar rarefaction candidate.
 * End states are constant extensions of the selected orbit, NOT a certified
 * global Riemann solution or an admissibility test for shocks.
 */
export function rarefactionPhysicalProfiles(solution,{time=1,tMax=time,samples=201,xMin,xMax}={}){
  if(solution?.kind!=='rarefaction'||!Number.isFinite(time)||time<=0||!Number.isFinite(tMax)||tMax<=0)return null
  const left=Number.isFinite(xMin)?xMin:Math.min(0,solution.xiMin*tMax)-Math.max(1,(solution.xiMax-solution.xiMin)*tMax*.2)
  const right=Number.isFinite(xMax)?xMax:Math.max(0,solution.xiMax*tMax)+Math.max(1,(solution.xiMax-solution.xiMin)*tMax*.2)
  if(!(right>left)||!Number.isInteger(samples)||samples<2||samples>10001)return null
  const points=[]
  for(let i=0;i<samples;i++){
    const x=left+(right-left)*i/(samples-1)
    const state=rarefactionStateAtXi(solution,x/time)
    if(!state||!Number.isFinite(state.u)||!Number.isFinite(state.v))return null
    points.push({x,u:state.u,v:state.v,region:state.region})
  }
  return {time,xMin:left,xMax:right,points,fanLeft:solution.xiMin*time,fanRight:solution.xiMax*time}
}
