import { useEffect } from "react"
import type { ReaderInteraction } from "@/features/epub/reader-taps"

const shortcutActions: Record<string, "previous" | "next" | "toggle"> = {
  arrowleft: "previous",
  arrowright: "next",
  m: "toggle",
}

/** Arrow keys turn pages and M toggles the controls. */
export function useReaderShortcuts(
  onInteraction: (interaction: ReaderInteraction) => void
) {
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
      const action = shortcutActions[event.key.toLowerCase()]
      if (action) {
        event.preventDefault()
        onInteraction({ type: "shortcut", action })
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onInteraction])
}
