# Destaque de Hugoniot com proveniência

A inspeção da cadeia candidata no espaço de estados usa, quando presentes, os metadados da interseção que originou o candidato.

- Cadeias de dois choques: `forwardSegment` e `backwardSegment` identificam os ramos originais.
- Cadeias mistas: `curveId` e `hugoniotIndex` identificam, respectivamente, o ramo e a posição na poligonal de Hugoniot.
- A busca do estado fixo permanece limitada aos vértices da curva identificada.
- A extremidade próxima a `U_M` fica restrita ao segmento indicado quando o índice está disponível.
- A tolerância geométrica continua obrigatória. Falhas de identificação retornam `null`, sem recorrer a outro ramo.

Os traçados representam arcos **amostrados**, não uma prova de conexão exata, completude ou admissibilidade entrópica.
