import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChapterSheet } from "./components/ChapterSheet"
import { ReaderSettingsDrawer } from "./components/ReaderSettingsDrawer"
import { TapZoneGuide } from "./components/TapZoneGuide"
import {
  defaultReaderSettings,
  readerThemes,
  useReaderSettings,
} from "@/stores/reader-settings"
import { db, type Book } from "@/db"
import {
  applyReaderSettings,
  createReader,
  type ReaderView,
  type TocEntry,
} from "@/features/epub/foliate-adapter"
import { getTapAction, type TapAction } from "@/features/epub/reader-taps"

export function ReaderPage() {
  const { bookId } = useParams()
  const container = useRef<HTMLDivElement>(null)
  const reader = useRef<ReaderView | null>(null)
  const [book, setBook] = useState<Book>()
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState("")
  const [showBar, setShowBar] = useState(true)
  const [progress, setProgress] = useState<number>()
  const [chapters, setChapters] = useState<TocEntry[]>([])
  const [currentChapter, setCurrentChapter] = useState<string>()
  const [fixedLayout, setFixedLayout] = useState(false)
  const settings = useReaderSettings(
    (state) => state.books[bookId ?? ""] ?? defaultReaderSettings
  )
  const colors = readerThemes[settings.theme]

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined
    let write = Promise.resolve()
    const onTap = (action: Exclude<TapAction, null>) => {
      if (action === "toggle") setShowBar((visible) => !visible)
      else if (action === "previous")
        void reader.current
          ?.prev()
          .catch(() => setError("Could not turn the page."))
      else
        void reader.current
          ?.next()
          .catch(() => setError("Could not turn the page."))
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
            if (cancelled || !detail.cfi) return
            const value = Number.isFinite(detail.fraction)
              ? Math.max(0, Math.min(1, detail.fraction!))
              : storedBook.progress
            setProgress(value)
            setCurrentChapter(detail.tocItem?.href)
            write = write
              .then(() =>
                db.books.update(bookId, {
                  cfi: detail.cfi,
                  progress: value,
                  lastReadAt: Date.now(),
                })
              )
              .then(() => undefined)
              .catch(() => {
                if (!cancelled)
                  setError("Could not save your reading position.")
              })
          },
          onTap,
          useReaderSettings.getState().books[bookId] ?? defaultReaderSettings
        )
        if (cancelled) {
          instance.destroy()
          return
        }
        cleanup = instance.destroy
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
      cleanup?.()
    }
  }, [bookId])

  useEffect(() => {
    const view = reader.current
    if (!ready || !view || view.isFixedLayout) return
    const cfi = view.lastLocation?.cfi
    applyReaderSettings(view, settings)
    if (!cfi) return
    const frame = requestAnimationFrame(() => {
      void view
        .goTo(cfi)
        .catch(() =>
          setError("Could not restore your place after changing settings.")
        )
    })
    return () => cancelAnimationFrame(frame)
  }, [ready, settings])
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (event.target instanceof Element &&
          event.target.closest(
            "input, textarea, select, [contenteditable=true]"
          ))
      )
        return
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        void reader.current
          ?.prev()
          .catch(() => setError("Could not turn the page."))
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        void reader.current
          ?.next()
          .catch(() => setError("Could not turn the page."))
      } else if (event.key.toLowerCase() === "m") {
        event.preventDefault()
        setShowBar((visible) => !visible)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <section
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: colors.background, color: colors.foreground }}
    >
      <p className="sr-only">
        Tap the lower left or right of the page to turn pages. Tap the center to
        show or hide the controls. Use the arrow keys to turn pages and M to
        toggle controls.
      </p>
      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center text-sm text-white/60"
          role="status"
        >
          Opening book…
        </div>
      )}
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
        className={`min-h-0 flex-1 ${loading ? "invisible" : ""}`}
        onClick={(event) => {
          if (event.target !== event.currentTarget || !ready) return
          const rect = event.currentTarget.getBoundingClientRect()
          const action = getTapAction(
            event.clientX - rect.left,
            event.clientY - rect.top,
            rect.width,
            rect.height
          )
          if (action === "toggle") setShowBar((visible) => !visible)
          else if (action === "previous")
            void reader.current
              ?.prev()
              .catch(() => setError("Could not turn the page."))
          else if (action === "next")
            void reader.current
              ?.next()
              .catch(() => setError("Could not turn the page."))
        }}
      />
      {ready && <TapZoneGuide />}
      {ready && showBar && (
        <nav
          aria-label="Reader controls"
          className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 border-t border-white/10 bg-[#151516]/95 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-white"
        >
          <Link
            to="/"
            aria-label="Back to bookshelf"
            className={`${buttonVariants({ variant: "ghost", size: "icon-lg" })} shrink-0`}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Link>
          <ChapterSheet
            chapters={chapters}
            current={currentChapter}
            onNavigate={async (href) => {
              try {
                await reader.current?.goTo(href)
              } catch (err) {
                setError("Could not open that chapter.")
                throw err
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Previous page"
            onClick={() =>
              void reader.current
                ?.prev()
                .catch(() => setError("Could not turn the page."))
            }
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} />
          </Button>
          <span className="min-w-0 flex-1 truncate text-center text-xs text-white/70">
            {book?.title}
            {progress !== undefined ? ` · ${Math.round(progress * 100)}%` : ""}
          </span>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Next page"
            onClick={() =>
              void reader.current
                ?.next()
                .catch(() => setError("Could not turn the page."))
            }
          >
            <HugeiconsIcon icon={ArrowRight02Icon} />
          </Button>
          {bookId && (
            <ReaderSettingsDrawer bookId={bookId} fixedLayout={fixedLayout} />
          )}
        </nav>
      )}
    </section>
  )
}
