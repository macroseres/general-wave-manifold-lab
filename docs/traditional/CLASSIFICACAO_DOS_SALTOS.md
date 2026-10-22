# Classificação característica dos nove tipos de salto

Esta classificação precede a montagem das cadeias. Um tipo de salto descreve uma única interface; um padrão de cadeia descreve uma sequência de ondas ou blocos. Em particular, o nome inglês *two-shock* nesta tabela não significa dois choques consecutivos.

## 1. Hipóteses e orientação

Considere um salto não nulo U_L→U_R de velocidade s que satisfaça Rankine–Hugoniot. Nesta seção, L e R são os extremos locais desse salto. Exigir autovalores reais distintos λ₁(U)<λ₂(U) nos dois extremos e excluir s=λ_i(U_L) ou s=λ_i(U_R). A classificação é de extremos; não pressupõe hiperbolicidade em todo o segmento reto entre eles.

No referencial da interface x=st, a velocidade relativa de uma característica é λ_i−s. Do lado esquerdo, λ_i>s significa entrada na interface; do lado direito, λ_i<s significa entrada. Defina

$$
n_L=\#\{i:\lambda_i(U_L)<s\},\qquad n_R=\#\{i:\lambda_i(U_R)<s\}.
$$

Cada extremo admite três posições abertas para s: abaixo das duas velocidades (n=0), entre elas (n=1) ou acima de ambas (n=2). Há, portanto, nove pares, mutuamente exclusivos e exaustivos sob essas hipóteses.

## 2. Tabela correspondente à imagem fornecida

Mantêm-se os nomes em inglês da imagem para permitir comparação direta. A derivação das assinaturas usa as desigualdades exibidas, sem atribuir à imagem um teorema de admissibilidade.

| Nome da imagem | Desigualdades no estado esquerdo | Desigualdades no estado direito | (n_L,n_R) | Características incidentes |
|---|---|---|---|---|
| One-shock | s<λ₁(U_L) | λ₁(U_R)<s<λ₂(U_R) | (0,1) | 3 |
| One-expansive | λ₁(U_L)<s<λ₂(U_L) | s<λ₁(U_R) | (1,0) | 1 |
| Two-shock | λ₁(U_L)<s<λ₂(U_L) | λ₂(U_R)<s | (1,2) | 3 |
| Two-expansive | λ₂(U_L)<s | λ₁(U_R)<s<λ₂(U_R) | (2,1) | 1 |
| Compressive | s<λ₁(U_L) | λ₂(U_R)<s | (0,2) | 4 |
| Expansive | λ₂(U_L)<s | s<λ₁(U_R) | (2,0) | 0 |
| Crossing | λ₁(U_L)<s<λ₂(U_L) | λ₁(U_R)<s<λ₂(U_R) | (1,1) | 2 |
| Right transport | s<λ₁(U_L) | s<λ₁(U_R) | (0,0) | 2 |
| Left transport | λ₂(U_L)<s | λ₂(U_R)<s | (2,2) | 2 |

**Proposição.** O número de características incidentes é N_in=2−n_L+n_R. Os casos one-shock e two-shock equivalem, respectivamente, às desigualdades estritas de Lax das famílias 1 e 2.

**Demonstração.** Há 2−n_L características com λ_i>s no lado esquerdo e n_R com λ_i<s no direito. Somá-las fornece a fórmula. Substituir (0,1) e (1,2) reproduz as desigualdades de Lax, usando a ordenação estrita em cada extremo.

Na convenção de contagem do texto-base, N_in=4 é sobrecompressivo, N_in=3 corresponde a Lax e N_in<3 tem déficit de características incidentes. Esses rótulos de contagem não identificam automaticamente a família nem selecionam choques não clássicos admissíveis. Right/left transport refere-se à direção relativa à interface, não ao sinal absoluto de s.

## 3. Fronteiras e estados excluídos

