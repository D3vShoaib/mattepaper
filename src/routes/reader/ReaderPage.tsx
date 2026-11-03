import type { CSSProperties } from "react"
import { Link, useParams } from "react-router"
import { LibraryBigIcon } from "lucide-react"
import { useShallow } from "zustand/react/shallow"
import { Button } from "@/components/ui/button"
import { getTapZone } from "@/features/epub/reader-taps"
import { useReaderFontUrl } from "@/features/fonts/use-reader-font"
import { useReaderPalette } from "@/features/reading/reader-palette"
import {
  effectiveReaderSettings,
  readerAppearance,
} from "@/features/reading/reader-settings"
import { useReaderSession } from "@/features/epub/use-reader-session"
import { useReaderSettings } from "@/stores/reader-settings"
import { ReaderControls } from "./components/ReaderControls"

export function ReaderPage() {
  const { bookId } = useParams()
  return <ReaderSession key={bookId ?? "missing"} bookId={bookId} />
}

function ReaderSession({ bookId }: { bookId?: string }) {
  const settings = useReaderSettings(
    useShallow((state) => effectiveReaderSettings(state, bookId ?? ""))
  )
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
  const {
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
    nextChapter,
    previousChapter,
    ready,
    setChaptersOpen,
    setSettingsOpen,
    setShowBar,
    settingsOpen,
    showBar,
    onInteraction,
  } = useReaderSession({
    bookId,
    appearance,
    fontUrl,
    palette: colors,
  })
  const navVisible = ready && showBar
  return (
    <section
      className="fixed inset-0 flex flex-col select-none [-webkit-touch-callout:none]"
      style={
        {
          "--background": settings.backgroundColor ?? colors.background,
          backgroundColor: settings.backgroundColor ?? colors.background,
          color: colors.foreground,
        } as CSSProperties
      }
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
            <Link
              to="/"
              className="ml-2 inline-flex items-center gap-1 underline"
            >
              <LibraryBigIcon className="size-4" aria-hidden="true" />
              Back to bookshelf
            </Link>
          )}
        </div>
      )}
      <div
        ref={container}
        className={`min-h-0 flex-1 transition-opacity duration-150 ease-out motion-reduce:transition-none ${ready ? "opacity-100" : "pointer-events-none opacity-0"}`}
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
      {loadState === "loading" && (
        <p
          role="status"
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-muted-foreground"
        >
          Opening book…
        </p>
      )}
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
        progress={chapterProgress}
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
