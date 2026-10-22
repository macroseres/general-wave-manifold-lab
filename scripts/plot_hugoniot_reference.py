"""Run node scripts/hugoniot-reference.mjs --json before this script."""
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / ".cache/documentation-plotting"))
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

data = json.loads((root / "docs/examples/hugoniot-reference-results.json").read_text(encoding="utf-8"))
curve = data["curve"]
fig = plt.figure(figsize=(13, 4.4), layout="constrained")
blue, orange = "#176d94", "#c34f18"
ax = fig.add_subplot(131)
ax.plot([q["right"][0] for q in curve], [q["right"][1] for q in curve], color=blue, label="Trecho de $\\pi_+(H^{forw})$")
ax.scatter([2, 0], [0, -1], color=["#333333", orange], s=40, zorder=3)
ax.annotate("$U_-=(2,0)$", (2, 0), xytext=(-82, -20), textcoords="offset points")
ax.annotate("$U_+=(0,-1)$", (0, -1), xytext=(10, -22), textcoords="offset points")
ax.set(xlabel="$u$", ylabel="$v$", title="Estados: imagem da fibra")
ax.set_aspect("equal", adjustable="datalim")
ax.grid(alpha=.2)
ax.legend(loc="lower right", fontsize=8)
ax = fig.add_subplot(132, projection="3d")
ax.plot([q["tau"] for q in curve], [q["Y"] for q in curve], [q["z"] for q in curve], color=blue)
ax.scatter([-.125], [-1], [2], color=orange, s=35)
ax.set(xlabel="$\\tau$", ylabel="$Y$", zlabel="$z$", title="Variedade: fibra na carta regular")
ax.view_init(elev=20, azim=-55)
ax = fig.add_subplot(133)
ax.fill([-1, 0, 2, -1], [0, 0, 2, 2], color=blue, alpha=.15)
ax.fill([0, 3, 3, 2], [0, 0, 2, 2], color=orange, alpha=.15)
ax.plot([0, 2], [0, 2], color=orange, linewidth=2, label="$x=st=t$")
ax.text(-.65, 1.4, "$U_-=(2,0)$", fontsize=10)
ax.text(1.65, .45, "$U_+=(0,-1)$", fontsize=10)
ax.set(xlim=(-1, 3), ylim=(0, 2), xlabel="$x$", ylabel="$t$", title="Físico: um choque de velocidade 1")
ax.legend(loc="upper left", fontsize=8)
ax.grid(alpha=.2)
fig.suptitle("Uma fibra, duas projeções de estados e uma realização física\n" + r"Fluxo: $F(u,v)=(u^2/2,\ v^2/2+3u/4)$; trecho $7/4\leq z\leq9/4$", fontsize=12)
output = root / "public/docs"
output.mkdir(parents=True, exist_ok=True)
fig.savefig(output / "hugoniot-reference.svg")
fig.savefig(output / "hugoniot-reference.png", dpi=160)
plt.close(fig)
