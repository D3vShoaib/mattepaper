import { listenForReaderTaps, type ReaderInteraction } from "./reader-taps"
import type { ReaderAppearance, ReaderSettings } from "@/stores/reader-settings"
import {
  getReaderPalette,
  type ReaderPalette,
} from "@/features/reading/reader-palette"
// Foliate is kept behind this adapter; its upstream JavaScript has no TypeScript declarations.
// @ts-expect-error Foliate is a JavaScript submodule without type declarations.
import { makeBook } from "../../../packages/foliate-js/view.js"

type MetadataValue =
  string | Record<string, unknown> | MetadataValue[] | undefined
export interface TocEntry {
  label: string
  href?: string
  subitems?: TocEntry[]
}
interface FoliateBook {
  metadata?: { title?: MetadataValue; author?: MetadataValue }
  sections: unknown[]
  toc?: TocEntry[]
  getCover?: () => Promise<Blob | null>
  destroy?: () => void
}
interface Relocation {
  cfi?: string
  fraction?: number
  tocItem?: { href?: string; label?: string }
}
export interface ReaderView extends HTMLElement {
  open(book: FoliateBook): Promise<void>
  init(options: {
    lastLocation?: string
    showTextStart?: boolean
  }): Promise<void>
  prev(): Promise<void>
  next(): Promise<void>
  close(): void
  book: FoliateBook
  lastLocation?: Relocation
  goTo(href: string): Promise<unknown>
  isFixedLayout?: boolean
  renderer: HTMLElement & {
    setStyles?: (styles: string) => void
    getContents?: () => Array<{ doc: Document }>
  }
}

