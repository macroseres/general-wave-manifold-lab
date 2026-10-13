# Fase 14.35 — Inspeção direta da característica

- Um clique nas malhas C_s ou C_f abre um diagnóstico compacto no canto inferior esquerdo do gráfico.
- O diagnóstico mostra tau, Y, z-hat, a classificação lenta/rápida/coincidência e os autovalores quando a fibra é regular.
- O cálculo reutiliza `characteristicSpectrum` e só é realizado enquanto existe um ponto selecionado.
- O botão `Inspecionar fibra projetiva` abre o painel existente, sem replicar as equações.
- Fechar o cartão de inspeção não altera o ponto selecionado.
- Cores, opacidade e escalas visuais permanecem inalteradas.

Validação local: testes Node selecionados; execute `npm run check` com as dependências instaladas.
