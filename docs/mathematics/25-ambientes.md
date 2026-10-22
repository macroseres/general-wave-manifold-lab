# Organização dos ambientes

Variedade 3D, Espaço de estados, Espaço físico, Parâmetros e Documentação compartilham a área central e são alternados pelo cabeçalho. Os controles e a inspeção 3D aparecem apenas na Variedade 3D. O ambiente Parâmetros reúne transformações afins e a classificação de $\Delta=0$. O Manual do usuário, no menu Preferências, contém as instruções operacionais; esta Documentação reúne definições, equações e limites científicos.

## Convenção — Finalidade das vistas

A Variedade de Ondas é o eixo científico da investigação: nela devem ser identificados os objetos que representam conexões e soluções estudadas nos estados. O espaço de estados permite examinar extremos, curvas e estados intermediários. O espaço físico apresenta realizações candidatas e seus perfis, com as qualificações registradas nos capítulos anteriores.

Parâmetros permite explorar a família de fluxos e suas classificações numéricas. Documentação e Manual têm funções complementares: a primeira explica as construções e hipóteses; o segundo orienta as operações da interface. A existência de um controle ou de uma vista não implica que a construção exibida tenha validação global.

## Relação com a implementação

src/App.jsx coordena os ambientes. DocumentationWorkspace.jsx fornece capítulos, busca e glossário; HelpDialog.jsx reutiliza o mesmo registro de seções matemáticas. Os textos científicos das 26 seções são carregados diretamente dos arquivos Markdown em docs/mathematics; o registro em DocumentationContent.jsx preserva a ordem e os títulos usados pela navegação.

Selecionar um estado, um ponto da variedade ou um candidato físico são operações diferentes. Sua correspondência deve ser verificada pelos dados e projeções compartilhados; não se presume que qualquer mudança de ambiente construa automaticamente todas as soluções associadas ao objeto selecionado.
