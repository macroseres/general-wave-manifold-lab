/** Shared scrollable contents of the tools drawer in every workspace. */
export default function WorkspacePanelBody({as:Element='div',className='',children,...props}) {
  return <Element {...props} className={`workspacePanelBody ${className}`.trim()}>{children}</Element>
}
