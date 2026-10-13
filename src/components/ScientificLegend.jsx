import { MathLabel } from './math/MathLabel.jsx'

/** Legenda comum aos ambientes científicos. Somente objetos efetivamente exibidos. */
export default function ScientificLegend({items=[],chain=null,environment='2d'}) {
  const visible=items.filter(item=>item?.visible!==false)
  if (!visible.length && !chain) return null
  return <div className="scientificLegend" role="group" aria-label={`Legenda científica ${environment}`}>
    <span className="scientificLegendTitle">Legenda</span>
    {visible.map(item=><span className="scientificLegendItem" key={item.id} title={item.description||undefined}>
      <span className={`scientificLegendSymbol ${item.shape==='diamond'?'isDiamond':item.shape==='ring'?'isRing':item.shape==='line'?'isLine':''}`} style={{'--legend-color':item.color||'#94a3b8'}} aria-hidden="true"/>
      <MathLabel>{item.tex}</MathLabel>
    </span>)}
    {chain&&<span className="scientificLegendChain" title="Cadeia candidata: admissibilidade não certificada">
      <span className="scientificLegendStatus">{chain.certified?'Admissível':'Candidata'}</span>
      <MathLabel>{chain.tex}</MathLabel>
    </span>}
  </div>
}
