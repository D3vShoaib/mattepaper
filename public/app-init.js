;(function () {
  try {
    var stored = localStorage.getItem("theme")
    var dark =
      stored === "dark" ||
      (stored !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)

    document.documentElement.classList.add(dark ? "dark" : "light")
    document.documentElement.style.colorScheme = dark ? "dark" : "light"
  } catch {
    document.documentElement.classList.add("dark")
  }

  // Capture the event before React mounts so the install button never misses it.
  window.__pwaInstallPrompt = null
  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault()
    window.__pwaInstallPrompt = event
  })
})()
