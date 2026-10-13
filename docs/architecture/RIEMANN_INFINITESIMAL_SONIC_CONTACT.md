# Diagnóstico infinitesimal de contato choque–rarefação

Para o fluxo quadrático geral, em um estado estritamente hiperbólico e para uma família simples i, sejam `r_i` um autovetor direito unitário e `l_i` um autovetor esquerdo. A Hessiana do fluxo é constante, e

\[
\nabla\lambda_i(U)\cdot r_i(U)
=\frac{l_i(U)\cdot D^2F(U)[r_i(U),r_i(U)]}{l_i(U)\cdot r_i(U)}.
\]

Ao longo de um ramo local de Hugoniot parametrizado por `U(h)=U+h r_i+O(h²)`, a derivada da velocidade de choque na coincidência satisfaz

\[
 s'(0)=\tfrac12\nabla\lambda_i(U)\cdot r_i(U).
\]

O módulo `src/math/rarefaction/sonicContactDiagnostic.js` calcula as duas grandezas, confere consistência com o estimador por diferenças finitas e sinaliza apenas **candidatos infinitesimais** quando a derivada se aproxima de zero. É um cálculo na coincidência (amplitude nula). **Não** calcula a interseção de um ramo de Hugoniot com as superfícies sônicas `S⁺`/`S⁻` para saltos finitos, não identifica a orientação do choque composto e não testa admissibilidade entrópica.

Os diagnósticos aparecem nos títulos dos marcadores amarelos no Espaço de estados. A implementação preserva a notação canônica `𝓕=X𝓖` e `𝓖=(DF(Ū)-sI)r` das etapas anteriores.

Testes: `tests/sonicContactDiagnostic.test.js`.
