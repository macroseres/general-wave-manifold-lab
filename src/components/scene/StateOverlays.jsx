import {ArrowOnCurve} from './Rarefaction.jsx'
import {compositeDisplayPoint} from '../../geometry/composite/compositeGeometry.js'
import {regularMinusCompositeDirection} from '../../math/state/composite.js'
import {ScreenPoint} from '../ScientificPoint3D.jsx'
import {dragCharacteristicState} from '../../geometry/state/dragCharacteristicState.js'
import {waveColors} from '../../config/waveColors.js'
import {scientificCurveStyle} from '../../config/scientificCurveRules.js'
import {useThree} from '@react-three/fiber'
import {useEffect, useMemo, useRef, useState} from 'react'
import * as THREE from 'three'
import {curvePoints3D} from '../../rendering/curvePoints.js'
import {stateFibreGeometry} from '../../geometry/state/fibreGeometry.js'
import {hugoniotLaxGeometry} from '../../geometry/state/hugoniotLaxGeometry.js'
import {selectedHugoniotCharacteristicMarkers} from '../../geometry/state/fibreCharacteristicMarkers.js'
import {Line} from './shared.jsx'

export function StateFibres({U,p,showMinus=true,showPlus=true,colorOverride=null}){
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

export function CharacteristicHugoniotPoints({states,p,showForward,showBackward,showForwardFast,showBackwardSlow,axisScale,onSelect,onChangeRiemannState}){
  const {controls,gl}=useThree()
  const drag=useRef(null)
  const [preview,setPreview]=useState(null)
  const finishDrag=(event,commit)=>{
    const current=drag.current
    if(!current)return
    event?.stopPropagation()
    setMarkerDragInteraction(controls,gl.domElement,current.controlsEnabled,'')
    drag.current=null
    setPreview(null)
    if(event?.target.hasPointerCapture?.(event.pointerId))event.target.releasePointerCapture(event.pointerId)
    if(commit&&current.pending)onChangeRiemannState?.(current.side,current.pending.state)
  }
  useEffect(()=>()=>{setMarkerDragInteraction(controls,gl.domElement,drag.current?.controlsEnabled,'')},[controls,gl])
  const points=useMemo(()=>selectedHugoniotCharacteristicMarkers(states,p,{includeForwardFast:true,includeBackwardSlow:true}),[states,p])
  const selected=[...points.forward.filter(q=>q.branch==='slow'?showForward:showForwardFast).map(q=>({...q,side:'left',color:'#ff9f0a'})),
    ...points.backward.filter(q=>q.branch==='fast'?showBackward:showBackwardSlow).map(q=>({...q,side:'right',color:'#30d158'}))]
  const shape=side=>side==='right'?<octahedronGeometry args={[.032,0]}/>:<sphereGeometry args={[.032,28,20]}/>
  return <group>
    {preview&&<StateFibres U={preview.state} p={p} showMinus={preview.side==='left'} showPlus={preview.side==='right'} colorOverride={preview.color}/>}
    {selected.map(q=><group key={`${q.side}-${q.branch}`} position={preview?.side===q.side&&preview.branch===q.branch?[preview.point.tau,0,preview.point.zc]:q.position}
    scale={[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>1/Math.max(Math.abs(v||1),1e-8))}
    renderOrder={64} userData={{kind:'hugoniot-characteristic-intersection',referenceState:q.side,branch:q.branch}}
    onPointerDown={event=>{
      if(drag.current||!onChangeRiemannState||!((q.side==='left'&&q.branch==='slow')||(q.side==='right'&&q.branch==='fast'))||event.button!==0)return
      event.stopPropagation()
      const hit=event.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3())
      if(!hit)return
      drag.current={side:q.side,branch:q.branch,color:q.color,pointerId:event.pointerId,point:{tau:q.tau,zc:q.zc},offset:new THREE.Vector3(q.tau*axisScale.tau,0,q.zc*axisScale.zc).sub(hit),controlsEnabled:controls?.enabled}
      setMarkerDragInteraction(controls,gl.domElement,false,'grabbing')
      event.target.setPointerCapture(event.pointerId)
    }}
    onPointerMove={event=>{
      const current=drag.current
      if(!current||current.pointerId!==event.pointerId||current.side!==q.side||current.branch!==q.branch)return
      event.stopPropagation()
      const hit=event.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3())
      if(!hit)return
      hit.add(current.offset)
      const next=dragCharacteristicState(current.point,{tau:hit.x/axisScale.tau,zc:hit.z/axisScale.zc},p,current.branch,{tauMin:-Infinity,tauMax:Infinity})
      if(!next)return
      current.point=next.point;current.pending=next
      setPreview({...next,side:current.side,branch:current.branch,color:current.color})
    }}
    onPointerUp={event=>finishDrag(event,true)} onPointerCancel={event=>finishDrag(event,false)} onLostPointerCapture={event=>finishDrag(event,false)}
    onPointerOver={event=>{event.stopPropagation();if(onChangeRiemannState&&((q.side==='left'&&q.branch==='slow')||(q.side==='right'&&q.branch==='fast')))setMarkerDragInteraction(null,gl.domElement,undefined,'grab');else setMarkerDragInteraction(null,gl.domElement,undefined,'pointer')}}
    onPointerOut={()=>{if(!drag.current)setMarkerDragInteraction(null,gl.domElement,undefined,'')}}
    onClick={event=>{event.stopPropagation();onSelect?.({tau:q.tau,Y:0,zc:q.zc})}}>
    <ScreenPoint radius={.032} ringColor={q.color} pixelRadius={(q.side==='left'&&q.branch==='slow')||(q.side==='right'&&q.branch==='fast')?7:4.5} interactive showCursor={false}>
    <mesh scale={1.14} renderOrder={65}>{shape(q.side)}<meshBasicMaterial color="#18222f" side={THREE.BackSide} transparent opacity={1} depthWrite={false} depthTest={false}/></mesh>
    <mesh renderOrder={66}>{shape(q.side)}<meshStandardMaterial color={q.color} roughness={.32} metalness={.08} emissive={q.color} emissiveIntensity={.2}
      transparent opacity={1} depthWrite={false} depthTest={false}/></mesh>
    </ScreenPoint>
  </group>)}</group>
}

