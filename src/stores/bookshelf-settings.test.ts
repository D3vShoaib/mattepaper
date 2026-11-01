// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { normalizeColumns, useBookshelfSettings } from "./bookshelf-settings"

beforeEach(() => {
  localStorage.clear()
  useBookshelfSettings.setState({
    filter: "All",
    sort: "Last read",
    layout: "Grid",
    columns: "4",
  })
})

describe("bookshelf settings", () => {
  it("persists and restores the view preferences", async () => {
    const settings = useBookshelfSettings.getState()
    settings.setFilter("Reading")
    settings.setSort("Author")
    settings.setLayout("List")
    settings.setColumns("6")
    const saved = localStorage.getItem("mattepaper-bookshelf-settings")!
    useBookshelfSettings.setState({
      filter: "All",
      sort: "Last read",
      layout: "Grid",
      columns: "4",
    })
    localStorage.setItem("mattepaper-bookshelf-settings", saved)
    await useBookshelfSettings.persist.rehydrate()
    expect(useBookshelfSettings.getState()).toMatchObject({
      filter: "Reading",
      sort: "Author",
      layout: "List",
      columns: "6",
    })
  })
  it("validates saved values and keeps columns within range", async () => {
    localStorage.setItem(
      "mattepaper-bookshelf-settings",
      JSON.stringify({
        state: { filter: "unknown", sort: "bad", layout: "bad", columns: "99" },
        version: 0,
      })
    )
    await useBookshelfSettings.persist.rehydrate()
    expect(useBookshelfSettings.getState()).toMatchObject({
      filter: "All",
      sort: "Last read",
      layout: "Grid",
      columns: "12",
    })
    expect(normalizeColumns("")).toBe("4")
    expect(normalizeColumns("-1")).toBe("4")
    expect(normalizeColumns("2.6")).toBe("3")
  })
})
