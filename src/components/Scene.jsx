import PointScreenAnchors from './PointScreenAnchors.jsx'
import {rightWaveJunctions} from '../geometry/state/rightWaveJunctions.js'
import {dragCharacteristicState} from '../geometry/state/dragCharacteristicState.js'
import DraggableInspection from './DraggableInspection.jsx'
import {seededRarefactionCurves} from '../geometry/state/seededRarefactionCurves.js'
import {rarefactionPhaseArrow,rarefactionPhasePoints} from '../geometry/state/rarefactionPhaseArrow.js'
import ScientificLegend from './ScientificLegend.jsx'
import { MathLabel } from './math/MathLabel.jsx'
import WorkspaceToolbar from './WorkspaceToolbar.jsx'
import ScientificPoint3D from './ScientificPoint3D.jsx'
import { partitionSonicMesh } from '../geometry/sonic/spectralPartition.js'
import { smoothBtSegments } from '../geometry/sonic/smoothBtCurve.js'
import { continueBtMinus } from '../geometry/sonic/continueBtCurve.js'
import { characteristicSpectrum } from '../math/characteristic/spectrum.js'
import { exceptionalFiberLimit } from '../math/characteristic/fiberLimits.js'
import { exceptionalDirections } from '../math/characteristic/exceptionalDirections.js'
import { exceptionalMarkers } from '../math/characteristic/exceptionalMarkers.js'
import { zFromZc as projectiveZ } from '../math/charts/zChart.js'
import {waveColors} from '../config/waveColors.js'
import { scientificCurveStyle, scientificLocusKind } from '../config/scientificCurveRules.js'
import {requestHopfMesh} from '../geometry/hopf/hopfCache.js'
import { inspectSonicPoint } from '../math/sonic/pointInspection.js'
import {Canvas, useFrame, useThree} from '@react-three/fiber'
import {Line as DreiLine, OrbitControls} from '@react-three/drei'
import { finiteLinePaths } from '../rendering/finiteLinePaths.js'
import {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react'
import * as THREE from 'three'
import {rarefactionOrbits,infinityRarefactionSingularities,infinityRarefactionSeparatrices,finiteRarefactionSeparatrices} from '../math/quadraticFlux'
import {sonicSurfaceTriangles} from '../geometry/sonic/surface'
import {flipSonicEdgesExperimental} from '../geometry/sonic/edgeFlipExperimental.js'
import {makeSonicBufferGeometry} from '../rendering/sonicBufferGeometry.js'
import {isCurrentSonicResponse, disposeSonicWorker} from '../rendering/sonicWorkerLifecycle.js'
import {curvePoints3D} from '../rendering/curvePoints.js'
import {characteristicMesh} from '../geometry/characteristic/mesh.js'
import {disposeGeometry} from '../rendering/graphicsLifecycle.js'
import {stateFibreGeometry} from '../geometry/state/fibreGeometry.js'
import {hugoniotLaxGeometry} from '../geometry/state/hugoniotLaxGeometry.js'
import {selectedHugoniotCharacteristicMarkers} from '../geometry/state/fibreCharacteristicMarkers.js'

// No invalid coordinates are allowed to enter three-stdlib LineGeometry.
// Split at non-finite vertices instead of drawing a false connecting chord.
function Line({points,segments=false,...props}) {
  const paths = finiteLinePaths(points,{segments})
  return <group>{paths.map((path,i)=><DreiLine key={i} points={path} {...props}/>)}</group>
}

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x))

function StateFibres({U,p,showMinus=true,showPlus=true,colorOverride=null}){
  const visible=showMinus||showPlus
  const data=useMemo(()=>visible&&U?stateFibreGeometry(U,p):{minus:[],plus:[],lifts:[]},[U,p,visible])
  const lax=useMemo(()=>visible&&U?hugoniotLaxGeometry(data,U,p):{minus:[],plus:[]},[data,U,p,visible])
  if(!visible||!U)return null
  const appearance=c=>c?.kind==='lax'&&c.family===1?{color:'#22c55e',width:3.3}:c?.kind==='lax'&&c.family===2?{color:'#a855f7',width:3.3}:c?.kind==='non-lax'?{color:'#94a3b8',width:1.9}:{color:'#fbbf24',width:1.9}
  const curves=[
    ...(showMinus?lax.minus:[]).map((segment,i)=>({...segment,key:`m${i}`})),
    ...(showPlus?lax.plus:[]).map((segment,i)=>({...segment,key:`p${i}`})),
  ]
  // Lax family controls colour/weight. Projection identity is independent:
  // pi_-^{-1}(U*) = forward is solid; pi_+^{-1}(U*) = backward is dashed.
  return <group>
    {curves.filter(c=>c.points.length>1).map(c=>{const a=appearance(c.laxClass);return <Line key={c.key} points={curvePoints3D(c.points,'tauYzc')} color={colorOverride??a.color} {...scientificCurveStyle(c.side==='plus'?'auxiliary':'primary','3d')} lineWidth={colorOverride?2.3:a.width} depthTest={false} renderOrder={7}/>})}

  </group>
}


// Imperative adapters for Three.js controls and the canvas cursor.
function setMarkerDragInteraction(controls,canvas,enabled,cursor){
  if(controls&&enabled!==undefined)controls.enabled=enabled
  canvas.style.cursor=cursor
}

function CharacteristicHugoniotPoints({states,p,showForward,showBackward,showForwardFast,showBackwardSlow,axisScale,onSelect,onChangeRiemannState}){
  const {controls,gl}=useThree()
  const drag=useRef(null)
  const finishDrag=event=>{
    const current=drag.current
    if(!current)return
    event?.stopPropagation()
    if(current.pending)onChangeRiemannState?.(current.side,current.pending.state)
    setMarkerDragInteraction(controls,gl.domElement,current.controlsEnabled,'')
    drag.current=null
    if(event?.target.hasPointerCapture?.(event.pointerId))event.target.releasePointerCapture(event.pointerId)
  }
  useEffect(()=>()=>{setMarkerDragInteraction(controls,gl.domElement,drag.current?.controlsEnabled,'')},[controls,gl])
  const points=useMemo(()=>selectedHugoniotCharacteristicMarkers(states,p,{includeForwardFast:true,includeBackwardSlow:true}),[states,p])
  const selected=[...points.forward.filter(q=>q.branch==='slow'?showForward:showForwardFast).map(q=>({...q,side:'left',color:'#ff9f0a'})),
    ...points.backward.filter(q=>q.branch==='fast'?showBackward:showBackwardSlow).map(q=>({...q,side:'right',color:'#30d158'}))]
  const shape=side=>side==='right'?<octahedronGeometry args={[.041,0]}/>:<sphereGeometry args={[.032,24,18]}/>
  return <group>{selected.map(q=><group key={`${q.side}-${q.branch}`} position={q.position}
    scale={[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>1/Math.max(Math.abs(v||1),1e-8))}
    renderOrder={42} userData={{kind:'hugoniot-characteristic-intersection',referenceState:q.side,branch:q.branch}}
    onPointerDown={event=>{
      if(!onChangeRiemannState||!((q.side==='left'&&q.branch==='slow')||(q.side==='right'&&q.branch==='fast'))||event.button!==0)return
      event.stopPropagation()
      const hit=event.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3())
      if(!hit)return
      drag.current={side:q.side,branch:q.branch,point:{tau:q.tau,zc:q.zc},offset:new THREE.Vector3(q.tau*axisScale.tau,0,q.zc*axisScale.zc).sub(hit),controlsEnabled:controls?.enabled,last:0}
      setMarkerDragInteraction(controls,gl.domElement,false,'grabbing')
      event.target.setPointerCapture(event.pointerId)
    }}
    onPointerMove={event=>{
      const current=drag.current
      if(!current)return
      event.stopPropagation()
      const hit=event.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3())
      if(!hit)return
      hit.add(current.offset)
      const next=dragCharacteristicState(current.point,{tau:hit.x/axisScale.tau,zc:hit.z/axisScale.zc},p,current.branch,{tauMin:-Infinity,tauMax:Infinity})
      if(!next)return
      current.point=next.point;current.pending=next
      const now=performance.now()
      if(now-current.last>65){onChangeRiemannState(current.side,next.state);current.last=now}
    }}
    onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}
    onPointerOver={event=>{event.stopPropagation();if(onChangeRiemannState&&((q.side==='left'&&q.branch==='slow')||(q.side==='right'&&q.branch==='fast')))setMarkerDragInteraction(null,gl.domElement,undefined,'grab')}}
    onPointerOut={()=>{if(!drag.current)setMarkerDragInteraction(null,gl.domElement,undefined,'')}}
    onClick={event=>{event.stopPropagation();onSelect?.({tau:q.tau,Y:0,zc:q.zc})}}>
    <mesh scale={1.14} renderOrder={43}>{shape(q.side)}<meshBasicMaterial color="#eef5ff" side={THREE.BackSide} transparent opacity={1} depthWrite={false} depthTest={false}/></mesh>
    <mesh renderOrder={44}>{shape(q.side)}<meshStandardMaterial color={q.color} roughness={.32} metalness={.08} emissive={q.color} emissiveIntensity={.35}
      transparent opacity={1} depthWrite={false} depthTest={false}/></mesh>
  </group>)}</group>
}

