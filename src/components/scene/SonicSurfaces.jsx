import {partitionSonicMesh} from '../../geometry/sonic/spectralPartition.js'
import {smoothBtSegments} from '../../geometry/sonic/smoothBtCurve.js'
import {continueBtMinus} from '../../geometry/sonic/continueBtCurve.js'
import {waveColors} from '../../config/waveColors.js'
import {scientificCurveStyle} from '../../config/scientificCurveRules.js'
import {useEffect, useMemo, useRef, useState} from 'react'
import * as THREE from 'three'
import {sonicSurfaceTriangles} from '../../geometry/sonic/surface'
import {flipSonicEdgesExperimental} from '../../geometry/sonic/edgeFlipExperimental.js'
import {makeSonicBufferGeometry} from '../../rendering/sonicBufferGeometry.js'
import {isCurrentSonicResponse, disposeSonicWorker} from '../../rendering/sonicWorkerLifecycle.js'
import {disposeGeometry} from '../../rendering/graphicsLifecycle.js'
import {Line} from './shared.jsx'

function sonicMaterialOptions(mode,surfaceOpacity){
  const transparent=['transparent','front-only','back-only'].includes(mode)
  return {
    side:mode==='front-only'?THREE.FrontSide:mode==='back-only'?THREE.BackSide:THREE.DoubleSide,
    transparent, opacity:transparent?surfaceOpacity:1, depthWrite:!transparent, depthTest:true, roughness:0.74, metalness:0.0,
    wireframe:mode==='wireframe',
  }
}

// Cache the raw sonic mesh across Scene unmounts (workspace navigation).
// Bounded to avoid unbounded memory growth when sampling windows change.
const sonicMeshCache = new Map()
const SONIC_CACHE_LIMIT = 4
function cacheSonicMesh(key, mesh) {
  sonicMeshCache.delete(key)
  sonicMeshCache.set(key, mesh)
  if (sonicMeshCache.size > SONIC_CACHE_LIMIT) {
    sonicMeshCache.delete(sonicMeshCache.keys().next().value)
  }
}

