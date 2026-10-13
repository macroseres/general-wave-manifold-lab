import {hopfImplicitSurfaceMesh} from './implicitSurface.js'
import {hopfSurfaceMesh} from './surface.js'
import {reciprocalWindowHopfMesh} from './reciprocalWindowSurface.js'

self.onmessage=({data})=>{
  const {key,p,tauMin,tauMax,YMin,YMax,showMinus,showPlus,traceOnly}=data
  try{
    const clock=()=>performance.now()
    const workerStarted=clock()
    const timings={}
    const bounds={tauMin,tauMax,YMin,YMax}
    const meshes={minus:null,minusRec:null,plus:null,plusRec:null}
    for(const [side,visible] of [['minus',showMinus],['plus',showPlus]]){
      if(!visible)continue
      const finiteStarted=clock()
      const finite=traceOnly
        ?hopfImplicitSurfaceMesh(p,{...bounds,side,clipDet:false})
        :hopfSurfaceMesh(p,{...bounds,side,method:'implicit'})
      const finiteMs=clock()-finiteStarted
      const reciprocalStarted=clock()
      const reciprocal=reciprocalWindowHopfMesh(p,{...bounds,side,clipDet:!traceOnly})
      const reciprocalMs=clock()-reciprocalStarted
      const recKey=side==='minus'?'minusRec':'plusRec'
      meshes[side]={positions:Float32Array.from(finite.positions),indices:Uint32Array.from(finite.indices)}
      meshes[recKey]={positions:Float32Array.from(reciprocal.positions),indices:Uint32Array.from(reciprocal.indices)}
      timings[side]={finiteMs,reciprocalMs,verticesFinite:meshes[side].positions.length/3,trianglesFinite:meshes[side].indices.length/3,verticesReciprocal:meshes[recKey].positions.length/3,trianglesReciprocal:meshes[recKey].indices.length/3}
    }
    const transfers=Object.values(meshes).filter(Boolean).flatMap(mesh=>[mesh.positions.buffer,mesh.indices.buffer])
    self.postMessage({key,meshes,profile:{...timings,totalWorkerMs:clock()-workerStarted}},transfers)
  }catch(error){self.postMessage({key,error:String(error?.stack||error)})}
}
