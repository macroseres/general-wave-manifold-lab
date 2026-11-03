# Fase 14.85 — cache de Hopf por lado

- Chave geométrica exclui câmera, opacidade e visibilidade.
- Promessas de cálculo compartilhadas entre montagens React; evita workers duplicados para a mesma chave.
- Cache limitado a oito entradas, separando Hopf− e Hopf+.
- Worker finaliza após resultado e os dados permanecem no cache.
- Troca de parâmetros invalida a chave; resultados obsoletos são ignorados pelo componente.
- Nenhuma alteração às equações ou resolução das superfícies.
- Primeiro cálculo permanece custoso; reexibição pode reutilizar a malha.
