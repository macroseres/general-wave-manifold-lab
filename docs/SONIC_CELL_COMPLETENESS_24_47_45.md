# Auditoria de completude local — dev.24.47.45

Comando: `npm run audit:sonics:cell-completeness`.

Examina os seis tetraedros de cada uma das quatro células que circundam P=(0,0,0.9979731774678219), separadamente para S- e S+.

A classificação independente usa os sinais dos quatro valores nodais de Phi para contar triângulos esperados pela topologia afim do Marching Tetrahedra. Compara com o número efetivamente emitido e registra rejeições de triângulos, incluindo a norma do produto vetorial (duas vezes a área do triângulo).

Resultado padrão: S-: 20 esperados, 16 emitidos; S+: 32 esperados, 28 emitidos. As oito rejeições (quatro por superfície) têm causa `small-cross-product`: a regra `norm(cross(b-a,c-a)) <= 1e-10` em `emitTriangle`. As normas variam de ~4.87e-16 a ~7.42e-11. Isso demonstra uma supressão geométrica explícita, não ausência de mudança de sinal nem falha de rastreamento.

A auditoria também calcula Phi nos baricentros dos triângulos emitidos nessas células. O resíduo máximo é ~73492 em S- e ~8160 em S+, indicando que a aproximação por triângulos retos pode ser imprecisa nesta região altamente condicionada.

**Limites:** contar triângulos pelos sinais nodais não detecta componentes do zero-set no interior de tetraedros sem mudança de sinal. A magnitude absoluta do resíduo no baricentro não mede distância geométrica sem normalização adequada. Não modificar automaticamente a tolerância de área: triângulos quase degenerados podem piorar a qualidade e produzir não-manifold ou costuras. A geração padrão não ativa `traceCells` e mantém o mesmo comportamento.
