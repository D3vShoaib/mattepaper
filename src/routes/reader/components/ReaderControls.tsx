import {
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  Bookshelf01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import type { TocEntry } from "@/features/epub/foliate-adapter"
import { navDirection } from "@/lib/nav-direction"
import { ChapterSheet } from "./ChapterSheet"
import { ReaderSettingsDrawer } from "./ReaderSettingsDrawer"

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
      variant="outline"
      size="icon-lg"
      aria-label={noun}
      title={target ? `${noun}: ${target.label}` : `No ${noun.toLowerCase()}`}
      disabled={!target || disabled}
      onClick={() => onMove(target?.href)}
    >
      <HugeiconsIcon
        icon={direction === "previous" ? ArrowLeftDoubleIcon : ArrowRightDoubleIcon}
      />
    </Button>
  )
}

/** Bottom drawer with navigation, settings and contents. */
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
  return (
    <nav
      aria-label="Reader controls"
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-10 flex items-center gap-2 rounded-t-xl border-t border-border bg-background px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-foreground transition-[translate,visibility,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${visible ? "visible translate-y-0 shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)]" : "pointer-events-none invisible translate-y-full delay-[0s,300ms]"}`}
    >
      <Link
        to="/"
        viewTransition
        onClick={navDirection("back")}
        aria-label="Back to bookshelf"
        className={`${buttonVariants({ variant: "outline", size: "icon-lg" })} shrink-0`}
      >
        <HugeiconsIcon icon={Bookshelf01Icon} />
      </Link>
      {bookId && (
        <ReaderSettingsDrawer
          bookId={bookId}
          fixedLayout={fixedLayout}
          open={settingsOpen}
          onOpenChange={onSettingsOpenChange}
        />
      )}
      <ChapterStepButton
        direction="previous"
        target={previousChapter}
        disabled={chapterNavigating}
        onMove={(href) => void onMoveChapter(href)}
      />
      <span className="min-w-0 flex-1 truncate text-center text-xs text-muted-foreground">
        {title}
        {progress !== undefined ? ` · ${Math.round(progress * 100)}%` : ""}
      </span>
      <ChapterStepButton
        direction="next"
        target={nextChapter}
        disabled={chapterNavigating}
        onMove={(href) => void onMoveChapter(href)}
      />
      <ChapterSheet
        open={chaptersOpen}
        onOpenChange={onChaptersOpenChange}
        chapters={chapters}
        current={currentChapter}
        onNavigate={async (href) => {
          await onMoveChapter(href)
        }}
      />
    </nav>
  )
}
