import { zFromZc } from '../../math/charts/zChart.js'
import { sonicImplicit } from '../../math/sonic/sonic.js'
import { classifyCommonSonicPoint } from '../../math/sonic/commonIntersection.js'

const finite=Number.isFinite
const pointAt=(positions,i)=>[positions[3*i],positions[3*i+1],positions[3*i+2]]
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])

/**
 * Numerical audit of the common zero set represented by two independently
 * extracted sonic meshes.  It does not define J or DS from the meshes.
 * Instead, mesh vertices are accepted as common samples only when they satisfy
 * both original implicit equations, then the mathematical layer classifies
 * them as J / DS.  Coverage is measured against canonical J and DS samples.
 */
export function auditCommonSonicMeshes(minusMesh,plusMesh,p,{implicitTolerance=2e-5,matchTolerance=.12,canonicalJ=[],canonicalDS=[]}={}){
  const collect=mesh=>{
    const out=[]
    for(let i=0;i<(mesh?.positions?.length||0)/3;i++){
      const q=pointAt(mesh.positions,i),z=zFromZc(q[2])
      const rm=Math.abs(sonicImplicit(q[0],q[1],z,p,'minus'))
      const rp=Math.abs(sonicImplicit(q[0],q[1],z,p,'plus'))
      if(finite(rm)&&finite(rp)&&rm<=implicitTolerance&&rp<=implicitTolerance){
        const c=classifyCommonSonicPoint(q[0],q[1],z,p,{absoluteTolerance:implicitTolerance})
        out.push({point:q,minusResidual:rm,plusResidual:rp,locus:c.locus})
      }
    }
    return out
  }
  const minusCommon=collect(minusMesh),plusCommon=collect(plusMesh)
  const samples=[...minusCommon,...plusCommon]
  const unclassified=samples.filter(q=>!['J','DS','J-and-DS'].includes(q.locus))
  const nearest=q=>samples.reduce((best,s)=>Math.min(best,distance(q,s.point)),Infinity)
  const jCoverage=canonicalJ.map(q=>({point:q,distance:nearest(q)}))
  const dsCoverage=canonicalDS.map(q=>({point:q,distance:nearest(q)}))
  return {
    minusCommon,plusCommon,commonSampleCount:samples.length,
    unclassifiedCommonCount:unclassified.length,unclassified,
    jCoverage,dsCoverage,
    maxJDistance:jCoverage.length?Math.max(...jCoverage.map(q=>q.distance)):0,
    maxDSDistance:dsCoverage.length?Math.max(...dsCoverage.map(q=>q.distance)):0,
    matchTolerance,
    canonicalCoverageSatisfied:jCoverage.every(q=>q.distance<=matchTolerance)&&dsCoverage.every(q=>q.distance<=matchTolerance),
  }
}

/** Distance from a point to a closed line segment in scene coordinates. */
export function pointSegmentDistance(q, segment){
  const [a,b]=segment
  const v=b.map((x,i)=>x-a[i]),w=q.map((x,i)=>x-a[i])
  const len2=v.reduce((sum,x)=>sum+x*x,0)
  const t=len2>0?Math.max(0,Math.min(1,w.reduce((sum,x,i)=>sum+x*v[i],0)/len2)):0
  return distance(q,a.map((x,i)=>x+t*v[i]))
}

const curveSegments=points=>points.slice(1).map((p,i)=>[points[i],p])
const nearestSegment=(q,segments)=>segments.reduce((best,s)=>Math.min(best,pointSegmentDistance(q,s)),Infinity)
const summary=distances=>({count:distances.length,maxDistance:distances.length?Math.max(...distances):null,
  meanDistance:distances.length?distances.reduce((a,b)=>a+b,0)/distances.length:null})

/**
 * Bidirectional continuous-segment distance audit. Canonical curve inputs are
 * ordered polylines (arrays of points), not an unordered point cloud.
 * A segment is assigned to the nearer canonical locus using its midpoint.
 * Neither mesh extraction nor normal rendering depends on this function.
 */
export function compareGeometricSonicIntersection(geometricSegments,canonicalJ=[],canonicalDS=[]){
  const jSegments=canonicalJ.flatMap(curveSegments)
  const dsSegments=canonicalDS.flatMap(curveSegments)
  const grouped={J:[],DS:[],unclassified:[]}
  for(const segment of geometricSegments){
    const mid=segment[0].map((x,i)=>(x+segment[1][i])/2)
    const dj=nearestSegment(mid,jSegments),dd=nearestSegment(mid,dsSegments)
    grouped[dj===Infinity&&dd===Infinity?'unclassified':dj<=dd?'J':'DS'].push(segment)
  }
  const analyze=(curves,canonicalSegments,meshSegments)=>{
    const canonicalSamples=curves.flatMap(points=>points.flatMap((p,i)=>i?[[...p],points[i-1].map((x,k)=>(x+p[k])/2)]:[[...p]]))
    const meshSamples=meshSegments.flatMap(([a,b])=>[a,b,a.map((x,i)=>(x+b[i])/2)])
    const canonicalToMesh=summary(canonicalSamples.map(q=>nearestSegment(q,meshSegments)))
    const meshToCanonical=summary(meshSamples.map(q=>nearestSegment(q,canonicalSegments)))
    return {...canonicalToMesh,canonicalToMesh,meshToCanonical,meshSegments:meshSegments.length}
  }
  return {geometricSegmentCount:geometricSegments.length,
    J:analyze(canonicalJ,jSegments,grouped.J),DS:analyze(canonicalDS,dsSegments,grouped.DS),
    unclassifiedSegments:grouped.unclassified.length,
    note:'Distances use continuous segments; mesh segment classification is by nearest canonical locus. Coplanar intersections can be missed.'}
}
