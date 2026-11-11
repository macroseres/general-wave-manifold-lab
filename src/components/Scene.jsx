import {reflectedFastArcColors,slowWaveArcColors,waveColors} from '../config/waveColors.js'
import {fastWave,sampledIntermediateIntersections,twoShockMiddleLift,twoShockFibreArc,middleBackwardArc,slowCompositeForwardArc} from '../geometry/state/reflectedFastWave.js'
import {intermediateSurface} from '../geometry/state/intermediateSurface.js'
import {DoubleSide} from 'three'
import {waveArcArrow} from '../geometry/state/rarefactionPhaseArrow.js'
import {zoomPositionAroundTarget} from './scene/cameraZoom.js'
import PointScreenAnchors from './PointScreenAnchors.jsx'
import {rightWaveJunctions} from '../geometry/state/rightWaveJunctions.js'
import {rarefactionSingularities,infinityRarefactionSingularities} from '../math/rarefaction/singularities.js'
import {finiteRarefactionSeparatrices} from '../math/rarefaction/finiteSeparatrices.js'
import {infinityRarefactionSeparatrices} from '../math/rarefaction/separatrices.js'
import DraggableInspection from './DraggableInspection.jsx'
import {seededRarefactionCurves} from '../geometry/state/seededRarefactionCurves.js'
import ScientificLegend from './ScientificLegend.jsx'
import {MathLabel} from './math/MathLabel.jsx'
import WorkspaceToolbar from './WorkspaceToolbar.jsx'
import ScientificPoint3D from './ScientificPoint3D.jsx'
import {exceptionalFiberLimit} from '../math/characteristic/fiberLimits.js'
import {exceptionalDirections} from '../math/characteristic/exceptionalDirections.js'
import {zFromZc as projectiveZ} from '../math/charts/zChart.js'
import {inspectSonicPoint} from '../math/sonic/pointInspection.js'
import {Canvas, useThree} from '@react-three/fiber'
import {OrbitControls} from '@react-three/drei'
import {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react'
import {selectedHugoniotCharacteristicMarkers} from '../geometry/state/fibreCharacteristicMarkers.js'
import {decreasingForwardShockArcs} from '../geometry/state/fibreGeometry.js'
import {DashDotLine,Line} from './scene/shared.jsx'
import {StateFibres, CharacteristicHugoniotPoints, CompositeFields} from './scene/StateOverlays.jsx'
import {SonicSpecialLoci} from './scene/SpecialLoci.jsx'
import {HopfSurfaces} from './scene/HopfSurfaces.jsx'
import {SonicSurfaces} from './scene/SonicSurfaces.jsx'
import {SeededRarefactions, RarefactionField, RarefactionSingularities, ArrowOnCurve, InfinityRarefactionSingularity, CurveArrowVisibility} from './scene/Rarefaction.jsx'
import {CharacteristicSurface, ExceptionalDirectionHandles} from './scene/CharacteristicSurface.jsx'
import {Axes, LiftedSampleMarker} from './scene/Annotations.jsx'

const CameraRig=forwardRef(function CameraRig(_,ref){
  const controls=useRef(),{camera}=useThree()
  const setView=(pos,up=[0,1,0])=>{
    camera.position.set(...pos)
    camera.up.set(...up)
    camera.lookAt(0,0,0)
    controls.current?.target.set(0,0,0)
    controls.current?.update()
  }
  useImperativeHandle(ref,()=>({front:()=>setView([0,0,5]),side:()=>setView([5,0,0]),back:()=>setView([0,0,-5]),left:()=>setView([-5,0,0]),bottom:()=>setView([0,-5,0],[0,0,1]),top:()=>setView([0.06,5,0.0001]),reset:()=>setView([3,3,3]),focus:(target)=>{if(!Array.isArray(target)||!target.every(Number.isFinite))return;const oldTarget=controls.current?.target;const offset=camera.position.clone().sub(oldTarget||{x:0,y:0,z:0});camera.position.set(target[0]+offset.x,target[1]+offset.y,target[2]+offset.z);controls.current?.target.set(...target);controls.current?.update()},zoom:(factor)=>{const position=zoomPositionAroundTarget(camera.position,controls.current?.target,factor);if(!position)return;camera.position.set(position.x,position.y,position.z);controls.current?.update()}}))
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} />
})

function cutWaveArcs(arcs,arcIndex,sampleIndex,[tau,Y,zc]){
  const points=arcs[arcIndex]
  const end=Math.min(Math.floor(sampleIndex)+1,points.length-1)
  return [...arcs.slice(0,arcIndex),[...points.slice(0,end),{tau,Y,zc}]]
}

function insertIntersectionSamples(arcs,hits,arcKey,sampleKey,positionKey){
  return arcs.map((points,index)=>{
    const matches=hits.filter(hit=>hit.refined&&hit[arcKey]===index)
      .sort((a,b)=>b[sampleKey]-a[sampleKey])
    if(!matches.length)return points
    const result=[...points]
    for(const hit of matches){
      const [tau,Y,zc]=hit[positionKey]
      result.splice(Math.min(Math.floor(hit[sampleKey])+1,points.length-1),0,{tau,Y,zc})
    }
    return result
  })
}

