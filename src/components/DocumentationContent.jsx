import readingHtml from '../../docs/mathematics/26-guia-leitura.html?raw'
import workspacesHtml from '../../docs/mathematics/25-ambientes.html?raw'
import auditHtml from '../../docs/mathematics/24-auditoria-matematica.html?raw'
import diagnosticsHtml from '../../docs/mathematics/23-diagnosticos-numericos.html?raw'
import classificationHtml from '../../docs/mathematics/22-classificacao-estados.html?raw'
import affineHtml from '../../docs/mathematics/21-transformacoes-afins.html?raw'
import chainsHtml from '../../docs/mathematics/20-cadeias-riemann.html?raw'
import compositeHtml from '../../docs/mathematics/19-ondas-compostas.html?raw'
import separatricesHtml from '../../docs/mathematics/18-separatrizes.html?raw'
import fieldHtml from '../../docs/mathematics/17-campo-rarefacao.html?raw'
import intersectionHtml from '../../docs/mathematics/16-inflexao-dupla-sonica.html?raw'
import sonicHtml from '../../docs/mathematics/15-sonicas.html?raw'
import coincidenceHtml from '../../docs/mathematics/14-coincidencia.html?raw'
import reciprocalHtml from '../../docs/mathematics/13-carta-reciproca.html?raw'
import hugoniotProjectionHtml from '../../docs/mathematics/12-projecao-hugoniot.html?raw'
import fibresHtml from '../../docs/mathematics/11-fibras-hugoniot.html?raw'
import projectionsHtml from '../../docs/mathematics/10-estados-projecoes.html?raw'
import finiteChartHtml from '../../docs/mathematics/09-carta-finita.html?raw'
import coordinatesHtml from '../../docs/mathematics/08-deducao-coordenadas.html?raw'
import manifoldHtml from '../../docs/mathematics/07-variedade-construcao.html?raw'
import entropyHtml from '../../docs/mathematics/06-entropia-admissibilidade.html?raw'
import shockHtml from '../../docs/mathematics/05-choques-hugoniot-lax.html?raw'
import rarefactionHtml from '../../docs/mathematics/04-rarefacoes.html?raw'
import spectrumHtml from '../../docs/mathematics/03-espectro.html?raw'
import weakHtml from '../../docs/mathematics/02-leis-conservacao.html?raw'
import DocumentationHtml from './DocumentationHtml.jsx'
import riemannHtml from '../../docs/mathematics/01-problema-de-riemann.html?raw'


export const documentationSections=[
  ['1. Problema de Riemann: formulação',<DocumentationHtml source={riemannHtml}/>],
  ['2. Leis de conservação e soluções fracas',<DocumentationHtml source={weakHtml}/>],
  ['3. Autovalores e regiões espectrais',<DocumentationHtml source={spectrumHtml}/>],
  ['4. Rarefações e famílias características',<DocumentationHtml source={rarefactionHtml}/>],
  ['5. Choques, Hugoniot e condições de Lax',<DocumentationHtml source={shockHtml}/>],
  ['6. Entropia e admissibilidade',<DocumentationHtml source={entropyHtml}/>],
  ['7. Variedade de Ondas: construção e projeções',<DocumentationHtml source={manifoldHtml}/>],
  ['8. Dedução das coordenadas da Variedade de Ondas',<DocumentationHtml source={coordinatesHtml}/>],
  ['9. Variedade de Ondas e carta finita',<DocumentationHtml source={finiteChartHtml}/>],
  ['10. Estados locais e projeções',<DocumentationHtml source={projectionsHtml}/>],
  ['11. Estado genérico U* e fibras de Hugoniot',<DocumentationHtml source={fibresHtml}/>],
  ['12. Projeção explícita das Hugoniot em U',<DocumentationHtml source={hugoniotProjectionHtml}/>],
  ['13. Carta recíproca e infinito',<DocumentationHtml source={reciprocalHtml}/>],
  ['14. Coincidência, direções duplas e degenerações',<DocumentationHtml source={coincidenceHtml}/>],
  ['15. Sônicas: definição tradicional e construção topológica',<DocumentationHtml source={sonicHtml}/>],
  ['16. Inflexão e dupla sônica: dedução e geometria',<DocumentationHtml source={intersectionHtml}/>],
  ['17. Rarefação',<DocumentationHtml source={fieldHtml}/>],
  ['18. Separatrizes e dinâmica do campo de rarefação',<DocumentationHtml source={separatricesHtml}/>],
  ['19. Ondas compostas: EDO tradicional e construção topológica',<DocumentationHtml source={compositeHtml}/>],
  ['20. Construção de cadeias de ondas para o problema de Riemann',<DocumentationHtml source={chainsHtml}/>],
  ['21. Transformações afins: resultados de invariância',<DocumentationHtml source={affineHtml}/>],
  ['22. Discriminante e classificação dos estados',<DocumentationHtml source={classificationHtml}/>],
  ['23. Diagnósticos numéricos e limitações',<DocumentationHtml source={diagnosticsHtml}/>],
  ['24. Critérios de validade e auditoria matemática',<DocumentationHtml source={auditHtml}/>],
  ['25. Organização dos ambientes',<DocumentationHtml source={workspacesHtml}/>],
  ['26. Guia de leitura e dependências matemáticas',<DocumentationHtml source={readingHtml}/>],

]
