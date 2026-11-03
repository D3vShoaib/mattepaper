import { Switch } from "@/components/ui/switch"
import { useAppSettings } from "@/stores/app-settings"

export function FullscreenSection() {
  const enabled = useAppSettings((state) => state.showFullscreenButton)
  const setEnabled = useAppSettings((state) => state.setShowFullscreenButton)
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <label htmlFor="reader-fullscreen" className="text-sm font-medium">
          Fullscreen button
        </label>
        <p
          id="reader-fullscreen-description"
          className="text-xs text-muted-foreground"
        >
          Add an enter/exit fullscreen button to the reader’s top bar. Requires
          browser support.
        </p>
      </div>
      <Switch
        id="reader-fullscreen"
        aria-describedby="reader-fullscreen-description"
        checked={enabled}
        onCheckedChange={setEnabled}
      />
    </div>
  )
}
