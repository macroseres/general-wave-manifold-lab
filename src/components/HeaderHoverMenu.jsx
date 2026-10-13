import { useEffect, useRef } from 'react'

/** Compact header menu: shared open id is owned by the parent. */
export default function HeaderHoverMenu({ id, label, symbol, openId, setOpenId, children, align = 'right' }) {
  const rootRef = useRef(null)
  const closeTimer = useRef(null)
  const open = openId === id
  const cancelClose = () => { if (closeTimer.current !== null) clearTimeout(closeTimer.current); closeTimer.current = null }
  const close = () => { cancelClose(); setOpenId(current => current === id ? null : current) }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpenId(current => current === id ? null : current), 150)
  }
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = event => { if (!rootRef.current?.contains(event.target)) close() }
    const onKeyDown = event => { if (event.key === 'Escape') { close(); rootRef.current?.querySelector('button')?.focus() } }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown) }
  }, [open, id, setOpenId]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => cancelClose(), [])
  return <div ref={rootRef} className={`gwmlHoverMenu ${open ? 'isOpen' : ''}`} onPointerEnter={event => { if (event.pointerType !== 'touch') { cancelClose(); setOpenId(id) } }} onPointerLeave={event => { if (event.pointerType !== 'touch') scheduleClose() }}>
    <button type="button" className="gwmlHoverMenuTrigger gwmlTopbarIcon" aria-label={label} title={label} aria-haspopup="menu" aria-expanded={open} onClick={() => { cancelClose(); setOpenId(current => current === id ? null : id) }}>{symbol}</button>
    {open && <div className={`gwmlHoverMenuSurface align-${align}`} role="menu" aria-label={label} onClick={event => { if (event.target.closest('button,[role="menuitem"]')) close() }}>{children}</div>}
  </div>
}
