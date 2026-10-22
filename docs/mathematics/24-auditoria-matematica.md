# Critérios de validade e auditoria matemática

Este capítulo organiza critérios de revisão. Sua presença na referência não significa que todas as auditorias tenham sido concluídas para todos os fluxos e ramos.

## Convenções — Notação e objetos distintos

Denotamos a Variedade de Ondas por $\mathcal W$, a característica por $\mathcal C$ e a coincidência espectral por $\mathcal E$. O discriminante é $\Delta(u,v)$, enquanto $N(z)=P(z)^2+Q(z)^2$ é apenas o denominador da carta finita.

As identidades de Rankine–Hugoniot, as projeções e a similaridade do jacobiano sob transformações afins são afirmações algébricas. Já a cobertura de todas as componentes, a regularidade das interseções e a identificação de separatrizes globais exigem hipóteses e demonstrações adicionais.

## Proposição — A diagonal de Rankine–Hugoniot não é a característica desingularizada

Nas coordenadas globais de salto $(X,Z)=U_+-U_-$, a condição $X=0$ isoladamente não caracteriza estados coincidentes. A diagonal é definida por $X=Z=0$. Nela, Rankine–Hugoniot se anula para toda velocidade $s$; para selecionar a característica desingularizada, exige-se adicionalmente uma direção projetiva não nula $r$ e $(DF(\bar U)-sI)r=0$. Na carta finita, a diagonal corresponde a $Y=0$; na recíproca, a $\widehat{Y}=0$.

**Demonstração.** A equação de Rankine–Hugoniot do fluxo quadrático é $(DF(\bar U)-sI)\Delta U=0$. Para $\Delta U=0$, ela é identicamente satisfeita e não fixa s. Substituir $\Delta U=Yr(z)$ e dividir por Y apenas para $Y\ne0$ fornece a equação própria; sua continuação até Y=0 define o levantamento característico. $\square$

## Proposição — Dimensão regular e singularidade da diagonal

Considere o mapa de Rankine–Hugoniot $H(\bar U,\Delta U,s)=(DF(\bar U)-sI)\Delta U$ para um fluxo quadrático. Se o diferencial de H tiver posto dois em um ponto de $H^{-1}(0)$, esse conjunto é localmente uma subvariedade de dimensão três. Essa conclusão não pode ser estendida automaticamente à diagonal $\Delta U=0$, pois ali as derivadas de H em relação a $\bar U$ e a s se anulam e $D_{\Delta U}H=DF(\bar U)-sI$ tem posto no máximo um quando s é um autovalor.

**Demonstração.** O teorema do valor regular fornece a dimensão $5-2=3$ sob a hipótese de posto dois. Na diagonal, diferenciando H obtemos $dH=(DF(\bar U)-sI)d(\Delta U)$, porque os termos que envolvem a variação de $\bar U$ e de s são multiplicados por $\Delta U=0$. Se s é autovalor, a matriz tem determinante zero, portanto posto inferior a dois. A variedade característica desingularizada deve ser construída em coordenadas com direção projetiva adicional, não identificada automaticamente com a diagonal bruta. $\square$

## Critério de auditoria — Degenerações espectrais e normalizações

As expressões $\nabla\lambda_i\cdot r_i$ e a identificação de $\mathcal J$ por $Y=K=0$ exigem uma família característica diferenciável, tipicamente com autovalor simples. Em pontos de coincidência espectral, distinguir jacobiano escalar de jacobiano não escalar e não transportar conclusões obtidas no regime estritamente hiperbólico sem nova demonstração. Uma igualdade de conjuntos algébricos não certifica regularidade, transversalidade ou existência de uma única componente.

## Critério de auditoria — Condições de choque e admissibilidade

A condição de Rankine–Hugoniot, a coincidência sônica e a existência de uma curva composta geométrica são afirmações diferentes. A EDO composta pressupõe a regularidade dos ramos e uma condição inicial que zere o resíduo de Rankine–Hugoniot; sua equivalência com a construção por saturação é local e depende da seleção do ramo e da transversalidade pertinente. A existência de perfil viscoso depende da matriz de viscosidade escolhida e não constitui, isoladamente, teorema de existência ou unicidade da solução global de Riemann.

## Critério de auditoria — Hipóteses para equivalências entre cartas

Identidades obtidas por multiplicação por $Z$ ou $Z^2$ estabelecem equivalência dos zeros somente na sobreposição $Z\ne0$. A direção $Z=0$ exige avaliação direta na carta recíproca. A classificação de singularidades do campo requer ainda explicitar qualquer reparametrização temporal e seu sinal.

## Procedimento — Auditoria entre cartas

Para cada objeto geométrico, deve-se verificar: a equação definidora em cada carta; a transformação nas regiões de sobreposição; a consistência da orientação; e a estabilidade dos ramos sob refinamento. A compactificação visual de $z$ não substitui a carta recíproca na direção projetiva omitida.

## Procedimento — Auditoria de sônicas e compostas

As equações implícitas de $\mathcal S^\pm$ devem ser comparadas com os determinantes espectrais antes da triangulação. Para $\mathcal K_\pm$, deve-se comparar a construção por EDO com a saturação de $\mathcal R$ e interseção com a folha sônica apropriada, mantendo a condição inicial de Rankine–Hugoniot e verificando transversalidade nos trechos regulares.

**Escopo da certificação** Testes automatizados, resíduos pequenos e convergência observada constituem evidência computacional, não demonstração de igualdade global. Em particular, os ramos desenhados de $\mathcal E$, $\mathcal J$ e $\mathcal{DS}$ precisam ser confrontados com suas equações e com as degenerações das cartas.
