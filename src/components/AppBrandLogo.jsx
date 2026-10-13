/** Identidade visual única: o mesmo SVG usado pelo favicon em public/favicon.svg. */
export const APP_LOGO_SRC = `${import.meta.env.BASE_URL}favicon.svg`

export default function AppBrandLogo() {
  return <img className="gwmlBrandSymbol" src={APP_LOGO_SRC} width="22" height="22" alt="" aria-hidden="true" draggable="false" />
}
