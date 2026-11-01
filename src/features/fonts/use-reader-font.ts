import { useEffect, useState } from "react"
import { db } from "@/db"
import type { ReaderSettings } from "@/stores/reader-settings"

export function useReaderFontUrl(settings: ReaderSettings) {
  const [font, setFont] = useState<{ id: string; url: string }>()
  const id = settings.font === "custom" ? settings.fontAssetId : null
  useEffect(() => {
    if (!id) return
    let cancelled = false
    let objectUrl: string | undefined
    void db.fonts
      .get(id)
      .then((asset) => {
        if (cancelled || !asset) return
        objectUrl = URL.createObjectURL(asset.data)
        setFont({ id, url: objectUrl })
      })
      .catch(() => {
        /* The reader falls back to a bundled font if storage is unavailable. */
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id])
  return id && font?.id === id ? font.url : undefined
}