function CompositeFields({geometry={minus:[],plus:[]},showMinus=true,showPlus=true}){
  const draw=(groups,color,prefix)=>groups.flatMap((branch,bi)=>
    branch.segments.filter(points=>points.length>1).map((points,si)=>
      <Line key={`${prefix}-${bi}-${si}`} points={curvePoints3D(points,'xyz')} color={color} {...scientificCurveStyle('primary','3d')} depthTest={false} renderOrder={8}/>
    ))
  return <group>{showMinus&&draw(geometry.minus,waveColors.compositeSlow,'km')}{showPlus&&draw(geometry.plus,waveColors.compositeFast,'kp')}</group>
}


// The inflection locus may contain many vertices. Native WebGL lines avoid
// the per-segment expanded meshes used by Drei's thick Line2 implementation.
// Keep the mathematical samples intact; split only at invalid coordinates.
function InflectionPath({points}) {
  const geometries=useMemo(()=>finiteLinePaths(
    curvePoints3D(points,'tauYzc')
  ).map(path=>{
    const geometry=new THREE.BufferGeometry()
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(path.flat(),3))
    return geometry
  }),[points])
  useEffect(()=>()=>geometries.forEach(geometry=>geometry.dispose()),[geometries])
  return <group>{geometries.map((geometry,i)=><line key={i} geometry={geometry} frustumCulled={false} renderOrder={6}>
    <lineBasicMaterial color={waveColors.inflection} depthTest={false} depthWrite={false} transparent opacity={1}/>
  </line>)}</group>
}

function SonicSpecialLoci({sharedLoci=[],showDS=true,showJ=true}){
  return <group>{sharedLoci.filter(item=>(item.id==='DS'&&showDS)||(item.id==='J'&&showJ)).flatMap(item=>item.paths.map((path,i)=>
    item.id==='J'
      ? <InflectionPath key={`J-${i}`} points={path}/>
      : <Line key={`DS-${i}`} points={curvePoints3D(path,'tauYzc')} color={waveColors.doubleSonic} {...scientificCurveStyle(scientificLocusKind(item.id),'3d')} depthTest={false} renderOrder={10}/>
  ))}</group>
}

function HopfSurfaces({p,tauMin,tauMax,YMin,YMax,showMinus,showPlus,surfaceOpacity,traceOnly=false}){
  // Geometry depends on the flux and sampling domain, never on visibility.
  // Keep this component mounted even when both Hopf surfaces are hidden.
  const geometryKey=JSON.stringify([p,tauMin,tauMax,YMin,YMax,traceOnly])
  const [result,setResult]=useState({key:null,minus:null,plus:null})
  const [,setStatus]=useState('calculando')
  const previousKeyRef=useRef(null)
  useEffect(()=>{
    let active=true
    const started=performance.now()
    setStatus('calculando')
    if(previousKeyRef.current!==null&&previousKeyRef.current!==geometryKey){
      let changes=[]
      try{const before=JSON.parse(previousKeyRef.current),after=JSON.parse(geometryKey);const labels=['fluxo','tauMin','tauMax','YMin','YMax','traceOnly'];changes=labels.filter((label,i)=>JSON.stringify(before[i])!==JSON.stringify(after[i]))}catch{changes=['chave alterada']}
      console.info(`[geometria] Hopf: configuração alterada (${changes.join(', ')||'não identificada'})`)
    }
    previousKeyRef.current=geometryKey
    // Dagger symmetry: plus at Y is minus at -Y. A symmetric window
    // shares one worker/mesh; asymmetric windows use the reflected domain.
    const symmetric=Math.abs(YMin+YMax)<1e-12
    const reflectedKey=symmetric?geometryKey:JSON.stringify([p,tauMin,tauMax,-YMax,-YMin,traceOnly])
    const minusRequest=requestHopfMesh(geometryKey,'minus',{p,tauMin,tauMax,YMin,YMax,traceOnly})
    const plusRequest=symmetric?minusRequest:requestHopfMesh(reflectedKey,'minus',{p,tauMin,tauMax,YMin:-YMax,YMax:-YMin,traceOnly})
    Promise.all([minusRequest,plusRequest]).then(entries=>{
      if(!active)return
      setResult({key:geometryKey,minus:entries[0],plus:entries[1]})
      setStatus('pronto')
      const elapsed=performance.now()-started
      console.info(`[geometria] Hopf †: ${elapsed.toFixed(0)} ms; ${symmetric?'1 malha compartilhada':'2 janelas refletidas'}`)
      for(let i=0;i<(symmetric?1:2);i++){
        const e=entries[i],profile=e.profile?.minus
        const fmt=n=>Number.isFinite(n)?n.toFixed(0):'—'
        console.info(`[geometria] Hopf${i===0?'⁻':'⁺†'}: cache=${e.cacheStatus}; worker=${fmt(e.workerRoundtripMs)} ms; finita=${fmt(profile?.finiteMs)} ms; recíproca=${fmt(profile?.reciprocalMs)} ms`)
      }
    }).catch(error=>{
      if(!active)return
      console.error('Hopf worker:',error)
      setStatus('erro')
    })
    return ()=>{active=false}
    // p is represented by value in geometryKey; visibility is intentionally absent.
  },[geometryKey,p,tauMin,tauMax,YMin,YMax,traceOnly])
  const meshes=useMemo(()=>{
    if(result.key!==geometryKey||!result.minus||!result.plus)return null
    const output={}
    for(const [name,mesh] of Object.entries(result.minus.meshes)){
      if(mesh&&(name==='minus'||name==='minusRec'))output[name]=makeSonicBufferGeometry(mesh)
    }
    if(result.plus!==result.minus){
      for(const [name,mesh] of Object.entries(result.plus.meshes)){
        if(mesh&&(name==='minus'||name==='minusRec'))output[`dagger_${name}`]=makeSonicBufferGeometry(mesh)
      }
    }
    return output
  },[result,geometryKey])
  useEffect(()=>()=>{if(meshes)Object.values(meshes).forEach(disposeGeometry)},[meshes])
  return <group>
    <group visible={showMinus}>
      {meshes?.minus&&<mesh geometry={meshes.minus} frustumCulled={false}><meshStandardMaterial color={waveColors.hopfMinus} side={THREE.DoubleSide} transparent opacity={surfaceOpacity*0.8} depthWrite={false} roughness={0.55} metalness={0.0}/></mesh>}
      {meshes?.minusRec&&<mesh geometry={meshes.minusRec} frustumCulled={false}><meshStandardMaterial color={waveColors.hopfMinus} side={THREE.DoubleSide} transparent opacity={surfaceOpacity*0.8} depthWrite={false} roughness={0.55} metalness={0.0}/></mesh>}
    </group>
    <group visible={showPlus} scale={[1,-1,1]}>
      {meshes?.minus&&<mesh geometry={meshes.dagger_minus||meshes.minus} frustumCulled={false}><meshStandardMaterial color={waveColors.hopfPlus} side={THREE.DoubleSide} transparent opacity={surfaceOpacity*0.8} depthWrite={false} roughness={0.55} metalness={0.0}/></mesh>}
      {meshes?.minusRec&&<mesh geometry={meshes.dagger_minusRec||meshes.minusRec} frustumCulled={false}><meshStandardMaterial color={waveColors.hopfPlus} side={THREE.DoubleSide} transparent opacity={surfaceOpacity*0.8} depthWrite={false} roughness={0.55} metalness={0.0}/></mesh>}
    </group>

  </group>
}

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

