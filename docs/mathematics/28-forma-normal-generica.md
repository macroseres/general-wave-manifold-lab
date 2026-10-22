# Forma normal residual no setor quadrático genérico

Resultado próprio deduzido em 20/10/2026. Parte do fluxo geral de dez parâmetros do capítulo 27. A classificação deste capítulo é de órbitas de fluxos sob o grupo declarado, em um setor aberto explícito; não é classificação das folheações nem conclusão sobre os setores excepcionais. A prova abaixo é algébrica; a implementação usa ponto flutuante e retorna diagnósticos de condicionamento.

## 1. Grupo e objetivo

Escreva F(U)=LU+H(U,U)/2, com H bilinear simétrico. Admitimos U=AV+U0, A real invertível, escala de velocidade k>0 e referencial d real:

$$
\widetilde F(V)=k A^{-1}[F(AV+U_0)-F(U_0)]-dV.
$$

O objetivo é construir uma base e um centro intrínsecos, eliminando as escolhas de coordenadas. Não pressupomos que os quatro termos lineares possam desaparecer.

## 2. Base intrínseca da parte quadrática

Para x em R², defina H_x=H(x,·), a covariável t(x)=tr(H_x) e a forma bilinear simétrica B(x,y)=tr(H_x H_y). Sob uma transformação linear e escala,

$$
\widetilde t(x)=k\,t(Ax),\qquad
\widetilde B(x,y)=k^2B(Ax,Ay).
$$

Suponha B invertível e t(B^{-1}t) diferente de zero. Na expressão B^{-1}t usamos o vetor dual de t por B, sem identificar formas e vetores por uma métrica adicional. Defina

$$
v=B^{-1}t,\qquad e_1=\frac{v}{t(v)},\qquad
a=t(H(e_1,e_1)),\qquad e_2=H(e_1,e_1)-ae_1.
$$

Exija ainda que e1 e e2 sejam independentes. A matriz C=[e1,e2] satisfaz, sob o grupo,

$$
\widetilde C=k^{-1}A^{-1}C.
$$

Demonstração: v_tilde=k^{-1}A^{-1}v, t_tilde(v_tilde)=t(v), e a é preservado. A expressão de e2 então tem a mesma covariância de e1. As condições são intrínsecas e preservadas por todas as transformações admitidas. A translação não altera H.

Na base C, t=(1,0) e H(e1,e1)=ae1+e2. Escreva H(e1,e2)=be1+(1-a)e2, usando tr(H_e1)=1; e H(e2,e2)=ce1-be2, usando tr(H_e2)=0. Como B(e1,e2)=0 pela definição de e1, e esse produto de traços é ab+c, temos c=-ab. Assim a parte quadrática canônica é

$$
Q_{a,b}(x,y)=\frac12\begin{pmatrix}
ax^2+2bxy-ab y^2\\
x^2+2(1-a)xy-by^2
\end{pmatrix}.
$$

São dois parâmetros contínuos, obtidos da parte quadrática geral, sem impor um preset ou simetria de jacobiano. Eles não são automaticamente os parâmetros a,b da forma clássica de Schaeffer–Shearer.

## 3. Centro intrínseco para a parte linear

Defina S_x=H_x-t(x)I/2, L0=L-tr(L)I/2 e G(x,y)=tr(S_x S_y)=B(x,y)-t(x)t(y)/2. Suponha G invertível. Existe um único U0 tal que

$$
G(U_0,x)=-\operatorname{tr}(L_0S_x)\quad\text{para todo }x.
$$

Escolhendo esse centro e retirando lambda=tr(L+H_U0)/2, a matriz linear restante, na base C, é

$$
N=C^{-1}\bigl(L+H_{U_0}-\lambda I\bigr)C.
$$

Ela é sem traço e ortogonal a todos os S_x pela forma tr(XY). Sob transformações completas, o centro corresponde por U0_tilde=A^{-1}(U0_original-U_translação), e N_tilde=kN. Isso segue substituindo S_tilde_x=k A^{-1}S_Ax A nas equações do centro e usando a invariância do traço por conjugação. Portanto a escala positiva de N é a única liberdade que sobra nessa carta.

## 4. Parte linear residual e representante final

Na base canônica,

$$
H_1=\begin{pmatrix}a&b\\1&1-a\end{pmatrix},\qquad
H_2=\begin{pmatrix}b&-ab\\1-a&-b\end{pmatrix}.
$$

Escreva N=[[x,y],[z,-x]]. As duas condições de ortogonalidade são

$$
(2a-1)x+y+bz=0,\qquad 2bx+(1-a)y-abz=0.
$$

Seu núcleo é unidimensional, porque G é invertível. Um vetor gerador nas coordenadas (x,y,z) é

$$
n=\bigl(b,\ -b(2b+2a^2-a),\ 2b+2a^2-3a+1\bigr).
$$

Escolha j como a primeira componente de n de módulo máximo, na ordem x,y,z. Defina N_star como a matriz sem traço associada ao vetor n/n_j. Essa escolha fixa sua componente j em +1. Todo N é um múltiplo real de N_star. Uma escala positiva reduz o múltiplo a sigma em {-1,0,+1}.

O representante final é

$$
F_{a,b,\sigma}(V)=Q_{a,b}(V)+\sigma N_\star(a,b)V.
$$

