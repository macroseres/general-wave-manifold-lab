import ScientificLegend from './ScientificLegend.jsx'
import { fastHugoniotPreviewPath } from '../math/state/fastHugoniotPreview.js'
import VisibilityEye from './VisibilityEye.jsx'
import WorkspaceToolbar from './WorkspaceToolbar.jsx'
import WorkspaceLayout from './WorkspaceLayout.jsx'
import { MathLabel } from './math/MathLabel.jsx'
import WorkspaceRail from './WorkspaceRail.jsx'
import WorkspaceDrawer from './WorkspaceDrawer.jsx'
import WorkspacePanelHeader from './WorkspacePanelHeader.jsx'
import { zoomWindow, panWindow } from '../math/state/viewportNavigation.js'
import { chooseStateLabelPosition } from '../math/state/labelPlacement.js'
import {liftHugoniotSample} from '../math/state/hugoniotWaveLift.js'
import {nearestProjectedSample,projectedHugoniotEndpoints} from '../math/state/projectedCurveSamples.js'
import {projectedCurveHits,nextProjectedCurveHit} from '../math/state/projectedCurvePicking.js'
import ScientificStateMarker from './ScientificStateMarker.jsx'
import ScientificPointMarker from './ScientificPointMarker.jsx'
import {STATE_MARKER_SIZE_2D} from '../config/scientificMarkerRules.js'
import { scientificCurveStyle, scientificLocusKind } from '../config/scientificCurveRules.js'
import {implicitTwoShockMiddleSensitivity} from '../math/solution/riemannImplicitMiddleSensitivity.js'
import {mixedMiddleReconstructionSensitivity} from '../math/solution/riemannMixedMiddleSensitivity.js'
import {compareHugoniotSensitivity,compareHugoniotCoordinateSensitivity} from '../math/solution/riemannSensitivityComparison.js'
import RiemannSensitivityPlot from './RiemannSensitivityPlot.jsx'
import {candidateProvenance} from '../math/solution/riemannCandidateProvenance.js'
import {selectedCandidateHugoniotArc} from '../math/solution/riemannBranchHighlight.js'
import {physicalChainEvidence} from '../math/solution/physicalChainEvidence.js'
import {twoShockSelfSimilarCandidate,mixedSelfSimilarCandidate} from '../math/solution/riemannSelfSimilarCandidate.js'
import {assessMixedChainsWithLiu} from '../math/solution/mixedChainLiu.js'
import {useEffect,useMemo,useRef,useState} from 'react'
import {useWorkspacePreference} from '../hooks/useWorkspacePreference.js'
import {riemannMonotoneRarefactions} from '../math/rarefaction/monotoneBranches.js'
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
import {twoShockCandidates} from '../math/solution/twoShockCandidates.js'
import {assessTwoShockCandidates} from '../math/solution/riemannWaveChains.js'
import {mixedWaveCandidates} from '../math/solution/mixedWaveChains.js'
import {sampledLiuAtForwardContact,seededLiuAtForwardContact} from '../math/solution/orientedLiuArc.js'
import {riemannBoundaryRegularity} from '../math/manifold/riemannBoundaryRegularity.js'
import {sampleDiscriminantRegions} from '../math/characteristic/discriminantRegions.js'
import {auditCoincidenceProjection} from '../math/characteristic/coincidenceProjectionAudit.js'
import {auditCoincidenceCoverage} from '../math/characteristic/coincidenceCoverageAudit.js'
import {auditCoincidenceDegeneracies} from '../math/characteristic/coincidenceDegenerateAudit.js'
import {auditCoincidenceLifts} from '../math/characteristic/coincidenceLiftAudit.js'
import {auditCoincidenceIncidence} from '../math/characteristic/coincidenceIncidenceAudit.js'
import {stateSpaceProjection} from '../math/state/projections.js'
import {projectRarefactionOrbitToState,rarefactionOrbits,splitProjectedRarefactionByBranch} from '../math/rarefaction/orbits.js'
import {clipStatePolyline,statePointToUnit,stateSpaceGeometry} from '../geometry/state/stateSpace.js'
import {stateFibreGeometry} from '../geometry/state/fibreGeometry.js'
import {hugoniotLaxGeometry} from '../geometry/state/hugoniotLaxGeometry.js'
import {projectHugoniotLaxGeometryToState} from '../geometry/state/hugoniotStateProjection.js'

// Viewport retangular: escalas visuais independentes nos eixos u e v.
// As coordenadas de estado e as equações não são alteradas.
const W=1040,H=680,P=64
const sx=(q,g)=>P+statePointToUnit(q,g).x*(W-2*P)
const sy=(q,g)=>H-P-statePointToUnit(q,g).y*(H-2*P)
const pathData=(points,g)=>points.map((q,i)=>`${i?'L':'M'} ${sx(q,g).toFixed(2)} ${sy(q,g).toFixed(2)}`).join(' ')
// Graduação independente dos eixos: números legíveis mesmo após zoom/pan.
const axisTicks=(min,max,target=8)=>{
  const span=max-min
  if(!Number.isFinite(span)||span<=0)return []
  const rough=span/target,base=10**Math.floor(Math.log10(rough))
  const step=[1,2,2.5,5,10].map(n=>n*base).find(n=>n>=rough)??10*base
  const start=Math.ceil((min-1e-10*span)/step)*step
  const count=Math.min(100,Math.ceil((max-start)/step)+1)
  return Array.from({length:count},(_,i)=>Number((start+i*step).toPrecision(12))).filter(v=>v>=min-1e-10*span&&v<=max+1e-10*span)
}
const axisLabel=value=>Math.abs(value)<1e-10?'0':Number(value.toPrecision(5)).toString()
const finiteNumber=value=>Number.isFinite(Number(value))?Number(value):null
const validWindow=w=>w&&[w.uMin,w.uMax,w.vMin,w.vMax].every(Number.isFinite)&&w.uMin<w.uMax&&w.vMin<w.vMax
const robustExtent=values=>{
  const a=values.filter(Number.isFinite).sort((x,y)=>x-y)
  if(!a.length)return null
  const pick=q=>a[Math.min(a.length-1,Math.max(0,Math.floor(q*(a.length-1))))]
  return a.length<20?[a[0],a[a.length-1]]:[pick(.05),pick(.95)]
}
const fittedWindow=(g,fixedState=null)=>{
  // The viewport follows the rarefaction geometry, not the currently inspected point P in the wave manifold.
  // This keeps state selection independent from 3D inspection, even when P is near projective infinity.
  const curvePts=g.curves.flatMap(c=>c.points??[])
  const pts=curvePts.length?curvePts:[g.projection.minus,g.projection.plus,g.projection.mean]
  let ue=robustExtent(pts.map(q=>q.u)),ve=robustExtent(pts.map(q=>q.v))
  if(!ue||!ve)return {uMin:g.uMin,uMax:g.uMax,vMin:g.vMin,vMax:g.vMax}
  // Keep the scientific geometry central, but always include the selected state U*.
  if(fixedState?.every(Number.isFinite)){ue=[Math.min(ue[0],fixedState[0]),Math.max(ue[1],fixedState[0])];ve=[Math.min(ve[0],fixedState[1]),Math.max(ve[1],fixedState[1])]}
  const uSpan=Math.max(.12,ue[1]-ue[0]),vSpan=Math.max(.12,ve[1]-ve[0]),span=Math.max(uSpan,vSpan)
  const pad=.12, uMid=(ue[0]+ue[1])/2, vMid=(ve[0]+ve[1])/2,half=span*(.5+pad)
  return {uMin:uMid-half,uMax:uMid+half,vMin:vMid-half,vMax:vMid+half}
}


