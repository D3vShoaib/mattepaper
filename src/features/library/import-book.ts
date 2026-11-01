import { db } from "@/db"
import { parseEpub } from "@/features/epub/foliate-adapter"

export async function importBook(file: File) {
  if (!file.name.toLowerCase().endsWith(".epub"))
    throw new Error("Only EPUB files are supported.")
  const bytes = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
  const fingerprint = Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")
  if (await db.books.where("fingerprint").equals(fingerprint).first())
    return "duplicate" as const
  const metadata = await parseEpub(file)
  const id = crypto.randomUUID()
  await db.transaction("rw", db.books, db.bookFiles, async () => {
    await db.books.add({
      id,
      fingerprint,
      ...metadata,
      fileName: file.name,
      fileSize: file.size,
      importedAt: Date.now(),
      progress: 0,
    })
    await db.bookFiles.add({ id, data: file })
  })
  return "imported" as const
}
