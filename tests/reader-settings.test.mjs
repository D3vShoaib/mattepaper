import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  BUNDLED_FONT_ID,
  BUNDLED_FONT_PATH,
  defaultReaderSettings,
  effectiveReaderSettings,
  normalizeReaderOverrides,
  normalizeReaderSettings,
  readerAppearance,
} from "../src/features/reading/reader-settings.ts"

test("the default font is a bundled TrueType font, not a Windows shortcut", () => {
  assert.equal(BUNDLED_FONT_PATH, "/Libron-Regular.ttf")
  const font = readFileSync(
    new URL(`../public${BUNDLED_FONT_PATH}`, import.meta.url)
  )
  assert.equal(font.readUInt32BE(0), 0x00010000)
  assert.equal(normalizeReaderSettings({}).fontAssetId, BUNDLED_FONT_ID)
  assert.equal(
    normalizeReaderSettings({ fontAssetId: "uploaded-font" }).fontAssetId,
    "uploaded-font"
  )
  assert.equal(normalizeReaderSettings({ fontAssetId: null }).fontAssetId, null)
})

test("built-in reader defaults match the requested reading preset", () => {
  assert.deepEqual(defaultReaderSettings, {
    font: "custom",
    fontAssetId: BUNDLED_FONT_ID,
    fontColor: null,
    backgroundColor: "#1d1d1d",
    respectPublisherFormatting: false,
    italic: false,
    underline: false,
    fontSmoothing: "antialiased",
    shadowEnabled: true,
    shadowColor: "#000000",
    shadowX: 0,
    shadowY: 1,
    shadowBlur: 2,
    fontSize: 36,
    fontScale: 100,
    fontWeight: 400,
    lineHeight: 1.3,
    letterSpacing: 0,
    wordSpacing: 0,
    paragraphSpacing: 0.75,
    textIndent: 0,
    alignment: "justify",
    hyphenation: false,
    marginTop: 20,
    marginRight: 30,
    marginBottom: 20,
    marginLeft: 38,
    columnGap: 24,
    columns: "auto",
    mode: "scrolled",
    topLeftAction: "none",
    topRightAction: "none",
    bottomLeftAction: "previous",
    bottomRightAction: "next",
    centerAction: "toggle",
  })
  assert.deepEqual(normalizeReaderSettings({}), defaultReaderSettings)
})

test("saved preferences can still disable the custom background", () => {
  assert.equal(
    normalizeReaderSettings({ backgroundColor: null }).backgroundColor,
    null
  )
  assert.equal(
    normalizeReaderSettings({ backgroundColor: "#161618" }).backgroundColor,
    "#161618"
  )
})

test("normalizes invalid and out-of-range reader settings", () => {
  const settings = normalizeReaderSettings({
    fontSize: 100,
    fontColor: "red",
    lineHeight: 0,
    columns: "many",
  })

  assert.equal(settings.fontSize, 40)
  assert.equal(settings.fontColor, null)
  assert.equal(settings.lineHeight, 1.1)
  assert.equal(settings.columns, defaultReaderSettings.columns)
})

test("keeps legacy margin values and sparse book overrides", () => {
  const normalized = normalizeReaderSettings({ margin: 12 })
  assert.deepEqual(
    [
      normalized.marginTop,
      normalized.marginRight,
      normalized.marginBottom,
      normalized.marginLeft,
    ],
    [12, 12, 12, 12]
  )

  assert.deepEqual(normalizeReaderOverrides({ fontSize: 30 }), {
    fontSize: 30,
  })
  assert.deepEqual(normalizeReaderOverrides(null), {})
})

test("applies per-book settings without leaking tap actions into appearance", () => {
  const settings = effectiveReaderSettings(
    {
      defaults: defaultReaderSettings,
      books: { book: { fontSize: 30, centerAction: "settings" } },
    },
    "book"
  )

  assert.equal(settings.fontSize, 30)
  assert.equal(settings.lineHeight, defaultReaderSettings.lineHeight)
  assert.equal(readerAppearance(settings).fontSize, 30)
  assert.equal("centerAction" in readerAppearance(settings), false)
})
