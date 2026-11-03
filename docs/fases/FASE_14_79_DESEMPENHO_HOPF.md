# Fase 14.79 — cálculo Hopf fora da thread de interface

- A geração das quatro malhas Hopf (duas cartas, dois lados) ocorre em Web Worker.
- O gráfico e os controles continuam interativos enquanto o worker calcula.
- Workers antigos são cancelados quando parâmetros/visibilidade mudam.
- Dados de malha são transferidos como Float32Array/Uint32Array para evitar cópias grandes.
- A geometria Three.js é criada apenas depois do resultado, e descartada na troca.
- Medições `[geometria]` no console identificam tempos de Hopf, partição sônica e união BT.
- Não altera equações ou algoritmos de construção das superfícies.
- A mudança elimina o bloqueio da interface pelo cálculo Hopf, mas não garante reduzir o tempo total de cálculo.
