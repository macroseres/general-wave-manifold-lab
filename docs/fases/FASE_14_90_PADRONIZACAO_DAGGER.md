# Fase 14.90 — Padronização da involução dagger

A involução canônica é `(tau,Y,z)†=(tau,-Y,z)`; na carta recíproca `(tau,Y,Z)†=(tau,-Y,Z)`.

## Implementação

- Sônicas: a malha e a partição espectral são construídas somente para o lado negativo; o lado positivo usa a mesma `BufferGeometry` sob `<group scale={[1,-1,1]}>`.
- Bethe–Wendroff: a união de segmentos é executada uma única vez; a visualização positiva reutiliza as mesmas polilinhas sob o grupo refletido.
- Hopf: preservada a estratégia da fase 14.89: cálculo somente com `side=minus`; janelas simétricas compartilham um resultado, janelas assimétricas solicitam a janela negativa refletida. A malha positiva é renderizada com a transformação dagger.
- A inspeção por clique em uma sônica positiva converte a coordenada local da malha negativa de volta ao Y matemático positivo.
- Controles de visibilidade e cores permanecem independentes.

## Cuidados

- A reflexão tem determinante -1 e inverte a orientação espacial. A renderização conserva a configuração de face/culling existente, sem alterar a orientação dos triângulos no gerador científico.
- Janelas assimétricas de Hopf são tratadas pela reflexão do domínio; a sônica mantém a janela canônica de construção já adotada anteriormente. Não houve alteração no algoritmo científico de malhamento.

## Validação

`node --test tests/*.test.js`: 648 aprovados, 0 falhas. Lint e build não executados neste ambiente por falta de `node_modules`.
