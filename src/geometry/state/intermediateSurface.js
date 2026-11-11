import {zFromZc} from '../../math/charts/zChart.js'
import {waveState} from '../../math/manifold/waveState.js'
import {backwardSaturationSeeds} from '../../math/state/saturation.js'
import {stateFiberPoint} from '../../math/state/fibers.js'

/** Sample the backward saturation separately for each slow wave arc. */
export function intermediateSurface(arcs,p,intersectionDirections=[]){
  const directions=[...new Set([
    ...Array.from({length:401},(_,i)=>0.995*(i/200-1)),
    ...intersectionDirections,
  ])].sort((a,b)=>a-b)
  return arcs.map(arc=>{
    const lifted=arc.map(q=>waveState(q.tau,q.Y??0,zFromZc(q.zc),p))
    const rows=arc.map(()=>null)
    for(const {index,fixedState} of backwardSaturationSeeds(lifted)){
      rows[index]=directions.map(zc=>{
        const q=stateFiberPoint(fixedState,zFromZc(zc),p,'plus')
        if(q.kind!=='regular'||![q.tau,q.Y].every(Number.isFinite))return null
        return {position:[q.tau,q.Y,zc],sign:Math.sign(q.denominator)}
      })
    }
    const positions=[]
    const appendTriangle=(a,b,c)=>{
      // Keep regular triangles on the same side of a fibre pole.
      if(!a||!b||!c||a.sign!==b.sign||a.sign!==c.sign)return
      positions.push(...a.position,...b.position,...c.position)
    }
    for(let i=1;i<rows.length;i++){
      if(!rows[i-1]||!rows[i])continue
      for(let j=1;j<directions.length;j++){
        const a=rows[i-1][j-1],b=rows[i-1][j],c=rows[i][j-1],d=rows[i][j]
        appendTriangle(a,b,c)
        appendTriangle(b,d,c)
      }
    }
    return new Float32Array(positions)
  })
}
