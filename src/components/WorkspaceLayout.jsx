/**
 * The sole layout contract for the three scientific workspaces.
 *
 * All geometry is defined in styles/workspace-layout.css. Scientific workspaces
 * supply their existing navigation, controls and visualization as children;
 * they must not set their own sidebar widths or offsets.
 */
export default function WorkspaceLayout({ as: Element = 'div', kind, expanded = true, className = '', children, ...props }) {
  return (
    <Element
      {...props}
      data-workspace={kind}
      data-panel-expanded={expanded ? 'true' : 'false'}
      className={`workspaceLayout workspaceLayout--${kind} ${className}`.trim()}
    >
      {children}
    </Element>
  )
}
