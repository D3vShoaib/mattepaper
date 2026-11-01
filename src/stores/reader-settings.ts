import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ReaderFont = "serif" | "sans" | "custom"
export type TextAlignment = "start" | "center" | "end" | "justify"
export type ReadingMode = "paginated" | "scrolled"
export type ReaderColumns = "auto" | "1" | "2"
export type ReaderAction =
  "none" | "previous" | "next" | "toggle" | "contents" | "settings"
export type TapZone =
  "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center"
export type TapZoneKey = `${TapZone}Action`
export interface ReaderSettings {
  font: ReaderFont
  fontAssetId: string | null
  fontColor: string | null
  backgroundColor: string | null
  respectPublisherFormatting: boolean
  italic: boolean
  underline: boolean
  fontSmoothing: "system" | "antialiased"
  shadowEnabled: boolean
  shadowColor: string
  shadowX: number
  shadowY: number
  shadowBlur: number
  fontSize: number
  fontScale: number
  fontWeight: number
  lineHeight: number
  letterSpacing: number
  wordSpacing: number
  paragraphSpacing: number
  textIndent: number
  alignment: TextAlignment
  hyphenation: boolean
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  columnGap: number
  columns: ReaderColumns
  mode: ReadingMode
  topLeftAction: ReaderAction
  topRightAction: ReaderAction
  bottomLeftAction: ReaderAction
  bottomRightAction: ReaderAction
  centerAction: ReaderAction
}
export const defaultReaderSettings: ReaderSettings = {
  font: "serif",
  fontAssetId: null,
  fontColor: null,
  backgroundColor: null,
  respectPublisherFormatting: true,
  italic: false,
  underline: false,
  fontSmoothing: "system",
  shadowEnabled: false,
  shadowColor: "#000000",
  shadowX: 0,
  shadowY: 1,
  shadowBlur: 2,
  fontSize: 22,
  fontScale: 100,
  fontWeight: 400,
  lineHeight: 1.55,
  letterSpacing: 0,
  wordSpacing: 0,
  paragraphSpacing: 0.75,
  textIndent: 0,
  alignment: "start",
  hyphenation: false,
  marginTop: 20,
  marginRight: 20,
  marginBottom: 20,
  marginLeft: 20,
  columnGap: 24,
  columns: "1",
  mode: "paginated",
  topLeftAction: "none",
  topRightAction: "none",
  bottomLeftAction: "previous",
  bottomRightAction: "next",
  centerAction: "toggle",
}
const clamp = (
  value: unknown,
  min: number,
  max: number,
  fallback: number,
  precision = 1
) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.round(Math.min(max, Math.max(min, value)) * precision) / precision
    : fallback
