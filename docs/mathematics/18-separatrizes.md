# Separatrizes e dinâmica do campo de rarefação

## Definição — Campo de rarefação

Sobre a característica, a direção do campo é obtida levantando direções próprias do jacobiano do fluxo. Na carta finita do laboratório, um representante é

$$
\dot\tau=\det(r,U_z),\qquad \dot z=\det(T,r),\quad r=(z,1).
$$

Multiplicar esse campo por uma função escalar não nula preserva suas órbitas não orientadas, mas pode inverter a orientação temporal.

## Proposição — Transformação do campo entre cartas

Considere a característica $\mathcal C$ como uma superfície regular e o campo de rarefação como uma direção tangente, definida a menos de um fator escalar não nulo. Nas regiões em que ambas as parametrizações são regulares, seja $h$ a mudança de carta. Se $V$ representa o campo na carta finita, então sua expressão geométrica na carta recíproca é

$$
\widehat V(h(p))=Dh(p)\,V(p).
$$

Se os representantes numéricos forem normalizados de maneira diferente, a identidade assume a forma $\widehat V(h(p))=\rho(p)Dh(p)V(p)$, com $\rho(p)\ne0$. As órbitas como conjuntos são preservadas; a orientação temporal só é preservada quando $\rho>0$.

**Demonstração.** Para uma curva integral $p(t)$, a regra da cadeia fornece $\frac{d}{dt}h(p(t))=Dh(p(t))p'(t)$. Uma multiplicação por função não nula corresponde a uma reparametrização local do tempo; quando o fator é negativo, inverte o sentido da parametrização. $\square$

## Observação — Carta recíproca e direção excepcional

Na sobreposição projetiva, a transformação implementada é $Z=1/z,\;\widehat{Y}=Y/Z,\;\eta=\tau/Z^2$. Para restringir o campo à característica $Y=0$, também se tem $\widehat{Y}=0$ e a mudança de coordenadas tangenciais é $(\tau,z)\mapsto(\eta,Z)=(\tau z^2,1/z)$, para $z\ne0$. A direção $Z=0$ não pertence à sobreposição: exige cálculo direto na carta recíproca, sem extrapolar o campo da carta finita.

## Critério de auditoria — Separatrizes e singularidades projetivas

Uma separatriz que atravessa a sobreposição deve continuar na outra carta com a mesma imagem geométrica. Para comparar setas, verificar também o sinal do fator de reparametrização. Perto de $Z=0$, é necessário determinar o campo estendido, seus zeros, a linearização quando aplicável e os ramos locais estáveis e instáveis. A compactificação $z_{\mathrm c}=(2/\pi)\arctan z$ é apenas uma transformação de exibição: seus pontos de borda não identificam, por si, a estrutura dinâmica projetiva, e o desenho não prova que todos os ramos foram encontrados.

## Definição — Variedades estável e instável

Para uma singularidade hiperbólica p de um campo suave X, definem-se

$$
W^s(p)=\{q:\phi_t(q)\to p\text{ quando }t\to+\infty\},\quad W^u(p)=\{q:\phi_t(q)\to p\text{ quando }t\to-\infty\}.
$$

## Proposição — Tangência das separatrizes

Se p é uma sela hiperbólica de um campo planar de classe $C^1$, suas variedades estável e instável são curvas locais tangentes aos autoespaços estável e instável da linearização em p.

O resultado é uma aplicação local do teorema da variedade estável. Na compactificação, singularidades no infinito requerem a escolha da carta e do fator de reparametrização temporal; um desenho compactificado, isoladamente, não determina o tipo dinâmico da singularidade.

## Proposição — Fator exato entre os representantes implementados

Na sobreposição regular, seja $h(\tau,z)=(\tau z^2,1/z)$. Para os representantes $V_z$ e $V_Z$ calculados por rarefactionField e rarefactionFieldZ, vale

$$
Dh\,V_z=-z\,V_Z\circ h.
$$

O fator é negativo quando $z>0$ e positivo quando $z<0$. Portanto, as órbitas não orientadas correspondem, mas os sentidos dos parâmetros dos dois representantes não coincidem automaticamente.

