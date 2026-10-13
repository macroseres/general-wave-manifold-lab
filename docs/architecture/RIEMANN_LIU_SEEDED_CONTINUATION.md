# Continuação forward diretamente das sementes características

`traceSeededForwardHugoniot(U_L, target, p)` inicializa os quatro ramos locais
nas duas famílias reais simples, a partir das sementes corrigidas de
`characteristicForwardHugoniotSeeds`. Cada passo emprega predição tangente e
correção de Newton para a incidência de Rankine–Hugoniot, com condição de
pseudo-comprimento de arco. A construção independe da malha de Hugoniot já
renderizada.

O procedimento tenta alcançar uma **vizinhança** do contato indicado. A
aproximação não prova que a trajetória alcança exatamente o contato nem que
existe um arco globalmente único. Na ausência de aproximação, ou quando dois
ramos são igualmente plausíveis, não se declara conexão. A função
`seededLiuAtForwardContact` aplica Liu às amostras obtidas, mas sempre devolve
`passes: false`, reservando `sampledLiuPasses` ao diagnóstico exploratório.

Próximos passos: corrigir o ponto final sobre a mesma componente, controlar
passos adaptativos e verificar a desigualdade de Liu com garantias entre
amostras. Nenhuma dessas condições é certificada nesta etapa.
