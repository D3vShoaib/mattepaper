import {
  AiVoiceIcon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
} from "@hugeicons/core-free-icons"
import { LibraryBigIcon } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router"
import { cn } from "cn"
import { Button, buttonVariants } from "@/components/ui/button"
import type { TocEntry } from "@/features/epub/foliate-adapter"
import { navigableChapters } from "@/features/epub/chapters"
import { navDirection } from "@/lib/nav-direction"
import { ChapterSheet } from "./ChapterSheet"
import { ReaderSettingsDrawer } from "./ReaderSettingsDrawer"
import { useAppSettings } from "@/stores/app-settings"
import { ReaderFullscreenButton } from "@/features/reading/ReaderFullscreenButton"

function ChapterStepButton({
  direction,
  target,
  disabled,
  onMove,
}: {
  direction: "previous" | "next"
  target?: TocEntry
  disabled: boolean
  onMove: (href?: string) => void
}) {
  const noun = direction === "previous" ? "Previous chapter" : "Next chapter"
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="size-10 rounded-full [&_svg]:size-5"
      aria-label={noun}
      title={target ? `${noun}: ${target.label}` : `No ${noun.toLowerCase()}`}
      disabled={!target || disabled}
      onClick={() => onMove(target?.href)}
    >
      <HugeiconsIcon
        icon={
          direction === "previous" ? ArrowLeftDoubleIcon : ArrowRightDoubleIcon
        }
      />
    </Button>
  )
}

/** Reader actions above the book, chapter navigation and progress below it. */
export function ReaderControls({
  visible,
  bookId,
  title,
  progress,
  fixedLayout,
  chapters,
  currentChapter,
  previousChapter,
  nextChapter,
  chapterNavigating,
  onMoveChapter,
  settingsOpen,
  onSettingsOpenChange,
  chaptersOpen,
  onChaptersOpenChange,
}: {
  visible: boolean
  bookId?: string
  title?: string
  progress?: number
  fixedLayout: boolean
  chapters: TocEntry[]
  currentChapter?: string
  previousChapter?: TocEntry
  nextChapter?: TocEntry
  chapterNavigating: boolean
  onMoveChapter: (href?: string) => void | Promise<void>
  settingsOpen: boolean
  onSettingsOpenChange: (open: boolean) => void
  chaptersOpen: boolean
  onChaptersOpenChange: (open: boolean) => void
}) {
  const showFullscreenButton = useAppSettings(
    (state) => state.showFullscreenButton
  )
  const chapterName = navigableChapters(chapters).find(
    (chapter) => chapter.href === currentChapter
  )?.label
  const percentage = Math.round(Math.max(0, Math.min(1, progress ?? 0)) * 100)
  return (
    <>
      {(visible || progress !== undefined) && (
        <div
          role="progressbar"
          aria-label="Chapter progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress === undefined ? undefined : percentage}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-0.5 bg-muted"
        >
          <div
            className="h-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      <nav
        aria-label="Reader actions"
        aria-hidden={!visible}
        inert={!visible}
        className={`pointer-events-none fixed inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 text-foreground transition-[translate,visibility] duration-200 motion-reduce:transition-none ${visible ? "visible translate-y-0" : "invisible -translate-y-full"}`}
      >
        <Link
          to="/"
          viewTransition
          onClick={navDirection("back")}
          aria-label="Back to bookshelf"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-lg" }),
            "pointer-events-auto size-12 shrink-0 rounded-full border-2 border-foreground/25 bg-background hover:bg-background dark:hover:bg-background [&_svg]:size-5"
          )}
        >
          <LibraryBigIcon className="size-5" />
        </Link>
        <div className="pointer-events-auto flex h-12 items-center gap-1 rounded-full border-2 border-foreground/25 bg-background px-1">
          {showFullscreenButton && <ReaderFullscreenButton />}
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="size-10 rounded-full [&_svg]:size-5"
            aria-label="AI voice (coming soon)"
            title="AI voice — coming soon"
            aria-disabled="true"
          >
            <HugeiconsIcon icon={AiVoiceIcon} className="size-5" />
          </Button>
          {bookId && (
            <ReaderSettingsDrawer
              bookId={bookId}
              fixedLayout={fixedLayout}
              open={settingsOpen}
              onOpenChange={(open) => {
                if (open) onChaptersOpenChange(false)
                onSettingsOpenChange(open)
              }}
            />
          )}
        </div>
      </nav>
      <nav
        aria-label="Chapter navigation"
        aria-hidden={!visible}
        inert={!visible}
        className={`fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background from-[4px] via-background/95 via-45% to-transparent pt-8 text-foreground transition-[translate,visibility] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${visible ? "visible translate-y-0" : "pointer-events-none invisible translate-y-full"}`}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          <ChapterStepButton
            direction="previous"
            target={previousChapter}
            disabled={chapterNavigating}
            onMove={(href) => void onMoveChapter(href)}
          />
          <span
            className="min-w-0 flex-1 truncate text-center text-xs text-muted-foreground"
            title={chapterName || title}
          >
            {chapterName || title}
            {progress !== undefined ? ` · ${percentage}%` : ""}
          </span>
          <ChapterStepButton
            direction="next"
            target={nextChapter}
            disabled={chapterNavigating}
            onMove={(href) => void onMoveChapter(href)}
          />
          <ChapterSheet
            open={chaptersOpen}
            onOpenChange={(open) => {
              if (open) onSettingsOpenChange(false)
              onChaptersOpenChange(open)
            }}
            chapters={chapters}
            current={currentChapter}
            onNavigate={async (href) => {
              await onMoveChapter(href)
            }}
          />
        </div>
      </nav>
    </>
  )
}
