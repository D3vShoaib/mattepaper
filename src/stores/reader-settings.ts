import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  defaultReaderSettings,
  normalizeReaderOverrides,
  normalizeReaderSettings,
  type ReaderSettings,
  type ReaderSettingsState,
} from "@/features/reading/reader-settings"

interface Store extends ReaderSettingsState {
  updateDefaults: (update: Partial<ReaderSettings>) => void
  resetDefaults: () => void
  resetAll: () => void
  update: (bookId: string, update: Partial<ReaderSettings>) => void
  reset: (bookId: string) => void
  resetFields: (bookId: string, keys: (keyof ReaderSettings)[]) => void
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
      resetAll: () => set({ defaults: defaultReaderSettings, books: {} }),
      update: (bookId, update) =>
        set((state) => ({
          books: {
            ...state.books,
            [bookId]: {
              ...state.books[bookId],
              ...normalizeReaderOverrides(update),
            },
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
            books[id] = normalizeReaderOverrides(value)

        return {
          ...current,
          defaults: normalizeReaderSettings(raw.defaults ?? {}),
          books,
        }
      },
    }
  )
)
