import type { ReactNode } from "react"
import { cn } from "cn"

/**
 * Shared cover + text layout for every cell on the shelf (books, the import
 * tile and loading placeholders), in both grid and list modes.
 */
export function BookTile({
  grid,
  cover,
  children,
  className,
}: {
  grid: boolean
  cover: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        grid
          ? "relative min-w-0"
          : "relative flex items-center gap-4 rounded-md p-2 hover:bg-secondary",
        className
      )}
    >
      <div className={grid ? "relative" : "relative w-16 shrink-0"}>{cover}</div>
      <div className={grid ? "mt-2 min-w-0" : "min-w-0 flex-1"}>{children}</div>
    </div>
  )
}
