import katex from 'katex'
import 'katex/dist/katex.min.css'

function render(tex,displayMode=false){
  try{return katex.renderToString(tex,{displayMode,throwOnError:false,strict:'ignore',output:'html'})}
  catch{return tex}
}
export function MathLabel({children,className=''}){
  const tex=String(children??'')
  return <span className={`mathLabel ${className}`.trim()} role="math" aria-label={tex} dangerouslySetInnerHTML={{__html:render(tex,false)}}/>
}
export function MathBlock({children,className=''}){
  const tex=String(children??'')
  return <div className={`mathBlock ${className}`.trim()} role="math" aria-label={tex} dangerouslySetInnerHTML={{__html:render(tex,true)}}/>
}
