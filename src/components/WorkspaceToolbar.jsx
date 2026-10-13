import { useState } from 'react'

/** Shared, initially expanded toolbar for graphical workspaces. */
export default function WorkspaceToolbar({ children, label, className = '' }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`workspaceToolbar ${className}`} data-open={open}>
      {open && <div className="workspaceToolbarContents">{children}</div>}
      <button
        type="button"
        className="workspaceToolbarToggle"
        aria-label={open ? `Ocultar ${label}` : `Mostrar ${label}`}
        aria-expanded={open}
        title={open ? 'Recolher ferramentas à direita' : 'Mostrar ferramentas'}
        onClick={() => setOpen(value => !value)}
      >{open ? '→' : '←'}</button>
    </div>
  )
}
