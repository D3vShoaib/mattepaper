export function navDirection(direction: "forward" | "back") {
  return () => {
    document.documentElement.dataset.nav = direction
  }
}
