import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { useShallow } from "zustand/react/shallow"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  Bookshelf01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChapterSheet } from "./components/ChapterSheet"
import { ReaderSettingsDrawer } from "./components/ReaderSettingsDrawer"
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
import { navigableChapters } from "@/features/epub/chapters"

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
  const [chapterNavigating, setChapterNavigating] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [readerWidth, setReaderWidth] = useState(() => window.innerWidth)
  const [progress, setProgress] = useState<number>()
  const [chapters, setChapters] = useState<TocEntry[]>([])
  const [currentChapter, setCurrentChapter] = useState<string>()
  const [fixedLayout, setFixedLayout] = useState(false)
  const settings = useReaderSettings(
    useShallow((state) => effectiveReaderSettings(state, bookId ?? ""))
  )
  const chapterEntries = useMemo(() => navigableChapters(chapters), [chapters])
  const chapterIndex = currentChapter
    ? chapterEntries.findIndex((entry) => entry.href === currentChapter)
    : -1
  const previousChapter =
    chapterIndex > 0 ? chapterEntries[chapterIndex - 1] : undefined
  const nextChapter =
    chapterIndex >= 0
      ? chapterEntries[chapterIndex + 1]
      : !currentChapter
        ? chapterEntries[0]
        : undefined
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
          ? effectiveReaderSettings(useReaderSettings.getState(), bookId ?? "")[
          `${interaction.zone}Action` as TapZoneKey
          ]
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
          effectiveReaderSettings(useReaderSettings.getState(), bookId)
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
      const action =
        event.key === "ArrowLeft"
          ? "previous"
          : event.key === "ArrowRight"
            ? "next"
            : event.key.toLowerCase() === "m"
              ? "toggle"
              : null
      if (action) {
        event.preventDefault()
        onInteraction({ type: "shortcut", action })
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onInteraction])

  async function moveChapter(href?: string) {
    const view = reader.current
    if (!href || !view || chapterNavigating) return
    setChapterNavigating(true)
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 160)
    })
    try {
      const destination = await view.goTo(href)
      if (!destination) throw new Error("Unable to navigate")
    } catch {
      setError("Could not open that chapter.")
    } finally {
      setChapterNavigating(false)
    }
  }
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
      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          role="status"
        >
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
          />
          <span>Opening book…</span>
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
        className={`min-h-0 flex-1 transition-opacity duration-150 ease-out motion-reduce:transition-none ${ready && !loading && !chapterNavigating ? "opacity-100" : "opacity-0"} ${ready && !loading && !chapterNavigating ? "" : "pointer-events-none"}`}
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
      <nav
        aria-label="Reader controls"
        aria-hidden={!ready || !showBar}
        inert={!ready || !showBar}
        className={`fixed inset-x-0 bottom-0 z-10 flex items-center gap-2 border-t border-border bg-background px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-foreground transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${ready && showBar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}
      >
          <Link
            to="/"
            aria-label="Back to bookshelf"
            className={`${buttonVariants({ variant: "outline", size: "icon-lg" })} shrink-0`}
          >
            <HugeiconsIcon icon={Bookshelf01Icon} />
          </Link>
          <ChapterSheet
            open={chaptersOpen}
            onOpenChange={setChaptersOpen}
            chapters={chapters}
            current={currentChapter}
            onNavigate={async (href) => {
              await moveChapter(href)
            }}
          />
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Previous chapter"
            title={
              previousChapter
                ? `Previous chapter: ${previousChapter.label}`
                : "No previous chapter"
            }
            disabled={!previousChapter || chapterNavigating}
            onClick={() => void moveChapter(previousChapter?.href)}
          >
            <HugeiconsIcon icon={ArrowLeftDoubleIcon} />
          </Button>
          <span className="min-w-0 flex-1 truncate text-center text-xs text-muted-foreground">
            {book?.title}
            {progress !== undefined ? ` · ${Math.round(progress * 100)}%` : ""}
          </span>
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Next chapter"
            title={
              nextChapter
                ? `Next chapter: ${nextChapter.label}`
                : "No next chapter"
            }
            disabled={!nextChapter || chapterNavigating}
            onClick={() => void moveChapter(nextChapter?.href)}
          >
            <HugeiconsIcon icon={ArrowRightDoubleIcon} />
          </Button>
          {bookId && (
            <ReaderSettingsDrawer
              bookId={bookId}
              fixedLayout={fixedLayout}
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
            />
          )}
      </nav>
    </section>
  )
}
