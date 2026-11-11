import 'katex/dist/katex.min.css'

// Chapter markup is authored in the repository and bundled by Vite.
export default function DocumentationHtml({source}) {
  const body=source.slice(source.indexOf('<body>')+6,source.lastIndexOf('</body>'))
  return <div dangerouslySetInnerHTML={{__html:body}}/>
}