export function CompositeFields({geometry={minus:[],plus:[]},showMinus=true,showPlus=true,showKMinusArrows,p,axisScale,tauMin,tauMax,YMin,YMax}){
  const arrows=useMemo(()=>showKMinusArrows?geometry.minus.flatMap(branch=>branch.segments.flatMap(segment=>{
    if(segment.length<2)return []
    for(const sample of segment.slice(Math.floor(segment.length/3))){
      const source=sample.source
      if(!source?.certificate?.valid)continue
      const point=compositeDisplayPoint(source.Q)
      if(!point||point.x<tauMin||point.x>tauMax||point.y<YMin||point.y>YMax)continue
      const direction=regularMinusCompositeDirection(source.P,point.mathematical,p)
      if(direction)return [{point,direction}]
    }
    return []
  })):[],[showKMinusArrows,geometry.minus,p,tauMin,tauMax,YMin,YMax])
  const draw=(groups,color,prefix)=>groups.flatMap((branch,bi)=>
    branch.segments.filter(points=>{
      if(points.length<2)return false
      if(prefix!=='km')return true
      let length=0
      for(let i=1;i<points.length;i++){
        const a=points[i-1],b=points[i]
        length+=Math.hypot((b.x-a.x)*axisScale.tau,(b.y-a.y)*axisScale.Y,(b.z-a.z)*axisScale.zc)
      }
      return length>=.055
    }).map((points,si)=>
      <Line key={`${prefix}-${bi}-${si}`} points={curvePoints3D(points,'xyz')} color={color}
        {...scientificCurveStyle(prefix==='km'?'secondary':'primary','3d')}
        contrast={prefix!=='km'} opacity={prefix==='km'?.86:1} transparent
        depthTest={false} depthWrite={false} renderOrder={8}/>
    )
  )
  return <group>{showMinus&&draw(geometry.minus,waveColors.compositeSlow,'km')}{showPlus&&draw(geometry.plus,waveColors.compositeFast,'kp')}{arrows.map(({point,direction},i)=><ArrowOnCurve key={i} independent axisScale={axisScale} positionOverride={[point.x,point.y,point.z]} directionOverride={direction} color={waveColors.compositeSlow} size={.8}/>)}</group>
}
