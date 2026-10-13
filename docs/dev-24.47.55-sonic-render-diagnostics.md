# dev.24.47.55 — diagnóstico de material das sônicas

Adiciona seletor **Visualização sônica (diagnóstico)**: Transparente (atual), Opaco, Wireframe. Afeta apenas materiais de 𝒮⁻ e 𝒮⁺; a triangulação, o Worker, os parâmetros, a câmera e o cache permanecem inalterados.

Procedimento: fixar a20=1.9; deixar apenas 𝒮⁻ visível; comparar os três modos sem mover a câmera; repetir para 𝒮⁺. O wireframe usa linhas do próprio material e pode sofrer oclusão pela malha ou por outros objetos.

Interpretação: estrias ausentes no opaco sugerem problemas de transparência/depth sorting; deformações persistentes em wireframe sugerem triangulação ou extração. Não é prova conclusiva isoladamente.
