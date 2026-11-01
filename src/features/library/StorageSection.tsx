import { useEffect, useState } from "react"
import { liveQuery } from "dexie"
import { DatabaseIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { SettingsGroup } from "@/components/settings-group"
import { db } from "@/db"
import { formatBytes } from "@/lib/format"

interface Usage {
  books: number
  bytes: number
  fonts: number
}

export function StorageSection() {
  const [usage, setUsage] = useState<Usage>()
  const [quota, setQuota] = useState<number>()

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
        books: books.length,
        bytes: bookBytes + fontBytes,
        fonts: fontBytes,
      }
    }).subscribe({ next: setUsage, error: () => setUsage(undefined) })
    void navigator.storage?.estimate?.().then(
      (estimate) => setQuota(estimate.quota),
      () => undefined
    )
    return () => subscription.unsubscribe()
  }, [])

  return (
    <SettingsGroup title="Storage">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <HugeiconsIcon icon={DatabaseIcon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {usage ? formatBytes(usage.bytes) : "Calculating…"}
          </p>
          <p className="text-xs text-muted-foreground">
            {usage
              ? `${usage.books} book${usage.books === 1 ? "" : "s"}${usage.fonts ? ` · fonts ${formatBytes(usage.fonts)}` : ""}${quota ? ` · ${formatBytes(quota)} available to the browser` : ""}`
              : "Stored on this device"}
          </p>
        </div>
      </div>
    </SettingsGroup>
  )
}