function SonicSurfaces({p,tauMin,tauMax,YMin,YMax,showBTMinus=true,showBTPlus=true,showMinus=true,showPlus=true,showSurfaceMinus=true,showSurfacePlus=true,sonicMeshMode='original',btCurveMode='continuation',sonicRenderMode='transparent',surfaceOpacity=0.15,onInspectSonic}){
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
      const worker=new Worker(new URL('../geometry/sonic/sonic.worker.js',import.meta.url),{type:'module'})
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

function SeededRarefactions({curves,p,showLeft,showRight,showFull,axisScale}){
  return <group>{curves.filter(q=>!['composite','nonlocal'].includes(q.kind)).filter(q=>q.kind==='full'?showFull:q.family==='slow'?showLeft:showRight).map(curve=>{
    const color=curve.kind==='full'?'#ffcf76':curve.family==='slow'?'#ff9f0a':'#30d158',slow=curve.family==='slow'&&curve.kind!=='full'
    const length=curve.points.slice(1).reduce((sum,q,i)=>sum+Math.hypot(q.tau-curve.points[i].tau,q.zc-curve.points[i].zc),0)
    let travelled=0,arrowIndex=1
    for(let i=1;i<curve.points.length-1;i++){travelled+=Math.hypot(curve.points[i].tau-curve.points[i-1].tau,curve.points[i].zc-curve.points[i-1].zc);if(travelled>=length*.4){arrowIndex=i;break}}
    return <group key={`${curve.family}-${curve.kind??'arc'}`} userData={{kind:'seeded-rarefaction',family:curve.family,seed:curve.seed}}>
      {slow&&<Line points={rarefactionPhasePoints(curve.points)} color="#f5f7fb" lineWidth={4.5} transparent opacity={1} depthWrite={false} depthTest={false} renderOrder={50}/>}
      <Line points={rarefactionPhasePoints(curve.points)} color={color}
        {...scientificCurveStyle(slow?'primary':'integralFast','3d')}
        lineWidth={2.5} transparent opacity={1} depthWrite={false} depthTest={false} renderOrder={slow?51:25}/>
      {(!slow||length>.07)&&<ArrowOnCurve axisScale={axisScale} points={curve.points} index={slow?arrowIndex:Math.floor(curve.points.length*.6)} color={color} p={p} size={slow?Math.min(.55,length*2):.8} directionSign={curve.timeDirection??1}/>}
    </group>
  })}</group>
}

function RarefactionField({p,tauMin,tauMax,visible=true,axisScale}){
  const curves=useMemo(()=>visible?rarefactionOrbits(p,tauMin,tauMax,{clipTau:false}):[],[p,tauMin,tauMax,visible])
  if(!visible)return null
  return <group>{curves.map((curve,i)=>{
    const pts=rarefactionPhasePoints(curve,.026)
    return pts.length>1?<group key={i}><Line points={pts} color={waveColors.rarefactionFast} {...scientificCurveStyle('integralFast','3d')} depthTest={false} renderOrder={12}/><ArrowOnCurve axisScale={axisScale} points={curve} index={Math.floor(curve.length*.55)} color={waveColors.rarefactionFast} p={p} size={.65}/></group>:null
  })}</group>
}


// Invisible, wider picking geometry. Kept separate from the visual line so
// selection remains possible at ordinary zoom without changing its appearance.
function CurvePickTarget({points,onPick}){
  const geometry=useMemo(()=>{
    if(points.length<2)return null
    const samples=points.filter((_,i)=>i%Math.max(1,Math.floor(points.length/180))===0)
    if(samples[samples.length-1]!==points[points.length-1])samples.push(points[points.length-1])
    const path=new THREE.CatmullRomCurve3(samples.map(q=>new THREE.Vector3(q.tau,.055,q.zc)))
    return new THREE.TubeGeometry(path,Math.max(8,samples.length*2),.045,5,false)
  },[points])
  useEffect(()=>()=>geometry?.dispose(),[geometry])
  if(!geometry)return null
  return <mesh geometry={geometry} onClick={e=>{e.stopPropagation();onPick(e)}}>
    <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide}/>
  </mesh>
}

// Marcador 3D uniforme: a escala inversa compensa a escala anisotrópica dos eixos.
function SingularityMarker({position,selected=false,onSelect,axisScale={tau:1,Y:1,zc:1}}){
  const inv= [axisScale.tau,axisScale.Y,axisScale.zc].map(v=>1/Math.max(Math.abs(v||1),1e-8))
  return <group position={position} scale={inv} onClick={e=>{e.stopPropagation();onSelect?.()}}>
    <group renderOrder={22}>
      <ScientificPoint3D radius={0.033} widthSegments={28} heightSegments={20}
        color={selected?'#49baff':'#f5f7fb'} metalness={0.15} roughness={0.3}/>
    </group>
    <mesh rotation={[Math.PI/2,0,0]} renderOrder={23}>
      <torusGeometry args={[0.052,0.0035,10,48]}/>
      <meshStandardMaterial color={selected?'#4de1ff':'#d6dce6'} emissive={selected?'#087d9d':'#000000'} emissiveIntensity={selected?0.5:0} depthTest={false}/>
    </mesh>
    <mesh visible={false}>
      <sphereGeometry args={[0.11,12,10]}/>
      <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </mesh>
  </group>
}

function RarefactionSingularities({p,tauMin,tauMax,visible=true,showStable=true,showUnstable=true,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale}){
  const data=useMemo(()=>visible?finiteRarefactionSeparatrices(p,tauMin,tauMax):{singularities:[],separatrices:[]},[p,tauMin,tauMax,visible])
  if(!visible)return null
  const selectedFinite=selectedSingularity?.kind==='finite'?selectedSingularity.index:null
  return <group>
    {data.separatrices.filter(c=>(c.stable?showStable:showUnstable)).map((curve,i)=>{const color=curve.stable?waveColors.rarefactionSlow:waveColors.rarefactionFast,pts=rarefactionPhasePoints(curve.points,.043);return <group key={'s'+i}><Line points={pts} color={color} {...scientificCurveStyle('separatrix','3d')} depthTest={false} renderOrder={18} onClick={e=>{e.stopPropagation();onSelectCurve?.({kind:"separatrix",origin:"finite",stable:curve.stable,singularityIndex:curve.singularityIndex,branch:i,point:{tau:e.point.x,zc:e.point.z}})}}/><CurvePickTarget points={curve.points} onPick={e=>onSelectCurve?.({kind:"separatrix",origin:"finite",stable:curve.stable,singularityIndex:curve.singularityIndex,branch:i,point:{tau:e.point.x,zc:e.point.z}})}/><ArrowOnCurve axisScale={axisScale} p={p} points={curve.points} index={Math.floor(curve.points.length*.45)} color={color}/></group>})}
    {data.singularities.map((q,i)=>{const selected=selectedFinite===i;return <group key={i}><SingularityMarker position={[q.tau,0,q.zc]} selected={selected} axisScale={axisScale} onSelect={()=>setSelectedSingularity?.({kind:'finite',index:i})}/></group>})}
  </group>
}


function ArrowOnCurve({points,index,color,p,size=1,directionSign=1,directionOverride,positionOverride,axisScale={tau:1,Y:1,zc:1}}){
  const arrow=directionOverride?{direction:directionOverride}:rarefactionPhaseArrow(points,index,p)
  if(!arrow)return null
  const scales=[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>Math.max(Math.abs(v||1),1e-8))
  // Orient in displayed coordinates, then cancel axis distortion before rotating
  // the solid arrow. The shaft and head keep circular cross-sections at any scale.
  const direction=new THREE.Vector3(...arrow.direction).multiply(new THREE.Vector3(...scales)).multiplyScalar(directionSign).normalize()
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction)
  return <group position={positionOverride??[arrow.point.tau,0,arrow.point.zc]} scale={scales.map(v=>1/v)}>
    <group quaternion={q} scale={size}>
      <mesh position={[0,-.022,0]} renderOrder={53}>
        <cylinderGeometry args={[.007,.007,.072,24]}/>
        <meshStandardMaterial color={color} metalness={.22} roughness={.28} emissive={color} emissiveIntensity={.12} depthWrite={false} depthTest={false}/>
      </mesh>
      <mesh position={[0,.031,0]} renderOrder={54}>
        <coneGeometry args={[.024,.058,32]}/>
        <meshStandardMaterial color={color} metalness={.22} roughness={.28} emissive={color} emissiveIntensity={.12} depthWrite={false} depthTest={false}/>
      </mesh>
    </group>
  </group>
}


