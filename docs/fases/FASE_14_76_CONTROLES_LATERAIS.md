# Fase 14.76 — controles de visibilidade no painel esquerdo

- Transferidos os controles de BT⁻/BT⁺ e Hopf⁻/Hopf⁺ da barra superior da cena para a seção **Superfícies** do painel esquerdo.
- Os controles são caixas de seleção coerentes com os demais objetos geométricos.
- Os estados `showBT` e `showHopf` agora pertencem ao `App` e são transmitidos à cena por propriedades.
- Preservada a lógica de ocultação/restauração conjunta de C_s, E e C_f.
- Nenhuma alteração nos algoritmos de construção das malhas ou no desempenho de carregamento.
