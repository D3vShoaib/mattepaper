import { listenForReaderTaps, type TapAction } from "./reader-taps"
import { readerThemes, type ReaderSettings } from "@/stores/reader-settings"
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
  lastLocation?: { cfi?: string }
  goTo(href: string): Promise<unknown>
  isFixedLayout?: boolean
  renderer: HTMLElement & { setStyles?: (styles: string) => void }
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
  settings: ReaderSettings
) {
  if (view.isFixedLayout) return
  const colors = readerThemes[settings.theme]
  const attributes: Record<string, string> = {
    "max-column-count": "1",
    "max-inline-size": "720px",
    "margin-top": `${settings.margin}px`,
    "margin-bottom": `${Math.max(settings.margin, 56)}px`,
    "margin-left": `${settings.margin}px`,
    "margin-right": `${settings.margin}px`,
  }
  for (const [name, value] of Object.entries(attributes)) {
    if (view.renderer.getAttribute(name) !== value)
      view.renderer.setAttribute(name, value)
  }
  const family =
    settings.font === "sans" ? "Arial, sans-serif" : "Georgia, serif"
  view.renderer.setStyles?.(`
    html, body { background: ${colors.background} !important; color: ${colors.foreground} !important; }
    body { font-family: ${family} !important; font-size: ${settings.fontSize}px !important; line-height: ${settings.lineHeight} !important; }
    body :not(a) { color: inherit !important; }
    p, li, blockquote { line-height: ${settings.lineHeight} !important; }
    a { color: ${colors.link} !important; }
  `)
}
export async function createReader(
  file: File,
  container: HTMLElement,
  lastLocation: string | undefined,
  onRelocate: (detail: Relocation) => void,
  onTap: (action: Exclude<TapAction, null>) => void,
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
