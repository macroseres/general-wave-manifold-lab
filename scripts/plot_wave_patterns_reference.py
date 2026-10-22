"""Run node scripts/wave-patterns-reference.mjs --json before this script."""
import json
import sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / ".cache/documentation-plotting"))
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

data = json.loads((root / "docs/examples/wave-patterns-reference-results.json").read_text(encoding="utf-8"))
out = root / "public/docs"
out.mkdir(parents=True, exist_ok=True)
blue, orange = "#176d94", "#c34f18"
fig = plt.figure(figsize=(13, 4.4), layout="constrained")
curve = data["rarefaction"]["curve"]
ax = fig.add_subplot(131)
ax.plot([q["u"] for q in curve], [q["v"] for q in curve], color=blue)
ax.scatter([0, 1], [-.75, .25], color=[blue, orange])
ax.annotate("$U_L$", (0, -.75), xytext=(10, 4), textcoords="offset points")
ax.annotate("$U_R$", (1, .25), xytext=(-30, 6), textcoords="offset points")
ax.set(xlabel="$u$", ylabel="$v$", title="Estados: $v=u-3/4$")
ax.set_aspect("equal", adjustable="datalim")
ax.grid(alpha=.2)
ax = fig.add_subplot(132, projection="3d")
tau, z = np.meshgrid(np.linspace(-.7, .45, 5), np.linspace(.8, 1.2, 5))
ax.plot_surface(tau, np.zeros_like(tau), z, color=blue, alpha=.15)
ax.plot([q["tau"] for q in curve], [0]*len(curve), [1]*len(curve), color=orange, linewidth=3)
ax.set(xlabel="$\\tau$", ylabel="$Y$", zlabel="$z$", title="Variedade: órbita em $Y=0, z=1$")
ax.view_init(elev=23, azim=-55)
ax = fig.add_subplot(133)
ax.fill([0, 0, 1.4], [0, 1.4, 1.4], color=blue, alpha=.15)
for speed in [0, .25, .5, .75, 1]:
    ax.plot([0, 1.4*speed], [0, 1.4], color=blue, linewidth=2 if speed in [0, 1] else .7)
ax.text(.35, 1.1, "$U=(x/t,x/t-3/4)$", fontsize=9)
ax.text(-.35, .7, "$U_L$")
ax.text(1.05, .5, "$U_R$")
ax.set(xlim=(-.45, 1.5), ylim=(0, 1.4), xlabel="$x$", ylabel="$t$", title="Físico: leque entre $x=0$ e $x=t$")
ax.grid(alpha=.2)
fig.suptitle("Rarefação exata da família rápida nos três espaços", fontsize=13)
for extension in ["svg", "png"]:
    fig.savefig(out / f"rarefaction-reference.{extension}", dpi=160)
plt.close(fig)

fig = plt.figure(figsize=(13, 4.4), layout="constrained")
ax = fig.add_subplot(131)
ax.plot([2, 2, 0], [1, 0, -1], "--", color=blue, alpha=.5)
ax.scatter([2, 2, 0], [1, 0, -1], color=[blue, "#555555", orange])
for label, xy, offset in [("$U_L$", (2, 1), (-28, -8)), ("$U_M$", (2, 0), (-32, 6)), ("$U_R$", (0, -1), (6, 6))]:
    ax.annotate(label, xy, xytext=offset, textcoords="offset points")
ax.set(xlabel="$u$", ylabel="$v$", title="Estados: dois saltos via $U_M$")
ax.set_aspect("equal", adjustable="datalim")
ax.grid(alpha=.2)
ax.text(.05, .92, "Tracejado: sequência de saltos,\nnão curva de rarefação", transform=ax.transAxes, fontsize=8)
ax = fig.add_subplot(132, projection="3d")
ax.scatter([2, 0], [0, -1], [.5, 1], color=[blue, orange], s=45)
ax.text(2, 0, .5, "  $P_1$")
ax.text(0, -1, 1, "  $P_2$")
ax.set(xlabel="$u_+$", ylabel="$v_+$", zlabel="$s$", title="Variedade: projeção $(u_+,v_+,s)$")
ax.view_init(elev=20, azim=-55)
ax = fig.add_subplot(133)
ax.fill([0, .7, 1.4], [0, 1.4, 1.4], color="#999999", alpha=.2)
for speed, color in [(.5, blue), (1, orange)]:
    ax.plot([0, 1.4*speed], [0, 1.4], color=color, label=f"$s={speed:g}$")
ax.text(-.35, .8, "$U_L$")
ax.text(.7, .95, "$U_M$")
ax.text(1.1, .45, "$U_R$")
ax.set(xlim=(-.45, 1.55), ylim=(0, 1.4), xlabel="$x$", ylabel="$t$", title="Físico: interfaces ordenadas")
ax.legend(loc="upper left", fontsize=8)
ax.grid(alpha=.2)
fig.suptitle("Dois choques exatos: a primeira parametrização local falha, mas a conexão existe", fontsize=12)
for extension in ["svg", "png"]:
    fig.savefig(out / f"two-shock-reference.{extension}", dpi=160)
plt.close(fig)
