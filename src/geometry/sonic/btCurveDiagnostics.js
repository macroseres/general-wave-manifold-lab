import { btImplicitResidual } from './continueBtCurve.js'

const norm = a => Math.hypot(...a)
const difference = (a,b) => a.map((v,i)=>v-b[i])
const dot = (a,b) => a.reduce((s,v,i)=>s+v*b[i],0)

// Numerical diagnostics, not a proof of global branch completeness.
export function auditBtPaths(paths,p,{turnCosineThreshold=0.93,residualTolerance=1e-6}={}){
  let points=0,invalid=0,largeTurns=0,maxResidual=0,minCosine=1
  const bounds={tau:[Infinity,-Infinity],Y:[Infinity,-Infinity],zc:[Infinity,-Infinity]}
  for(const path of paths){
    for(let i=0;i<path.length;i++){
      const q=path[i];points++
      for(let j=0;j<3;j++){
        const interval=[bounds.tau,bounds.Y,bounds.zc][j]
        interval[0]=Math.min(interval[0],q[j]);interval[1]=Math.max(interval[1],q[j])
      }
      const r=btImplicitResidual(q,p)
      if(!r||!r.every(Number.isFinite)){invalid++;continue}
      const err=Math.max(...r.map(Math.abs));maxResidual=Math.max(maxResidual,err)
      if(err>residualTolerance)invalid++
      if(i>0&&i<path.length-1){
        const a=difference(q,path[i-1]),b=difference(path[i+1],q)
        const scale=norm(a)*norm(b)
        const cosine=scale>0?dot(a,b)/scale:-1
        minCosine=Math.min(minCosine,cosine)
        if(cosine<turnCosineThreshold)largeTurns++
      }
    }
  }
  return {polylines:paths.length,points,invalid,largeTurns,maxResidual,minCosine,bounds}
}
