import { RefreshCcwIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"

export function ResetSetting({
  label,
  onReset,
}: {
  label: string
  onReset?: () => void
}) {
  if (!onReset) return null
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Reset ${label.toLowerCase()}`}
      title={`Reset ${label.toLowerCase()}`}
      className="shrink-0 text-muted-foreground"
      onClick={onReset}
    >
      <HugeiconsIcon icon={RefreshCcwIcon} />
    </Button>
  )
}
