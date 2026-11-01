import { useState } from "react"
import { LogsIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { TocEntry } from "@/features/epub/foliate-adapter"

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
}: {
  chapters: TocEntry[]
  current?: string
  onNavigate: (href: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Table of contents"
          />
        }
      >
        <HugeiconsIcon icon={LogsIcon} />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(85vw,24rem)]">
        <SheetHeader>
          <SheetTitle className="text-base">Contents</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
          {chapters.length ? (
            <ChapterItems
              items={chapters}
              current={current}
              onSelect={(href) => {
                void onNavigate(href)
                  .then(() => setOpen(false))
                  .catch(() => {})
              }}
            />
          ) : (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              This book has no table of contents.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
