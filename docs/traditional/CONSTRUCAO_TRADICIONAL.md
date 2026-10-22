# Construção tradicional: estados, ondas e solução de Riemann

Para aplicar esta base aos padrões de ondas e registrar as conclusões de cada critério, consultar [Cadeias e admissibilidade](CADEIAS_E_ADMISSIBILIDADE.md).

## 1. Dados, hipóteses e âmbito

Sejam Ω um aberto de R², F:Ω→R² de classe C³ e U_L,U_R∈Ω. O problema é

$$
U_t+F(U)_x=0,\qquad U(x,0)=U_0(x)=\begin{cases}U_L,&x<0,\\U_R,&x>0.\end{cases}
$$

Os cálculos locais abaixo requerem apenas a regularidade indicada em cada construção. A especialização do aplicativo é F=(f,g), com f=a₂₀u²+a₁₁uv+a₀₂v²+a₁₀u+a₀₁v e g=b₂₀u²+b₁₁uv+b₀₂v²+b₁₀u+b₀₁v. A escolha dos dez coeficientes não garante hiperbolicidade, entropia convexa ou existência de solver global.

Construção tradicional abrange as teorias clássica e não clássica de admissibilidade. Solução clássica, quando significa solução diferenciável da EDP, descreve regularidade. A construção topológica não é utilizada neste texto.

## 2. Solução fraca, traço inicial e similaridade

Uma função limitada U, com valores em um compacto de Ω, é solução fraca com dado U₀ se, para toda função teste vetorial φ∈C_c¹(R×[0,∞);R²),

$$
\int_0^\infty\!\int_{\mathbb R}\bigl(U\cdot\varphi_t+F(U)\cdot\varphi_x\bigr)\,dx\,dt+\int_{\mathbb R}U_0(x)\cdot\varphi(x,0)\,dx=0.
$$

Exigir também o traço U(·,t)→U₀ em L¹ local é uma forma explícita de registrar a condição inicial. A invariância do dado por dilatações motiva procurar U(x,t)=W(ξ), ξ=x/t; não prova existência ou unicidade.

**Dedução.** Em trechos C¹, U_t=−ξW'/t e F(U)_x=DF(W)W'/t, logo (DF(W)−ξI)W'=0. Trechos não constantes precisam seguir uma direção própria com velocidade igual a ξ.

## 3. Espectro e famílias características

Escreva A(U)=DF(U), T=tr A, D=det A e Δ=T²−4D. Na região Δ>0, λ₁=(T−√Δ)/2<λ₂=(T+√Δ)/2 são reais e simples. Escolhem-se campos próprios locais não nulos r_i, com A r_i=λ_i r_i. Uma mudança de normalização altera o parâmetro da curva, não sua imagem.

A família i é genuinamente não linear em um domínio se γ_i=∇λ_i·r_i nunca se anula ali. É linearmente degenerada se γ_i é identicamente zero no domínio. Anular γ_i em um único estado não estabelece degenerescência linear. Chamamos de lugar de inflexão da família o conjunto γ_i=0 dentro da região de autovalor simples; sua regularidade exige condições adicionais.

Em Δ=0, verificar separadamente se A é escalar ou tem apenas uma direção própria. Em Δ<0 não há duas famílias características reais: a construção hiperbólica por duas ondas não pode ser aplicada. A classificação espectral não é uma classificação completa das soluções de Riemann.

## 4. Curvas integrais e rarefações

Uma curva integral da família i satisfaz dR/dα=r_i(R). Para campo C¹, o problema inicial tem solução local única. Uma rarefação orientada de U_a para U_b requer que h(α)=λ_i(R(α)) cresça no sentido percorrido. Em um trecho com h'>0, define-se

$$
W(\xi)=\begin{cases}U_a,&\xi\leq\lambda_i(U_a),\\R(h^{-1}(\xi)),&\lambda_i(U_a)<\xi<\lambda_i(U_b),\\U_b,&\xi\geq\lambda_i(U_b).\end{cases}
$$

**Demonstração.** A inversa é C¹ pelo teorema da função inversa. Temos W'=r_i/h' e (DF(W)−ξI)W'=0. As bordas são contínuas, portanto não produzem termos de salto na formulação fraca. Uma curva integral com velocidades decrescentes não produz esse leque expansivo. Se h'=0, é necessária uma análise por trechos; monotonicidade estrita sozinha não garante inversa C¹.

## 5. Contatos e campos linearmente degenerados

Se γ_i≡0 ao longo de uma curva integral, λ_i é constante nela, igual a s. Para dois estados U_a,U_b no mesmo trecho,

