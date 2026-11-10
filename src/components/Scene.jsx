import {zoomPositionAroundTarget} from './scene/cameraZoom.js'
import PointScreenAnchors from './PointScreenAnchors.jsx'
import {rightWaveJunctions} from '../geometry/state/rightWaveJunctions.js'
import DraggableInspection from './DraggableInspection.jsx'
import {seededRarefactionCurves} from '../geometry/state/seededRarefactionCurves.js'
import ScientificLegend from './ScientificLegend.jsx'
import {MathLabel} from './math/MathLabel.jsx'
import WorkspaceToolbar from './WorkspaceToolbar.jsx'
import ScientificPoint3D from './ScientificPoint3D.jsx'
import {characteristicSpectrum} from '../math/characteristic/spectrum.js'
import {exceptionalFiberLimit} from '../math/characteristic/fiberLimits.js'
import {exceptionalDirections} from '../math/characteristic/exceptionalDirections.js'
import {zFromZc as projectiveZ} from '../math/charts/zChart.js'
import {inspectSonicPoint} from '../math/sonic/pointInspection.js'
import {Canvas, useThree} from '@react-three/fiber'
import {OrbitControls} from '@react-three/drei'
import {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react'
import {selectedHugoniotCharacteristicMarkers} from '../geometry/state/fibreCharacteristicMarkers.js'
import {Line} from './scene/shared.jsx'
import {StateFibres, CharacteristicHugoniotPoints, CompositeFields} from './scene/StateOverlays.jsx'
import {SonicSpecialLoci} from './scene/SpecialLoci.jsx'
import {HopfSurfaces} from './scene/HopfSurfaces.jsx'
import {SonicSurfaces} from './scene/SonicSurfaces.jsx'
import {SeededRarefactions, RarefactionField, RarefactionSingularities, ArrowOnCurve, InfinityRarefactionSingularity} from './scene/Rarefaction.jsx'
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