export function SonicSurfaces({p,tauMin,tauMax,YMin,YMax,showBTMinus=true,showBTPlus=true,showMinus=true,showPlus=true,showSurfaceMinus=true,showSurfacePlus=true,sonicMeshMode='original',btCurveMode='continuation',sonicRenderMode='transparent',surfaceOpacity=0.15,onInspectSonic}){
  const key=JSON.stringify([p,tauMin,tauMax,YMin,YMax,sonicMeshMode])
  const [result,setResult]=useState(()=>sonicMeshCache.has(key)?{key,mesh:sonicMeshCache.get(key)}:null)
  const [,setStatus]=useState('calculando')
  const workerRef=useRef(null)
  const currentKeyRef=useRef(key)
  const requestRef=useRef(0)
  const startedRef=useRef(0)
  const fallbackRef=useRef(false)
  currentKeyRef.current=key

  useEffect(()=>{
    let mounted=true
    const fallbackTimers=new Set()
    const fallback=(reason)=>{
      if(!mounted||fallbackRef.current)return
      fallbackRef.current=true
      console.warn('Sonic Worker unavailable; using synchronous fallback:',reason)
      disposeSonicWorker(workerRef.current)
      workerRef.current=null
      setStatus('Worker indisponível; calculando localmente')
      // Defer until the status has a chance to render.
      const timer=setTimeout(()=>{
        fallbackTimers.delete(timer)
        if(!mounted)return
        const current=currentKeyRef.current
        try{
          const [parameters,t0,t1,y0,y1,mode]=JSON.parse(current)
          const raw=sonicSurfaceTriangles(parameters,{tauMin:t0,tauMax:t1,YMin:y0,YMax:y1,side:'minus',diagnostics:false})
          const mesh=mode==='edge-flip'?flipSonicEdgesExperimental(raw,parameters,'minus'):raw
          if(!mounted||currentKeyRef.current!==current)return
          const cached={positions:Float32Array.from(mesh.positions),indices:Uint32Array.from(mesh.indices)}
          cacheSonicMesh(current,cached)
          setResult({key:current,mesh:cached})
          setStatus('pronto (modo local)')
        }catch(error){console.error('Sonic fallback failed:',error);setStatus('erro no cálculo local')}
      },0)
      fallbackTimers.add(timer)
    }
    try{
      const worker=new Worker(new URL('../../geometry/sonic/sonic.worker.js',import.meta.url),{type:'module'})
      workerRef.current=worker
      worker.onmessage=({data})=>{
        if(!mounted||!isCurrentSonicResponse(data,requestRef.current,currentKeyRef.current))return
        if(data.error){fallback(data.error);return}
        if(!data.mesh?.positions?.length||!data.mesh?.indices?.length){fallback('empty geometry');return}
        cacheSonicMesh(data.key,data.mesh)
        setResult({key:data.key,mesh:data.mesh})
        setStatus(`pronto em ${((performance.now()-startedRef.current)/1000).toFixed(1)} s`)
      }
      worker.onerror=event=>{if(mounted){console.error('Sonic worker loading/execution error:',event);fallback('worker error')}}
      worker.onmessageerror=event=>{if(mounted){console.error('Sonic worker message error:',event);fallback('message error')}}
    }catch(error){fallback(error)}
    return ()=>{
      mounted=false
      for(const timer of fallbackTimers)clearTimeout(timer)
      fallbackTimers.clear()
      disposeSonicWorker(workerRef.current)
      workerRef.current=null
    }
    // The worker is owned by the component, not by each parameter change.
  },[])
  useEffect(()=>{
    if(sonicMeshCache.has(key)){
      setResult({key,mesh:sonicMeshCache.get(key)})
      return
    }
    if(fallbackRef.current){
      const timer=setTimeout(()=>{
        const current=key
        try{
          const raw=sonicSurfaceTriangles(p,{tauMin,tauMax,YMin,YMax,side:'minus',diagnostics:false})
          const mesh=sonicMeshMode==='edge-flip'?flipSonicEdgesExperimental(raw,p,'minus'):raw
          if(currentKeyRef.current===current){const cached={positions:Float32Array.from(mesh.positions),indices:Uint32Array.from(mesh.indices)};cacheSonicMesh(current,cached);setResult({key:current,mesh:cached});setStatus('pronto (modo local)')}
        }catch(error){console.error('Sonic fallback failed:',error);setStatus('erro no cálculo local')}
      },0)
      return ()=>clearTimeout(timer)
    }
    if(!workerRef.current)return
    setStatus('calculando')
    startedRef.current=performance.now()
    workerRef.current.postMessage({id:++requestRef.current,key,p,tauMin,tauMax,YMin,YMax,sonicMeshMode})
  },[key,p,tauMin,tauMax,YMin,YMax,sonicMeshMode])
  const data=result?.key===key?result.mesh:null
  const splitMinus=useMemo(()=>data&&(showMinus||showPlus)?partitionSonicMesh(data,p,'minus'):null,[data,p,showMinus,showPlus])
  const btPaths=useMemo(()=>{
    if(!splitMinus||( !showBTMinus&&!showBTPlus))return []
    if(btCurveMode==='continuation'){
      const traced=continueBtMinus(splitMinus.bt,p,{tauMin,tauMax,YMin,YMax,zcMax:0.999},{step:0.035,maxSteps:1000})
      if(traced.length)return traced
    }
    return smoothBtSegments(splitMinus.bt,p,'minus',3,320)
  },[splitMinus,p,showBTMinus,showBTPlus,tauMin,tauMax,YMin,YMax,btCurveMode])
  // Apply dagger to BT vertices explicitly: Line2 does not rely on a negative parent scale.
  const btPlusPaths=useMemo(()=>showBTPlus?btPaths.map(path=>path.map(([tau,Y,zc])=>[tau,-Y,zc])):[],[btPaths,showBTPlus])
  const minusSlow=useMemo(()=>splitMinus?makeSonicBufferGeometry(splitMinus.slow):null,[splitMinus])
  const minusFast=useMemo(()=>splitMinus?makeSonicBufferGeometry(splitMinus.fast):null,[splitMinus])
  // Dagger is a scene transformation: positive geometry is never remeshed.
  useEffect(()=>()=>{disposeGeometry(minusSlow);disposeGeometry(minusFast)},[minusSlow,minusFast])
  const pickSonic=(side,event)=>{
    event.stopPropagation()
    // The mesh inherits a nonuniform visual scale. Recover mathematical coordinates
    // from the mesh-local intersection, not the world-space intersection.
    const local=event.object.worldToLocal(event.point.clone())
    onInspectSonic?.({side,tau:local.x,Y:side==='plus'?-local.y:local.y,zc:local.z})
  }
  return <group>
    {showSurfaceMinus&&showMinus&&minusSlow&&<mesh onPointerDown={event=>pickSonic('minus',event)} geometry={minusSlow} frustumCulled={false} renderOrder={1}><meshStandardMaterial color={waveColors.sonicLeftSlow} emissive={waveColors.sonicLeftSlow} emissiveIntensity={.26} {...sonicMaterialOptions(sonicRenderMode,surfaceOpacity)}/></mesh>}
    {showSurfaceMinus&&showMinus&&minusFast&&<mesh onPointerDown={event=>pickSonic('minus',event)} geometry={minusFast} frustumCulled={false} renderOrder={1}><meshStandardMaterial color={waveColors.sonicLeftFast} emissive={waveColors.sonicLeftFast} emissiveIntensity={.24} {...sonicMaterialOptions(sonicRenderMode,surfaceOpacity)}/></mesh>}
    <group scale={[1,-1,1]}>
      {showSurfacePlus&&showPlus&&minusSlow&&<mesh onPointerDown={event=>pickSonic('plus',event)} geometry={minusSlow} frustumCulled={false} renderOrder={2}><meshStandardMaterial color={waveColors.sonicRight} emissive={waveColors.sonicRight} emissiveIntensity={.23} {...sonicMaterialOptions(sonicRenderMode,surfaceOpacity)}/></mesh>}
      {showSurfacePlus&&showPlus&&minusFast&&<mesh onPointerDown={event=>pickSonic('plus',event)} geometry={minusFast} frustumCulled={false} renderOrder={2}><meshStandardMaterial color={waveColors.sonicRightFast} emissive={waveColors.sonicRightFast} emissiveIntensity={.22} {...sonicMaterialOptions(sonicRenderMode,surfaceOpacity)}/></mesh>}
    </group>
    {showBTMinus&&showMinus&&btPaths.map((seg,i)=><Line key={`bt-minus-${i}`} points={seg} color="#f59e0b" {...scientificCurveStyle('specialLocus','3d')} depthTest={false} renderOrder={11}/>)}
    {showBTPlus&&showPlus&&btPlusPaths.map((seg,i)=><Line key={`bt-plus-${i}`} points={seg} color="#e879f9" {...scientificCurveStyle('specialLocus','3d')} depthTest={false} renderOrder={11}/>)}

  </group>
}