$$
F(U_b)-F(U_a)=\int_a^b DF(R)R'\,d\alpha=s\int_a^b R'\,d\alpha=s(U_b-U_a).
$$

Assim, a descontinuidade que os separa em x=st é uma conexão conservativa característica nos dois extremos, chamada contato dessa família. Essa construção exige constância ao longo do trecho, não apenas igualdade de duas velocidades nos extremos. Para qualquer par de entropia compatível, a mesma integração dá [q]−s[η]=0 ao longo desse contato. Isso não fornece uma teoria global de seleção para contatos arbitrários.

## 6. Hugoniot, choques e tangência local

Fixado U_a, o lugar de Hugoniot é o conjunto dos U_b≠U_a para os quais existe s tal que F(U_b)−F(U_a)=s(U_b−U_a). A velocidade é única para salto não nulo. Com d=U_b−U_a e b=F(U_b)−F(U_a), s=(d·b)/(d·d) satisfaz a relação exatamente apenas se b−sd=0. Um choque candidato é a interface com esses estados e velocidade; seleção ainda precisa ser imposta.

**Tangência necessária.** Considere um ramo diferenciável U_b(a)=U_a+a r+o(a), r≠0, com s(a)→s₀. Dividir Rankine–Hugoniot por a e tomar o limite dá DF(U_a)r=s₀r. Portanto, um ramo de pequenos choques deve sair por uma direção característica. Esse argumento não prova sozinho a existência do ramo.

Para o fluxo quadrático, vale a identidade exata

$$
F(U_b)-F(U_a)=DF\left(\frac{U_a+U_b}{2}\right)(U_b-U_a).
$$

**Dedução.** Integre DF ao longo do segmento. Como DF é afim, sua média no segmento é o valor no ponto médio. Essa identidade é uma simplificação algébrica específica do grau dois e não uma regra para fluxo geral.

## 7. Critérios clássicos: Lax e Liu

Em estados estritamente hiperbólicos, um choque da família 1 é estritamente Lax se λ₁(U_b)<s<λ₁(U_a) e s<λ₂(U_b). Para a família 2, exige-se λ₂(U_b)<s<λ₂(U_a) e λ₁(U_a)<s. Igualdades são casos característicos e precisam de tratamento separado.

Para definir a condição de Liu usada aqui, fixe o estado esquerdo U_a e um ramo contínuo de Hugoniot S_i(a), com S_i(0)=U_a e velocidade s_i(a). Escolhido o segmento de parâmetro que vai de 0 ao ponto final a*, a condição é

$$
s_i(a_*)\leq s_i(a)\quad\text{para todo }a\text{ no segmento entre }0\text{ e }a_*.
$$

O ramo e o sentido de percurso são parte dos dados. Não se comparam automaticamente pontos de ramos distintos. Fixar o estado direito ou inverter os estados exige reformular a orientação, não copiar a desigualdade. Amostragem finita pode detectar violações, mas não prova a desigualdade em todo o arco. Não se afirma equivalência global entre Lax, Liu, entropia e perfis viscosos.

## 8. Entropia, conservação e compressividade

Um par (η,q) de classe C² é compatível se Dq=Dη DF. A convexidade de η precisa ser verificada no domínio; convexidade estrita é uma hipótese adicional. Para soluções suaves, a regra da cadeia dá η(U)_t+q(U)_x=0. Para a seleção entrópica, exige-se η(U)_t+q(U)_x≤0 no sentido distribucional, para o par ou classe de pares especificada.

**Produção no salto.** Em uma interface x=st, escrever U como dois estados separados por um degrau mostra que a produção concentrada é ([q]−s[η])δ(x−st). Logo o critério nesse choque é [q]−s[η]≤0. Isso não implica unicidade para um sistema geral.

Sem velocidades características iguais a s, o número de características que entram na interface é

$$
N_{\rm in}=\#\{j:\lambda_j(U_a)>s\}+\#\{j:\lambda_j(U_b)<s\}.
$$

No sistema 2×2, N_in=3 é a contagem dos choques estritos de Lax; N_in<3 e N_in>3 designam, respectivamente, contagens subcompressiva e sobrecompressiva nesta convenção. A contagem não prova admissibilidade; com igualdades características esses rótulos exigem análise adicional.

O capítulo [Classificação dos saltos](CLASSIFICACAO_DOS_SALTOS.md) explicita os nove interiores definidos pelas posições espectrais nos dois extremos, distingue suas fronteiras e fornece exemplos de RH no fluxo quadrático. Essa classificação é anterior à seleção e à montagem das cadeias.

## 9. Sonicidade, dupla sonicidade e compostas

