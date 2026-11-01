import Dexie, { type EntityTable } from "dexie"

export interface Book {
  id: string
  fingerprint: string
  title: string
  author: string
  importedAt: number
  lastReadAt?: number
  cfi?: string
  progress: number
  cover?: Blob
  fileName: string
  fileSize: number
}
export interface BookFile {
  id: string
  data: Blob
}

export interface FontAsset {
  id: string
  name: string
  data: Blob
  importedAt: number
}

export const db = new Dexie("mattepaper-library-v1") as Dexie & {
  books: EntityTable<Book, "id">
  bookFiles: EntityTable<BookFile, "id">
  fonts: EntityTable<FontAsset, "id">
}
db.version(1).stores({
  books: "id,&fingerprint,importedAt,lastReadAt",
  bookFiles: "id",
})

db.version(2).stores({
  books: "id,&fingerprint,importedAt,lastReadAt",
  bookFiles: "id",
  fonts: "id,importedAt",
})
