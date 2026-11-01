import { create } from "zustand"
import { persist } from "zustand/middleware"

const filters = ["All", "Unread", "Reading", "Finished"] as const
const sorts = ["Last read", "Title", "Author", "Date imported"] as const
const layouts = ["List", "Grid"] as const

type Preferences = {
  filter: string
  sort: string
  layout: string
  columns: string
}
type BookshelfSettings = Preferences & {
  setFilter: (value: string) => void
  setSort: (value: string) => void
  setLayout: (value: string) => void
  setColumns: (value: string) => void
}

export function normalizeColumns(value: unknown): string {
  const parsed = Number(value)
  return String(
    Number.isFinite(parsed) && parsed > 0
      ? Math.min(12, Math.max(1, Math.round(parsed)))
      : 4
  )
}

export const useBookshelfSettings = create<BookshelfSettings>()(
  persist(
    (set) => ({
      filter: "All",
      sort: "Last read",
      layout: "Grid",
      columns: "4",
      setFilter: (filter) => set({ filter }),
      setSort: (sort) => set({ sort }),
      setLayout: (layout) => set({ layout }),
      setColumns: (columns) => set({ columns }),
    }),
    {
      name: "mattepaper-bookshelf-settings",
      partialize: ({ filter, sort, layout, columns }) => ({
        filter,
        sort,
        layout,
        columns: normalizeColumns(columns),
      }),
      merge: (persisted, current) => {
        const saved = (
          persisted && typeof persisted === "object" ? persisted : {}
        ) as Partial<Preferences>
        return {
          ...current,
          filter:
            filters.find((item) => item === saved.filter) ?? current.filter,
          sort: sorts.find((item) => item === saved.sort) ?? current.sort,
          layout:
            layouts.find((item) => item === saved.layout) ?? current.layout,
          columns:
            saved.columns === undefined
              ? current.columns
              : normalizeColumns(saved.columns),
        }
      },
    }
  )
)
