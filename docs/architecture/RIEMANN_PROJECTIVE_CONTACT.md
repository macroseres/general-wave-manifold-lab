# Contato projetivo das direções características

Para um estado fixo U e J=DF(U)=[[a,b],[c,d]], a equação homogênea de direções características r=(x,y) é

q(x,y)=det(r,Jr)=c x²+(d-a)xy-b y²=0.

No círculo de direções, a derivada angular de q ao longo de (-y,x) distingue raízes simples de múltiplas, sem depender da carta z=x/y. Assim, a direção projetiva y=0 (Z=0) também é testada.

**Escopo:** este teste é algébrico e local no estado U. Ele não certifica a regularidade da fibra de Hugoniot na variedade de ondas, não resolve singularidades da carta e não verifica admissibilidade de ondas. Para isso, será necessário analisar a diferencial da restrição da projeção à fibra e seus limites nas cartas.

A implementação está em `src/math/characteristic/projectiveContact.js`; o diagnóstico integra `riemannLifts.js` e o painel Espaço de estados. Testes: `tests/projectiveCharacteristicContact.test.js`.
