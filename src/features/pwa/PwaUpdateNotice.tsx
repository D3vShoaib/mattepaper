import { useRegisterSW } from "virtual:pwa-register/react"
import { Button } from "@/components/ui/button"

export function PwaUpdateNotice() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 z-[60] flex w-[min(28rem,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg"
    >
      <span className="min-w-0 flex-1 text-balance">
        A new version of Mattepaper is available.
      </span>
      <Button
        size="sm"
        onClick={() => {
          void updateServiceWorker(true)
        }}
      >
        Update
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setNeedRefresh(false)}
      >
        Later
      </Button>
    </div>
  )
}
