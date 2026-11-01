import { BookTile } from "./BookTile"

const block = "animate-pulse rounded bg-secondary-foreground/10"

export function BookSkeleton({ grid }: { grid: boolean }) {
  return (
    <BookTile
      grid={grid}
      className="animate-in duration-300 fade-in hover:bg-transparent"
      cover={<div className={`${block} aspect-[2/3] rounded-md`} />}
    >
      <div aria-hidden="true" className="space-y-2">
        <div className={`${block} h-3 w-3/4`} />
        <div className={`${block} h-3 w-1/2`} />
      </div>
    </BookTile>
  )
}
