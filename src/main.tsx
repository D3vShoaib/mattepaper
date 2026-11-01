import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)

const splash = document.getElementById("app-splash")

if (splash) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      splash.dataset.hidden = "true"
      const removeSplash = () => splash.remove()
      splash.addEventListener("transitionend", removeSplash, { once: true })
      window.setTimeout(removeSplash, 500)
    })
  })
}
