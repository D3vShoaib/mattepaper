import { useMemo, useState } from "react"
import { LogsIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { TocEntry } from "@/features/epub/foliate-adapter"

function filterChapters(items: TocEntry[], query: string): TocEntry[] {
  return items.flatMap((item) => {
    const subitems = item.subitems
      ? filterChapters(item.subitems, query)
      : undefined
    const match = (item.label ?? "").toLocaleLowerCase().includes(query)
    return match || subitems?.length ? [{ ...item, subitems }] : []
  })
}

function ChapterItems({
  items,
  current,
  onSelect,
  depth = 0,
}: {
  items: TocEntry[]
  current?: string
  onSelect: (href: string) => void
  depth?: number
}) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${item.href ?? "section"}-${index}`}>
          {item.href ? (
            <button
              type="button"
              aria-current={current === item.href ? "location" : undefined}
              onClick={() => onSelect(item.href!)}
              className="w-full rounded-md px-3 py-2.5 text-left text-sm text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-[current=location]:bg-accent aria-[current=location]:font-medium"
              style={{ paddingInlineStart: `${12 + depth * 14}px` }}
            >
              {item.label || "Untitled section"}
            </button>
          ) : (
            <span
              className="block px-3 py-2 text-sm text-muted-foreground"
              style={{ paddingInlineStart: `${12 + depth * 14}px` }}
            >
              {item.label || "Untitled section"}
            </span>
          )}
          {item.subitems?.length ? (
            <ChapterItems
              items={item.subitems}
              current={current}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ) : null}
        </li>
      ))}
    </ul>
  )
}
export function ChapterSheet({
  chapters,
  current,
  onNavigate,
  open,
  onOpenChange,
}: {
  chapters: TocEntry[]
  current?: string
  onNavigate: (href: string) => Promise<void>
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [search, setSearch] = useState("")
  const query = search.trim().toLocaleLowerCase()
  const visible = useMemo(
    () => (query ? filterChapters(chapters, query) : chapters),
    [chapters, query]
  )
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setSearch("")
        onOpenChange(next)
      }}
    >
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Table of contents"
          />
        }
      >
        <HugeiconsIcon icon={LogsIcon} />
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[min(85vw,24rem)]"
      >
        <SheetHeader>
          <SheetTitle className="text-base">Contents</SheetTitle>
          <SheetDescription>
            {chapters.length
              ? "Jump to any chapter in this book."
              : "This book has no table of contents."}
          </SheetDescription>
        </SheetHeader>
        {chapters.length > 0 && (
          <div className="relative px-4">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-7 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label="Search chapters"
              placeholder="Search chapters..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 pl-9"
            />
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-2">
          {visible.length ? (
            <ChapterItems
              items={visible}
              current={current}
              onSelect={(href) => {
                void onNavigate(href)
                  .then(() => onOpenChange(false))
                  .catch(() => {})
              }}
            />
          ) : chapters.length ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No chapters match “{search.trim()}”.
            </p>
          ) : null}
        </div>
        <SheetFooter>
          <SheetClose render={<Button variant="outline">Close</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