Uma conexão de choque é sônica no lado esquerdo ou direito quando s é autovalor de DF no respectivo estado. É duplamente sônica quando ambas as condições valem, mantendo salto não nulo. Isso não determina, por si só, a família nem a admissibilidade.

Uma onda composta é uma concatenação de ondas elementares da família em estudo, como choque e rarefação unidos por uma borda sônica. Exige estados compatíveis, velocidades ordenadas e seleção de cada segmento. Uma conexão sônica isolada ainda não define uma composta física.

Para construir uma família de conexões sônicas, seja R'=r_i(R), s=λ_i(R) e procure V tal que F(V)−F(R)=s(V−R). A orientação física R→V ou V→R deve ser declarada separadamente. Diferenciando,

$$
(DF(V)-sI)V'=s'(V-R),\qquad s'=\nabla\lambda_i(R)\cdot r_i(R).
$$

Essa é uma EDO implícita tradicional. Se DF(V)−sI é inversível, ela determina V'. Se for singular, não se pode inverter; compatibilidade e existência de continuação precisam de análise própria. A EDO preserva o resíduo de Rankine–Hugoniot, pois sua derivada é zero, mas é necessário impor resíduo inicial nulo. A colagem física permite igualdade entre velocidade de choque e borda do leque, sem exigir um intervalo constante de largura positiva entre ambos.

## 10. Regularização e perfis viajantes

Escolha explicitamente a regularização U_t+F(U)_x=ε(B(U)U_x)_x. Para U(x,t)=V(ζ), ζ=(x−st)/ε, supondo os limites e decaimento necessários para integrar desde −∞, obtém-se

$$
B(V)V'=F(V)-F(U_a)-s(V-U_a),\qquad V(-\infty)=U_a,\quad V(+\infty)=U_b.
$$

