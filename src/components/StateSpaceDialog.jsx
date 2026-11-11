import SceneVisibilityRow from './SceneVisibilityRow.jsx'
import {locusPresentation,projectedBtLoci,stateInflectionProjection} from '../geometry/sharedProjectedLoci.js'
import {stateRarefactionGeometry} from '../geometry/state/stateRarefactionGeometry.js'
import {stateShockBranches} from '../math/solution/stateShockBranches.js'
import {stateShockGeometry} from '../geometry/state/stateShockGeometry.js'
import {stateConstructionSearch} from '../math/solution/stateConstructionSearch.js'
import {candidateStateGeometry} from '../geometry/state/candidateStateGeometry.js'
import {classifyWaveChain} from '../math/solution/waveChainClassification.js'
import {assessWaveChain} from '../math/solution/waveChainAssessment.js'
import StateChainInspection, {StateConstructionReports,chainSegmentColorKeys,chainSegmentColors,sonicJunctionLabel} from './StateChainInspection.jsx'
import {StatePointVisibility, StateHugoniotVisibility} from './SharedStateVisibility.jsx'
import ScientificLegend from './ScientificLegend.jsx'
import {fastHugoniotPreviewPath} from '../math/state/fastHugoniotPreview.js'
import VisibilityEye from './VisibilityEye.jsx'
import WorkspaceToolbar from './WorkspaceToolbar.jsx'
import WorkspaceLayout from './WorkspaceLayout.jsx'
import {MathLabel} from './math/MathLabel.jsx'
import WorkspaceRail from './WorkspaceRail.jsx'
import WorkspaceDrawer from './WorkspaceDrawer.jsx'
import WorkspacePanelHeader from './WorkspacePanelHeader.jsx'
import {zoomWindow, panWindow} from '../math/state/viewportNavigation.js'
import {chooseStateLabelPosition} from '../math/state/labelPlacement.js'
import {liftHugoniotSample} from '../math/state/hugoniotWaveLift.js'
import {nearestProjectedSample, projectedHugoniotEndpoints} from '../math/state/projectedCurveSamples.js'
import {projectedCurveHits, nextProjectedCurveHit} from '../math/state/projectedCurvePicking.js'
import ScientificStateMarker from './ScientificStateMarker.jsx'
import ScientificPointMarker from './ScientificPointMarker.jsx'
import {STATE_MARKER_SIZE_2D} from '../config/scientificMarkerRules.js'
import {scientificCurveStyle, scientificLocusKind} from '../config/scientificCurveRules.js'
import {implicitTwoShockMiddleSensitivity} from '../math/solution/riemannImplicitMiddleSensitivity.js'
import {mixedMiddleReconstructionSensitivity} from '../math/solution/riemannMixedMiddleSensitivity.js'
import {compareHugoniotSensitivity, compareHugoniotCoordinateSensitivity} from '../math/solution/riemannSensitivityComparison.js'
import RiemannSensitivityPlot from './RiemannSensitivityPlot.jsx'
import {selectedCandidateHugoniotArc} from '../math/solution/riemannBranchHighlight.js'
import RarefactionSearchReport from './RarefactionSearchReport.jsx'
import {useEffect, useEffectEvent, useMemo, useRef, useState} from 'react'
import {useWorkspacePreference} from '../hooks/useWorkspacePreference.js'
import {constructionRarefactionBranches} from '../math/solution/stateConstructionSampling.js'
import {genuineNonlinearityEvents} from '../math/rarefaction/genuineNonlinearity.js'
import {refineGenuineNonlinearityEvents} from '../math/rarefaction/refineGenuineNonlinearity.js'
import {annotateGenuineNonlinearityContact} from '../math/rarefaction/sonicContactDiagnostic.js'
import {directShockDiagnostic} from '../math/solution/directShockDiagnostic.js'
import {finiteSonicContacts} from '../math/solution/finiteSonicContact.js'
import {refineFiniteSonicContacts} from '../math/solution/refineFiniteSonicContact.js'
import {sonicRarefactionConnections} from '../math/solution/sonicRarefactionConnections.js'
import {classifyCompositeLiu} from '../math/solution/compositeLiuSelection.js'
import {classifyCompositeEvidence} from '../math/solution/compositeEvidence.js'
import {traceSeededBackwardHugoniot} from '../math/solution/seededBackwardHugoniot.js'
import {seededLiuAtBackwardContact} from '../math/solution/backwardLiu.js'
import {sampledLiuAtForwardContact, seededLiuAtForwardContact} from '../math/solution/orientedLiuArc.js'
import {riemannBoundaryRegularity} from '../math/manifold/riemannBoundaryRegularity.js'
import {sampleDiscriminantRegions} from '../math/characteristic/discriminantRegions.js'
import {auditCoincidenceProjection} from '../math/characteristic/coincidenceProjectionAudit.js'
import {auditCoincidenceCoverage} from '../math/characteristic/coincidenceCoverageAudit.js'
import {auditCoincidenceDegeneracies} from '../math/characteristic/coincidenceDegenerateAudit.js'
import {auditCoincidenceLifts} from '../math/characteristic/coincidenceLiftAudit.js'
import {auditCoincidenceIncidence} from '../math/characteristic/coincidenceIncidenceAudit.js'
import {stateSpaceProjection} from '../math/state/projections.js'
import {rarefactionPortrait,rarefactionStateLayers} from '../geometry/state/rarefactionPortrait.js'
import {clipStatePolyline, stateSpaceGeometry} from '../geometry/state/stateSpace.js'
import {stateFibreGeometry} from '../geometry/state/fibreGeometry.js'
import {hugoniotLaxGeometry} from '../geometry/state/hugoniotLaxGeometry.js'
import {projectHugoniotLaxGeometryToState} from '../geometry/state/hugoniotStateProjection.js'
import {shockStopLabel, W, H, P, sx, sy, pathData, axisTicks, axisLabel, finiteNumber, validWindow, fittedWindow} from '../geometry/state/stateSpaceView.js'
import {StateMathAnnotation} from './StateMathAnnotation.jsx'

const rarefactionLayers = [
  {id:'finitePoints', label:'Singularidades finitas', tex:'E_i', color:'#fff', point:true},
  {id:'infinityPoints', label:'Singularidades no infinito', tex:String.raw`E_\infty`, color:'#fff', point:true},
  {id:'finiteStable', label:'Separatrizes estáveis finitas', tex:'W^s', color:'#5eead4'},
  {id:'finiteUnstable', label:'Separatrizes instáveis finitas', tex:'W^u', color:'#f87171'},
  {id:'infinityStable', label:'Separatrizes estáveis no infinito', tex:String.raw`W^s_\infty`, color:'#5eead4'},
  {id:'infinityUnstable', label:'Separatrizes instáveis no infinito', tex:String.raw`W^u_\infty`, color:'#f87171'},
]

function chainArrowTransform(points, view, obstacles) {
  const screen = points.map(([u,v])=>[sx({u,v},view),sy({u,v},view)])
  const lengths=screen.slice(1).map(([x,y],i)=>Math.hypot(x-screen[i][0],y-screen[i][1]))
  const totalLength=lengths.reduce((sum,length)=>sum+length,0)
  if(totalLength<10)return null
  const preferredDistance=Math.min(16,totalLength/2)
  let distanceFromEnd=0
  let best=null
  for(let i=screen.length-1;i>0;i--){
    const [x,y]=screen[i]
    const [previousX,previousY]=screen[i-1]
    const dx=x-previousX, dy=y-previousY
    const length=lengths[i-1]
    if(!length)continue
    const start=Math.max(5,distanceFromEnd)
    const end=Math.min(totalLength-5,distanceFromEnd+length)
    if(start<=end){
      const steps=Math.max(1,Math.ceil((end-start)/5))
      const closest=Math.max(start,Math.min(end,preferredDistance))
      const samples=[closest,...Array.from({length:steps+1},(_,j)=>start+(end-start)*j/steps)]
      for(const distance of samples){
        const error=Math.abs(distance-preferredDistance)
        if(best&&error>=best.error)continue
        const fraction=(distance-distanceFromEnd)/length
        const px=x-dx*fraction,py=y-dy*fraction
        if(px<P+5||px>W-P-5||py<P+5||py>H-P-5)continue
        if(obstacles.some(({left,right,top,bottom})=>
          px+5>=left&&px-5<=right&&py+5>=top&&py-5<=bottom))continue
        best={px,py,error,angle:Math.atan2(dy,dx)*180/Math.PI}
      }
    }
    distanceFromEnd+=length
  }
  return best?`translate(${best.px} ${best.py}) rotate(${best.angle})`:null
}

function placeGraphLabels(layers, integralCurves, view) {
  const width=34, height=22
  const points=layers.filter(layer=>layer.point).flatMap(layer=>layer.data)
  const occupied=points.map(q=>[sx(q,view)-7,sy(q,view)-7,14,14])
  const overlaps=(x,y)=>occupied.some(([a,b,w,h])=>x<a+w+3&&x+width+3>a&&y<b+h+3&&y+height+3>b)
  const segments=[...integralCurves.map(curve=>curve.points),...layers.filter(layer=>!layer.point).flatMap(layer=>layer.data)]
    .flatMap(points=>{
      const screen=points.map(q=>[sx(q,view),sy(q,view)])
      return screen.slice(1).map(([x,y],i)=>[screen[i][0],screen[i][1],x,y])
    })
  const crossesCurve=(x,y)=>segments.some(([a,b,c,d])=>{
    const left=x+7, right=x+width-7, top=y+3, bottom=y+height-4
    let start=0,end=1
    for(const [origin,delta,min,max] of [[a,c-a,left,right],[b,d-b,top,bottom]]){
      if(delta===0){
        if(origin<min||origin>max)return false
        continue
      }
      const t0=(min-origin)/delta,t1=(max-origin)/delta
      start=Math.max(start,Math.min(t0,t1))
      end=Math.min(end,Math.max(t0,t1))
      if(start>end)return false
    }
    return true
  })
  const offsets=[[11,-24],[11,3],[-width-11,-24],[-width-11,3],[-width/2,11],[-width/2,-height-11]]
  const labels=[]
  for(const layer of [...layers].sort((a,b)=>Number(Boolean(b.point))-Number(Boolean(a.point)))){
    let fallback=null
    for(const [index,item] of layer.data.entries()){
      const anchors=layer.point?[item]:[.5,.35,.65,.2,.8].map(t=>item[Math.round(t*(item.length-1))])
      const positions=anchors.flatMap(q=>offsets.map(([dx,dy])=>[sx(q,view)+dx,sy(q,view)+dy]))
      const available=positions.filter(([x,y])=>x>=P&&x+width<=W-P&&y>=P&&y+height<=H-P&&!overlaps(x,y))
      const clean=available.find(([x,y])=>!crossesCurve(x,y))
      const position=clean??available[0]
      if(!position)continue
      const [x,y]=position
      const label={key:`${layer.id}:${index}`,x,y,width,height,color:layer.color,name:layer.name,backdrop:!clean,
        tex:layer.id==='finitePoints'?`E_{${item.singularityIndex+1}}`:layer.tex}
      if(!clean&&!layer.point){
        fallback??=label
        continue
      }
      occupied.push([x,y,width,height])
      labels.push(label)
      if(!layer.point){fallback=null;break}
    }
    if(fallback){
      occupied.push([fallback.x,fallback.y,width,height])
      labels.push(fallback)
    }
  }
  return labels
}

export default function StateSpaceDialog({exploreWaveBranches=false,onChangeExploreWaveBranches,chainExample=null,constructionRevision=0,constructionRequested=true,onBuildCandidates,showJ=false,sharedLoci=[],locusVisibility={},locusWindow,btCurveMode,sonicMeshMode,open,onClose,inline=false,state,p,tauMin,tauMax,fixedState=null,onSelectState,onClearState,riemannStates,onChangeRiemannState,onProfileCandidates,selectedCandidateIndex=-1,onSelectCandidate,projectionRequest=null,onInspectFibres3D,onInspectWavePoint3D,pointVisibility={left:true,right:true,fixed:true,middle:true},onTogglePointVisibility,showLeftRiemannHugoniot=true,setShowLeftRiemannHugoniot,showRightRiemannHugoniot=true,setShowRightRiemannHugoniot,showMinusStateFibre=true,setShowMinusStateFibre,showPlusStateFibre=true,setShowPlusStateFibre}){
  useEffect(()=>{if(!open||inline)return undefined;const key=e=>{if(e.key==='Escape'&&!e.defaultPrevented)onClose()};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[open,onClose,inline])
  const [showRarefactionField,setShowRarefactionField]=useWorkspacePreference('states.showRarefactionField', false)
  const data=useMemo(()=>{
    const projection=stateSpaceProjection(state)
    const curves=showRarefactionField?rarefactionPortrait(p,tauMin,tauMax,{clipTau:false}).map((curve,id)=>({...curve,id})):[]
    // U* deliberately does not define the viewport. The viewport is fitted to the scientific geometry.
    const anchors=[riemannStates?.left,riemannStates?.right].filter(q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)).map(([u,v])=>({u,v}))
    return stateSpaceGeometry(projection,{curves,extraPoints:projection?[]:anchors.length?anchors:[{u:-1,v:-1},{u:1,v:1}]})
  },[state,p,tauMin,tauMax,showRarefactionField,riemannStates])
  const hugoniot=useMemo(()=>{
    if(!fixedState)return {forward:[],backward:[]}
    const fibre=stateFibreGeometry(fixedState,p)
    return projectHugoniotLaxGeometryToState(hugoniotLaxGeometry(fibre,fixedState,p),p)
  },[fixedState,p])
  const riemannHugoniot=useMemo(()=>{
    const project=(U,side)=>{
      if(!U)return []
      const fibre=stateFibreGeometry(U,p)
      const projected=projectHugoniotLaxGeometryToState(hugoniotLaxGeometry(fibre,U,p),p)
      return side==='left'?projected.forward:projected.backward
    }
    return {left:project(riemannStates?.left,'left'),right:project(riemannStates?.right,'right')}
  },[riemannStates,p])
  if(!open)return null
  return <div className={inline?"inlineWorkspaceBackdrop":"localChartBackdrop"} onPointerDown={inline?undefined:onClose}><section className={inline?"localChartDialog inlineWorkspaceDialog":"localChartDialog"} onPointerDown={e=>e.stopPropagation()} aria-modal={inline?undefined:"true"} role="dialog" aria-label="Espaço de estados (u, v)">{!inline&&<header><h2 id="state-space-title">Espaço de estados (u, v)</h2><button onClick={onClose}>Fechar</button></header>}{!data?<div className="localChartBody"><p>O ponto atual não possui uma fibra regular para definir a janela do espaço de estados.</p></div>:<StatePlot tauMin={tauMin} tauMax={tauMax} showRarefactionField={showRarefactionField} setShowRarefactionField={setShowRarefactionField} exploreWaveBranches={exploreWaveBranches} onChangeExploreWaveBranches={onChangeExploreWaveBranches} chainExample={chainExample} constructionRevision={constructionRevision} constructionRequested={constructionRequested} onBuildCandidates={onBuildCandidates} showJ={showJ} sharedLoci={sharedLoci} locusVisibility={locusVisibility} locusWindow={locusWindow} btCurveMode={btCurveMode} sonicMeshMode={sonicMeshMode} geometry={data} hugoniot={hugoniot} riemannHugoniot={riemannHugoniot} fixedState={fixedState} onSelectState={onSelectState} onClearState={onClearState} riemannStates={riemannStates} onChangeRiemannState={onChangeRiemannState} onProfileCandidates={onProfileCandidates} selectedCandidateIndex={selectedCandidateIndex} onSelectCandidate={onSelectCandidate} projectionRequest={projectionRequest} onInspectFibres3D={onInspectFibres3D} onInspectWavePoint3D={onInspectWavePoint3D} pointVisibility={pointVisibility} onTogglePointVisibility={onTogglePointVisibility} showLeftRiemannHugoniot={showLeftRiemannHugoniot} setShowLeftRiemannHugoniot={setShowLeftRiemannHugoniot} showRightRiemannHugoniot={showRightRiemannHugoniot} setShowRightRiemannHugoniot={setShowRightRiemannHugoniot} showMinusStateFibre={showMinusStateFibre} setShowMinusStateFibre={setShowMinusStateFibre} showPlusStateFibre={showPlusStateFibre} setShowPlusStateFibre={setShowPlusStateFibre} p={p}/>}</section></div>
}

