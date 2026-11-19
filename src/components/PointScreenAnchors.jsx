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
      callout:Boolean(label.detailPath)||(label.keepOffset&&label.callout)||
        (nearby&&(label.callout||Math.hypot(position.x-label.x,position.y-label.y)>8))})
  }
  return placed
}

/** All point labels share a DOM overlay, like axis labels, and follow the camera. */
export default function PointScreenAnchors({labels,axisScale,onPositions}){
  const {camera,size}=useThree(),previous=useRef(''),last=useRef(-Infinity)
  useFrame(({clock})=>{
    if(clock.elapsedTime-last.current<.05)return
    last.current=clock.elapsedTime
    const project=(tau,Y,zc)=>new Vector3(tau*axisScale.tau,Y*axisScale.Y,zc*axisScale.zc).project(camera)
    const projected=labels.flatMap(q=>{
      const v=project(q.tau,q.Y??0,q.zc)
      if(v.z<-1||v.z>1||Math.abs(v.x)>1||Math.abs(v.y)>1)return []
      const anchorX=Math.round((v.x+1)*size.width/2),anchorY=Math.round((1-v.y)*size.height/2)
      const x=anchorX+(q.offsetX??10),y=anchorY+(q.offsetY??-20)
      let detailPath
      if(q.detailArc){
        const points=q.detailArc.map(point=>{
          const position=project(...point)
          return [position.x*size.width/2,-position.y*size.height/2]
        })
        const length=points.slice(1).reduce((sum,[x,y],i)=>sum+Math.hypot(x-points[i][0],y-points[i][1]),0)
        if(!(length>0&&length<18))return []
        const [centerX,centerY]=points[Math.floor(points.length/2)]
        const scale=36/length
        // Rotate the detail to read from left to right while retaining the projected shape.
        const [firstX,firstY]=points[0],[lastX,lastY]=points.at(-1)
        const angle=Math.atan2(lastY-firstY,lastX-firstX),cos=Math.cos(angle),sin=Math.sin(angle)
        detailPath=points.map(([x,y])=>{
          const dx=x-centerX,dy=y-centerY
          return `${(24+(dx*cos+dy*sin)*scale).toFixed(2)},${(8+(-dx*sin+dy*cos)*scale).toFixed(2)}`
        }).join(' ')
      }
      return [{anchorX,anchorY,callout:q.callout,keepOffset:q.keepOffset,id:q.id??q.tex,tex:q.tex,color:q.color,x,y,detailPath}]
    })
    const positions=separateLabels(projected,size)
    const key=JSON.stringify(positions)
    if(key!==previous.current){previous.current=key;onPositions(positions)}
  })
  return null
}
