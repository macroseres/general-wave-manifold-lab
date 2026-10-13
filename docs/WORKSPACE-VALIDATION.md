# Validação do layout compartilhado

## Verificação automatizada

- `node --test tests/*.test.js`: 671 testes aprovados neste pacote.
- `npm run check`: não executado. `npm ci --offline` não pôde instalar `katex` porque a dependência não estava no cache.
- Inspeção visual em navegador: pendente; não afirmar homologação visual sem testar.

## Roteiro de aceitação

Em resolução desktop e mobile, abrir Estados, Variedade e Físico. Verificar:

1. Navegação à esquerda com largura, ícones, rótulos e posição idênticos.
2. Painel de ferramentas alinhado e com mesma largura nos três espaços.
3. Área de visualização inicia após o mesmo espaçamento e preenche o restante.
4. Recolher e expandir controles não sobrepõe o gráfico.
5. Navegação por categorias e inspeção científica permanecem funcionais.
6. Sem faixas vazias ou cabeçalhos duplicados.

Se algum item falhar, a versão **não** está homologada.
