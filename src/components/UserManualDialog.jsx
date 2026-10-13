const instructions = [
  ['Navegação principal', 'Use as abas Variedade 3D, Espaço de estados, Espaço físico e Documentação. Cada aba ocupa a área central; não é uma janela flutuante. O ambiente selecionado permanece indicado no cabeçalho.'],
  ['Variedade 3D — configuração', 'Abra Fluxo geral para editar os dez coeficientes. Janela de amostragem limita o recorte computacional; Escala visual altera apenas a apresentação. Os controles de superfícies ativam ou ocultam objetos geométricos.'],
  ['Variedade 3D — inspeção', 'Clique na geometria para inspecionar o ponto da variedade. No painel direito, expanda Inspeção, Espectro, Sônicas, Rarefação ou Singularidades conforme necessário. Em telas estreitas, use os botões Controles e Inspeção para abrir os painéis.'],
  ['Espaço de estados — dados de Riemann', 'Defina U_L e U_R usando os controles de seleção e o plano (u,v). Não confunda esses estados globais com o ponto genérico U* de exploração ou com os estados móveis U₋ e U₊ da variedade.'],
  ['Espaço de estados — construção', 'Examine as curvas de Hugoniot e os ramos de rarefação, escolha uma cadeia candidata e confira o estado intermediário U_M. Use as seções expansíveis para ver admissibilidade, proveniência e diagnósticos numéricos.'],
  ['Espaço físico — perfis', 'Selecione uma cadeia candidata e ajuste o tempo para visualizar o diagrama (x,t) e os perfis u(x,t), v(x,t). Choques aparecem como saltos; os leques são amostrados. A seleção é compartilhada com o Espaço de estados.'],
  ['Como interpretar os diagnósticos', 'Verifique separadamente Rankine–Hugoniot, hiperbolicidade, Lax e Liu quando disponível. Um candidato numérico não é uma solução entrópica certificada. Valores ausentes ou inconclusivos não significam zero nem aprovação.'],
  ['Experimentos', 'No menu Experimento, exporte ou importe configurações JSON e restaure o preset. Antes de alterar muitos parâmetros, exporte a configuração para permitir a reprodução da exploração.'],
  ['Documentação matemática', 'Abra Documentação na navegação central. Use o índice para localizar definições, equações, cadeias candidatas e limitações numéricas. A Documentação não substitui o Manual operacional.']
]

export default function UserManualDialog({open,onClose}) {
  if (!open) return null
  return <div className="helpBackdrop" onMouseDown={onClose}>
    <section className="helpDialog manualDialog" role="dialog" aria-modal="true" aria-labelledby="manual-title" onMouseDown={event=>event.stopPropagation()}>
      <header className="helpHeader"><div><h2 id="manual-title">Manual do usuário</h2><p>Guia operacional dos quatro ambientes científicos</p></div><button type="button" onClick={onClose}>Fechar</button></header>
      <div className="helpBody">{instructions.map(([title,description],i)=><section key={title}><h3>{i+1}. {title}</h3><p>{description}</p></section>)}</div>
    </section>
  </div>
}