**Demonstração.** O diferencial fornece $\dot\eta=z^2\dot\tau+2\tau z\dot z$ e $\dot Z=-\dot z/z^2$. Usando $\widetilde T=T/z^2$ e a derivada do mesmo mapa de estados nas duas cartas, as fórmulas por determinantes dão $\dot\eta=-z\,\eta_{V_Z}$ e $\dot Z=-z\,Z_{V_Z}$. Essas são as duas componentes da identidade. O fator é não nulo somente na sobreposição, onde $z\ne0$. $\square$

Essa relação diz respeito aos parâmetros dos campos. A orientação de uma solução física exige ainda o sentido das velocidades características; não deve ser inferida diretamente da seta de um representante normalizado. A identidade é verificada numericamente em tests/rarefactionChartTime.test.js para diferentes fluxos e pontos regulares.

## Separatrizes calculadas e alcance da visualização

Os módulos src/math/rarefaction/singularities.js, finiteSeparatrices.js e separatrices.js calculam singularidades e trajetórias nas cartas correspondentes. A classificação por linearização vale para equilíbrios hiperbólicos; rótulos numéricos próximos de autovalores nulos ou puramente imaginários não demonstram o comportamento não linear.

Para a sela hiperbólica planar, cada variedade local estável e instável possui duas metades, dando quatro semisseparatrizes. No traçador recíproco implementado, as metades estáveis são integradas em parâmetro reverso para sair da vizinhança da sela; as instáveis, em parâmetro direto. O metadado timeDirection registra esse sentido de integração. O algoritmo usa sementes próximas da singularidade e limites finitos de integração, portanto aproxima os ramos sem demonstrar sua extensão global.

Os pontos recíprocos são a representação de origem das separatrizes no infinito. reciprocalPointToFiniteDisplay retorna null na fronteira $Z=0$: uma metade contida ali pode ter lista de pontos finitos vazia e ainda assim ser uma separatriz válida na carta local. O adaptador geométrico deve preservar essa distinção, sem colapsar a curva nas bordas $z_{\mathrm c}=\pm1$.

No espaço de estados, a projeção desses ramos deve ser avaliada com as fórmulas da carta válida. No espaço físico, o ramo dinâmico sozinho não define um leque admissível; permanecem necessárias as condições de monotonicidade e conexão dos estados.

## Fonte do teorema e estudo reproduzível

Para a existência e tangência locais das variedades de uma singularidade hiperbólica, usamos [William M. Feldman, MATH 6410, slides 3–7, Fall 2024](https://www.math.utah.edu/~feldman/ODE-slides/ODE-slides5v2024.pdf#page=7). As hipóteses são campo diferenciável e linearização hiperbólica; esse resultado não garante extensão global nem cobertura por uma janela numérica.

Escolha o preset simétrico com $B_1=8$, $B_2=0$, a=0 e c=1. Seu fluxo é $F(u,v)=(9u^2/2+v^2/2,uv+u)$. infinityRarefactionLinearData identifica a singularidade recíproca $(\eta,Z)=(0,0)$ com autovalores $-8$ e 7. Logo ela é uma sela hiperbólica no representante recíproco.

Na fronteira $Z=0$, a substituição direta em rarefactionFieldZ dá

$$
\dot\eta=-8\eta,\qquad\dot Z=0,\qquad
\bar U=(-\eta,-1).
$$

Assim, $\eta(\sigma)=\eta_0e^{-8\sigma}$ fornece as duas metades do ramo estável quando $\eta_0$ tem sinais opostos. Ambas permanecem na fronteira e não possuem projeção finita em z. Uma lista vazia no desenho finito é esperada, não uma semisseparatriz desaparecida.

As metades instáveis da figura são aproximações do integrador do núcleo, com 80 passos máximos, passo máximo 0.002 e semente $10^{-5}$. Os dados e limites estão no fixture avançado. Não são apresentadas como fórmulas exatas nem como prova de continuação global. O teste verifica o campo exato na fronteira e a presença das quatro metades numéricas com suas convenções de tempo.

![À esquerda, quatro semisseparatrizes na carta recíproca; os ramos estáveis permanecem em Z=0. À direita, o lugar de coincidência do mesmo fluxo nos estados.](/docs/classification-separatrix-reference.svg)