function InfinityRarefactionSingularity({p,tauMin,tauMax,visible=true,showStable=true,showUnstable=true,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale}){
  const qs=useMemo(()=>infinityRarefactionSingularities(p),[p])
  const separatrices=useMemo(()=>visible?infinityRarefactionSeparatrices(p,{tauMin,tauMax}):[],[p,tauMin,tauMax,visible])
  if(!visible||!qs.length)return null
  const selected=selectedSingularity?.kind==='infinity'
  return <group>
    {separatrices.filter(c=>c.visibleInFiniteChart&&(c.stable?showStable:showUnstable)).map((curve,i)=>{const color=curve.stable?waveColors.rarefactionSlow:waveColors.rarefactionFast,pts=rarefactionPhasePoints(curve.points,.062);return <group key={'infsep'+i}><Line points={pts} color={color} {...scientificCurveStyle('separatrix','3d')} depthTest={false} renderOrder={18} onClick={e=>{e.stopPropagation();onSelectCurve?.({kind:"separatrix",origin:"infinity",stable:curve.stable,branch:i,point:{tau:e.point.x,zc:e.point.z}})}}/><CurvePickTarget points={curve.points} onPick={e=>onSelectCurve?.({kind:"separatrix",origin:"infinity",stable:curve.stable,branch:i,point:{tau:e.point.x,zc:e.point.z}})}/><ArrowOnCurve axisScale={axisScale} p={p} points={curve.points} index={Math.floor(curve.points.length*.38)} color={color}/></group>})}
    {[-1,1].map((zh,i)=><group key={i}><SingularityMarker position={[0,0,zh*.998]} selected={selected} axisScale={axisScale} onSelect={()=>setSelectedSingularity?.({kind:'infinity'})}/></group>)}
  </group>
}

// C_s and C_f are classified by the selected eigenvalue, never by screen position.
const CHARACTERISTIC_COLORS={slow:'#87cefa',fast:'#f08080'}
function CharacteristicSurface({tauMin,tauMax,p,_point,setPoint,showSlow=true,showFast=true,showCoincidence=true,sharedLoci=[],surfaceOpacity=0.15,onInspectPoint}){
  const surfaces=useMemo(()=>{
    return characteristicMesh(p,tauMin,tauMax)
  },[p,tauMin,tauMax])
  return <>
    {surfaces.leaves.filter(item=>item.branch==='slow'?showSlow:showFast).map(item=><mesh key={item.branch} onPointerDown={e=>{e.stopPropagation();const selected={tau:clamp(e.point.x,tauMin,tauMax),Y:0,zc:clamp(e.point.z,-.999,.999)};setPoint(q=>({...q,...selected}));onInspectPoint?.(selected)}}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[item.coords,3]}/></bufferGeometry>
      <meshStandardMaterial color={CHARACTERISTIC_COLORS[item.branch]} side={THREE.DoubleSide} transparent opacity={surfaceOpacity} depthWrite={false} depthTest={true} roughness={0.55} metalness={0.0}/>
    </mesh>)}
    {showCoincidence&&sharedLoci.filter(item=>item.id==='E').flatMap(item=>item.paths.map((path,i)=><Line key={i} points={path}  color="#bc9cba" {...scientificCurveStyle('locus','3d')} depthTest={false} renderOrder={5}/>))}
  </>
}

function ExceptionalDirectionHandles({p,tauMin,tauMax,onSelect,selectedDirection,axisScale}) {
  const {markers}=useMemo(()=>exceptionalMarkers(p),[p])
  return <group>{markers.map((marker,i)=>{const selected=selectedDirection&&(marker.infinity?selectedDirection.infinity:!selectedDirection.infinity&&Math.abs(marker.zc-selectedDirection.zc)<1e-8);const zc=marker.zc*(marker.infinity?.995:1);const center=clamp(0,tauMin,tauMax);const inverseScale=[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>1/Math.max(Math.abs(v||1),1e-8));return <group key={`${marker.infinity?'inf':marker.z}-${i}`} position={[center,0,zc]}>
    <group scale={inverseScale}><group onClick={e=>{e.stopPropagation();onSelect(marker)}} onPointerOver={e=>{e.stopPropagation()}}>
      <ScientificPoint3D radius={selected?.068:.052} color={selected?"#ffffff":"#ffd166"} material="basic"/>
    </group>
    <mesh raycast={()=>null}><torusGeometry args={[selected?.104:.083,.009,6,28]}/><meshBasicMaterial color={selected?"#fbbf24":"#1f2937"} depthTest={false}/></mesh></group>
    {selected&&<Line points={[[tauMin-center,0,0],[tauMax-center,0,0]]} color="#fbbf24" lineWidth={1.5} transparent opacity={0.75} depthTest={false} renderOrder={20}/> }
  </group>})}</group>
}

// All axis labels use the same KaTeX/HTML renderer, with anchors
// derived from their corresponding axis segments.
// Project every axis label into the same DOM overlay, avoiding Drei Html
// clipping and inconsistent depth/scale behavior.
function AxisScreenAnchors({tauMax,YMax,axisScale,onPositions}) {
  const {camera,size}=useThree()
  const previous=useRef(null)
  const lastUpdate=useRef(-Infinity)
  const projected=useMemo(()=>new THREE.Vector3(),[])
  const originVector=useMemo(()=>new THREE.Vector3(),[])
  useFrame(({clock})=>{
    // Axis labels live in React DOM: updating them on every WebGL frame
    // forces unnecessary React reconciliation while OrbitControls rotates.
    // Cap label refresh at 20 Hz; the WebGL camera remains fully responsive.
    const now=clock.elapsedTime
    if(now-lastUpdate.current<0.05)return
    lastUpdate.current=now
    const origin=originVector.set(0,0,0).project(camera)
    const ox=(origin.x+1)*size.width/2
    const oy=(1-origin.y)*size.height/2
    const axes=[
      {id:'tau',end:[Math.max(0,tauMax)*axisScale.tau,0,0]},
      {id:'Y',end:[0,Math.max(0,YMax)*axisScale.Y,0]},
      {id:'zcPlus',end:[0,0,axisScale.zc]},
      {id:'zcMinus',end:[0,0,-axisScale.zc]},
    ]
    const next={}
    for(const axis of axes){
      const [ex,ey,ez]=axis.end
      // Find the furthest point of this ray that is still inside the canvas.
      let found=null
      for(let i=0;i<=40;i++){
        const t=1-i/40
        projected.set(ex*t,ey*t,ez*t).project(camera)
        if(projected.z>=-1&&projected.z<=1&&Math.abs(projected.x)<0.88&&Math.abs(projected.y)<0.88){
          found={x:(projected.x+1)*size.width/2,y:(1-projected.y)*size.height/2}
          break
        }
      }
      if(!found)continue
      const dx=found.x-ox,dy=found.y-oy
      const distance=Math.hypot(dx,dy)
      // Offset each label 16 screen pixels beyond its axis tip.
      // When a ray is viewed end-on, use a stable screen direction.
      const ux=distance>2?dx/distance:(axis.id==='Y'?0:axis.id==='zcMinus'?-1:1)
      const uy=distance>2?dy/distance:(axis.id==='Y'?-1:0)
      next[axis.id]={
        x:THREE.MathUtils.clamp(found.x+16*ux,32,size.width-32),
        y:THREE.MathUtils.clamp(found.y+16*uy,26,size.height-26),
      }
    }
    const old=previous.current
    if(!old||Object.keys(next).some(id=>!old[id]||Math.hypot(next[id].x-old[id].x,next[id].y-old[id].y)>1.5)
      ||Object.keys(old).some(id=>!next[id])){
      previous.current=next
      onPositions(next)
    }
  })
  return null
}

