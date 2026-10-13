# Diagnóstico de segmentos discrepantes de J

Execute `npm run audit:j:outliers` (opcional: `-- --ntau 24 --ny 16 --nz 28`).

O comando é exclusivo de desenvolvimento; não é importado pela interface 3D.

Para cada segmento de interseção, calcula distâncias às polilinhas canônicas de J e DS, classifica pelo ponto médio e ordena os segmentos atribuídos a J pelo maior desvio de seus extremos e ponto médio. As coordenadas são `(tau, Y, zc)`.

Na resolução 24/16/28, os segmentos 45 e 68 apresentam os maiores desvios (~0,05694 e ~0,04598). Ambos têm Y=0 e distância à DS muito superior à distância a J, portanto não são ambiguidades óbvias de classificação J/DS. Isso ainda não identifica a origem do desvio: avaliar interpolação da curva canônica, triangulação e extração de interseção antes de modificar superfícies.
