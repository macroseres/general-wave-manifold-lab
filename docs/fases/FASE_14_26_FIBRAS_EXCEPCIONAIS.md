# Fase 14.26 — Geometria das fibras excepcionais

- Opacidade das folhas características: 0.72 → 0.84 (menor transparência).
- `characteristicFiberGeometry` reutiliza `characteristicProjectiveFiber` para classificar a geometria da fibra no espaço de estados: reta (regular), plano inteiro (degenerada), vazio (ausente).
- Na direção infinita, a classificação continua na carta recíproca Z=0.
- **Limitação:** a fibra degenerada tem dimensão dois no espaço de estados e não pode ser representada corretamente como uma reta da carta regular `(tau,Y,zc)`. Esta fase não fabrica uma malha 3D nem altera a topologia da variedade; fornece a descrição geométrica correta e testes para apoiar futura representação com atlas adequado.
