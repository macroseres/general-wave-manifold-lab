/** Shared Tabler-style visibility action for scientific objects. */
export default function VisibilityEye({checked, onChange, 'aria-label': ariaLabel, ...props}) {
  return <button {...props} type="button" className="visibilityEye" style={{appearance:"none", WebkitAppearance:"none", border:"0", background:"transparent", boxShadow:"none", outlineOffset:2}} aria-pressed={Boolean(checked)}
    aria-label={`${checked ? "Ocultar" : "Mostrar"} — ${ariaLabel?.replace(/^Exibir\s*/, "") || "objeto"}`} title={`${checked ? "Ocultar" : "Mostrar"} — ${ariaLabel?.replace(/^Exibir\s*/, "") || "objeto"}`} onClick={()=>onChange?.({target:{checked:!checked}})}>
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {checked ? <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M10.6 5.1A11.7 11.7 0 0 1 12 5c6.5 0 10 7 10 7a14.2 14.2 0 0 1-3.1 3.8M6.1 6.3C3.4 8.1 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/></>}
    </svg>
  </button>
}
