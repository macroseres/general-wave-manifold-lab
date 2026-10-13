/**
 * Shared sidebar surface for Documentation, States, 3D and Physical.
 * The workspace layout owns dimensions; this component owns the common
 * drawer semantics and appearance, without interfering with its children.
 */
export default function WorkspaceDrawer({ as: Element = 'div', className = '', children, ...props }) {
  return <Element {...props} className={`workspacePanelDrawer ${className}`.trim()}>{children}</Element>
}
