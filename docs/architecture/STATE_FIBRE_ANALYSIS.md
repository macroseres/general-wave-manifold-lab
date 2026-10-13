# State-fibre analysis — v0.7.0-dev.24

For a fixed state \(U_*\in\mathcal U\), this increment analyses the inverse images
\(\pi_-^{-1}(U_*)\) and \(\pi_+^{-1}(U_*)\) before rendering them.

In the finite chart, the projection-fibre formula has denominator
\[
P(z)z+Q(z)=2\bigl[b_{20}z^3+(b_{11}-a_{20})z^2+(b_{02}-a_{11})z-a_{02}\bigr].
\]
Its real projective zeros are singular parameter directions. The reciprocal chart
\((\eta,\Upsilon,Z)\) is used at \(Z=0\) to decide whether the projective infinity
direction is regular or singular; no finite \(z\) is fabricated there.

Removing the singular projective directions from \(\mathbb{RP}^1\) determines the
regular connected branches of the fibre. If there are \(k>0\) singular projective
directions, there are \(k\) regular components; if there are none, the regular
fibre has one projective component.

For the two endpoint projections, the fixed-state equations imply
\[
\tau_-(z)=\tau_+(z),\qquad Y_+(z)=-Y_-(z).
\]
Thus both fibres have the same branch topology and the same characteristic lifts;
they are reflected in the jump coordinate.

Characteristic lifts are the intersections with \(\mathcal C=\{Y=0\}\), obtained
from \(L_{U_*}(z)=0\), and are classified by the canonical spectral test as slow,
fast, coincidence, or projective infinity.
