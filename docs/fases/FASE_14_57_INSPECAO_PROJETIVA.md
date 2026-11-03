# Fase 14.57 — inspeção projetiva do ponto selecionado

## Problema observado
Na imagem de 10/10/2026, ẑ≈−0.999, com valores muito grandes de s e estados físicos. Isso não implica, por si só, erro matemático: a parametrização da fibra finita pode produzir coordenadas grandes quando |z| cresce. Resíduo RH nulo também não certifica condicionamento.

## Alterações
- `selectedPointDiagnostic` fornece z, Z=1/z e X=zY, seleciona a carta preferencial por |ẑ|≥0.9, e usa a transição recíproca já existente no domínio de sobreposição.
- Novo painel `Carta do ponto selecionado` na inspeção 3D, com aviso sobre grandes magnitudes físicas e distinção entre divergência e instabilidade.
- Botão `Escala padrão` restaura τ=1.75, Y=0.25 e ẑ=2.55; `Escala 1:1` permanece disponível.
- Três testes de regressão adicionados.

## Limitações
- O cálculo do estado finito ainda é realizado para inspecionar o ponto; a avaliação não foi substituída por um atlas global no gráfico.
- A seleção |ẑ|≥0.9 é um limiar de interface, não um teorema de condicionamento.
- Z=0 não é representado como um ponto z finito.
- Nenhuma nova malha é desenhada, e a continuidade das superfícies de Hopf no infinito permanece aberta.
- Escalas personalizadas ou importadas podem diferir dos valores padrão; o novo botão restaura explicitamente os valores solicitados.
