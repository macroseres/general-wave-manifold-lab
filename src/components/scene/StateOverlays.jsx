import {dragCharacteristicState} from '../../geometry/state/dragCharacteristicState.js'
import {waveColors} from '../../config/waveColors.js'
import {scientificCurveStyle} from '../../config/scientificCurveRules.js'
import {useThree} from '@react-three/fiber'
import {useEffect, useMemo, useRef} from 'react'
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

export function CompositeFields({geometry={minus:[],plus:[]},showMinus=true,showPlus=true}){
  const draw=(groups,color,prefix)=>groups.flatMap((branch,bi)=>
    branch.segments.filter(points=>points.length>1).map((points,si)=>
      <Line key={`${prefix}-${bi}-${si}`} points={curvePoints3D(points,'xyz')} color={color} {...scientificCurveStyle('primary','3d')} depthTest={false} renderOrder={8}/>
    ))
  return <group>{showMinus&&draw(geometry.minus,waveColors.compositeSlow,'km')}{showPlus&&draw(geometry.plus,waveColors.compositeFast,'kp')}</group>
}
