function fmt(x){return Number.isFinite(x)?Number(x).toPrecision(6):'—'}
function posLabel(p){return ({'below-spectrum':'s < λ₁','between':'λ₁ < s < λ₂','above-spectrum':'s > λ₂','on-slow-characteristic':'s = λ₁','on-fast-characteristic':'s = λ₂','non-hyperbolic':'espectro não real'})[p]||p}
function signatureLabel(sig){
  const [minus,plus]=String(sig).split('|')
  return `U−: ${posLabel(minus)} · U+: ${posLabel(plus)}`
}
function zRange(r){return `[${fmt(r.zStart)}, ${fmt(r.zEnd)}]`}
function Family({title,data}){
  return <section className="spectralFamily"><h3>{title}</h3><p><b>{data.totalRegions}</b> regiões · <b>{data.totalEvents}</b> fronteiras características</p>{data.branches.map(branch=><div className="spectralBranch" key={branch.id}><h4>Ramo {branch.id+1}{branch.chartConnectivity==='through-infinity'?' · continua por Z=0':''}</h4>{branch.regions.length===0?<p>Sem região regular amostrada.</p>:branch.regions.map((r,i)=><p key={`${branch.id}-${i}`}><b>R{i+1}:</b> {signatureLabel(r.signature)}<br/><span className="spectralCountSignature">assinatura (n₋, n₊) = <b>{r.countSignature?.label??'indefinida'}</b> · <b>{r.configuration?.label??r.laxClass?.label??'indefinida'}</b></span><br/><span>z ≈ {zRange(r)} · {r.sampleCount} amostras</span></p>)}{branch.events.map((e,i)=><p className="spectralEvent" key={`e-${branch.id}-${i}`}><b>Fronteira {i+1}:</b> {e.side==='minus'?'U−':'U+'}, s = λ{e.eigenIndex+1}<br/><span>z={fmt(e.z)} · τ={fmt(e.tau)} · Y={fmt(e.Y)}</span></p>)}</div>)}</section>
}
export default function SpectralRegionsDialog({open,onClose,regions}){
 if(!open||!regions)return null
 return <div className="modalBackdrop" onMouseDown={onClose}><div className="modal spectralRegionsModal" onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="spectral-regions-title"><div className="modalHeader"><div><h2 id="spectral-regions-title">Regiões espectrais das Hugoniot</h2><small>Partição diagnóstica de ℋᶠᵒʳʷ(U*) e ℋᵇᵃᶜᵏ(U*). Os nove tipos descrevem saltos individuais; one-shock e two-shock não são cadeias de ondas. Fronteiras sônicas e coincidências são tratadas separadamente. A assinatura (n₋,n₊) conta, em U− e U+, quantas velocidades características estão estritamente abaixo de s. Em regiões estritamente hiperbólicas, (0,1) equivale à condição estrita de Lax da família 1 e (1,2) à da família 2. “não-Lax” significa apenas que a condição de Lax falha; Liu e outros critérios não são testados.</small></div><button onClick={onClose}>Fechar</button></div><div className="spectralRegionsScroll"><div className="spectralRegionsGrid"><Family title="Forward · π₋⁻¹(U*)" data={regions.forward}/><Family title="Backward · π₊⁻¹(U*)" data={regions.backward}/></div></div></div></div>
}
