import { sonicSurfaceTriangles } from './surface.js'
import { flipSonicEdgesExperimental } from './edgeFlipExperimental.js'

// Worker-owned LRU cache; expensive isosurface extraction never blocks React.
const cache=new Map()
const MAX_ENTRIES=6
const MAX_BYTES=24*1024*1024
const bytes=mesh=>mesh.positions.byteLength+mesh.indices.byteLength
let used=0
function remember(cacheKey,mesh){
  const size=bytes(mesh)
  if(size>MAX_BYTES)return
  while(cache.size&&(cache.size>=MAX_ENTRIES||used+size>MAX_BYTES)){
    const oldest=cache.keys().next().value
    used-=bytes(cache.get(oldest));cache.delete(oldest)
  }
  cache.set(cacheKey,mesh);used+=size
}
self.onmessage=event=>{
  const {id,key,p,tauMin,tauMax,YMin,YMax,sonicMeshMode='original'}=event.data
  const cacheKey=key ?? JSON.stringify([p,tauMin,tauMax,YMin,YMax])
  try{
    let mesh=cache.get(cacheKey)
    if(mesh){cache.delete(cacheKey);cache.set(cacheKey,mesh)}
    else{
      const raw=sonicSurfaceTriangles(p,{tauMin,tauMax,YMin,YMax,side:'minus',diagnostics:false})
      const result=sonicMeshMode==='edge-flip'?flipSonicEdgesExperimental(raw,p,'minus'):raw
      mesh={positions:Float32Array.from(result.positions),indices:Uint32Array.from(result.indices),diagnostics:{triangleCount:result.triangleCount,vertexCount:result.vertexCount,elapsedMs:result.elapsedMs,baseEvaluationCount:result.baseEvaluationCount,method:result.method}}
      remember(cacheKey,mesh)
    }
    // Copy only on transfer: cached buffers must remain owned by the worker.
    const positions=mesh.positions.slice(),indices=mesh.indices.slice()
    self.postMessage({id,key:cacheKey,mesh:{positions,indices}},[positions.buffer,indices.buffer])
  }catch(error){self.postMessage({id,error:String(error?.stack||error)})}
}