export async function waitForReaderContent(view: ReaderView) {
  const documents = view.renderer.getContents?.().map(({ doc }) => doc) ?? []
  await Promise.allSettled(documents.map(({ fonts }) => fonts.ready))
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}
function textValue(value: MetadataValue): string {
  if (typeof value === "string") return value
  if (Array.isArray(value))
    return value.map(textValue).filter(Boolean).join(", ")
  if (value && typeof value === "object") {
    if ("name" in value) return textValue(value.name as MetadataValue)
    return textValue(Object.values(value)[0] as MetadataValue)
  }
  return ""
}
export async function parseEpub(file: File) {
  if (!file.name.toLowerCase().endsWith(".epub") || !file.size)
    throw new Error("Choose a non-empty EPUB file.")
  const signature = new Uint8Array(await file.slice(0, 4).arrayBuffer())
  if (
    signature[0] !== 0x50 ||
    signature[1] !== 0x4b ||
    signature[2] !== 3 ||
    signature[3] !== 4
  )
    throw new Error("This file is not a valid EPUB archive.")
  const book = (await makeBook(file)) as FoliateBook
  try {
    if (!book.sections?.length)
      throw new Error("This EPUB has no readable sections.")
    let cover: Blob | undefined
    try {
      cover = (await book.getCover?.()) ?? undefined
    } catch {
      /* A missing cover should not block import. */
    }
    return {
      title:
        textValue(book.metadata?.title) || file.name.replace(/\.epub$/i, ""),
      author: textValue(book.metadata?.author) || "Unknown author",
      cover,
    }
  } finally {
    book.destroy?.()
  }
}
export function applyReaderSettings(
  view: Pick<ReaderView, "renderer" | "isFixedLayout">,
  settings: ReaderAppearance,
  fontUrl?: string,
  palette: ReaderPalette = getReaderPalette(),
  viewportWidth?: number
) {
  if (view.isFixedLayout) return
  const colors = palette
  const width = Math.max(
    1,
    Math.floor(
      viewportWidth ||
        view.renderer.getBoundingClientRect().width ||
        window.innerWidth
    )
  )
  const spreadWidth =
    settings.columns === "auto" && width >= 900 ? Math.ceil(width / 2) : width
  const attributes: Record<string, string> = {
    flow: settings.mode,
    gap: "0%",
    "max-column-count": settings.columns === "1" ? "1" : "2",
    "max-inline-size": `${spreadWidth}px`,
    "column-gap": `${settings.columnGap}px`,
    "margin-top": `${settings.marginTop}px`,
    "margin-bottom": `${settings.marginBottom}px`,
    "margin-left": `${settings.marginLeft}px`,
    "margin-right": `${settings.marginRight}px`,
  }
  for (const [name, value] of Object.entries(attributes)) {
    if (view.renderer.getAttribute(name) !== value)
      view.renderer.setAttribute(name, value)
  }
  const customFont =
    settings.font === "custom" && fontUrl?.startsWith("blob:")
      ? fontUrl
      : undefined
  const family = customFont
    ? '"Mattepaper Custom", Georgia, serif'
    : settings.font === "sans"
      ? "Arial, sans-serif"
      : "Georgia, serif"
  const fontFace = customFont
    ? `@font-face { font-family: "Mattepaper Custom"; src: url("${customFont}"); font-style: normal; font-weight: normal; }`
    : ""
  const foreground = settings.fontColor ?? colors.foreground
  const italic =
    !settings.respectPublisherFormatting && settings.italic
      ? "font-style: italic !important;"
      : ""
  const underline =
    !settings.respectPublisherFormatting && settings.underline
      ? "text-decoration-line: underline !important;"
      : ""
  const smoothing =
    settings.fontSmoothing === "antialiased"
      ? "-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;"
      : ""
  const shadow = settings.shadowEnabled
    ? `text-shadow: ${settings.shadowX}px ${settings.shadowY}px ${settings.shadowBlur}px ${settings.shadowColor} !important;`
    : ""
  view.renderer.setStyles?.(`
    ${fontFace}
    html, body { background: ${settings.backgroundColor ?? colors.background} !important; color: ${foreground} !important; }
    body { padding-left: 0 !important; padding-right: 0 !important; font-family: ${family} !important; font-size: ${(settings.fontSize * settings.fontScale) / 100}px !important; font-weight: ${settings.fontWeight} !important; line-height: ${settings.lineHeight} !important; letter-spacing: ${settings.letterSpacing}em !important; word-spacing: ${settings.wordSpacing}em !important; ${italic} ${underline} ${smoothing} ${shadow} }
    body p, body li, body blockquote { font-family: ${family} !important; font-size: ${(settings.fontSize * settings.fontScale) / 100}px !important; font-weight: ${settings.fontWeight} !important; letter-spacing: ${settings.letterSpacing}em !important; word-spacing: ${settings.wordSpacing}em !important; ${italic} ${shadow} }
    body h1, body h2, body h3, body h4, body h5, body h6 { font-family: ${family} !important; ${italic} ${shadow} }
    body :not(a) { color: inherit !important; }
    p, li, blockquote { line-height: ${settings.lineHeight} !important; text-align: ${settings.alignment} !important; hyphens: ${settings.hyphenation ? "auto" : "manual"} !important; -webkit-hyphens: ${settings.hyphenation ? "auto" : "manual"} !important; }
    p { margin-block-end: ${settings.paragraphSpacing}em !important; text-indent: ${settings.textIndent}em !important; }
    a { color: ${colors.link} !important; }
  `)
}
export async function createReader(
  file: File,
  container: HTMLElement,
  lastLocation: string | undefined,
  onRelocate: (detail: Relocation) => void,
  onTap: (interaction: ReaderInteraction) => void,
  settings: ReaderSettings
) {
  const book = (await makeBook(file)) as FoliateBook
  const view = document.createElement("foliate-view") as ReaderView
  view.style.cssText = "display:block;width:100%;height:100%"
  const handle = (event: Event) =>
    onRelocate((event as CustomEvent<Relocation>).detail)
  const documentListeners = new Map<Document, () => void>()
  const onLoad = (event: Event) => {
    const doc = (event as CustomEvent<{ doc: Document }>).detail.doc
    if (documentListeners.has(doc)) return
    const stop = listenForReaderTaps(doc, onTap, container)
    const window = doc.defaultView
    const release = () => {
      stop()
      window?.removeEventListener("unload", release)
      documentListeners.delete(doc)
    }
    documentListeners.set(doc, release)
    window?.addEventListener("unload", release, { once: true })
  }
  view.addEventListener("load", onLoad)
  view.addEventListener("relocate", handle)
  view.addEventListener("external-link", (event) => {
    event.preventDefault()
    const href = (event as CustomEvent<{ href: string }>).detail.href
    try {
      const url = new URL(href)
      if (url.protocol === "https:" || url.protocol === "http:")
        window.open(url.href, "_blank", "noopener,noreferrer")
    } catch {
      /* Ignore malformed external links. */
    }
  })
  container.append(view)
  try {
    await view.open(book)
    applyReaderSettings(view, settings)
    try {
      await view.init({ lastLocation })
    } catch {
      await view.init({})
    }
  } catch (error) {
    view.close()
    view.remove()
    book.destroy?.()
    throw error
  }
  return {
    view,
    destroy: () => {
      view.removeEventListener("relocate", handle)
      view.removeEventListener("load", onLoad)
      for (const stop of documentListeners.values()) stop()
      documentListeners.clear()
      view.close()
      view.remove()
      book.destroy?.()
    },
  }
}
