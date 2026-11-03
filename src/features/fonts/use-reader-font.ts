import { useEffect, useState } from "react"
import { db } from "@/db"
import {
  BUNDLED_FONT_ID,
  BUNDLED_FONT_PATH,
  type ReaderSettings,
} from "@/features/reading/reader-settings"

export function useReaderFontUrl(settings: ReaderSettings) {
  const [font, setFont] = useState<{ id: string; url: string }>()
  const id = settings.font === "custom" ? settings.fontAssetId : null
  useEffect(() => {
    if (!id || id === BUNDLED_FONT_ID) return
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
  if (id === BUNDLED_FONT_ID)
    return new URL(BUNDLED_FONT_PATH, window.location.href).href
  return id && font?.id === id ? font.url : undefined
}
