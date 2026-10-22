# Resultados locais, regimes e seleção por difusão–dispersão

Este capítulo complementa o [texto-base](CONSTRUCAO_TRADICIONAL.md) e o [catálogo de cadeias](CADEIAS_E_ADMISSIBILIDADE.md). A direção de modelagem escolhida pelo usuário é difusão e dispersão, com coeficientes ainda a definir. Isso fixa a classe de estudo, não uma relação cinética universal.

## 1. Teoria clássica local: fonte e escopo

Chen e Wang, *The Cauchy Problem for the Euler Equations for Compressible Fluids*, preprint de 2002, §6.1, pp. impressas 20–22: proposições 6.1–6.3 (ondas elementares), teorema 6.1 (curvas de ondas), teorema 6.2 (problema de Riemann local). [PDF consultado, página impressa 22](https://www.math.ntnu.no/conservation/2002/001.pdf#page=22).

O teorema 6.2 organiza a solução autossimilar de pequena variação para estados próximos, sob hiperbolicidade estrita e famílias genuinamente não lineares ou linearmente degeneradas. A unicidade deve ser entendida na classe local selecionada de ondas admissíveis; não entre todas as soluções fracas. A normalização dos campos usada pelos autores precisa ser traduzida ao usar derivadas de velocidade.

Para o projeto, adotar F de classe C³ e trabalhar em uma vizinhança de U_* onde o gap espectral é positivo e cada família satisfaz uma das duas hipóteses em toda a vizinhança. Não basta testar o gap ou a não linearidade apenas no estado central. Esta referência não é um teorema para amplitudes arbitrárias ou regiões de tipo misto.

## 2. Dedução local dos ramos de Hugoniot

Fixe U_*, um autovalor simples λ_i e autovetores direito r_i e esquerdo ℓ_i, normalizados por ℓ_i r_i=1. Busque o estado S(a)=U_*+a r(a), com ℓ_i r(a)=1, e defina

$$
\mathcal A(a,r)=\int_0^1 DF(U_*+\theta a r)\,d\theta.
$$

Resolver RH para a≠0 equivale a resolver (𝒜(a,r)−sI)r=0. Essa equação estende-se suavemente a a=0, onde r=r_i e s=λ_i. O diferencial em (r,s), com a condição de normalização, envia (δr,δs) em ((DF(U_*)−λ_iI)δr−δs r_i,ℓ_iδr).

**Prova de inversibilidade.** Se essa imagem é zero, multiplicar a primeira componente por ℓ_i dá δs=0. A simplicidade implica δr proporcional a r_i; a segunda componente dá δr=0. Como domínio e contradomínio têm a mesma dimensão, o diferencial é inversível. O teorema da função implícita fornece um ramo local r(a),s(a), portanto S(a), satisfazendo RH.

Derivando a equação em a=0 e multiplicando por ℓ_i, obtém-se

$$
s'(0)=\frac12\ell_i D^2F(U_*)[r_i,r_i]=\frac12\nabla\lambda_i(U_*)\cdot r_i.
$$

A última identidade segue de diferenciar DF r_i=λ_i r_i na direção r_i e multiplicar por ℓ_i. A derivada usa a normalização de amplitude acima; não transportar o valor numérico para outro parâmetro.

Se γ_i=∇λ_i·r_i>0, então, para a<0 suficientemente pequeno, λ_i(S(a))<s(a)<λ_i(U_*): as expansões são λ_i(S(a))=λ_i(U_*)+γ_i a+o(a) e s(a)=λ_i(U_*)+γ_i a/2+o(a). O gap entre famílias preserva as outras desigualdades de Lax ao reduzir a vizinhança. Se γ_i<0, inverter a orientação do campo. Em γ_i=0, esse argumento não seleciona o ramo.

## 3. Entropia dos pequenos choques selecionados

Considere o ramo anterior e um par compatível (η,q), com η convexa em uma bola convexa que contém os estados e seus segmentos. Defina E(a)=q(S(a))−q(U_*)−s(a)(η(S(a))−η(U_*)). Diferenciar RH fornece (DF(S)−sI)S'=s'(S−U_*). Portanto,

$$
E'(a)=s'(a)\bigl(D\eta(S(a))(S(a)-U_*)-\eta(S(a))+\eta(U_*)\bigr).
$$

O termo entre parênteses é não negativo pela convexidade aplicada em S(a). Se γ_i>0, temos s'(a)>0 em um intervalo pequeno. Como E(0)=0, integrar da origem até a<0 dá E(a)≤0. Assim, o ramo compressivo local satisfaz cada par convexo compatível nas condições declaradas. Essa é uma dedução direta, não a extrapolação de um teste numérico ou uma afirmação de existência de entropias convexas para todo fluxo.

Para um contato em campo linearmente degenerado, a integração ao longo da curva integral dá E=0, como demonstrado no texto-base. Para leques suaves, a compatibilidade dá a igualdade entrópica. A colagem desses segmentos preserva as desigualdades escolhidas.

## 4. Padrões permitidos no regime clássico local

| Tipos das famílias na vizinhança | Bloco da família 1 | Bloco da família 2 | Padrões locais selecionados |
|---|---|---|---|
| Ambas genuinamente não lineares | R₁ ou S₁ | R₂ ou S₂ | R–R, R–S, S–R, S–S |
| Família 1 genuinamente não linear; família 2 linearmente degenerada | R₁ ou S₁ | C₂ | R–C, S–C |
| Família 1 linearmente degenerada; família 2 genuinamente não linear | C₁ | R₂ ou S₂ | C–R, C–S |
| Ambas linearmente degeneradas | C₁ | C₂ | C–C |

Amplitudes nulas removem o bloco correspondente. Essa lista descreve o solver local nessas hipóteses; K não é necessário nesse regime. Compostas podem aparecer quando essas hipóteses deixam de valer, por exemplo em famílias com inflexões. A matriz formal de 16 pares não é uma lista de padrões necessariamente realizáveis nesse solver local.

## 5. Regimes fora do teorema local

| Regime | O que permanece disponível | O que exige análise adicional |
|---|---|---|
| Δ>0, γ_i com zeros | RH, curvas integrais nos trechos simples, testes de salto | Geometria das inflexões, compostas, seleção dos ramos e cobertura |
| Δ=0 | Equações de conservação e álgebra do jacobiano | Estrutura de Jordan, perda de famílias e teoria de continuação |
| Δ<0 | Formulação fraca e RH como relações algébricas | Problema de Cauchy de tipo misto; ausência do solver por duas famílias reais |
| Grandes amplitudes | Verificação de uma cadeia explicitamente construída | Existência de ramos globais, múltiplos intermediários, limites e singularidades |
| Difusão–dispersão | Equação de perfil após escolher coeficientes | Heteroclínicas, admissibilidade, relação cinética e solver correspondente |

Esses casos não são lacunas elimináveis por acrescentar uma combinação de símbolos à tabela. Eles precisam de hipóteses e resultados próprios. Uma cadeia demonstrada nesses regimes é um resultado de existência específico, sem implicar completude ou unicidade global.

## 6. Modelo de difusão–dispersão a parametrizar

Como ponto de partida de investigação, escrever

$$
U_t+F(U)_x=\varepsilon\partial_x(B(U)U_x)+\varepsilon^2\partial_x(C(U)U_{xx}).
$$

Nesta convenção, B e C são matrizes reais 2×2; fatores de intensidade podem ser absorvidos nelas. O termo dispersivo adotado é exatamente o exibido: outras posições de C ou derivadas de produtos definem outros modelos quando C depende do estado. Não presumir que toda escolha seja fisicamente admissível ou tenha energia dissipativa.

Com ζ=(x−st)/ε, limites e decaimento suficientes, a integração do perfil fornece

$$
C(V)V''+B(V)V'=F(V)-F(U_-)-s(V-U_-).
$$

Se C é inversível no domínio, pode-se escrever um sistema de primeira ordem para (V,W), com V'=W e W'=C(V)⁻¹(F(V)−F(U_-)−s(V−U_-)−B(V)W). Se C é singular, o problema é implícito. Os equilíbrios são estados que satisfazem RH com U_-; uma conexão exige uma órbita com os dois limites e condições de decaimento.

Antes de selecionar choques não clássicos, fixar B, C, domínio, par de entropia, condições de energia e orientação. Depois estudar as heteroclínicas e estabelecer quando a correspondência entre estados é unívoca, multivalorada ou vazia. Um cálculo de perfil isolado não prova a convergência de toda solução regularizada nem a existência de um solver global.

## 7. Exemplo não clássico exato: perfil difusivo–dispersivo

Este exemplo escalar cúbico é didático e não pertence ao fluxo quadrático 2×2 do aplicativo. Ele demonstra como coeficientes adicionais entram na seleção, por substituição direta, sem atribuir uma lei universal ao modelo do projeto.

Considere w_t+(w³)_x=ενw_xx+ε²δw_xxx, com ν>0 e δ>0. Ponha k=1/√(2δ), c=2ν/(3√(2δ)), escolha A>2c e defina B=c−A. A velocidade de RH é s=A²+AB+B². A equação integrada é

$$
\delta w''+\nu w'=(w-A)(w-B)(w+A+B).
$$

O perfil

$$
w(\zeta)=\frac{A+B}{2}-\frac{A-B}{2}\tanh\left(\frac{k(A-B)}2\zeta\right)
$$

vai de A a B. De fato, w'=k(w−A)(w−B) e w''=k²(2w−A−B)(w−A)(w−B). Como 2δk²=1 e νk=3(A+B)/2, a substituição dá exatamente a EDO integrada.

Ambas as velocidades características excedem s: 3A²−s>0 e 3B²−s=(2A−c)(A−2c)>0. Logo o choque é subcompressivo na contagem escalar. Para η=w²/2, q=3w⁴/4, a produção é (A+B)(B−A)³/4<0. Assim, existe um perfil e uma desigualdade entrópica compatível para essa conexão.

A família de perfis explícitos satisfaz B=c−A, que exibe a dependência em ν/√δ. Isso verifica um ramo candidato à relação cinética; não demonstra que todas as heteroclínicas sejam essas, nem existência e unicidade do solver não clássico inteiro. Os resultados gerais exigem sua própria referência e hipóteses. LeFloch, revisão de 2010, §§2.2 e 5, apresenta o enquadramento de seleção por relações cinéticas e perfis. [Fonte conceitual](https://arxiv.org/html/1002.2950v1).

## 8. Critério de fechamento e pendências concretas

A referência local clássica agora tem fonte identificada, construção local dos pequenos choques e dedução da desigualdade entrópica. A tabela de padrões passa a separar regime clássico local de combinações formais e exemplos especiais. Não se declara uma classificação global dos dez coeficientes.

Na frente não clássica, a classe difusão–dispersão está escolhida; B, C e as condições físicas permanecem por definir. O exemplo cúbico fecha um estudo explícito, mas não fornece a cinética do fluxo quadrático geral. A próxima decisão é selecionar um preset quadrático e coeficientes B,C para o estudo de perfis. Essa decisão depende do objetivo físico ou geométrico da investigação, não da necessidade de preencher uma seção.

Os cálculos elementares deste capítulo podem ser reproduzidos por `node scripts/verify-traditional-reference.mjs`. A verificação numérica das identidades complementa as demonstrações acima; não converte as pendências globais em resultados provados.
