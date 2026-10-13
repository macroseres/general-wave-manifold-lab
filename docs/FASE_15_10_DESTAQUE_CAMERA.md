# Fase 15.10 — ponto levantado e enquadramento da câmera

## Mudanças
- A amostra certificada selecionada em Espaço de estados é enviada para a cena como `liftedInspection`.
- Glifo com núcleo claro e aro ciano na posição `(tau,Y,zc)`; escala inversa dos eixos para tamanho de tela mais estável.
- Glifo não participa do picking (`raycast` desativado), evitando interferir na seleção geométrica.
- Ao navegar para 3D, `OrbitControls.target` é reposicionado na posição **visualmente escalada** da amostra; a câmera mantém seu deslocamento relativo ao alvo anterior.
- Comando **Centralizar amostra** disponível sobre a cena para refazer o enquadramento.
- O ponto matemático e as geometrias não são modificados pelo enquadramento.
- A indicação persiste até outra amostra ser inspecionada; a seleção manual de outro ponto continua possível.

## Testes de interface pendentes
1. Selecionar amostra de Hugoniot certificada, abrir Variedade 3D e verificar halo.
2. Mudar a escala visual e centralizar novamente.
3. Girar e dar zoom; confirmar que câmera e coordenadas matemáticas são independentes.
4. Conferir layout mobile e contraste no modo claro.
5. Executar `npm run check` com dependências instaladas.
