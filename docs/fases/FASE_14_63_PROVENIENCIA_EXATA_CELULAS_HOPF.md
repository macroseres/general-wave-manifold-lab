# Fase 14.63 — Proveniência exata das células de Hopf

O gerador registra, opcionalmente, `cellId = j*nTau+i` e a metade triangular (`half=0,1`) para cada candidato. Registra também a identidade da célula que produziu cada face final, inclusive quando o recorte por determinante cria polígonos com mais de três vértices.

## Uso

`npm run audit:hopf:cells`

A opção `recordCellProvenance` é opt-in e não altera a malha renderizada. A auditoria fornece contabilidade exata de aceitação/rejeição e associa cada aresta exposta à sua célula geradora, sem recorrer a distância arbitrária.

## Limitações

A vizinhança de células na grade não é, por si, prova de que um candidato rejeitado originou uma determinada aresta: o recorte por determinante e a triangulação alteram os segmentos. A categoria `fromClippedFaces` é informação sobre a face geradora, não prova de que a aresta esteja sobre `det=0`. A identificação exata de segmentos recortados requer transportar rótulos de arestas ao longo da operação de clipping. Não houve preenchimento automático de lacunas, alteração de tolerância ou junção de ramos.
