/** Experimental conforming refinement. Does not change the production extractor.
 * Splits every edge of a low-quality triangle, and propagates those edge splits
 * to adjacent triangles. Midpoints are deliberately not projected: projection
 * without an injectivity certificate can fold the mesh near the z-chart poles.
 */
const difference=(a,b)=>a.map((x,i)=>x-b[i])
const length=a=>Math.hypot(...a)
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const edgeKey=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`
const triangleQuality=(a,b,c)=>{
  const ab=difference(b,a),bc=difference(c,b),ca=difference(a,c)
  const sum=length(ab)**2+length(bc)**2+length(ca)**2
  return sum>0?2*Math.sqrt(3)*length(cross(ab,difference(c,a)))/sum:0
}
export function refineSonicMeshExperimental(mesh,{qualityThreshold=.01,maxSelected=Infinity}={}){
  const positions=[...mesh.positions],indices=[],marked=new Set(),original=mesh.indices
  const point=id=>positions.slice(id*3,id*3+3)
  let selected=0
  for(let k=0;k<original.length;k+=3){
    const [a,b,c]=original.slice(k,k+3)
    if(selected>=maxSelected||triangleQuality(point(a),point(b),point(c))>=qualityThreshold)continue
    selected++
    marked.add(edgeKey(a,b));marked.add(edgeKey(b,c));marked.add(edgeKey(c,a))
  }
  const midpointIds=new Map()
  const midpoint=(a,b)=>{
    const key=edgeKey(a,b)
    if(!marked.has(key))return null
    if(midpointIds.has(key))return midpointIds.get(key)
    const pa=point(a),pb=point(b),id=positions.length/3
    positions.push(...pa.map((v,i)=>(v+pb[i])/2))
    midpointIds.set(key,id)
    return id
  }
  const emit=(a,b,c)=>indices.push(a,b,c)
  for(let k=0;k<original.length;k+=3){
    const [a,b,c]=original.slice(k,k+3)
    const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a)
    const count=Number(ab!==null)+Number(bc!==null)+Number(ca!==null)
    if(count===0)emit(a,b,c)
    else if(count===3){emit(a,ab,ca);emit(ab,b,bc);emit(ca,bc,c);emit(ab,bc,ca)}
    else if(count===1){
      if(ab!==null){emit(a,ab,c);emit(ab,b,c)}
      else if(bc!==null){emit(b,bc,a);emit(bc,c,a)}
      else {emit(c,ca,b);emit(ca,a,b)}
    }else if(ab!==null&&bc!==null){emit(b,bc,ab);emit(a,ab,c);emit(ab,bc,c)}
    else if(bc!==null&&ca!==null){emit(c,ca,bc);emit(b,bc,a);emit(bc,ca,a)}
    else {emit(a,ab,ca);emit(ab,b,c);emit(ab,c,ca)}
  }
  return {...mesh,positions,indices,triangleCount:indices.length/3,vertexCount:positions.length/3,experimentalRefinement:{selectedTriangles:selected,splitEdges:marked.size,insertedVertices:midpointIds.size,method:'conforming-midpoint-no-projection'}}
}
export {triangleQuality}
