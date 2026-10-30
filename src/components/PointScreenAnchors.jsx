import {useRef} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {Vector3} from 'three'

/** All point labels share a DOM overlay, like axis labels, and follow the camera. */
export default function PointScreenAnchors({labels,axisScale,onPositions}){
  const {camera,size}=useThree(),previous=useRef(''),last=useRef(-Infinity)
  useFrame(({clock})=>{
    if(clock.elapsedTime-last.current<.05)return
    last.current=clock.elapsedTime
    const positions=labels.flatMap(q=>{
      const v=new Vector3(q.tau*axisScale.tau,(q.Y??0)*axisScale.Y,q.zc*axisScale.zc).project(camera)
      if(v.z<-1||v.z>1||Math.abs(v.x)>1||Math.abs(v.y)>1)return []
      return [{id:q.id??q.tex,tex:q.tex,color:q.color,x:Math.round((v.x+1)*size.width/2)+10,y:Math.round((1-v.y)*size.height/2)+(q.offsetY??-20)}]
    })
    const key=JSON.stringify(positions)
    if(key!==previous.current){previous.current=key;onPositions(positions)}
  })
  return null
}
