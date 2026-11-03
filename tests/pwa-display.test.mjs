import assert from "node:assert/strict"
import test from "node:test"
import { isInstalledDisplay } from "../src/features/pwa/pwa-display.ts"

const browser = {
  standalone: false,
  fullscreen: false,
  javascriptFullscreen: false,
  iosStandalone: false,
}

test("installed fullscreen PWAs are detected alongside standalone apps", () => {
  assert.equal(isInstalledDisplay({ ...browser, fullscreen: true }), true)
  assert.equal(isInstalledDisplay({ ...browser, standalone: true }), true)
  assert.equal(isInstalledDisplay({ ...browser, iosStandalone: true }), true)
})

test("entering JavaScript fullscreen in a browser does not imply installation", () => {
  assert.equal(isInstalledDisplay(browser), false)
  assert.equal(
    isInstalledDisplay({
      ...browser,
      fullscreen: true,
      javascriptFullscreen: true,
    }),
    false
  )
  assert.equal(
    isInstalledDisplay({
      ...browser,
      standalone: true,
      fullscreen: true,
      javascriptFullscreen: true,
    }),
    true
  )
})
