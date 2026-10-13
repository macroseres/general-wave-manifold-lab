import { characteristicSpectrum } from '../../math/characteristic/spectrum.js'
import { zFromZc } from '../../math/charts/zChart.js'

/** Single-source characteristic triangulation. Every shared edge root is cached. */
export function characteristicMesh(p,tauMin,tauMax,{nTau=48,nZ=40}={}){
    const output={slow:[],fast:[]},boundary=[]
    // One spectral evaluation per grid vertex and one shared root per crossed edge.
    const gapAt=([tau,zc])=>{
      const z=zFromZc(zc)
      const gap=characteristicSpectrum(tau,z,p).gap
      return Number.isFinite(gap)?gap:null
    }
    const grid=Array.from({length:nTau+1},(_,i)=>Array.from({length:nZ+1},(_,j)=>{
      const xy=[tauMin+(tauMax-tauMin)*i/nTau,-.999+1.998*j/nZ]
      return {id:i*(nZ+1)+j,xy,g:gapAt(xy)}
    }))
    const edgeRoots=new Map()
    const root=(a,b)=>{
      const key=a.id<b.id?`${a.id}:${b.id}`:`${b.id}:${a.id}`
      if(edgeRoots.has(key))return edgeRoots.get(key)
      if(a.g===0){edgeRoots.set(key,a.xy);return a.xy}
      if(b.g===0){edgeRoots.set(key,b.xy);return b.xy}
      let lo=0,hi=1
      for(let k=0;k<30;k++){
        const mid=(lo+hi)/2
        const xy=[a.xy[0]+mid*(b.xy[0]-a.xy[0]),a.xy[1]+mid*(b.xy[1]-a.xy[1])]
        const gm=gapAt(xy)
        if(gm===null)break
        if((gm>=0)===(a.g>=0))lo=mid;else hi=mid
      }
      const t=(lo+hi)/2
      const xy=[a.xy[0]+t*(b.xy[0]-a.xy[0]),a.xy[1]+t*(b.xy[1]-a.xy[1])]
      edgeRoots.set(key,xy)
      return xy
    }
    const diagnostics={inputArea:0,slowArea:0,fastArea:0,coincidenceArea:0,skippedTriangles:0,invalidTriangles:0,sharedEdges:0,coincidenceTriangles:0,coincidenceEdges:0}
    const EPS=1e-10
    const same=(a,b)=>Math.abs(a[0]-b[0])<=EPS&&Math.abs(a[1]-b[1])<=EPS
    const uniquePolygon=vertices=>{
      const result=[]
      for(const vertex of vertices)if(!result.length||!same(result[result.length-1],vertex))result.push(vertex)
      if(result.length>1&&same(result[0],result[result.length-1]))result.pop()
      return result
    }
    const emit=(branch,rawPolygon)=>{
      const polygon=uniquePolygon(rawPolygon)
      if(polygon.length<3)return
      for(let i=1;i<polygon.length-1;i++){
        const [a,b,c]=[polygon[0],polygon[i],polygon[i+1]]
        const twiceArea=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
        if(Math.abs(twiceArea)<=EPS){diagnostics.skippedTriangles++;continue}
        diagnostics[branch+"Area"]+=Math.abs(twiceArea)/2
        for(const v of [a,b,c])output[branch].push(v[0],0,v[1])
      }
    }
    const clip=(vertices,positive)=>{
      const result=[]
      for(let i=0;i<vertices.length;i++){
        const a=vertices[i],b=vertices[(i+1)%vertices.length]
        const insideA=positive?a.g>=0:a.g<=0
        const insideB=positive?b.g>=0:b.g<=0
        if(insideA)result.push(a.xy)
        if(insideA!==insideB)result.push(root(a,b))
      }
      return uniquePolygon(result)
    }
    const classifyTriangle=vertices=>{
      if(vertices.some(v=>v.g===null)){diagnostics.invalidTriangles++;return}
      const [v0,v1,v2]=vertices.map(v=>v.xy)
      diagnostics.inputArea+=Math.abs((v1[0]-v0[0])*(v2[1]-v0[1])-(v1[1]-v0[1])*(v2[0]-v0[0]))/2
      // A two-dimensional coincidence region is not either spectral leaf.
      // Record its area separately, rather than drawing both leaves on top of it.
      if(vertices.every(v=>v.g===0)){
        diagnostics.coincidenceArea+=Math.abs((v1[0]-v0[0])*(v2[1]-v0[1])-(v1[1]-v0[1])*(v2[0]-v0[0]))/2
        diagnostics.coincidenceTriangles++
        return
      }
      const intersections=[]
      for(let i=0;i<3;i++){
        const a=vertices[i],b=vertices[(i+1)%3]
        if(a.g===0)intersections.push(a.xy)
        if((a.g<0&&b.g>0)||(a.g>0&&b.g<0))intersections.push(root(a,b))
      }
      // If an entire mesh edge belongs to E, use it as the common boundary
      // only when the triangle has a nonzero-sign third vertex.
      for(let i=0;i<3;i++){
        const a=vertices[i],b=vertices[(i+1)%3]
        if(a.g===0&&b.g===0&&!same(a.xy,b.xy)){
          boundary.push([a.xy[0],0,a.xy[1]],[b.xy[0],0,b.xy[1]])
          diagnostics.sharedEdges++
          diagnostics.coincidenceEdges++
        }
      }
      const crossings=uniquePolygon(intersections)
      if(crossings.length===2&&!same(crossings[0],crossings[1])&&!vertices.some((v,i)=>v.g===0&&vertices[(i+1)%3].g===0)){
        const [a,b]=crossings
        boundary.push([a[0],0,a[1]],[b[0],0,b[1]])
        diagnostics.sharedEdges++
      }
      emit('slow',clip(vertices,false))
      emit('fast',clip(vertices,true))
    }
    for(let i=0;i<nTau;i++)for(let j=0;j<nZ;j++){
      const a=grid[i][j],b=grid[i+1][j],c=grid[i+1][j+1],d=grid[i][j+1]
      classifyTriangle([a,b,c]);classifyTriangle([a,c,d])
    }
    return {leaves:Object.entries(output).map(([branch,coords])=>({branch,coords:new Float32Array(coords)})),boundary,diagnostics}
}
