# Diagnósticos numéricos e limitações

Os procedimentos computacionais aproximam objetos definidos por equações contínuas. É necessário distinguir **identidade algébrica** , **existência geométrica**  e **detecção numérica** : a validade de uma não implica automaticamente as outras.

## Definição — Resíduo e erro geométrico

Para uma equação implícita $G(q)=0$, o resíduo $\|G(q_h)\|$ mede a violação da equação na aproximação $q_h$. Ele não é, sem hipóteses de regularidade, uma estimativa da distância ao conjunto exato de zeros.

## Proposição — Controle local pela transversalidade

Se $G:\mathbb R^n\to\mathbb R^k$ é continuamente diferenciável, $G(q_*)=0$ e $DG(q_*)$ tem posto $k$, então, localmente, o conjunto $G^{-1}(0)$ é uma subvariedade de dimensão $n-k$.

**Demonstração.** O resultado segue do teorema da função implícita, após escolher $k$ coordenadas nas quais um menor de $DG(q_*)$ é invertível. A conclusão é local e não estabelece o número global de componentes. $\square$

Na interseção entre uma superfície saturada e uma sônica, a transversalidade deve ser verificada nas equações que definem ambas, não apenas pela aparência do cruzamento na projeção 3D. Em tangências, bifurcações ou jacobianos mal condicionados, resíduos pequenos podem coexistir com erros geométricos grandes.

## Critério de auditoria — Refinamento e rastreamento de ramos

Comparar resoluções exige identificar o mesmo ramo ou a mesma interseção por continuação e correspondência geométrica. A redução de um resíduo em uma malha não demonstra, por si, convergência da topologia, completude das componentes ou preservação das conexões entre separatrizes.

**Limites computacionais** Ausência de contorno detectado não prova inexistência de soluções; a presença de triângulos ou segmentos não prova regularidade global. Os diagnósticos dependem do domínio, das cartas, das tolerâncias, da discretização e do tratamento das singularidades.

## Procedimento — Registro de uma experiência reproduzível

Ao comparar resultados, registrar o fluxo, os dados de Riemann ou estado de exploração, as cartas, o ramo selecionado, a janela de cálculo e as tolerâncias. Também registrar a resolução, os limites de integração, os motivos de parada disponíveis e a versão do código. Se alguma informação não estiver incluída no arquivo de experiência exportado, ela precisa ser guardada separadamente.

A política numérica central fica em src/math/numerics/policy.js e os procedimentos compartilhados em integration.js e polynomialRoots.js. Isso não significa que todas as constantes do projeto já estejam centralizadas: existem limiares locais que devem ser considerados na reprodução dos resultados.

## Observação — Resíduo regularizado e equação original

Multiplicar uma equação por uma função não nula preserva seus zeros em um domínio, mas pode mudar drasticamente a escala do resíduo. Se o fator tende a zero na fronteira, um resíduo pequeno pode esconder a violação da equação original. A busca recíproca de compostas descrita na seção 19 exemplifica esse risco; candidatos de fronteira precisam de avaliação direta na carta válida.

Da mesma forma, um status de ausência de violação detectada descreve os testes executados, não uma certificação contínua. Resultado inconclusivo, diagnóstico indisponível e teste que não encontrou eventos são situações distintas e devem permanecer distintas nos relatórios.
