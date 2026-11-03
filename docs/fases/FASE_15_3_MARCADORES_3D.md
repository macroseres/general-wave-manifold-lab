# Fase 15.3 — integração conservadora de glifos tridimensionais

## Modificações
- `ScientificPoint3D.jsx`: primitiva de ponto 3D reutilizável, sem identidade matemática própria.
- `Scene.jsx`: glifo esférico das singularidades finitas/no infinito e das direções excepcionais passou a usar a primitiva.
- Preservados raio, material, cor, seleção, halo, área de picking, escala inversa e comportamento dos eventos.
- Não há ainda marcadores 3D de `U_L` e `U_R`: estes estados definem **fibras** na variedade, não um ponto 3D canônico. Criar uma esfera ou octaedro em posição arbitrária seria matematicamente incorreto.
- A equivalência visual círculo/esfera e losango/octaedro será usada apenas quando houver um ponto 3D legitimamente associado ao objeto.

## Próxima integração
- Inspeção bidirecional de pontos na variedade por `pi_-` e `pi_+`.
- Evidenciar fibras selecionadas com geometria correta, não glifos arbitrários.
- Manter distintas identidade do objeto, lado de projeção e geometria desenhada.

## Verificação
Rodar `npm run check` e conferir picking de singularidades e direções excepcionais no navegador.
