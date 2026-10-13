/** Exact grid-cell attribution, independent of geometric proximity thresholds.
 * A boundary edge is attributed to the output triangle's generating cell.
 * Rejection of a different cell is NOT asserted to cause that boundary.
 */
export function auditHopfCellProvenance(mesh,{tolerance=1e-7,maxExamples=8}={}){
  const provenance=mesh.provenance
  if(!provenance)throw new Error('Enable recordCellProvenance in hopfSurfaceMesh')
  const {cells,faces,nTau,nZ}=provenance
  const vertices=new Map(),edges=new Map()
  const key=p=>p.map(v=>Math.round(v/tolerance)).join(':')
  for(let face=0;face<faces.length;face++){
    const base=face*9,tri=[0,1,2].map(i=>mesh.positions.slice(base+i*3,base+i*3+3))
    for(let i=0;i<3;i++){
      const a=key(tri[i]),b=key(tri[(i+1)%3]),id=a<b?`${a}|${b}`:`${b}|${a}`
      if(!vertices.has(a))vertices.set(a,tri[i]);if(!vertices.has(b))vertices.set(b,tri[(i+1)%3])
      if(!edges.has(id))edges.set(id,[])
      edges.get(id).push({face,source:faces[face],a,b})
    }
  }
  const byCell=new Map()
  for(const record of cells){if(!byCell.has(record.cellId))byCell.set(record.cellId,[]);byCell.get(record.cellId).push(record)}
  const reasons={},boundaries={total:0,fromClippedFaces:0,fromUnclippedFaces:0,adjacentGridRejections:{},examples:[]}
  for(const cell of cells)if(cell.status==='rejected')reasons[cell.reason]=(reasons[cell.reason]??0)+1
  for(const occurrences of edges.values()){
    if(occurrences.length!==1)continue
    boundaries.total++
    const {source,a,b}=occurrences[0]
    if(source.clipped)boundaries.fromClippedFaces++;else boundaries.fromUnclippedFaces++
    const j=Math.floor(source.cellId/nTau),i=source.cellId%nTau
    const neighbors=[[i-1,j],[i+1,j],[i,j-1],[i,j+1]]
    const adjacentReasons=new Set()
    for(const [ii,jj] of neighbors){if(ii<0||ii>=nTau||jj<0||jj>=nZ)continue
      for(const record of byCell.get(jj*nTau+ii)??[])if(record.status==='rejected')adjacentReasons.add(record.reason)
    }
    for(const reason of adjacentReasons)boundaries.adjacentGridRejections[reason]=(boundaries.adjacentGridRejections[reason]??0)+1
    if(boundaries.examples.length<maxExamples)boundaries.examples.push({cellId:source.cellId,half:source.half,clipped:source.clipped,midpoint:vertices.get(a).map((v,k)=>(v+vertices.get(b)[k])/2),neighborReasons:[...adjacentReasons].sort()})
  }
  return {candidateCells:nTau*nZ,candidateTriangles:cells.length,accepted:cells.filter(c=>c.status==='accepted').length,rejected:cells.filter(c=>c.status==='rejected').length,rejectionReasons:reasons,outputFaces:faces.length,boundaries,method:'exact generating-cell identity; neighbor reasons are grid adjacency, not proven edge causation'}
}
