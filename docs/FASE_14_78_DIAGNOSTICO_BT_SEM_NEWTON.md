# Fase 14.78 — Isolamento do custo de suavização BT

O caminho de renderização das curvas BT deixa de executar projeções por Newton na thread principal.

- Mantém a concatenação dos segmentos em polilinhas, sem conectar componentes distintos.
- Mantém os controles BT, Hopf e C no painel esquerdo.
- A curva BT passa a seguir a discretização original da partição espectral, sem refinamento implícito.
- A função `smoothBtSegments` continua disponível para testes e trabalho futuro, mas não é chamada durante a renderização.

**Teste comparativo:** medir o tempo até o primeiro gráfico nas fases 14.77 e 14.78 com os mesmos parâmetros. Se não melhorar, a lentidão não é causada principalmente pelas correções Newton; investigar a partição espectral e a geração das superfícies.
