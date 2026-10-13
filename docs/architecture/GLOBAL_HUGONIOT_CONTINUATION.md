# Global Hugoniot continuation (dev.24.7)

For a fixed state $U_*$, the two projection fibres are
\[
\mathcal H^{\mathrm{forw}}(U_*)=\pi_-^{-1}(U_*),\qquad
\mathcal H^{\mathrm{back}}(U_*)=\pi_+^{-1}(U_*).
\]
The finite chart $(\tau,Y,z)$ is not used as a global chart near projective
infinity.  Continuation there uses
\[
Z=1/z,\qquad \eta=\tau/Z^2,\qquad \Upsilon=Y/Z.
\]
A regular reciprocal point is mapped back for display only when $Z\ne0$ by
$\tau=\eta Z^2$, $Y=\Upsilon Z$, $z=1/Z$.

The reciprocal curve is continuous through $Z=0$ whenever its mathematical
fibre point is regular there.  The renderer deliberately keeps the $Z<0$ and
$Z>0$ display pieces separate: the visual coordinate
$\hat z=(2/\pi)\arctan z$ has two boundary representatives, so joining
$\hat z=-1$ to $\hat z=+1$ with a Euclidean chord would fabricate geometry.

Characteristic intersections $P_s,P_f\in\mathcal C$ remain exact invariants
computed independently of the display sampling and are not rendered as
permanent markers.
