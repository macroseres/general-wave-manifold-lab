# Auditoria de estabilidade do filtro de área — dev.24.47.47

Execute `npm run audit:sonics:area-stability` para comparar `minCrossNorm` em `1e-10`, `1e-14` e `0`, exclusivamente em auditoria offline.

## Amostragem

- Domínio: τ ∈ [-5,5], Y ∈ [-6,6], zc ∈ [-0.999,0.999].
- Grades: (24,20,36), (34,28,50), (48,40,72).
- Fluxos: padrão B1=8, B2=0.2, a=0, c=1; alternativo B1=0, B2=0.2, a=0, c=1.
- Ambas as sônicas, três tolerâncias: 36 extrações.

## Resultado local

Para o fluxo padrão, na grade (34,28,50), as arestas mistas passam de 2 (filtro atual) para 0 (ambos os filtros alternativos). Na grade (48,40,72), ocorre o mesmo. Na grade (24,20,36), já não existem arestas mistas com o filtro atual. Para o fluxo alternativo, não foram encontradas diferenças de contagem de triângulos entre as três tolerâncias.

Em todas as 36 extrações, o relatório não registrou arestas não-manifold, ramificações da fronteira, caminhos abertos de fronteira ou triângulos com área exatamente nula.

## Limites

A análise não prova a inexistência de autointerseções, de omissões em tetraedros sem mudança de sinal, nem a fidelidade geométrica da aproximação implícita. As medições de tempo são exploratórias. Nenhum limiar de produção foi alterado.
