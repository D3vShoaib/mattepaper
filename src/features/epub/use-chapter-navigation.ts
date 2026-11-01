import { useMemo, useState, type RefObject } from "react"
import { navigableChapters } from "@/features/epub/chapters"
import type { ReaderView, TocEntry } from "@/features/epub/foliate-adapter"

/** Previous/next chapter lookup plus a guarded `moveTo` for the open reader. */
export function useChapterNavigation({
  reader,
  chapters,
  currentChapter,
  onError,
}: {
  reader: RefObject<ReaderView | null>
  chapters: TocEntry[]
  currentChapter?: string
  onError: (message: string) => void
}) {
  const [navigating, setNavigating] = useState(false)
  const entries = useMemo(() => navigableChapters(chapters), [chapters])
  const index = currentChapter
    ? entries.findIndex((entry) => entry.href === currentChapter)
    : -1
  const previous = index > 0 ? entries[index - 1] : undefined
  const next =
    index >= 0
      ? entries[index + 1]
      : !currentChapter
        ? entries[0]
        : undefined

  async function moveTo(href?: string) {
    const view = reader.current
    if (!href || !view || navigating) return
    setNavigating(true)
    try {
      const destination = await view.goTo(href)
      if (!destination) throw new Error("Unable to navigate")
    } catch {
      onError("Could not open that chapter.")
    } finally {
      setNavigating(false)
    }
  }

  return { previous, next, navigating, moveTo }
}
