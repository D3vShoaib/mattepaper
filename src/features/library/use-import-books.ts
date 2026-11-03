import { useState } from "react"
import { importBook } from "@/features/library/import-book"

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`

export function useImportBooks() {
  const [importing, setImporting] = useState(false)
  const [pending, setPending] = useState(0)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  async function importFiles(files: FileList | null) {
    if (!files?.length || importing) return
    setImporting(true)
    setPending(files.length)
    setError("")
    setNotice("")
    let imported = 0
    const duplicates: string[] = []
    const failures: string[] = []
    for (const file of Array.from(files)) {
      try {
        if ((await importBook(file)) === "duplicate")
          duplicates.push(file.name.replace(/\.epub$/i, ""))
        else imported++
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not read this file."
        failures.push(`${file.name}: ${message}`)
      }
      setPending((n) => Math.max(0, n - 1))
    }
    if (imported || duplicates.length)
      setNotice(
        [
          imported ? `${plural(imported, "book")} imported` : "",
          duplicates.length === 1
            ? `“${duplicates[0]}” is already in your library`
            : duplicates.length
              ? `${duplicates.length} books are already in your library`
              : "",
        ]
          .filter(Boolean)
          .join(" · ")
      )
    if (failures.length) setError(`Could not import ${failures.join("; ")}`)
    setPending(0)
    setImporting(false)
  }

  return { importing, pending, notice, error, importFiles }
}
