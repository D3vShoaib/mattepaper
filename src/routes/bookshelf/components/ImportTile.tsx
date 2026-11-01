import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { BookTile } from "./BookTile"

export function ImportTile({
  grid,
  disabled,
  onClick,
}: {
  grid: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <BookTile
      grid={grid}
      className={disabled ? "opacity-50" : undefined}
      cover={
        <div className="flex aspect-[2/3] items-center justify-center rounded-md border border-dashed border-border bg-background/40 text-muted-foreground">
          <HugeiconsIcon icon={Add01Icon} className="size-6" />
        </div>
      }
    >
      <button
        type="button"
        aria-label="Add EPUB"
        disabled={disabled}
        onClick={onClick}
        className="absolute inset-0 z-[1] rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <h2 className="truncate text-sm font-medium">Add EPUB</h2>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        From your device
      </p>
    </BookTile>
  )
}
