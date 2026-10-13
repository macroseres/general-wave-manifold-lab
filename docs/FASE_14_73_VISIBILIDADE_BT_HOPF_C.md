# Fase 14.73 — Controles de visibilidade BT, Hopf e característica

- Barra da cena 3D: botões `Ocultar BT / Mostrar BT` e `Ocultar Hopf / Mostrar Hopf` alternam, respectivamente, as duas curvas Bethe–Wendroff e as duas superfícies Hopf.
- Painel **Superfícies**: botão `Ocultar 𝒞 / Restaurar 𝒞` alterna conjuntamente 𝒞ₛ, ℰ e 𝒞𝒻. O estado individual anterior é salvo no primeiro clique e restaurado no segundo, inclusive estados mistos.
- Ao alterar uma das caixas individuais durante a ocultação conjunta, o modo de ocultação é encerrado e a seleção anterior é restaurada antes de aplicar a alteração individual.
- A ocultação BT não afeta o recorte espectral das superfícies sônicas; a ocultação Hopf não afeta a malha sônica nem a opção de isolar.
- Nenhuma geometria ou equação foi modificada.

Validação: `node --test tests/*.test.js` — 642 testes aprovados. Lint e build não executados neste ambiente.
