export { cn } from "cn"

/** True for links that should open in a new tab: external URLs and PDFs. */
export function opensInNewTab(href: string) {
  return /^https?:\/\//i.test(href) || /\.pdf($|[?#])/i.test(href);
}
