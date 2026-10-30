import {Children} from 'react'
import WorkspacePanelHeader from './WorkspacePanelHeader.jsx'
/**
 * Shared sidebar surface for Documentation, States, 3D and Physical.
 * The workspace layout owns dimensions; this component owns the common
 * drawer semantics and appearance, without interfering with its children.
 */
export default function WorkspaceDrawer({ as: Element = 'div', className = '', children, ...props }) {
  const items=Children.toArray(children)
  const headerIndex=items.findIndex(child=>child?.type===WorkspacePanelHeader||child?.props?.className?.split(' ').includes('workspacePanelHeader'))
  const content=headerIndex<0?children:<>{items[headerIndex]}<div className="workspaceDrawerScroll">{items.filter((_,index)=>index!==headerIndex)}</div></>
  return <Element {...props} className={`workspacePanelDrawer ${className}`.trim()}>{content}</Element>
}
