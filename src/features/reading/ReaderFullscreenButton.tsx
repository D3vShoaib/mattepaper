import { useState, useSyncExternalStore } from "react"
import { FullScreenIcon, MinimizeScreenIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"

function subscribe(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange)
  return () => document.removeEventListener("fullscreenchange", onChange)
}

export function ReaderFullscreenButton() {
  const active = useSyncExternalStore(
    subscribe,
    () => Boolean(document.fullscreenElement),
    () => false
  )
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const supported = Boolean(
    document.fullscreenEnabled && document.documentElement.requestFullscreen
  )
  const label = active ? "Exit fullscreen" : "Enter fullscreen"

  async function toggle() {
    if (pending || !supported) return
    setPending(true)
    setError("")
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      setError(
        "Fullscreen was blocked by your browser. Tap the button to try again."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="size-10 rounded-full [&_svg]:size-5"
        aria-label={label}
        title={
          supported ? label : "Fullscreen is not supported by this browser"
        }
        aria-pressed={active}
        aria-disabled={!supported || pending}
        onClick={() => void toggle()}
      >
        <HugeiconsIcon
          icon={active ? MinimizeScreenIcon : FullScreenIcon}
          className="size-5"
        />
      </Button>
      {error && (
        <p
          role="alert"
          className="absolute top-full right-3 max-w-xs rounded-md bg-background p-3 text-xs text-destructive shadow-md"
        >
          {error}
        </p>
      )}
    </>
  )
}
