import { create } from "zustand"
import { persist } from "zustand/middleware"

export const bookshelfFilters = [
  "All",
  "Unread",
  "Reading",
  "Finished",
] as const
export const bookshelfSorts = [
  "Last read",
  "Title",
  "Author",
  "Date imported",
] as const
export const bookshelfLayouts = ["List", "Grid"] as const

export type BookshelfFilter = (typeof bookshelfFilters)[number]
export type BookshelfSort = (typeof bookshelfSorts)[number]
export type BookshelfLayout = (typeof bookshelfLayouts)[number]

type Preferences = {
  filter: BookshelfFilter
  sort: BookshelfSort
  layout: BookshelfLayout
  columns: string
}
type BookshelfSettings = Preferences & {
  setFilter: (value: BookshelfFilter) => void
  setSort: (value: BookshelfSort) => void
  setLayout: (value: BookshelfLayout) => void
  setColumns: (value: string) => void
  resetAll: () => void
}

export function normalizeColumns(value: unknown): string {
  const parsed = Number(value)
  return String(
    Number.isFinite(parsed) && parsed > 0
      ? Math.min(12, Math.max(1, Math.round(parsed)))
      : 3
  )
}

export const useBookshelfSettings = create<BookshelfSettings>()(
  persist(
    (set) => ({
      filter: "All",
      sort: "Last read",
      layout: "Grid",
      columns: "3",
      setFilter: (filter) => set({ filter }),
      setSort: (sort) => set({ sort }),
      setLayout: (layout) => set({ layout }),
      setColumns: (columns) => set({ columns }),
      resetAll: () =>
        set({ filter: "All", sort: "Last read", layout: "Grid", columns: "3" }),
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
            bookshelfFilters.find((item) => item === saved.filter) ??
            current.filter,
          sort:
            bookshelfSorts.find((item) => item === saved.sort) ?? current.sort,
          layout:
            bookshelfLayouts.find((item) => item === saved.layout) ??
            current.layout,
          columns:
            saved.columns === undefined
              ? current.columns
              : normalizeColumns(saved.columns),
        }
      },
    }
  )
)
