# Ordenação de Liu em uma fibra forward — diagnóstico amostrado

Para um arco **orientado** da fibra de Hugoniot forward de um estado fixo
\(U_L\), ligando \(U_L\) a \(U_+\), a condição necessária de Liu é
\[
 s(U_L,U_+)\le s(U_L,U)\quad\text{para cada estado intermediário }U
\]
no arco relevante. `liuSpeedAlongFibre` verifica a desigualdade **somente**
nos estados intermediários fornecidos, exige Rankine–Hugoniot numericamente
em cada um deles e verifica que o arco começa em \(U_L\).

A rotina **não** procura o arco correto, não resolve seus pontos de retorno,
não garante que toda a fibra foi percorrida, nem certifica Liu globalmente.
A fibra backward com \(U_R\) fixo não deve receber automaticamente a mesma
desigualdade: a condição acima pressupõe o estado esquerdo fixo. A
integração com candidatos de ondas compostas depende de uma continuação
confiável de fibras orientadas e permanece como etapa posterior.
