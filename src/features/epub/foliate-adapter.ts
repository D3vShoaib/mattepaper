// Foliate is kept behind this adapter; its upstream JavaScript has no TypeScript declarations.
// @ts-expect-error Foliate is a JavaScript submodule without type declarations.
import { makeBook } from "../../../packages/foliate-js/view.js"

type MetadataValue =
  string | Record<string, unknown> | MetadataValue[] | undefined
interface FoliateBook {
  metadata?: { title?: MetadataValue; author?: MetadataValue }
  sections: unknown[]
  getCover?: () => Promise<Blob | null>
  destroy?: () => void
}
interface Relocation {
  cfi?: string
  fraction?: number
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
export async function createReader(
  file: File,
  container: HTMLElement,
  lastLocation: string | undefined,
  onRelocate: (detail: Relocation) => void
) {
  const book = (await makeBook(file)) as FoliateBook
  const view = document.createElement("foliate-view") as ReaderView
  view.style.cssText = "display:block;width:100%;height:100%"
  const handle = (event: Event) =>
    onRelocate((event as CustomEvent<Relocation>).detail)
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
      view.close()
      view.remove()
      book.destroy?.()
    },
  }
}