Sigma=0 corresponde à homogeneização. Para sigma diferente de zero, normalizar k=1/m e A=mC, com m o módulo da componente j de N; retirar o referencial d=k lambda. Para sigma=0, usar k=1 e A=C. As constantes de fluxo são subtraídas como na seção 1.

As fronteiras de troca do pivô máximo são costuras desta normalização, não bifurcações físicas. A normalização tem cartas com j fixo e mudanças de representante positivas entre elas.

## 5. Domínio explícito e unicidade

Na forma canônica, B e G são diagonais:

$$
B=\operatorname{diag}(T,R),\quad
G=\operatorname{diag}(T-1/2,R),\quad
T=2a^2-2a+1+2b,\quad R=2b(b+a^2-a).
$$

O domínio canônico é T*R*(T-1/2) diferente de zero. Nesse domínio, a construção da base aplicada a Q devolve C=I. Para um fluxo original entrar nessa carta, deve satisfazer todas as hipóteses das seções 2–3; não basta tentar calcular parâmetros a,b fora delas. As exclusões são algébricas após eliminar os denominadores, e o domínio é aberto. Não é vazio: a=4/5 e b=1/5 dão T=27/25, R=2/125 e T-1/2=29/50. Portanto as condições definem um setor genérico aberto denso no espaço das partes quadráticas: o produto das condições polinomiais não é identicamente zero, como verifica esse exemplo.

Teorema restrito: nesse setor, dois fluxos são equivalentes pelo grupo da seção 1 se, e somente se, têm o mesmo a,b,sigma, com a mesma regra de pivô.

Demonstração: a,b são invariantes pela covariância da base. Para representantes com C=I, essa covariância força A=k^{-1}I. A unicidade do centro força a translação residual a zero, e a retirada do traço fixa o referencial residual. Assim resta N→kN, com k positivo. As duas equações independentes deixam uma única direção possível para N; seu múltiplo só tem três classes por escala positiva, identificadas por sigma. A recíproca segue porque parâmetros iguais produzem o mesmo representante. Isso prova classificação de órbitas nesse setor, não equivalência ou distinção das folheações de modelos em órbitas diferentes.

Neste setor, G invertível implica rank(M)=2 no capítulo 27: S_x não pode ter núcleo não nulo. Portanto são tratados os estratos rank-2-2 e rank-2-3 dentro do domínio genérico, incluindo a obstrução linear que não pode ser eliminada por mudança de referencial.

## 6. Árvore de setores excepcionais ainda por normalizar

As seguintes falhas devem ser tratadas em cartas próprias, na ordem indicada para evitar sobreposição:

| Primeira condição que falha | Questão residual |
|---|---|
| t=0 | normalizar H sem a covariável de traço |
| B singular | construir outra base ou classificar a degeneração de B |
| t(B^-1 t)=0 | setor isotrópico da covariável |
| e1,e2 dependentes | base alternativa para H(e1,e1) radial |
| G singular | centro não único ou obstrução à centralização ortogonal |

Essa árvore cobre o complemento do domínio acima por testes exatos, mas não constitui formas normais desses setores. Alguns deles contêm fluxos de interesse particular; densidade do setor tratado não permite descartá-los. O setor linear e a estratificação escalar já têm seus próprios classificadores.

Atualização: o [atlas global do capítulo 29](29-atlas-global-fluxos.md) fornece uma construção alternativa que cobre todos esses setores pelo par (t,P), explicita os estabilizadores e resolve a parte linear residual. A árvore acima permanece como descrição dos limites desta carta genérica, não como lacuna da cobertura algébrica atual. As parametrizações do capítulo 29 e desta carta são diferentes e devem ser relacionadas pela transformação do fluxo, não pela igualdade dos nomes a,b.

## 7. Implementação e evidências

`src/math/flux/genericNormalForm.js` implementa a construção e retorna coeficientes, transformação, transformação inversa dos estados, a,b, sinal/pivô linear e resíduos. Só aceita dez números finitos. Portas de condicionamento distinguem resultado normalizado de `outside-chart-or-ill-conditioned`; este último não certifica que o ponto pertence exatamente a um setor excepcional. Próximo de uma exclusão, usar aritmética exata ou precisão maior antes de decidir o estrato.

A decisão de homogeneização usa o classificador racional do capítulo 27 sobre os decimais fornecidos. Uma transformação prévia calculada com arredondamentos pode produzir uma obstrução pequena artificial; nesse caso o procedimento deve reportar resolução insuficiente, e não normalizar silenciosamente esse ruído.

`tests/genericNormalForm.test.js` verifica as relações canônicas, invariância sob mudanças de base não ortogonais, translação, escala positiva e referencial; reconstrói o fluxo e o discriminante pela transformação retornada; testa o setor homogêneo, idempotência e rejeição explícita de entradas fora da carta. Testes numéricos auditam o código; a demonstração das seções anteriores é a justificativa do resultado contínuo.

`node scripts/verify-generic-normal-form.mjs` verifica por igualdade exata de coeficientes em Z[a,b] as entradas da forma B e as duas equações do vetor gerador n. Não usa ponto flutuante nem depende de um sistema de álgebra externo. As identidades passaram em 20/10/2026.
