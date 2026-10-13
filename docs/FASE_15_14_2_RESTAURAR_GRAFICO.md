# Correção 15.14.2

O CSS anterior fazia o painel lateral ocupar a primeira linha inteira, deslocando o SVG para baixo. Esta revisão mantém o gráfico explicitamente na primeira linha e na coluna principal, com o menu em coluna independente. O inspetor fica abaixo do gráfico, sem sobrepor a cena. O layout mobile prioriza gráfico, inspetor e controles nessa ordem.

Nenhuma matemática alterada. Verificar no navegador e executar npm run check.
