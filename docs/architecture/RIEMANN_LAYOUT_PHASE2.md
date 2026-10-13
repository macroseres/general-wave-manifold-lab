# Reorganização da interface — etapa 2: Espaço físico

O painel Espaço físico mantém as representações existentes de candidatos auto-similares, choques e leques. A barra superior reúne seleção de cadeia, tempo máximo e tempo de inspeção. A tabela de comparação, as evidências de admissibilidade e as correspondências de coordenadas ficam em seções expansíveis independentes.

O estado de abertura das seções é apenas visual. Nenhuma alteração foi feita nas condições de Rankine–Hugoniot, Lax, Liu, nas famílias características ou nos construtores de candidatos.

A interface utiliza layout adaptável e rolagem interna do diálogo para preservar o acesso aos gráficos em telas pequenas.

Validação: `npm test` — 532 testes aprovados. Lint/build exigem dependências de desenvolvimento instaladas.