function SceneContent({middleCandidate,compositeSeparatrices,compositeEquilibria,compositeFolds,compositeEvents,showKMinusArrows,showInfinityMarkers,showFastMinus,showFastPlus,visibleFastArcs,showKsDs,showRarefactionJoin,showCompositeForwardArc,showMiddlePoint,showSlowMiddlePoint,showMiddleFibre,hiddenReflectedArcs,showReflectedMinus,showReflectedPlus,showReflectedFastWave,showIntermediateSurface,showForwardShockArc,seededCurves=[],sharedLoci=[],tauMin,tauMax,YMin,YMax,p,point,setPoint,cameraRef,compositeGeometry,fixedState,riemannStates,onChangeRiemannState,showFastInflectionJunction,showBackwardMinusJunction,showInflectionJunction,forwardPlusReport,forwardPlusPointVisibility,forwardSonicReport,forwardSonicPointVisibility,showNonlocalShock,showSeededKs,showFullPsRarefaction,showLeftSeededRarefaction,showRightSeededRarefaction,showForwardCharacteristicPoint,showBackwardCharacteristicPoint,showForwardFastCharacteristicPoint,showBackwardSlowCharacteristicPoint,showLeftRiemannFibre,showRightRiemannFibre,showMinusStateFibre,showPlusStateFibre,showSMinus,showSPlus,showDS,showJ,showKMinus,showKPlus,showRarefaction,showRareCurves,showCharacteristicSlow,showCharacteristicFast,showCoincidence,showFiniteStable,showFiniteUnstable,showInfinityStable,showInfinityUnstable,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale,sonicMeshMode,btCurveMode,sonicRenderMode,surfaceOpacity,surfaceIsolation,showBTMinus,showBTPlus,showHopfMinus,showHopfPlus,onSelectExceptional,selectedExceptional,onInspectPoint,onInspectSonic,liftedInspection,onAxisPositions,onPointLabelPositions}){
  const rightJunctions=useMemo(()=>rightWaveJunctions(seededCurves.find(q=>q.family==='fast'),riemannStates?.right,p),[seededCurves,riemannStates,p])
  const junctionMarkers=[
    ...seededCurves.filter(q=>q.family==='slow'&&!q.kind&&q.complete&&showInflectionJunction).map(q=>({...q.points.at(-1),Y:0,color:'#ffffff',label:'I_s'})),
    ...(forwardPlusReport?.points??[]).filter(q=>forwardPlusPointVisibility?.[q.id]===true).map(q=>({...q,color:'#f472b6',label:`Q_{${q.index}}^+`})),
    ...(forwardSonicReport?.points??[]).filter(q=>forwardSonicPointVisibility?.[q.id]===true).map(q=>({...q,color:'#fbbf24',label:`Q_{${q.index}}^-`})),
    ...(showFastInflectionJunction?rightJunctions.fastInflection.map(q=>({...q,color:'#30d158',label:'I_f'})):[]),
    ...(showBackwardMinusJunction?rightJunctions.backwardMinus.map(q=>({...q,color:'#64d2ff'})):[]),
  ].filter((q,i,all)=>all.findIndex(r=>Math.hypot(r.tau-q.tau,r.Y-q.Y,r.zc-q.zc)<1e-6)===i)
  const referenceMarkers=useMemo(()=>selectedHugoniotCharacteristicMarkers(riemannStates,p),[riemannStates,p])
  const needMiddleHits=showReflectedFastWave||showMiddlePoint||showMiddleFibre
  const shockEndpoints=useMemo(()=>twoShockMiddleLift(middleCandidate,p),[middleCandidate,p])
  const forwardShockArcs=useMemo(()=>{
    if(!showForwardShockArc&&!showIntermediateSurface&&!needMiddleHits)return []
    const seed=referenceMarkers.forward[0],left=riemannStates?.left
    const selected=twoShockFibreArc(left,seed,shockEndpoints?.slowPosition,p)
    return selected.length>1?[selected]:decreasingForwardShockArcs(left,seed,p)
  },[showForwardShockArc,showIntermediateSurface,needMiddleHits,riemannStates,referenceMarkers,shockEndpoints,p])
  const slowWaveCurves=useMemo(()=>seededCurves.filter(curve=>curve.family==='slow'&&curve.kind!=='full'),[seededCurves])
  const slowArcs=useMemo(()=>[...forwardShockArcs,...slowWaveCurves.map(curve=>curve.points)],
    [forwardShockArcs,slowWaveCurves])
  const showFastArcs=Object.values(visibleFastArcs).some(Boolean)
  const needReflection=needMiddleHits||showReflectedMinus||showReflectedPlus
  const fastArcs=useMemo(()=>showFastArcs||needReflection||showFastMinus||showFastPlus?
    fastWave(riemannStates?.right,referenceMarkers.backward[0],p,rightJunctions.backwardMinus):[],
    [showFastArcs,needReflection,showFastMinus,showFastPlus,riemannStates,referenceMarkers,p,rightJunctions])
  const fullReflectedArcs=useMemo(()=>needReflection?fastArcs.map(arc=>({
    ...arc,points:arc.points.map(q=>({...q,Y:-(q.Y??0)})),
  })):[],[fastArcs,needReflection])
  const reflectedArcs=useMemo(()=>{
    if(!needReflection)return []
    const selected=twoShockFibreArc(riemannStates?.right,referenceMarkers.backward[0],shockEndpoints?.position,p)
    return selected.length>1?[
      {kind:'local-shock',points:selected},
      ...fullReflectedArcs.filter(arc=>arc.kind!=='local-shock'),
    ]:fullReflectedArcs
  },[fullReflectedArcs,needReflection,riemannStates,referenceMarkers,shockEndpoints,p])
  const middleHits=useMemo(()=>{
    if(!needMiddleHits)return []
    const hits=sampledIntermediateIntersections(slowArcs,reflectedArcs.map(arc=>arc.points),p)
    if(!shockEndpoints)return hits
    const {middle}=shockEndpoints
    const distance=hit=>Math.hypot(hit.middle[0]-middle[0],hit.middle[1]-middle[1])
    const closest=hits.reduce((best,hit)=>!best||distance(hit)<distance(best)?hit:best,null)
    return closest&&distance(closest)<=1e-6*(1+Math.hypot(...middle))?[closest]:[]
  },[needMiddleHits,slowArcs,reflectedArcs,shockEndpoints,p])
  const intermediatePatches=useMemo(()=>showIntermediateSurface?intermediateSurface(
    insertIntersectionSamples(slowArcs,middleHits,'slowIndex','slowSampleIndex','slowPosition'),p,
    middleHits.filter(hit=>hit.refined).map(hit=>hit.position[2]),
  ):[],[showIntermediateSurface,slowArcs,middleHits,p])
  const backwardArc=useMemo(()=>showMiddleFibre?middleBackwardArc(middleHits[0],p):[],[showMiddleFibre,middleHits,p])
  const clipAtMiddle=backwardArc.length>1?middleHits[0]:null
  const drawnSlowArcs=clipAtMiddle?cutWaveArcs(slowArcs,clipAtMiddle.slowIndex,
    clipAtMiddle.slowSampleIndex,clipAtMiddle.slowPosition):slowArcs
  const fastMiddle=(showMiddlePoint||showMiddleFibre)?middleHits[0]:null
  const reflectedShocks=fullReflectedArcs.filter(arc=>arc.kind==='local-shock').map(arc=>{
    if(!fastMiddle||reflectedArcs[fastMiddle.fastIndex]?.kind!=='local-shock')return arc
    const [tau,Y,zc]=fastMiddle.position
    const start=arc.points[0].zc,end=arc.points.at(-1).zc
    const direction=Math.sign(end-start)
    if(direction*(zc-start)<=0||direction*(end-zc)<0)return arc
    return {...arc,points:[...arc.points.filter(q=>direction*(zc-q.zc)>0),{tau,Y,zc}]}
  })
  const remainingReflectedArcs=clipAtMiddle?
    cutWaveArcs(reflectedArcs.map(arc=>arc.points),clipAtMiddle.fastIndex,clipAtMiddle.fastSampleIndex,clipAtMiddle.position)
      .map((points,index)=>({...reflectedArcs[index],points})):fullReflectedArcs
  const drawnReflectedArcs=[...reflectedShocks,...remainingReflectedArcs.filter(arc=>arc.kind!=='local-shock')]
  const compositeForwardArc=useMemo(()=>slowCompositeForwardArc(middleHits[0],p),[middleHits,p])
  const retainedSeededCurves=clipAtMiddle?[
    ...seededCurves.filter(curve=>!slowWaveCurves.includes(curve)),
    ...drawnSlowArcs.slice(forwardShockArcs.length).map((points,index)=>({...slowWaveCurves[index],points})),
  ]:seededCurves
  const rarefactionCut=showCompositeForwardArc&&compositeForwardArc.length>1?compositeForwardArc.at(-1):null
  const slowRarefaction=retainedSeededCurves.find(curve=>curve.family==='slow'&&!curve.kind)
  const cutIndex=rarefactionCut&&slowRarefaction?slowRarefaction.points.findIndex((point,index)=>
    index>0&&(slowRarefaction.points[index-1].zc-rarefactionCut[2])*(point.zc-rarefactionCut[2])<=0):-1
  const drawnSeededCurves=cutIndex<0?retainedSeededCurves:retainedSeededCurves.flatMap(curve=>{
    const [tau,Y,zc]=rarefactionCut
    const endpoint=slowRarefaction.points.at(-1)
    const cutsBeforeInflection=cutIndex<slowRarefaction.points.length-1||Math.abs(zc-endpoint.zc)>1e-8
    if(curve.family==='slow'&&curve.kind==='composite'&&cutsBeforeInflection)return []
    if(curve!==slowRarefaction)return [curve]
    return [{...curve,points:[...curve.points.slice(0,cutIndex),{tau,Y,zc}]}]
  })

  const fastEndpoints=fastArcs.flatMap(({kind,points,junction})=>{
    if(kind==='local-shock'&&junction){
      return [
        ...(showFastMinus?[{...junction,tex:'Q^-'}]:[]),
        ...(showReflectedMinus?[{...junction,Y:-junction.Y,tex:'(Q^-)^\\dagger'}]:[]),
      ]
    }
    if(kind==='nonlocal-shock')return [
      ...(showFastPlus?[{...points[0],tex:'Q^+'}]:[]),
      ...(showReflectedPlus?[{...points[0],Y:-points[0].Y,tex:'(Q^+)^\\dagger'}]:[]),
    ]
    return []
  })
  const slowMiddlePosition=showSlowMiddlePoint?middleHits[0]?.slowPosition:null
  const ksDs=showKsDs?seededCurves.find(q=>q.kind==='composite')?.doubleSonicPoints??[]:[]
  const rarefactionJoin=showRarefactionJoin?compositeForwardArc.at(-1):null
  const finiteSingularities=useMemo(()=>showRarefaction?rarefactionSingularities(p,tauMin,tauMax):[],[showRarefaction,p,tauMin,tauMax])
  const hasInfinitySingularity=useMemo(()=>showInfinityMarkers&&infinityRarefactionSingularities(p).length>0,[showInfinityMarkers,p])
  const showFiniteSeparatrices=showFiniteStable||showFiniteUnstable
  const showInfinitySeparatrices=showInfinityStable||showInfinityUnstable
  const finiteData=useMemo(()=>showFiniteSeparatrices?finiteRarefactionSeparatrices(p,tauMin,tauMax):null,[showFiniteSeparatrices,p,tauMin,tauMax])
  const infinityBranches=useMemo(()=>showInfinitySeparatrices?infinityRarefactionSeparatrices(p,{tauMin,tauMax}):[],[showInfinitySeparatrices,p,tauMin,tauMax])
  const branchLabels=(branches,infinity,stable,unstable)=>branches.flatMap((branch,i)=>{
    if(!(branch.stable?stable:unstable)||branch.points.length<2||(infinity&&!branch.visibleInFiniteChart))return []
    const anchor=branch.points[Math.floor(branch.points.length*.5)]
    const subscript=infinity?'\\infty':`E_{${branch.singularityIndex+1}}`
    return [{...anchor,Y:infinity ? .062 : .043,id:`separatrix-${infinity}-${i}`,
      tex:`W^{${branch.stable?'s':'u'}}_{${subscript}}`,color:branch.stable?waveColors.rarefactionSlow:waveColors.rarefactionFast}]
  })
  const equilibriumMarkers=compositeEquilibria.map((q,i)=>({...q,zc:q.zc??2*Math.atan(q.z)/Math.PI,tex:q.tex??`E_{-,${i+1}}`,color:'#f5f7fb'}))
  const eventLocations=new Map()
  for(const q of compositeEvents){
    if(q.tau<tauMin||q.tau>tauMax||q.Y<YMin||q.Y>YMax)continue
    const key=[q.tau,q.Y,q.z].map(value=>value.toFixed(5)).join(',')
    if(!eventLocations.has(key))eventLocations.set(key,{...q,zc:2*Math.atan(q.z)/Math.PI})
  }
  const eventMarkers=[...eventLocations.values()].map((q,i)=>{
    const tangency=q.kind==='sonic-tangency',nearDS=q.kind==='near-double-sonic'
    return {...q,tex:`${tangency?'T':nearDS?'D':'C'}_{-,${i+1}}`,color:tangency?'#5eead4':nearDS?'#c084fc':'#fbbf24'}
  })
  const foldMarkers=compositeFolds.map((q,i)=>({...q,zc:2*Math.atan(q.z)/Math.PI,
    tex:`D_{-,${i+1}}`,color:'#67e8f9'}))
  const compositeMarkers=[...equilibriumMarkers,...eventMarkers.filter(q=>
    !compositeFolds.some(f=>Math.hypot(f.tau-q.tau,f.Y-q.Y,f.z-q.z)<1e-7)),...foldMarkers]
  const pointLabels=[
    ...compositeMarkers,
    ...compositeSeparatrices.flatMap(({segments,stable,atInfinity,side},i)=>{
      const segment=segments.reduce((longest,current)=>current.length>longest.length?current:longest,[])
      if(segment.length<2)return []
      const {x,y,z}=segment[Math.floor(segment.length/2)]
      return [{tau:x,Y:y,zc:z,id:`composite-separatrix-label-${i}`,
        tex:`W^{${stable?'s':'u'}}_{${side==='plus'?'+':'-'}${atInfinity?',\\infty':''}}`,
        color:stable?waveColors.rarefactionSlow:waveColors.rarefactionFast}]
    }),
    ...branchLabels(finiteData?.separatrices??[],false,showFiniteStable,showFiniteUnstable),
    ...branchLabels(infinityBranches,true,showInfinityStable,showInfinityUnstable),
    ...finiteSingularities.map((q,i)=>({...q,Y:0,tex:`E_{${i+1}}`,color:'#f5f7fb'})),
    ...(hasInfinitySingularity?[-1,1].map(sign=>({tau:0,Y:0,zc:sign*.998,tex:`E_\\infty^{${sign<0?'-':'+'}}`,color:'#f5f7fb',offsetX:8,offsetY:sign>0?3:-19,keepOffset:true})):[]),
    ...ksDs.map(q=>({...q,tex:String.raw`\mathcal K_s\cap\mathcal{DS}`,color:slowWaveArcColors.composite})),
    ...(rarefactionJoin?[{tau:rarefactionJoin[0],Y:rarefactionJoin[1],zc:rarefactionJoin[2],tex:"P_{r,K}",color:"#ffcf70",callout:true,offsetX:-46,offsetY:-64}]:[]),
    ...(slowMiddlePosition?[{tau:slowMiddlePosition[0],Y:slowMiddlePosition[1],zc:slowMiddlePosition[2],tex:"P_{M,s}",color:"#ffffff",callout:true,offsetX:-48,offsetY:18}]:[]),
    ...fastEndpoints.map(q=>({...q,color:'#45ef81'})),
    ...(showMiddlePoint?middleHits:[]).map(({position:[tau,Y,zc]},i)=>({tau,Y,zc,color:"#ffffff",tex:`P_{M${middleHits.length>1?","+String(i+1):""}}`})),
    ...(showForwardCharacteristicPoint?referenceMarkers.forward.filter(q=>q.branch==='slow').map(q=>({...q,tex:'P_s',color:'#ff9f0a',callout:true,offsetX:20,offsetY:-30})):[]),
    ...(showBackwardCharacteristicPoint?referenceMarkers.backward.filter(q=>q.branch==='fast').map(q=>({...q,tex:'P_f',color:'#30d158',callout:true,offsetX:20,offsetY:-30})):[]),
    ...junctionMarkers.filter(q=>q.label||q.index).map(q=>({...q,tex:q.label??`Q_{${q.index}}`,offsetY:q.label==='I_s'?8:-20})),
  ]
  const inspectIntersection=q=>{setPoint(q);onInspectPoint?.(q)}
  const inspectMarker=([tau,Y,zc])=>inspectIntersection({tau,Y,zc})
  return <>
    <PointScreenAnchors labels={pointLabels} axisScale={axisScale} onPositions={onPointLabelPositions}/>
    <color attach="background" args={['#0b1018']}/>
    <ambientLight intensity={.9}/>
    <hemisphereLight args={['#e4efff','#263445',.35]}/>
    <directionalLight position={[5,6,8]} intensity={1.0}/>
    <directionalLight position={[-4,-5,-6]} intensity={.35} color="#c4dcff"/>
    <group scale={[axisScale.tau,axisScale.Y,axisScale.zc]}>
    {intermediatePatches.map((positions,index)=>positions.length>0&&<mesh key={index} raycast={()=>null}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry>
      <meshBasicMaterial color="#31cbb8" side={DoubleSide} transparent opacity={surfaceOpacity} depthWrite={false}/>
    </mesh>)}
    {fastArcs.filter(({kind})=>visibleFastArcs[kind]).map(({kind,points},index)=>{
      const decreasing=kind==='rarefaction'
      const arrow=waveArcArrow(points,!decreasing,axisScale)
      const color=reflectedFastArcColors[kind]
      return <group key={index}>
        <Line points={points.map(q=>[q.tau,q.Y??0,q.zc])} color={color} lineWidth={3.5} depthTest={false} renderOrder={52}/>
        {arrow&&<ArrowOnCurve points={points} p={p} color={color} axisScale={axisScale} {...arrow} directionSign={decreasing?-1:1}/>}
      </group>
    })}
    {showReflectedFastWave&&drawnReflectedArcs.filter(({kind})=>!hiddenReflectedArcs[kind]).map(({kind,points},index)=>{
      const decreasing=kind==='rarefaction'
      const arrow=waveArcArrow(points,!decreasing,axisScale)
      const color=reflectedFastArcColors[kind]
      const linePoints=points.map(q=>[q.tau,q.Y,q.zc])
      return <group key={index}>
        <DashDotLine points={linePoints} color={color} lineWidth={3.5} renderOrder={52}/>
        {arrow&&<ArrowOnCurve points={points} p={p} color={color} axisScale={axisScale} {...arrow} directionSign={decreasing?-1:1}/>}
      </group>
    })}
    {fastEndpoints.map((q,index)=><group key={index} position={[q.tau,q.Y,q.zc]} scale={[1/axisScale.tau,1/axisScale.Y,1/axisScale.zc]}>
      <ScientificPoint3D radius={.033} color="#45ef81" emissiveIntensity={.3} onSelect={()=>inspectIntersection(q)}/>
    </group>)}
    {showMiddlePoint&&middleHits.map(({position},i)=><group key={i} position={position} scale={[1/axisScale.tau,1/axisScale.Y,1/axisScale.zc]}>
      <ScientificPoint3D radius={.043} color="#ffffff" emissiveIntensity={.25} onSelect={()=>inspectMarker(position)}/>
    </group>)}
    {slowMiddlePosition&&<group position={slowMiddlePosition} scale={[1/axisScale.tau,1/axisScale.Y,1/axisScale.zc]}>
      <ScientificPoint3D radius={.043} color="#ffffff" emissiveIntensity={.25} onSelect={()=>inspectMarker(slowMiddlePosition)}/>
    </group>}
    {ksDs.map(q=><group key={q.zc} position={[q.tau,q.Y,q.zc]} scale={[1/axisScale.tau,1/axisScale.Y,1/axisScale.zc]}>
      <ScientificPoint3D radius={.032} color={slowWaveArcColors.composite} onSelect={()=>inspectMarker([q.tau,q.Y,q.zc])}/>
    </group>)}
    {rarefactionJoin&&<group position={rarefactionJoin} scale={[1/axisScale.tau,1/axisScale.Y,1/axisScale.zc]}>
      <ScientificPoint3D radius={.038} color="#ffcf70" emissiveIntensity={.3} onSelect={()=>inspectMarker(rarefactionJoin)}/>
    </group>}
    {showCompositeForwardArc&&compositeForwardArc.length>1&&<DashDotLine points={compositeForwardArc} color="#ffcf70" lineWidth={4} renderOrder={53} dotCount={2}/>}
    {backwardArc.length>1&&<Line points={backwardArc} color="#ffffff" dashed dashSize={.10} gapSize={.065} lineWidth={2.3} depthTest={false} renderOrder={7}/>}
    <CharacteristicSurface sharedLoci={sharedLoci} {...{tauMin,tauMax,p,point,setPoint}} showSlow={showCharacteristicSlow&&(surfaceIsolation==='all'||surfaceIsolation==='characteristic')} showFast={showCharacteristicFast&&(surfaceIsolation==='all'||surfaceIsolation==='characteristic')} showCoincidence={showCoincidence} surfaceOpacity={surfaceOpacity} onInspectPoint={onInspectPoint}/>
    <StateFibres U={fixedState} p={p} showMinus={showMinusStateFibre} showPlus={showPlusStateFibre}/><StateFibres U={riemannStates?.left} p={p} showMinus={showLeftRiemannFibre} showPlus={false} colorOverride="#ff9f0a"/><StateFibres U={riemannStates?.right} p={p} showMinus={false} showPlus={showRightRiemannFibre} colorOverride="#30d158"/>
    <CharacteristicHugoniotPoints onChangeRiemannState={onChangeRiemannState} states={riemannStates} p={p} axisScale={axisScale} showForward={showForwardCharacteristicPoint} showBackward={showBackwardCharacteristicPoint} showForwardFast={showForwardFastCharacteristicPoint} showBackwardSlow={showBackwardSlowCharacteristicPoint} onSelect={inspectIntersection}/>
    {drawnSeededCurves.filter(q=>q.kind==='composite'?showSeededKs:q.kind==='nonlocal'&&showNonlocalShock).filter(q=>q.points.length>1).map((curve,i)=>{
      const color=curve.kind==='nonlocal'?slowWaveArcColors.nonlocalShock:slowWaveArcColors.composite
      const arrow=waveArcArrow(curve.points,false,axisScale)
      return <group key={`ks-${i}`}><Line contrast points={curve.points.map(q=>[q.tau,q.Y,q.zc])} color={color} lineWidth={2.5} depthTest={false} renderOrder={48}/>{arrow&&<ArrowOnCurve points={curve.points} p={p} color={color} axisScale={axisScale} {...arrow}/>}</group>
    })}
    {showForwardShockArc&&drawnSlowArcs.slice(0,forwardShockArcs.length).map(points=>{const arrow=forwardShockArcs[0]?.at(-1)?.selectedShockEndpoint?null:waveArcArrow(points,false,axisScale);return <group key={points[1].zc}><Line contrast points={points.map(q=>[q.tau,q.Y,q.zc])} color={slowWaveArcColors.localShock} lineWidth={4} depthTest={false} renderOrder={49}/>{arrow&&<ArrowOnCurve points={points} p={p} color={slowWaveArcColors.localShock} axisScale={axisScale} {...arrow}/>}</group>})}
    {junctionMarkers.map((q,i)=><group renderOrder={61} key={`wave-junction-${i}`} position={[q.tau,q.Y,q.zc]} scale={[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>1/Math.max(Math.abs(v||1),1e-8))}><ScientificPoint3D radius={.03} color={q.color} emissiveIntensity={.3} onSelect={()=>inspectIntersection(q)}/></group>)}
    <SeededRarefactions axisScale={axisScale} curves={drawnSeededCurves} p={p} showFull={showFullPsRarefaction} showLeft={showLeftSeededRarefaction} showRight={showRightSeededRarefaction}/>
    <RarefactionField {...{p,tauMin,tauMax,axisScale}} visible={showRareCurves}/>
    {compositeMarkers.map(q=><group key={q.tex} position={[q.tau,q.Y,q.zc]} scale={[1/axisScale.tau,1/axisScale.Y,1/axisScale.zc]}>
      <ScientificPoint3D radius={.026} color={q.color} onSelect={()=>inspectMarker([q.tau,q.Y,q.zc])}/>
    </group>)}
    {compositeSeparatrices.flatMap(({segments,stable},i)=>segments.filter(segment=>segment.length>1).map((segment,j)=>
      <Line key={`composite-separatrix-${i}-${j}`} points={segment.map(({x,y,z})=>[x,y,z])}
        color={stable?waveColors.rarefactionSlow:waveColors.rarefactionFast}
        lineWidth={3.2} depthTest={false} renderOrder={18}/>
    ))}
    <CompositeFields {...{p,axisScale,tauMin,tauMax,YMin,YMax,showKMinusArrows}} geometry={compositeGeometry} showMinus={showKMinus} showPlus={showKPlus}/>
    <RarefactionSingularities data={finiteData} singularities={finiteSingularities} {...{p,tauMin,tauMax,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale}} visible={showRarefaction||showFiniteStable||showFiniteUnstable} showMarkers={showRarefaction} showStable={showFiniteStable} showUnstable={showFiniteUnstable}/>
    <InfinityRarefactionSingularity separatrices={infinityBranches} {...{p,tauMin,tauMax,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale}} visible={showInfinityMarkers||showInfinityStable||showInfinityUnstable} showMarkers={showInfinityMarkers} showStable={showInfinityStable} showUnstable={showInfinityUnstable}/>
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

export default function Scene({middleCandidate,compositeSeparatrices=[],compositeEquilibria=[],compositeFolds=[],compositeEvents=[],showKMinusArrows=false,showInfinityMarkers=false,showFastMinus=false,showFastPlus=false,visibleFastArcs={},showKsDs=false,showCurveArrows=false,showRarefactionJoin=true,showCompositeForwardArc=true,showMiddlePoint=true,showSlowMiddlePoint=true,showMiddleFibre=true,hiddenReflectedArcs={},showReflectedMinus=false,showReflectedPlus=false,showReflectedFastWave=false,showIntermediateSurface=false,showForwardShockArc=true,seededCurvesData=null,sharedLoci=[],tauMin,tauMax,YMin=-2,YMax=2,p,point,setPoint,compositeGeometry={minus:[],plus:[]},fixedState=null,riemannStates=null,onChangeRiemannState,showFastInflectionJunction,showBackwardMinusJunction,showInflectionJunction,forwardPlusReport,forwardPlusPointVisibility,forwardSonicReport,forwardSonicPointVisibility,showNonlocalShock,showSeededKs=true,showFullPsRarefaction=true,showLeftSeededRarefaction=true,showRightSeededRarefaction=true,showForwardCharacteristicPoint=true,showBackwardCharacteristicPoint=true,showForwardFastCharacteristicPoint=false,showBackwardSlowCharacteristicPoint=false,showLeftRiemannFibre=true,showRightRiemannFibre=true,showMinusStateFibre=true,showPlusStateFibre=true,showSMinus=true,showSPlus=true,sonicMeshMode='original',btCurveMode='continuation',sonicRenderMode='transparent',showDS=true,showJ=true,showKMinus=false,showKPlus=false,showRarefaction=true,showRareCurves=true,showCharacteristicSlow=true,showCharacteristicFast=true,showCoincidence=true,showFiniteStable=true,showFiniteUnstable=true,showInfinityStable=true,showInfinityUnstable=true,showBTMinus=true,showBTPlus=true,showHopfMinus=true,showHopfPlus=true,selectedSingularity=null,setSelectedSingularity,onSelectCurve,liftedInspection=null,axisScale={tau:1,Y:1,zc:1}}){
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
  const [inspectedSonic,setInspectedSonic]=useState(null)
  const fiberInspection=useMemo(()=>showFiberInspection
    ? exceptionalFiberLimit(inspectInfinity ? Infinity : projectiveZ(point.zc),p)
    : null,[showFiberInspection,inspectInfinity,point.zc,p])
  const exceptional=useMemo(()=>showFiberInspection?exceptionalDirections(p):null,[showFiberInspection,p])
  const onSelectExceptional=marker=>{setSelectedExceptional(marker);setShowFiberInspection(true);setInspectInfinity(Boolean(marker.infinity));setPoint(current=>({...current,zc:marker.zc,Y:0}))}
  const seededCurves=useMemo(()=>seededCurvesData??seededRarefactionCurves(riemannStates,p,tauMin,tauMax),[seededCurvesData,riemannStates,p,tauMin,tauMax])
  const intersectionCounts=useMemo(()=>selectedHugoniotCharacteristicMarkers(riemannStates,p,{includeForwardFast:true,includeBackwardSlow:true}),[riemannStates,p])
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
    <Canvas dpr={[1,1.5]} gl={{powerPreference:'high-performance',antialias:true,alpha:false}} camera={{position:[3,3,3],fov:45}}><CurveArrowVisibility.Provider value={showCurveArrows}><SceneContent middleCandidate={middleCandidate} {...{compositeSeparatrices,compositeEquilibria,compositeFolds,compositeEvents}} showKMinusArrows={showKMinusArrows} showInfinityMarkers={showInfinityMarkers} showFastMinus={showFastMinus} showFastPlus={showFastPlus} visibleFastArcs={visibleFastArcs} showKsDs={showKsDs} showRarefactionJoin={showRarefactionJoin} showCompositeForwardArc={showCompositeForwardArc} showMiddlePoint={showMiddlePoint} showSlowMiddlePoint={showSlowMiddlePoint} showMiddleFibre={showMiddleFibre} hiddenReflectedArcs={hiddenReflectedArcs} showReflectedMinus={showReflectedMinus} showReflectedPlus={showReflectedPlus} showReflectedFastWave={showReflectedFastWave} showIntermediateSurface={showIntermediateSurface} showForwardShockArc={showForwardShockArc} seededCurves={seededCurves} sharedLoci={sharedLoci} {...{tauMin,tauMax,p,point,setPoint,cameraRef,compositeGeometry,fixedState,riemannStates,onChangeRiemannState,showFastInflectionJunction,showBackwardMinusJunction,showInflectionJunction,forwardPlusReport,forwardPlusPointVisibility,forwardSonicReport,forwardSonicPointVisibility,showNonlocalShock,showSeededKs,showFullPsRarefaction,showLeftSeededRarefaction,showRightSeededRarefaction,showForwardCharacteristicPoint,showBackwardCharacteristicPoint,showForwardFastCharacteristicPoint,showBackwardSlowCharacteristicPoint,showLeftRiemannFibre,showRightRiemannFibre,showMinusStateFibre,showPlusStateFibre,showSMinus,showSPlus,showDS,showJ,showKMinus,showKPlus,showRarefaction,showRareCurves,showCharacteristicSlow,showCharacteristicFast,showCoincidence,showFiniteStable,showFiniteUnstable,showInfinityStable,showInfinityUnstable,selectedSingularity,setSelectedSingularity,onSelectCurve,YMin,YMax,axisScale,sonicMeshMode,btCurveMode,sonicRenderMode,surfaceOpacity,surfaceIsolation,showBTMinus,showBTPlus,showHopfMinus,showHopfPlus,onSelectExceptional,selectedExceptional:showFiberInspection?selectedExceptional:null,onInspectPoint:()=>setInspectedSonic(null),onInspectSonic:selected=>{setInspectedSonic(selected)},liftedInspection,onAxisPositions:setAxisScreenPositions,onPointLabelPositions:setPointLabelPositions}}/></CurveArrowVisibility.Provider></Canvas>
    <svg aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:31}}>
      {pointLabelPositions.filter(label=>label.callout).map(label=><line key={label.id} x1={label.anchorX} y1={label.anchorY} x2={label.x+9} y2={label.y+10} stroke={label.color} strokeOpacity=".75"/>)}
    </svg>
    {pointLabelPositions.map(label=><div key={label.id} aria-label={`Etiqueta ${label.tex}`} style={{position:'absolute',left:label.x,top:label.y,pointerEvents:'none',zIndex:32,color:label.color,fontSize:13,whiteSpace:'nowrap',textShadow:'-1px 0 #0b1018, 1px 0 #0b1018, 0 -1px #0b1018, 0 1px #0b1018, 0 1px 3px #0b1018'}}><MathLabel>{label.tex}</MathLabel></div>)}
    {axisScreenPositions&&[
      {id:'tau',tex:String.raw`\tau`,name:'Eixo tau'},
      {id:'Y',tex:String.raw`Y`,name:'Eixo Y'},
      {id:'zcPlus',tex:String.raw`z_c=+1`,name:'Eixo z positivo'},
      {id:'zcMinus',tex:String.raw`z_c=-1`,name:'Eixo z negativo'},
    ].map(label=>axisScreenPositions[label.id]&&<div key={label.id} aria-label={label.name}
      style={{position:'absolute',left:axisScreenPositions[label.id].x,top:axisScreenPositions[label.id].y,
        transform:label.id==='zcPlus'?'translate(-50%,-130%)':label.id==='zcMinus'?'translate(-50%,30%)':'translate(-50%,-50%)',pointerEvents:'none',zIndex:30,color:'#ffffff',
        fontSize:14,fontWeight:600,whiteSpace:'nowrap'}}>
      <MathLabel>{label.tex}</MathLabel>
    </div>)}
    {liftedInspection?.point&&<div className="liftedSampleStatus" role="status">Amostra levantada em 3D · τ={liftedInspection.point.tau.toPrecision(5)} · Y={liftedInspection.point.Y.toPrecision(5)} · z_c={liftedInspection.point.zc.toPrecision(5)} <button type="button" onClick={()=>cameraRef.current?.focus([liftedInspection.point.tau*axisScale.tau,liftedInspection.point.Y*axisScale.Y,liftedInspection.point.zc*axisScale.zc])}>Centralizar amostra</button></div>}
    <WorkspaceToolbar label="ferramentas 3D"><div className="workspaceToolbarActions" role="toolbar" aria-label="Ferramentas de navegação 3D">
      <div className="workspaceToolbarGroup" role="group" aria-label="Câmera">
      <button type="button" title="Afastar" aria-label="Afastar" onClick={()=>cameraRef.current?.zoom(1.18)}>−</button><button type="button" title="Aproximar" aria-label="Aproximar" onClick={()=>cameraRef.current?.zoom(0.84)}>+</button>
      <button type="button" onClick={()=>cameraRef.current?.front()}>Frente</button><button type="button" onClick={()=>cameraRef.current?.side()}>Direita</button><button type="button" onClick={()=>cameraRef.current?.top()}>Topo</button><button type="button" onClick={()=>cameraRef.current?.reset()}>Restaurar</button><details className="cameraMoreViews"><summary title="Outras vistas">Vistas</summary><div className="cameraMoreMenu"><button type="button" onClick={()=>cameraRef.current?.back()}>Trás</button><button type="button" onClick={()=>cameraRef.current?.left()}>Esquerda</button><button type="button" onClick={()=>cameraRef.current?.bottom()}>Inferior</button></div></details></div>
      <div className="workspaceToolbarGroup" role="group" aria-label="Superfícies">
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
      <label className="surfaceOpacityControl" title="Ajusta a opacidade das superfícies, sem alterar curvas ou equações">Opacidade <input type="range" min="0" max="1" step="0.01" value={surfaceOpacity} onChange={e=>setSurfaceOpacity(Number(e.target.value))} aria-label="Opacidade das superfícies"/><output>{Math.round(surfaceOpacity*100)}%</output></label></div>
      <button type="button" aria-pressed={showFiberInspection} onClick={()=>setShowFiberInspection(value=>!value)}>Fibra projetiva</button>
    </div></WorkspaceToolbar>
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
