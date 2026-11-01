import { useEffect, useRef, useState } from "react"
import { liveQuery } from "dexie"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { db, type FontAsset } from "@/db"
import { importFont } from "@/features/fonts/import-font"
import { ResetSetting } from "./ResetSetting"
import type { ReaderSettings } from "@/stores/reader-settings"

export function FontSelector({
  settings,
  onChange,
  onReset,
  disabled = false,
}: {
  settings: ReaderSettings
  onChange: (value: Partial<ReaderSettings>) => void
  onReset?: () => void
  disabled?: boolean
}) {
  const [fonts, setFonts] = useState<FontAsset[]>()
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const sub = liveQuery(() =>
      db.fonts.orderBy("importedAt").reverse().toArray()
    ).subscribe({
      next: setFonts,
      error: () => setError("Could not load saved fonts."),
    })
    return () => sub.unsubscribe()
  }, [])
  async function load(file: File | undefined) {
    if (!file || busy) return
    setBusy(true)
    setError("")
    try {
      const id = await importFont(file)
      onChange({ font: "custom", fontAssetId: id })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this font.")
    } finally {
      setBusy(false)
    }
  }
  const selected =
    settings.font === "custom" && settings.fontAssetId
      ? `font:${settings.fontAssetId}`
      : settings.font === "custom"
        ? "serif"
        : settings.font
  const missing =
    settings.font === "custom" &&
    settings.fontAssetId &&
    fonts &&
    !fonts.some((font) => font.id === settings.fontAssetId)
  const label =
    selected === "serif"
      ? "Serif"
      : selected === "sans"
        ? "Sans"
        : (fonts?.find((font) => `font:${font.id}` === selected)?.name ??
          (missing ? "Missing font" : "Loading font…"))
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm">Font family</span>
        <ResetSetting
          label="Font family"
          onReset={disabled ? undefined : onReset}
        />
      </div>
      <div className="flex gap-2">
        <Select
          value={selected}
          disabled={disabled}
          onValueChange={(value) => {
            if (!value) return
            if (value.startsWith("font:"))
              onChange({ font: "custom", fontAssetId: value.slice(5) })
            else if (value === "serif" || value === "sans")
              onChange({ font: value })
          }}
        >
          <SelectTrigger
            aria-label="Font family"
            className="h-8 min-w-0 flex-1"
          >
            <SelectValue>{label}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="sans">Sans</SelectItem>
            {fonts?.map((font) => (
              <SelectItem key={font.id} value={`font:${font.id}`}>
                {font.name}
              </SelectItem>
            ))}
            {settings.font === "custom" &&
              settings.fontAssetId &&
              (!fonts || missing) && (
                <SelectItem value={`font:${settings.fontAssetId}`} disabled>
                  {missing ? "Missing font" : "Loading font…"}
                </SelectItem>
              )}
          </SelectContent>
        </Select>
        <input
          ref={input}
          type="file"
          accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
          className="sr-only"
          aria-label="Choose font file"
          disabled={disabled}
          onChange={(event) => {
            void load(event.target.files?.[0])
            event.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
        >
          {busy ? "Loading…" : "Load font"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        TTF, OTF, WOFF, or WOFF2. Saved on this device.
      </p>
      {missing && (
        <p role="status" className="text-xs text-destructive">
          The saved font file is missing; the reader will use a serif font.
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
