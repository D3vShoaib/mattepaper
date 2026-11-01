import { useEffect, useMemo, useRef, useState } from "react"
import { GitbookIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router"
import { liveQuery } from "dexie"
import { Button } from "@/components/ui/button"
import { db, type Book } from "@/db"
import { importBook } from "@/features/library/import-book"
import { ViewOptionsDrawer } from "@/routes/bookshelf/components/ViewOptionsDrawer"
import {
  normalizeColumns,
  useBookshelfSettings,
} from "@/stores/bookshelf-settings"

function Cover({ book }: { book: Book }) {
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
    <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-secondary shadow-sm">
      {url ? (
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full flex-col justify-end bg-gradient-to-br from-primary/25 to-background p-4">
          <span className="line-clamp-4 font-heading text-lg font-medium">
            {book.title}
          </span>
          <span className="mt-2 text-xs text-muted-foreground">
            {book.author}
          </span>
        </div>
      )}
      {book.progress > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-background/60">
          <div
            className="h-full bg-primary"
            style={{ width: `${Math.min(100, book.progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function BookshelfPage() {
  const [books, setBooks] = useState<Book[]>()
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [importing, setImporting] = useState(false)
  const [search, setSearch] = useState("")
  const filter = useBookshelfSettings((state) => state.filter)
  const sort = useBookshelfSettings((state) => state.sort)
  const layout = useBookshelfSettings((state) => state.layout)
  const columns = useBookshelfSettings((state) => state.columns)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const subscription = liveQuery(() => db.books.toArray()).subscribe({
      next: setBooks,
      error: () =>
        setError(
          "Could not open your local library. Check your browser storage settings."
        ),
    })
    return () => subscription.unsubscribe()
  }, [])
  const visibleBooks = useMemo(
    () =>
      (books ?? [])
        .filter((book) => {
          const match = `${book.title} ${book.author}`
            .toLocaleLowerCase()
            .includes(search.trim().toLocaleLowerCase())
          const status =
            book.progress >= 0.99
              ? "Finished"
              : book.progress > 0
                ? "Reading"
                : "Unread"
          return match && (filter === "All" || filter === status)
        })
        .sort((a, b) =>
          sort === "Title"
            ? a.title.localeCompare(b.title)
            : sort === "Author"
              ? a.author.localeCompare(b.author)
              : sort === "Date imported"
                ? b.importedAt - a.importedAt
                : (b.lastReadAt ?? 0) - (a.lastReadAt ?? 0) ||
                  b.importedAt - a.importedAt
        ),
    [books, search, filter, sort]
  )

  async function handleImport(files: FileList | null) {
    if (!files?.length || importing) return
    setImporting(true)
    setError("")
    setNotice("")
    let imported = 0,
      duplicates = 0
    const failures: string[] = []
    for (const file of Array.from(files)) {
      try {
        if ((await importBook(file)) === "duplicate") duplicates++
        else imported++
      } catch {
        failures.push(file.name)
      }
    }
    if (imported || duplicates)
      setNotice(
        [
          imported
            ? `${imported} book${imported === 1 ? "" : "s"} imported`
            : "",
          duplicates ? `${duplicates} already in your library` : "",
        ]
          .filter(Boolean)
          .join(" · ")
      )
    if (failures.length)
      setError(
        `Could not import ${failures.join(", ")}. Check the EPUB file and available browser storage.`
      )
    setImporting(false)
  }
  const count = Number(normalizeColumns(columns))
  return (
    <section className="m-2 min-h-[calc(100svh-1rem)] rounded-xl bg-muted p-3 dark:bg-[color-mix(in_oklch,var(--background)_75%,var(--muted))]">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="relative min-w-0 flex-1 basis-48 sm:max-w-64">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            aria-label="Search books"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
        <ViewOptionsDrawer />
        <input
          ref={fileInput}
          type="file"
          accept=".epub,application/epub+zip"
          multiple
          className="sr-only"
          aria-label="Choose EPUB files"
          onChange={(e) => {
            void handleImport(e.target.files)
            e.target.value = ""
          }}
        />
        <Button
          size="lg"
          className="gap-2"
          aria-label="Import books"
          disabled={importing}
          onClick={() => fileInput.current?.click()}
        >
          <HugeiconsIcon icon={GitbookIcon} />
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-primary-foreground/30 sm:block"
          />
          <span className="hidden sm:inline">
            {importing ? "Importing…" : "Import"}
          </span>
        </Button>
      </div>
      <div aria-live="polite" className="mt-3 text-sm text-muted-foreground">
        {importing ? "Importing books…" : notice}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {!books && !error && (
        <div
          aria-label="Loading library"
          className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] animate-pulse rounded-md bg-secondary" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
      )}
      {books && books.length === 0 && !importing && (
        <div className="mx-auto flex min-h-[50vh] max-w-sm flex-col items-center justify-center text-center">
          <h1 className="font-heading text-xl font-medium">
            Your bookshelf is empty
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Import an EPUB to start reading. Your books are saved on this
            device.
          </p>
          <Button className="mt-5" onClick={() => fileInput.current?.click()}>
            Import an EPUB
          </Button>
        </div>
      )}
      {books && books.length > 0 && visibleBooks.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No books match your search or filter.
        </p>
      )}
      {books && visibleBooks.length > 0 && (
        <div
          className={
            layout === "Grid"
              ? "books-grid mt-6 grid gap-4 sm:gap-6"
              : "mt-6 flex flex-col gap-3"
          }
          style={
            layout === "Grid"
              ? ({ "--book-columns": count } as React.CSSProperties)
              : undefined
          }
        >
          {visibleBooks.map((book) => (
            <Link
              key={book.id}
              to={`/read/${book.id}`}
              className={
                layout === "Grid"
                  ? "min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  : "flex items-center gap-4 rounded-md p-2 outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
              }
            >
              <div className={layout === "List" ? "w-16 shrink-0" : ""}>
                <Cover book={book} />
              </div>
              <div className={layout === "Grid" ? "mt-2 min-w-0" : "min-w-0"}>
                <h2 className="truncate text-sm font-medium">{book.title}</h2>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {book.author}
                </p>
                {book.progress > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Math.round(book.progress * 100)}% read
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
