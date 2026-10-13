/** Orient adjacent indexed triangles consistently without moving vertices.
 * Disconnected components are treated independently. Conflicts on non-orientable
 * cycles are reported rather than silently forcing an inconsistent assignment.
 */
export function orientTrianglesConsistently(indices){
  const count=indices.length/3
  const adjacency=Array.from({length:count},()=>[])
  const edges=new Map()
  for(let t=0;t<count;t++){
    const [a,b,c]=indices.slice(3*t,3*t+3)
    for(const [u,v] of [[a,b],[b,c],[c,a]]){
      const key=u<v?`${u}:${v}`:`${v}:${u}`
      const entry={t,dir:u<v?1:-1}
      if(!edges.has(key))edges.set(key,[])
      edges.get(key).push(entry)
    }
  }
  for(const incidences of edges.values()){
    if(incidences.length!==2)continue
    const [a,b]=incidences
    const xor=a.dir===b.dir?1:0
    adjacency[a.t].push([b.t,xor])
    adjacency[b.t].push([a.t,xor])
  }
  const flips=new Int8Array(count).fill(-1)
  let components=0,contradictions=0
  for(let root=0;root<count;root++){
    if(flips[root]!==-1)continue
    components++
    flips[root]=0
    const queue=[root]
    for(let i=0;i<queue.length;i++){
      const t=queue[i]
      for(const [next,xor] of adjacency[t]){
        const wanted=flips[t]^xor
        if(flips[next]===-1){flips[next]=wanted;queue.push(next)}
        else if(flips[next]!==wanted)contradictions++
      }
    }
  }
  const oriented=Uint32Array.from(indices)
  let changed=0
  for(let t=0;t<count;t++)if(flips[t]){
    const k=t*3
    const temp=oriented[k+1];oriented[k+1]=oriented[k+2];oriented[k+2]=temp
    changed++
  }
  let remainingConflicts=0
  for(const incidences of edges.values()){
    if(incidences.length!==2)continue
    const [a,b]=incidences
    if((a.dir*(flips[a.t]?-1:1))===(b.dir*(flips[b.t]?-1:1)))remainingConflicts++
  }
  return {indices:oriented,diagnostics:{components,changed,contradictions:contradictions/2,remainingConflicts}}
}