// Render mathematical annotations with the same KaTeX component used by the panels.
// SVG foreignObject keeps annotations attached to graph coordinates during zoom/pan.
function StateMathAnnotation({x,y,tex,width=96}) {
  return <foreignObject x={x} y={y-17} width={width} height="29" pointerEvents="none" style={{overflow:'visible'}}>
    <span xmlns="http://www.w3.org/1999/xhtml" className="stateMathAnnotation"><MathLabel>{tex}</MathLabel></span>
  </foreignObject>
}
export default function StateSpaceDialog({sharedLoci=[],open,onClose,inline=false,state,p,tauMin,tauMax,showRarefaction=true,fixedState=null,onSelectState,onClearState,riemannStates,onChangeRiemannState,onProfileCandidates,selectedCandidateIndex=-1,onSelectCandidate,projectionRequest=null,onInspectFibres3D,onInspectWavePoint3D,pointVisibility={left:true,right:true,fixed:true,middle:true},onTogglePointVisibility,showLeftRiemannHugoniot=true,setShowLeftRiemannHugoniot,showRightRiemannHugoniot=true,setShowRightRiemannHugoniot,showMinusStateFibre=true,setShowMinusStateFibre,showPlusStateFibre=true,setShowPlusStateFibre}){
  useEffect(()=>{if(!open||inline)return undefined;const key=e=>{if(e.key==='Escape'&&!e.defaultPrevented)onClose()};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[open,onClose,inline])
  const data=useMemo(()=>{
    const projection=stateSpaceProjection(state);if(!projection)return null
    const curves=showRarefaction?rarefactionOrbits(p,tauMin,tauMax).flatMap((orbit,index)=>splitProjectedRarefactionByBranch(projectRarefactionOrbitToState(orbit,p),p,{orbitId:`R${index}`}).map((segment,j)=>({...segment,id:`${index}:${j}`}))):[]
    // U* deliberately does not define the viewport. The viewport is fitted to the scientific geometry.
    return stateSpaceGeometry(projection,{curves})
  },[state,p,tauMin,tauMax,showRarefaction])
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
  return <div className={inline?"inlineWorkspaceBackdrop":"localChartBackdrop"} onPointerDown={inline?undefined:onClose}><section className={inline?"localChartDialog inlineWorkspaceDialog":"localChartDialog"} onPointerDown={e=>e.stopPropagation()} aria-modal={inline?undefined:"true"} role="dialog" aria-label="Espaço de estados (u, v)">{!inline&&<header><h2 id="state-space-title">Espaço de estados (u, v)</h2><button onClick={onClose}>Fechar</button></header>}{!data?<div className="localChartBody"><p>O ponto atual não possui uma fibra regular para definir a janela do espaço de estados.</p></div>:<StatePlot sharedLoci={sharedLoci} geometry={data} hugoniot={hugoniot} riemannHugoniot={riemannHugoniot} fixedState={fixedState} onSelectState={onSelectState} onClearState={onClearState} riemannStates={riemannStates} onChangeRiemannState={onChangeRiemannState} onProfileCandidates={onProfileCandidates} selectedCandidateIndex={selectedCandidateIndex} onSelectCandidate={onSelectCandidate} projectionRequest={projectionRequest} onInspectFibres3D={onInspectFibres3D} onInspectWavePoint3D={onInspectWavePoint3D} pointVisibility={pointVisibility} onTogglePointVisibility={onTogglePointVisibility} showLeftRiemannHugoniot={showLeftRiemannHugoniot} setShowLeftRiemannHugoniot={setShowLeftRiemannHugoniot} showRightRiemannHugoniot={showRightRiemannHugoniot} setShowRightRiemannHugoniot={setShowRightRiemannHugoniot} showMinusStateFibre={showMinusStateFibre} setShowMinusStateFibre={setShowMinusStateFibre} showPlusStateFibre={showPlusStateFibre} setShowPlusStateFibre={setShowPlusStateFibre} p={p}/>}</section></div>
}

function StatePlot({sharedLoci=[],geometry:g,hugoniot,riemannHugoniot,fixedState,onSelectState,onClearState,riemannStates,onChangeRiemannState,onProfileCandidates,p,selectedCandidateIndex=-1,onSelectCandidate,projectionRequest=null,onInspectFibres3D,onInspectWavePoint3D,pointVisibility={left:true,right:true,fixed:true,middle:true},onTogglePointVisibility,showLeftRiemannHugoniot=true,setShowLeftRiemannHugoniot,showRightRiemannHugoniot=true,setShowRightRiemannHugoniot,showMinusStateFibre=true,setShowMinusStateFibre,showPlusStateFibre=true,setShowPlusStateFibre}){
  const stateRarefactions=useMemo(()=>riemannMonotoneRarefactions(riemannStates,p).map(branch=>annotateGenuineNonlinearityContact(refineGenuineNonlinearityEvents(genuineNonlinearityEvents(branch,p),p),p)),[riemannStates,p])
  const directJump=useMemo(()=>directShockDiagnostic(riemannStates?.left,riemannStates?.right,p),[riemannStates,p])
  const shockCandidates=useMemo(()=>assessTwoShockCandidates(riemannStates?.left,riemannStates?.right,twoShockCandidates(riemannStates?.left,riemannStates?.right,riemannHugoniot?.left,riemannHugoniot?.right,p),p),[riemannStates,riemannHugoniot,p])
  const mixedCandidates=useMemo(()=>mixedWaveCandidates(riemannStates,stateRarefactions,riemannHugoniot,p),[riemannStates,stateRarefactions,riemannHugoniot,p])
  const mixedLiuCandidates=useMemo(()=>assessMixedChainsWithLiu(mixedCandidates,riemannStates,p),[mixedCandidates,riemannStates,p])
  const profileCandidates=useMemo(()=>({twoShock:shockCandidates.filter(q=>q.familyEvidence.status==='ordered-lax-endpoint-candidate').map(q=>{const profile=twoShockSelfSimilarCandidate(riemannStates?.left,q.middle,riemannStates?.right,p);return {...profile,evidence:physicalChainEvidence(profile,q),provenance:candidateProvenance(profile,q)}}).filter(q=>q.status==='sampled-candidate'),mixed:mixedLiuCandidates.map(q=>{const profile=mixedSelfSimilarCandidate(riemannStates?.left,riemannStates?.right,q,stateRarefactions,p);return {...profile,evidence:physicalChainEvidence(profile,q),provenance:candidateProvenance(profile,q)}}).filter(q=>q.status==='sampled-candidate')}),[shockCandidates,mixedLiuCandidates,riemannStates,stateRarefactions,p])
  useEffect(()=>{onProfileCandidates?.([...profileCandidates.twoShock,...profileCandidates.mixed])},[profileCandidates,onProfileCandidates])
  const allProfiles=useMemo(()=>[...profileCandidates.twoShock,...profileCandidates.mixed],[profileCandidates])
  const activeProfile=allProfiles[selectedCandidateIndex]??null
  const activeStates=useMemo(()=>activeProfile?.kind==='two-shock'?activeProfile.states:activeProfile?[activeProfile.left,activeProfile.middle,activeProfile.right]:[],[activeProfile])
  const activeFan=activeProfile?.fanStates??[]
  const characteristicIntersections=useMemo(()=>riemannBoundaryRegularity(riemannStates?.left,riemannStates?.right,p),[riemannStates,p])
  const finiteContacts=useMemo(()=>({left:refineFiniteSonicContacts(riemannStates?.left,finiteSonicContacts(riemannStates?.left,riemannHugoniot?.left,p,'forward'),p,'forward'),right:refineFiniteSonicContacts(riemannStates?.right,finiteSonicContacts(riemannStates?.right,riemannHugoniot?.right,p,'backward'),p,'backward')}),[riemannStates,riemannHugoniot,p])
  const sonicConnections=useMemo(()=>sonicRarefactionConnections(finiteContacts,stateRarefactions,p,{riemannStates}),[finiteContacts,stateRarefactions,p,riemannStates])
  const forwardLiu=useMemo(()=>(finiteContacts.left??[]).filter(q=>q.refinement?.status==='converged').map(q=>sampledLiuAtForwardContact(riemannStates?.left,q,riemannHugoniot?.left,p)),[finiteContacts,riemannStates,riemannHugoniot,p])
  const seededForwardLiu=useMemo(()=>(finiteContacts.left??[]).filter(q=>q.refinement?.status==='converged').map(q=>seededLiuAtForwardContact(riemannStates?.left,q,p)),[finiteContacts,riemannStates,p])
  const seededBackwardArcs=useMemo(()=>(finiteContacts.right??[]).filter(q=>q.refinement?.status==='converged').map(q=>traceSeededBackwardHugoniot(riemannStates?.right,q,p)),[finiteContacts,riemannStates,p])
  const backwardLiu=useMemo(()=>(finiteContacts.right??[]).filter(q=>q.refinement?.status==='converged').map(q=>seededLiuAtBackwardContact(riemannStates?.right,q,p)),[finiteContacts,riemannStates,p])
  const compositeLiu=useMemo(()=>classifyCompositeEvidence(classifyCompositeLiu(sonicConnections,finiteContacts,seededForwardLiu,backwardLiu)),[sonicConnections,finiteContacts,seededForwardLiu,backwardLiu])
  const svgRef=useRef(null)
  const [hoveredState,setHoveredState]=useState(null)
  const [showDiscriminant,setShowDiscriminant]=useWorkspacePreference('states.showDiscriminant', false)
  const [showRarefactionField,setShowRarefactionField]=useWorkspacePreference('states.showRarefactionField', false)
  const [showLeftStateRarefaction,setShowLeftStateRarefaction]=useWorkspacePreference('states.showLeftStateRarefaction', true)
  const [showRightStateRarefaction,setShowRightStateRarefaction]=useWorkspacePreference('states.showRightStateRarefaction', true)
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
  const {minus,plus,mean,speed}=g.projection
  const x0=view.uMin<=0&&view.uMax>=0?sx({u:0,v:view.vMin},view):null
  const y0=view.vMin<=0&&view.vMax>=0?sy({u:view.uMin,v:0},view):null
  const commitBound=key=>{const n=finiteNumber(windowText[key]);if(n===null){setWindowText(t=>({...t,[key]:String(window[key])}));return}const next={...window,[key]:n};if(!validWindow(next)){setWindowText(t=>({...t,[key]:String(window[key])}));return}setWindow(next);setWindowText(t=>({...t,[key]:String(n)}))}
  const onBoundKey=(e,key)=>{if(e.key==='Enter'){e.currentTarget.blur()}else if(e.key==='Escape'){setWindowText(t=>({...t,[key]:String(window[key])}));e.currentTarget.blur()}}
  const fitGeometry=()=>{const next=fittedWindow(g,fixedState);applyWindow(next,{record:true})}
  const applyWindow=(next,{record=false}={})=>{
    if(record&&validWindow(next))setWindowHistory(history=>[...history.slice(-19),window])
    if(!validWindow(next))return
    setWindow(next)
    setWindowText(Object.fromEntries(Object.entries(next).map(([k,v])=>[k,String(Number(v.toPrecision(9)))])))
  }
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
  const visibleCurves=useMemo(()=>g.curves.flatMap(c=>clipStatePolyline(c.points,{uMin:view.uMin,uMax:view.uMax,vMin:view.vMin,vMax:view.vMax}).map((points,i)=>({...c,points,clipId:i}))),[g.curves,view.uMin,view.uMax,view.vMin,view.vMax])
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
  const activeShockVisibleInProjection=Boolean(activeProfile&&(activeProfile.kind==='two-shock'||(activeProfile.kind==='shock-rarefaction'&&stateProjection==='plus')||(activeProfile.kind==='rarefaction-shock'&&stateProjection==='minus')))
  const activeHugoniotArc=useMemo(()=>selectedCandidateHugoniotArc(activeProfile,stateProjection,riemannHugoniot,{tolerance:Math.max(view.uMax-view.uMin,view.vMax-view.vMin)*0.008,fluxCoefficients:p}),[activeProfile,stateProjection,riemannHugoniot,p,view.uMin,view.uMax,view.vMin,view.vMax])
  const [animateCandidateFlow,setAnimateCandidateFlow]=useWorkspacePreference('states.animateCandidateFlow', false)
  const [candidateFlowSpeed,setCandidateFlowSpeed]=useWorkspacePreference('states.candidateFlowSpeed', 1)
  const candidateFlowDuration=`${(1.2/candidateFlowSpeed).toFixed(2)}s`
  const canAnimateShock=Boolean(activeShockVisibleInProjection&&activeHugoniotArc?.points?.length>1)
  const canAnimateRarefaction=activeFan.length>1
  const [comparisonIndex,setComparisonIndex]=useWorkspacePreference('states.comparisonIndex', -1)
  const comparisonProfile=allProfiles[comparisonIndex]??null
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
  const labelPoints=[...(riemannStates?['left','right'].filter(side=>riemannStates[side]).map(side=>({u:riemannStates[side][0],v:riemannStates[side][1]})):[]),...(activeStates??[]).filter(Array.isArray).map(q=>({u:q[0],v:q[1]})),...(selected?[selected]:[])].filter(q=>Number.isFinite(q.u)&&Number.isFinite(q.v))
  const labelPosition=(q,preferred=0)=>{
    const point={x:sx(q,view),y:sy(q,view)}
    const neighbours=labelPoints.map(other=>({x:sx(other,view),y:sy(other,view)}))
    return chooseStateLabelPosition(point,neighbours,preferred,{width:W,height:H})
  }
  return <div className="localChartBody stateExplorationBody">
    <WorkspaceLayout kind="states" expanded={activityPanelOpen} className="stateWorkspaceGrid" data-activity={activity} data-expanded={activityPanelOpen}>
    <WorkspaceRail className="stateActivityRail" ariaLabel="Categorias de ferramentas do espaço de estados"
      active={activity} expanded={activityPanelOpen}
      items={[{id:'states',label:'Estados',description:'Estados de Riemann e U*'},
        {id:'curves',label:'Curvas',description:'Hugoniot e hiperbolicidade'},
        {id:'points',label:'Pontos',description:'Marcadores e estados no plano'},
        {id:'arcs',label:'Arcos',description:'Arcos geométricos e trechos de ondas'},
        {id:'fields',label:'Campos',description:'Campos vetoriais e trajetórias integrais'},
        {id:'view',label:'Vista',description:'Limites da janela de visualização'},
        {id:'inspection',label:'Inspeção',description:'Estados, projeções e diagnósticos científicos'},
        ...(allProfiles.length?[{id:'chains',label:'Cadeias',description:'Cadeias candidatas'}]:[])]}
      onSelect={id=>{if(activity===id)setActivityPanelOpen(v=>!v);else{setActivity(id);setActivityPanelOpen(true)}}}
      onCollapse={()=>setActivityPanelOpen(v=>!v)}/>
    <WorkspaceDrawer className="stateToolsDrawer" data-activity={activity} data-expanded={activityPanelOpen} aria-label="Ferramentas do espaço de estados">
      <WorkspacePanelHeader title={{states:'Estados',curves:'Curvas e projeções',points:'Pontos',arcs:'Arcos',fields:'Campos',view:'Visualização',chains:'Cadeias candidatas',inspection:'Inspeção científica'}[activity]} onCollapse={()=>setActivityPanelOpen(false)}/>
      <div className="stateToolsDrawerContent">
    <details className="statePanelSection workspaceDisclosure" data-activity-section="states" open><summary>Estados de Riemann</summary><div className="statePanelSectionBody"><p className="statePanelHint" title="L/R posiciona o estado; clique fixa; Esc cancela; arraste para mover.">L/R: posicionar · arrastar: mover</p><div className="stateSelectionControls" aria-label="Estados iniciais do problema de Riemann">
    {['left','right'].map(side=><div className="riemannStateEditor" key={side}>
      <div className="riemannStateHeader"><strong><MathLabel>{side==='left'?String.raw`U_L`:String.raw`U_R`}</MathLabel></strong><span>{side==='left'?'Estado esquerdo':'Estado direito'}</span></div>
      <div className="riemannCoordinates">
        {[0,1].map(i=><label key={i}>{i===0?'u':'v'}<input type="number" step="any" aria-label={`${side==='left'?'U_L':'U_R'} ${i===0?'u':'v'}`} value={draftStates[side][i]} onChange={e=>setDraftStates(t=>({...t,[side]:t[side].map((v,j)=>j===i?e.target.value:v)}))} onKeyDown={e=>{if(e.key==='Enter')commitRiemann(side)}}/></label>)}
      </div>
      <button type="button" className="riemannApply" onClick={()=>commitRiemann(side)}>Aplicar coordenadas</button>
      <div className="riemannNudgeGrid" role="group" aria-label={`Ajustes de ${side==='left'?'U_L':'U_R'}`}>
        <button type="button" title="Diminuir u em 0,1" aria-label={`Diminuir u de ${side}`} onClick={()=>nudge(side,0,-.1)}><MathLabel>{String.raw`u-`}</MathLabel></button>
        <button type="button" title="Aumentar u em 0,1" aria-label={`Aumentar u de ${side}`} onClick={()=>nudge(side,0,.1)}><MathLabel>{String.raw`u+`}</MathLabel></button>
        <button type="button" title="Diminuir v em 0,1" aria-label={`Diminuir v de ${side}`} onClick={()=>nudge(side,1,-.1)}><MathLabel>{String.raw`v-`}</MathLabel></button>
        <button type="button" title="Aumentar v em 0,1" aria-label={`Aumentar v de ${side}`} onClick={()=>nudge(side,1,.1)}><MathLabel>{String.raw`v+`}</MathLabel></button>
      </div>
    </div>)}
    </div></div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="states" open><summary>Estado <MathLabel>{String.raw`U_*`}</MathLabel></summary><div className="statePanelSectionBody">
      <p className="statePanelHint">Clique no plano ou informe as coordenadas.</p>
      <div className="stateStarEditor">
        <div className="stateStarCoordinates">
          <label><MathLabel>{String.raw`u^*`}</MathLabel><input type="number" step="any" value={uText} onChange={e=>setUText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')applyExact()}}/></label>
          <label><MathLabel>{String.raw`v^*`}</MathLabel><input type="number" step="any" value={vText} onChange={e=>setVText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')applyExact()}}/></label>
        </div>
        <button type="button" className="stateStarPrimary" onClick={applyExact}>Fixar <MathLabel>{String.raw`U_*`}</MathLabel></button>
        <button type="button" className="stateStarSecondary" disabled={!fixedState} title={fixedState?'Mostrar as duas fibras canônicas de U* na variedade':'Primeiro fixe U*'} onClick={()=>onInspectFibres3D?.(fixedState)}>Ver fibras em 3D <span aria-hidden="true">↗</span></button>
        {fixedState&&<button type="button" className="stateStarClear" onClick={onClearState}>Limpar seleção</button>}
      </div>
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="curves" open><summary>Projeção da Hugoniot</summary><div className="statePanelSectionBody">
      <div className="stateProjectionCompact">
        <strong>Hugoniot de Riemann</strong>
        <div className="stateProjectionSegment" role="group" aria-label="Projeção das Hugoniot">
          <button type="button" aria-pressed={stateProjection==='minus'} className={stateProjection==='minus'?'active':''} onClick={()=>setStateProjection('minus')}><MathLabel>{String.raw`\pi_-`}</MathLabel></button>
          <button type="button" aria-pressed={stateProjection==='plus'} className={stateProjection==='plus'?'active':''} onClick={()=>setStateProjection('plus')}><MathLabel>{String.raw`\pi_+`}</MathLabel></button>
        </div>
        <div className="stateVisualizationOption" role="group" aria-label="Hugoniot dos estados de Riemann">
          {stateProjection==='plus'&&<div className="stateVisibilityRow" style={{"--visibility-color":"#ff9f0a"}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal H^{\mathrm{forw}}(U_L)`}</MathLabel></strong><small>Estado esquerdo · curva em π₊</small></span><VisibilityEye checked={showLeftRiemannHugoniot} onChange={e=>setShowLeftRiemannHugoniot?.(e.target.checked)} aria-label="Mostrar Hugoniot de U L" /></div>}
          {stateProjection==='minus'&&<div className="stateVisibilityRow" style={{"--visibility-color":"#30d158"}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal H^{\mathrm{back}}(U_R)`}</MathLabel></strong><small>Estado direito · curva em π₋</small></span><VisibilityEye checked={showRightRiemannHugoniot} onChange={e=>setShowRightRiemannHugoniot?.(e.target.checked)} aria-label="Mostrar Hugoniot de U R" /></div>}
        </div>
        <small className="stateProjectionCaveat">A imagem pontual da outra fibra é exibida em Pontos; os estados de visibilidade permanecem independentes.</small>
        <strong>Fibras de U_*</strong>
        <div className="stateVisualizationOption" role="group" aria-label="Visibilidade das fibras de Hugoniot sincronizada com o 3D">
          {stateProjection==='plus'&&<div className="stateVisibilityRow" style={{"--visibility-color":"#5b91da"}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal H^{\mathrm{forw}}(U_*)`}</MathLabel></strong><small>Curva em π₊ · fibra forward</small></span><VisibilityEye checked={showMinusStateFibre} onChange={()=>setShowMinusStateFibre?.(value=>!value)} aria-label="Fibra forward no 2D e 3D" /></div>}
          {stateProjection==='minus'&&<div className="stateVisibilityRow" style={{"--visibility-color":"#51b98b"}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal H^{\mathrm{back}}(U_*)`}</MathLabel></strong><small>Curva em π₋ · fibra backward</small></span><VisibilityEye checked={showPlusStateFibre} onChange={()=>setShowPlusStateFibre?.(value=>!value)} aria-label="Fibra backward no 2D e 3D" /></div>}
        </div>
        <small className="stateProjectionExplanation">{stateProjection==='minus'?'π₋: Hugoniot backward de U_R; estados esquerdos variáveis.':'π₊: Hugoniot forward de U_L; estados direitos variáveis.'}</small>
        <small className="stateProjectionCaveat">Curvas geométricas; não certificam uma solução admissível.</small>
      </div>
      {fixedState&&!projectedPair&&<div className="stateProjectionCompact">
        <strong>Projeção de U* na variedade</strong>
        <small>{stateProjection==='minus'?'π₋(ℋᶠᵒʳʷ(U*))={U*}; π₋(ℋᵇᵃᶜᵏ(U*)) é a curva U₋.':'π₊(ℋᶠᵒʳʷ(U*)) é a curva U₊; π₊(ℋᵇᵃᶜᵏ(U*))={U*}.'}</small>
      </div>}
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="arcs" open><summary>Rarefações</summary><div className="statePanelSectionBody">
      <div className="stateVisualizationOption" role="group" aria-label="Rarefações dos estados de Riemann">
        <div className="stateVisibilityRow" style={{"--visibility-color":"#ff9f0a"}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal R(U_L)`}</MathLabel></strong><small>Rarefações e eventos associados a U_L</small></span><VisibilityEye checked={showLeftStateRarefaction} onChange={()=>setShowLeftStateRarefaction(v=>!v)} aria-label="Rarefações de U L" /></div>
        <div className="stateVisibilityRow" style={{"--visibility-color":"#30d158"}}><span className="stateSwitchCopy"><strong><MathLabel>{String.raw`\mathcal R(U_R)`}</MathLabel></strong><small>Rarefações e eventos associados a U_R</small></span><VisibilityEye checked={showRightStateRarefaction} onChange={()=>setShowRightStateRarefaction(v=>!v)} aria-label="Rarefações de U R" /></div>
      </div>
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="points" open><summary>Pontos no espaço de estados</summary><div className="statePanelSectionBody">
      <p className="statePanelHint">Controles sincronizados com Variedade → Pontos. Os estados não recebem levantamentos 3D automáticos.</p>
      {[{id:'left',tex:String.raw`U_L`,label:'Estado esquerdo',color:'#ff9f0a'},{id:'right',tex:String.raw`U_R`,label:'Estado direito',color:'#30d158'},{id:'fixed',tex:String.raw`U_*`,label:'Estado fixado',color:'#8da5b5'},{id:'middle',tex:String.raw`U_{M_i}`,label:'Estados intermediários',color:'#bf5af2'}].map(item=><div className="stateVisibilityRow" key={item.id} style={{'--visibility-color':item.color}}><span className="stateSwitchCopy"><strong><MathLabel>{item.tex}</MathLabel></strong><small>{item.label} · 2D</small></span><VisibilityEye checked={pointVisibility[item.id]} onChange={()=>onTogglePointVisibility?.(item.id)} aria-label={`Mostrar ${item.label}`}/></div>)}
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="arcs" open><summary>Arcos</summary><div className="statePanelSectionBody">
      <p className="statePanelHint">Espaço reservado para os controles de visibilidade de arcos geométricos e trechos de ondas reconstruídos. Os controles serão adicionados quando houver objetos matemáticos identificados.</p>
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="fields" open><summary>Campo de rarefação e hiperbolicidade</summary><div className="statePanelSectionBody">
      <div className="stateVisualizationOption">
        <div className="stateVisibilityRow" style={{"--visibility-color":"#87cefa"}}>
          <span className="stateSwitchCopy"><strong>Campo de rarefação</strong><small>Curvas integrais <MathLabel>{String.raw`\mathcal R_s`}</MathLabel> e <MathLabel>{String.raw`\mathcal R_f`}</MathLabel></small></span>
          <VisibilityEye checked={showRarefactionField} onChange={()=>setShowRarefactionField(value=>!value)} aria-label="Campo de rarefação" />
        </div>
      </div>
      <div className="stateVisualizationOption">
        <div className="stateVisibilityRow" style={{"--visibility-color":"#8da5b5"}}><span className="stateSwitchCopy"><strong>Hiperbolicidade</strong><small>Regiões de Δ no plano</small></span><VisibilityEye checked={showDiscriminant} onChange={()=>setShowDiscriminant(value=>!value)} aria-label="Regiões de hiperbolicidade" /></div>
        {showDiscriminant&&coincidenceAudit&&<div className="stateDeltaLegend" role="status"><strong>Verificação <MathLabel>{String.raw`\mathcal E\Rightarrow\Delta=0`}</MathLabel></strong>{['minus','plus'].map(side=>{const a=coincidenceAudit[side];return <small key={side}>π{side==='minus'?'₋':'₊'}: {a.inWindow} amostras na janela · {a.status==='no-samples'?'sem amostras para verificar':a.status==='sample-consistent'?`resíduos compatíveis (máx. ${a.maximumRelativeResidual.toExponential(2)})`:`${a.offLocus} amostras fora da tolerância (máx. ${a.maximumRelativeResidual.toExponential(2)})`}</small>})}<small>Diagnóstico numérico unidirecional: resíduos pequenos não demonstram que toda a curva Δ=0 esteja representada em 3D. A janela 3D pode limitar o levantamento.</small></div>}
        {showDiscriminant&&coincidenceCoverage&&<div className="stateDeltaLegend" role="status"><strong>Verificação <MathLabel>{String.raw`\Delta=0\Rightarrow\mathcal E`}</MathLabel></strong>{['minus','plus'].map(side=>{const a=coincidenceCoverage[side];return <small key={side}>π{side==='minus'?'₋':'₊'}: {a.status==='no-contour'?'sem segmentos Δ=0 detectados':a.status==='no-lift'?`sem segmentos projetados de ℰ (${a.contourSegments} segmentos de Δ=0)`:`${a.covered}/${a.contourSegments} segmentos de Δ=0 próximos da projeção de ℰ`}</small>})}<small>Comparação por distância, tolerância de duas células da malha. Diagnóstico local e aproximado; não detecta zeros isolados nem certifica levantamento global.</small></div>}
        {showDiscriminant&&coincidenceLifts&&(coincidenceLifts.points.length>0||coincidenceLifts.globalWarning)&&<div className="stateDeltaLegend" role="status"><strong>Levantamentos característicos de Δ=0</strong>{coincidenceLifts.points.map((point,i)=><small key={i}>({point.u.toPrecision(5)}, {point.v.toPrecision(5)}) · {point.directionCount} direções · {point.interpretation}</small>)}{coincidenceLifts.globalWarning&&<small>{coincidenceLifts.globalWarning}</small>}<small>Diagnóstico algébrico local; não certifica a existência nem a regularidade de uma componente de ℰ.</small></div>}
        {showDiscriminant&&coincidenceIncidence&&<div className="stateDeltaLegend" role="status"><strong>Incidência característica ao longo de Δ=0</strong><small>{coincidenceIncidence.segments} segmentos amostrados · incidência reduzida regular: {coincidenceIncidence.counts.regular} · degenerada: {coincidenceIncidence.counts.degenerate} · matriz escalar: {coincidenceIncidence.counts.scalar} · indeterminada/sem direção: {coincidenceIncidence.counts.uncertain+coincidenceIncidence.counts.missing}.</small><small>Regularidade de G: {coincidenceIncidence.manifold.regular} regulares · {coincidenceIncidence.manifold.singular} com posto insuficiente · {coincidenceIncidence.manifold.uncertain} inconclusivos · {coincidenceIncidence.manifold.scalar} escalares.</small><small>Conferência das cartas: {coincidenceIncidence.chartChecks.consistent} concordantes · {coincidenceIncidence.chartChecks.singleChart} em carta única · {coincidenceIncidence.chartChecks.disagreement} divergentes · {coincidenceIncidence.chartChecks.offLevel} não verificáveis.</small>{coincidenceIncidence.examples.map((q,i)=><small key={i}>({q.u.toPrecision(5)}, {q.v.toPrecision(5)}) · {q.status} ({q.kind})</small>)}<small>Regularidade do nível desingularizado G=0: posto 2 em {coincidenceIncidence.manifold.regular} amostras · posto insuficiente em {coincidenceIncidence.manifold.singular} · inconclusivas em {coincidenceIncidence.manifold.uncertain} · jacobiano escalar em {coincidenceIncidence.manifold.scalar}.</small>{coincidenceIncidence.manifoldExamples.map((q,i)=><small key={`manifold-${i}`}>DG em ({q.u.toPrecision(5)}, {q.v.toPrecision(5)}): {q.kind} · postos {q.ranks.join(", ")}</small>)}<small>{coincidenceIncidence.limitation}</small></div>}
        {showDiscriminant&&coincidenceDegeneracies&&<div className="stateDeltaLegend" role="status"><strong>Degenerações de Δ=0</strong><small>Tipo algébrico: {coincidenceDegeneracies.type}.</small>{coincidenceDegeneracies.isolatedPoints.map((point,i)=><small key={i}>Zero isolado: ({point.u.toPrecision(5)}, {point.v.toPrecision(5)}) · {point.kind} · {point.inWindow?'na janela':'fora da janela'}. Não é detectado pelo contorno de mudança de sinal.</small>)}{coincidenceDegeneracies.warning&&<small>{coincidenceDegeneracies.warning}</small>}<small>Diagnóstico algébrico aproximado; não certifica o levantamento em ℰ nem resolve degenerações próximas à tolerância.</small></div>}
        {showDiscriminant&&<div className="stateDeltaLegend"><span><i className="stateDeltaBlue"/>Δ &gt; 0</span><span><i className="stateDeltaRed"/>Δ &lt; 0</span><span><i className="stateDeltaLine"/>Δ = 0</span><small>Contorno numérico aproximado; não indica admissibilidade.</small></div>}
      </div>
    </div></details>
    <details className="statePanelSection workspaceDisclosure" data-activity-section="view" open><summary>Janela de visualização</summary><div className="statePanelSectionBody"><div className="stateViewportCompact"><p className="statePanelHint">Limites visíveis do plano (u, v).</p><div className="stateViewportFieldGrid">{[['uMin','u mín.'],['uMax','u máx.'],['vMin','v mín.'],['vMax','v máx.']].map(([key,label])=><label key={key}>{label}<input type="number" step="any" value={windowText[key]} onChange={e=>{const raw=e.target.value;setWindowText(t=>({...t,[key]:raw}));const n=raw.trim()===''?null:finiteNumber(raw);if(n!==null){const next={...window,[key]:n};if(validWindow(next)){setWindow(next);setWindowSaved(false)}}}} onBlur={()=>commitBound(key)} onKeyDown={e=>onBoundKey(e,key)}/></label>)}</div><button type="button" className="stateViewportFit" onClick={fitGeometry}>Ajustar à geometria</button><button type="button" className="stateViewportFit" onClick={saveCurrentWindow} title="Guardar os limites atuais dos eixos u e v neste navegador">{windowSaved?'✓ Coordenadas guardadas':'Guardar coordenadas atuais'}</button><button type="button" className="stateViewportFit" onClick={restoreSavedWindow} title="Recuperar os limites dos eixos u e v guardados neste navegador">Recuperar coordenadas guardadas</button>{restoreMessage&&<small role="status" className="statePanelHint">{restoreMessage}</small>}</div></div></details>
    {allProfiles.length>0&&<details className="statePanelSection workspaceDisclosure" data-activity-section="chains" open><summary>Cadeias candidatas</summary><div className="statePanelSectionBody"><div className="stateProjectionControls"><div><b>Inspeção conjunta da cadeia candidata</b><small>Seleção compartilhada com Espaço físico. O traçado é uma projeção do candidato amostrado, não uma certificação entrópica.</small></div><label>Cadeia <select aria-label="Cadeia candidata para inspeção" value={activeProfile?selectedCandidateIndex:-1} onChange={e=>onSelectCandidate?.(Number(e.target.value))}><option value={-1}>Nenhuma</option>{allProfiles.map((q,i)=><option key={i} value={i}>Cadeia {i+1} · {q.kind}</option>)}</select></label>{activeProfile&&<small>U_M = ({activeStates[1]?.map(v=>v.toPrecision(5)).join(', ')}) · {activeProfile.kind} · admissibilidade não certificada</small>}{activeProfile&&<div className="stateProjectionControls" style={{gap:8}}><div className="stateVisibilityRow" style={{'--visibility-color':'#64d2ff',opacity:canAnimateShock||canAnimateRarefaction?1:0.5}}><span className="stateSwitchCopy"><strong>Animar fluxo da cadeia</strong><small>Movimento contínuo sobre os arcos</small></span><VisibilityEye checked={animateCandidateFlow} onChange={()=>{if(canAnimateShock||canAnimateRarefaction)setAnimateCandidateFlow(value=>!value)}} aria-label="Animar fluxo da cadeia" /></div><label>Velocidade <select aria-label="Velocidade da animação da cadeia" value={candidateFlowSpeed} onChange={e=>setCandidateFlowSpeed(Number(e.target.value))} disabled={!canAnimateShock&&!canAnimateRarefaction}><option value={0.5}>0,5×</option><option value={1}>1×</option><option value={1.5}>1,5×</option><option value={2}>2×</option><option value={3}>3×</option></select></label><small>Tracejado em movimento contínuo sobre os arcos reconstruídos. Não representa o tempo físico da EDP. {(!canAnimateShock||!canAnimateRarefaction)?'Trechos ainda não reconstruídos permanecem sem animação.':''}</small></div>}</div></div></details>}
      </div></WorkspaceDrawer>
    <aside className="stateRightPanel" aria-label="Inspeção científica no painel esquerdo">
      <details className="stateRightDrawer" open><summary>Inspeção científica <span aria-hidden="true">◧</span></summary><div className="stateRightContent">
    <div className="stateSelectedSummary" aria-label="Estados selecionados"><strong>Estados no plano</strong>
      {fixedState?<div><span>U*</span><output>({fixedState[0].toPrecision(5)}, {fixedState[1].toPrecision(5)})</output></div>:<small>Selecione U* no gráfico para visualizar suas coordenadas.</small>}
      {['left','right'].map(side=>riemannStates?.[side]&&<div key={side}><span><MathLabel>{side==='left'?String.raw`U_L`:String.raw`U_R`}</MathLabel></span><output>({riemannStates[side][0].toPrecision(5)}, {riemannStates[side][1].toPrecision(5)})</output></div>)}
    </div>
    <div className="projectedCurveInspector" role="region" aria-label="Resultado da inspeção do gráfico"><div className="stateInspectionSummary"><b>Objeto selecionado</b><small>{selectedProjectedCurve?'Curva projetada em inspeção':inspectCurves?'Clique em uma curva para examinar seus dados.':'Use a ferramenta ◎ na barra do gráfico para inspecionar curvas.'}</small></div>{selectedProjectedCurve&&<div role="status"><b>{selectedProjectedCurve.kind}</b> · {selectedProjectedCurve.id} · {selectedProjectedCurve.branch??'família não informada'} · projeção {selectedProjectedCurve.sourceSide}{overlapHits.length>1&&<> · {overlapHits.length} curvas próximas <button type="button" onClick={()=>setSelectedCurveKey(current=>nextProjectedCurveHit(overlapHits.map(key=>({curve:{key}})),current))}>Próxima curva</button></>}<button type="button" onClick={()=>{setSelectedCurveKey(null);setOverlapHits([])}}>Limpar destaque</button></div>}{selectedProjectedCurve&&<details className="projectedCurveProvenance"><summary>Correspondência geométrica · diagnóstico da curva</summary>{selectedCurveSample&&<div className="projectedCurveSample"><small><b>Amostra {selectedCurveSample.index+1}</b> · estado variável ({selectedCurveSample.state.map(v=>v.toPrecision(6)).join(', ')}) · distância do clique {selectedCurveSample.distance.toFixed(1)} px</small>{sampledShockDiagnostic?.kind==='jump'&&<small>Rankine–Hugoniot: s={sampledShockDiagnostic.speed.toPrecision(6)} · resíduo relativo={sampledShockDiagnostic.relativeResidual.toExponential(2)} · {sampledShockDiagnostic.rankineHugoniot?'compatível na tolerância do diagnóstico':'não certificado na tolerância do diagnóstico'}. Levantamento 3D verificado separadamente abaixo.</small>}{sampledShockDiagnostic?.kind==='coincident'&&<small>Estados coincidentes: a velocidade de choque não é determinada por este par.</small>}</div>}{sampledWaveLift&&<div className="projectedCurveSample"><small><b>Levantamento na carta z:</b> {sampledWaveLift.kind==='regular'?`τ=${sampledWaveLift.tau.toPrecision(6)}, Y=${sampledWaveLift.Y.toPrecision(6)}, z=${sampledWaveLift.z.toPrecision(6)} · erro projeções=${sampledWaveLift.relativeProjectionError.toExponential(2)} · resíduo RH=${sampledWaveLift.relativeRHResidual.toExponential(2)}`:sampledWaveLift.kind==='not-certified'?`não certificado · erro projeções=${sampledWaveLift.relativeProjectionError.toExponential(2)} · resíduo RH=${sampledWaveLift.relativeRHResidual.toExponential(2)}`:`indisponível (${sampledWaveLift.kind})`}</small>{sampledWaveLift.kind==='regular'&&<button type="button" onClick={()=>onInspectWavePoint3D?.({tau:sampledWaveLift.tau,Y:sampledWaveLift.Y,zc:sampledWaveLift.zc})}>Inspecionar amostra na Variedade 3D</button>}</div>}{selectedCurveProvenance?<><small>{selectedCurveProvenance.source==='forward'?'A curva é uma amostra de π₊(ℋᶠᵒʳʷ(U*)). A fibra de origem tem π₋(P)=U*.':'A curva é uma amostra de π₋(ℋᵇᵃᶜᵏ(U*)). A fibra de origem tem π₊(P)=U*.'} A correspondência ponto a ponto com a curva 3D ainda não está implementada.</small><button type="button" onClick={()=>onInspectFibres3D?.(selectedCurveProvenance.fixedState)}>Ver fibras de origem em 3D</button></>:<small>Este traçado de rarefação foi calculado no plano. Ainda não há uma identificação ponto a ponto certificada com uma curva da variedade 3D; nenhuma origem 3D será presumida.</small>}</details>}</div>
    {projectedPair&&<div className="projectionPairComparison" role="group" aria-label="Comparar projeções do mesmo ponto tridimensional"><strong>Projeções do mesmo P</strong><small>Escolha uma projeção para destacar seu estado no gráfico. O ponto P permanece selecionado na variedade.</small><button type="button" className={stateProjection==='minus'?'active':''} aria-pressed={stateProjection==='minus'} onClick={()=>setStateProjection('minus')}>π₋(P) · ({projectedPair.minus.u.toPrecision(6)}, {projectedPair.minus.v.toPrecision(6)})</button><button type="button" className={stateProjection==='plus'?'active':''} aria-pressed={stateProjection==='plus'} onClick={()=>setStateProjection('plus')}>π₊(P) · ({projectedPair.plus.u.toPrecision(6)}, {projectedPair.plus.v.toPrecision(6)})</button>{projectedPairCoincident&&<small>As duas projeções coincidem numericamente neste ponto.</small>}</div>}
    {requestedProjectionPoint&&<div className="projectionSelectedPoint" role="status"><strong>{stateProjection==='minus'?'π₋(P) = U₋':'π₊(P) = U₊'}</strong> · ({requestedProjectionPoint.u.toPrecision(7)}, {requestedProjectionPoint.v.toPrecision(7)}){!requestedProjectionVisible&&<> · fora da janela atual <button type="button" onClick={()=>{const next={uMin:Math.min(window.uMin,requestedProjectionPoint.u-0.5),uMax:Math.max(window.uMax,requestedProjectionPoint.u+0.5),vMin:Math.min(window.vMin,requestedProjectionPoint.v-0.5),vMax:Math.max(window.vMax,requestedProjectionPoint.v+0.5)};setWindow(next);setWindowText(Object.fromEntries(Object.entries(next).map(([k,v])=>[k,String(v)])))}}>Incluir na janela</button></>}</div>}
      <details className="stateExtraDiagnostics"><summary>Informações e diagnósticos adicionais</summary><div className="stateExtraDiagnosticsContent">
    {placement&&<p className="stateWindowNotice" role="status">Posicionando {placement==='left'?'U_L':'U_R'} — mova o mouse sobre o plano, clique para fixar ou pressione Esc para cancelar.</p>}
    {riemannStates&&['left','right'].some(side=>{const state=riemannStates[side];if(!state)return false;const [u,v]=state;return u<view.uMin||u>view.uMax||v<view.vMin||v>view.vMax})&&<p className="stateWindowNotice">Um dos estados de Riemann está fora da janela atual. Ajuste os limites (u,v).</p>}
    {selected&&!selectedVisible&&<p className="stateWindowNotice">U* está fora da janela atual. Use valores de janela adequados para visualizá-lo; “Ajustar à geometria” mantém o foco nas curvas científicas.</p>}
    {stateRarefactions.some(branch=>branch.events.length>0)&&<p className="stateWindowNotice">Pontos amarelos: candidatos numéricos a ∇λᵢ·rᵢ=0 (amostras próximas de zero ou mudança de sinal refinada por bisseção no segmento amostrado). A derivada s′(0) nos tooltips é calculada na coincidência pela Hessiana do fluxo; não certifica contato com S± para saltos finitos nem ondas compostas admissíveis.</p>}
    <p className="stateWindowNotice">Trechos candidatos com ordenação da velocidade característica: a partir de U_L, λ deve crescer; a partir de U_R, λ deve diminuir na direção do estado intermediário. Laranja = U_L; verde = U_R; tracejado longo = lenta, curto = rápida. O filtro é necessário, mas não certifica admissibilidade nem uma solução de Riemann.</p>
    <section className="riemannDiagnosticLab" aria-label="Diagnósticos matemáticos do problema de Riemann">
      <header className="riemannLabHeader"><h3>Laboratório de análise numérica</h3><p>Os diagnósticos permanecem disponíveis sem ocupar a área principal do plano (u,v). Resultados numéricos não certificam admissibilidade entrópica.</p></header>
      <details className="riemannLabSection scientificDisclosure"><summary>Construção e verificação das cadeias <span>Rankine–Hugoniot · estados intermediários · ondas</span></summary><div className="riemannLabContent scientificDisclosureBody">
    <div className="stateProjectionControls" role="status"><div><b>Diagnóstico da conexão direta U_L → U_R</b><small>{directJump.kind==='missing-states'?'Posicione ambos os estados para examinar a condição de Rankine–Hugoniot.':directJump.kind==='coincident'?'Os estados coincidem; não há descontinuidade direta.':`Velocidade candidata s = ${directJump.speed.toPrecision(7)} · resíduo relativo RH = ${directJump.relativeResidual.toExponential(3)} · ${directJump.rankineHugoniot?'RH satisfeita':'RH não satisfeita'} · ${directJump.spectralStatus==='nonhyperbolic-endpoint'?'ao menos um extremo sem espectro real':'espectros reais nos extremos'}.`}</small><small>Teste apenas de um salto direto: não constrói estado intermediário, não verifica entropia/Liu e não resolve o problema de Riemann.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Cadeias de duas ondas de choque — ordenação</b><small>Estados intermediários examinados: {shockCandidates.length}; Rankine–Hugoniot nos dois saltos e velocidades estritamente ordenadas: {shockCandidates.filter(q=>q.chainEvidence.status==='ordered-rh-candidate').length}; demais candidatos: {shockCandidates.filter(q=>q.chainEvidence.status!=='ordered-rh-candidate').length}. Com famílias estritas lenta → rápida e desigualdades de Lax nos extremos: {shockCandidates.filter(q=>q.familyEvidence.status==='ordered-lax-endpoint-candidate').length}. São verificações necessárias, não certificações entrópicas ou soluções do problema de Riemann.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Perfis autossimilares candidatos U(x/t)</b><small>Dois choques: {profileCandidates.twoShock.length}; rarefação–choque ou choque–rarefação: {profileCandidates.mixed.length}. Perfis por partes com estados constantes, saltos e leques interpolados em velocidade característica. A construção é amostrada e não certifica admissibilidade entrópica nem seleciona uma solução única.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Cadeias mistas com U_M — rarefação e choque</b><small>Interseções aproximadas: {mixedCandidates.length}; rarefação lenta → choque rápido: {mixedCandidates.filter(q=>q.kind==='rarefaction-shock'&&q.family==='slow').length}; choque lento → rarefação rápida: {mixedCandidates.filter(q=>q.kind==='shock-rarefaction'&&q.family==='fast').length}; candidatos com RH, velocidades ordenadas e Lax estrito: {mixedCandidates.filter(q=>q.evidence.status==='mixed-ordered-lax-candidate').length}. Liu nas cadeias mistas: {mixedLiuCandidates.filter(q=>q.liu.status==='liu-violation-detected').length} violações amostradas; {mixedLiuCandidates.filter(q=>q.liu.status==='no-sampled-violation').length} sem violação nas amostras; {mixedLiuCandidates.filter(q=>q.liu.status!=='liu-violation-detected'&&q.liu.status!=='no-sampled-violation').length} não concluídos. Sem certificação entrópica.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Interseções das Hugoniot — candidatos U_M</b><small>{!riemannStates?.left||!riemannStates?.right?'Posicione U_L e U_R para procurar estados intermediários.':`${shockCandidates.length} interseção(ões) encontradas nas poligonais amostradas.`} A ausência de interseções não prova inexistência de solução.</small>{shockCandidates.slice(0,5).map((q,i)=><small key={i}>U_M {i+1} = ({q.middle[0].toPrecision(6)}, {q.middle[1].toPrecision(6)}) · s₁={q.first.speed.toPrecision(5)} · s₂={q.second.speed.toPrecision(5)} · {q.ordered?'s₁ < s₂':'velocidades fora de ordem'} · {q.rhBoth?'RH numérica satisfeita':'RH numérica não satisfeita'}</small>)}<small>Interseções geométricas de duas curvas de choque amostradas; não verifica entropia, famílias características, perfis viscosos nem conexões por rarefação.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Contato sônico de amplitude finita — candidatos</b><small>Hugoniot forward de U_L: S⁺ (s = λ(U₊)); Hugoniot backward de U_R: S⁻ (s = λ(U₋)). Interseções aproximadas: forward {finiteContacts.left.length}; backward {finiteContacts.right.length}. Refinados numericamente: {finiteContacts.left.filter(e=>e.refinement.status==='converged').length} forward; {finiteContacts.right.filter(e=>e.refinement.status==='converged').length} backward. Não certifica admissibilidade.</small></div></div>
      </div></details>
      <details className="riemannLabSection scientificDisclosure"><summary>Admissibilidade e conexões compostas <span>Lax · Liu · contatos sônicos</span></summary><div className="riemannLabContent scientificDisclosureBody">
    <div className="stateProjectionControls" role="status"><div><b>Liu — Hugoniot forward amostrada</b><small>Contatos examinados: {forwardLiu.length}; arcos orientados localizados: {forwardLiu.filter(q=>q.arcStatus==='sampled-arc').length}; compatíveis nas amostras: {forwardLiu.filter(q=>q.status==='sampled-liu-compatible').length}; violações: {forwardLiu.filter(q=>q.status==='sampled-liu-violation').length}. Arcos não resolvidos não são considerados admissíveis. Sem certificação global.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Liu — arcos continuados por sementes</b><small>Contatos examinados: {seededForwardLiu.length}; violações numéricas detectadas: {seededForwardLiu.filter(q=>q.assessment?.status==='liu-violation-detected').length}; sem violação encontrada nos testes finitos: {seededForwardLiu.filter(q=>q.assessment?.status==='no-liu-violation-detected').length}; inconclusivos ou sem arco: {seededForwardLiu.filter(q=>!q.assessment||q.assessment.status==='liu-inconclusive').length}. Nenhum resultado certifica Liu global ou admissibilidade entrópica.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Hugoniot backward — continuação direta</b><small>Contatos sônicos refinados examinados: {seededBackwardArcs.length}; arcos conectados numericamente: {seededBackwardArcs.filter(q=>q.status==='backward-arc-numerically-connected').length}; não resolvidos: {seededBackwardArcs.filter(q=>q.status!=='backward-arc-numerically-connected').length}. A continuação fixa U_R e varia U₋. A condição de Liu backward é avaliada separadamente abaixo; não há certificação de admissibilidade.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Liu — Hugoniot backward amostrada</b><small>Contatos examinados: {backwardLiu.length}; violações detectadas: {backwardLiu.filter(q=>q.status==='preliminary-sampled-backward-liu-violation').length}; sem violação nas amostras: {backwardLiu.filter(q=>q.status==='preliminary-sampled-backward-liu-compatible').length}; inconclusivos: {backwardLiu.filter(q=>!q.status?.startsWith('preliminary-sampled-backward-liu-')).length}. A desigualdade backward é inversa à forward, com U_R fixo. Não certifica Liu global nem entropia.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Ondas compostas — critérios unificados</b><small>Choque–rarefação: {compositeLiu.filter(q=>q.evidence.orientation==='forward').length}; rarefação–choque: {compositeLiu.filter(q=>q.evidence.orientation==='backward').length}. Ordenação geométrica: {compositeLiu.filter(q=>q.evidence.geometricOrdering==='compatible-in-sampled-trajectory').length}; Lax fraco nos extremos: {compositeLiu.filter(q=>q.evidence.weakLax==='satisfied-at-endpoints').length}; violação de Liu detectada: {compositeLiu.filter(q=>q.evidence.classification==='numerical-liu-violation').length}; sem violação nos testes finitos: {compositeLiu.filter(q=>q.evidence.classification==='no-violation-in-finite-tests').length}. Nenhuma onda é certificada entrópica.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Liu — seleção preliminar das ondas compostas</b><small>Conexões choque–rarefação com Lax fraco e violação de Liu detectada: {compositeLiu.filter(q=>q.liuStatus==='violation-detected').length}; sem violação detectada nos testes finitos: {compositeLiu.filter(q=>q.liuStatus==='no-violation-detected').length}; inconclusivas: {compositeLiu.filter(q=>q.liuStatus==='inconclusive').length}. Ambas as orientações são verificadas com seus próprios arcos; nenhuma conexão é certificada admissível.</small></div></div>
    <div className="stateProjectionControls" role="status"><div><b>Conexões choque–rarefação / rarefação–choque</b><small>Contatos sônicos refinados projetados em arcos característicos reintegrados por RK4: {sonicConnections.filter(q=>['ordered-geometric-candidate','weak-lax-candidate'].includes(q.status)).length} coincidências com ordenação característica; {sonicConnections.filter(q=>q.status==='weak-lax-candidate').length} também satisfazem as desigualdades fracas de Lax nos extremos. Diagnóstico necessário, sem certificação entrópica ou solução completa.</small></div></div>
      </div></details>
      <details className="riemannLabSection scientificDisclosure"><summary>Geometria espectral <span>Característica <MathLabel>{String.raw`\mathcal C`}</MathLabel> · levantamentos</span></summary><div className="riemannLabContent scientificDisclosureBody">
    <div className="stateProjectionControls" role="status"><div><b>Hugoniot ∩ característica 𝒞 — diagnóstico espectral</b>
      {['forward','backward'].map(role=>{const q=characteristicIntersections[role];const title=role==='forward'?'ℋ forward(U_L) ∩ 𝒞':'ℋ backward(U_R) ∩ 𝒞';return <div key={role}><small><strong>{title}</strong>: {q.kind==='missing-state'?'posicione o estado':q.kind==='elliptic'?'região elíptica: nenhuma direção característica real':q.kind==='scalar-degenerate'?'Jacobiano escalar: todas as direções são características':q.kind==='repeated-defective'?'autovalor real duplo: uma direção projetiva':`duas direções reais (${q.directions.length})`}</small>{q.directions.map((d,i)=><small key={i}>{d.branch==='slow'?'𝒞_s':d.branch==='fast'?'𝒞_f':'autovalor duplo'} · {d.chart==='finite'?`z=${d.z.toPrecision(6)}`:'Z=0 (carta recíproca)'} · λ={d.speed.toPrecision(6)} · resíduo={d.eigenResidual.toExponential(2)} · raiz {d.projectiveContact==='multiple'?'múltipla':'simples'} · derivada angular={d.projectiveDerivative.toExponential(2)} · incidência {d.incidenceRegularity==='regular'?'regular':'degenerada'} · posto DG={d.boundary.rank}/2 · {d.boundary.regularLevelSet?'nível regular':'regularidade não certificada'} · dimensão fibra {role==='forward'?d.boundary.forwardFibreDimension??'—':d.boundary.backwardFibreDimension??'—'} · fibra × 𝒞 {d.boundary.transversality.classification==='transverse'?'transversal':d.boundary.transversality.classification==='tangent'?'tangente em primeira ordem':'indeterminada'}</small>)}</div>})}
      <small>Classificação algébrica dos levantamentos característicos na coincidência (Y=0), inclusive a direção no infinito projetivo. A multiplicidade refere-se à equação projetiva de autovetores, não certifica tangência geométrica da fibra regular. Regularidade e transversalidade referem-se somente à incidência reduzida q(U,[r])=0; o posto DG na fronteira característica certifica apenas a regularidade local do nível desingularizado; não certifica tangência da fibra com a característica nem admissibilidade. Não é uma contagem certificada de interseções da curva regular amostrada, nem teste de admissibilidade.</small></div></div>
      </div></details>
      <details className="riemannLabSection scientificDisclosure"><summary>Condicionamento, convergência e sensibilidade <span>Ferramentas avançadas de U_M</span></summary><div className="riemannLabContent scientificDisclosureBody">
    {activeProfile&&allProfiles.length>1&&<div className="stateProjectionControls"><div><b>Comparar sensibilidade entre cadeias</b><small>Comparação local de raízes na projeção atual; cada cadeia conserva seu próprio ramo e segmento de Hugoniot. Diferenças de derivadas não significam equivalência geométrica.</small></div><label>Segunda cadeia <select aria-label="Segunda cadeia para comparação de sensibilidade" value={comparisonIndex} onChange={e=>setComparisonIndex(Number(e.target.value))}><option value={-1}>Não comparar</option>{allProfiles.map((q,i)=><option key={i} value={i} disabled={i===selectedCandidateIndex}>Cadeia {i+1} · {q.kind}</option>)}</select></label>{comparisonIndex>=0&&(comparisonIndex===selectedCandidateIndex?<small>Selecione duas cadeias distintas.</small>:sensitivityComparison.status==='unavailable'?<small>Diagnósticos não disponíveis para ambas as cadeias nesta projeção. Nenhum valor foi presumido.</small>:<div style={{overflowX:'auto'}}><small>{sensitivityComparison.comparableCount} de {sensitivityComparison.rows.length} derivadas centrais comparáveis. Maior diferença absoluta observada: {sensitivityComparison.comparableCount?sensitivityComparison.largestDerivativeDifference.toExponential(3):'não disponível'}.</small><table style={{width:'100%',fontSize:'0.8rem',borderCollapse:'collapse',textAlign:'right'}}><thead><tr><th scope="col">Coeficiente</th><th scope="col">dt/dp · selecionada</th><th scope="col">dt/dp · comparação</th><th scope="col">Diferença</th></tr></thead><tbody>{sensitivityComparison.rows.map(r=><tr key={r.coefficient}><th scope="row" style={{textAlign:'left'}}>{r.coefficient}</th><td>{r.derivativeA===null?'inconclusivo':r.derivativeA.toExponential(3)}</td><td>{r.derivativeB===null?'inconclusivo':r.derivativeB.toExponential(3)}</td><td>{r.difference===null?'—':r.difference.toExponential(3)}</td></tr>)}</tbody></table><small>t é o parâmetro de cada segmento amostrado, não o tempo físico. Segmentos diferentes têm parametrizações distintas; diferenças entre dt/dp não são medidas invariantes de sensibilidade de U_M.</small><small><b>Comparação nas coordenadas (u,v):</b> {coordinateComparison.comparableCount} coeficientes com derivadas disponíveis em ambas as cadeias.</small><table style={{width:'100%',fontSize:'0.8rem',borderCollapse:'collapse',textAlign:'right'}}><thead><tr><th scope="col">Coeficiente</th><th scope="col">d(u,v)/dp · selecionada</th><th scope="col">d(u,v)/dp · comparação</th><th scope="col">Diferença (u,v)</th></tr></thead><tbody>{coordinateComparison.rows.map(r=><tr key={r.coefficient}><th scope="row" style={{textAlign:'left'}}>{r.coefficient}</th>{[r.derivativeA,r.derivativeB,r.difference].map((v,i)=><td key={i}>{v?`(${v[0].toExponential(2)}, ${v[1].toExponential(2)})`:'inconclusivo'}</td>)}</tr>)}</tbody></table><small>As derivadas em (u,v) correspondem à raiz acompanhada em cada segmento de Hugoniot mantido fixo. Não representam a derivada do estado intermediário obtido por reconstrução integral da cadeia após perturbar o fluxo; não constituem medida de estabilidade entrópica.</small></div>)}</div>}
    {mixedMiddleSensitivity&&<div className="stateProjectionControls"><div><b>Sensibilidade reconstruída de U_M — cadeia mista</b><small>O ramo característico é reintegrado para cada perturbação do fluxo, mantendo U_L e U_R fixos. A interseção com o locus de Hugoniot é localizada numericamente; raízes não identificadas ou ambíguas permanecem inconclusivas. Sem certificação entrópica.</small></div><small><b>Transversalidade local:</b> {mixedMiddleSensitivity.transversality?.angleIndicator!==null&&Number.isFinite(mixedMiddleSensitivity.transversality?.angleIndicator)?`${mixedMiddleSensitivity.transversality.status==='near-tangential-numerical'?'quase tangencial':'transversal numérica'} · |cos(ângulo entre ∇D e tangente)| = ${mixedMiddleSensitivity.transversality.angleIndicator.toExponential(3)}`:`não determinada (${mixedMiddleSensitivity.transversality?.status??mixedMiddleSensitivity.status})`}. Indicador calculado com a direção característica local em U_M; não certifica tangência exata nem bifurcação.</small><small><b>Erro angular da poligonal:</b> {Number.isFinite(mixedMiddleSensitivity.chordError?.angleDegrees)?`${mixedMiddleSensitivity.chordError.angleDegrees.toFixed(3)}° entre a corda amostrada e a direção característica em U_M · ${mixedMiddleSensitivity.chordError.status==='aligned-numerical'?'alinhamento numérico':'discrepância angular'}`:`indisponível (${mixedMiddleSensitivity.chordError?.status??'sem diagnóstico'})`}. Ângulo não orientado, de 0° a 90°; não representa erro certificado da curva integral.</small><details><summary>Convergência angular ao refinar o passo da rarefação</summary><small>Reintegração do mesmo ramo, com passos sucessivamente reduzidos. Cada corda é localizada pela proximidade ao U_M de referência; não há reconstrução da interseção de Hugoniot em cada nível nem estimativa rigorosa de convergência.</small><div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:'0.8rem'}}><thead><tr><th>Passo máximo</th><th>Ângulo</th><th>Distância a U_M</th><th>Estado</th></tr></thead><tbody>{(mixedMiddleSensitivity.angularConvergence?.rows??[]).map((r,i)=><tr key={i}><td>{r.step.toExponential(2)}</td><td>{Number.isFinite(r.angleDegrees)?`${r.angleDegrees.toFixed(4)}°`:'—'}</td><td>{Number.isFinite(r.distanceToMiddle)?r.distanceToMiddle.toExponential(2):'—'}</td><td>{r.status}</td></tr>)}</tbody></table></div><small>Resultado: {mixedMiddleSensitivity.angularConvergence?.status??'não disponível'}. A redução do ângulo é apenas evidência numérica local.</small></details><details><summary>Convergência da posição de U_M · rarefação e Hugoniot</summary><small>Cada nível reintegra a rarefação e resolve novamente a incidência de Rankine–Hugoniot nos segmentos amostrados. A raiz deve ser única na vizinhança de referência; não há prova de convergência ou admissibilidade.</small><div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:'0.8rem'}}><thead><tr><th>Passo</th><th>u_M</th><th>v_M</th><th>Distância à referência</th><th>Resíduo RH</th><th>Estado</th></tr></thead><tbody>{(mixedMiddleSensitivity.middleConvergence?.rows??[]).map((r,i)=><tr key={i}><td>{r.step.toExponential(2)}</td><td>{r.middle?r.middle[0].toFixed(6):'—'}</td><td>{r.middle?r.middle[1].toFixed(6):'—'}</td><td>{Number.isFinite(r.distanceToReference)?r.distanceToReference.toExponential(2):'—'}</td><td>{Number.isFinite(r.residual)?r.residual.toExponential(2):'—'}</td><td>{r.status}</td></tr>)}</tbody></table></div><small>Resultado: {mixedMiddleSensitivity.middleConvergence?.status??'não disponível'}. Diferenças sucessivas: {(mixedMiddleSensitivity.middleConvergence?.successiveDistances??[]).map(v=>v.toExponential(2)).join(' · ')||'—'}. Ordem observada: {(mixedMiddleSensitivity.middleConvergenceOrder?.orders??[]).map(r=>r.status==='estimated'?r.value.toFixed(2):'indeterminada').join(' · ')||'—'}. Acompanhamento do ramo: {mixedMiddleSensitivity.middleConvergenceOrder?.branchStatus??'não determinado'}. Estimativas baseadas em diferenças entre malhas, sem prova de convergência nem identificação global do ramo.</small></details>{mixedMiddleSensitivity.rows.length?<details><summary>Derivadas por coeficiente · {mixedMiddleSensitivity.rows.filter(r=>r.derivative).length}/10 acompanhamentos bilaterais</summary><div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:'0.8rem'}}><thead><tr><th>Coeficiente</th><th>∂u_M/∂p</th><th>∂v_M/∂p</th><th>Estado</th></tr></thead><tbody>{mixedMiddleSensitivity.rows.map(r=><tr key={r.coefficient}><th>{r.coefficient}</th><td>{r.derivative?r.derivative[0].toExponential(3):'—'}</td><td>{r.derivative?r.derivative[1].toExponential(3):'—'}</td><td>{r.derivative?'acompanhado':`${r.negative.status} / ${r.positive.status}`}</td></tr>)}</tbody></table></div></details>:<small>Reconstrução não disponível: {mixedMiddleSensitivity.status}.</small>}</div>}
    {implicitMiddleSensitivity&&<div className="stateProjectionControls"><div><b>Sensibilidade implícita de U_M — dois choques</b><small>Interseção local dos loci D(U_L,U_M)=0 e D(U_M,U_R)=0, mantendo U_L e U_R fixos. Não é reconstrução global dos ramos nem certificação entrópica.</small></div>{implicitMiddleSensitivity.status==='local-implicit-derivative'?<details><summary>Derivadas locais por coeficiente (10) · determinante normalizado {implicitMiddleSensitivity.normalizedDeterminant.toExponential(2)}</summary><div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:'0.8rem'}}><thead><tr><th>Coeficiente</th><th>∂u_M/∂p</th><th>∂v_M/∂p</th></tr></thead><tbody>{implicitMiddleSensitivity.rows.map(r=><tr key={r.coefficient}><th>{r.coefficient}</th><td>{r.derivative[0].toExponential(3)}</td><td>{r.derivative[1].toExponential(3)}</td></tr>)}</tbody></table></div></details>:<small>Derivadas não disponíveis: {implicitMiddleSensitivity.status}. Interseção degenerada ou condições RH não verificadas.</small>}</div>}
      </div></details>
      <details className="riemannLabSection scientificDisclosure"><summary>Proveniência geométrica <span>Ramos e trechos de Hugoniot</span></summary><div className="riemannLabContent scientificDisclosureBody">
    {activeProfile&&<div className="stateProjectionControls" role="status"><div><b>Trecho da Hugoniot associado a U_M</b><small>{activeHugoniotArc?`Destacado em amarelo na projeção ${stateProjection==='plus'?'π₊ (Hugoniot forward de U_L)':'π₋ (Hugoniot backward de U_R)'}. ${activeHugoniotArc.refinement==='rankine-hugoniot-segment'?'Extremo corrigido numericamente por Rankine–Hugoniot no segmento amostrado':'Extremo interpolado geometricamente'}; desvio máximo dos extremos: ${activeHugoniotArc.endpointError.toExponential(2)}. ${activeHugoniotArc.rankineHugoniotRelativeResidual!==null?`Resíduo relativo RH: ${activeHugoniotArc.rankineHugoniotRelativeResidual.toExponential(2)}.`:''} A curva entre os vértices continua amostrada, não certificada.`:'Nenhum trecho da Hugoniot foi identificado nesta projeção com a tolerância visual atual. Para uma cadeia mista, a onda desta projeção também pode ser uma rarefação.'} O leque de rarefação selecionado permanece destacado em azul. Trechos de onda não reconstruídos não são substituídos por retas entre os estados. Não há certificação entrópica.</small>{activeHugoniotArc&&<div className="rhRootDiagnostics"><small><b>Condicionamento da raiz:</b> {activeHugoniotArc.rootCondition==='transverse-numerical'?'transversal numérica':activeHugoniotArc.rootCondition==='near-tangential'?'quase tangencial':activeHugoniotArc.rootCondition==='segment-contained'?'segmento contido no locus':'não avaliado'} · inclinação normalizada: {Number.isFinite(activeHugoniotArc.normalizedDeterminantSlope)?activeHugoniotArc.normalizedDeterminantSlope.toExponential(3):'não disponível'} · distância paramétrica à raiz vizinha: {Number.isFinite(activeHugoniotArc.nearestRootParameterDistance)?activeHugoniotArc.nearestRootParameterDistance.toExponential(3):'não detectada'}.</small><small><b>Sensibilidade aos coeficientes:</b> {activeHugoniotArc.coefficientSensitivity?`${activeHugoniotArc.coefficientSensitivity.status==='locally-tracked'?'raízes acompanhadas localmente':'acompanhamento inconclusivo'} · maior deslocamento de parâmetro: ${Number.isFinite(activeHugoniotArc.coefficientSensitivity.maximumParameterShift)?activeHugoniotArc.coefficientSensitivity.maximumParameterShift.toExponential(3):'não disponível'} · perturbações sem raiz identificada: ${activeHugoniotArc.coefficientSensitivity.missingPerturbedRoots}`:'não avaliada'}.</small>{activeHugoniotArc.coefficientSensitivity?.trials?.length>0&&<details className="rhSensitivityDetails"><summary>Inspecionar perturbações por coeficiente ({activeHugoniotArc.coefficientSensitivity.trials.length})</summary><RiemannSensitivityPlot trials={activeHugoniotArc.coefficientSensitivity.trials}/><div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:'0.8rem',borderCollapse:'collapse',textAlign:'right'}}><thead><tr><th scope="col">Coeficiente</th><th scope="col">Passo h</th><th scope="col">Δt (−h)</th><th scope="col">Δt (+h)</th><th scope="col">dt/dp (central)</th></tr></thead><tbody>{activeHugoniotArc.coefficientSensitivity.trials.map(trial=><tr key={trial.coefficient}><th scope="row" style={{textAlign:'left'}}>{trial.coefficient}</th><td>{Number.isFinite(trial.step)?trial.step.toExponential(2):'—'}</td><td>{Number.isFinite(trial.minus)?trial.minus.toExponential(3):'não identificada'}</td><td>{Number.isFinite(trial.plus)?trial.plus.toExponential(3):'não identificada'}</td><td>{Number.isFinite(trial.centralDerivative)?trial.centralDerivative.toExponential(3):'inconclusivo'}</td></tr>)}</tbody></table></div><small>Δt é o deslocamento do parâmetro no segmento amostrado, não uma variação de tempo físico. A derivada central só é exibida quando ambas as raízes perturbadas foram acompanhadas.</small></details>}<small>Indicadores dependentes da escala, da tolerância e do passo de perturbação; não constituem prova de bifurcação, transversalidade exata ou admissibilidade entrópica.</small></div>}</div></div>}
    {activeProfile?.provenance&&<div className="stateProjectionControls" role="status"><div><b>Origem geométrica de cada onda</b><small>Dados do ramo usado na construção numérica da cadeia selecionada; não constituem prova de admissibilidade.</small>{activeProfile.provenance.waves.map((wave,i)=><p key={i}><b>{i+1}. {wave.type==='shock'?'Choque':'Rarefação'} {wave.family==='slow'?'lento':'rápido'}</b> · {wave.from} → {wave.to} · {wave.origin==='forward-hugoniot'?'ℋᶠᵒʳʷ(U_L)':wave.origin==='backward-hugoniot'?'ℋᵇᵃᶜᵏ(U_R)':'ramo característico amostrado'}{wave.segment!=null?` · trecho ${wave.segment}`:''}{wave.branchIndex!=null?` · segmento do leque ${wave.branchIndex}`:''}{Number.isFinite(wave.speed)?` · s=${wave.speed.toPrecision(5)}`:''}{Number.isFinite(wave.speedStart)&&Number.isFinite(wave.speedEnd)?` · λ: ${wave.speedStart.toPrecision(5)} → ${wave.speedEnd.toPrecision(5)}`:''}</p>)}<small>Junção: {activeProfile.provenance.intersection==='sampled-hugoniot-intersection'?'interseção de projeções de Hugoniot amostradas':'refinamento conjunto de rarefação e Hugoniot'}. {activeProfile.provenance.refinementStatus?`Refinamento: ${activeProfile.provenance.refinementStatus}. `:''}As conexões de choque não são trajetórias integrais.</small></div></div>}
      </div></details>
    </section>
    <div className="stateInspectionToggle"><label className="toggle"><input type="checkbox" checked={showInspectedState} onChange={e=>setShowInspectedState(e.target.checked)}/> mostrar projeção do ponto P atualmente inspecionado em 𝒲</label><small>Secundário: U₋, Ū e U₊ pertencem à inspeção 3D e não alteram U* nem a janela (u,v).</small></div>
    <div className="localChartLegend"><span><MathLabel>{String.raw`\mathcal R_s`}</MathLabel>: projeção de <MathLabel>{String.raw`\mathcal C_s`}</MathLabel></span><span><MathLabel>{String.raw`\mathcal R_f`}</MathLabel>: projeção de <MathLabel>{String.raw`\mathcal C_f`}</MathLabel></span>{showInspectedState&&<><span>π₋(P)=U₋=({minus.u.toFixed(5)}, {minus.v.toFixed(5)})</span><span>π₊(P)=U₊=({plus.u.toFixed(5)}, {plus.v.toFixed(5)})</span><span>Ū=({mean.u.toFixed(5)}, {mean.v.toFixed(5)})</span><span>s={Number.isFinite(speed)?speed.toFixed(6):'—'}</span></>}</div>
    <p className="localChartNote"><b>Projeção explícita:</b> U* pertence a 𝒰 e não é um ponto de 𝒲. Em π₋, a fibra forward π₋⁻¹(U*) colapsa no ponto U* e a fibra backward produz a curva dos U₋ variáveis. Em π₊, a fibra backward π₊⁻¹(U*) colapsa em U* e a fibra forward produz a curva dos U₊ variáveis. A curva não constante preserva a classificação Lax calculada em 𝒲; ela não é recalculada no plano. A seleção de P∈𝒲 continua independente.</p>
      </div></details>
      </div></details>
    </aside>
    <div className="stateGraphStage" style={{position:"relative"}}>
      <WorkspaceToolbar label="ferramentas 2D"><div className="workspaceToolbarActions" role="toolbar" aria-label="Ferramentas de navegação do gráfico 2D">
        <button type="button" title="Selecionar estados no plano" aria-label="Selecionar estados" aria-pressed={!panMode&&!inspectCurves&&!selectStarMode&&!boxZoomMode} className={!panMode&&!inspectCurves&&!selectStarMode&&!boxZoomMode?'active':''} onClick={()=>{setPanMode(false);setBoxZoomMode(false);setInspectCurves(false);setSelectStarMode(false);setOverlapHits([])}}>↖</button>
        <button type="button" title="Ativar seleção de U* no gráfico: clique para fixar o estado; Esc cancela" aria-label="Selecionar U estrela no gráfico" aria-pressed={selectStarMode} className={selectStarMode?'active':''} onClick={()=>{setSelectStarMode(v=>!v);setPanMode(false);setBoxZoomMode(false);setInspectCurves(false);setPlacement(null);setOverlapHits([])}}><MathLabel>{String.raw`U_*`}</MathLabel></button>
        <button type="button" title="Ampliar" aria-label="Ampliar gráfico" onClick={()=>zoomAt(0.8)}>＋</button>
        <button type="button" title="Reduzir" aria-label="Reduzir gráfico" onClick={()=>zoomAt(1.25)}>－</button>
        <span className="workspaceToolbarDivider" aria-hidden="true"/>
        <button type="button" title="Ampliar somente na direção u" aria-label="Ampliar eixo u" onClick={()=>scaleAxis('u',0.8)}>u＋</button>
        <button type="button" title="Reduzir somente na direção u" aria-label="Reduzir eixo u" onClick={()=>scaleAxis('u',1.25)}>u－</button>
        <button type="button" title="Ampliar somente na direção v" aria-label="Ampliar eixo v" onClick={()=>scaleAxis('v',0.8)}>v＋</button>
        <button type="button" title="Reduzir somente na direção v" aria-label="Reduzir eixo v" onClick={()=>scaleAxis('v',1.25)}>v－</button>
        <span className="workspaceToolbarDivider" aria-hidden="true"/>
        <button type="button" title="Arrastar para mover a janela" aria-label="Mover janela" aria-pressed={panMode} className={panMode?'active':''} onClick={()=>{setPanMode(v=>!v);setBoxZoomMode(false);setInspectCurves(false);setSelectStarMode(false)}}>✥</button>
        <button type="button" title="Zoom por retângulo: arraste uma área do gráfico" aria-label="Zoom por retângulo" aria-pressed={boxZoomMode} className={boxZoomMode?'active':''} onClick={()=>{setBoxZoomMode(v=>!v);setPanMode(false);setInspectCurves(false);setSelectStarMode(false);setPlacement(null);setBoxZoomRect(null);boxZoomStart.current=null}}>▣</button>
        <button type="button" title="Voltar à janela anterior" aria-label="Voltar à janela anterior" disabled={!windowHistory.length} onClick={()=>{const previous=windowHistory.at(-1);if(previous){applyWindow(previous);setWindowHistory(history=>history.slice(0,-1))}}}>↶</button>
        <button type="button" title="Ajustar à geometria" aria-label="Ajustar à geometria" onClick={fitGeometry}>⤢</button>
        <button type="button" title="Janela inicial" aria-label="Restaurar janela inicial" onClick={()=>applyWindow(DEFAULT_STATE_WINDOW,{record:true})}>↺</button>
        <span className="workspaceToolbarDivider" aria-hidden="true"/>
        <button type="button" title="Selecionar projeção π₋" aria-label="Projeção π₋" aria-pressed={stateProjection==='minus'} className={stateProjection==='minus'?'active':''} onClick={()=>setStateProjection('minus')}><MathLabel>{String.raw`\pi_-`}</MathLabel></button>
        <button type="button" title="Selecionar projeção π₊" aria-label="Projeção π₊" aria-pressed={stateProjection==='plus'} className={stateProjection==='plus'?'active':''} onClick={()=>setStateProjection('plus')}><MathLabel>{String.raw`\pi_+`}</MathLabel></button>
        <span className="workspaceToolbarDivider" aria-hidden="true"/>
        <button type="button" title={activeProfile?'Animar ou pausar o fluxo da cadeia candidata':'Selecione uma cadeia candidata para animar'} aria-label="Animar fluxo da cadeia" aria-pressed={animateCandidateFlow} className={animateCandidateFlow?'active':''} disabled={!activeProfile||(!canAnimateShock&&!canAnimateRarefaction)} onClick={()=>setAnimateCandidateFlow(value=>!value)}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h3l3-5 4 10 3-5h3"/><path d="M16 3l4 3-4 3"/></svg></button>
        <button type="button" title="Mostrar coordenadas do cursor" aria-label="Mostrar coordenadas do cursor" aria-pressed={showCoordinates} className={showCoordinates?'active':''} onClick={()=>setShowCoordinates(v=>!v)}>⌖</button>
        <button type="button" title="Inspecionar curvas projetadas" aria-label="Inspecionar curvas projetadas" aria-pressed={inspectCurves} className={inspectCurves?'active':''} onClick={()=>{setInspectCurves(v=>!v);setPanMode(false);setBoxZoomMode(false);setSelectStarMode(false);setOverlapHits([])}}>◎</button>
      </div></WorkspaceToolbar>
      {showCoordinates&&cursorPoint&&<output className="state2dCoordinates" aria-label="Coordenadas do cursor">u = {cursorPoint[0].toFixed(5)} · v = {cursorPoint[1].toFixed(5)}</output>}
      <style>{`@keyframes candidateFlowMarch { to { stroke-dashoffset: -36; } } .candidateFlowMarch { animation: candidateFlowMarch 1.2s linear infinite; } @media (prefers-reduced-motion: reduce) { .candidateFlowMarch { animation: none !important; } }`}</style>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Rarefações, estados e seleção de U estrela no plano u v" className="stateSelectablePlot" tabIndex="0" style={{cursor:boxZoomMode?'crosshair':panMode?'grab':placement||selectStarMode?'crosshair':hoveredState?'grab':'default',touchAction:'none'}} onWheel={onPlotWheel} onKeyDown={onPlotKey} onPointerDown={selectFromPointer} onPointerMove={movePointer} onPointerLeave={()=>{setCursorPoint(null);if(!dragging.current&&!panning.current&&!boxZoomStart.current)setHoveredState(null)}} onPointerUp={endPointer} onPointerCancel={()=>{boxZoomStart.current=null;setBoxZoomRect(null);finishDragPreview(false);panning.current=null}}><rect x="0" y="0" width={W} height={H} className="chartBg"/>{discriminantRegions&&<g pointerEvents="none" aria-label="Regiões de hiperbolicidade"><clipPath id="discriminantPlotClip"><rect x={P} y={P} width={W-2*P} height={H-2*P}/></clipPath><g clipPath="url(#discriminantPlotClip)"><rect x={P} y={P} width={W-2*P} height={H-2*P} fill="#0a84ff" opacity="0.035"/><path d={discriminantRegions.ellipticPolygons.map(poly=>`${pathData(poly,view)} Z`).join(' ')} fill="#ff453a" fillRule="nonzero" opacity="0.17" stroke="none"/>{discriminantRegions.segments.map((segment,i)=><path key={i} d={pathData(segment,view)} stroke="#ffd60a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>)}</g></g>}<g className="stateAxisGraduations" pointerEvents="none" aria-hidden="true">
      {axisTicks(view.uMin,view.uMax).map(u=><g key={`u-${u}`}><line x1={sx({u,v:view.vMin},view)} x2={sx({u,v:view.vMin},view)} y1={H-P} y2={H-P+6} className="stateAxisTick"/><text x={sx({u,v:view.vMin},view)} y={H-P+23} textAnchor="middle" className="stateAxisTickLabel">{axisLabel(u)}</text></g>)}
      {axisTicks(view.vMin,view.vMax,6).map(v=><g key={`v-${v}`}><line x1={P-6} x2={P} y1={sy({u:view.uMin,v},view)} y2={sy({u:view.uMin,v},view)} className="stateAxisTick"/><text x={P-10} y={sy({u:view.uMin,v},view)+4} textAnchor="end" className="stateAxisTickLabel">{axisLabel(v)}</text></g>)}
      </g>{x0!==null&&<line x1={x0} x2={x0} y1={P} y2={H-P} className="chartAxis"/>}{y0!==null&&<line x1={P} x2={W-P} y1={y0} y2={y0} className="chartAxis"/>}
      <g clipPath="url(#sharedLociClip)" aria-label="Projeções das curvas da variedade"><defs><clipPath id="sharedLociClip"><rect x={P} y={P} width={W-2*P} height={H-2*P}/></clipPath></defs>{sharedLoci.flatMap(item=>item.projected[stateProjection].map((path,i)=><path key={`${item.id}:${stateProjection}:${i}`} d={pathData(path,view)} stroke={item.color} {...scientificCurveStyle(scientificLocusKind(item.id),'2d')} fill="none" pointerEvents="none" aria-label={`${item.label} projetada por pi ${stateProjection}`}/>))}</g>
      {showRarefactionField&&visibleCurves.map(c=><path key={`${c.id}:${c.clipId}`} d={pathData(c.points,view)} fill="none" className={c.branch==='slow'?'stateRareSlow':'stateRareFast'}/>) }
      {visibleRiemannHugoniot.map(c=><path data-riemann-side={stateProjection==='plus'?'left':'right'} key={`riemann:${stateProjection}:${c.id}:${c.clipId}`} d={pathData(c.points,view)} fill="none" stroke={stateProjection==='plus'?'#ff9f0a':'#30d158'} {...scientificCurveStyle(stateProjection==='minus'?'auxiliary':'primary','2d')} pointerEvents="none"/>)}
      {activeShockVisibleInProjection&&activeHugoniotArc?.points?.length>1&&<path d={pathData(activeHugoniotArc.points.map(([u,v])=>({u,v})),view)} fill="none" stroke="#ffd60a" strokeWidth="3.8" strokeLinecap="round" opacity="0.9" pointerEvents="none" aria-label="Trecho amostrado da Hugoniot até U M" clipPath="url(#riemannActiveClip)"/>}{animateCandidateFlow&&canAnimateShock&&<path key={`flow-shock-${selectedCandidateIndex}`} className="candidateFlowMarch" d={pathData(activeHugoniotArc.points.map(([u,v])=>({u,v})),view)} fill="none" stroke="#fff3c4" strokeWidth="2.1" strokeLinecap="round" strokeDasharray="7 11" style={{animationDuration:candidateFlowDuration}} pointerEvents="none" clipPath="url(#riemannActiveClip)" aria-label="Fluxo animado sobre trecho de Hugoniot"/>}
      {/* Marcadores científicos são desenhados na camada superior, após todas as curvas. */}
      {stateRarefactions.map((branch,i)=>isStateRarefactionVisible(branch.side)&&branch.points.length>1?<path key={`state-rare:${i}`} d={pathData(branch.points.map(([u,v])=>({u,v})),view)} fill="none" stroke={branch.side==='left'?'#ff9f0a':'#30d158'} {...scientificCurveStyle(branch.family==='slow'?'integralSlow':'integralFast','2d')} opacity="0.85" pointerEvents="none"/>:null)}
      {visibleHugoniot.map(c=><path key={`${c.id}:${c.clipId}`} d={pathData(c.points,view)} fill="none" className={`${hugClass(c)} ${c.side==='plus'?'stateHugBackward':'stateHugForward'}`}/>) }
      {showRarefactionField&&Array.from(new Map(visibleCurves.flatMap(c=>c.points.filter(q=>q.event==='coincidence')).map(q=>[`${q.tau.toPrecision(10)}:${q.zc.toPrecision(10)}`,q])).values()).map((q,i)=><circle key={`E:${i}`} cx={sx(q,view)} cy={sy(q,view)} r="4" className="stateCoincidence"/>)}
      {showInspectedState&&<><line x1={sx(minus,view)} y1={sy(minus,view)} x2={sx(plus,view)} y2={sy(plus,view)} className="stateJump"/><circle cx={sx(minus,view)} cy={sy(minus,view)} r="5.5" className="stateMinus"/><StateMathAnnotation x={sx(minus,view)+10} y={sy(minus,view)-10} tex={String.raw`U_-`}/><circle cx={sx(plus,view)} cy={sy(plus,view)} r="5.5" className="statePlus"/><StateMathAnnotation x={sx(plus,view)+10} y={sy(plus,view)-10} tex={String.raw`U_+`}/><circle cx={sx(mean,view)} cy={sy(mean,view)} r="5" className="stateMean"/><StateMathAnnotation x={sx(mean,view)+9} y={sy(mean,view)+18} tex={String.raw`\bar U`}/></>}
      {activeProfile&&<g pointerEvents="none" aria-label="Cadeia candidata selecionada" clipPath="url(#riemannActiveClip)"><defs><clipPath id="riemannActiveClip"><rect x={P} y={P} width={W-2*P} height={H-2*P}/></clipPath></defs>{activeFan.length>1&&<path d={pathData(activeFan.map(q=>({u:q[0],v:q[1]})),view)} fill="none" stroke="#0a84ff" strokeWidth="2.5"/>}{animateCandidateFlow&&canAnimateRarefaction&&<path key={`flow-fan-${selectedCandidateIndex}`} className="candidateFlowMarch" d={pathData(activeFan.map(q=>({u:q[0],v:q[1]})),view)} fill="none" stroke="#b7dcff" strokeWidth="2" strokeLinecap="round" strokeDasharray="7 11" style={{animationDuration:candidateFlowDuration}} aria-label="Fluxo animado sobre rarefação amostrada"/>}{activeStates.map((q,i)=><g key={i}><circle cx={sx({u:q[0],v:q[1]},view)} cy={sy({u:q[0],v:q[1]},view)} r="6" fill={i===1?'#ff9f0a':'#30d158'} stroke="#111" strokeWidth="1.5"/><StateMathAnnotation {...labelPosition({u:q[0],v:q[1]},i+1)} tex={[String.raw`U_L`,String.raw`U_M`,String.raw`U_R`][i]}/></g>)}</g>}
      {selectedCurveSample&&<circle cx={sx({u:selectedCurveSample.state[0],v:selectedCurveSample.state[1]},view)} cy={sy({u:selectedCurveSample.state[0],v:selectedCurveSample.state[1]},view)} r="7" fill="none" stroke="#ffffff" strokeWidth="1.8" pointerEvents="none" aria-label="Amostra selecionada da curva projetada"/>}
      {selectedProjectedCurve&&<path d={pathData(selectedProjectedCurve.points,view)} fill="none" stroke="#ffffff" {...scientificCurveStyle('selected','2d')} strokeLinecap="round" opacity="0.95" pointerEvents="none" aria-label="Curva projetada selecionada"/>}
      {requestedProjectionVisible&&<g pointerEvents="none" role="img" aria-label={stateProjection==='minus'?'Projeção π menos do ponto 3D selecionado':'Projeção π mais do ponto 3D selecionado'}><circle cx={sx(requestedProjectionPoint,view)} cy={sy(requestedProjectionPoint,view)} r="14" fill="none" stroke="#64d2ff" strokeWidth="3"/><circle cx={sx(requestedProjectionPoint,view)} cy={sy(requestedProjectionPoint,view)} r="4" fill="#ffffff" stroke="#64d2ff" strokeWidth="1.5"/><StateMathAnnotation x={sx(requestedProjectionPoint,view)+17} y={sy(requestedProjectionPoint,view)-14} tex={stateProjection==='minus'?String.raw`\pi_-(P)`:String.raw`\pi_+(P)`}/></g>}
      {pointVisibility.fixed&&selectedVisible&&<><circle cx={sx(selected,view)} cy={sy(selected,view)} r="7" className="stateFixed"/><StateMathAnnotation {...labelPosition(selected,5)} tex={String.raw`U_*`}/></>}<text x={W-P} y={H-18} textAnchor="end">u</text><text x={P+8} y={P+14}>v</text>      {boxZoomRect&&<rect x={boxZoomRect.x} y={boxZoomRect.y} width={boxZoomRect.width} height={boxZoomRect.height} fill="#64d2ff" fillOpacity="0.13" stroke="#64d2ff" strokeWidth="1.5" strokeDasharray="6 4" pointerEvents="none"/>}
      {/* Camada superior: marcadores sempre acima das curvas, sem alterar os cálculos. */}
      <g data-scientific-marker-layer="true">
      {(stateProjection==='plus'?showLeftRiemannHugoniot:showRightRiemannHugoniot)&&(stateProjection==='plus'?finiteContacts.left:finiteContacts.right).map((event,i)=>{const point=event.refinement?.status==='converged'?event.refinement.point:event.point;return <ScientificPointMarker key={`finite-sonic:${stateProjection}:${i}`} x={sx({u:point[0],v:point[1]},view)} y={sy({u:point[0],v:point[1]},view)} referenceState={stateProjection==='plus'?'left':'right'} pointType="sonicContact" verificationStatus={event.refinement?.status==='converged'?'refined':'unresolved'} title={`Contato sônico finito candidato · ${event.sonicSide==='plus'?'S⁺':'S⁻'} · ${event.family} · ${event.kind} · (${point[0].toFixed(5)}, ${point[1].toFixed(5)}) · refinamento: ${event.refinement?.status??'indefinido'} · não certifica admissibilidade`}/>})}
      {sonicConnections.filter(q=>['ordered-geometric-candidate','weak-lax-candidate'].includes(q.status)&&(stateProjection==='plus'?q.contactSide==='left'&&showLeftRiemannHugoniot:q.contactSide==='right'&&showRightRiemannHugoniot)).map((q,i)=><ScientificPointMarker key={`sonic-connection:${i}`} x={sx({u:q.point[0],v:q.point[1]},view)} y={sy({u:q.point[0],v:q.point[1]},view)} referenceState={q.contactSide} pointType="sonicConnection" title={`${q.kind} · ${q.family} · (${q.point[0].toFixed(5)}, ${q.point[1].toFixed(5)}) · distância RK4=${q.distance.toExponential(2)} · admissibilidade não certificada`}/>)}
      {stateRarefactions.flatMap((branch,i)=>isStateRarefactionVisible(branch.side)?branch.events.map((event,j)=><ScientificPointMarker key={`gn:${i}:${j}`} x={sx({u:event.point[0],v:event.point[1]},view)} y={sy({u:event.point[0],v:event.point[1]},view)} referenceState={branch.side} pointType="rarefactionEvent" title={`Possível perda de não linearidade genuína · ${branch.side==='left'?'U_L':'U_R'} · ${branch.family} · ${event.kind} · (${event.point[0].toFixed(5)}, ${event.point[1].toFixed(5)}) · diagnóstico infinitesimal, não certifica contato sônico finito`}/>):[])}
      {pointVisibility.middle&&showLeftRiemannHugoniot&&showRightRiemannHugoniot&&shockCandidates.map((q,i)=>{const m={u:q.middle[0],v:q.middle[1]};return m.u>=view.uMin&&m.u<=view.uMax&&m.v>=view.vMin&&m.v<=view.vMax?<g key={`middle:${i}`} pointerEvents="none"><circle cx={sx(m,view)} cy={sy(m,view)} r={STATE_MARKER_SIZE_2D.intersection} fill="#0b1016" stroke="#bf5af2" strokeWidth="1.7"/><circle cx={sx(m,view)} cy={sy(m,view)} r="1.35" fill="#bf5af2"/><StateMathAnnotation x={sx(m,view)+9} y={sy(m,view)+15} tex={`U_{M_{${i+1}}}`}/></g>:null})}
      {/* Imagem degenerada da fibra: π₋(H^forw(U_L))={U_L}; π₊(H^back(U_R))={U_R}. Independente da visibilidade dos estados. */}
      {((stateProjection==='minus'&&showLeftRiemannHugoniot&&!pointVisibility.left)||(stateProjection==='plus'&&showRightRiemannHugoniot&&!pointVisibility.right))&&(()=>{const side=stateProjection==='minus'?'left':'right';const coords=riemannStates?.[side];if(!coords)return null;const q={u:coords[0],v:coords[1]};return <g pointerEvents="none" aria-label={`Projeção pontual da fibra de ${side==='left'?'U L':'U R'}`}><ScientificStateMarker side={side} x={sx(q,view)} y={sy(q,view)} radius={STATE_MARKER_SIZE_2D.normal} fill={side==='left'?'#ff9f0a':'#30d158'}/><StateMathAnnotation {...labelPosition(q,side==='left'?0:2)} tex={side==='left'?String.raw`U_L`:String.raw`U_R`}/></g>})()}
      {riemannStates&&['left','right'].filter(side=>pointVisibility[side]).map(side=>{const state=riemannStates[side];if(!state)return null;const q={u:state[0],v:state[1]};return q.u>=view.uMin&&q.u<=view.uMax&&q.v>=view.vMin&&q.v<=view.vMax?<g key={side} data-state-marker={side} role="group" opacity={hoveredState===side?1:0.92} aria-label={side==='left'?'Estado inicial U L':'Estado inicial U R'}><ScientificStateMarker side={side} x={sx(q,view)} y={sy(q,view)} radius={hoveredState===side?STATE_MARKER_SIZE_2D.hovered:STATE_MARKER_SIZE_2D.normal} fill={side==='left'?'#ff9f0a':'#30d158'}/><StateMathAnnotation {...labelPosition(q,side==='left'?0:2)} tex={side==='left'?String.raw`U_L`:String.raw`U_R`}/></g>:null})}
      {placement&&cursorPoint&&<g aria-label={`Prévia de ${placement==='left'?'U L':'U R'}`} pointerEvents="none" opacity="0.55"><ScientificStateMarker side={placement} x={sx({u:cursorPoint[0],v:cursorPoint[1]},view)} y={sy({u:cursorPoint[0],v:cursorPoint[1]},view)} radius={STATE_MARKER_SIZE_2D.preview} fill={placement==='left'?'#ff9f0a':'#30d158'} preview/><StateMathAnnotation x={sx({u:cursorPoint[0],v:cursorPoint[1]},view)+13} y={sy({u:cursorPoint[0],v:cursorPoint[1]},view)-13} tex={placement==='left'?String.raw`U_L`:String.raw`U_R`}/></g>}
      </g>
</svg>
      <ScientificLegend environment="2d" items={[
        {id:'left',tex:String.raw`U_L`,color:'#ff9f0a',visible:pointVisibility.left||stateProjection==='minus'&&showLeftRiemannHugoniot},
        {id:'right',tex:String.raw`U_R`,color:'#30d158',shape:'diamond',visible:pointVisibility.right||stateProjection==='plus'&&showRightRiemannHugoniot},
        {id:'fixed',tex:String.raw`U_*`,color:'#8da5b5',shape:'ring',visible:Boolean(fixedState&&pointVisibility.fixed)},
        {id:'middle',tex:String.raw`U_{M_i}`,color:'#bf5af2',shape:'ring',visible:Boolean(activeProfile&&pointVisibility.middle)},
        {id:'hugoniot',tex:stateProjection==='plus'?String.raw`\mathcal H^{\mathrm{forw}}(U_L)`:String.raw`\mathcal H^{\mathrm{back}}(U_R)`,color:stateProjection==='plus'?'#ff9f0a':'#30d158',shape:'line',visible:stateProjection==='plus'?showLeftRiemannHugoniot:showRightRiemannHugoniot},
        {id:'rarefaction',tex:String.raw`\mathcal R`,color:'#64d2ff',shape:'line',visible:showRarefactionField}
      ]} chain={activeProfile?{certified:false,tex:activeProfile.kind==='two-shock'?String.raw`U_L\xrightarrow{S}U_M\xrightarrow{S}U_R`:activeProfile.kind==='rarefaction-shock'?String.raw`U_L\xrightarrow{R}U_M\xrightarrow{S}U_R`:String.raw`U_L\xrightarrow{S}U_M\xrightarrow{R}U_R`}:null}/>

    </div>
</WorkspaceLayout>
  </div>
}
