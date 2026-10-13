import WorkspaceDrawer from './WorkspaceDrawer.jsx'

/** Continuous tool drawer, sharing the same shell as the documentation index. */
export default function ContinuousSidebarPanel({ children, className = '' }) {
  return <WorkspaceDrawer className={`continuousSidebarPanel ${className}`.trim()}>{children}</WorkspaceDrawer>
}
