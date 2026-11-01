export type TapAction = "previous" | "next" | "toggle" | null

export function getTapAction(
  x: number,
  y: number,
  width: number,
  height: number
): TapAction {
  if (width <= 0 || height <= 0 || x < 0 || y < 0 || x > width || y > height)
    return null
  const horizontal = x / width
  const vertical = y / height
  if (
    horizontal >= 0.35 &&
    horizontal <= 0.65 &&
    vertical >= 0.35 &&
    vertical <= 0.65
  )
    return "toggle"
  if (vertical < 0.5) return null
  return horizontal < 0.5 ? "previous" : "next"
}

export function listenForReaderTaps(
  doc: Document,
  onAction: (action: Exclude<TapAction, null>) => void,
  host?: HTMLElement
) {
  let start: { x: number; y: number; time: number } | null = null
  const down = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) {
      start = null
      return
    }
    start = { x: event.clientX, y: event.clientY, time: Date.now() }
  }
  const click = (event: MouseEvent) => {
    const initial = start
    start = null
    if (
      !initial ||
      event.defaultPrevented ||
      event.button !== 0 ||
      Date.now() - initial.time > 600 ||
      Math.hypot(event.clientX - initial.x, event.clientY - initial.y) > 10
    )
      return
    const target = event.target
    if (
      target instanceof doc.defaultView!.Element &&
      target.closest(
        "a, button, input, select, textarea, [contenteditable], [role='button']"
      )
    )
      return
    const selection = doc.defaultView?.getSelection()
    if (selection && !selection.isCollapsed) return
    const frame = doc.defaultView?.frameElement
    const frameRect = frame?.getBoundingClientRect()
    const hostRect = host?.getBoundingClientRect()
    const action =
      frameRect && hostRect
        ? getTapAction(
            frameRect.left + event.clientX - hostRect.left,
            frameRect.top + event.clientY - hostRect.top,
            hostRect.width,
            hostRect.height
          )
        : getTapAction(
            event.clientX,
            event.clientY,
            doc.documentElement.clientWidth,
            doc.documentElement.clientHeight
          )
    if (action) onAction(action)
  }
  const cancel = () => {
    start = null
  }
  const keydown = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return
    const target = event.target
    if (
      target instanceof doc.defaultView!.Element &&
      target.closest("input, textarea, select, [contenteditable=true]")
    )
      return
    const action =
      event.key === "ArrowLeft"
        ? "previous"
        : event.key === "ArrowRight"
          ? "next"
          : event.key.toLowerCase() === "m"
            ? "toggle"
            : null
    if (action) {
      event.preventDefault()
      onAction(action)
    }
  }
  doc.addEventListener("keydown", keydown)
  doc.addEventListener("pointerdown", down)
  doc.addEventListener("pointercancel", cancel)
  doc.addEventListener("click", click)
  return () => {
    doc.removeEventListener("keydown", keydown)
    doc.removeEventListener("pointerdown", down)
    doc.removeEventListener("pointercancel", cancel)
    doc.removeEventListener("click", click)
  }
}
