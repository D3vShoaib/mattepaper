import { useSyncExternalStore } from "react"
import { isInstalledDisplay } from "./pwa-display"

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
}

export type PwaInstallState = {
  canInstall: boolean
  installed: boolean
  isIos: boolean
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean }

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent | null
  }
}

const standaloneQuery = "(display-mode: standalone)"
const fullscreenQuery = "(display-mode: fullscreen)"
const listeners = new Set<() => void>()

let deferredPrompt: BeforeInstallPromptEvent | null = null
let installed = false
let installationConfirmed = false
let snapshot: PwaInstallState = {
  canInstall: false,
  installed: false,
  isIos: false,
}

function isStandalone() {
  if (typeof window === "undefined") return false

  return isInstalledDisplay({
    standalone: window.matchMedia(standaloneQuery).matches,
    fullscreen: window.matchMedia(fullscreenQuery).matches,
    javascriptFullscreen: Boolean(document.fullscreenElement),
    iosStandalone: (navigator as NavigatorWithStandalone).standalone === true,
  })
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false

  const userAgent = navigator.userAgent
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

function updateSnapshot() {
  const next: PwaInstallState = {
    canInstall: deferredPrompt !== null && !installed,
    installed,
    isIos: isIosDevice(),
  }

  if (
    next.canInstall === snapshot.canInstall &&
    next.installed === snapshot.installed &&
    next.isIos === snapshot.isIos
  ) {
    return
  }

  snapshot = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return snapshot
}

if (typeof window !== "undefined") {
  installed = isStandalone()
  deferredPrompt = window.__pwaInstallPrompt ?? null
  updateSnapshot()

  window.addEventListener("beforeinstallprompt", (event) => {
    const promptEvent = event as BeforeInstallPromptEvent
    promptEvent.preventDefault()
    deferredPrompt = promptEvent
    window.__pwaInstallPrompt = promptEvent
    updateSnapshot()
  })

  window.addEventListener("appinstalled", () => {
    installationConfirmed = true
    installed = true
    deferredPrompt = null
    window.__pwaInstallPrompt = null
    updateSnapshot()
  })

  const onDisplayChange = () => {
    installed = installationConfirmed || isStandalone()
    updateSnapshot()
  }
  window.matchMedia(standaloneQuery).addEventListener("change", onDisplayChange)
  window.matchMedia(fullscreenQuery).addEventListener("change", onDisplayChange)
  document.addEventListener("fullscreenchange", onDisplayChange)
}

export async function promptPwaInstall() {
  const prompt = deferredPrompt

  if (!prompt) return "unavailable" as const

  deferredPrompt = null
  window.__pwaInstallPrompt = null
  updateSnapshot()

  await prompt.prompt()
  const choice = await prompt.userChoice

  if (choice.outcome === "accepted") {
    installationConfirmed = true
    installed = true
    updateSnapshot()
  }

  return choice.outcome
}

export function usePwaInstall() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return { ...state, install: promptPwaInstall }
}
