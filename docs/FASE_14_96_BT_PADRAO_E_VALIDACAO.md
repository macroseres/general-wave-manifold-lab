# Fase 14.96 — BT implícita como padrão

- O modo inicial de **Construção de BT** passa a ser `continuation`, mantendo `original` para comparação diagnóstica.
- Somente BT⁻ é integrada. BT⁺ é a imagem pela involução †: `(τ,Y,ẑ) ↦ (τ,−Y,ẑ)`.
- Não foram alterados a malha sônica, Hopf, as equações implícitas nem os limites da continuação.
- A continuação permanece sujeita a interrupções em degenerações e a dependência das sementes extraídas da malha. Não se afirma completude global para todo fluxo quadrático.
- `auditBtPaths` calcula resíduos, ângulos e extensões dos ramos; não interpreta a quantidade de polilinhas como prova topológica.
- Para verificar: `npm run check` e comparação visual dos dois modos em diversos parâmetros.
