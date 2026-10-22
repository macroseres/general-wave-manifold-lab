"""Generate figures from node scripts/advanced-reference.mjs --json."""
import json
import sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / ".cache/documentation-plotting"))
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

data = json.loads((root / "docs/examples/advanced-reference-results.json").read_text(encoding="utf-8"))
out = root / "public/docs"
out.mkdir(parents=True, exist_ok=True)
blue, orange = "#176d94", "#c34f18"
fig = plt.figure(figsize=(13, 4.4), layout="constrained")
curve = data["composite"]
ax = fig.add_subplot(131)
ax.plot([q["left"][0] for q in curve], [q["left"][1] for q in curve], color=orange, label="Extremo esquerdo sônico")
ax.plot([q["right"][0] for q in curve], [q["right"][1] for q in curve], color=blue, label="Rarefação de origem")
ax.plot([0, 0], [.75, -.75], "--", color=orange)
ax.scatter([0, 0, 1], [.75, -.75, .25], color=[orange, blue, blue])
ax.set(xlabel="$u$", ylabel="$v$", title="Estados: conexão sônica e rarefação")
ax.set_aspect("equal", adjustable="datalim")
ax.legend(fontsize=8, loc="upper left")
ax.grid(alpha=.2)
ax = fig.add_subplot(132, projection="3d")
ax.plot([q["right"][0] for q in curve], [q["right"][1] for q in curve], [q["s"] for q in curve], color=orange)
ax.set(xlabel="$u_+$", ylabel="$v_+$", zlabel="$s$", title="Variedade: projeção do ramo algébrico")
ax.view_init(elev=20, azim=-55)
ax = fig.add_subplot(133)
ax.fill([0, 0, 1.4], [0, 1.4, 1.4], color=blue, alpha=.15)
ax.plot([0, 0], [0, 1.4], color=orange, linewidth=2.5, label="Choque sônico $s=0$")
for speed in [.25, .5, .75, 1]:
    ax.plot([0, 1.4*speed], [0, 1.4], color=blue, linewidth=.8)
ax.text(-.4, .65, "$(0,3/4)$", fontsize=9)
ax.text(.38, 1.05, "Leque rápido", fontsize=9)
ax.text(1.05, .4, "$(1,1/4)$", fontsize=9)
ax.set(xlim=(-.5, 1.55), ylim=(0, 1.4), xlabel="$x$", ylabel="$t$", title="Físico: junção de velocidades iguais")
ax.legend(fontsize=8, loc="upper left")
ax.grid(alpha=.2)
fig.suptitle("Conexão composta degenerada: equações exatas, sem inversão da matriz sônica", fontsize=12)
for ext in ["svg", "png"]:
    fig.savefig(out / f"composite-reference.{ext}", dpi=160)
plt.close(fig)

fig, axes = plt.subplots(1, 2, figsize=(10, 4.3), layout="constrained")
ax = axes[0]
for q in data["separatrix"]["curves"]:
    points=q["reciprocalPoints"]
    ax.plot([p["eta"] for p in points], [p["Z"] for p in points], color=blue if q["stable"] else orange,
            label="Estáveis, $Z=0$" if q["id"]=="stable:-" else "Instáveis numéricas" if q["id"]=="unstable:-" else None)
ax.scatter([0], [0], color="black", s=18)
ax.set(xlabel="$\\eta$", ylabel="$Z$", title="Sela recíproca: autovalores -8 e 7")
ax.legend(fontsize=8)
ax.grid(alpha=.2)
ax = axes[1]
ellipse=data["classification"]["ellipse"]
u=[q["u"] for q in ellipse]
v=[q["v"] for q in ellipse]
ax.fill(u,v,color=blue,alpha=.15,label="$\\Delta<0$")
ax.plot(u,v,color=blue,label="$\\Delta=0$")
ax.text(.15,-.2,"$\\Delta>0$",fontsize=10)
ax.set(xlabel="$u$", ylabel="$v$", title=r"Coincidência: $64u^2+4(v+1/2)^2=1$")
ax.set_aspect("equal", adjustable="box")
ax.set_xlim(-.3,.3)
ax.legend(fontsize=8,loc="lower left")
ax.grid(alpha=.2)
fig.suptitle("Dois diagnósticos distintos para o mesmo fluxo simétrico", fontsize=12)
for ext in ["svg", "png"]:
    fig.savefig(out / f"classification-separatrix-reference.{ext}", dpi=160)
plt.close(fig)
