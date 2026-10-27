import {MathLabel} from './math/MathLabel.jsx'

const directionLabels={
  'three-real':'Três direções reais distintas',
  'one-real':'Uma direção real',
  double:'Duas direções reais: uma dupla e uma simples',
  triple:'Uma direção real tripla',
  zero:'Cúbico identicamente nulo',
}
const rationalTex=value=>value.includes('/')?String.raw`\frac{${value.split('/')[0]}}{${value.split('/')[1]}}`:value

export default function ParameterClassification({classification,context='Fluxo atual'}){
  if(classification.status!=='classified')return <section className="parametersPanel parameterClassificationPanel">
    <h2>Classificação inconclusiva</h2><p role="status">{classification.reason}</p>
  </section>
  const {scalar,directions}=classification
  const locus=scalar.locus===null?'Nenhum estado escalar':
    ['Um estado escalar','Uma reta de estados escalares','Todo o plano de estados'][scalar.locus.dimension]
  return <section className="parametersPanel parameterClassificationPanel" aria-label={`Estrato e direções · ${context}`}>
    <div className="parametersSectionHeading"><span className="parametersEyebrow">{context} · camadas algébricas</span><h2>Estrato e direções</h2></div>
    <div className="parameterClassificationLayer"><h3>Estrato do fluxo</h3><strong>{scalar.homogenizable?'Homogeneizável':'Não homogeneizável'}</strong><p>{locus}</p>
      <small>Por mudança afim dos estados e mudança de referencial, com escala positiva de velocidade.</small>
    </div>
    <div className="parameterClassificationLayer"><h3>Direções da parte quadrática</h3><strong>{directionLabels[directions.rootType]}</strong>
      <p>{directions.rootType==='zero'?'Setor excepcional: não há uma lista de raízes isoladas desse cúbico.':'Raízes reais na reta projetiva, incluindo a direção no infinito.'}</p>
      <small>Não é uma contagem dos equilíbrios ou das ondas admissíveis.</small>
    </div>
    <details className="workspaceSubsection"><summary>Critérios e evidência</summary><div className="workspaceSubsectionBody">
      <span>Postos do sistema escalar: <MathLabel>{String.raw`\operatorname{rank}M=${scalar.rank},\quad\operatorname{rank}[M\mid\ell]=${scalar.augmentedRank}`}</MathLabel>.</span>
      <span>Discriminante do cúbico: <MathLabel>{String.raw`\operatorname{Disc}(\Psi)=${rationalTex(directions.discriminant)}`}</MathLabel>.</span>
      <small>Álgebra racional exata dos decimais fornecidos. Coeficientes arredondados podem pertencer a outro estrato; isso não certifica dados aproximados nas fronteiras.</small>
      <small>A geometria de Δ = 0 é calculada separadamente em ponto flutuante. Estas camadas não classificam conexões globais nem certificam entropia.</small>
    </div></details>
  </section>
}