**Dedução.** Substituir o ansatz dá −sV'+(F(V))'=(B(V)V')'. A integração fixa a constante pelo estado esquerdo e derivada assintótica nula. O limite à direita impõe Rankine–Hugoniot. B singular exige tratamento implícito.

Se o perfil é suficientemente regular e D²η(V)B(V) tem forma quadrática não negativa, multiplicar a equação diferencial de segunda ordem por Dη e integrar fornece

$$
[q]-s[\eta]=-\int_{\mathbb R}V'^T D^2\eta(V)B(V)V'\,d\zeta\leq0,
$$

com termos de fronteira dissipativos nulos. Isso demonstra a desigualdade para esse perfil e esse par; não demonstra convergência do problema de Cauchy quando ε→0.

Para B constante e dispersão constante δC, a regularização com termo δ ε² C U_xxx leva à equação integrada δC V''+B V'=F(V)−F(U_a)−s(V−U_a). A seleção pode depender de δ, B e C. Não se transfere automaticamente a identidade dissipativa puramente viscosa para esse modelo.

## 11. Relação cinética e construção não clássica

Para o modelo selecionado, declarar domínio de estados, par de entropia, regularização, classe de perfis, orientação e relação cinética. Uma notação geral é K(U_a,U_b,s)=0, a ser combinada com Rankine–Hugoniot e a desigualdade entrópica. Quando demonstradamente unívoca, a relação pode ser expressa por uma função cinética em coordenadas apropriadas. Para sistemas, não se presume um mapa global U_b=φ(U_a) que descreva todas as conexões.

A construção não clássica consiste em selecionar os ramos permitidos por esses dados e concatená-los com as demais ondas, respeitando as velocidades. Uma regra de nucleação pode ser necessária no modelo escolhido. Um choque que falha em Lax não se torna automaticamente não clássico admissível.

**Fonte localizada.** LeFloch, revisão de 2010, §§2.1–2.3, discute seleção entrópica e relações cinéticas; §4.4 distingue o caso de sistemas; §§5.1 e 5.3 relacionam a seleção com perfis viajantes. Esses trechos orientam os dados necessários. As fórmulas escalares de um modelo côncavo-convexo não fornecem uma relação cinética para o fluxo quadrático geral. [Texto consultado](https://arxiv.org/html/1002.2950v1).

Não há relação cinética geral determinada nesta referência. Sua escolha não pode ser substituída por conveniência gráfica nem deduzida apenas dos dez coeficientes do fluxo sem especificar a teoria física adicional.

## 12. Curvas de ondas e estado intermediário

Fixado um modelo de admissibilidade A, uma curva de ondas T_i(a;U) deve designar a construção orientada da família i a partir de U, podendo reunir trechos de rarefação, choque, contato ou composta nos domínios em que foram definidos. Ela não é o lugar completo de Hugoniot e não existe globalmente por definição.

Em uma construção local por duas famílias, procura-se

$$
U_M=T_1(a;U_L),\qquad U_R=T_2(b;U_M).
$$

**Proposição condicional de resolução local.** Suponha T_i conjuntamente C¹ perto de (0,U_*), T_i(0;U)=U e ∂_aT_i(0;U)=r_i(U). Se U_* é estritamente hiperbólico, o mapa (a,b)↦T₂(b;T₁(a;U_*)) é localmente invertível.

**Demonstração.** Seu diferencial na origem tem colunas r₁(U_*) e r₂(U_*), independentes pela simplicidade dos autovalores. Aplica-se o teorema da função inversa. Isso demonstra o estado intermediário local sob as hipóteses assumidas; não prova a existência das curvas admissíveis, sua ordenação física ou unicidade entre todas as soluções fracas. Esses requisitos devem ser estabelecidos antes de chamar o resultado de solver local.

## 13. Colagem no espaço físico e traço inicial

Considere uma cadeia finita de choques, contatos e leques C¹, com estados compatíveis, valores em um compacto de Ω e velocidades limitadas. Ordene os suportes em ξ; intervalos constantes de largura positiva entre choques exigem velocidades estritamente crescentes. Junções sônicas podem compartilhar a mesma borda se o salto e os traços forem compatíveis.

**Proposição.** Se cada trecho suave satisfaz a equação de similaridade, cada descontinuidade satisfaz Rankine–Hugoniot e as demais bordas são contínuas, a colagem U(x,t)=W(x/t) é solução fraca no interior t>0. Se W=U_L e U_R fora de um intervalo finito de velocidades, ela tem o traço de Riemann em L¹ local. Se, adicionalmente, todos os saltos satisfazem a desigualdade para cada par de entropia escolhido, a cadeia satisfaz essas desigualdades.

**Demonstração.** Integre por partes em cada região. Os termos de volume se anulam pela EDP e os de interface por Rankine–Hugoniot ou continuidade. Para o traço, a diferença em relação ao degrau inicial fica contida em |x|≤Mt e é uniformemente limitada; sua integral local é O(t). Para entropia, repita a integração: os únicos termos concentrados são as produções não positivas dos saltos. O argumento não demonstra unicidade nem admissibilidade por uma relação cinética não verificada.

## 14. Exemplos de controle e classificação por parâmetros

Para F=(u²/2,v²/2+3u/4), DF tem autovalores u e v. Na região u>v, a família rápida tem λ₂=u. A curva R(α)=(α,α−3/4) tem R'=(1,1), DF(R)R'=αR' e velocidade crescente. Para 0≤α≤1, ela produz o leque W(ξ)=(ξ,ξ−3/4) entre os estados (0,−3/4) e (1,1/4).

A conexão (2,0)→(0,−1), s=1, tem salto (−2,−1), diferença de fluxos (−2,−1) e espectros (0,2) e (−1,0). Logo é estritamente Lax 2. Precedida por (2,1)→(2,0), s=1/2, estritamente Lax 1, forma uma cadeia de dois choques ordenados. Isso verifica conservação e Lax nos extremos, sem declarar certificação entrópica geral.

O contato, as rarefações, os choques e as compostas precisam ser classificados por parâmetros a partir dessas definições. Separar tipo espectral em cada estado, anulação de γ_i, conjuntos de conexões sônicas, ramos admissíveis e padrões de Riemann. Um corte bidimensional do espaço de coeficientes não é classificação global.

Os [estudos reproduzíveis](../examples/README.md) contêm dados, relatórios e testes desses casos e de uma junção choque–rarefação sônica. Usar primeiro as contas nos estados e o perfil físico; as figuras na variedade pertencem à segunda camada.

## 15. Procedência e limites desta base

As demonstrações de similaridade, contato, tangência, identidade quadrática, EDO composta, equação de perfil, composição local condicional e colagem foram expostas acima como deduções, sem reivindicação de originalidade. O [mapa bibliográfico](../BIBLIOGRAPHY.md) identifica as referências consultadas e os limites da consulta. O livro de LeFloch de 2002 permanece referência de trabalho; números de teoremas ainda não conferidos não são atribuídos a ele.

O complemento [Resultados locais e regimes](RESULTADOS_E_REGIMES.md) localiza os teoremas de curvas de ondas e solver clássico local, deduz ramos de pequenos choques e sua desigualdade entrópica e incorpora a classe difusão–dispersão escolhida. Continuam necessárias a definição dos coeficientes da regularização e a relação cinética para cada regime não clássico do fluxo quadrático estudado. Coincidência, regiões elípticas, grandes amplitudes e múltiplos ramos exigem teoria específica. A teoria global para todos os parâmetros não é declarada concluída.
