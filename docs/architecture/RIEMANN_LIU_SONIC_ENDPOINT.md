# Fechamento local do arco de Liu no contato sônico

O módulo `src/math/solution/seededContactEndpoint.js` valida o acréscimo do estado de contato sônico refinado ao arco da Hugoniot forward obtido por continuação direta a partir de sementes características.

Para o estado fixo `left` e o contato `target`, exige-se que o salto não trivial satisfaça Rankine–Hugoniot com resíduo relativo pequeno. A extremidade final da trajetória deve estar próxima do contato, e o deslocamento entre ambos deve ter projeção não negativa na tangente orientada pelo último segmento da continuação. O deslocamento transversal é limitado. A tangente da Hugoniot no contato é calculada a partir do gradiente da equação de incidência e deve ser compatível com a tangente da trajetória. Gradientes singulares não são aceitos.

Após essas verificações, o contato é acrescentado ao arco orientado e `liuSpeedAlongFibre` testa, nas amostras, a condição necessária de Liu `s(left,target) <= s(left,U)` para cada estado intermediário.

**Limitações:** o teste não prova que o arco não tenha outro ramo ou ponto de retorno entre amostras, não certifica a condição de Liu no contínuo, não determina admissibilidade viscosa e não é um resolvedor completo do problema de Riemann. O resultado público mantém `passes: false`, fornece `sampledLiuPasses` e um estado `preliminary-*`. O fechamento é recusado quando não se confirma a orientação e a compatibilidade local.