function Axes({tauMin,tauMax,YMin,YMax,axisScale,onAxisPositions}) {
  const axisLines=[
    {id:'tau',from:[tauMin,0,0],to:[tauMax,0,0],color:'#698b9c'},
    {id:'Y',from:[0,YMin,0],to:[0,YMax,0],color:'#718d7a'},
    {id:'zc',from:[0,0,-1],to:[0,0,1],color:'#8e829b'},
  ]
  const scale=[axisScale.tau,axisScale.Y,axisScale.zc]
  const worldPoint=point=>point.map((value,i)=>value*scale[i])
  return <group>
    {axisLines.map(axis=><Line key={axis.id} points={[worldPoint(axis.from),worldPoint(axis.to)]}
      color={axis.color} lineWidth={1} transparent opacity={0.55}
      depthTest={false} renderOrder={1}/>)}
    <AxisScreenAnchors {...{tauMin,tauMax,YMin,YMax,axisScale}} onPositions={onAxisPositions}/>
  </group>
}

function LiftedSampleMarker({sample,axisScale}){
  if(!sample)return null
  const {tau,Y,zc}=sample
  if(![tau,Y,zc].every(Number.isFinite))return null
  const inv=[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>1/Math.max(Math.abs(v||1),1e-8))
  return <group position={[tau,Y,zc]} scale={inv} renderOrder={45}>
    <mesh raycast={()=>null}><sphereGeometry args={[0.056,24,16]}/><meshBasicMaterial color="#ffffff" depthTest={false}/></mesh>
    <mesh raycast={()=>null}><sphereGeometry args={[0.089,24,16]}/><meshBasicMaterial color="#30c9ff" wireframe transparent opacity={0.95} depthTest={false}/></mesh>
  </group>
}

const CameraRig=forwardRef(function CameraRig(_,ref){
  const controls=useRef(),{camera}=useThree()
  const setView=(pos,up=[0,1,0])=>{
    camera.position.set(...pos)
    camera.up.set(...up)
    camera.lookAt(0,0,0)
    controls.current?.target.set(0,0,0)
    controls.current?.update()
  }
  useImperativeHandle(ref,()=>({front:()=>setView([0,0,5]),side:()=>setView([5,0,0]),back:()=>setView([0,0,-5]),left:()=>setView([-5,0,0]),bottom:()=>setView([0,-5,0],[0,0,1]),top:()=>setView([0.06,5,0.0001]),reset:()=>setView([3,3,3]),focus:(target)=>{if(!Array.isArray(target)||!target.every(Number.isFinite))return;const oldTarget=controls.current?.target;const offset=camera.position.clone().sub(oldTarget||{x:0,y:0,z:0});camera.position.set(target[0]+offset.x,target[1]+offset.y,target[2]+offset.z);controls.current?.target.set(...target);controls.current?.update()},zoom:(factor)=>{camera.position.multiplyScalar(factor);controls.current?.update()}}))
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} />
})

function SceneContent({seededCurves=[],sharedLoci=[],tauMin,tauMax,YMin,YMax,p,point,setPoint,cameraRef,compositeGeometry,fixedState,riemannStates,onChangeRiemannState,showFastInflectionJunction,showBackwardMinusJunction,showInflectionJunction,forwardPlusReport,forwardPlusPointVisibility,forwardSonicReport,forwardSonicPointVisibility,showNonlocalShock,showSeededKs,showFullPsRarefaction,showLeftSeededRarefaction,showRightSeededRarefaction,showForwardCharacteristicPoint,showBackwardCharacteristicPoint,showForwardFastCharacteristicPoint,showBackwardSlowCharacteristicPoint,showLeftRiemannFibre,showRightRiemannFibre,showMinusStateFibre,showPlusStateFibre,showSMinus,showSPlus,showDS,showJ,showKMinus,showKPlus,showRarefaction,showRareCurves,showCharacteristicSlow,showCharacteristicFast,showCoincidence,showFiniteStable,showFiniteUnstable,showInfinityStable,showInfinityUnstable,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale,sonicMeshMode,btCurveMode,sonicRenderMode,surfaceOpacity,surfaceIsolation,showBTMinus,showBTPlus,showHopfMinus,showHopfPlus,onSelectExceptional,selectedExceptional,onInspectPoint,onInspectSonic,liftedInspection,onAxisPositions,onPointLabelPositions}){
  const rightJunctions=useMemo(()=>rightWaveJunctions(seededCurves.find(q=>q.family==='fast'),riemannStates?.right,p),[seededCurves,riemannStates,p])
  const junctionMarkers=[
    ...seededCurves.filter(q=>q.family==='slow'&&!q.kind&&q.complete&&showInflectionJunction).map(q=>({...q.points.at(-1),Y:0,color:'#ffffff',label:'I_s'})),
    ...(forwardPlusReport?.points??[]).filter(q=>forwardPlusPointVisibility?.[q.id]!==false).map(q=>({...q,color:'#f472b6',label:`Q_{${q.index}}^+`})),
    ...(forwardSonicReport?.points??[]).filter(q=>forwardSonicPointVisibility?.[q.id]!==false).map(q=>({...q,color:'#fbbf24',label:`Q_{${q.index}}^-`})),
    ...(showFastInflectionJunction?rightJunctions.fastInflection.map(q=>({...q,color:'#30d158',label:'I_f'})):[]),
    ...(showBackwardMinusJunction?rightJunctions.backwardMinus.map(q=>({...q,color:'#64d2ff'})):[]),
  ].filter((q,i,all)=>all.findIndex(r=>Math.hypot(r.tau-q.tau,r.Y-q.Y,r.zc-q.zc)<1e-6)===i)
  const referenceMarkers=useMemo(()=>selectedHugoniotCharacteristicMarkers(riemannStates,p),[riemannStates,p])
  const pointLabels=[
    ...(showForwardCharacteristicPoint?referenceMarkers.forward.filter(q=>q.branch==='slow').map(q=>({...q,tex:'P_s',color:'#ff9f0a'})):[]),
    ...(showBackwardCharacteristicPoint?referenceMarkers.backward.filter(q=>q.branch==='fast').map(q=>({...q,tex:'P_f',color:'#30d158'})):[]),
    ...junctionMarkers.filter(q=>q.label||q.index).map(q=>({...q,tex:q.label??`Q_{${q.index}}`,offsetY:q.label==='I_s'?8:-20})),
  ]
  const inspectIntersection=q=>{setPoint(q);onInspectPoint?.(q)}
  return <>
    <PointScreenAnchors labels={pointLabels} axisScale={axisScale} onPositions={onPointLabelPositions}/>
    <color attach="background" args={['#0b1018']}/>
    <ambientLight intensity={.9}/>
    <hemisphereLight args={['#e4efff','#263445',.35]}/>
    <directionalLight position={[5,6,8]} intensity={1.0}/>
    <directionalLight position={[-4,-5,-6]} intensity={.35} color="#c4dcff"/>
    <group scale={[axisScale.tau,axisScale.Y,axisScale.zc]}>
    <CharacteristicSurface sharedLoci={sharedLoci} {...{tauMin,tauMax,p,point,setPoint}} showSlow={showCharacteristicSlow&&(surfaceIsolation==='all'||surfaceIsolation==='characteristic')} showFast={showCharacteristicFast&&(surfaceIsolation==='all'||surfaceIsolation==='characteristic')} showCoincidence={showCoincidence} surfaceOpacity={surfaceOpacity} onInspectPoint={onInspectPoint}/>
    <StateFibres U={fixedState} p={p} showMinus={showMinusStateFibre} showPlus={showPlusStateFibre}/><StateFibres U={riemannStates?.left} p={p} showMinus={showLeftRiemannFibre} showPlus={false} colorOverride="#ff9f0a"/><StateFibres U={riemannStates?.right} p={p} showMinus={false} showPlus={showRightRiemannFibre} colorOverride="#30d158"/>
    <CharacteristicHugoniotPoints onChangeRiemannState={onChangeRiemannState} states={riemannStates} p={p} axisScale={axisScale} showForward={showForwardCharacteristicPoint} showBackward={showBackwardCharacteristicPoint} showForwardFast={showForwardFastCharacteristicPoint} showBackwardSlow={showBackwardSlowCharacteristicPoint} onSelect={inspectIntersection}/>
    {seededCurves.filter(q=>q.kind==='composite'?showSeededKs:q.kind==='nonlocal'&&showNonlocalShock).filter(q=>q.points.length>1).map((curve,i)=>{
      const color=curve.kind==='nonlocal'?'#fbbf24':'#c084fc'
      const index=Math.floor(curve.points.length/2),a=curve.points[Math.max(0,index-1)],b=curve.points[Math.min(curve.points.length-1,index+1)],q=curve.points[index]
      return <group key={`ks-${i}`}><Line points={curve.points.map(q=>[q.tau,q.Y,q.zc])} color={color} lineWidth={2.5} depthTest={false} renderOrder={48}/><ArrowOnCurve points={curve.points} index={index} p={p} color={color} axisScale={axisScale} size={.8} directionOverride={[b.tau-a.tau,b.Y-a.Y,b.zc-a.zc]} positionOverride={[q.tau,q.Y,q.zc]}/></group>
    })}
    {junctionMarkers.map((q,i)=><group renderOrder={61} key={`wave-junction-${i}`} position={[q.tau,q.Y,q.zc]} scale={[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>1/Math.max(Math.abs(v||1),1e-8))}><ScientificPoint3D radius={.03} color={q.color} emissiveIntensity={.35}/></group>)}
    <SeededRarefactions axisScale={axisScale} curves={seededCurves} p={p} showFull={showFullPsRarefaction} showLeft={showLeftSeededRarefaction} showRight={showRightSeededRarefaction}/>
    <RarefactionField {...{p,tauMin,tauMax,axisScale}} visible={showRarefaction&&showRareCurves}/>
    <CompositeFields geometry={compositeGeometry} showMinus={showKMinus} showPlus={showKPlus}/>
    <RarefactionSingularities {...{p,tauMin,tauMax,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale}} visible={showRarefaction} showStable={showFiniteStable} showUnstable={showFiniteUnstable}/>
    <InfinityRarefactionSingularity {...{p,tauMin,tauMax,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale}} visible={showRarefaction} showStable={showInfinityStable} showUnstable={showInfinityUnstable}/>
    {<HopfSurfaces {...{p,tauMin,tauMax,YMin,YMax,axisScale}} showMinus={showHopfMinus&&(surfaceIsolation==='all'||surfaceIsolation==='hopf-minus'||surfaceIsolation==='trace-minus')} showPlus={showHopfPlus&&(surfaceIsolation==='all'||surfaceIsolation==='hopf-plus'||surfaceIsolation==='trace-plus')} surfaceOpacity={surfaceOpacity} traceOnly={surfaceIsolation==='trace-minus'||surfaceIsolation==='trace-plus'}/>}
    {(surfaceIsolation==='all'||surfaceIsolation==='sonic-minus'||surfaceIsolation==='sonic-plus')&&(showSMinus||showSPlus||showBTMinus||showBTPlus)&&<SonicSurfaces {...{p,tauMin,tauMax,YMin,YMax,showBTMinus,showBTPlus}} showMinus={(showSMinus||showBTMinus)&&(surfaceIsolation==='all'||surfaceIsolation==='sonic-minus')} showPlus={(showSPlus||showBTPlus)&&(surfaceIsolation==='all'||surfaceIsolation==='sonic-plus')} showSurfaceMinus={showSMinus} showSurfacePlus={showSPlus} sonicMeshMode={sonicMeshMode} btCurveMode={btCurveMode} sonicRenderMode={sonicRenderMode} surfaceOpacity={surfaceOpacity} onInspectSonic={onInspectSonic}/>}
    <SonicSpecialLoci sharedLoci={sharedLoci} showDS={showDS} showJ={showJ}/>
    <LiftedSampleMarker sample={liftedInspection?.point} axisScale={axisScale}/>
    <ExceptionalDirectionHandles p={p} tauMin={tauMin} tauMax={tauMax} onSelect={onSelectExceptional} selectedDirection={selectedExceptional} axisScale={axisScale}/>
    </group>
    <Axes {...{tauMin,tauMax,YMin,YMax,axisScale}} onAxisPositions={onAxisPositions}/>
    <CameraRig ref={cameraRef}/>
  </>
}

