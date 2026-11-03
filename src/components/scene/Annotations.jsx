import {useFrame, useThree} from '@react-three/fiber'
import {useMemo, useRef} from 'react'
import * as THREE from 'three'
import {Line} from './shared.jsx'

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

export function Axes({tauMin,tauMax,YMin,YMax,axisScale,onAxisPositions}) {
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

export function LiftedSampleMarker({sample,axisScale}){
  if(!sample)return null
  const {tau,Y,zc}=sample
  if(![tau,Y,zc].every(Number.isFinite))return null
  const inv=[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>1/Math.max(Math.abs(v||1),1e-8))
  return <group position={[tau,Y,zc]} scale={inv} renderOrder={45}>
    <mesh raycast={()=>null}><sphereGeometry args={[0.056,24,16]}/><meshBasicMaterial color="#ffffff" depthTest={false}/></mesh>
    <mesh raycast={()=>null}><sphereGeometry args={[0.089,24,16]}/><meshBasicMaterial color="#30c9ff" wireframe transparent opacity={0.95} depthTest={false}/></mesh>
  </group>
}
