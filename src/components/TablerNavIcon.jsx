
// Traços da família Tabler Icons (24 × 24, stroke 1.75).
const paths = {
  points: <><circle cx="6" cy="7" r="2"/><circle cx="17" cy="5" r="2"/><circle cx="13" cy="18" r="2"/></>,
  surfaces: <><path d="m3 9 9-5 9 5-9 5Z"/><path d="m3 14 9 5 9-5"/></>,
  fields: <><path d="m3 7 4-4m-4 0h4v4M10 14l4-4m-4 0h4v4M17 21l4-4m-4 0h4v4"/></>,
  arcs: <><path d="M3 20C3 6 10 4 21 4M3 20C9 12 16 16 21 8"/></>,
  states: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3"/></>,
  curves: <path d="M3 17c4 0 4-10 9-10s5 10 9 10"/>,
  view: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/></>,
  inspection: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  chains: <><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h5a4 4 0 0 1 0 8h-1a4 4 0 0 0 0 8h6"/></>,
  geometry: <><path d="m12 2 10 10-10 10L2 12Z"/><path d="M12 2v20M2 12h20"/></>,
  objects: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></>,
  point: <><circle cx="12" cy="12" r="8"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/></>,
  waves: <path d="M2 12c3-9 5 9 10 0s7-9 10 0"/>,
  singular: <><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/><circle cx="12" cy="12" r="2"/></>,
  charts: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/></>,
  profiles: <path d="M2 12c3-9 5 9 10 0s7-9 10 0"/>,
  time: <><path d="M6 3h12M6 21h12M7 3v4a5 5 0 0 0 2 4l3 1 3-1a5 5 0 0 0 2-4V3M7 21v-4a5 5 0 0 1 2-4l3-1 3 1a5 5 0 0 1 2 4v4"/></>,
  settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="2" fill="currentColor" stroke="none"/></>,
  index: <><path d="M5 5h14M5 10h14M5 15h14M5 20h14"/></>,
  reference: <><path d="M4 5c3-2 6-2 8 0 2-2 5-2 8 0v14c-3-2-6-2-8 0-2-2-5-2-8 0Z"/><path d="M12 5v14"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  glossary: <><path d="M4 5h16M4 10h16M4 15h16M4 20h16"/><path d="M7 3v4M7 13v4"/></>,
  close: <path d="M18 6 6 18M6 6l12 12"/>,
  collapse: <path d="m14 6-6 6 6 6"/>,
  expand: <path d="m10 6 6 6-6 6"/>,
}
export default function TablerNavIcon({name}) {
  return <svg className="tablerNavIcon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.objects}</svg>
}
