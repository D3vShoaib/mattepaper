import { useRef, useState } from "react"
import { Search01Icon, Settings01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router"
import { cn } from "cn"
import { buttonVariants } from "@/components/ui/button"
import { navDirection } from "@/lib/nav-direction"
import { useLibrary } from "@/features/library/use-library"
import { useImportBooks } from "@/features/library/use-import-books"
import { PwaInstallButton } from "@/features/pwa/PwaInstallButton"
import { BookCard } from "@/routes/bookshelf/components/BookCard"
import { BookSkeleton } from "@/routes/bookshelf/components/BookSkeleton"
import { ImportTile } from "@/routes/bookshelf/components/ImportTile"
import { ViewOptionsDrawer } from "@/routes/bookshelf/components/ViewOptionsDrawer"
import {
  normalizeColumns,
  useBookshelfSettings,
} from "@/stores/bookshelf-settings"

export function BookshelfPage() {
  const [search, setSearch] = useState("")
  const filter = useBookshelfSettings((state) => state.filter)
  const sort = useBookshelfSettings((state) => state.sort)
  const layout = useBookshelfSettings((state) => state.layout)
  const columns = useBookshelfSettings((state) => state.columns)
  const fileInput = useRef<HTMLInputElement>(null)
  const {
    books,
    visibleBooks,
    error: libraryError,
  } = useLibrary({
    search,
    filter,
    sort,
  })
  const {
    importing,
    pending,
    notice,
    error: importError,
    importFiles,
  } = useImportBooks()
  const error = libraryError || importError

  const grid = layout === "Grid"
  const gridStyle = grid
    ? ({
        "--book-columns": Number(normalizeColumns(columns)),
      } as React.CSSProperties)
    : undefined

  return (
    <section className="bookshelf-shell mx-auto flex max-w-screen-xl flex-col px-4 py-4 sm:px-6">
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
        <Link
          to="/settings"
          viewTransition
          onClick={navDirection("forward")}
          aria-label="Settings"
          title="Settings"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-lg" })
          )}
        >
          <HugeiconsIcon icon={Settings01Icon} />
        </Link>
        <PwaInstallButton />
        <input
          ref={fileInput}
          type="file"
          accept=".epub,application/epub+zip"
          multiple
          className="sr-only"
          aria-label="Choose EPUB files"
          onChange={(e) => {
            void importFiles(e.target.files)
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
      {books && books.length > 0 && visibleBooks.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No books match your search or filter.
        </p>
      )}
      {books && (
        <div
          className={`${
            grid
              ? "books-grid mt-6 grid gap-4 sm:gap-6"
              : "mt-6 flex flex-col gap-3"
          } animate-in duration-300 fade-in`}
          style={gridStyle}
        >
          <ImportTile
            grid={grid}
            disabled={importing}
            onClick={() => fileInput.current?.click()}
          />
          {Array.from({ length: pending }, (_, i) => (
            <BookSkeleton key={`importing-${i}`} grid={grid} />
          ))}
          {visibleBooks.map((book) => (
            <BookCard key={book.id} book={book} grid={grid} />
          ))}
        </div>
      )}
    </section>
  )
}