function StatePlot({tauMin,tauMax,showRarefactionField,setShowRarefactionField,exploreWaveBranches=false,onChangeExploreWaveBranches,chainExample=null,constructionRevision=0,constructionRequested=true,onBuildCandidates,showJ=false,sharedLoci=[],locusVisibility={},locusWindow,btCurveMode,sonicMeshMode,geometry:g,hugoniot,riemannHugoniot,fixedState,onSelectState,onClearState,riemannStates,onChangeRiemannState,onProfileCandidates,p,selectedCandidateIndex=-1,onSelectCandidate,projectionRequest=null,onInspectFibres3D,onInspectWavePoint3D,pointVisibility={left:true,right:true,fixed:true,middle:true},onTogglePointVisibility,showLeftRiemannHugoniot=true,setShowLeftRiemannHugoniot,showRightRiemannHugoniot=true,setShowRightRiemannHugoniot,showMinusStateFibre=true,setShowMinusStateFibre,showPlusStateFibre=true,setShowPlusStateFibre}){
  const stateRarefactions=useMemo(()=>constructionRarefactionBranches(riemannStates,p).map(branch=>annotateGenuineNonlinearityContact(refineGenuineNonlinearityEvents(genuineNonlinearityEvents(branch,p),p),p)),[riemannStates,p])
  const selectedRarefactions=useMemo(()=>stateRarefactionGeometry(riemannStates,stateRarefactions),[riemannStates,stateRarefactions])
  const directJump=useMemo(()=>directShockDiagnostic(riemannStates?.left,riemannStates?.right,p),[riemannStates,p])
  const shockBranches=useMemo(()=>stateShockBranches(riemannStates,p),[riemannStates,p])
  const shockCurves=useMemo(()=>stateShockGeometry(riemannStates,shockBranches,p),[riemannStates,shockBranches,p])
  const [showLeftStateShock,setShowLeftStateShock]=useWorkspacePreference('states.showLeftStateShock',true)
  const [showRightStateShock,setShowRightStateShock]=useWorkspacePreference('states.showRightStateShock',true)
  const construction=useMemo(()=>stateConstructionSearch(riemannStates,stateRarefactions,riemannHugoniot,p,constructionRequested,constructionRevision,shockBranches),[riemannStates,stateRarefactions,riemannHugoniot,p,constructionRequested,constructionRevision,shockBranches])
  const {shockCandidates,mixedCandidates,mixedLiuCandidates,profileCandidates,rarefactionSearch,rarefactionPairs,contactChains,compositeChains,allProfiles,reports}=construction
  useEffect(()=>{if(constructionRequested)onProfileCandidates?.(allProfiles)},[allProfiles,constructionRequested,onProfileCandidates])
  const activeProfile=allProfiles[selectedCandidateIndex]??null
  const activeStates=useMemo(()=>activeProfile?.kind==='two-shock'?activeProfile.states:activeProfile?[activeProfile.left,activeProfile.middle,activeProfile.right]:[],[activeProfile])
  const chainGeometry=useMemo(()=>candidateStateGeometry(activeProfile,p),[activeProfile,p])
  const candidateAssessments=useMemo(()=>allProfiles.map(candidate=>
    assessWaveChain(classifyWaveChain(candidate,p,candidate===activeProfile?chainGeometry:undefined))),
  [allProfiles,p,activeProfile,chainGeometry])
  const [showChain,setShowChain]=useWorkspacePreference('states.showChain',true)
  const [focusedChainSegment,setFocusedChainSegment]=useState(null)
  useEffect(()=>setFocusedChainSegment(null),[selectedCandidateIndex])
  const activeFan=chainGeometry.segments.filter(s=>s.type==='rarefaction').flatMap(s=>s.states)
  const characteristicIntersections=useMemo(()=>riemannBoundaryRegularity(riemannStates?.left,riemannStates?.right,p),[riemannStates,p])
  const finiteContacts=useMemo(()=>({left:refineFiniteSonicContacts(riemannStates?.left,finiteSonicContacts(riemannStates?.left,riemannHugoniot?.left,p,'forward'),p,'forward'),right:refineFiniteSonicContacts(riemannStates?.right,finiteSonicContacts(riemannStates?.right,riemannHugoniot?.right,p,'backward'),p,'backward')}),[riemannStates,riemannHugoniot,p])
  const sonicConnections=useMemo(()=>sonicRarefactionConnections(finiteContacts,stateRarefactions,p,{riemannStates}),[finiteContacts,stateRarefactions,p,riemannStates])
  const forwardLiu=useMemo(()=>(finiteContacts.left??[]).filter(q=>q.refinement?.status==='converged').map(q=>sampledLiuAtForwardContact(riemannStates?.left,q,riemannHugoniot?.left,p)),[finiteContacts,riemannStates,riemannHugoniot,p])
  const seededForwardLiu=useMemo(()=>(finiteContacts.left??[]).filter(q=>q.refinement?.status==='converged').map(q=>seededLiuAtForwardContact(riemannStates?.left,q,p)),[finiteContacts,riemannStates,p])
  const seededBackwardArcs=useMemo(()=>(finiteContacts.right??[]).filter(q=>q.refinement?.status==='converged').map(q=>traceSeededBackwardHugoniot(riemannStates?.right,q,p)),[finiteContacts,riemannStates,p])
  const backwardLiu=useMemo(()=>(finiteContacts.right??[]).filter(q=>q.refinement?.status==='converged').map(q=>seededLiuAtBackwardContact(riemannStates?.right,q,p)),[finiteContacts,riemannStates,p])
  const compositeLiu=useMemo(()=>classifyCompositeEvidence(classifyCompositeLiu(sonicConnections,finiteContacts,seededForwardLiu,backwardLiu)),[sonicConnections,finiteContacts,seededForwardLiu,backwardLiu])
  const svgRef=useRef(null)
  useEffect(()=>{
    const svg=svgRef.current
    const observer=new ResizeObserver(([{contentRect:{width,height}}])=>{
      if(width>0&&height>0){
        svg.style.setProperty('--state-marker-scale-x',String((height/H)/(width/W)))
      }
    })
    observer.observe(svg)
    return ()=>observer.disconnect()
  },[])
  const [hoveredState,setHoveredState]=useState(null)
  const [showDiscriminant,setShowDiscriminant]=useWorkspacePreference('states.showDiscriminant', false)
  const [showLeftStateRarefaction,setShowLeftStateRarefaction]=useWorkspacePreference('states.showLeftStateRarefaction', true)
  const [showRightStateRarefaction,setShowRightStateRarefaction]=useWorkspacePreference('states.showRightStateRarefaction', true)
  const [showRarefactionEvents,setShowRarefactionEvents]=useWorkspacePreference('states.showRarefactionEvents', false)
  const isStateRarefactionVisible=side=>side==='left'?showLeftStateRarefaction:showRightStateRarefaction
  const [activity,setActivity]=useWorkspacePreference('states.activity', 'states')
  const [activityPanelOpen,setActivityPanelOpen]=useWorkspacePreference('states.activityPanelOpen', true)
  const dragging=useRef(null)
  const dragPreview=useRef(null)
  // Durante o arrasto, apenas o contorno RH simplificado é recalculado.
  // O estado global e todos os diagnósticos permanecem congelados até soltar.
  const clearDragPreview=()=>{
    const preview=dragPreview.current
    if(!preview)return
    if(preview.frame)cancelAnimationFrame(preview.frame)
    preview.group.remove()
    preview.hiddenCurves.forEach(({node,opacity})=>{
      if(opacity===null)node.removeAttribute('opacity')
      else node.setAttribute('opacity',opacity)
    })
    dragPreview.current=null
  }
  const startDragPreview=(side,coords)=>{
    clearDragPreview()
    const svg=svgRef.current
    if(!svg||!coords)return
    const namespace='http://www.w3.org/2000/svg'
    const group=document.createElementNS(namespace,'g')
    group.setAttribute('pointer-events','none')
    group.setAttribute('aria-hidden','true')
    const path=document.createElementNS(namespace,'path')
    path.setAttribute('fill','none')
    path.setAttribute('stroke',side==='left'?'#ff9f0a':'#30d158')
    path.setAttribute('stroke-width','1.5')
    path.setAttribute('stroke-dasharray','5 4')
    path.setAttribute('opacity','0.8')
    group.appendChild(path)
    // A curva estacionária definitiva já está desenhada pelo React.
    // Nunca substituí-la por uma extração rápida, que pode perder ramos.
    const marker=svg.querySelector(`[data-state-marker="${side}"]`)
    let copy=null
    if(marker){
      copy=marker.cloneNode(true)
      copy.removeAttribute('data-state-marker')
      copy.setAttribute('opacity','0.9')
      group.appendChild(copy)
    }
    const hiddenCurves=[...svg.querySelectorAll(`[data-riemann-side="${side}"]`)].map(node=>{
      const opacity=node.getAttribute('opacity')
      node.setAttribute('opacity','0')
      return {node,opacity}
    })
    // A curva e o marcador anteriores não representam o estado arrastado.
    // Ocultá-los evita a duplicação visual e restaura-os ao terminar.
    if(marker){
      hiddenCurves.push({node:marker,opacity:marker.getAttribute('opacity')})
      marker.setAttribute('opacity','0')
    }
    svg.appendChild(group)
    dragPreview.current={side,start:coords,latest:coords,group,path,copy,frame:0,hiddenCurves}
    moveDragPreview(coords)
  }
  const moveDragPreview=(coords)=>{
    const preview=dragPreview.current
    if(!preview||!coords)return
    preview.latest=coords
    if(preview.copy){
      const dx=sx({u:coords[0],v:coords[1]},view)-sx({u:preview.start[0],v:preview.start[1]},view)
      const dy=sy({u:coords[0],v:coords[1]},view)-sy({u:preview.start[0],v:preview.start[1]},view)
      preview.copy.setAttribute('transform',`translate(${dx} ${dy})`)
    }
    if(preview.frame)return
    preview.frame=requestAnimationFrame(()=>{
      preview.frame=0
      preview.path.setAttribute('d',fastHugoniotPreviewPath(preview.latest,p,view,{width:W,height:H,padding:P}))
    })
  }
  const finishDragPreview=(commit=true)=>{
    const preview=dragPreview.current
    clearDragPreview()
    dragging.current=null
    if(commit&&preview?.latest&&onChangeRiemannState){
      const initial=riemannStates?.[preview.side]
      if(!initial||Math.hypot(preview.latest[0]-initial[0],preview.latest[1]-initial[1])>1e-12){
        onChangeRiemannState(preview.side,preview.latest)
      }
    }
  }
  const panning=useRef(null)
  const boxZoomStart=useRef(null)
  const [boxZoomRect,setBoxZoomRect]=useState(null)
  const [boxZoomMode,setBoxZoomMode]=useState(false)
  const [windowHistory,setWindowHistory]=useWorkspacePreference('states.windowHistory', [])
  const [panMode,setPanMode]=useState(false)
  const [inspectCurves,setInspectCurves]=useState(false)
  const [selectStarMode,setSelectStarMode]=useState(false)
  const [showCoordinates,setShowCoordinates]=useWorkspacePreference('states.showCoordinates', true)
  const [lastInspectedPixel,setLastInspectedPixel]=useState(null)
  const [selectedCurveKey,setSelectedCurveKey]=useState(null)
  const [overlapHits,setOverlapHits]=useState([])
  const [placement,setPlacement]=useState(null)
  const [cursorPoint,setCursorPoint]=useState(null)
  useEffect(()=>{
    const onKey=e=>{
      if(e.key==='Escape'&&placement){e.preventDefault();e.stopImmediatePropagation();setPlacement(null);setCursorPoint(null);return}
      if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName)||e.target?.isContentEditable)return
      const side=e.key.toLowerCase()==='l'?'left':e.key.toLowerCase()==='r'?'right':null
      if(side){e.preventDefault();setPlacement(side);setHoveredState(null);setCursorPoint(null)}
    }
    globalThis.window.addEventListener('keydown',onKey,true)
    return()=>globalThis.window.removeEventListener('keydown',onKey,true)
  },[placement,riemannStates])
  const [draftStates,setDraftStates]=useState({left:['',''],right:['','']})
  useEffect(()=>{if(riemannStates)setDraftStates({left:(riemannStates.left?.map(String)??['','']),right:(riemannStates.right?.map(String)??['',''])})},[riemannStates])
  const [uText,setUText]=useState(fixedState?String(fixedState[0]):'')
  const [vText,setVText]=useState(fixedState?String(fixedState[1]):'')
  const [showInspectedState,setShowInspectedState]=useWorkspacePreference('states.showInspectedState', false)
  const [stateProjection,setStateProjection]=useWorkspacePreference('states.stateProjection', 'plus')
  useEffect(()=>{if(projectionRequest?.side==='minus'||projectionRequest?.side==='plus')setStateProjection(projectionRequest.side)},[projectionRequest, setStateProjection])
  const DEFAULT_STATE_WINDOW={uMin:-5,uMax:5,vMin:-5,vMax:5}
  const STORAGE_WINDOW_KEY='gwml.stateSpace.savedViewport.v1'
  const [window,setWindow]=useWorkspacePreference('states.window', ()=>{
    try {
      const saved=JSON.parse(globalThis.localStorage?.getItem(STORAGE_WINDOW_KEY)??'null')
      return saved&&validWindow(saved)?saved:{...DEFAULT_STATE_WINDOW}
    } catch {return {...DEFAULT_STATE_WINDOW}}
  })
  const [windowText,setWindowText]=useState(()=>Object.fromEntries(Object.entries(window).map(([k,v])=>[k,String(v)])))
  const applyWindow=(next,{record=false}={})=>{
    if(record&&validWindow(next))setWindowHistory(history=>[...history.slice(-19),window])
    if(!validWindow(next))return
    setWindow(next)
    setWindowText(Object.fromEntries(Object.entries(next).map(([k,v])=>[k,String(Number(v.toPrecision(9)))])))
  }
  const [windowSaved,setWindowSaved]=useState(false)
  const saveCurrentWindow=()=>{
    try {
      globalThis.localStorage?.setItem(STORAGE_WINDOW_KEY,JSON.stringify(window))
      setWindowSaved(true)
    } catch {setWindowSaved(false)}
  }
  const [restoreMessage,setRestoreMessage]=useState('')
  const restoreSavedWindow=()=>{
    try {
      const saved=JSON.parse(globalThis.localStorage?.getItem(STORAGE_WINDOW_KEY)??'null')
      if(!validWindow(saved)){
        setRestoreMessage('Nenhuma janela válida guardada.')
        return
      }
      applyWindow(saved,{record:true})
      setRestoreMessage('Coordenadas recuperadas.')
    } catch {
      setRestoreMessage('Não foi possível recuperar as coordenadas.')
    }
  }
  useEffect(()=>{setWindowSaved(false)},[window])
  useEffect(()=>{setUText(fixedState?String(fixedState[0]):'');setVText(fixedState?String(fixedState[1]):'')},[fixedState])
  const view=useMemo(()=>({...g,...window}),[g,window])
  const showBt=Boolean(locusVisibility['BT-']?.[0]||locusVisibility['BT+']?.[0])
  const btLoci=useMemo(()=>showBt&&locusWindow?projectedBtLoci(p,locusWindow,{btCurveMode,sonicMeshMode}):[],
    [showBt,p,locusWindow,btCurveMode,sonicMeshMode])
  const showBtMinus=locusVisibility['BT-']?.[0]
  const showBtPlus=locusVisibility['BT+']?.[0]
  const visibleLoci=useMemo(()=>[...sharedLoci,...btLoci.filter(item=>item.id==='BT-'?showBtMinus:showBtPlus)],
    [sharedLoci,btLoci,showBtMinus,showBtPlus])
  const projectedInflection=useMemo(()=>showJ?stateInflectionProjection(p,window):[],[showJ,p,window])
  const projectedPair=useMemo(()=>{
    if(!projectionRequest)return null
    const valid=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
    if(!valid(projectionRequest.minus)||!valid(projectionRequest.plus))return null
    return {minus:{u:projectionRequest.minus[0],v:projectionRequest.minus[1]},plus:{u:projectionRequest.plus[0],v:projectionRequest.plus[1]}}
  },[projectionRequest])
  const requestedProjectionPoint=projectedPair?.[stateProjection]??(projectionRequest?.side===stateProjection&&projectionRequest?.coords?.length===2&&projectionRequest.coords.every(Number.isFinite)?{u:projectionRequest.coords[0],v:projectionRequest.coords[1]}:null)
  const projectedPairCoincident=!!projectedPair&&Math.hypot(projectedPair.minus.u-projectedPair.plus.u,projectedPair.minus.v-projectedPair.plus.v)<=1e-10*Math.max(1,Math.hypot(projectedPair.minus.u,projectedPair.minus.v),Math.hypot(projectedPair.plus.u,projectedPair.plus.v))
  const requestedProjectionVisible=!!requestedProjectionPoint&&requestedProjectionPoint.u>=view.uMin&&requestedProjectionPoint.u<=view.uMax&&requestedProjectionPoint.v>=view.vMin&&requestedProjectionPoint.v<=view.vMax
  const discriminantRegions=useMemo(()=>showDiscriminant?sampleDiscriminantRegions(p,window):null,[showDiscriminant,p,window])
  const coincidenceAudit=useMemo(()=>showDiscriminant?auditCoincidenceProjection(sharedLoci,p,window):null,[showDiscriminant,sharedLoci,p,window])
  const coincidenceDegeneracies=useMemo(()=>showDiscriminant?auditCoincidenceDegeneracies(p,window):null,[showDiscriminant,p,window])
  const coincidenceLifts=useMemo(()=>showDiscriminant?auditCoincidenceLifts(p,window):null,[showDiscriminant,p,window])
  const coincidenceIncidence=useMemo(()=>showDiscriminant?auditCoincidenceIncidence(p,window):null,[showDiscriminant,p,window])
  const coincidenceCoverage=useMemo(()=>showDiscriminant?auditCoincidenceCoverage(sharedLoci,p,window):null,[showDiscriminant,sharedLoci,p,window])
  const {minus,plus,mean,speed}=g.projection??{}
  const x0=view.uMin<=0&&view.uMax>=0?sx({u:0,v:view.vMin},view):null
  const y0=view.vMin<=0&&view.vMax>=0?sy({u:view.uMin,v:0},view):null
  const commitBound=key=>{const n=finiteNumber(windowText[key]);if(n===null){setWindowText(t=>({...t,[key]:String(window[key])}));return}const next={...window,[key]:n};if(!validWindow(next)){setWindowText(t=>({...t,[key]:String(window[key])}));return}setWindow(next);setWindowText(t=>({...t,[key]:String(n)}))}
  const onBoundKey=(e,key)=>{if(e.key==='Enter'){e.currentTarget.blur()}else if(e.key==='Escape'){setWindowText(t=>({...t,[key]:String(window[key])}));e.currentTarget.blur()}}
  const appliedChainExample=useRef(null)
  const applyChainExampleWindow=useEffectEvent(next=>applyWindow(next,{record:true}))
  useEffect(()=>{
    if(!chainExample||!constructionRequested||appliedChainExample.current===chainExample)return
    appliedChainExample.current=chainExample
    const index=allProfiles.findIndex(candidate=>candidate.pattern===chainExample.pattern)
    setActivity('chains')
    setActivityPanelOpen(true)
    setShowChain(true)
    onSelectCandidate?.(index)
    if(index>=0){
      const candidate=allProfiles[index]
      const {left,right}=chainExample.riemannStates
      const middle=candidate.middle??candidate.states?.[1]??left
      const [uMin,vMin]=left.map((value,i)=>Math.min(value,middle[i],right[i])-.55)
      const [uMax,vMax]=left.map((value,i)=>Math.max(value,middle[i],right[i])+.55)
      applyChainExampleWindow({uMin,uMax,vMin,vMax})
    }
  },[chainExample,constructionRequested,allProfiles,onSelectCandidate,setActivity,setActivityPanelOpen,setShowChain])
  const fitGeometry=()=>{const next=fittedWindow(g,fixedState,[...activeStates,...chainGeometry.points,...chainGeometry.junctions]);applyWindow(next,{record:true})}
  const zoomAt=(factor,anchor=null)=>applyWindow(zoomWindow(window,factor,anchor??[(view.uMin+view.uMax)/2,(view.vMin+view.vMax)/2]),{record:true})
  // Ampliação anisotrópica do domínio visível, preservando o centro do eixo.
  const scaleAxis=(axis,factor)=>{
    const minKey=axis==='u'?'uMin':'vMin',maxKey=axis==='u'?'uMax':'vMax'
    const center=(window[minKey]+window[maxKey])/2
    const half=(window[maxKey]-window[minKey])*factor/2
    applyWindow({...window,[minKey]:center-half,[maxKey]:center+half},{record:true})
  }
  const onPlotWheel=e=>{
    if(!e.currentTarget.contains(e.target))return
    e.preventDefault()
    const anchor=coordinatesFromPointer(e)
    zoomAt(e.deltaY<0?0.88:1/0.88,anchor)
  }
  const coordinatesFromPointer=e=>{
    const svg=svgRef.current;if(!svg)return null
    const matrix=svg.getScreenCTM();if(!matrix)return null
    const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY
    const local=pt.matrixTransform(matrix.inverse())
    if(local.x<P||local.x>W-P||local.y<P||local.y>H-P)return null
    return [view.uMin+(local.x-P)/(W-2*P)*(view.uMax-view.uMin),view.vMax-(local.y-P)/(H-2*P)*(view.vMax-view.vMin)]
  }
  const hitState=coords=>{
    if(!coords||!riemannStates)return null
    const threshold=16
    const hits=['left','right'].filter(side=>{
      const state=riemannStates[side]
      return state&&Math.hypot(sx({u:coords[0],v:coords[1]},view)-sx({u:state[0],v:state[1]},view),sy({u:coords[0],v:coords[1]},view)-sy({u:state[0],v:state[1]},view))<=threshold
    })
    return hits[0]??null
  }
  const inspectProjectedCurve=e=>{
    const coords=coordinatesFromPointer(e)
    if(!coords)return
    const point=[sx({u:coords[0],v:coords[1]},view),sy({u:coords[0],v:coords[1]},view)]
    setLastInspectedPixel(point)
    const hits=projectedCurveHits(point,inspectableCurves)
    setOverlapHits(hits.map(hit=>hit.curve.key))
    setSelectedCurveKey(current=>nextProjectedCurveHit(hits,current))
  }
  const plotPixel=e=>{
    const svg=svgRef.current
    const matrix=svg?.getScreenCTM()
    if(!svg||!matrix)return null
    const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY
    const local=pt.matrixTransform(matrix.inverse())
    return {x:Math.max(P,Math.min(W-P,local.x)),y:Math.max(P,Math.min(H-P,local.y))}
  }
  const finishBoxZoom=()=>{
    const rect=boxZoomRect
    boxZoomStart.current=null
    setBoxZoomRect(null)
    if(!rect||rect.width<8||rect.height<8)return
    const x1=rect.x,x2=rect.x+rect.width,y1=rect.y,y2=rect.y+rect.height
    const next={
      uMin:view.uMin+(x1-P)/(W-2*P)*(view.uMax-view.uMin),
      uMax:view.uMin+(x2-P)/(W-2*P)*(view.uMax-view.uMin),
      vMin:view.vMax-(y2-P)/(H-2*P)*(view.vMax-view.vMin),
      vMax:view.vMax-(y1-P)/(H-2*P)*(view.vMax-view.vMin),
    }
    // Preserva a razão das escalas atuais (unidades por pixel) expandindo
    // apenas o lado mais curto da seleção, sem recortar a região escolhida.
    const ratio=(view.uMax-view.uMin)/(view.vMax-view.vMin)*(H-2*P)/(W-2*P)
    const uSpan=next.uMax-next.uMin,vSpan=next.vMax-next.vMin
    if(uSpan/vSpan<ratio){
      const c=(next.uMin+next.uMax)/2,half=vSpan*ratio/2
      next.uMin=c-half;next.uMax=c+half
    }else{
      const c=(next.vMin+next.vMax)/2,half=uSpan/ratio/2
      next.vMin=c-half;next.vMax=c+half
    }
    applyWindow(next,{record:true})
  }
  const selectFromPointer=e=>{
    if(boxZoomMode&&e.button===0){
      const point=plotPixel(e)
      if(!point)return
      boxZoomStart.current=point
      setBoxZoomRect({x:point.x,y:point.y,width:0,height:0})
      e.currentTarget.setPointerCapture?.(e.pointerId)
      e.preventDefault()
      return
    }
    if(e.button===1||e.button===0&&panMode){
      const svg=svgRef.current
      const rect=svg?.getBoundingClientRect()
      if(!rect)return
      setWindowHistory(history=>[...history.slice(-19),window])
      panning.current={x:e.clientX,y:e.clientY,window:{...window},width:rect.width,height:rect.height}
      e.currentTarget.setPointerCapture?.(e.pointerId)
      e.preventDefault()
      return
    }
    if(e.button!==0)return
    if(inspectCurves&&!placement){inspectProjectedCurve(e);return}
    const coords=coordinatesFromPointer(e)
    if(!coords)return
    if(placement){onChangeRiemannState?.(placement,coords);setPlacement(null);setCursorPoint(null);return}
    const side=hitState(coords)
    if(side){dragging.current=side;startDragPreview(side,riemannStates?.[side]);setHoveredState(side);e.currentTarget.setPointerCapture?.(e.pointerId)}
    else if(selectStarMode)onSelectState?.(coords)
  }
  const movePointer=e=>{
    if(boxZoomStart.current){
      const point=plotPixel(e),start=boxZoomStart.current
      if(point)setBoxZoomRect({x:Math.min(start.x,point.x),y:Math.min(start.y,point.y),
        width:Math.abs(point.x-start.x),height:Math.abs(point.y-start.y)})
      return
    }
    if(panning.current){
      const start=panning.current
      const du=-(e.clientX-start.x)/Math.max(start.width,1)*(W/(W-2*P))*(start.window.uMax-start.window.uMin)
      const dv=(e.clientY-start.y)/Math.max(start.height,1)*(H/(H-2*P))*(start.window.vMax-start.window.vMin)
      applyWindow(panWindow(start.window,du,dv))
      return
    }
    const coords=coordinatesFromPointer(e)
    if(dragging.current){moveDragPreview(coords);return}
    setCursorPoint(coords)
    if(placement)return
    setHoveredState(hitState(coords))
  }
  const endPointer=()=>{if(boxZoomStart.current)finishBoxZoom();finishDragPreview();panning.current=null}
  const onPlotKey=e=>{
    if(e.key==='Escape'&&selectStarMode){setSelectStarMode(false);e.preventDefault();return}
    if(!hoveredState||!riemannStates?.[hoveredState]||placement)return
    const offsets={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]}
    const delta=offsets[e.key];if(!delta)return
    e.preventDefault()
    const step=e.shiftKey?1:0.1
    const old=riemannStates[hoveredState]
    onChangeRiemannState?.(hoveredState,[old[0]+delta[0]*step/.1,old[1]+delta[1]*step/.1])
  }
  const commitRiemann=side=>{
    const coords=draftStates[side].map(Number)
    if(coords.length===2&&coords.every(Number.isFinite)&&draftStates[side].every(v=>String(v).trim()!==''))onChangeRiemannState?.(side,coords)
  }
  const nudge=(side,index,delta)=>{
    const old=riemannStates?.[side];if(!old)return
    const next=[...old];next[index]+=delta;onChangeRiemannState?.(side,next)
  }
  const applyExact=()=>{const u=finiteNumber(uText),v=finiteNumber(vText);if(u!==null&&v!==null)onSelectState?.([u,v])}
  const [rarefactionVisibility,setRarefactionVisibility]=useWorkspacePreference('states.rarefactionLayers',{})
  const projectedRarefactionLayers=useMemo(
    ()=>rarefactionStateLayers(p,tauMin,tauMax,rarefactionVisibility),
    [p,tauMin,tauMax,rarefactionVisibility],
  )
  const visibleRarefactionLayers=useMemo(()=>rarefactionLayers.filter(layer=>rarefactionVisibility[layer.id]).map(layer=>{
    const data=projectedRarefactionLayers[layer.id]??[]
    const bounds={uMin:view.uMin,uMax:view.uMax,vMin:view.vMin,vMax:view.vMax}
    return {...layer,data:layer.point
      ?data.filter(q=>q.u>=bounds.uMin&&q.u<=bounds.uMax&&q.v>=bounds.vMin&&q.v<=bounds.vMax)
      :data.flatMap(points=>clipStatePolyline(points,bounds))}
  }),[projectedRarefactionLayers,rarefactionVisibility,view])
  const visibleCurves=useMemo(()=>g.curves.flatMap(c=>clipStatePolyline(c.points,{uMin:view.uMin,uMax:view.uMax,vMin:view.vMin,vMax:view.vMax}).map((points,i)=>({...c,points,clipId:i}))),[g.curves,view.uMin,view.uMax,view.vMin,view.vMax])
  const locusLabelLayers=useMemo(()=>visibleLoci.map(locus=>{
    const paths=locus.id==='J'?projectedInflection:locus.projected[stateProjection]
    const data=paths.flatMap(path=>clipStatePolyline(path,view))
    // Try the longest visible stretches first when the curve has several pieces.
    const length=path=>path.slice(1).reduce((sum,point,i)=>
      sum+Math.hypot(sx(point,view)-sx(path[i],view),sy(point,view)-sy(path[i],view)),0)
    return {...locus,data:data.map(path=>({path,length:length(path)}))
      .sort((a,b)=>b.length-a.length).map(({path})=>path)}
  }),[visibleLoci,projectedInflection,stateProjection,view])
  const graphLabels=useMemo(
    ()=>placeGraphLabels([...visibleRarefactionLayers,...locusLabelLayers],showRarefactionField?visibleCurves:[],view),
    [visibleRarefactionLayers,locusLabelLayers,showRarefactionField,visibleCurves,view],
  )
  // Under an explicit projection, one fixed-state fibre collapses to U* and the other has a non-constant image.
  // pi_-: H^forw=pi_-^{-1}(U*) -> {U*}; H^back -> variable U_-.
  // pi_+: H^forw -> variable U_+; H^back=pi_+^{-1}(U*) -> {U*}.
  const visibleHugoniot=useMemo(()=>{
    const projectedHugoniot=(stateProjection==='minus'?showPlusStateFibre:showMinusStateFibre)?(stateProjection==='minus'?(hugoniot?.backward??[]):(hugoniot?.forward??[])) : []
    return projectedHugoniot.flatMap(c=>clipStatePolyline(c.points,{uMin:view.uMin,uMax:view.uMax,vMin:view.vMin,vMax:view.vMax}).map((points,i)=>({...c,points,clipId:i})))
  },[stateProjection,showMinusStateFibre,showPlusStateFibre,hugoniot,view.uMin,view.uMax,view.vMin,view.vMax])
  const inspectableCurves=useMemo(()=>[
    ...(showRarefactionField?visibleCurves:[]).map(c=>({...c, key:`rare:${c.id}:${c.clipId}`, kind:'Rarefação', sourceSide:'—'})),
    ...visibleHugoniot.map(c=>({...c, key:`hug:${stateProjection}:${c.id}:${c.clipId}`, kind:'Hugoniot', sourceSide:stateProjection})),
  ].map(c=>({...c,screenPoints:c.points.map(q=>[sx(q,view),sy(q,view)])})),[visibleCurves,visibleHugoniot,stateProjection,view,showRarefactionField])
  const selectedProjectedCurve=inspectableCurves.find(c=>c.key===selectedCurveKey)??null
  const selectedCurveSample=selectedProjectedCurve&&lastInspectedPixel?nearestProjectedSample(lastInspectedPixel,selectedProjectedCurve):null
  const sampledShockEndpoints=selectedProjectedCurve?.kind==='Hugoniot'&&selectedCurveSample&&fixedState
    ?projectedHugoniotEndpoints(stateProjection,fixedState,selectedCurveSample.state):null
  const sampledShockDiagnostic=sampledShockEndpoints
    ?directShockDiagnostic(sampledShockEndpoints.left,sampledShockEndpoints.right,p):null

  const sampledWaveLift=sampledShockEndpoints?liftHugoniotSample(sampledShockEndpoints.left,sampledShockEndpoints.right,p):null
  const selectedCurveProvenance=selectedProjectedCurve?.kind==='Hugoniot'&&fixedState?{side:stateProjection,source:stateProjection==='plus'?'forward':'backward',fixedState}:null
  // pi_+ displays the variable right states of H^forw(U_L).
  // pi_- displays the variable left states of H^back(U_R).
  const activeHugoniotArc=useMemo(()=>selectedCandidateHugoniotArc(activeProfile,stateProjection,riemannHugoniot,{tolerance:Math.max(view.uMax-view.uMin,view.vMax-view.vMin)*0.008,fluxCoefficients:p}),[activeProfile,stateProjection,riemannHugoniot,p,view.uMin,view.uMax,view.vMin,view.vMax])
  const [animateCandidateFlow,setAnimateCandidateFlow]=useWorkspacePreference('states.animateCandidateFlow', false)
  const [candidateFlowSpeed,setCandidateFlowSpeed]=useWorkspacePreference('states.candidateFlowSpeed', 1)
  const candidateFlowDuration=`${(1.2/candidateFlowSpeed).toFixed(2)}s`
  const canAnimateShock=chainGeometry.segments.some(s=>s.arc?.points.length>1)
  const canAnimateRarefaction=activeFan.length>1
  const [comparisonIndex,setComparisonIndex]=useWorkspacePreference('states.comparisonIndex', -1)
  useEffect(()=>{setComparisonIndex(-1)},[constructionRevision,constructionRequested,setComparisonIndex])
  const comparisonProfile=allProfiles[comparisonIndex]??null
  const comparisonGeometry=useMemo(()=>candidateStateGeometry(comparisonProfile,p),[comparisonProfile,p])
  const comparisonArc=useMemo(()=>comparisonProfile?selectedCandidateHugoniotArc(comparisonProfile,stateProjection,riemannHugoniot,{tolerance:Math.max(view.uMax-view.uMin,view.vMax-view.vMin)*0.008,fluxCoefficients:p}):null,[comparisonProfile,stateProjection,riemannHugoniot,p,view.uMin,view.uMax,view.vMin,view.vMax])
  const sensitivityComparison=useMemo(()=>compareHugoniotSensitivity(activeHugoniotArc,comparisonArc),[activeHugoniotArc,comparisonArc])
  const coordinateComparison=useMemo(()=>compareHugoniotCoordinateSensitivity(activeHugoniotArc,comparisonArc),[activeHugoniotArc,comparisonArc])
  const implicitMiddleSensitivity=useMemo(()=>activeProfile?.kind==='two-shock'?implicitTwoShockMiddleSensitivity(riemannStates?.left,activeStates?.[1],riemannStates?.right,p):null,[activeProfile,activeStates,riemannStates,p])
  const mixedMiddleSensitivity=useMemo(()=>activeProfile&&['rarefaction-shock','shock-rarefaction'].includes(activeProfile.kind)?mixedMiddleReconstructionSensitivity(riemannStates?.left,activeStates?.[1],riemannStates?.right,p,{kind:activeProfile.kind,family:activeProfile.provenance?.waves?.find(w=>w.type==='rarefaction')?.family,sign:activeProfile.provenance?.waves?.find(w=>w.type==='rarefaction')?.branchSign}):null,[activeProfile,activeStates,riemannStates,p])

  const visibleRiemannHugoniot=useMemo(()=>{
    const source=(stateProjection==='plus'?showLeftRiemannHugoniot:showRightRiemannHugoniot)?(stateProjection==='plus'?riemannHugoniot?.left:riemannHugoniot?.right):[]
    return (source??[]).flatMap(c=>clipStatePolyline(c.points,{uMin:view.uMin,uMax:view.uMax,vMin:view.vMin,vMax:view.vMax}).map((points,i)=>({...c,points,clipId:i})))
  },[stateProjection,showLeftRiemannHugoniot,showRightRiemannHugoniot,riemannHugoniot,view.uMin,view.uMax,view.vMin,view.vMax])
  const hugClass=c=>c.laxClass?.kind==='lax'?`stateHugLax${c.laxClass.family}`:c.laxClass?.kind==='non-lax'?'stateHugNonLax':'stateHugUndefined'
  const selected=fixedState?{u:fixedState[0],v:fixedState[1]}:null
  const selectedVisible=selected&&selected.u>=view.uMin&&selected.u<=view.uMax&&selected.v>=view.vMin&&selected.v<=view.vMax
  // Posicionamento somente visual: preserva as coordenadas dos marcadores.
  const labelPoints=[...(riemannStates?['left','right'].filter(side=>riemannStates[side]).map(side=>({u:riemannStates[side][0],v:riemannStates[side][1]})):[]),...(activeStates??[]).filter(Array.isArray).map(q=>({u:q[0],v:q[1]})),...chainGeometry.junctions.map(([u,v])=>({u,v})),...(selected?[selected]:[])].filter(q=>Number.isFinite(q.u)&&Number.isFinite(q.v))
  const labelPosition=(q,preferred=0,options)=>{
    const point={x:sx(q,view),y:sy(q,view)}
    const neighbours=labelPoints.map(other=>({x:sx(other,view),y:sy(other,view)}))
    return chooseStateLabelPosition(point,neighbours,preferred,{width:W,height:H},options)
  }
  const arrowObstacles=labelPoints.map(q=>{
    const x=sx(q,view),y=sy(q,view)
    return {left:x-8,right:x+8,top:y-8,bottom:y+8}
  })
  const occupiedLabels=[]
  const reserveLabel=([u,v],preferred,labelWidth)=>{
    const position=labelPosition({u,v},preferred,{occupied:occupiedLabels,labelWidth})
    const {x,y,textAnchor}=position
    const left=textAnchor==='end'?x-labelWidth:x
    occupiedLabels.push({left,right:left+labelWidth,top:y-17,bottom:y+8})
    return position
  }
  const showChainLabels=activeProfile&&showChain
  const segmentColorKeys=chainSegmentColorKeys(activeProfile,chainGeometry.segments)
  const endpointLabels={}
  if(showChainLabels)for(const side of ['left','right']){
    if(pointVisibility[side]&&riemannStates?.[side])endpointLabels[side]=reserveLabel(riemannStates[side],side==='left'?3:2,26)
  }
  const middleLabel=showChainLabels&&pointVisibility.middle&&activeStates[1]?reserveLabel(activeStates[1],2,26):null
  const junctionLabels=showChainLabels?chainGeometry.junctions.map((point,i)=>reserveLabel(point,4+i%2,32)):[]
  arrowObstacles.push(...occupiedLabels)
  return <div className="localChartBody stateExplorationBody">
    <WorkspaceLayout kind="states" expanded={activityPanelOpen} className="stateWorkspaceGrid" data-activity={activity} data-expanded={activityPanelOpen}>
    <WorkspaceRail className="stateActivityRail" ariaLabel="Categorias de ferramentas do espaço de estados"
      active={activity} expanded={activityPanelOpen}
      items={[{id:'states',label:'Estados',group:'Dados',description:'Estados de Riemann e U*'},
        {id:'points',label:'Pontos',group:'Dados',description:'Marcadores e estados no plano'},
        {id:'curves',label:'Curvas',group:'Ondas',description:'Hugoniot e hiperbolicidade'},
        {id:'shocks',label:'Choques',group:'Ondas',description:'Ramos de choque nos estados'},
        {id:'arcs',label:'Rarefações',group:'Ondas',description:'Curvas integrais dos estados de Riemann'},
        {id:'fields',label:'Campos',group:'Ondas',description:'Campos vetoriais e trajetórias integrais'},
        {id:'chains',label:'Cadeias',group:'Ondas',description:'Construir e inspecionar cadeias'},
        {id:'inspection',label:'Inspeção',group:'Análise',description:'Estados, projeções e diagnósticos científicos'},
        {id:'view',label:'Vista',group:'Análise',description:'Limites da janela de visualização'}]}
      onSelect={id=>{if(activity===id)setActivityPanelOpen(v=>!v);else{setActivity(id);setActivityPanelOpen(true)}}}
      onCollapse={()=>setActivityPanelOpen(v=>!v)}/>
    <WorkspaceDrawer className="stateToolsDrawer" data-activity={activity} data-expanded={activityPanelOpen} aria-label="Ferramentas do espaço de estados">
      <WorkspacePanelHeader title={{states:'Estados',curves:'Curvas e projeções',points:'Pontos',arcs:'Rarefações',shocks:'Choques nos estados',fields:'Campos',view:'Visualização',chains:'Cadeias candidatas',inspection:'Inspeção científica'}[activity]} onCollapse={()=>setActivityPanelOpen(false)}/>
      <div className="stateToolsDrawerContent">
      {activity!=='chains'&&<div className="stateConstructionActions" aria-label="Modo de visualização das ondas">
        <label className="stateChainVisibility"><input type="checkbox" checked={exploreWaveBranches} onChange={e=>onChangeExploreWaveBranches?.(e.target.checked)}/>Explorar ramos individuais de ondas</label>
        <small>{exploreWaveBranches?'Exploração ativa: estes ramos individuais não representam uma cadeia construída.':activeProfile?'Vista de construção: apenas os segmentos da cadeia selecionada.':'Nenhuma cadeia selecionada: arcos de choque e rarefação ocultos. Construa candidatos e selecione uma cadeia.'}</small>
      </div>}

    <details className="statePanelSection workspaceDisclosure" data-activity-section="states" open><summary>Estados de Riemann</summary><div className="statePanelSectionBody"><p className="statePanelHint" title="L/R posiciona o estado; clique fixa; Esc cancela; arraste para mover.">L/R: posicionar · arrastar: mover</p><div className="stateSelectionControls" aria-label="Estados iniciais do problema de Riemann">
    {['left','right'].map(side=><div className="riemannStateEditor" key={side}>
      <div className="riemannStateHeader"><strong><MathLabel>{side==='left'?String.raw`U_L`:String.raw`U_R`}</MathLabel></strong><span>{side==='left'?'Estado esquerdo':'Estado direito'}</span></div>
      <div className="riemannCoordinates">
        {[0,1].map(i=><label className="sceneNumericRow" key={i}><MathLabel>{i===0?'u':'v'}</MathLabel><input type="number" step="any" aria-label={`${side==='left'?'U_L':'U_R'} ${i===0?'u':'v'}`} value={draftStates[side][i]} onChange={e=>setDraftStates(t=>({...t,[side]:t[side].map((v,j)=>j===i?e.target.value:v)}))} onKeyDown={e=>{if(e.key==='Enter')commitRiemann(side)}}/></label>)}
      </div>
      <button type="button" className="riemannApply" onClick={()=>commitRiemann(side)}>Aplicar coordenadas</button>
      <button type="button" aria-label={`Posicionar ${side==='left'?'U_L':'U_R'} no gráfico`} onClick={()=>{setPlacement(side);setPanMode(false);setBoxZoomMode(false);setInspectCurves(false);setSelectStarMode(false);svgRef.current?.focus()}}>Posicionar no gráfico</button>
      <div className="riemannNudgeGrid" role="group" aria-label={`Ajustes de ${side==='left'?'U_L':'U_R'}`}>
        <button type="button" title="Diminuir u em 0,1" aria-label={`Diminuir u de ${side}`} onClick={()=>nudge(side,0,-.1)}><MathLabel>{String.raw`u-`}</MathLabel></button>
        <button type="button" title="Aumentar u em 0,1" aria-label={`Aumentar u de ${side}`} onClick={()=>nudge(side,0,.1)}><MathLabel>{String.raw`u+`}</MathLabel></button>
        <button type="button" title="Diminuir v em 0,1" aria-label={`Diminuir v de ${side}`} onClick={()=>nudge(side,1,-.1)}><MathLabel>{String.raw`v-`}</MathLabel></button>
        <button type="button" title="Aumentar v em 0,1" aria-label={`Aumentar v de ${side}`} onClick={()=>nudge(side,1,.1)}><MathLabel>{String.raw`v+`}</MathLabel></button>
      </div>
    </div>)}
    </div></div></details>
    <div className="statePanelSection stateConstructionActions" data-activity-section="states">
      <button type="button" disabled={!riemannStates?.left||!riemannStates?.right} onClick={()=>{onBuildCandidates?.();setActivity('chains');setActivityPanelOpen(true)}}>Construir candidatos</button>
      <small>Defina <MathLabel>U_L</MathLabel> e <MathLabel>U_R</MathLabel> no gráfico e construa e selecione uma cadeia em Cadeias.</small>
    </div>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="states" open><summary><span>Estado <MathLabel>{String.raw`U_*`}</MathLabel></span></summary><div className="statePanelSectionBody">
      <p className="statePanelHint">Clique no plano ou informe as coordenadas.</p>
      <div className="stateStarEditor">
        <div className="stateStarCoordinates">
          <label className="sceneNumericRow"><MathLabel>{String.raw`u^*`}</MathLabel><input type="number" step="any" value={uText} onChange={e=>setUText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')applyExact()}}/></label>
          <label className="sceneNumericRow"><MathLabel>{String.raw`v^*`}</MathLabel><input type="number" step="any" value={vText} onChange={e=>setVText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')applyExact()}}/></label>
        </div>
        <button type="button" className="stateStarPrimary" onClick={applyExact}>Fixar <MathLabel>{String.raw`U_*`}</MathLabel></button>
        <button type="button" className="stateStarSecondary" disabled={!fixedState} title={fixedState?'Mostrar as duas fibras canônicas de U* na variedade':'Primeiro fixe U*'} onClick={()=>onInspectFibres3D?.(fixedState)}>Ver fibras em 3D <span aria-hidden="true">↗</span></button>
        {fixedState&&<button type="button" className="stateStarClear" onClick={onClearState}>Limpar seleção</button>}
      </div>
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="curves" open><summary>Lugares geométricos</summary><div className="statePanelSectionBody">
      {Object.entries(locusPresentation).map(([id,{tex,name,color}])=>{
        const [visible,setVisible]=locusVisibility[id]??[]
        return <SceneVisibilityRow key={id} tex={tex} label={name} color={color}
          checked={Boolean(visible)} disabled={!setVisible} onChange={e=>setVisible(e.target.checked)}/>
      })}
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="curves" open><summary>Projeção da Hugoniot</summary><div className="statePanelSectionBody">
      <div className="stateProjectionCompact">
        <strong>Hugoniot de Riemann</strong>
        <div className="stateProjectionSegment" role="group" aria-label="Projeção das Hugoniot">
          <button type="button" aria-pressed={stateProjection==='minus'} className={stateProjection==='minus'?'active':''} onClick={()=>setStateProjection('minus')}><MathLabel>{String.raw`\pi_-`}</MathLabel></button>
          <button type="button" aria-pressed={stateProjection==='plus'} className={stateProjection==='plus'?'active':''} onClick={()=>setStateProjection('plus')}><MathLabel>{String.raw`\pi_+`}</MathLabel></button>
        </div>
        <StateHugoniotVisibility {...{showLeftRiemannHugoniot,setShowLeftRiemannHugoniot,showRightRiemannHugoniot,setShowRightRiemannHugoniot,showMinusStateFibre,setShowMinusStateFibre,showPlusStateFibre,setShowPlusStateFibre}}/>
        <small className="stateProjectionExplanation">{stateProjection==='minus'?<>Hugoniot backward de <MathLabel>U_R</MathLabel> em <MathLabel>{String.raw`\pi_-`}</MathLabel>, com estados esquerdos variáveis.</>:<>Hugoniot forward de <MathLabel>U_L</MathLabel> em <MathLabel>{String.raw`\pi_+`}</MathLabel>, com estados direitos variáveis.</>}</small>
        <small className="stateProjectionCaveat">Curvas geométricas; não certificam uma solução admissível.</small>
      </div>
      {fixedState&&!projectedPair&&<div className="stateProjectionCompact">
        <strong>Projeção de U* na variedade</strong>
        <small>{stateProjection==='minus'?<>A fibra forward projeta-se em <MathLabel>{String.raw`\{U_*\}`}</MathLabel> e a backward na curva dos <MathLabel>U_-</MathLabel>.</>:<>A fibra forward projeta-se na curva dos <MathLabel>U_+</MathLabel> e a backward em <MathLabel>{String.raw`\{U_*\}`}</MathLabel>.</>}</small>
      </div>}
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="shocks" open><summary>Ramos de choque nos estados</summary><div className="statePanelSectionBody">
      <div className="stateVisibilityRow" style={{'--visibility-color':'#ff453a'}}><span className="stateSwitchCopy"><strong><MathLabel>S_s(U_L)</MathLabel></strong><small>Choques lentos a partir do estado esquerdo</small></span><VisibilityEye disabled={!exploreWaveBranches} checked={exploreWaveBranches&&showLeftStateShock} onChange={()=>setShowLeftStateShock(v=>!v)} aria-label="Choques lentos de U L"/></div>
      <div className="stateVisibilityRow" style={{'--visibility-color':'#bf5af2'}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`S_f^{\mathrm{back}}(U_R)`}</MathLabel></strong><small>Choques rápidos que chegam ao estado direito</small></span><VisibilityEye disabled={!exploreWaveBranches} checked={exploreWaveBranches&&showRightStateShock} onChange={()=>setShowRightStateShock(v=>!v)} aria-label="Choques rápidos para U R"/></div>
      <small>Continuação RH no espaço de estados, independente da projeção e da seleção de uma cadeia. Cada arco começa no estado de referência e termina na primeira falha de verificação ou parada da continuação; trechos isolados posteriores são omitidos. RH e Lax são verificados nas amostras; Liu e entropia não são certificados.</small>
      <p>{shockCurves.filter(c=>c.side==='left').length} trecho(s) lento(s); {shockCurves.filter(c=>c.side==='right').length} trecho(s) rápido(s). Busca limitada a 240 passos e raio de duas vezes a escala dos estados.</p>
      {shockCurves.map(c=><p key={c.id}><b><MathLabel>{c.side==='left'?String.raw`S^{\mathrm{forw}}(U_L)`:String.raw`S_f^{\mathrm{back}}(U_R)`}</MathLabel></b>: {shockStopLabel(c.termination.reason)}. Última amostra verificada: ({c.termination.lastVerified.map(v=>v.toPrecision(6)).join(', ')}).{c.termination.firstRejected&&<> Primeira amostra rejeitada: ({c.termination.firstRejected.map(v=>v.toPrecision(6)).join(', ')}); a fronteira fica por localizar nesse intervalo.</>}</p>)}
      {!shockCurves.length&&<p>Nenhum arco conectado ao estado de referência foi verificado na busca limitada.</p>}
      <small>O quadrado vazio marca a última amostra verificada, não uma fronteira sônica certificada. Cortes na borda da janela apenas ocultam a continuação do arco.</small>
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="arcs" open><summary>Rarefações</summary><div className="statePanelSectionBody">
      <div className="stateVisualizationOption" role="group" aria-label="Rarefações dos estados de Riemann">
        <div className="stateVisibilityRow" style={{"--visibility-color":"#ff9f0a"}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal R_s(U_L)`}</MathLabel></strong><small>Lenta, com <MathLabel>{String.raw`\lambda_s`}</MathLabel> crescente a partir de <MathLabel>U_L</MathLabel></small></span><VisibilityEye disabled={!exploreWaveBranches} checked={exploreWaveBranches&&showLeftStateRarefaction} onChange={()=>setShowLeftStateRarefaction(v=>!v)} aria-label="Rarefações de U L" /></div>
        <div className="stateVisibilityRow" style={{"--visibility-color":"#30d158"}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal R_f^{\mathrm{back}}(U_R)`}</MathLabel></strong><small>Rápida retrospectiva, com <MathLabel>{String.raw`\lambda_f`}</MathLabel> decrescente a partir de <MathLabel>U_R</MathLabel></small></span><VisibilityEye disabled={!exploreWaveBranches} checked={exploreWaveBranches&&showRightStateRarefaction} onChange={()=>setShowRightStateRarefaction(v=>!v)} aria-label="Rarefações de U R" /></div>
        <div className="stateVisibilityRow" style={{"--visibility-color":"#ffd60a"}}><span className="stateSwitchCopy"><strong>Eventos infinitesimais</strong><small>Possíveis perdas de não linearidade genuína; em campos linearmente degenerados podem preencher toda a curva.</small></span><VisibilityEye disabled={!exploreWaveBranches} checked={exploreWaveBranches&&showRarefactionEvents} onChange={()=>setShowRarefactionEvents(v=>!v)} aria-label="Eventos de não linearidade genuína" /></div>
      </div>
      <p>Seleção clássica: família lenta a partir de <MathLabel>{String.raw`U_L`}</MathLabel> e rápida retrospectiva a partir de <MathLabel>{String.raw`U_R`}</MathLabel>. Na orientação física <MathLabel>{String.raw`U_M\to U_R`}</MathLabel>, <MathLabel>{String.raw`\lambda_f`}</MathLabel> cresce. Prefixos conectados, com crescimento estrito nas amostras até a primeira interrupção; contatos de velocidade constante não são desenhados como rarefações.</p>
      <p>{selectedRarefactions.filter(b=>b.side==='left').length} arco(s) lento(s); {selectedRarefactions.filter(b=>b.side==='right').length} arco(s) rápido(s) retrospectivo(s).</p>
      {selectedRarefactions.map((b,i)=><p key={i}><b><MathLabel>{b.side==='left'?String.raw`\mathcal R_s(U_L)`:String.raw`\mathcal R_f^{\mathrm{back}}(U_R)`}</MathLabel></b> · <MathLabel>{String.raw`\lambda`}</MathLabel>: {b.speedStart.toPrecision(6)} → {b.speedEnd.toPrecision(6)} ao sair do estado de referência. Parada: {({'max-length':'limite numérico de comprimento','max-steps':'limite numérico de passos','hyperbolicity-boundary':'limite de hiperbolicidade da integração','non-strict-hyperbolicity':'hiperbolicidade estrita não verificada','speed-order-reversal':'inversão da velocidade nas amostras','strict-speed-order-unverified':'crescimento estrito não verificado','integration-tolerance':'tolerância da integração','sample-limit':'fim da amostragem'})[b.termination.reason]??b.termination.reason}.</p>)}
      <small>Verificação amostrada, sem certificação contínua de monotonicidade nem admissibilidade entrópica.</small>
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="points" open><summary>Pontos no espaço de estados</summary><div className="statePanelSectionBody">
      <p className="statePanelHint">Controles sincronizados com Variedade → Pontos. Os estados não recebem levantamentos 3D automáticos.</p>
      <StatePointVisibility pointVisibility={pointVisibility} onTogglePointVisibility={onTogglePointVisibility}/>
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="fields" open><summary>Campo de rarefação</summary><div className="statePanelSectionBody">
      <div className="stateVisualizationOption">
        <div className="stateVisibilityRow" style={{"--visibility-color":"#87cefa"}}>
          <span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal R_s,\,\mathcal R_f`}</MathLabel></strong><small>Curvas integrais</small></span>
          <VisibilityEye checked={showRarefactionField} onChange={()=>setShowRarefactionField(value=>!value)} aria-label="Campo de rarefação" />
        </div>
      </div>
      {rarefactionLayers.map(({id,label,tex,color})=><div key={id} className="stateVisibilityRow" style={{'--visibility-color':color}}>
        <span className="stateSwitchCopy"><strong><MathLabel>{tex}</MathLabel></strong><small>{label}</small></span>
        <VisibilityEye checked={Boolean(rarefactionVisibility[id])} aria-label={label}
          onChange={()=>setRarefactionVisibility(value=>({...value,[id]:!value[id]}))}/>
      </div>)}
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="fields" open><summary>Hiperbolicidade</summary><div className="statePanelSectionBody">
      <div className="stateVisualizationOption">
        <div className="stateVisibilityRow" style={{"--visibility-color":"#8da5b5"}}><span className="stateSwitchCopy"><strong>Hiperbolicidade</strong><small>Regiões de <MathLabel>{String.raw`\Delta`}</MathLabel> no plano</small></span><VisibilityEye checked={showDiscriminant} onChange={()=>setShowDiscriminant(value=>!value)} aria-label="Regiões de hiperbolicidade" /></div>
        {showDiscriminant&&<div className="stateDeltaLegend"><span><i className="stateDeltaBlue"/><MathLabel>{String.raw`\Delta>0`}</MathLabel></span><span><i className="stateDeltaRed"/><MathLabel>{String.raw`\Delta<0`}</MathLabel></span><span><i className="stateDeltaLine"/><MathLabel>{String.raw`\Delta=0`}</MathLabel></span><small>Contorno numérico aproximado; não indica admissibilidade.</small></div>}
        <details className="workspaceSubsection" hidden={!showDiscriminant}><summary>Verificações de Δ e levantamentos</summary><div className="workspaceSubsectionBody">
        {showDiscriminant&&coincidenceAudit&&<div className="stateDeltaLegend" role="status"><strong>Verificação <MathLabel>{String.raw`\mathcal E\Rightarrow\Delta=0`}</MathLabel></strong>{['minus','plus'].map(side=>{const a=coincidenceAudit[side];return <small key={side}><MathLabel>{side==='minus'?String.raw`\pi_-`:String.raw`\pi_+`}</MathLabel>: {a.inWindow} amostras na janela · {a.status==='no-samples'?'sem amostras para verificar':a.status==='sample-consistent'?`resíduos compatíveis (máx. ${a.maximumRelativeResidual.toExponential(2)})`:`${a.offLocus} amostras fora da tolerância (máx. ${a.maximumRelativeResidual.toExponential(2)})`}</small>})}<small>Diagnóstico numérico unidirecional: resíduos pequenos não demonstram que toda a curva Δ=0 esteja representada em 3D. A janela 3D pode limitar o levantamento.</small></div>}
        {showDiscriminant&&coincidenceCoverage&&<div className="stateDeltaLegend" role="status"><strong>Verificação <MathLabel>{String.raw`\Delta=0\Rightarrow\mathcal E`}</MathLabel></strong>{['minus','plus'].map(side=>{const a=coincidenceCoverage[side];return <small key={side}><MathLabel>{side==='minus'?String.raw`\pi_-`:String.raw`\pi_+`}</MathLabel>: {a.status==='no-contour'?'sem segmentos Δ=0 detectados':a.status==='no-lift'?`sem segmentos projetados de ℰ (${a.contourSegments} segmentos de Δ=0)`:`${a.covered}/${a.contourSegments} segmentos de Δ=0 próximos da projeção de ℰ`}</small>})}<small>Comparação por distância, tolerância de duas células da malha. Diagnóstico local e aproximado; não detecta zeros isolados nem certifica levantamento global.</small></div>}
        {showDiscriminant&&coincidenceLifts&&(coincidenceLifts.points.length>0||coincidenceLifts.globalWarning)&&<div className="stateDeltaLegend" role="status"><strong>Levantamentos característicos de <MathLabel>{String.raw`\Delta=0`}</MathLabel></strong>{coincidenceLifts.points.map((point,i)=><small key={i}>({point.u.toPrecision(5)}, {point.v.toPrecision(5)}) · {point.directionCount} direções · {point.interpretation}</small>)}{coincidenceLifts.globalWarning&&<small>{coincidenceLifts.globalWarning}</small>}<small>Diagnóstico algébrico local; não certifica a existência nem a regularidade de uma componente de ℰ.</small></div>}
        {showDiscriminant&&coincidenceIncidence&&<div className="stateDeltaLegend" role="status"><strong>Incidência característica ao longo de <MathLabel>{String.raw`\Delta=0`}</MathLabel></strong><small>{coincidenceIncidence.segments} segmentos amostrados · incidência reduzida regular: {coincidenceIncidence.counts.regular} · degenerada: {coincidenceIncidence.counts.degenerate} · matriz escalar: {coincidenceIncidence.counts.scalar} · indeterminada/sem direção: {coincidenceIncidence.counts.uncertain+coincidenceIncidence.counts.missing}.</small><small>Regularidade de G: {coincidenceIncidence.manifold.regular} regulares · {coincidenceIncidence.manifold.singular} com posto insuficiente · {coincidenceIncidence.manifold.uncertain} inconclusivos · {coincidenceIncidence.manifold.scalar} escalares.</small><small>Conferência das cartas: {coincidenceIncidence.chartChecks.consistent} concordantes · {coincidenceIncidence.chartChecks.singleChart} em carta única · {coincidenceIncidence.chartChecks.disagreement} divergentes · {coincidenceIncidence.chartChecks.offLevel} não verificáveis.</small>{coincidenceIncidence.examples.map((q,i)=><small key={i}>({q.u.toPrecision(5)}, {q.v.toPrecision(5)}) · {q.status} ({q.kind})</small>)}<small>Regularidade do nível desingularizado G=0: posto 2 em {coincidenceIncidence.manifold.regular} amostras · posto insuficiente em {coincidenceIncidence.manifold.singular} · inconclusivas em {coincidenceIncidence.manifold.uncertain} · jacobiano escalar em {coincidenceIncidence.manifold.scalar}.</small>{coincidenceIncidence.manifoldExamples.map((q,i)=><small key={`manifold-${i}`}>DG em ({q.u.toPrecision(5)}, {q.v.toPrecision(5)}): {q.kind} · postos {q.ranks.join(", ")}</small>)}<small>{coincidenceIncidence.limitation}</small></div>}
        {showDiscriminant&&coincidenceDegeneracies&&<div className="stateDeltaLegend" role="status"><strong>Degenerações de <MathLabel>{String.raw`\Delta=0`}</MathLabel></strong><small>Tipo algébrico: {coincidenceDegeneracies.type}.</small>{coincidenceDegeneracies.isolatedPoints.map((point,i)=><small key={i}>Zero isolado: ({point.u.toPrecision(5)}, {point.v.toPrecision(5)}) · {point.kind} · {point.inWindow?'na janela':'fora da janela'}. Não é detectado pelo contorno de mudança de sinal.</small>)}{coincidenceDegeneracies.warning&&<small>{coincidenceDegeneracies.warning}</small>}<small>Diagnóstico algébrico aproximado; não certifica o levantamento em ℰ nem resolve degenerações próximas à tolerância.</small></div>}
        </div></details>

      </div>
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="view" open><summary>Janela de visualização</summary><div className="statePanelSectionBody"><div className="stateViewportCompact"><p className="statePanelHint">Limites visíveis no plano <MathLabel>{String.raw`(u,v)`}</MathLabel>.</p><div className="stateViewportFieldGrid">{[['uMin','u_{min}'],['uMax','u_{max}'],['vMin','v_{min}'],['vMax','v_{max}']].map(([key,label])=><label key={key}><MathLabel>{label}</MathLabel><input type="number" step="any" value={windowText[key]} onChange={e=>{const raw=e.target.value;setWindowText(t=>({...t,[key]:raw}));const n=raw.trim()===''?null:finiteNumber(raw);if(n!==null){const next={...window,[key]:n};if(validWindow(next)){setWindow(next);setWindowSaved(false)}}}} onBlur={()=>commitBound(key)} onKeyDown={e=>onBoundKey(e,key)}/></label>)}</div><button type="button" className="stateViewportFit" onClick={fitGeometry}>Ajustar à geometria</button></div></div></details><details className="statePanelSection workspaceDisclosure" data-activity-section="view"><summary>Janela guardada</summary><div className="statePanelSectionBody"><div className="stateViewportCompact"><p className="statePanelHint">Guarde ou recupere os limites neste navegador.</p><button type="button" className="stateViewportFit" onClick={saveCurrentWindow} title="Guardar os limites atuais dos eixos u e v neste navegador">{windowSaved?'✓ Coordenadas guardadas':'Guardar coordenadas atuais'}</button><button type="button" className="stateViewportFit" onClick={restoreSavedWindow} title="Recuperar os limites dos eixos u e v guardados neste navegador">Recuperar coordenadas guardadas</button>{restoreMessage&&<small role="status" className="statePanelHint">{restoreMessage}</small>}</div></div></details>
      <details className="statePanelSection workspaceDisclosure" data-activity-section="chains" open>
        <summary>Seleção</summary>
        <div className="statePanelSectionBody chainPanelBody">
          {allProfiles.length>0&&<label className="chainPanelField">
            <span>Cadeia candidata</span>
            <select aria-label="Cadeia candidata para inspeção" value={activeProfile?selectedCandidateIndex:-1}
              onChange={e=>onSelectCandidate?.(Number(e.target.value))}>
              <option value={-1}>Selecione uma cadeia</option>
              {allProfiles.map((q,i)=><option key={i} value={i}>
                Cadeia {i+1} · {q.pattern??q.kind} · {candidateAssessments[i]?.status==='incompatible'?
                  'Incompatível':candidateAssessments[i]?.status==='validated'?'Validada · Liu':
                    candidateAssessments[i]?.status==='inconclusive'?'Inconclusiva':'Compatibilidade numérica'}
              </option>)}
            </select>
          </label>}
          <div className="chainPanelActions">
            <button type="button" disabled={!riemannStates?.left||!riemannStates?.right}
              onClick={()=>onBuildCandidates?.()}>Reconstruir candidatos</button>
            <small role="status">{!constructionRequested?'Defina os estados e construa a cadeia.':
              allProfiles.length===1?'1 candidato':allProfiles.length?`${allProfiles.length} candidatos`:'Nenhum candidato selecionável'}</small>
          </div>
        </div>
      </details>
      {activeProfile&&<details className="statePanelSection workspaceDisclosure chainPanelTrajectory" data-activity-section="chains" open>
        <summary>Estados e ondas</summary>
        <div className="statePanelSectionBody">
          <StateChainInspection candidate={activeProfile} geometry={chainGeometry} p={p} onSegmentFocus={setFocusedChainSegment}/>
        </div>
      </details>}
      <details className="statePanelSection workspaceDisclosure" data-activity-section="chains">
        <summary>Visualização</summary>
        <div className="statePanelSectionBody chainPanelBody">
          <SceneVisibilityRow label="Cadeia no gráfico" checked={showChain} disabled={!activeProfile}
            onChange={e=>setShowChain(e.target.checked)}/>
          <SceneVisibilityRow label="Ramos individuais" checked={exploreWaveBranches}
            onChange={e=>onChangeExploreWaveBranches?.(e.target.checked)}/>
          {activeProfile&&<>
            <SceneVisibilityRow label="Animar fluxo da cadeia" checked={animateCandidateFlow}
              disabled={!canAnimateShock&&!canAnimateRarefaction} onChange={e=>setAnimateCandidateFlow(e.target.checked)}/>
            {animateCandidateFlow&&<label className="chainPanelField">
              <span>Velocidade da animação</span>
              <select aria-label="Velocidade da animação da cadeia" value={candidateFlowSpeed}
                onChange={e=>setCandidateFlowSpeed(Number(e.target.value))} disabled={!canAnimateShock&&!canAnimateRarefaction}>
                <option value={0.5}>0,5×</option><option value={1}>1×</option>
                <option value={1.5}>1,5×</option><option value={2}>2×</option><option value={3}>3×</option>
              </select>
            </label>}
          </>}
        </div>
      </details>
      {activeProfile&&allProfiles.length>1&&<details className="statePanelSection workspaceDisclosure" data-activity-section="chains">
        <summary>Comparar cadeias</summary>
        <div className="statePanelSectionBody chainPanelBody">
          <label className="chainPanelField">
            <span>Segunda cadeia</span>
            <select aria-label="Comparar ondas de outra cadeia" value={comparisonIndex} onChange={e=>setComparisonIndex(Number(e.target.value))}>
              <option value={-1}>Nenhuma</option>
              {allProfiles.map((q,i)=><option key={i} value={i} disabled={i===selectedCandidateIndex}>Cadeia {i+1} · {q.pattern??q.kind}</option>)}
            </select>
          </label>
          {comparisonProfile&&comparisonIndex!==selectedCandidateIndex&&
            <StateChainInspection candidate={comparisonProfile} geometry={comparisonGeometry} p={p} label="Ondas da cadeia para comparação"/>}
        </div>
      </details>}
      <details className="statePanelSection workspaceDisclosure" data-activity-section="chains">
        <summary>Diagnósticos das buscas e limites</summary>
        <div className="statePanelSectionBody">
          <StateConstructionReports reports={reports} stateBranches={construction.stateBranches}/>
        </div>
      </details>
      </div></WorkspaceDrawer>
    <aside className="stateRightPanel workspacePanelDrawer" aria-label="Inspeção científica no painel esquerdo">
      <details className="stateRightDrawer" open><summary>Inspeção científica <span aria-hidden="true">◧</span></summary><div className="stateRightContent">
    <div className="stateSelectedSummary" aria-label="Estados selecionados"><strong>Estados no plano</strong>
      {fixedState?<div><span><MathLabel>{String.raw`U_*`}</MathLabel></span><output>({fixedState[0].toPrecision(5)}, {fixedState[1].toPrecision(5)})</output></div>:<small>Selecione <MathLabel>{String.raw`U_*`}</MathLabel> no gráfico para visualizar suas coordenadas.</small>}
      {['left','right'].map(side=>riemannStates?.[side]&&<div key={side}><span><MathLabel>{side==='left'?String.raw`U_L`:String.raw`U_R`}</MathLabel></span><output>({riemannStates[side][0].toPrecision(5)}, {riemannStates[side][1].toPrecision(5)})</output></div>)}
    </div>
    <div className="projectedCurveInspector" role="region" aria-label="Resultado da inspeção do gráfico"><div className="stateInspectionSummary"><b>Objeto selecionado</b><small>{selectedProjectedCurve?'Curva projetada em inspeção':inspectCurves?'Clique em uma curva para examinar seus dados.':'Use a ferramenta ◎ na barra do gráfico para inspecionar curvas.'}</small></div>{selectedProjectedCurve&&<div role="status"><b>{selectedProjectedCurve.kind}</b> · {selectedProjectedCurve.id} · {selectedProjectedCurve.branch??'família não informada'} · projeção {selectedProjectedCurve.sourceSide}{overlapHits.length>1&&<> · {overlapHits.length} curvas próximas <button type="button" onClick={()=>setSelectedCurveKey(current=>nextProjectedCurveHit(overlapHits.map(key=>({curve:{key}})),current))}>Próxima curva</button></>}<button type="button" onClick={()=>{setSelectedCurveKey(null);setOverlapHits([])}}>Limpar destaque</button></div>}{selectedProjectedCurve&&<details className="projectedCurveProvenance"><summary>Correspondência geométrica · diagnóstico da curva</summary>{selectedCurveSample&&<div className="projectedCurveSample"><small><b>Amostra {selectedCurveSample.index+1}</b> · estado variável ({selectedCurveSample.state.map(v=>v.toPrecision(6)).join(', ')}) · distância do clique {selectedCurveSample.distance.toFixed(1)} px</small>{sampledShockDiagnostic?.kind==='jump'&&<small>Rankine–Hugoniot: s={sampledShockDiagnostic.speed.toPrecision(6)} · resíduo relativo={sampledShockDiagnostic.relativeResidual.toExponential(2)} · {sampledShockDiagnostic.rankineHugoniot?'compatível na tolerância do diagnóstico':'não certificado na tolerância do diagnóstico'}. Levantamento 3D verificado separadamente abaixo.</small>}{sampledShockDiagnostic?.kind==='coincident'&&<small>Estados coincidentes: a velocidade de choque não é determinada por este par.</small>}</div>}{sampledWaveLift&&<div className="projectedCurveSample"><small><b>Levantamento na carta z:</b> {sampledWaveLift.kind==='regular'?`τ=${sampledWaveLift.tau.toPrecision(6)}, Y=${sampledWaveLift.Y.toPrecision(6)}, z=${sampledWaveLift.z.toPrecision(6)} · erro projeções=${sampledWaveLift.relativeProjectionError.toExponential(2)} · resíduo RH=${sampledWaveLift.relativeRHResidual.toExponential(2)}`:sampledWaveLift.kind==='not-certified'?`não certificado · erro projeções=${sampledWaveLift.relativeProjectionError.toExponential(2)} · resíduo RH=${sampledWaveLift.relativeRHResidual.toExponential(2)}`:`indisponível (${sampledWaveLift.kind})`}</small>{sampledWaveLift.kind==='regular'&&<button type="button" onClick={()=>onInspectWavePoint3D?.({tau:sampledWaveLift.tau,Y:sampledWaveLift.Y,zc:sampledWaveLift.zc})}>Inspecionar amostra na Variedade 3D</button>}</div>}{selectedCurveProvenance?<><small>{selectedCurveProvenance.source==='forward'?'A curva é uma amostra de π₊(ℋᶠᵒʳʷ(U*)). A fibra de origem tem π₋(P)=U*.':'A curva é uma amostra de π₋(ℋᵇᵃᶜᵏ(U*)). A fibra de origem tem π₊(P)=U*.'} A correspondência ponto a ponto com a curva 3D ainda não está implementada.</small><button type="button" onClick={()=>onInspectFibres3D?.(selectedCurveProvenance.fixedState)}>Ver fibras de origem em 3D</button></>:<small>Este traçado de rarefação foi calculado no plano. Ainda não há uma identificação ponto a ponto certificada com uma curva da variedade 3D; nenhuma origem 3D será presumida.</small>}</details>}</div>
    {projectedPair&&<div className="projectionPairComparison" role="group" aria-label="Comparar projeções do mesmo ponto tridimensional"><strong>Projeções de <MathLabel>{String.raw`P`}</MathLabel></strong><small>Escolha uma projeção para destacar seu estado no gráfico. O ponto <MathLabel>{String.raw`P`}</MathLabel> permanece selecionado na variedade.</small><button type="button" className={stateProjection==='minus'?'active':''} aria-pressed={stateProjection==='minus'} onClick={()=>setStateProjection('minus')}><MathLabel>{String.raw`\pi_-(P)`}</MathLabel> · ({projectedPair.minus.u.toPrecision(6)}, {projectedPair.minus.v.toPrecision(6)})</button><button type="button" className={stateProjection==='plus'?'active':''} aria-pressed={stateProjection==='plus'} onClick={()=>setStateProjection('plus')}><MathLabel>{String.raw`\pi_+(P)`}</MathLabel> · ({projectedPair.plus.u.toPrecision(6)}, {projectedPair.plus.v.toPrecision(6)})</button>{projectedPairCoincident&&<small>As duas projeções coincidem numericamente neste ponto.</small>}</div>}
    {requestedProjectionPoint&&<div className="projectionSelectedPoint" role="status"><strong><MathLabel>{stateProjection==='minus'?String.raw`\pi_-(P)=U_-`:String.raw`\pi_+(P)=U_+`}</MathLabel></strong> · ({requestedProjectionPoint.u.toPrecision(7)}, {requestedProjectionPoint.v.toPrecision(7)}){!requestedProjectionVisible&&<> · fora da janela atual <button type="button" onClick={()=>{const next={uMin:Math.min(window.uMin,requestedProjectionPoint.u-0.5),uMax:Math.max(window.uMax,requestedProjectionPoint.u+0.5),vMin:Math.min(window.vMin,requestedProjectionPoint.v-0.5),vMax:Math.max(window.vMax,requestedProjectionPoint.v+0.5)};setWindow(next);setWindowText(Object.fromEntries(Object.entries(next).map(([k,v])=>[k,String(v)])))}}>Incluir na janela</button></>}</div>}
      <details className="stateExtraDiagnostics"><summary>Informações e diagnósticos adicionais</summary><div className="stateExtraDiagnosticsContent">
    {placement&&<p className="stateWindowNotice" role="status">Posicionando <MathLabel>{placement==='left'?'U_L':'U_R'}</MathLabel> — mova o mouse sobre o plano, clique para fixar ou pressione Esc para cancelar.</p>}
    {riemannStates&&['left','right'].some(side=>{const state=riemannStates[side];if(!state)return false;const [u,v]=state;return u<view.uMin||u>view.uMax||v<view.vMin||v>view.vMax})&&<p className="stateWindowNotice">Um dos estados de Riemann está fora da janela atual. Ajuste os limites (u,v).</p>}
    {selected&&!selectedVisible&&<p className="stateWindowNotice">U* está fora da janela atual. Use valores de janela adequados para visualizá-lo; “Ajustar à geometria” mantém o foco nas curvas científicas.</p>}
    {stateRarefactions.some(branch=>branch.events.length>0)&&<p className="stateWindowNotice">Pontos amarelos: candidatos numéricos a <MathLabel>{String.raw`\nabla\lambda_i\cdot r_i=0`}</MathLabel> (amostras próximas de zero ou mudança de sinal refinada por bisseção no segmento amostrado). A derivada <MathLabel>{String.raw`s'(0)`}</MathLabel> nos tooltips é calculada na coincidência pela Hessiana do fluxo; não certifica contato com <MathLabel>{String.raw`S^\pm`}</MathLabel> para saltos finitos nem ondas compostas admissíveis.</p>}
    <p className="stateWindowNotice">Trechos candidatos com ordenação da velocidade característica: a partir de <MathLabel>{String.raw`U_L`}</MathLabel>, <MathLabel>{String.raw`\lambda`}</MathLabel> deve crescer. A partir de <MathLabel>{String.raw`U_R`}</MathLabel>, <MathLabel>{String.raw`\lambda`}</MathLabel> deve diminuir na direção de <MathLabel>{String.raw`U_M`}</MathLabel>. Laranja para <MathLabel>{String.raw`U_L`}</MathLabel>, verde para <MathLabel>{String.raw`U_R`}</MathLabel>, tracejado longo = lenta, curto = rápida. O filtro é necessário, mas não certifica admissibilidade nem uma solução de Riemann.</p>
    <section className="riemannDiagnosticLab" aria-label="Diagnósticos matemáticos do problema de Riemann">
      <header className="riemannLabHeader"><h3>Laboratório de análise numérica</h3><p>Os diagnósticos permanecem disponíveis sem ocupar a área principal do plano (u,v). Resultados numéricos não certificam admissibilidade entrópica.</p></header>
      <details className="riemannLabSection scientificDisclosure"><summary>Construção e verificação das cadeias <span>Rankine–Hugoniot · estados intermediários · ondas</span></summary><div className="riemannLabContent scientificDisclosureBody">
    <div className="stateProjectionControls" role="status"><div><b>Diagnóstico da conexão direta <MathLabel>{String.raw`U_L\to U_R`}</MathLabel></b><small>{directJump.kind==='missing-states'?'Posicione ambos os estados para examinar a condição de Rankine–Hugoniot.':directJump.kind==='coincident'?'Os estados coincidem; não há descontinuidade direta.':`Velocidade candidata s = ${directJump.speed.toPrecision(7)} · resíduo relativo RH = ${directJump.relativeResidual.toExponential(3)} · ${directJump.rankineHugoniot?'RH satisfeita':'RH não satisfeita'} · ${directJump.spectralStatus==='nonhyperbolic-endpoint'?'ao menos um extremo sem espectro real':'espectros reais nos extremos'}.`}</small><small>{directJump.kind==='jump'&&directJump.rankineHugoniot?`Configuração característica: ${directJump.configuration.label}.`:null}</small><small>Teste apenas de um salto direto: não constrói estado intermediário, não verifica entropia/Liu e não resolve o problema de Riemann.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Cadeias de duas ondas de choque — ordenação</b><small>Estados intermediários examinados: {shockCandidates.length}; Rankine–Hugoniot nos dois saltos e velocidades estritamente ordenadas: {shockCandidates.filter(q=>q.chainEvidence.status==='ordered-rh-candidate').length}; demais candidatos: {shockCandidates.filter(q=>q.chainEvidence.status!=='ordered-rh-candidate').length}. Com famílias estritas lenta → rápida e desigualdades de Lax nos extremos: {shockCandidates.filter(q=>q.familyEvidence.status==='ordered-lax-endpoint-candidate').length}. São verificações necessárias, não certificações entrópicas ou soluções do problema de Riemann.</small></div></div>
    <RarefactionSearchReport report={rarefactionSearch.report}/>
    <div className="stateProjectionControls" role="status"><div><b>Perfis autossimilares candidatos U(x/t)</b><small>Dois choques: {profileCandidates.twoShock.length}; rarefação–choque ou choque–rarefação: {profileCandidates.mixed.length}; duas rarefações: {rarefactionPairs.length}; cadeias com contato: {contactChains.length}; pares com composta: {compositeChains.length}. Perfis por partes com estados constantes, saltos e leques interpolados em velocidade característica. A construção é amostrada e não certifica admissibilidade entrópica nem seleciona uma solução única.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Cadeias com contatos linearmente degenerados</b><small>RC: {contactChains.filter(q=>q.pattern==='RC').length}; SC: {contactChains.filter(q=>q.pattern==='SC').length}; CR: {contactChains.filter(q=>q.pattern==='CR').length}; CS: {contactChains.filter(q=>q.pattern==='CS').length}; CC: {contactChains.filter(q=>q.pattern==='CC').length}. Esta busca cobre contatos com direção própria e velocidade constantes. Uma igualdade isolada <MathLabel>{String.raw`s=\lambda`}</MathLabel> não define um contato. Ausência de candidatos não prova inexistência.</small></div></div><div className="stateProjectionControls" role="status"><div><b>Pares com bloco composto K</b><small>{compositeChains.length} candidatos encontrados nas curvas amostradas. Busca de RK, SK, CK, KR, KS, KC e KK, com K lento rarefação–choque e K rápido choque–rarefação. Cada segmento e junção sônica é verificado separadamente. Os critérios de Lax usados nos choques sônicos são não estritos; Liu e seleção cinética não são certificados.</small></div></div><div className="stateProjectionControls" role="status"><div><b>Cadeias mistas com <MathLabel>{String.raw`U_M`}</MathLabel> — rarefação e choque</b><small>Interseções aproximadas: {mixedCandidates.length}; rarefação lenta → choque rápido: {mixedCandidates.filter(q=>q.kind==='rarefaction-shock'&&q.family==='slow').length}; choque lento → rarefação rápida: {mixedCandidates.filter(q=>q.kind==='shock-rarefaction'&&q.family==='fast').length}; candidatos com RH, velocidades ordenadas e Lax estrito: {mixedCandidates.filter(q=>q.evidence.status==='mixed-ordered-lax-candidate').length}. Liu nas cadeias mistas: {mixedLiuCandidates.filter(q=>q.liu.status==='liu-violation-detected').length} violações amostradas; {mixedLiuCandidates.filter(q=>q.liu.status==='no-sampled-violation').length} sem violação nas amostras; {mixedLiuCandidates.filter(q=>q.liu.status!=='liu-violation-detected'&&q.liu.status!=='no-sampled-violation').length} não concluídos. Sem certificação entrópica.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Interseções das Hugoniot — candidatos a <MathLabel>{String.raw`U_M`}</MathLabel></b><small>{!riemannStates?.left||!riemannStates?.right?'Posicione U_L e U_R para procurar estados intermediários.':`${shockCandidates.length} interseção(ões) encontradas nas poligonais amostradas.`} A ausência de interseções não prova inexistência de solução.</small>{shockCandidates.slice(0,5).map((q,i)=><small key={i}><MathLabel>{`U_{M,${i+1}}=`}</MathLabel> ({q.middle[0].toPrecision(6)}, {q.middle[1].toPrecision(6)}) · <MathLabel>{String.raw`s_1=`}</MathLabel>{q.first.speed.toPrecision(5)} · <MathLabel>{String.raw`s_2=`}</MathLabel>{q.second.speed.toPrecision(5)} · {q.ordered?<MathLabel>{String.raw`s_1<s_2`}</MathLabel>:'velocidades fora de ordem'} · {q.rhBoth?'RH numérica satisfeita':'RH numérica não satisfeita'}</small>)}<small>Interseções geométricas de duas curvas de choque amostradas; não verifica entropia, famílias características, perfis viscosos nem conexões por rarefação.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Contato sônico de amplitude finita — candidatos</b><small>Hugoniot forward de <MathLabel>{String.raw`U_L`}</MathLabel> em <MathLabel>{String.raw`S^+\ (s=\lambda(U_+))`}</MathLabel>. Hugoniot backward de <MathLabel>{String.raw`U_R`}</MathLabel> em <MathLabel>{String.raw`S^-\ (s=\lambda(U_-))`}</MathLabel>. Ocorrências sônicas amostradas: forward {finiteContacts.left.filter(e=>e.kind!=='constant-contact-continuum').length}; backward {finiteContacts.right.filter(e=>e.kind!=='constant-contact-continuum').length}. Famílias de contatos constantes: {[...finiteContacts.left,...finiteContacts.right].filter(e=>e.kind==='constant-contact-continuum').length} trecho(s) amostrado(s); não são raízes sônicas isoladas. Refinados numericamente: {finiteContacts.left.filter(e=>e.refinement.status==='converged').length} forward; {finiteContacts.right.filter(e=>e.refinement.status==='converged').length} backward. Raízes sem isolamento verificado: {[...finiteContacts.left,...finiteContacts.right].filter(e=>e.refinement.status==='non-isolated-or-singular-root'||e.refinement.status==='isolation-unverified').length}; sem continuação isolada. Não certifica admissibilidade.</small></div></div>
      </div></details>
      <details className="riemannLabSection scientificDisclosure"><summary>Admissibilidade e conexões compostas <span>Lax · Liu · contatos sônicos</span></summary><div className="riemannLabContent scientificDisclosureBody">
    <div className="stateProjectionControls" role="status"><div><b>Liu — Hugoniot forward amostrada</b><small>Contatos examinados: {forwardLiu.length}; arcos orientados localizados: {forwardLiu.filter(q=>q.arcStatus==='sampled-arc').length}; compatíveis nas amostras: {forwardLiu.filter(q=>q.status==='sampled-liu-compatible').length}; violações: {forwardLiu.filter(q=>q.status==='sampled-liu-violation').length}. Arcos não resolvidos não são considerados admissíveis. Sem certificação global.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Liu — arcos continuados por sementes</b><small>Contatos examinados: {seededForwardLiu.length}; violações numéricas detectadas: {seededForwardLiu.filter(q=>q.assessment?.status==='liu-violation-detected').length}; sem violação encontrada nos testes finitos: {seededForwardLiu.filter(q=>q.assessment?.status==='no-liu-violation-detected').length}; inconclusivos ou sem arco: {seededForwardLiu.filter(q=>!q.assessment||q.assessment.status==='liu-inconclusive').length}. Nenhum resultado certifica Liu global ou admissibilidade entrópica.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Hugoniot backward — continuação direta</b><small>Contatos sônicos refinados examinados: {seededBackwardArcs.length}; arcos conectados numericamente: {seededBackwardArcs.filter(q=>q.status==='backward-arc-numerically-connected').length}; não resolvidos: {seededBackwardArcs.filter(q=>q.status!=='backward-arc-numerically-connected').length}. A continuação fixa <MathLabel>{String.raw`U_R`}</MathLabel> e varia <MathLabel>{String.raw`U_-`}</MathLabel>. A condição de Liu backward é avaliada separadamente abaixo; não há certificação de admissibilidade.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Liu — Hugoniot backward amostrada</b><small>Contatos examinados: {backwardLiu.length}; violações detectadas: {backwardLiu.filter(q=>q.status==='preliminary-sampled-backward-liu-violation').length}; sem violação nas amostras: {backwardLiu.filter(q=>q.status==='preliminary-sampled-backward-liu-compatible').length}; inconclusivos: {backwardLiu.filter(q=>!q.status?.startsWith('preliminary-sampled-backward-liu-')).length}. A desigualdade backward é inversa à forward, com <MathLabel>{String.raw`U_R`}</MathLabel> fixo. Não certifica Liu global nem entropia.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Ondas compostas — critérios unificados</b><small>Choque–rarefação: {compositeLiu.filter(q=>q.evidence.orientation==='forward').length}; rarefação–choque: {compositeLiu.filter(q=>q.evidence.orientation==='backward').length}. Ordenação geométrica: {compositeLiu.filter(q=>q.evidence.geometricOrdering==='compatible-in-sampled-trajectory').length}; Lax fraco nos extremos: {compositeLiu.filter(q=>q.evidence.weakLax==='satisfied-at-endpoints').length}; violação de Liu detectada: {compositeLiu.filter(q=>q.evidence.classification==='numerical-liu-violation').length}; sem violação nos testes finitos: {compositeLiu.filter(q=>q.evidence.classification==='no-violation-in-finite-tests').length}. Nenhuma onda é certificada entrópica.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Liu — seleção preliminar das ondas compostas</b><small>Conexões choque–rarefação com Lax fraco e violação de Liu detectada: {compositeLiu.filter(q=>q.liuStatus==='violation-detected').length}; sem violação detectada nos testes finitos: {compositeLiu.filter(q=>q.liuStatus==='no-violation-detected').length}; inconclusivas: {compositeLiu.filter(q=>q.liuStatus==='inconclusive').length}. Ambas as orientações são verificadas com seus próprios arcos; nenhuma conexão é certificada admissível.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Conexões choque–rarefação / rarefação–choque</b><small>Contatos sônicos refinados projetados em arcos característicos reintegrados por RK4: {sonicConnections.filter(q=>['ordered-geometric-candidate','weak-lax-candidate'].includes(q.status)).length} coincidências com ordenação característica; {sonicConnections.filter(q=>q.status==='weak-lax-candidate').length} também satisfazem as desigualdades fracas de Lax nos extremos. Diagnóstico necessário, sem certificação entrópica ou solução completa.</small></div></div>
      </div></details>
      <details className="riemannLabSection scientificDisclosure"><summary>Geometria espectral <span>Característica <MathLabel>{String.raw`\mathcal C`}</MathLabel> · levantamentos</span></summary><div className="riemannLabContent scientificDisclosureBody">
    <div className="stateProjectionControls" role="status"><div><b>Hugoniot ∩ característica 𝒞 — diagnóstico espectral</b>
      {['forward','backward'].map(role=>{const q=characteristicIntersections[role];const title=role==='forward'?String.raw`\mathcal H^{\mathrm{forw}}(U_L)\cap\mathcal C`:String.raw`\mathcal H^{\mathrm{back}}(U_R)\cap\mathcal C`;return <div key={role}><small><strong><MathLabel>{title}</MathLabel></strong>: {q.kind==='missing-state'?'posicione o estado':q.kind==='elliptic'?'região elíptica: nenhuma direção característica real':q.kind==='scalar-degenerate'?'Jacobiano escalar: todas as direções são características':q.kind==='repeated-defective'?'autovalor real duplo: uma direção projetiva':`duas direções reais (${q.directions.length})`}</small>{q.directions.map((d,i)=><small key={i}>{d.branch==='slow'?'𝒞_s':d.branch==='fast'?'𝒞_f':'autovalor duplo'} · {d.chart==='finite'?`z=${d.z.toPrecision(6)}`:'Z=0 (carta recíproca)'} · λ={d.speed.toPrecision(6)} · resíduo={d.eigenResidual.toExponential(2)} · raiz {d.projectiveContact==='multiple'?'múltipla':'simples'} · derivada angular={d.projectiveDerivative.toExponential(2)} · incidência {d.incidenceRegularity==='regular'?'regular':'degenerada'} · posto DG={d.boundary.rank}/2 · {d.boundary.regularLevelSet?'nível regular':'regularidade não certificada'} · dimensão fibra {role==='forward'?d.boundary.forwardFibreDimension??'—':d.boundary.backwardFibreDimension??'—'} · fibra × 𝒞 {d.boundary.transversality.classification==='transverse'?'transversal':d.boundary.transversality.classification==='tangent'?'tangente em primeira ordem':'indeterminada'}</small>)}</div>})}
      <small>Classificação algébrica dos levantamentos característicos na coincidência (Y=0), inclusive a direção no infinito projetivo. A multiplicidade refere-se à equação projetiva de autovetores, não certifica tangência geométrica da fibra regular. Regularidade e transversalidade referem-se somente à incidência reduzida q(U,[r])=0; o posto DG na fronteira característica certifica apenas a regularidade local do nível desingularizado; não certifica tangência da fibra com a característica nem admissibilidade. Não é uma contagem certificada de interseções da curva regular amostrada, nem teste de admissibilidade.</small></div></div>
      </div></details>
      <details className="riemannLabSection scientificDisclosure"><summary>Condicionamento, convergência e sensibilidade <span>Ferramentas avançadas de <MathLabel>{String.raw`U_M`}</MathLabel></span></summary><div className="riemannLabContent scientificDisclosureBody">
    {activeProfile&&allProfiles.length>1&&<div className="stateProjectionControls"><div><b>Comparar sensibilidade entre cadeias</b><small>Comparação local de raízes na projeção atual; cada cadeia conserva seu próprio ramo e segmento de Hugoniot. Diferenças de derivadas não significam equivalência geométrica.</small></div><label>Segunda cadeia <select aria-label="Segunda cadeia para comparação de sensibilidade" value={comparisonIndex} onChange={e=>setComparisonIndex(Number(e.target.value))}><option value={-1}>Não comparar</option>{allProfiles.map((q,i)=><option key={i} value={i} disabled={i===selectedCandidateIndex}>Cadeia {i+1} · {q.kind}</option>)}</select></label>{comparisonIndex>=0&&(comparisonIndex===selectedCandidateIndex?<small>Selecione duas cadeias distintas.</small>:sensitivityComparison.status==='unavailable'?<small>Diagnósticos não disponíveis para ambas as cadeias nesta projeção. Nenhum valor foi presumido.</small>:<div style={{overflowX:'auto'}}><small>{sensitivityComparison.comparableCount} de {sensitivityComparison.rows.length} derivadas centrais comparáveis. Maior diferença absoluta observada: {sensitivityComparison.comparableCount?sensitivityComparison.largestDerivativeDifference.toExponential(3):'não disponível'}.</small><table style={{width:'100%',fontSize:'0.8rem',borderCollapse:'collapse',textAlign:'right'}}><thead><tr><th scope="col">Coeficiente</th><th scope="col"><MathLabel>{String.raw`dt/dp`}</MathLabel> · selecionada</th><th scope="col"><MathLabel>{String.raw`dt/dp`}</MathLabel> · comparação</th><th scope="col">Diferença</th></tr></thead><tbody>{sensitivityComparison.rows.map(r=><tr key={r.coefficient}><th scope="row" style={{textAlign:'left'}}>{r.coefficient}</th><td>{r.derivativeA===null?'inconclusivo':r.derivativeA.toExponential(3)}</td><td>{r.derivativeB===null?'inconclusivo':r.derivativeB.toExponential(3)}</td><td>{r.difference===null?'—':r.difference.toExponential(3)}</td></tr>)}</tbody></table><small>t é o parâmetro de cada segmento amostrado, não o tempo físico. Segmentos diferentes têm parametrizações distintas; diferenças entre dt/dp não são medidas invariantes de sensibilidade de U_M.</small><small><b>Comparação nas coordenadas (u,v):</b> {coordinateComparison.comparableCount} coeficientes com derivadas disponíveis em ambas as cadeias.</small><table style={{width:'100%',fontSize:'0.8rem',borderCollapse:'collapse',textAlign:'right'}}><thead><tr><th scope="col">Coeficiente</th><th scope="col">d(u,v)/dp · selecionada</th><th scope="col">d(u,v)/dp · comparação</th><th scope="col">Diferença (u,v)</th></tr></thead><tbody>{coordinateComparison.rows.map(r=><tr key={r.coefficient}><th scope="row" style={{textAlign:'left'}}>{r.coefficient}</th>{[r.derivativeA,r.derivativeB,r.difference].map((v,i)=><td key={i}>{v?`(${v[0].toExponential(2)}, ${v[1].toExponential(2)})`:'inconclusivo'}</td>)}</tr>)}</tbody></table><small>As derivadas em (u,v) correspondem à raiz acompanhada em cada segmento de Hugoniot mantido fixo. Não representam a derivada do estado intermediário obtido por reconstrução integral da cadeia após perturbar o fluxo; não constituem medida de estabilidade entrópica.</small></div>)}</div>}
    {mixedMiddleSensitivity&&<div className="stateProjectionControls"><div><b>Sensibilidade reconstruída de U_M — cadeia mista</b><small>O ramo característico é reintegrado para cada perturbação do fluxo, mantendo U_L e U_R fixos. A interseção com o locus de Hugoniot é localizada numericamente; raízes não identificadas ou ambíguas permanecem inconclusivas. Sem certificação entrópica.</small></div><small><b>Transversalidade local:</b> {mixedMiddleSensitivity.transversality?.angleIndicator!==null&&Number.isFinite(mixedMiddleSensitivity.transversality?.angleIndicator)?`${mixedMiddleSensitivity.transversality.status==='near-tangential-numerical'?'quase tangencial':'transversal numérica'} · |cos(ângulo entre ∇D e tangente)| = ${mixedMiddleSensitivity.transversality.angleIndicator.toExponential(3)}`:`não determinada (${mixedMiddleSensitivity.transversality?.status??mixedMiddleSensitivity.status})`}. Indicador calculado com a direção característica local em U_M; não certifica tangência exata nem bifurcação.</small><small><b>Erro angular da poligonal:</b> {Number.isFinite(mixedMiddleSensitivity.chordError?.angleDegrees)?`${mixedMiddleSensitivity.chordError.angleDegrees.toFixed(3)}° entre a corda amostrada e a direção característica em U_M · ${mixedMiddleSensitivity.chordError.status==='aligned-numerical'?'alinhamento numérico':'discrepância angular'}`:`indisponível (${mixedMiddleSensitivity.chordError?.status??'sem diagnóstico'})`}. Ângulo não orientado, de 0° a 90°; não representa erro certificado da curva integral.</small><details><summary>Convergência angular ao refinar o passo da rarefação</summary><small>Reintegração do mesmo ramo, com passos sucessivamente reduzidos. Cada corda é localizada pela proximidade ao U_M de referência; não há reconstrução da interseção de Hugoniot em cada nível nem estimativa rigorosa de convergência.</small><div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:'0.8rem'}}><thead><tr><th>Passo máximo</th><th>Ângulo</th><th>Distância a U_M</th><th>Estado</th></tr></thead><tbody>{(mixedMiddleSensitivity.angularConvergence?.rows??[]).map((r,i)=><tr key={i}><td>{r.step.toExponential(2)}</td><td>{Number.isFinite(r.angleDegrees)?`${r.angleDegrees.toFixed(4)}°`:'—'}</td><td>{Number.isFinite(r.distanceToMiddle)?r.distanceToMiddle.toExponential(2):'—'}</td><td>{r.status}</td></tr>)}</tbody></table></div><small>Resultado: {mixedMiddleSensitivity.angularConvergence?.status??'não disponível'}. A redução do ângulo é apenas evidência numérica local.</small></details><details><summary>Convergência da posição de U_M · rarefação e Hugoniot</summary><small>Cada nível reintegra a rarefação e resolve novamente a incidência de Rankine–Hugoniot nos segmentos amostrados. A raiz deve ser única na vizinhança de referência; não há prova de convergência ou admissibilidade.</small><div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:'0.8rem'}}><thead><tr><th>Passo</th><th><MathLabel>{String.raw`u_M`}</MathLabel></th><th><MathLabel>{String.raw`v_M`}</MathLabel></th><th>Distância à referência</th><th>Resíduo RH</th><th>Estado</th></tr></thead><tbody>{(mixedMiddleSensitivity.middleConvergence?.rows??[]).map((r,i)=><tr key={i}><td>{r.step.toExponential(2)}</td><td>{r.middle?r.middle[0].toFixed(6):'—'}</td><td>{r.middle?r.middle[1].toFixed(6):'—'}</td><td>{Number.isFinite(r.distanceToReference)?r.distanceToReference.toExponential(2):'—'}</td><td>{Number.isFinite(r.residual)?r.residual.toExponential(2):'—'}</td><td>{r.status}</td></tr>)}</tbody></table></div><small>Resultado: {mixedMiddleSensitivity.middleConvergence?.status??'não disponível'}. Diferenças sucessivas: {(mixedMiddleSensitivity.middleConvergence?.successiveDistances??[]).map(v=>v.toExponential(2)).join(' · ')||'—'}. Ordem observada: {(mixedMiddleSensitivity.middleConvergenceOrder?.orders??[]).map(r=>r.status==='estimated'?r.value.toFixed(2):'indeterminada').join(' · ')||'—'}. Acompanhamento do ramo: {mixedMiddleSensitivity.middleConvergenceOrder?.branchStatus??'não determinado'}. Estimativas baseadas em diferenças entre malhas, sem prova de convergência nem identificação global do ramo.</small></details>{mixedMiddleSensitivity.rows.length?<details><summary>Derivadas por coeficiente · {mixedMiddleSensitivity.rows.filter(r=>r.derivative).length}/10 acompanhamentos bilaterais</summary><div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:'0.8rem'}}><thead><tr><th>Coeficiente</th><th><MathLabel>{String.raw`\partial u_M/\partial p`}</MathLabel></th><th><MathLabel>{String.raw`\partial v_M/\partial p`}</MathLabel></th><th>Estado</th></tr></thead><tbody>{mixedMiddleSensitivity.rows.map(r=><tr key={r.coefficient}><th>{r.coefficient}</th><td>{r.derivative?r.derivative[0].toExponential(3):'—'}</td><td>{r.derivative?r.derivative[1].toExponential(3):'—'}</td><td>{r.derivative?'acompanhado':`${r.negative.status} / ${r.positive.status}`}</td></tr>)}</tbody></table></div></details>:<small>Reconstrução não disponível: {mixedMiddleSensitivity.status}.</small>}</div>}
    {implicitMiddleSensitivity&&<div className="stateProjectionControls"><div><b>Sensibilidade implícita de U_M — dois choques</b><small>Interseção local dos loci D(U_L,U_M)=0 e D(U_M,U_R)=0, mantendo U_L e U_R fixos. Não é reconstrução global dos ramos nem certificação entrópica.</small></div>{implicitMiddleSensitivity.status==='local-implicit-derivative'?<details><summary>Derivadas locais por coeficiente (10) · determinante normalizado {implicitMiddleSensitivity.normalizedDeterminant.toExponential(2)}</summary><div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:'0.8rem'}}><thead><tr><th>Coeficiente</th><th><MathLabel>{String.raw`\partial u_M/\partial p`}</MathLabel></th><th><MathLabel>{String.raw`\partial v_M/\partial p`}</MathLabel></th></tr></thead><tbody>{implicitMiddleSensitivity.rows.map(r=><tr key={r.coefficient}><th>{r.coefficient}</th><td>{r.derivative[0].toExponential(3)}</td><td>{r.derivative[1].toExponential(3)}</td></tr>)}</tbody></table></div></details>:<small>Derivadas não disponíveis: {implicitMiddleSensitivity.status}. Interseção degenerada ou condições RH não verificadas.</small>}</div>}
      </div></details>
      <details className="riemannLabSection scientificDisclosure"><summary>Proveniência geométrica <span>Ramos e trechos de Hugoniot</span></summary><div className="riemannLabContent scientificDisclosureBody">
    {activeProfile&&<div className="stateProjectionControls" role="status"><div><b>Trecho da Hugoniot associado a <MathLabel>{String.raw`U_M`}</MathLabel></b><small>{activeHugoniotArc?`Destacado em amarelo na projeção ${stateProjection==='plus'?'π₊ (Hugoniot forward de U_L)':'π₋ (Hugoniot backward de U_R)'}. ${activeHugoniotArc.refinement==='rankine-hugoniot-segment'?'Extremo corrigido numericamente por Rankine–Hugoniot no segmento amostrado':'Extremo interpolado geometricamente'}; desvio máximo dos extremos: ${activeHugoniotArc.endpointError.toExponential(2)}. ${activeHugoniotArc.rankineHugoniotRelativeResidual!==null?`Resíduo relativo RH: ${activeHugoniotArc.rankineHugoniotRelativeResidual.toExponential(2)}.`:''} A curva entre os vértices continua amostrada, não certificada.`:'Nenhum trecho da Hugoniot foi identificado nesta projeção com a tolerância visual atual. Para uma cadeia mista, a onda desta projeção também pode ser uma rarefação.'} O leque de rarefação selecionado permanece destacado em azul. Trechos de onda não reconstruídos não são substituídos por retas entre os estados. Não há certificação entrópica.</small>{activeHugoniotArc&&<div className="rhRootDiagnostics"><small><b>Condicionamento da raiz:</b> {activeHugoniotArc.rootCondition==='transverse-numerical'?'transversal numérica':activeHugoniotArc.rootCondition==='near-tangential'?'quase tangencial':activeHugoniotArc.rootCondition==='segment-contained'?'segmento contido no locus':'não avaliado'} · inclinação normalizada: {Number.isFinite(activeHugoniotArc.normalizedDeterminantSlope)?activeHugoniotArc.normalizedDeterminantSlope.toExponential(3):'não disponível'} · distância paramétrica à raiz vizinha: {Number.isFinite(activeHugoniotArc.nearestRootParameterDistance)?activeHugoniotArc.nearestRootParameterDistance.toExponential(3):'não detectada'}.</small><small><b>Sensibilidade aos coeficientes:</b> {activeHugoniotArc.coefficientSensitivity?`${activeHugoniotArc.coefficientSensitivity.status==='locally-tracked'?'raízes acompanhadas localmente':'acompanhamento inconclusivo'} · maior deslocamento de parâmetro: ${Number.isFinite(activeHugoniotArc.coefficientSensitivity.maximumParameterShift)?activeHugoniotArc.coefficientSensitivity.maximumParameterShift.toExponential(3):'não disponível'} · perturbações sem raiz identificada: ${activeHugoniotArc.coefficientSensitivity.missingPerturbedRoots}`:'não avaliada'}.</small>{activeHugoniotArc.coefficientSensitivity?.trials?.length>0&&<details className="rhSensitivityDetails"><summary>Inspecionar perturbações por coeficiente ({activeHugoniotArc.coefficientSensitivity.trials.length})</summary><RiemannSensitivityPlot trials={activeHugoniotArc.coefficientSensitivity.trials}/><div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:'0.8rem',borderCollapse:'collapse',textAlign:'right'}}><thead><tr><th scope="col">Coeficiente</th><th scope="col">Passo h</th><th scope="col">Δt (−h)</th><th scope="col">Δt (+h)</th><th scope="col"><MathLabel>{String.raw`dt/dp`}</MathLabel> (central)</th></tr></thead><tbody>{activeHugoniotArc.coefficientSensitivity.trials.map(trial=><tr key={trial.coefficient}><th scope="row" style={{textAlign:'left'}}>{trial.coefficient}</th><td>{Number.isFinite(trial.step)?trial.step.toExponential(2):'—'}</td><td>{Number.isFinite(trial.minus)?trial.minus.toExponential(3):'não identificada'}</td><td>{Number.isFinite(trial.plus)?trial.plus.toExponential(3):'não identificada'}</td><td>{Number.isFinite(trial.centralDerivative)?trial.centralDerivative.toExponential(3):'inconclusivo'}</td></tr>)}</tbody></table></div><small>Δt é o deslocamento do parâmetro no segmento amostrado, não uma variação de tempo físico. A derivada central só é exibida quando ambas as raízes perturbadas foram acompanhadas.</small></details>}<small>Indicadores dependentes da escala, da tolerância e do passo de perturbação; não constituem prova de bifurcação, transversalidade exata ou admissibilidade entrópica.</small></div>}</div></div>}
    {activeProfile?.provenance&&<div className="stateProjectionControls" role="status"><div><b>Origem geométrica de cada onda</b><small>Dados do ramo usado na construção numérica da cadeia selecionada; não constituem prova de admissibilidade.</small>{activeProfile.provenance.waves.map((wave,i)=><p key={i}><b>{i+1}. {wave.type==='shock'?'Choque':wave.type==='contact'?'Contato':'Rarefação'} {wave.family==='slow'?'lento':'rápido'}</b> · <MathLabel>{String.raw`${wave.from}\to ${wave.to}`}</MathLabel> · {wave.origin==='forward-hugoniot'?'RH progressiva com U_L fixo':wave.origin==='backward-hugoniot'?'RH retrospectiva com U_R fixo':wave.type==='contact'?'modelo de contato constante':wave.type==='shock'?'equações RH e sônicas nos estados':'ramo característico amostrado'}{wave.segment!=null?` · trecho ${wave.segment}`:''}{wave.branchIndex!=null?` · segmento do leque ${wave.branchIndex}`:''}{Number.isFinite(wave.speed)?<> · <MathLabel>s=</MathLabel> {wave.speed.toPrecision(5)}</>:''}{Number.isFinite(wave.speedStart)&&Number.isFinite(wave.speedEnd)?<> · <MathLabel>{String.raw`\lambda`}</MathLabel>: {wave.speedStart.toPrecision(5)} → {wave.speedEnd.toPrecision(5)}</>:''}</p>)}<small>Junção: {activeProfile.provenance.intersection==='sampled-hugoniot-intersection'?'interseção de curvas RH amostradas':'fechamento numérico dos blocos nos estados'}. {activeProfile.provenance.refinementStatus?`Refinamento: ${activeProfile.provenance.refinementStatus}. `:''}As conexões de choque não são trajetórias integrais.</small></div></div>}
      </div></details>
    </section>
    <div className="stateInspectionToggle"><label className="toggle"><input type="checkbox" checked={showInspectedState} onChange={e=>setShowInspectedState(e.target.checked)}/> mostrar projeção do ponto P atualmente inspecionado em 𝒲</label><small>Os estados <MathLabel>{String.raw`U_-,\bar U,U_+`}</MathLabel> vêm da inspeção 3D. A seleção de <MathLabel>{String.raw`U_*`}</MathLabel> e a janela <MathLabel>{String.raw`(u,v)`}</MathLabel> são independentes.</small></div>
    <div className="localChartLegend"><span><MathLabel>{String.raw`\mathcal R_s`}</MathLabel>: projeção de <MathLabel>{String.raw`\mathcal C_s`}</MathLabel></span><span><MathLabel>{String.raw`\mathcal R_f`}</MathLabel>: projeção de <MathLabel>{String.raw`\mathcal C_f`}</MathLabel></span>{showInspectedState&&g.projection&&<><span>π₋(P)=U₋=({minus.u.toFixed(5)}, {minus.v.toFixed(5)})</span><span>π₊(P)=U₊=({plus.u.toFixed(5)}, {plus.v.toFixed(5)})</span><span>Ū=({mean.u.toFixed(5)}, {mean.v.toFixed(5)})</span><span>s={Number.isFinite(speed)?speed.toFixed(6):'—'}</span></>}</div>
    <p className="localChartNote"><b>Projeção explícita:</b> <MathLabel>{String.raw`U_*`}</MathLabel> pertence ao espaço de estados. Em <MathLabel>{String.raw`\pi_-`}</MathLabel>, a fibra forward se projeta no ponto <MathLabel>{String.raw`U_*`}</MathLabel> e a backward gera a curva de <MathLabel>{String.raw`U_-`}</MathLabel>. Em <MathLabel>{String.raw`\pi_+`}</MathLabel>, a fibra backward se projeta em <MathLabel>{String.raw`U_*`}</MathLabel> e a forward gera a curva de <MathLabel>{String.raw`U_+`}</MathLabel>. A curva preserva a classificação de Lax calculada em <MathLabel>{String.raw`\mathcal W`}</MathLabel>. A seleção de <MathLabel>{String.raw`P\in\mathcal W`}</MathLabel> é independente.</p>
      </div></details>
      </div></details>
    </aside>
    <div className="stateGraphStage" style={{position:"relative"}}>
      <WorkspaceToolbar label="ferramentas 2D"><div className="workspaceToolbarActions" role="toolbar" aria-label="Ferramentas de navegação do gráfico 2D"><div className="workspaceToolbarGroup" role="group" aria-label="Seleção e zoom">
        <button type="button" title="Selecionar estados no plano" aria-label="Selecionar estados" aria-pressed={!panMode&&!inspectCurves&&!selectStarMode&&!boxZoomMode} className={!panMode&&!inspectCurves&&!selectStarMode&&!boxZoomMode?'active':''} onClick={()=>{setPanMode(false);setBoxZoomMode(false);setInspectCurves(false);setSelectStarMode(false);setOverlapHits([])}}>↖</button>
        <button type="button" title="Ativar seleção de U* no gráfico: clique para fixar o estado; Esc cancela" aria-label="Selecionar U estrela no gráfico" aria-pressed={selectStarMode} className={selectStarMode?'active':''} onClick={()=>{setSelectStarMode(v=>!v);setPanMode(false);setBoxZoomMode(false);setInspectCurves(false);setPlacement(null);setOverlapHits([])}}><MathLabel>{String.raw`U_*`}</MathLabel></button>
        <button type="button" title="Ampliar" aria-label="Ampliar gráfico" onClick={()=>zoomAt(0.8)}>＋</button>
        <button type="button" title="Reduzir" aria-label="Reduzir gráfico" onClick={()=>zoomAt(1.25)}>－</button>
        </div><div className="workspaceToolbarGroup" role="group" aria-label="Escala dos eixos">
        <button type="button" title="Ampliar somente na direção u" aria-label="Ampliar eixo u" onClick={()=>scaleAxis('u',0.8)}>u＋</button>
        <button type="button" title="Reduzir somente na direção u" aria-label="Reduzir eixo u" onClick={()=>scaleAxis('u',1.25)}>u－</button>
        <button type="button" title="Ampliar somente na direção v" aria-label="Ampliar eixo v" onClick={()=>scaleAxis('v',0.8)}>v＋</button>
        <button type="button" title="Reduzir somente na direção v" aria-label="Reduzir eixo v" onClick={()=>scaleAxis('v',1.25)}>v－</button>
        </div><div className="workspaceToolbarGroup" role="group" aria-label="Navegação da janela">
        <button type="button" title="Arrastar para mover a janela" aria-label="Mover janela" aria-pressed={panMode} className={panMode?'active':''} onClick={()=>{setPanMode(v=>!v);setBoxZoomMode(false);setInspectCurves(false);setSelectStarMode(false)}}>✥</button>
        <button type="button" title="Zoom por retângulo: arraste uma área do gráfico" aria-label="Zoom por retângulo" aria-pressed={boxZoomMode} className={boxZoomMode?'active':''} onClick={()=>{setBoxZoomMode(v=>!v);setPanMode(false);setInspectCurves(false);setSelectStarMode(false);setPlacement(null);setBoxZoomRect(null);boxZoomStart.current=null}}>▣</button>
        <button type="button" title="Voltar à janela anterior" aria-label="Voltar à janela anterior" disabled={!windowHistory.length} onClick={()=>{const previous=windowHistory.at(-1);if(previous){applyWindow(previous);setWindowHistory(history=>history.slice(0,-1))}}}>↶</button>
        <button type="button" title="Ajustar à geometria" aria-label="Ajustar à geometria" onClick={fitGeometry}>⤢</button>
        <button type="button" title="Janela inicial" aria-label="Restaurar janela inicial" onClick={()=>applyWindow(DEFAULT_STATE_WINDOW,{record:true})}>↺</button>
        </div><div className="workspaceToolbarGroup" role="group" aria-label="Projeções">
        <button type="button" title="Selecionar projeção π₋" aria-label="Projeção π₋" aria-pressed={stateProjection==='minus'} className={stateProjection==='minus'?'active':''} onClick={()=>setStateProjection('minus')}><MathLabel>{String.raw`\pi_-`}</MathLabel></button>
        <button type="button" title="Selecionar projeção π₊" aria-label="Projeção π₊" aria-pressed={stateProjection==='plus'} className={stateProjection==='plus'?'active':''} onClick={()=>setStateProjection('plus')}><MathLabel>{String.raw`\pi_+`}</MathLabel></button>
        </div><div className="workspaceToolbarGroup" role="group" aria-label="Inspeção">
        <button type="button" title={activeProfile?'Animar ou pausar o fluxo da cadeia candidata':'Selecione uma cadeia candidata para animar'} aria-label="Animar fluxo da cadeia" aria-pressed={animateCandidateFlow} className={animateCandidateFlow?'active':''} disabled={!activeProfile||(!canAnimateShock&&!canAnimateRarefaction)} onClick={()=>setAnimateCandidateFlow(value=>!value)}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h3l3-5 4 10 3-5h3"/><path d="M16 3l4 3-4 3"/></svg></button>
        <button type="button" title="Mostrar coordenadas do cursor" aria-label="Mostrar coordenadas do cursor" aria-pressed={showCoordinates} className={showCoordinates?'active':''} onClick={()=>setShowCoordinates(v=>!v)}>⌖</button>
        <button type="button" title="Inspecionar curvas projetadas" aria-label="Inspecionar curvas projetadas" aria-pressed={inspectCurves} className={inspectCurves?'active':''} onClick={()=>{setInspectCurves(v=>!v);setPanMode(false);setBoxZoomMode(false);setSelectStarMode(false);setOverlapHits([])}}>◎</button>
      </div></div></WorkspaceToolbar>
      {showCoordinates&&cursorPoint&&<output className="state2dCoordinates" aria-label="Coordenadas do cursor">u = {cursorPoint[0].toFixed(5)} · v = {cursorPoint[1].toFixed(5)}</output>}
      <style>{`@keyframes candidateFlowMarch { to { stroke-dashoffset: -36; } } .candidateFlowMarch { animation: candidateFlowMarch 1.2s linear infinite; } @media (prefers-reduced-motion: reduce) { .candidateFlowMarch { animation: none !important; } }`}</style>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Rarefações, estados e seleção de U estrela no plano u v" className="stateSelectablePlot" tabIndex="0" style={{cursor:boxZoomMode?'crosshair':panMode?'grab':placement||selectStarMode?'crosshair':hoveredState?'grab':'default',touchAction:'none'}} onWheel={onPlotWheel} onKeyDown={onPlotKey} onPointerDown={selectFromPointer} onPointerMove={movePointer} onPointerLeave={()=>{setCursorPoint(null);if(!dragging.current&&!panning.current&&!boxZoomStart.current)setHoveredState(null)}} onPointerUp={endPointer} onPointerCancel={()=>{boxZoomStart.current=null;setBoxZoomRect(null);finishDragPreview(false);panning.current=null}}><rect x="0" y="0" width={W} height={H} className="chartBg"/>{discriminantRegions&&<g pointerEvents="none" aria-label="Regiões de hiperbolicidade"><clipPath id="discriminantPlotClip"><rect x={P} y={P} width={W-2*P} height={H-2*P}/></clipPath><g clipPath="url(#discriminantPlotClip)"><rect x={P} y={P} width={W-2*P} height={H-2*P} fill="#0a84ff" opacity="0.035"/><path d={discriminantRegions.ellipticPolygons.map(poly=>`${pathData(poly,view)} Z`).join(' ')} fill="#ff453a" fillRule="nonzero" opacity="0.17" stroke="none"/>{discriminantRegions.segments.map((segment,i)=><path key={i} d={pathData(segment,view)} stroke="#ffd60a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>)}</g></g>}<g className="stateAxisGraduations" pointerEvents="none" aria-hidden="true">
      {axisTicks(view.uMin,view.uMax).map(u=><g key={`u-${u}`}><line x1={sx({u,v:view.vMin},view)} x2={sx({u,v:view.vMin},view)} y1={H-P} y2={H-P+6} className="stateAxisTick"/><text x={sx({u,v:view.vMin},view)} y={H-P+23} textAnchor="middle" className="stateAxisTickLabel">{axisLabel(u)}</text></g>)}
      {axisTicks(view.vMin,view.vMax,6).map(v=><g key={`v-${v}`}><line x1={P-6} x2={P} y1={sy({u:view.uMin,v},view)} y2={sy({u:view.uMin,v},view)} className="stateAxisTick"/><text x={P-10} y={sy({u:view.uMin,v},view)+4} textAnchor="end" className="stateAxisTickLabel">{axisLabel(v)}</text></g>)}
      </g>{x0!==null&&<line x1={x0} x2={x0} y1={P} y2={H-P} className="chartAxis"/>}{y0!==null&&<line x1={P} x2={W-P} y1={y0} y2={y0} className="chartAxis"/>}
      <g clipPath="url(#sharedLociClip)" aria-label="Projeções das curvas da variedade"><defs><clipPath id="sharedLociClip"><rect x={P} y={P} width={W-2*P} height={H-2*P}/></clipPath></defs>{visibleLoci.flatMap(item=>(item.id==='J'?projectedInflection:item.projected[stateProjection]).map((path,i)=><path key={`${item.id}:${stateProjection}:${i}`} d={pathData(path,view)} stroke={item.color} {...scientificCurveStyle(scientificLocusKind(item.id),'2d')} strokeLinecap="round" strokeLinejoin="round" fill="none" pointerEvents="none" aria-label={`${item.label} projetada por pi ${stateProjection}`}/>))}</g>
      {exploreWaveBranches&&<g clipPath="url(#sharedLociClip)" aria-label="Ramos de choque independentes nos estados" pointerEvents="none">
        {shockCurves.filter(c=>c.side==='left'?showLeftStateShock:showRightStateShock).map(c=><path key={c.id} d={pathData(c.points,view)} fill="none" stroke={c.side==='left'?'#ff453a':'#bf5af2'} strokeWidth="2.4" aria-label={c.side==='left'?'Ramo de choque lento de U L':'Ramo de choque rápido para U R'}><title>{`${c.side==='left'?'S₁(U_L)':'S₂ retrospectiva(U_R)'} · RH e Lax de extremos numericamente compatíveis; entropia não certificada.`}</title></path>)}
        {shockCurves.filter(c=>c.side==='left'?showLeftStateShock:showRightStateShock).map(c=>{
          const [u,v]=c.termination.lastVerified
          return <rect className="statePointMarker" key={`stop-${c.id}`} x={sx({u,v},view)-4} y={sy({u,v},view)-4} width="8" height="8" fill="#0b1016" stroke={c.side==='left'?'#ff453a':'#bf5af2'} strokeWidth="1.8" aria-label="Término do arco de choque"><title>{`${shockStopLabel(c.termination.reason)} · última amostra verificada (${u.toPrecision(6)}, ${v.toPrecision(6)}); fronteira matemática não certificada.`}</title></rect>
        })}
      </g>}
      {showRarefactionField&&visibleCurves.map(c=><path key={`${c.id}:${c.clipId}`} d={pathData(c.points,view)} fill="none" className={c.branch==='slow'?'stateRareSlow':'stateRareFast'}/>) }
      {visibleRarefactionLayers.filter(layer=>!layer.point).map(layer=>layer.data.map((points,index)=>
        <path key={`${layer.id}:${index}`} d={pathData(points,view)} fill="none" stroke={layer.color}
          strokeWidth="1.8" strokeDasharray={layer.id.startsWith('infinity')?'5 3':'none'} pointerEvents="none"/>
      ))}
      {visibleRarefactionLayers.filter(layer=>layer.point).map(layer=>layer.data.map((q,index)=>
        <circle key={`${layer.id}:${index}`} cx={sx(q,view)} cy={sy(q,view)} r="4.5" fill={layer.color} stroke="#10151d">
          <title>{layer.label} · {index+1}</title>
        </circle>
      ))}
      {visibleRiemannHugoniot.map(c=><path data-riemann-side={stateProjection==='plus'?'left':'right'} key={`riemann:${stateProjection}:${c.id}:${c.clipId}`} d={pathData(c.points,view)} fill="none" stroke={stateProjection==='plus'?'#ff9f0a':'#30d158'} {...scientificCurveStyle(stateProjection==='minus'?'auxiliary':'primary','2d')} pointerEvents="none"/>)}
      {/* Marcadores científicos são desenhados na camada superior, após todas as curvas. */}
      {exploreWaveBranches&&selectedRarefactions.map((branch,i)=>isStateRarefactionVisible(branch.side)&&branch.points.length>1?<path key={`state-rare:${i}`} aria-label={branch.side==='left'?'Arco de rarefação lenta de U L':'Arco de rarefação rápida retrospectiva de U R'} d={pathData(branch.points.map(([u,v])=>({u,v})),view)} fill="none" stroke={branch.side==='left'?'#ff9f0a':'#30d158'} {...scientificCurveStyle(branch.family==='slow'?'integralSlow':'integralFast','2d')} opacity="0.85" pointerEvents="none"/>:null)}
      {visibleHugoniot.map(c=><path key={`${c.id}:${c.clipId}`} d={pathData(c.points,view)} fill="none" className={`${hugClass(c)} ${c.side==='plus'?'stateHugBackward':'stateHugForward'}`}/>) }
      {graphLabels.map(({key,x,y,width,height,color,name,tex,backdrop})=>
        <foreignObject key={key} x={x} y={y} width={width} height={height} pointerEvents="none" aria-label={name}>
          <div style={{color,fontSize:13,lineHeight:'20px',textAlign:'center',textShadow:'0 0 3px #10151d, 0 0 3px #10151d'}}>
            <span style={backdrop?{background:'#10151d',borderRadius:3,padding:'1px 3px'}:undefined}><MathLabel>{tex}</MathLabel></span>
          </div>
        </foreignObject>
      )}
      {showRarefactionField&&Array.from(new Map(visibleCurves.flatMap(c=>c.points.filter(q=>q.event==='coincidence')).map(q=>[`${q.tau.toPrecision(10)}:${q.zc.toPrecision(10)}`,q])).values()).map((q,i)=><circle key={`E:${i}`} cx={sx(q,view)} cy={sy(q,view)} r="4" className="stateCoincidence"/>)}
      {showInspectedState&&g.projection&&<><line x1={sx(minus,view)} y1={sy(minus,view)} x2={sx(plus,view)} y2={sy(plus,view)} className="stateJump"/><circle cx={sx(minus,view)} cy={sy(minus,view)} r="5.5" className="stateMinus"/><StateMathAnnotation x={sx(minus,view)+10} y={sy(minus,view)-10} tex={String.raw`U_-`}/><circle cx={sx(plus,view)} cy={sy(plus,view)} r="5.5" className="statePlus"/><StateMathAnnotation x={sx(plus,view)+10} y={sy(plus,view)-10} tex={String.raw`U_+`}/><circle cx={sx(mean,view)} cy={sy(mean,view)} r="5" className="stateMean"/><StateMathAnnotation x={sx(mean,view)+9} y={sy(mean,view)+18} tex={String.raw`\bar U`}/></>}
      {activeProfile&&showChain&&<g pointerEvents="none" aria-label="Cadeia candidata selecionada" clipPath="url(#riemannActiveClip)">
        <defs><clipPath id="riemannActiveClip"><rect x={P} y={P} width={W-2*P} height={H-2*P}/></clipPath></defs>
        {chainGeometry.segments.map((segment,i)=>{
          const points=segment.type==='shock'?segment.arc.points:segment.states
          const color=chainSegmentColors[segmentColorKeys[i]]
          const arrowTransform=points&&chainArrowTransform(points,view,arrowObstacles)
          return <g key={i} data-chain-segment={i}
            className={focusedChainSegment===i?'stateChainSegmentActive':undefined}
            opacity={focusedChainSegment===null||focusedChainSegment===i?1:0.3}>
            {points?.length>1?<><path d={pathData(points.map(([u,v])=>({u,v})),view)} fill="none" stroke={color} strokeDasharray={segment.type==='contact'?'5 4':undefined}
              aria-label={segment.type==='shock'?'Arco de choque da cadeia':segment.type==='contact'?'Curva de contato selecionada':activeProfile.kind==='composite-chain'?'Trecho de rarefação do bloco composto':'Trecho de rarefação selecionado'}>
              <title>{`Onda ${i+1} · ${segment.type} · ${segment.family} · ${segment.type==='rarefaction'?segment.speeds[0]+' → '+segment.speeds.at(-1):segment.speed}`}</title>
            </path>{arrowTransform&&<path d="M 3 0 L -4 -3 L -4 3 Z" transform={arrowTransform} fill={color} aria-hidden="true"/>}{animateCandidateFlow&&segment.type!=='contact'&&<path className="candidateFlowMarch" d={pathData(points.map(([u,v])=>({u,v})),view)} fill="none" stroke="#fff3c4" strokeWidth="1.5" strokeDasharray="7 11" style={{animationDuration:candidateFlowDuration}}/>}</>:
              <g aria-label="Arco de choque inconclusivo">{[segment.from,segment.to].map(([u,v],j)=><circle key={j} cx={sx({u,v},view)} cy={sy({u,v},view)} r="8" fill="none" stroke={color} strokeDasharray="2 3"><title>Continuação inconclusiva; extremo do salto, sem arco presumido.</title></circle>)}</g>}
          </g>
        })}
        {chainGeometry.junctions.map(([u,v],i)=><g key={i}><circle cx={sx({u,v},view)} cy={sy({u,v},view)} r="5" fill="#ffd60a" stroke="#111" aria-label="Junção sônica da cadeia"/><StateMathAnnotation {...junctionLabels[i]} tex={sonicJunctionLabel(i,chainGeometry.junctions.length)}/></g>)}
        {pointVisibility.middle&&activeStates[1]&&<g><circle cx={sx({u:activeStates[1][0],v:activeStates[1][1]},view)} cy={sy({u:activeStates[1][0],v:activeStates[1][1]},view)} r="6" fill="#0b1016" stroke="#bf5af2" strokeWidth="2"/><StateMathAnnotation {...middleLabel} tex="U_M"/></g>}
      </g>}

      {selectedCurveSample&&<circle cx={sx({u:selectedCurveSample.state[0],v:selectedCurveSample.state[1]},view)} cy={sy({u:selectedCurveSample.state[0],v:selectedCurveSample.state[1]},view)} r="7" fill="none" stroke="#ffffff" strokeWidth="1.8" pointerEvents="none" aria-label="Amostra selecionada da curva projetada"/>}
      {selectedProjectedCurve&&<path d={pathData(selectedProjectedCurve.points,view)} fill="none" stroke="#ffffff" {...scientificCurveStyle('selected','2d')} strokeLinecap="round" opacity="0.95" pointerEvents="none" aria-label="Curva projetada selecionada"/>}
      {requestedProjectionVisible&&<g pointerEvents="none" role="img" aria-label={stateProjection==='minus'?'Projeção π menos do ponto 3D selecionado':'Projeção π mais do ponto 3D selecionado'}><circle cx={sx(requestedProjectionPoint,view)} cy={sy(requestedProjectionPoint,view)} r="14" fill="none" stroke="#64d2ff" strokeWidth="3"/><circle cx={sx(requestedProjectionPoint,view)} cy={sy(requestedProjectionPoint,view)} r="4" fill="#ffffff" stroke="#64d2ff" strokeWidth="1.5"/><StateMathAnnotation x={sx(requestedProjectionPoint,view)+17} y={sy(requestedProjectionPoint,view)-14} tex={stateProjection==='minus'?String.raw`\pi_-(P)`:String.raw`\pi_+(P)`}/></g>}
      {pointVisibility.fixed&&selectedVisible&&<><circle cx={sx(selected,view)} cy={sy(selected,view)} r="7" className="stateFixed"/><StateMathAnnotation {...labelPosition(selected,5)} tex={String.raw`U_*`}/></>}<text x={W-P} y={H-18} textAnchor="end">u</text><text x={P+8} y={P+14}>v</text>      {boxZoomRect&&<rect x={boxZoomRect.x} y={boxZoomRect.y} width={boxZoomRect.width} height={boxZoomRect.height} fill="#64d2ff" fillOpacity="0.13" stroke="#64d2ff" strokeWidth="1.5" strokeDasharray="6 4" pointerEvents="none"/>}
      {/* Camada superior: marcadores sempre acima das curvas, sem alterar os cálculos. */}
      <g data-scientific-marker-layer="true">
      {(stateProjection==='plus'?showLeftRiemannHugoniot:showRightRiemannHugoniot)&&(stateProjection==='plus'?finiteContacts.left:finiteContacts.right).filter(event=>event.kind!=='constant-contact-continuum').map((event,i)=>{const point=event.refinement?.status==='converged'?event.refinement.point:event.point;return <ScientificPointMarker key={`finite-sonic:${stateProjection}:${i}`} x={sx({u:point[0],v:point[1]},view)} y={sy({u:point[0],v:point[1]},view)} referenceState={stateProjection==='plus'?'left':'right'} pointType="sonicContact" verificationStatus={event.refinement?.status==='converged'?'refined':'unresolved'} title={`Contato sônico finito candidato · ${event.sonicSide==='plus'?'S⁺':'S⁻'} · ${event.family} · ${event.kind} · (${point[0].toFixed(5)}, ${point[1].toFixed(5)}) · refinamento: ${event.refinement?.status??'indefinido'} · não certifica admissibilidade`}/>})}
      {sonicConnections.filter(q=>['ordered-geometric-candidate','weak-lax-candidate'].includes(q.status)&&(stateProjection==='plus'?q.contactSide==='left'&&showLeftRiemannHugoniot:q.contactSide==='right'&&showRightRiemannHugoniot)).map((q,i)=><ScientificPointMarker key={`sonic-connection:${i}`} x={sx({u:q.point[0],v:q.point[1]},view)} y={sy({u:q.point[0],v:q.point[1]},view)} referenceState={q.contactSide} pointType="sonicConnection" title={`${q.kind} · ${q.family} · (${q.point[0].toFixed(5)}, ${q.point[1].toFixed(5)}) · distância RK4=${q.distance.toExponential(2)} · admissibilidade não certificada`}/>)}
      {exploreWaveBranches&&showRarefactionEvents&&selectedRarefactions.flatMap((branch,i)=>isStateRarefactionVisible(branch.side)?branch.events.map((event,j)=><ScientificPointMarker key={`gn:${i}:${j}`} x={sx({u:event.point[0],v:event.point[1]},view)} y={sy({u:event.point[0],v:event.point[1]},view)} referenceState={branch.side} pointType="rarefactionEvent" title={`Possível perda de não linearidade genuína · ${branch.side==='left'?'U_L':'U_R'} · ${branch.family} · ${event.kind} · (${event.point[0].toFixed(5)}, ${event.point[1].toFixed(5)}) · diagnóstico infinitesimal, não certifica contato sônico finito`}/>):[])}
      {pointVisibility.middle&&showLeftRiemannHugoniot&&showRightRiemannHugoniot&&shockCandidates.map((q,i)=>{const m={u:q.middle[0],v:q.middle[1]};return m.u>=view.uMin&&m.u<=view.uMax&&m.v>=view.vMin&&m.v<=view.vMax?<g key={`middle:${i}`} pointerEvents="none"><circle cx={sx(m,view)} cy={sy(m,view)} r={STATE_MARKER_SIZE_2D.intersection} fill="#0b1016" stroke="#bf5af2" strokeWidth="1.7"/><circle cx={sx(m,view)} cy={sy(m,view)} r="1.35" fill="#bf5af2"/><StateMathAnnotation x={sx(m,view)+9} y={sy(m,view)+15} tex={`U_{M_{${i+1}}}`}/></g>:null})}
      {/* Imagem degenerada da fibra: π₋(H^forw(U_L))={U_L}; π₊(H^back(U_R))={U_R}. Independente da visibilidade dos estados. */}
      {((stateProjection==='minus'&&showLeftRiemannHugoniot&&!pointVisibility.left)||(stateProjection==='plus'&&showRightRiemannHugoniot&&!pointVisibility.right))&&(()=>{const side=stateProjection==='minus'?'left':'right';const coords=riemannStates?.[side];if(!coords)return null;const q={u:coords[0],v:coords[1]};return <g pointerEvents="none" aria-label={`Projeção pontual da fibra de ${side==='left'?'U L':'U R'}`}><ScientificStateMarker side={side} x={sx(q,view)} y={sy(q,view)} radius={STATE_MARKER_SIZE_2D.normal} fill={side==='left'?'#ff9f0a':'#30d158'}/><StateMathAnnotation {...endpointLabels[side]??labelPosition(q,side==='left'?3:2)} tex={side==='left'?String.raw`U_L`:String.raw`U_R`}/></g>})()}
      {riemannStates&&['left','right'].filter(side=>pointVisibility[side]).map(side=>{const state=riemannStates[side];if(!state)return null;const q={u:state[0],v:state[1]};return q.u>=view.uMin&&q.u<=view.uMax&&q.v>=view.vMin&&q.v<=view.vMax?<g key={side} data-state-marker={side} role="group" opacity={hoveredState===side?1:0.92} aria-label={side==='left'?'Estado inicial U L':'Estado inicial U R'}><ScientificStateMarker side={side} x={sx(q,view)} y={sy(q,view)} radius={hoveredState===side?STATE_MARKER_SIZE_2D.hovered:STATE_MARKER_SIZE_2D.normal} fill={side==='left'?'#ff9f0a':'#30d158'}/><StateMathAnnotation {...endpointLabels[side]??labelPosition(q,side==='left'?3:2)} tex={side==='left'?String.raw`U_L`:String.raw`U_R`}/></g>:null})}
      {placement&&cursorPoint&&<g aria-label={`Prévia de ${placement==='left'?'U L':'U R'}`} pointerEvents="none" opacity="0.55"><ScientificStateMarker side={placement} x={sx({u:cursorPoint[0],v:cursorPoint[1]},view)} y={sy({u:cursorPoint[0],v:cursorPoint[1]},view)} radius={STATE_MARKER_SIZE_2D.preview} fill={placement==='left'?'#ff9f0a':'#30d158'} preview/><StateMathAnnotation x={sx({u:cursorPoint[0],v:cursorPoint[1]},view)+13} y={sy({u:cursorPoint[0],v:cursorPoint[1]},view)-13} tex={placement==='left'?String.raw`U_L`:String.raw`U_R`}/></g>}
      </g>
</svg>
      <ScientificLegend environment="2d" items={[
        {id:'left',tex:String.raw`U_L`,color:'#ff9f0a',visible:pointVisibility.left||stateProjection==='minus'&&showLeftRiemannHugoniot},
        {id:'right',tex:String.raw`U_R`,color:'#30d158',shape:'diamond',visible:pointVisibility.right||stateProjection==='plus'&&showRightRiemannHugoniot},
        {id:'fixed',tex:String.raw`U_*`,color:'#8da5b5',shape:'ring',visible:Boolean(fixedState&&pointVisibility.fixed)},
        {id:'middle',tex:String.raw`U_{M_i}`,color:'#bf5af2',shape:'ring',visible:Boolean(activeProfile&&pointVisibility.middle)},
        {id:'hugoniot',tex:stateProjection==='plus'?String.raw`\mathcal H^{\mathrm{forw}}(U_L)`:String.raw`\mathcal H^{\mathrm{back}}(U_R)`,color:stateProjection==='plus'?'#ff9f0a':'#30d158',shape:'line',visible:stateProjection==='plus'?showLeftRiemannHugoniot:showRightRiemannHugoniot},
        {id:'rarefaction',tex:String.raw`\mathcal R`,color:'#64d2ff',shape:'line',visible:showRarefactionField},
        {id:'slow-fans',tex:'R_1(U_L)',color:'#ff9f0a',shape:'line',visible:exploreWaveBranches&&showLeftStateRarefaction&&selectedRarefactions.some(b=>b.side==='left')},
        {id:'fast-fans',tex:'R_2^{back}(U_R)',color:'#30d158',shape:'line',visible:exploreWaveBranches&&showRightStateRarefaction&&selectedRarefactions.some(b=>b.side==='right')},
        {id:'slow-shocks',tex:'S_1(U_L)',color:'#ff453a',shape:'line',visible:exploreWaveBranches&&showLeftStateShock&&shockCurves.some(c=>c.side==='left')},
        {id:'fast-shocks',tex:'S_2^{back}(U_R)',color:'#bf5af2',shape:'line',visible:exploreWaveBranches&&showRightStateShock&&shockCurves.some(c=>c.side==='right')},
        {id:'chain-shock',tex:'S',color:chainSegmentColors.shock,shape:'line',visible:Boolean(showChain&&segmentColorKeys.includes('shock'))},
        {id:'chain-composite',tex:'\\mathcal K',color:chainSegmentColors.composite,shape:'line',visible:Boolean(showChain&&segmentColorKeys.includes('composite'))},
        {id:'chain-composite-fan',tex:'R\\;(\\mathcal K)',description:'Rarefação da onda composta',color:chainSegmentColors.compositeRarefaction,shape:'line',visible:Boolean(showChain&&segmentColorKeys.includes('compositeRarefaction'))},
        {id:'chain-contact',tex:'C',color:chainSegmentColors.contact,shape:'line',visible:Boolean(showChain&&segmentColorKeys.includes('contact'))},
        {id:'chain-fan',tex:'R',color:chainSegmentColors.rarefaction,shape:'line',visible:Boolean(showChain&&segmentColorKeys.includes('rarefaction'))},
        {id:'chain-junction',tex:chainGeometry.junctions.map((_,i)=>sonicJunctionLabel(i,chainGeometry.junctions.length)).join(', '),color:'#ffd60a',visible:Boolean(showChain&&chainGeometry.junctions.length)}
      ]} chain={activeProfile&&showChain?{certified:candidateAssessments[selectedCandidateIndex]?.status==='validated',tex:`U_L\\xrightarrow{${(activeProfile.pattern??'SS')[0]}_1}U_M\\xrightarrow{${(activeProfile.pattern??'SS')[1]}_2}U_R`}:null}/>

    </div>
</WorkspaceLayout>
  </div>
}