| Evento | Registro obrigatório | Consequência |
|---|---|---|
| Salto nulo | Estado constante e amplitude zero | Não classificar como choque |
| Δ<0 em um extremo | Espectro não real | Fora dos nove tipos hiperbólicos |
| Δ=0 em um extremo | Coincidência; verificar estrutura própria | Fora da classificação estrita |
| s=λ_i no lado L ou R | Lado e família da igualdade | Fronteira sônica; não arredondar para um dos nove interiores |
| Igualdade nos dois lados | Todas as famílias incidentes na igualdade | Dupla sonicidade não determina contato ou admissibilidade |
| Valor próximo de zero por tolerância | Escala, tolerância e estado inconclusivo | Não tratar aproximação como igualdade exata ou desigualdade provada |

Um contato linearmente degenerado é característico nos dois extremos e pertence às fronteiras, não aos nove interiores. Expansive não é sinônimo de leque de rarefação. Uma composta deve ser desdobrada para classificar cada salto e registrar suas junções sônicas.

## 4. Relação com admissibilidade

A classificação é um diagnóstico geométrico. RH estabelece conservação; os nove tipos descrevem a posição de s; Lax seleciona dois interiores sob suas hipóteses; Liu usa um arco de Hugoniot; entropia usa pares compatíveis; uma relação cinética pertence ao modelo adicional escolhido. Nenhuma dessas etapas deve ser inferida apenas do nome da região espectral.

Pode-se mostrar uma conexão que não satisfaz a seleção escolhida para fins de exploração, mas o resultado deve ser identificado como conexão conservativa ou candidato e acompanhado da violação ou da pendência. “Não-Lax” não é um selo de admissibilidade não clássica.

## 5. Os nove casos são realizáveis como RH no modelo quadrático

Uma construção algébrica fornece exemplos de todos os nove interiores, sem afirmar admissibilidade. Fixe U_L=(0,0), U_R=(1,0), s=0. Escolha os espectros de cada extremo entre (1,2), (−1,1) e (−2,−1), correspondentes a n=0,1,2. Denote seus traços por T_L,T_R e produtos por D_L,D_R. No fluxo de dez coeficientes, ponha

$$
\begin{aligned}
a_{20}&=b_{20}=1, &a_{10}&=b_{10}=-1,\\
a_{01}&=D_L+T_L+1, &a_{11}&=T_R-1-D_R-a_{01},\\
b_{01}&=T_L+1, &b_{11}&=T_R-T_L-2,\\
a_{02}&=b_{02}=0.
\end{aligned}
$$

**Verificação.** F(U_L)=F(U_R)=0, logo RH vale com s=0. Os jacobianos são

$$
DF(U_L)=\begin{pmatrix}-1&D_L+T_L+1\\-1&T_L+1\end{pmatrix},\qquad
DF(U_R)=\begin{pmatrix}1&T_R-1-D_R\\1&T_R-1\end{pmatrix}.
$$

Seus traços e determinantes são os prescritos; portanto os espectros são os escolhidos. Os nove pares geram os nove tipos. A construção não garante entropia, perfil regularizado nem hiperbolicidade nos estados intermediários. Cada par pode usar um fluxo diferente: não se afirma a existência dos nove casos no mesmo preset.

Os coeficientes e verificações estão em `scripts/traditional-shock-signatures.mjs` e `tests/traditionalShockSignatures.test.js`.

## 6. Procedência e compatibilidade com o código

A tabela foi transcrita das desigualdades da imagem fornecida pelo usuário nesta conversa e derivada pela contagem acima. A obra, edição e página de origem da imagem não foram identificadas; não atribuir a tabela a LeFloch sem essa identificação. As equações e a prova algébrica podem ser verificadas independentemente dessa procedência.

`src/math/state/hugoniotSpectrum.js` calcula as posições espectrais. `shockConfiguration.js` implementa os nove interiores separados da seleção e dos eventos de fronteira. `laxClass2x2`, em `hugoniotSpectralRegions.js`, agora exige espectros completos e rejeita coincidências e igualdades numéricas antes de emitir Lax. A correção está registrada na rastreabilidade e tem testes de regressão. A classificação não verifica RH; o diagnóstico direto registra separadamente a conservação.
