import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ReaderTheme = "night" | "paper" | "sepia"
export type ReaderFont = "serif" | "sans"
export interface ReaderSettings {
  theme: ReaderTheme
  font: ReaderFont
  fontSize: number
  lineHeight: number
  margin: number
}
export const defaultReaderSettings: ReaderSettings = {
  theme: "night",
  font: "serif",
  fontSize: 22,
  lineHeight: 1.55,
  margin: 20,
}
export const readerThemes: Record<
  ReaderTheme,
  { background: string; foreground: string; link: string }
> = {
  night: { background: "#151516", foreground: "#f2f1ef", link: "#b9c8ff" },
  paper: { background: "#f7f6f2", foreground: "#242321", link: "#304c9c" },
  sepia: { background: "#f0e6d2", foreground: "#40362a", link: "#654d87" },
}
const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback
export function normalizeReaderSettings(
  value: Partial<ReaderSettings>
): ReaderSettings {
  return {
    theme:
      value.theme === "paper" ||
      value.theme === "sepia" ||
      value.theme === "night"
        ? value.theme
        : defaultReaderSettings.theme,
    font:
      value.font === "sans" || value.font === "serif"
        ? value.font
        : defaultReaderSettings.font,
    fontSize: Math.round(
      clamp(value.fontSize, 14, 40, defaultReaderSettings.fontSize)
    ),
    lineHeight:
      Math.round(
        clamp(value.lineHeight, 1.1, 2.2, defaultReaderSettings.lineHeight) *
          100
      ) / 100,
    margin: Math.round(
      clamp(value.margin, 8, 64, defaultReaderSettings.margin)
    ),
  }
}
interface Store {
  books: Record<string, ReaderSettings>
  update: (bookId: string, update: Partial<ReaderSettings>) => void
  reset: (bookId: string) => void
}
export const useReaderSettings = create<Store>()(
  persist(
    (set) => ({
      books: {},
      update: (bookId, update) =>
        set((state) => ({
          books: {
            ...state.books,
            [bookId]: normalizeReaderSettings({
              ...defaultReaderSettings,
              ...state.books[bookId],
              ...update,
            }),
          },
        })),
      reset: (bookId) =>
        set((state) => {
          const books = { ...state.books }
          delete books[bookId]
          return { books }
        }),
    }),
    {
      name: "mattepaper-reader-settings",
      partialize: ({ books }) => ({ books }),
      merge: (persisted, current) => {
        const raw =
          persisted &&
          typeof persisted === "object" &&
          "books" in persisted &&
          persisted.books &&
          typeof persisted.books === "object"
            ? persisted.books
            : {}
        const books: Record<string, ReaderSettings> = {}
        for (const [id, value] of Object.entries(raw))
          if (value && typeof value === "object")
            books[id] = normalizeReaderSettings(
              value as Partial<ReaderSettings>
            )
        return { ...current, books }
      },
    }
  )
)
