import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { useShallow } from "zustand/react/shallow"
import { Button } from "@/components/ui/button"
import { ReaderControls } from "./components/ReaderControls"
import { useReaderFontUrl } from "@/features/fonts/use-reader-font"
import { useReaderPalette } from "@/features/reading/reader-palette"
import {
  effectiveReaderSettings,
  readerAppearance,
  type TapZoneKey,
  useReaderSettings,
} from "@/stores/reader-settings"
import { db, type Book } from "@/db"
import {
  applyReaderSettings,
  createReader,
  waitForReaderContent,
  type ReaderView,
  type TocEntry,
} from "@/features/epub/foliate-adapter"
import { getTapZone, type ReaderInteraction } from "@/features/epub/reader-taps"
import { useChapterNavigation } from "@/features/epub/use-chapter-navigation"
import { useReaderShortcuts } from "@/features/epub/use-reader-shortcuts"

const currentSettings = (bookId = "") =>
  effectiveReaderSettings(useReaderSettings.getState(), bookId)

export function ReaderPage() {
  const { bookId } = useParams()
  const container = useRef<HTMLDivElement>(null)
  const reader = useRef<ReaderView | null>(null)
  const reflow = useRef<{
    view: ReaderView
    cfi: string
    token: number
  } | null>(null)
  const reflowToken = useRef(0)
  const savePosition = useRef<
    (position: { cfi: string; progress?: number; lastReadAt?: number }) => void
  >(() => { })
  const [book, setBook] = useState<Book>()
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState("")
  const [showBar, setShowBar] = useState(true)
  const [chaptersOpen, setChaptersOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [readerWidth, setReaderWidth] = useState(() => window.innerWidth)
  const [progress, setProgress] = useState<number>()
  const [chapters, setChapters] = useState<TocEntry[]>([])
  const [currentChapter, setCurrentChapter] = useState<string>()
  const [fixedLayout, setFixedLayout] = useState(false)
  const settings = useReaderSettings(
    useShallow((state) => effectiveReaderSettings(state, bookId ?? ""))
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
  const colors = useReaderPalette()
  const fontUrl = useReaderFontUrl(settings)
  const appearance = useReaderSettings(
    useShallow((state) =>
      readerAppearance(effectiveReaderSettings(state, bookId ?? ""))
    )
  )
  const hasControlZone = (
    [
      "topLeftAction",
      "topRightAction",
      "bottomLeftAction",
      "bottomRightAction",
      "centerAction",
    ] as const
  ).some((key) => settings[key] === "toggle")
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

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined
    let write = Promise.resolve()
    savePosition.current = (position) => {
      if (!bookId) return
      write = write
        .then(() => db.books.update(bookId, position))
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
            setCurrentChapter(detail.tocItem?.href)
            savePosition.current({
              cfi: detail.cfi,
              progress: value,
              lastReadAt: Date.now(),
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
        setReady(true)
        setLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not open this book."
          )
          setLoading(false)
        }
      }
    }
    void open()
    return () => {
      cancelled = true
      reader.current = null
      reflow.current = null
      savePosition.current = () => { }
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
      applyReaderSettings(view, appearance, fontUrl, colors, readerWidth)
      return
    }
    const token = ++reflowToken.current
    reflow.current = { view, cfi, token }
    applyReaderSettings(view, appearance, fontUrl, colors, readerWidth)
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
            savePosition.current(update)
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
  }, [ready, appearance, bookId, fontUrl, colors, readerWidth])
  useReaderShortcuts(onInteraction)

  const navVisible = ready && showBar
  return (
    <section
      className="fixed inset-0 flex flex-col"
      style={{
        backgroundColor: settings.backgroundColor ?? colors.background,
        color: colors.foreground,
      }}
    >
      <p className="sr-only">
        Tap zones can be configured in reading settings. Use the arrow keys to
        turn pages and M to toggle controls.
      </p>
      {error && (
        <div
          role="alert"
          className="absolute inset-x-4 top-4 z-20 rounded-md bg-background p-3 text-center text-sm text-destructive"
        >
          {error}{" "}
          {!ready && (
            <Link to="/" className="ml-2 underline">
              Back to bookshelf
            </Link>
          )}
        </div>
      )}
      <div
        ref={container}
        className={`min-h-0 flex-1 transition-opacity duration-150 ease-out motion-reduce:transition-none ${ready && !loading ? "opacity-100" : "opacity-0"} ${ready && !loading ? "" : "pointer-events-none"}`}
        onClick={(event) => {
          if (event.target !== event.currentTarget || !ready) return
          const rect = event.currentTarget.getBoundingClientRect()
          const zone = getTapZone(
            event.clientX - rect.left,
            event.clientY - rect.top,
            rect.width,
            rect.height
          )
          if (zone) onInteraction({ type: "zone", zone })
        }}
      />
      {ready && !showBar && !hasControlZone && (
        <Button
          variant="secondary"
          className="fixed right-3 bottom-3 z-10"
          onClick={() => setShowBar(true)}
        >
          Show controls
        </Button>
      )}
      <ReaderControls
        visible={navVisible}
        bookId={bookId}
        title={book?.title}
        progress={progress}
        fixedLayout={fixedLayout}
        chapters={chapters}
        currentChapter={currentChapter}
        previousChapter={previousChapter}
        nextChapter={nextChapter}
        chapterNavigating={chapterNavigating}
        onMoveChapter={moveChapter}
        settingsOpen={settingsOpen}
        onSettingsOpenChange={setSettingsOpen}
        chaptersOpen={chaptersOpen}
        onChaptersOpenChange={setChaptersOpen}
      />
    </section>
  )
}
