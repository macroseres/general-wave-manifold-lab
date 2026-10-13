# 01 — Spaces and views

The application uses three mathematically different spaces.

## Wave manifold

The wave manifold `W` stores wave data such as the left state `U_-`, right state `U_+`, and propagation speed `s`. The current global visualization uses coordinates adapted to this manifold, including the finite chart `(tau,Y,z)` and its compactified display coordinate.

## State space — implemented point projection

The state space is the `(u,v)` plane. A point `P ∈ W` has two natural projections into it: the left state `U_-` and the right state `U_+`. Use **Espaço de estados** in the header to inspect the currently selected point `P ∈ W`. The view shows `U_- = pi_-(P)`, `U_+ = pi_+(P)` and the midpoint `Ubar` in the `(u,v)` plane. The segment between `U_-` and `U_+` is a visual aid for the selected jump; it is not a newly computed wave curve. On the characteristic surface `C` (`Y=0`), the three markers coincide.

**Status:** point projections implemented. Projection of complete Hugoniot, rarefaction and composite curves will be added only when those mathematical objects are supplied by the validated math layer.

## Physical space — implemented rarefaction view

The physical plane uses the independent variables `(x,t)`. The solution is `U(x,t)=(u(x,t),v(x,t))`. For a validated rarefaction orbit with monotone characteristic speed, the app realizes the same orbit as a self-similar fan using `xi=x/t=s(U)` for `t>0`. The view does not integrate a second physical-space ODE.

Use **Espaço físico** to inspect this realization. Selecting a physical ray drives the shared selection back to the corresponding point `P` of the wave manifold. Orbits whose characteristic speed reverses are rejected as regular physical fans.

**Status:** rarefaction realization implemented and synchronized across `W -> U -> X`. Shock curves, composite waves and a general Riemann solver remain outside the pre-Hugoniot foundation.

## Curvas de rarefação no espaço de estados

A vista **Espaço de estados (u,v)** também pode mostrar as rarefações já
calculadas na superfície característica. Essas curvas não são recalculadas
no plano: cada ponto `(tau,z)` de uma órbita em `C` é enviado para o estado
`Ubar(tau,z)`. Os trechos lento e rápido são identificados pela ordenação
espectral usada para `C_s` e `C_f`. Na coincidência `E` essa distinção deixa
de existir, e os segmentos são interrompidos visualmente em vez de receberem
um rótulo artificial.

### Uma rarefação pode mudar de ramo em E

Os rótulos `R_s` e `R_f` descrevem trechos de uma mesma curva integral. Se a
órbita atravessa a coincidência `E`, ela continua através do mesmo ponto: um
lado é classificado como lento e o outro como rápido. Na vista `(u,v)`, o
ponto de transição é marcado e os dois estilos compartilham exatamente esse
mesmo ponto. Portanto, uma mudança de estilo em `E` não significa que uma
rarefação terminou e outra começou.
