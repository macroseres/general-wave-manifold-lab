import readingMarkdown from '../../docs/mathematics/26-guia-leitura.md?raw'
import workspacesMarkdown from '../../docs/mathematics/25-ambientes.md?raw'
import auditMarkdown from '../../docs/mathematics/24-auditoria-matematica.md?raw'
import diagnosticsMarkdown from '../../docs/mathematics/23-diagnosticos-numericos.md?raw'
import classificationMarkdown from '../../docs/mathematics/22-classificacao-estados.md?raw'
import affineMarkdown from '../../docs/mathematics/21-transformacoes-afins.md?raw'
import chainsMarkdown from '../../docs/mathematics/20-cadeias-riemann.md?raw'
import compositeMarkdown from '../../docs/mathematics/19-ondas-compostas.md?raw'
import separatricesMarkdown from '../../docs/mathematics/18-separatrizes.md?raw'
import fieldMarkdown from '../../docs/mathematics/17-campo-rarefacao.md?raw'
import intersectionMarkdown from '../../docs/mathematics/16-inflexao-dupla-sonica.md?raw'
import sonicMarkdown from '../../docs/mathematics/15-sonicas.md?raw'
import coincidenceMarkdown from '../../docs/mathematics/14-coincidencia.md?raw'
import reciprocalMarkdown from '../../docs/mathematics/13-carta-reciproca.md?raw'
import hugoniotProjectionMarkdown from '../../docs/mathematics/12-projecao-hugoniot.md?raw'
import fibresMarkdown from '../../docs/mathematics/11-fibras-hugoniot.md?raw'
import projectionsMarkdown from '../../docs/mathematics/10-estados-projecoes.md?raw'
import finiteChartMarkdown from '../../docs/mathematics/09-carta-finita.md?raw'
import coordinatesMarkdown from '../../docs/mathematics/08-deducao-coordenadas.md?raw'
import manifoldMarkdown from '../../docs/mathematics/07-variedade-construcao.md?raw'
import entropyMarkdown from '../../docs/mathematics/06-entropia-admissibilidade.md?raw'
import shockMarkdown from '../../docs/mathematics/05-choques-hugoniot-lax.md?raw'
import rarefactionMarkdown from '../../docs/mathematics/04-rarefacoes.md?raw'
import spectrumMarkdown from '../../docs/mathematics/03-espectro.md?raw'
import weakMarkdown from '../../docs/mathematics/02-leis-conservacao.md?raw'
import DocumentationMarkdown from './DocumentationMarkdown.jsx'
import riemannMarkdown from '../../docs/mathematics/01-problema-de-riemann.md?raw'


export const documentationSections=[
  ['1. Problema de Riemann: formulação',<DocumentationMarkdown source={riemannMarkdown}/>],
  ['2. Leis de conservação e soluções fracas',<DocumentationMarkdown source={weakMarkdown}/>],
  ['3. Autovalores e regiões espectrais',<DocumentationMarkdown source={spectrumMarkdown}/>],
  ['4. Rarefações e famílias características',<DocumentationMarkdown source={rarefactionMarkdown}/>],
  ['5. Choques, Hugoniot e condições de Lax',<DocumentationMarkdown source={shockMarkdown}/>],
  ['6. Entropia e admissibilidade',<DocumentationMarkdown source={entropyMarkdown}/>],
  ['7. Variedade de Ondas: construção e projeções',<DocumentationMarkdown source={manifoldMarkdown}/>],
  ['8. Dedução das coordenadas da Variedade de Ondas',<DocumentationMarkdown source={coordinatesMarkdown}/>],
  ['9. Variedade de Ondas e carta finita',<DocumentationMarkdown source={finiteChartMarkdown}/>],
  ['10. Estados locais e projeções',<DocumentationMarkdown source={projectionsMarkdown}/>],
  ['11. Estado genérico U* e fibras de Hugoniot',<DocumentationMarkdown source={fibresMarkdown}/>],
  ['12. Projeção explícita das Hugoniot em U',<DocumentationMarkdown source={hugoniotProjectionMarkdown}/>],
  ['13. Carta recíproca e infinito',<DocumentationMarkdown source={reciprocalMarkdown}/>],
  ['14. Coincidência, direções duplas e degenerações',<DocumentationMarkdown source={coincidenceMarkdown}/>],
  ['15. Sônicas: definição tradicional e construção topológica',<DocumentationMarkdown source={sonicMarkdown}/>],
  ['16. Inflexão e dupla sônica: dedução e geometria',<DocumentationMarkdown source={intersectionMarkdown}/>],
  ['17. Rarefação',<DocumentationMarkdown source={fieldMarkdown}/>],
  ['18. Separatrizes e dinâmica do campo de rarefação',<DocumentationMarkdown source={separatricesMarkdown}/>],
  ['19. Ondas compostas: EDO tradicional e construção topológica',<DocumentationMarkdown source={compositeMarkdown}/>],
  ['20. Construção de cadeias de ondas para o problema de Riemann',<DocumentationMarkdown source={chainsMarkdown}/>],
  ['21. Transformações afins: resultados de invariância',<DocumentationMarkdown source={affineMarkdown}/>],
  ['22. Discriminante e classificação dos estados',<DocumentationMarkdown source={classificationMarkdown}/>],
  ['23. Diagnósticos numéricos e limitações',<DocumentationMarkdown source={diagnosticsMarkdown}/>],
  ['24. Critérios de validade e auditoria matemática',<DocumentationMarkdown source={auditMarkdown}/>],
  ['25. Organização dos ambientes',<DocumentationMarkdown source={workspacesMarkdown}/>],
  ['26. Guia de leitura e dependências matemáticas',<DocumentationMarkdown source={readingMarkdown}/>],

]
