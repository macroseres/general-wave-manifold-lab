import TablerNavIcon from './TablerNavIcon.jsx'
import { Fragment } from 'react'

/** Shared navigation rail for all scientific workspaces. */
export default function WorkspaceRail({items,active,expanded=true,onSelect,onCollapse,ariaLabel,className=''}) {
  const handleNavigationKeyDown = (event, index) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    if (!items.length) return
    event.preventDefault()
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? items.length - 1
      : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
    event.currentTarget.parentElement?.querySelectorAll('button')[next]?.focus()
  }

  return <nav className={`workspaceRail ${className}`} aria-label={ariaLabel}>
    <div className="workspaceRailItems">
      {items.map((item,index)=><Fragment key={item.id}>
      {item.group&&item.group!==items[index-1]?.group&&<span className="workspaceRailGroup" aria-hidden="true">{item.group}</span>}
      <button type="button" className={active===item.id&&expanded?'active':''}
      aria-label={item.label} aria-pressed={active===item.id&&expanded} title={item.description||item.label}
      onKeyDown={event=>handleNavigationKeyDown(event,index)}
      onClick={()=>onSelect(item.id)}><span className="workspaceRailIcon"><TablerNavIcon name={item.id}/></span><span className="workspaceRailLabel">{item.label}</span></button></Fragment>)}
    </div>
    <button type="button" className="workspaceRailCollapse" aria-label={expanded?'Recolher painel':'Expandir painel'} aria-expanded={expanded} title={expanded?'Recolher painel':'Expandir painel'} onClick={onCollapse}><span className={`workspaceRailCollapseGlyph ${expanded?'':'workspaceRailCollapseGlyph--expand'}`} aria-hidden="true" /></button>
  </nav>
}
