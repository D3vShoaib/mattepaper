import { useEffect, useMemo, useRef, useState } from "react"
import { navDirection } from "@/lib/nav-direction"
import { Add01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router"
import { liveQuery } from "dexie"
import { db, type Book } from "@/db"
import { importBook } from "@/features/library/import-book"
import { PwaInstallButton } from "@/features/pwa/PwaInstallButton"
import { ViewOptionsDrawer } from "@/routes/bookshelf/components/ViewOptionsDrawer"
import {
  normalizeColumns,
  useBookshelfSettings,
} from "@/stores/bookshelf-settings"

const MARQUEE_GAP = 32

function Marquee({ children }: { children: string }) {
  const box = useRef<HTMLDivElement>(null)
  const text = useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = useState(0)
  useEffect(() => {
    const measure = () => {
      if (!box.current || !text.current) return
      const width = text.current.getBoundingClientRect().width
      setOverflow(width > box.current.clientWidth + 1 ? width : 0)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (box.current) observer.observe(box.current)
    return () => observer.disconnect()
  }, [children])
  return (
    <div
      ref={box}
      className={`overflow-hidden whitespace-nowrap ${overflow ? "marquee-fade" : ""}`}
    >
      <div
        className={overflow ? "marquee-track flex w-max" : "flex w-max"}
        style={
          overflow
            ? ({
                "--marquee-distance": `-${overflow + MARQUEE_GAP}px`,
                "--marquee-duration": `${(overflow + MARQUEE_GAP) / 30}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <span ref={text}>{children}</span>
        {overflow > 0 && (
          <span aria-hidden="true" style={{ marginInlineStart: MARQUEE_GAP }}>
            {children}
          </span>
        )}
      </div>
    </div>
  )
}

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
        <span className="absolute bottom-2 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
          {Math.round(book.progress * 100)}%
        </span>
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

function BookSkeleton({ layout }: { layout: "Grid" | "List" }) {
  return (
    <div
      aria-hidden="true"
      className={
        layout === "Grid"
          ? "min-w-0 animate-in fade-in duration-300"
          : "flex animate-in items-center gap-4 p-2 duration-300 fade-in"
      }
    >
      <div className={layout === "List" ? "w-16 shrink-0" : ""}>
        <div className="aspect-[2/3] animate-pulse rounded-md bg-secondary-foreground/10" />
      </div>
      <div className={layout === "Grid" ? "mt-2 space-y-2" : "flex-1 space-y-2"}>
        <div className="h-3 w-3/4 animate-pulse rounded bg-secondary-foreground/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary-foreground/10" />
      </div>
    </div>
  )
}

export function BookshelfPage() {
  const [books, setBooks] = useState<Book[]>()
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [importing, setImporting] = useState(false)
  const [pendingImports, setPendingImports] = useState(0)
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
    setPendingImports(files.length)
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
      setPendingImports((n) => Math.max(0, n - 1))
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
    setPendingImports(0)
    setImporting(false)
  }
  const count = Number(normalizeColumns(columns))
  const loaded = Boolean(books)
  const gridClass =
    layout === "Grid"
      ? "books-grid mt-6 grid gap-4 sm:gap-6"
      : "mt-6 flex flex-col gap-3"
  const gridStyle =
    layout === "Grid"
      ? ({ "--book-columns": count } as React.CSSProperties)
      : undefined
  return (
    <section className="bookshelf-shell m-2 flex flex-col rounded-xl bg-muted p-3 dark:bg-[color-mix(in_oklch,var(--background)_75%,var(--muted))]">
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
        <PwaInstallButton />
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
      </div>
      <div aria-live="polite" className="mt-3 text-sm text-muted-foreground">
        {importing ? "Importing books…" : notice}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {loaded && books!.length > 0 && visibleBooks.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No books match your search or filter.
        </p>
      )}
      {loaded && (
        <div
          className={`${gridClass} animate-in duration-300 fade-in`}
          style={gridStyle}
        >
          <button
            type="button"
            disabled={importing}
            onClick={() => fileInput.current?.click()}
            className={
              layout === "Grid"
                ? "min-w-0 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                : "flex items-center gap-4 rounded-md p-2 text-left outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            }
          >
            <div className={layout === "List" ? "w-16 shrink-0" : ""}>
              <div className="flex aspect-[2/3] items-center justify-center rounded-md border border-dashed border-border bg-background/40 text-muted-foreground">
                <HugeiconsIcon icon={Add01Icon} className="size-6" />
              </div>
            </div>
            <div className={layout === "Grid" ? "mt-2 min-w-0" : "min-w-0"}>
              <h2 className="truncate text-sm font-medium">Add EPUB</h2>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                From your device
              </p>
            </div>
          </button>
          {Array.from({ length: pendingImports }, (_, i) => (
            <BookSkeleton key={`importing-${i}`} layout={layout} />
          ))}
          {visibleBooks.map((book) => (
            <Link
              key={book.id}
              to={`/read/${book.id}`}
              viewTransition
              onClick={navDirection("forward")}
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
                <h2 className="text-sm font-medium">
                  <Marquee>{book.title}</Marquee>
                </h2>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {book.author}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
