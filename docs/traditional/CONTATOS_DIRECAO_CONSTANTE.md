# Contatos de direção constante: escopo do primeiro construtor

Este é um caso particular de contato tradicional, não uma redefinição de toda família linearmente degenerada. A implementação não cobre ainda curvas de contato de direção variável.

## Critério nos coeficientes

Para o fluxo quadrático, escreva DF(U)=A₀+uA_u+vA_v. Procuramos um vetor unitário r e uma constante c tais que

$$
A_u r=A_v r=0,\qquad A_0r=cr.
$$

As matrizes A_u e A_v são calculadas diretamente dos coeficientes de grau dois. O código procura uma direção no núcleo comum de suas linhas e verifica a condição própria de A₀. Se o fluxo é linear, usa as duas direções próprias reais simples de A₀. Os resíduos são comparados com uma tolerância declarada; o relatório numérico não é um certificado simbólico de igualdade.

**Proposição.** Nas igualdades exatas acima, DF(U)r=cr em todos os estados. Ao longo de U(t)=U_a+tr, vale F(U(t))−F(U_a)=ct r. Portanto dois estados distintos nessa reta satisfazem RH com velocidade c. Onde c é um autovalor simples, a família correspondente é linearmente degenerada, pois esse autovalor é constante.

**Demonstração.** Substitua as três igualdades na expressão afim de DF. Integre a identidade dF(U(t))/dt=cr. A derivada da velocidade característica constante é zero.

O construtor exige a mesma família simples nos dois extremos e rejeita coincidência. O outro autovalor é tr DF−c, afim ao longo da reta. Se sua diferença para c tem o mesmo sinal estrito nos extremos, não há coincidência no segmento entre eles. Essa justificativa é específica da identidade exata e do grau dois; os testes com tolerância mantêm a conclusão numérica qualificada.

## Construção dos cinco padrões

**CC:** intersectar as retas de contato lenta de U_L e rápida de U_R, verificar o estado intermediário, RH em ambos os saltos e c₁<c₂. Retas paralelas não fornecem um intermediário isolado por esse método. Blocos de amplitude zero ainda não são retornados por este construtor de duas ondas.

**RC e CR:** intersectar uma reta de contato com os trechos amostrados da curva integral da outra família. Verificar ancoragem, tangência, crescimento da velocidade no sentido físico e ordenação entre o contato e o leque. A busca não demonstra completude nem resolve ainda o erro de interseção das poligonais por um corretor conjunto.

**SC e CS:** a incidência de RH sobre a reta de contato pode ser resolvida diretamente nos estados. Fixe o outro extremo U_*, ponha M(t)=A+tr, d=A−U_* e b=F(A)−F(U_*). Então

$$
\det(M(t)-U_*,F(M(t))-F(U_*))=\det(d,b)+t\bigl(c\det(d,r)+\det(r,b)\bigr).
$$

**Demonstração.** Pela proposição anterior, F(A+tr)=F(A)+ct r. Expandir o determinante dá a expressão, pois o termo quadrático contém det(r,r)=0.

Quando o coeficiente de t não é nulo, há uma única raiz nessa reta; o código recupera M, verifica o contato e aplica RH e Lax estrito ao choque da outra família. Essa construção não depende de uma carta da variedade. Se o coeficiente se anula, a equação pode ser incompatível ou ter uma família inteira de soluções; não se afirma existência ou unicidade a partir de uma saída vazia. Curvas de Hugoniot já disponíveis também podem fornecer candidatos adicionais, sempre submetidos aos mesmos testes.

## Perfil e apresentação

Cada contato permanece uma interface de velocidade pontual, com seu próprio par de traços. O perfil autossimilar usa o traço direito exatamente na velocidade da interface. Os gráficos u(x,t),v(x,t) são interrompidos nos contatos e nos choques; não se interpola através das descontinuidades. No desenho físico, contatos são roxos e choques laranja.

No plano de estados, a reta de contato é uma curva integral do modelo. Se não houver arco de Hugoniot reconstruído para um choque, não inventar uma curva entre seus extremos. A vista pode exibir os estados e a ligação de contato enquanto o arco de choque permanece indisponível.

O plano de estados já pode ser aberto a partir dos dados de Riemann, mesmo sem ponto regular da variedade. A janela usa os dados como âncoras e não apresenta uma projeção fictícia da variedade.

## Exemplos e evidência

F=(u²/2,3v) fornece RC e SC com contato rápido; F=(u,v²/2+3v) fornece CR e CS com contato lento; F=(u,2v) fornece CC. Os testes incluem uma mudança de direção própria não alinhada aos eixos, falhas de conservação/família, coincidência, leques invertidos e rejeição de um choque duplamente sônico do fluxo triangular como contato.

Implementação: `src/math/solution/contactChainCandidates.js`. Verificação: `tests/contactChainCandidates.test.js` e `tests/stateSpaceChainsRendering.test.js`. Nenhuma dessas construções declara seleção cinética geral ou certificação entrópica pelo aplicativo.
