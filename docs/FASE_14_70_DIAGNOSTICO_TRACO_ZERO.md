# Fase 14.70 — Diagnóstico visual do traço zero

No menu **Isolar**, as opções **Traço zero ⁻ (sem recorte)** e **Traço zero ⁺ (sem recorte)** exibem as malhas implícitas das duas cartas sem aplicar a desigualdade do determinante. As opções Hopf continuam aplicando `det >= 0`. A geometria é calculada nas duas cartas, com o recorte de janela preservado.

**Interpretação:** partes visíveis no modo traço zero mas ausentes no modo Hopf podem estar excluídas pela condição espectral; isso não prova que toda a diferença decorra dessa condição, pois os algoritmos de triangulação também podem introduzir lacunas. A comparação deve ser acompanhada por avaliações pontuais de traço e determinante.

**Limite:** o infinito projetivo `Z=0` não tem representação regular em `(tau,Y,zc)` quando `Y != 0`. A nova opção não cria um fechamento fictício da superfície.
