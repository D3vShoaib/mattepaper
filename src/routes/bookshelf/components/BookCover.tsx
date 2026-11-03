import { useEffect, useState } from "react"
import type { Book } from "@/db"

export function BookCover({ book }: { book: Book }) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!book.cover) return
    const objectUrl = URL.createObjectURL(book.cover)
    // Object URLs are tied to the displayed cover and released when it changes.
    const frame = requestAnimationFrame(() => setUrl(objectUrl))
    return () => {
      cancelAnimationFrame(frame)
      URL.revokeObjectURL(objectUrl)
    }
  }, [book.cover])
  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-secondary">
      {url ? (
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full flex-col justify-end bg-secondary p-4">
          <span className="line-clamp-4 font-heading text-lg font-medium">
            {book.title}
          </span>
          <span className="mt-2 text-xs text-muted-foreground">
            {book.author}
          </span>
        </div>
      )}
      {book.progress > 0 && (
        <>
          <span className="absolute bottom-2 left-1 flex h-5 items-center rounded bg-background/80 px-1.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
            {Math.round(book.progress * 100)}%
          </span>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-background/60">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, book.progress * 100)}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}
