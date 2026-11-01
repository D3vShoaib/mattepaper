import { db } from "@/db"

export async function importFont(file: File) {
  const extension = file.name.toLowerCase().match(/\.(woff2?|ttf|otf)$/)?.[1]
  if (!extension || !file.size)
    throw new Error("Choose a TTF, OTF, WOFF, or WOFF2 font file.")
  const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer())
  const signature = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")
  if (
    !(
      {
        ttf: ["00010000", "74727565"],
        otf: ["4f54544f"],
        woff: ["774f4646"],
        woff2: ["774f4632"],
      } as Record<string, string[]>
    )[extension].includes(signature)
  )
    throw new Error("This file does not appear to be a valid font.")
  if (typeof FontFace !== "undefined") {
    const url = URL.createObjectURL(file)
    try {
      await new FontFace("MattepaperFontCheck", `url("${url}")`).load()
    } catch {
      throw new Error("This font could not be loaded by your browser.")
    } finally {
      URL.revokeObjectURL(url)
    }
  }
  const id = crypto.randomUUID()
  await db.fonts.add({
    id,
    name: file.name.replace(/\.(woff2?|ttf|otf)$/i, ""),
    data: file,
    importedAt: Date.now(),
  })
  return id
}
