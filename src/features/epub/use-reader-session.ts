import { useCallback, useEffect, useRef, useState } from "react"
import { db, type Book } from "@/db"
import {
  effectiveReaderSettings,
  type ReaderAppearance,
  type TapZoneKey,
} from "@/features/reading/reader-settings"
import { useReaderSettings } from "@/stores/reader-settings"
import { statusAfterProgress } from "@/features/library/book-status"
import {
  applyReaderSettings,
  createReader,
  waitForReaderContent,
  type ReaderView,
  type TocEntry,
} from "@/features/epub/foliate-adapter"
import type { ReaderInteraction } from "@/features/epub/reader-taps"
import type { ReaderPalette } from "@/features/reading/reader-palette"
import { useChapterNavigation } from "@/features/epub/use-chapter-navigation"
import { useReaderShortcuts } from "@/features/epub/use-reader-shortcuts"

const currentSettings = (bookId = "") =>
  effectiveReaderSettings(useReaderSettings.getState(), bookId)

interface ReaderSessionOptions {
  bookId?: string
  appearance: ReaderAppearance
  fontUrl?: string
  palette: ReaderPalette
}

export function useReaderSession({
  bookId,
  appearance,
  fontUrl,
  palette,
}: ReaderSessionOptions) {
  const container = useRef<HTMLDivElement>(null)
  const reader = useRef<ReaderView | null>(null)
  const reflow = useRef<{
    view: ReaderView
    cfi: string
    token: number
  } | null>(null)
  const reflowToken = useRef(0)
  const savePosition = useRef<
    (position: {
      cfi: string
      progress?: number
      lastReadAt?: number
      status?: Book["status"]
    }) => void
  >(() => {})
  const [book, setBook] = useState<Book>()
  const [loadState, setLoadState] = useState<"loading" | "ready" | "failed">(
    "loading"
  )
  const [error, setError] = useState("")
  const [readerWidth, setReaderWidth] = useState(() => window.innerWidth)
  const [progress, setProgress] = useState<number>()
  const [chapterProgress, setChapterProgress] = useState<number>()
  const [chapters, setChapters] = useState<TocEntry[]>([])
  const [currentChapter, setCurrentChapter] = useState<string>()
  const [fixedLayout, setFixedLayout] = useState(false)
  const [showBar, setShowBar] = useState(true)
  const [chaptersOpen, setChaptersOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const ready = loadState === "ready"

  const onInteraction = useCallback(
    (interaction: ReaderInteraction) => {
      const action =
        interaction.type === "zone"
          ? currentSettings(bookId)[`${interaction.zone}Action` as TapZoneKey]
          : interaction.action
      if (action === "toggle") {
        setShowBar((visible) => !visible)
        setChaptersOpen(false)
        setSettingsOpen(false)
      } else if (action === "previous") {
        void reader.current
          ?.prev()
          .catch(() => setError("Could not turn the page."))
      } else if (action === "next") {
        void reader.current
          ?.next()
          .catch(() => setError("Could not turn the page."))
      } else if (action === "contents") {
        setShowBar(true)
        setSettingsOpen(false)
        setChaptersOpen(true)
      } else if (action === "settings") {
        setShowBar(true)
        setChaptersOpen(false)
        setSettingsOpen(true)
      }
    },
    [bookId]
  )
  const {
    previous: previousChapter,
    next: nextChapter,
    navigating: chapterNavigating,
    moveTo: moveChapter,
  } = useChapterNavigation({
    reader,
    chapters,
    currentChapter,
    onError: setError,
  })
  useReaderShortcuts(onInteraction)

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined
    let write = Promise.resolve()
    savePosition.current = (position) => {
      if (!bookId) return
      write = write
        .then(async () => {
          if (!(await db.books.update(bookId, position)))
            throw new Error("This book is no longer in your library.")
        })
        .then(() => undefined)
        .catch(() => {
          if (!cancelled) setError("Could not save your reading position.")
        })
    }

    async function open() {
      try {
        if (!bookId) throw new Error("Book not found.")
        const [storedBook, storedFile] = await Promise.all([
          db.books.get(bookId),
          db.bookFiles.get(bookId),
        ])
        if (!storedBook || !storedFile)
          throw new Error("This book could not be found in your library.")
        if (cancelled || !container.current) return

        setBook(storedBook)
        setProgress(storedBook.progress)
        const instance = await createReader(
          new File([storedFile.data], storedBook.fileName, {
            type: "application/epub+zip",
          }),
          container.current,
          storedBook.cfi,
          (detail) => {
            if (
              cancelled ||
              !detail.cfi ||
              reflow.current?.view === reader.current
            )
              return
            const value = Number.isFinite(detail.fraction)
              ? Math.max(0, Math.min(1, detail.fraction!))
              : storedBook.progress
            setProgress(value)
            setChapterProgress(detail.chapterFraction)
            setCurrentChapter(detail.tocItem?.href)
            savePosition.current({
              cfi: detail.cfi,
              progress: value,
              lastReadAt: Date.now(),
              status: statusAfterProgress(storedBook.status, value),
            })
          },
          onInteraction,
          currentSettings(bookId)
        )
        if (cancelled) {
          instance.destroy()
          return
        }

        cleanup = instance.destroy
        await waitForReaderContent(instance.view)
        if (cancelled) {
          instance.destroy()
          return
        }

        reader.current = instance.view
        setChapters(instance.view.book.toc ?? [])
        setFixedLayout(Boolean(instance.view.isFixedLayout))
        setLoadState("ready")
      } catch (err) {
        cleanup?.()
        cleanup = undefined
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not open this book."
          )
          setLoadState("failed")
        }
      }
    }

    void open()
    return () => {
      cancelled = true
      reader.current = null
      reflow.current = null
      savePosition.current = () => {}
      cleanup?.()
    }
  }, [bookId, onInteraction])

  useEffect(() => {
    if (!ready || !container.current) return
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width)
      if (width > 0) setReaderWidth(width)
    })
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [ready])

  useEffect(() => {
    const view = reader.current
    if (!ready || !view || view.isFixedLayout) return
    const cfi =
      reflow.current?.view === view
        ? reflow.current.cfi
        : view.lastLocation?.cfi
    if (!cfi) {
      applyReaderSettings(view, appearance, fontUrl, palette, readerWidth)
      return
    }

    const token = ++reflowToken.current
    reflow.current = { view, cfi, token }
    applyReaderSettings(view, appearance, fontUrl, palette, readerWidth)
    const timer = window.setTimeout(() => {
      void view
        .goTo(cfi)
        .then(() => {
          if (reflow.current?.token !== token) return
          reflow.current = null
          const location = view.lastLocation
          if (location?.cfi && bookId) {
            const update: { cfi: string; progress?: number } = {
              cfi: location.cfi,
            }
            if (Number.isFinite(location.fraction)) {
              update.progress = Math.max(0, Math.min(1, location.fraction!))
              setProgress(update.progress)
            }
            setCurrentChapter(location.tocItem?.href)
            setChapterProgress(location.chapterFraction)
            savePosition.current({
              ...update,
              status: statusAfterProgress(
                book?.status ?? "Unread",
                update.progress ?? book?.progress ?? 0
              ),
            })
          }
        })
        .catch(() => {
          if (reflow.current?.token === token) {
            reflow.current = null
            setError("Could not restore your place after changing settings.")
          }
        })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [ready, appearance, book, bookId, fontUrl, palette, readerWidth])

  return {
    book,
    chapters,
    chapterProgress,
    chapterNavigating,
    chaptersOpen,
    container,
    currentChapter,
    error,
    fixedLayout,
    loadState,
    moveChapter,
    progress,
    previousChapter,
    nextChapter,
    ready,
    setChaptersOpen,
    setSettingsOpen,
    setShowBar,
    settingsOpen,
    showBar,
    onInteraction,
  }
}
