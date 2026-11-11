import {useRef} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {Vector3} from 'three'

const labelHeight=24
const labelWidth=58
const clamp=(value,max)=>Math.max(0,Math.min(value,max))

function separateLabels(labels,size){
  const placed=[]
  for(const projected of labels){
    const nearby=labels.some(other=>other!==projected&&
      Math.hypot(other.anchorX-projected.anchorX,other.anchorY-projected.anchorY)<labelWidth)
    const label=nearby||projected.keepOffset?projected:{...projected,x:projected.anchorX+10,y:projected.anchorY-20}
    const fits=(x,y)=>placed.every(other=>
      Math.abs(other.x-x)>=labelWidth||Math.abs(other.y-y)>=labelHeight)
    let position
    for(let ring=0;ring<=6&&!position;ring++){
      const steps=ring===0?1:8
      for(let step=0;step<steps;step++){
        const angle=step*Math.PI/4
        const x=clamp(label.x+Math.round(Math.cos(angle)*ring*30),size.width-labelWidth)
        const y=clamp(label.y+Math.round(Math.sin(angle)*ring*30),size.height-labelHeight)
        if(fits(x,y)){position={x,y};break}
      }
    }
    if(position)placed.push({...label,...position,
      callout:nearby&&(label.callout||Math.hypot(position.x-label.x,position.y-label.y)>8)})
  }
  return placed
}

/** All point labels share a DOM overlay, like axis labels, and follow the camera. */
export default function PointScreenAnchors({labels,axisScale,onPositions}){
  const {camera,size}=useThree(),previous=useRef(''),last=useRef(-Infinity)
  useFrame(({clock})=>{
    if(clock.elapsedTime-last.current<.05)return
    last.current=clock.elapsedTime
    const projected=labels.flatMap(q=>{
      const v=new Vector3(q.tau*axisScale.tau,(q.Y??0)*axisScale.Y,q.zc*axisScale.zc).project(camera)
      if(v.z<-1||v.z>1||Math.abs(v.x)>1||Math.abs(v.y)>1)return []
      const anchorX=Math.round((v.x+1)*size.width/2),anchorY=Math.round((1-v.y)*size.height/2)
      const x=anchorX+(q.offsetX??10),y=anchorY+(q.offsetY??-20)
      return [{anchorX,anchorY,callout:q.callout,keepOffset:q.keepOffset,id:q.id??q.tex,tex:q.tex,color:q.color,x,y}]
    })
    const positions=separateLabels(projected,size)
    const key=JSON.stringify(positions)
    if(key!==previous.current){previous.current=key;onPositions(positions)}
  })
  return null
}
