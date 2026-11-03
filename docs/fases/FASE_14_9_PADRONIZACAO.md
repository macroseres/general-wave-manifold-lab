# Fase 14.9 — Consistência de exploração gráfica

- Variedade 3D: mantém painéis de controles e inspeção independentes.
- Espaço de estados: mantém controles recolhíveis e gráfico (u,v) prioritário.
- Espaço físico: mantém controles laterais recolhíveis e os três diagramas prioritários.
- Adicionados indicadores de foco por teclado, alvos apropriados para toque e transições discretas de largura, desativadas quando o sistema solicita movimento reduzido.
- Nenhum módulo matemático ou de geometria foi modificado.

## Validação local

Executar `npm run check` e `npm run dev`. Testar os painéis abertos/fechados, a navegação por teclado e o redimensionamento dos gráficos.
