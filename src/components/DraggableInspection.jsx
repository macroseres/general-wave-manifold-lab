import {useRef,useState} from 'react'

/** Move inspection overlays in viewport pixels without changing graph coordinates. */
export default function DraggableInspection({children,style,...props}){
  const drag=useRef(null),[position,setPosition]=useState(null)
  const stop=event=>{if(drag.current){event.stopPropagation();drag.current=null}}
  return <aside {...props} style={{...style,...(position?{left:position.x,top:position.y,right:'auto',bottom:'auto'}:{})}}
    onPointerDown={event=>{
      const card=event.currentTarget,header=card.firstElementChild
      if(!header?.contains(event.target)||event.target.closest('button,input,select,a'))return
      const rect=card.getBoundingClientRect(),parent=card.parentElement.getBoundingClientRect()
      drag.current={x:event.clientX,y:event.clientY,left:rect.left-parent.left,top:rect.top-parent.top}
      card.setPointerCapture(event.pointerId);event.preventDefault();event.stopPropagation()
    }}
    onPointerMove={event=>{
      if(!drag.current)return
      const card=event.currentTarget,parent=card.parentElement,origin=drag.current
      setPosition({x:Math.max(8,Math.min(parent.clientWidth-card.offsetWidth-8,origin.left+event.clientX-origin.x)),y:Math.max(8,Math.min(parent.clientHeight-card.offsetHeight-8,origin.top+event.clientY-origin.y))})
      event.stopPropagation()
    }} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>{children}</aside>
}
