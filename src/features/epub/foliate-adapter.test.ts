/// <reference types="node" />
// @vitest-environment jsdom
import { File as NodeFile, Blob as NodeBlob } from "node:buffer"
import { describe, expect, it } from "vitest"
import { strToU8, zipSync } from "fflate"
import { parseEpub } from "./foliate-adapter"

Object.assign(globalThis, { File: NodeFile, Blob: NodeBlob })

function sampleEpub() {
  const files = {
    mimetype: "application/epub+zip",
    "META-INF/container.xml": `<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="book.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
    "book.opf": `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">test-book</dc:identifier><dc:title>Test Book</dc:title><dc:creator>Test Author</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/></spine></package>`,
    "chapter.xhtml": `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Chapter</title></head><body><p>Hello world.</p></body></html>`,
  }
  const bytes = zipSync(
    Object.fromEntries(
      Object.entries(files).map(([name, value]) => [name, strToU8(value)])
    )
  )
  return new File([new Uint8Array(bytes).buffer], "test.epub", {
    type: "application/epub+zip",
  })
}

describe("EPUB parsing", () => {
  it("reads metadata from a real EPUB archive", async () => {
    expect(await parseEpub(sampleEpub())).toMatchObject({
      title: "Test Book",
      author: "Test Author",
    })
  })
  it("rejects a non-EPUB file", async () => {
    await expect(
      parseEpub(new File(["not a zip"], "bad.epub"))
    ).rejects.toThrow("not a valid EPUB")
  })
})

