import {pathToFileURL} from 'node:url'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'
import {rarefactionPairCandidates,evaluateRarefactionPair} from '../src/math/solution/rarefactionPairCandidates.js'

// Independent coordinate ODE for a triangular quadratic flux, slow lambda=u.
export function referenceV(u,b20=.5,n=4096){
  let v=0
  const h=u/n,f=(x,y)=>2*b20*x/(x-2-y)
  for(let i=0;i<n;i++){
    const x=i*h,a=f(x,v),b=f(x+h/2,v+h*a/2),c=f(x+h/2,v+h*b/2),d=f(x+h,v+h*c)
    v+=h*(a+2*b+2*c+d)/6
  }
  return v
}

export function rrStudy(b20=.5){
  const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20,b11:0,b02:.5,b10:0,b01:2}
  const states={left:[0,0],right:[.5,.5]},v=referenceV(.5,b20)
  const source=riemannMonotoneRarefactions(states,p,{step:.0025,tolerance:1e-12,maxLength:1,maxSteps:10000,boundedLength:true})
  const rows=[]
  for(const samplingStep of [.08,.04,.02]){
    // Decimate the same fine integration: isolate sampling from ODE accuracy.
    const branches=source.map(branch=>{
      const indices=[0]
      for(let i=1;i<branch.points.length;i++)
        if(branch.parameters[i]-branch.parameters[indices.at(-1)]>=samplingStep||i===branch.points.length-1)indices.push(i)
      return {...branch,points:indices.map(i=>branch.points[i]),parameters:indices.map(i=>branch.parameters[i])}
    })
    for(const integrationStep of [.08,.04,.02,.01]){
      const q=rarefactionPairCandidates(states,branches,p,{corrector:{integrationStep,residualTolerance:1e-13}})[0]
      if(!q)throw new Error('Missing corrected RR candidate')
      const xis=[.137,.25,.413,1,2.1,2.25]
      const profileError=Math.max(...xis.map(xi=>{
        const exact=xi<.5?[xi,referenceV(xi,b20)]:xi<2+v?[.5,v]:[.5,xi-2]
        const U=evaluateRarefactionPair(q,xi)
        return Math.hypot(...U.map((x,i)=>x-exact[i]))
      }))
      rows.push({samplingStep,integrationStep,residual:q.refinement.residual,
        middleError:Math.abs(q.middle[1]-v),profileError,conditionNumber:q.refinement.conditionNumber})
    }
  }
  return {b20,reference:[.5,v],referenceDifference:Math.abs(v-referenceV(.5,b20,8192)),rows}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  for(const b20 of [.5,1])console.log(JSON.stringify(rrStudy(b20),null,2))

