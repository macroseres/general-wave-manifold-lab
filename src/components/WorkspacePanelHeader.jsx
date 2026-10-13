import TablerNavIcon from './TablerNavIcon.jsx'

/** Shared drawer heading and collapse action across scientific workspaces. */
export default function WorkspacePanelHeader({ title, onCollapse, collapseLabel = 'Recolher painel', className = '' }) {
  return <div className={`workspacePanelHeader ${className}`.trim()}>
    <strong title={typeof title === 'string' ? title : undefined}>{title}</strong>
    {typeof onCollapse === 'function' && <button type="button" className="workspacePanelClose" onClick={onCollapse} aria-label={collapseLabel} title={collapseLabel}>
      <TablerNavIcon name="close" />
    </button>}
  </div>
}
