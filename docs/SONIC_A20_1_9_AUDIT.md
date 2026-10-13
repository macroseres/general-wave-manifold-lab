# Auditoria geométrica dirigida: a20 = 1.9

Coeficientes: a20=1.9, a11=0, a02=0.5, a10=0, a01=0, b20=0, b11=1, b02=-0.1, b10=1, b01=0.
Domínio: tau [-5,5], Y [-6,6], zc [-0.999,0.999].

Script: `npm run audit:sonics:a20-case`.

Qualidade triangular q = 2 sqrt(3) |(B-A)x(C-A)| / (|B-A|^2 + |C-B|^2 + |A-C|^2). q=1 equilátero, q→0 degenerado.

Malha 34x28x50: minus 323/19739, plus 326/19553 triângulos com q<0.01.
Malha 48x40x72: minus 588/39941, plus 592/39603 triângulos com q<0.01.
Sem arestas com incidência >2; esse fato não prova conformidade geométrica.

Há triângulos de qualidade muito baixa perto de zc=0.999 e também no interior.
Valores de Phi nos centróides podem ser grandes perto da compactificação, mas não equivalem diretamente a distância geométrica: são necessários gradientes e refinamento adaptativo.

Este pacote apenas adiciona diagnóstico; nenhuma mudança na geometria de produção.
