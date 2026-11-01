import { useEffect, useState } from "react"

export function TapZoneGuide() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 3500)
    return () => window.clearTimeout(timer)
  }, [])
  if (!visible) return null
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 text-center text-xs text-white"
    >
      <div className="grid size-full grid-cols-2 grid-rows-2 opacity-35">
        <div className="grid place-items-center border border-white/40 bg-black/50">
          No action
        </div>
        <div className="grid place-items-center border border-white/40 bg-black/50">
          No action
        </div>
        <div className="grid place-items-center border border-white/40 bg-black/50">
          Previous page
        </div>
        <div className="grid place-items-center border border-white/40 bg-black/50">
          Next page
        </div>
      </div>
      <div className="absolute top-[35%] left-[35%] grid h-[30%] w-[30%] place-items-center rounded-lg border border-white/50 bg-black/70 px-2 opacity-45">
        Show / hide controls
      </div>
    </div>
  )
}