const oneOf = <T extends string>(
  value: unknown,
  choices: readonly T[],
  fallback: T
): T => choices.find((choice) => choice === value) ?? fallback
export function normalizeReaderSettings(
  value: Partial<ReaderSettings> & { margin?: number }
): ReaderSettings {
  const defaults = defaultReaderSettings
  const oldMargin = typeof value.margin === "number" ? value.margin : undefined
  return {
    font: oneOf(value.font, ["sans", "serif", "custom"], defaults.font),
    fontAssetId:
      typeof value.fontAssetId === "string" &&
      /^[a-zA-Z0-9-]{1,80}$/.test(value.fontAssetId)
        ? value.fontAssetId
        : null,
    fontColor:
      typeof value.fontColor === "string" &&
      /^#[0-9a-f]{6}$/i.test(value.fontColor)
        ? value.fontColor.toLowerCase()
        : null,
    backgroundColor:
      typeof value.backgroundColor === "string" &&
      /^#[0-9a-f]{6}$/i.test(value.backgroundColor)
        ? value.backgroundColor.toLowerCase()
        : null,
    respectPublisherFormatting:
      typeof value.respectPublisherFormatting === "boolean"
        ? value.respectPublisherFormatting
        : defaults.respectPublisherFormatting,
    italic: typeof value.italic === "boolean" ? value.italic : defaults.italic,
    underline:
      typeof value.underline === "boolean"
        ? value.underline
        : defaults.underline,
    fontSmoothing: oneOf(
      value.fontSmoothing,
      ["system", "antialiased"],
      defaults.fontSmoothing
    ),
    shadowEnabled:
      typeof value.shadowEnabled === "boolean"
        ? value.shadowEnabled
        : defaults.shadowEnabled,
    shadowColor:
      typeof value.shadowColor === "string" &&
      /^#[0-9a-f]{6}$/i.test(value.shadowColor)
        ? value.shadowColor.toLowerCase()
        : defaults.shadowColor,
    shadowX: clamp(value.shadowX, -8, 8, defaults.shadowX),
    shadowY: clamp(value.shadowY, -8, 8, defaults.shadowY),
    shadowBlur: clamp(value.shadowBlur, 0, 16, defaults.shadowBlur),
    fontSize: clamp(value.fontSize, 14, 40, defaults.fontSize),
    fontScale: clamp(value.fontScale, 80, 150, defaults.fontScale),
    fontWeight:
      Math.round(clamp(value.fontWeight, 400, 700, defaults.fontWeight) / 100) *
      100,
    lineHeight: clamp(value.lineHeight, 1.1, 2.2, defaults.lineHeight, 100),
    letterSpacing: clamp(
      value.letterSpacing,
      -0.05,
      0.2,
      defaults.letterSpacing,
      100
    ),
    wordSpacing: clamp(value.wordSpacing, 0, 0.5, defaults.wordSpacing, 100),
    paragraphSpacing: clamp(
      value.paragraphSpacing,
      0,
      2,
      defaults.paragraphSpacing,
      100
    ),
    textIndent: clamp(value.textIndent, 0, 4, defaults.textIndent, 10),
    alignment: oneOf(
      value.alignment,
      ["start", "center", "end", "justify"],
      defaults.alignment
    ),
    hyphenation:
      typeof value.hyphenation === "boolean"
        ? value.hyphenation
        : defaults.hyphenation,
    marginTop: clamp(value.marginTop ?? oldMargin, 0, 96, defaults.marginTop),
    marginRight: clamp(
      value.marginRight ?? oldMargin,
      0,
      96,
      defaults.marginRight
    ),
    marginBottom: clamp(
      value.marginBottom ?? oldMargin,
      0,
      96,
      defaults.marginBottom
    ),
    marginLeft: clamp(
      value.marginLeft ?? oldMargin,
      0,
      96,
      defaults.marginLeft
    ),
    columnGap: clamp(value.columnGap, 0, 96, defaults.columnGap),
    columns: oneOf(value.columns, ["auto", "1", "2"], defaults.columns),
    mode: oneOf(value.mode, ["paginated", "scrolled"], defaults.mode),
    topLeftAction: oneOf(
      value.topLeftAction,
      ["none", "previous", "next", "toggle", "contents", "settings"],
      defaults.topLeftAction
    ),
    topRightAction: oneOf(
      value.topRightAction,
      ["none", "previous", "next", "toggle", "contents", "settings"],
      defaults.topRightAction
    ),
    bottomLeftAction: oneOf(
      value.bottomLeftAction,
      ["none", "previous", "next", "toggle", "contents", "settings"],
      defaults.bottomLeftAction
    ),
    bottomRightAction: oneOf(
      value.bottomRightAction,
      ["none", "previous", "next", "toggle", "contents", "settings"],
      defaults.bottomRightAction
    ),
    centerAction: oneOf(
      value.centerAction,
      ["none", "previous", "next", "toggle", "contents", "settings"],
      defaults.centerAction
    ),
  }
}
function normalizeOverrides(raw: unknown): Partial<ReaderSettings> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const input = raw as Partial<ReaderSettings> & { margin?: number }
  const normalized = normalizeReaderSettings(input)
  const result: Partial<ReaderSettings> = {}
  for (const key of Object.keys(
    defaultReaderSettings
  ) as (keyof ReaderSettings)[]) {
    if (
      Object.prototype.hasOwnProperty.call(input, key) ||
      (key.startsWith("margin") && typeof input.margin === "number")
    )
      Object.assign(result, { [key]: normalized[key] })
  }
  return result
}
interface Store {
  defaults: ReaderSettings
  books: Record<string, Partial<ReaderSettings>>
  updateDefaults: (update: Partial<ReaderSettings>) => void
  resetDefaults: () => void
  update: (bookId: string, update: Partial<ReaderSettings>) => void
  reset: (bookId: string) => void
  resetFields: (bookId: string, keys: (keyof ReaderSettings)[]) => void
}
export function effectiveReaderSettings(
  state: Pick<Store, "defaults" | "books">,
  bookId: string
): ReaderSettings {
  return { ...state.defaults, ...state.books[bookId] }
}
export type ReaderAppearance = Omit<ReaderSettings, TapZoneKey>
export function readerAppearance(settings: ReaderSettings): ReaderAppearance {
  return Object.fromEntries(
    Object.entries(settings).filter(([key]) => !key.endsWith("Action"))
  ) as ReaderAppearance
}
export const useReaderSettings = create<Store>()(
  persist(
    (set) => ({
      defaults: defaultReaderSettings,
      books: {},
      updateDefaults: (update) =>
        set((state) => ({
          defaults: normalizeReaderSettings({ ...state.defaults, ...update }),
        })),
      resetDefaults: () => set({ defaults: defaultReaderSettings }),
      update: (bookId, update) =>
        set((state) => ({
          books: {
            ...state.books,
            [bookId]: { ...state.books[bookId], ...normalizeOverrides(update) },
          },
        })),
      resetFields: (bookId, keys) =>
        set((state) => {
          const override = { ...state.books[bookId] }
          for (const key of keys) delete override[key]
          const books = { ...state.books }
          if (Object.keys(override).length) books[bookId] = override
          else delete books[bookId]
          return { books }
        }),
      reset: (bookId) =>
        set((state) => {
          const books = { ...state.books }
          delete books[bookId]
          return { books }
        }),
    }),
    {
      name: "mattepaper-reader-settings",
      version: 1,
      partialize: ({ defaults, books }) => ({ defaults, books }),
      migrate: (persisted) => persisted as Store,
      merge: (persisted, current) => {
        const raw =
          persisted && typeof persisted === "object"
            ? (persisted as {
                defaults?: Partial<ReaderSettings>
                books?: Record<string, unknown>
              })
            : {}
        const books: Record<string, Partial<ReaderSettings>> = {}
        if (raw.books && typeof raw.books === "object")
          for (const [id, value] of Object.entries(raw.books))
            books[id] = normalizeOverrides(value)
        return {
          ...current,
          defaults: normalizeReaderSettings(raw.defaults ?? {}),
          books,
        }
      },
    }
  )
)
