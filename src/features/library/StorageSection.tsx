import { useEffect, useState } from "react"
import { liveQuery } from "dexie"
import { SettingsGroup } from "@/components/settings-group"
import { db, type Book } from "@/db"
import { formatBytes } from "@/lib/format"
import { storageTreemap } from "./storage-treemap"
import { StorageBookDialog } from "./StorageBookDialog"

interface Usage {
  books: Book[]
  bytes: number
  fonts: number
}

export function StorageSection() {
  const [usage, setUsage] = useState<Usage>()
  const [quota, setQuota] = useState<number>()
  const [selectedId, setSelectedId] = useState<string>()
  const [error, setError] = useState("")

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const [books, fonts] = await Promise.all([
        db.books.toArray(),
        db.fonts.toArray(),
      ])
      const fontBytes = fonts.reduce((sum, font) => sum + font.data.size, 0)
      const bookBytes = books.reduce(
        (sum, book) => sum + book.fileSize + (book.cover?.size ?? 0),
        0
      )
      return {
        books,
        bytes: bookBytes + fontBytes,
        fonts: fontBytes,
      }
    }).subscribe({
      next: (value) => {
        setUsage(value)
        setError("")
      },
      error: () =>
        setError(
          "Could not load storage usage. Check your browser storage settings."
        ),
    })
    void navigator.storage?.estimate?.().then(
      (estimate) => setQuota(estimate.quota),
      () => undefined
    )
    return () => subscription.unsubscribe()
  }, [])

  const books = usage?.books ?? []
  const bookById = new Map(books.map((book) => [book.id, book]))
  const selectedBook = selectedId ? bookById.get(selectedId) : undefined
  const tiles = storageTreemap([
    ...books.map((book) => ({
      id: book.id,
      bytes: book.fileSize + (book.cover?.size ?? 0),
    })),
    ...(usage?.fonts ? [{ id: "fonts", bytes: usage.fonts }] : []),
  ])

  return (
    <SettingsGroup title="Storage" hideTitle>
      <div className="flex items-baseline gap-4">
        <p className="min-w-0 flex-1 font-medium">
          {usage
            ? formatBytes(usage.bytes)
            : error
              ? "Unavailable"
              : "Calculating…"}
        </p>
        <p className="text-right text-xs text-muted-foreground">
          {usage &&
            `${books.length} book${books.length === 1 ? "" : "s"}${usage.fonts ? ` · ${formatBytes(usage.fonts)} fonts` : ""}`}
          {quota && (
            <span className="block">Browser quota {formatBytes(quota)}</span>
          )}
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {tiles.length > 0 ? (
        <>
          <div
            role="group"
            aria-label="Storage by size. Select a book for details."
            className="relative aspect-[16/7] overflow-hidden rounded-lg border border-border bg-background"
          >
            {tiles.map((tile, index) => {
              const book = bookById.get(tile.id)
              const label = book?.title ?? "Custom fonts"
              const style = {
                left: `${(tile.x / 640) * 100}%`,
                top: `${(tile.y / 280) * 100}%`,
                width: `${(tile.width / 640) * 100}%`,
                height: `${(tile.height / 280) * 100}%`,
                backgroundColor: `color-mix(in oklch, var(--primary) ${18 + (index % 5) * 9}%, var(--muted))`,
              }
              const content = (
                <span className="block min-w-0 overflow-hidden p-2 text-left">
                  <span className="block truncate text-xs font-medium">
                    {label}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] opacity-70">
                    {formatBytes(tile.bytes)}
                  </span>
                </span>
              )
              return book ? (
                <button
                  key={tile.id}
                  type="button"
                  style={style}
                  title={`${label} · ${formatBytes(tile.bytes)}`}
                  aria-label={`${label}, ${formatBytes(tile.bytes)}. View book details`}
                  className="absolute overflow-hidden border border-background/80 text-foreground transition-[filter] hover:brightness-110 focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  onClick={() => setSelectedId(book.id)}
                >
                  {content}
                </button>
              ) : (
                <div
                  key={tile.id}
                  style={style}
                  title={`${label} · ${formatBytes(tile.bytes)}`}
                  className="absolute overflow-hidden border border-background/80 text-foreground"
                >
                  {content}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Click a book to view details or delete it.
          </p>
        </>
      ) : (
        usage && (
          <p className="text-sm text-muted-foreground">
            No books or custom fonts stored yet.
          </p>
        )
      )}
      {selectedBook && (
        <StorageBookDialog
          key={selectedBook.id}
          book={selectedBook}
          onClose={() => setSelectedId(undefined)}
        />
      )}
    </SettingsGroup>
  )
}
