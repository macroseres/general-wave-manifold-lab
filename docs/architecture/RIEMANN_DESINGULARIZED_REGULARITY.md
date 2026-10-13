# Regularidade da equação desingularizada de Rankine–Hugoniot

A notação canônica da aplicação ambiente é

\[\mathcal F(\bar U,X,Z,s)=X(DF(\bar U)-sI)(1,Z)^T.\]

Para o fluxo quadrático, \(\mathcal F\) coincide exatamente com a diferença de Rankine–Hugoniot. A equação desingularizada é \(G=(DF(\bar U)-sI)r=0\), **não** uma redefinição de \(\mathcal F\).

* Carta finita: \(r=(1,Z)\), amplitude \(X\).
* Carta recíproca: \(r=(z,1)\), amplitude \(Y\).
* Na sobreposição: \(z=1/Z\) e \(Y=XZ\). Logo \(G_{finita}=Z G_{recíproca}\).

O módulo `src/math/manifold/desingularizedRegularity.js` calcula o resíduo de \(G\), sua diferencial nas variáveis \((\bar u,\bar v,A,d,s)\), o posto, e os postos aumentados por \(D\pi_-\) e \(D\pi_+\). O posto dois só é certificado como regularidade do nível zero quando o resíduo está dentro da tolerância. A dimensão das fibras só é apresentada sob essa condição. Em amplitude zero, o nível \(G=0\) retém a fronteira característica da componente não trivial e não toda a componente trivial de \(\mathcal F=0\).

**Limitações:** a avaliação de posto é numérica e depende da tolerância. A análise não certifica tangências geométricas, admissibilidade, nem resolve o problema de Riemann. O módulo está disponível para integração futura aos diagnósticos visuais.
