import { betheWendroffData } from '../../math/sonic/betheWendroff.js'

// Partition the actual rendered mesh, not a second independently sampled surface.
// The same edge intersection is used by both spectral branches.
export function partitionSonicMesh(mesh, p, side, tolerance = 1e-9) {
  const { positions, indices } = mesh
  const n = positions.length / 3
  const gap = new Float64Array(n)
  const scale = new Float64Array(n)
  const cache = new Map()
  for (let i = 0; i < n; i++) {
    const tau = positions[3*i], Y = side === 'plus' ? -positions[3*i+1] : positions[3*i+1]
    const zc = positions[3*i+2]
    const info=betheWendroffData(tau,Y,zc,p,side)
    if(info.kind!=='regular') { gap[i]=NaN; continue }
    gap[i]=info.gap
    scale[i]=Math.max(1,Math.abs(info.trace))
  }
  const out = {slow:{positions:[],indices:[]},fast:{positions:[],indices:[]},bt:[]}
  const point = i => [positions[3*i],positions[3*i+1],positions[3*i+2]]
  const intersect = (a,b) => {
    const key = a.i < b.i ? `${a.i}:${b.i}` : `${b.i}:${a.i}`
    if (cache.has(key)) return cache.get(key)
    const t = Math.abs(a.g) / (Math.abs(a.g)+Math.abs(b.g))
    const v = {p:a.p.map((x,k)=>x+t*(b.p[k]-x)),g:0}
    cache.set(key,v)
    return v
  }
  const emit = (target,polygon) => {
    if (polygon.length < 3) return
    for (let j=1;j<polygon.length-1;j++) {
      const tri=[polygon[0].p,polygon[j].p,polygon[j+1].p]
      const u=tri[1].map((x,k)=>x-tri[0][k]),v=tri[2].map((x,k)=>x-tri[0][k])
      const area=Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
      if(area<1e-14)continue
      const start=target.positions.length/3
      for(const q of tri)target.positions.push(...q)
      target.indices.push(start,start+1,start+2)
    }
  }
  for(let k=0;k<indices.length;k+=3){
    const ids=[indices[k],indices[k+1],indices[k+2]]
    if(ids.some(i=>!Number.isFinite(gap[i])))continue
    const vertices=ids.map(i=>({i,p:point(i),g:Math.abs(gap[i])<=tolerance*scale[i]?0:gap[i]}))
    // One boundary segment per crossing triangle; shared edge intersections
    // are cached and therefore coincide on both spectral branch meshes.
    const crossing=[]
    for(let j=0;j<3;j++){
      const a=vertices[j],b=vertices[(j+1)%3]
      if(a.g===0)crossing.push(a.p)
      if(a.g*b.g<0)crossing.push(intersect(a,b).p)
    }
    const unique=crossing.filter((q,i)=>crossing.findIndex(r=>r.every((v,k)=>Math.abs(v-q[k])<1e-9))===i)
    if(unique.length===2)out.bt.push(unique)
    for(const [name,sign] of [['slow',-1],['fast',1]]){
      let polygon=[]
      for(let j=0;j<3;j++){
        const a=vertices[j],b=vertices[(j+1)%3],insideA=sign*a.g>=0,insideB=sign*b.g>=0
        if(insideA)polygon.push(a)
        if(insideA!==insideB)polygon.push(intersect(a,b))
      }
      // Entirely coincident triangles have no unique slow/fast assignment.
      if(vertices.every(v=>v.g===0))continue
      emit(out[name],polygon)
    }
  }
  return out
}
