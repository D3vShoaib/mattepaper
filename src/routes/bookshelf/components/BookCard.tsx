import { Link } from "react-router"
import type { Book } from "@/db"
import { navDirection } from "@/lib/nav-direction"
import { BookCover } from "./BookCover"
import { BookMenu } from "./BookMenu"
import { BookTile } from "./BookTile"
import { Marquee } from "./Marquee"

export function BookCard({ book, grid }: { book: Book; grid: boolean }) {
  return (
    <BookTile
      grid={grid}
      cover={
        <>
          <BookCover book={book} />
          <BookMenu book={book} className="absolute right-1 bottom-2 z-10" />
        </>
      }
    >
      <Link
        to={`/read/${book.id}`}
        viewTransition
        onClick={navDirection("forward")}
        aria-label={`Read ${book.title}`}
        className="absolute inset-0 z-[1] rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <h2 className="text-sm font-medium">
        <Marquee>{book.title}</Marquee>
      </h2>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {book.author}
      </p>
    </BookTile>
  )
}
