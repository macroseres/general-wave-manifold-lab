import {MathLabel} from './math/MathLabel.jsx'

// Render mathematical annotations with the same KaTeX component used by the panels.
// SVG foreignObject keeps annotations attached to graph coordinates during zoom/pan.
export function StateMathAnnotation({x,y,tex,width=96,textAnchor='start'}) {
  return <foreignObject x={x} y={y-17} width={width} height="29" pointerEvents="none" style={{overflow:'visible'}}>
    <span xmlns="http://www.w3.org/1999/xhtml" className="stateMathAnnotation" style={{display:'inline-block',whiteSpace:'nowrap',transform:textAnchor==='end'?'translateX(-100%)':undefined}}><MathLabel>{tex}</MathLabel></span>
  </foreignObject>
}