export default function Scene({seededCurvesData=null,sharedLoci=[],tauMin,tauMax,YMin=-2,YMax=2,p,point,setPoint,compositeGeometry={minus:[],plus:[]},fixedState=null,riemannStates=null,onChangeRiemannState,showFastInflectionJunction,showBackwardMinusJunction,showInflectionJunction,forwardPlusReport,forwardPlusPointVisibility,forwardSonicReport,forwardSonicPointVisibility,showNonlocalShock,showSeededKs=true,showFullPsRarefaction=true,showLeftSeededRarefaction=true,showRightSeededRarefaction=true,showForwardCharacteristicPoint=true,showBackwardCharacteristicPoint=true,showForwardFastCharacteristicPoint=false,showBackwardSlowCharacteristicPoint=false,showLeftRiemannFibre=true,showRightRiemannFibre=true,showMinusStateFibre=true,showPlusStateFibre=true,showSMinus=true,showSPlus=true,sonicMeshMode='original',btCurveMode='continuation',sonicRenderMode='transparent',showDS=true,showJ=true,showKMinus=false,showKPlus=false,showRarefaction=true,showRareCurves=true,showCharacteristicSlow=true,showCharacteristicFast=true,showCoincidence=true,showFiniteStable=true,showFiniteUnstable=true,showInfinityStable=true,showInfinityUnstable=true,showBTMinus=true,showBTPlus=true,showHopfMinus=true,showHopfPlus=true,selectedSingularity=null,setSelectedSingularity,onSelectCurve,liftedInspection=null,axisScale={tau:1,Y:1,zc:1}}){
  const cameraRef=useRef()
  const [pointLabelPositions,setPointLabelPositions]=useState([])
  const [axisScreenPositions,setAxisScreenPositions]=useState(null)
  useEffect(()=>{
    const q=liftedInspection?.point
    if(q&&[q.tau,q.Y,q.zc].every(Number.isFinite))
      cameraRef.current?.focus([q.tau*axisScale.tau,q.Y*axisScale.Y,q.zc*axisScale.zc])
  },[liftedInspection,axisScale])

  const [surfaceOpacity,setSurfaceOpacity]=useState(0.38)
  const [surfaceIsolation,setSurfaceIsolation]=useState('all')
  const [showFiberInspection,setShowFiberInspection]=useState(false)
  const [inspectInfinity,setInspectInfinity]=useState(false)
  const [selectedExceptional,setSelectedExceptional]=useState(null)
  const [inspectedCharacteristic,setInspectedCharacteristic]=useState(null)
  const [inspectedSonic,setInspectedSonic]=useState(null)
  const fiberInspection=useMemo(()=>showFiberInspection
    ? exceptionalFiberLimit(inspectInfinity ? Infinity : projectiveZ(point.zc),p)
    : null,[showFiberInspection,inspectInfinity,point.zc,p])
  const exceptional=useMemo(()=>showFiberInspection?exceptionalDirections(p):null,[showFiberInspection,p])
  const onSelectExceptional=marker=>{setSelectedExceptional(marker);setShowFiberInspection(true);setInspectInfinity(Boolean(marker.infinity));setPoint(current=>({...current,zc:marker.zc,Y:0}))}
  const seededCurves=useMemo(()=>seededCurvesData??seededRarefactionCurves(riemannStates,p,tauMin,tauMax),[seededCurvesData,riemannStates,p,tauMin,tauMax])
  const intersectionCounts=useMemo(()=>selectedHugoniotCharacteristicMarkers(riemannStates,p,{includeForwardFast:true,includeBackwardSlow:true}),[riemannStates,p])
  const characteristicInspection=useMemo(()=>inspectedCharacteristic
    ? characteristicSpectrum(inspectedCharacteristic.tau,projectiveZ(inspectedCharacteristic.zc),p)
    : null,[inspectedCharacteristic,p])
  const sonicInspection=useMemo(()=>inspectedSonic?inspectSonicPoint(inspectedSonic,p):null,[inspectedSonic,p])
  const fmt=n=>Number.isFinite(n)?Number(n.toPrecision(6)).toString():String(n)
  return <div className="sceneWrap">
    <ScientificLegend environment="3d" items={[
      {id:'left-fibre',tex:String.raw`\mathcal H^{\mathrm{forw}}(U_L)`,color:'#ff9f0a',shape:'line',visible:Boolean(riemannStates?.left&&showLeftRiemannFibre)},
      {id:'right-fibre',tex:String.raw`\mathcal H^{\mathrm{back}}(U_R)`,color:'#30d158',shape:'line',visible:Boolean(riemannStates?.right&&showRightRiemannFibre)},
      {id:'forward-characteristic-points',tex:String.raw`\mathcal C_s\cap\mathcal H^{\mathrm{forw}}(U_L)`,color:'#ff9f0a',shape:'circle',visible:Boolean(intersectionCounts.forward.some(q=>q.branch==='slow')&&showForwardCharacteristicPoint)},
      {id:'backward-characteristic-points',tex:String.raw`\mathcal C_f\cap\mathcal H^{\mathrm{back}}(U_R)`,color:'#30d158',shape:'diamond',visible:Boolean(intersectionCounts.backward.some(q=>q.branch==='fast')&&showBackwardCharacteristicPoint)},
      {id:'forward-fast-characteristic-point',tex:String.raw`\mathcal C_f\cap\mathcal H^{\mathrm{forw}}(U_L)`,color:'#ff9f0a',shape:'circle',visible:Boolean(intersectionCounts.forward.some(q=>q.branch==='fast')&&showForwardFastCharacteristicPoint)},
      {id:'backward-slow-characteristic-point',tex:String.raw`\mathcal C_s\cap\mathcal H^{\mathrm{back}}(U_R)`,color:'#30d158',shape:'diamond',visible:Boolean(intersectionCounts.backward.some(q=>q.branch==='slow')&&showBackwardSlowCharacteristicPoint)},
      {id:'seeded-slow-rarefaction',tex:String.raw`\mathcal R_s(P_s\to\mathcal J)`,description:seededCurves.find(q=>q.family==='slow')?.complete?'Primeira inflexão atingida':'Arco interrompido antes da inflexão',color:'#ff9f0a',shape:'line',visible:showLeftSeededRarefaction&&seededCurves.some(q=>q.family==='slow')},
      {id:'nonlocal-shock',tex:String.raw`S_s^{\mathrm{nl}}`,color:'#fbbf24',shape:'line',visible:showNonlocalShock&&seededCurves.some(q=>q.kind==='nonlocal')},
      {id:'seeded-ks',tex:String.raw`\mathcal K_s`,color:'#c084fc',shape:'line',visible:showSeededKs&&seededCurves.some(q=>q.kind==='composite')},
      {id:'seeded-full-ps-rarefaction',tex:String.raw`\mathcal R(P_s)`,color:'#ffcf76',shape:'line',visible:showFullPsRarefaction&&seededCurves.some(q=>q.kind==='full')},
      {id:'seeded-fast-rarefaction',tex:String.raw`\mathcal R(P_f)`,color:'#30d158',shape:'line',visible:showRightSeededRarefaction&&seededCurves.some(q=>q.family==='fast')},
      {id:'sonic-minus',tex:String.raw`\mathcal S^-`,color:'#64a5ff',shape:'line',visible:showSMinus},
      {id:'sonic-plus',tex:String.raw`\mathcal S^+`,color:'#45bc86',shape:'line',visible:showSPlus},
      {id:'coincidence',tex:String.raw`\mathcal E`,color:'#bd95b0',shape:'line',visible:showCoincidence},
      {id:'ds',tex:String.raw`\mathcal{DS}`,color:'#8da5b5',shape:'line',visible:showDS},
      {id:'inflection',tex:String.raw`\mathcal J`,color:'#8da5b5',shape:'line',visible:showJ},
      {id:'bt-minus',tex:String.raw`\mathcal{BT}^-`,color:'#8da5b5',shape:'line',visible:showBTMinus},
      {id:'bt-plus',tex:String.raw`\mathcal{BT}^+`,color:'#8da5b5',shape:'line',visible:showBTPlus},
    ]}/>
    <Canvas dpr={[1,1.5]} gl={{powerPreference:'high-performance',antialias:true,alpha:false}} camera={{position:[3,3,3],fov:45}}><SceneContent seededCurves={seededCurves} sharedLoci={sharedLoci} {...{tauMin,tauMax,p,point,setPoint,cameraRef,compositeGeometry,fixedState,riemannStates,onChangeRiemannState,showFastInflectionJunction,showBackwardMinusJunction,showInflectionJunction,forwardPlusReport,forwardPlusPointVisibility,forwardSonicReport,forwardSonicPointVisibility,showNonlocalShock,showSeededKs,showFullPsRarefaction,showLeftSeededRarefaction,showRightSeededRarefaction,showForwardCharacteristicPoint,showBackwardCharacteristicPoint,showForwardFastCharacteristicPoint,showBackwardSlowCharacteristicPoint,showLeftRiemannFibre,showRightRiemannFibre,showMinusStateFibre,showPlusStateFibre,showSMinus,showSPlus,showDS,showJ,showKMinus,showKPlus,showRarefaction,showRareCurves,showCharacteristicSlow,showCharacteristicFast,showCoincidence,showFiniteStable,showFiniteUnstable,showInfinityStable,showInfinityUnstable,selectedSingularity,setSelectedSingularity,onSelectCurve,YMin,YMax,axisScale,sonicMeshMode,btCurveMode,sonicRenderMode,surfaceOpacity,surfaceIsolation,showBTMinus,showBTPlus,showHopfMinus,showHopfPlus,onSelectExceptional,selectedExceptional:showFiberInspection?selectedExceptional:null,onInspectPoint:selected=>{setInspectedSonic(null);setInspectedCharacteristic(selected)},onInspectSonic:selected=>{setInspectedCharacteristic(null);setInspectedSonic(selected)},liftedInspection,onAxisPositions:setAxisScreenPositions,onPointLabelPositions:setPointLabelPositions}}/></Canvas>
    {pointLabelPositions.map(label=><div key={label.id} aria-label={`Etiqueta ${label.tex}`} style={{position:'absolute',left:label.x,top:label.y,pointerEvents:'none',zIndex:32,color:label.color,fontSize:13,whiteSpace:'nowrap',textShadow:'0 1px 4px #000'}}><MathLabel>{label.tex}</MathLabel></div>)}
    {axisScreenPositions&&[
      {id:'tau',tex:String.raw`\tau`,name:'Eixo tau'},
      {id:'Y',tex:String.raw`Y`,name:'Eixo Y'},
      {id:'zcPlus',tex:String.raw`z_c=+1`,name:'Eixo z positivo'},
      {id:'zcMinus',tex:String.raw`z_c=-1`,name:'Eixo z negativo'},
    ].map(label=>axisScreenPositions[label.id]&&<div key={label.id} aria-label={label.name}
      style={{position:'absolute',left:axisScreenPositions[label.id].x,top:axisScreenPositions[label.id].y,
        transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:30,color:'#ffffff',
        fontSize:14,fontWeight:600,textShadow:'0 1px 3px #000, 0 0 6px #000',whiteSpace:'nowrap'}}>
      <MathLabel>{label.tex}</MathLabel>
    </div>)}
    {liftedInspection?.point&&<div className="liftedSampleStatus" role="status">Amostra levantada em 3D · τ={liftedInspection.point.tau.toPrecision(5)} · Y={liftedInspection.point.Y.toPrecision(5)} · z_c={liftedInspection.point.zc.toPrecision(5)} <button type="button" onClick={()=>cameraRef.current?.focus([liftedInspection.point.tau*axisScale.tau,liftedInspection.point.Y*axisScale.Y,liftedInspection.point.zc*axisScale.zc])}>Centralizar amostra</button></div>}
    <WorkspaceToolbar label="ferramentas 3D"><div className="workspaceToolbarActions" role="toolbar" aria-label="Ferramentas de navegação 3D">
      <span className="workspaceToolbarHint">Girar · mover</span>
      <button type="button" title="Afastar" aria-label="Afastar" onClick={()=>cameraRef.current?.zoom(1.18)}>−</button><button type="button" title="Aproximar" aria-label="Aproximar" onClick={()=>cameraRef.current?.zoom(0.84)}>+</button>
      <button type="button" onClick={()=>cameraRef.current?.front()}>Frente</button><button type="button" onClick={()=>cameraRef.current?.side()}>Direita</button><button type="button" onClick={()=>cameraRef.current?.top()}>Topo</button><button type="button" onClick={()=>cameraRef.current?.reset()}>Restaurar</button><details className="cameraMoreViews"><summary title="Outras vistas">Vistas ▾</summary><div className="cameraMoreMenu"><button type="button" onClick={()=>cameraRef.current?.back()}>Trás</button><button type="button" onClick={()=>cameraRef.current?.left()}>Esquerda</button><button type="button" onClick={()=>cameraRef.current?.bottom()}>Inferior</button></div></details>
      <label className="surfaceIsolationControl" title="Exibe apenas uma família de superfícies; mantém curvas, inspeções e câmera">Isolar
        <select aria-label="Isolar superfície" value={surfaceIsolation} onChange={e=>setSurfaceIsolation(e.target.value)}>
          <option value="all">Todas</option>
          <option value="characteristic">𝓒 (característica)</option>
          <option value="sonic-minus">𝓢⁻ (sônica)</option>
          <option value="sonic-plus">𝓢⁺ (sônica)</option>
          <option value="hopf-minus">Hopf⁻</option>
          <option value="hopf-plus">Hopf⁺</option>
          <option value="trace-minus">Traço zero ⁻ (sem recorte)</option>
          <option value="trace-plus">Traço zero ⁺ (sem recorte)</option>
        </select>
      </label>
      <label className="surfaceOpacityControl" title="Ajusta a opacidade das superfícies, sem alterar curvas ou equações">Superfícies <input type="range" min="0" max="1" step="0.01" value={surfaceOpacity} onChange={e=>setSurfaceOpacity(Number(e.target.value))} aria-label="Opacidade das superfícies"/><output>{Math.round(surfaceOpacity*100)}%</output></label>
    </div></WorkspaceToolbar>
    {inspectedCharacteristic&&characteristicInspection&&<DraggableInspection className="sceneInspectionCompact" aria-label="Inspeção da característica">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><strong>Ponto na característica</strong><button onClick={()=>setInspectedCharacteristic(null)} aria-label="Fechar inspeção da característica">×</button></div>
      <div>τ = {fmt(inspectedCharacteristic.tau)} · Y = 0 · z_c = {fmt(inspectedCharacteristic.zc)}</div>
      <div>Região: <strong>{characteristicInspection.branch==='slow'?'𝓒ₛ (lenta)':characteristicInspection.branch==='fast'?'𝓒𝒇 (rápida)':characteristicInspection.branch==='coincidence'?'𝓔 (coincidência)':'fibra excepcional'}</strong></div>
      {characteristicInspection.kind==='regular'&&<><div>s = {fmt(characteristicInspection.s)} · s outro = {fmt(characteristicInspection.other)}</div><div>G = {fmt(characteristicInspection.gap)}</div></>}
      <button onClick={()=>{setShowFiberInspection(true);setInspectInfinity(false);setSelectedExceptional(null)}}>Inspecionar fibra projetiva</button>
    </DraggableInspection>}
    {inspectedSonic&&<DraggableInspection className="sceneInspectionCompact" aria-label="Inspeção da superfície sônica">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><strong><><MathLabel>{inspectedSonic.side==='minus'?String.raw`\mathcal S^-`:String.raw`\mathcal S^+`}</MathLabel> {inspectedSonic.side==='minus'?'(sônica menos)':'(sônica mais)'}</></strong><button onClick={()=>setInspectedSonic(null)} aria-label="Fechar inspeção da sônica">×</button></div>
      <div>τ = {fmt(inspectedSonic.tau)} · Y = {fmt(inspectedSonic.Y)} · z_c = {fmt(inspectedSonic.zc)}</div>
      {sonicInspection?.kind==='regular'?<>
        <div>z = {fmt(sonicInspection.z)}</div>
        <div>Φ⁻ = {fmt(sonicInspection.phiMinus)} · Φ⁺ = {fmt(sonicInspection.phiPlus)}</div>
        <div>Ramo espectral {sonicInspection.onSonic?"":"(aproximado pela malha)"}: <strong>{sonicInspection.branch==='slow'?(inspectedSonic.side==='minus'?'𝓢⁻ₛ':'𝓢⁺ₛ'):sonicInspection.branch==='fast'?(inspectedSonic.side==='minus'?'𝓢⁻𝒇':'𝓢⁺𝒇'):'coincidência espectral'}</strong></div>
        <div>s = {fmt(sonicInspection.s)} · outro = {fmt(sonicInspection.other)} · G = {fmt(sonicInspection.gap)}</div>
        <div>Resíduo relativo da sônica selecionada: <strong>{sonicInspection.relativeResidual.toExponential(3)}</strong></div>
        <div>Resíduo da equação completa: {sonicInspection.fullResidual.toExponential(3)}</div>
        <div>det M = {fmt(sonicInspection.detM)} · K = {fmt(sonicInspection.K)}</div>
        {sonicInspection.exceptional&&<div>Próximo da degeneração K = det M = 0.</div>}
        <small style={{display:'block',opacity:.75,marginTop:7}}>Resíduo calculado na superfície implícita, não na interpolação triangular. Um valor não nulo pode indicar erro de discretização; a seleção não certifica pertencimento exato.</small>
      </>:<small style={{display:'block',opacity:.75,marginTop:7}}>Diagnóstico indisponível nesta carta: {sonicInspection?.kind}.</small>}
    </DraggableInspection>}
    {showFiberInspection&&fiberInspection&&<DraggableInspection style={{position:'absolute',right:12,top:12,zIndex:15,maxWidth:310,padding:'12px 14px',borderRadius:10,background:'rgba(17,24,39,.94)',color:'#f3f4f6',fontSize:12,boxShadow:'0 5px 22px #0006'}} aria-label="Inspeção da fibra projetiva">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><strong>Fibra projetiva</strong><button onClick={()=>setShowFiberInspection(false)} aria-label="Fechar inspeção">×</button></div>
      <label style={{display:'flex',alignItems:'center',gap:6,margin:'8px 0'}}><input type="checkbox" checked={inspectInfinity} onChange={e=>{if(e.target.checked)onSelectExceptional({infinity:true,zc:point.zc<0?-1:1});else{setInspectInfinity(false);setSelectedExceptional(null)}}}/> Inspecionar direção infinita (Z=0)</label>
      <div style={{margin:'8px 0'}}>Direções excepcionais: {exceptional?.allDirectionsDegenerate?'todas as direções':exceptional?.directions.length ? exceptional.directions.map(({z},i)=><button key={i} style={{margin:'2px 4px 2px 0',padding:'4px 7px'}} onClick={()=>onSelectExceptional(Number.isFinite(z)?{infinity:false,zc:2*Math.atan(z)/Math.PI,z}:{infinity:true,zc:point.zc<0?-1:1,z:Infinity})}>{Number.isFinite(z)?`z=${fmt(z)}`:'z=∞'}</button>):'nenhuma identificada'}</div>
      <div>Direção: {inspectInfinity?'z=∞':`z=${fmt(projectiveZ(point.zc))}`}</div>
      <div>Classificação: <strong>{fiberInspection.kind}</strong></div>
      {fiberInspection.kind==='degenerate'&&<><div>Ordem comum: {Number.isFinite(fiberInspection.order)?fiberInspection.order:'persistente'}</div><div>Limite: {fiberInspection.limitKind}</div>{fiberInspection.limitEquation&&<div>Reta limite: {fmt(fiberInspection.limitEquation.P)}u + {fmt(fiberInspection.limitEquation.Q)}v + {fmt(fiberInspection.limitEquation.R)} = 0</div>}</>}
      {fiberInspection.kind==='regular'&&<div>Fibra regular: reta no espaço de estados.</div>}
      {fiberInspection.kind==='absent'&&<div>Nenhum estado pertence a esta fibra.</div>}
      <small style={{display:'block',opacity:.75,marginTop:7}}>Diagnóstico algébrico; nenhuma geometria excepcional é inventada.</small>
    </DraggableInspection>}
  </div>
}
