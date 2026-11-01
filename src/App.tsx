import { BrowserRouter, Link, Route, Routes } from "react-router"
import { AppLayout } from "@/app/AppLayout"
import { BookshelfPage } from "@/routes/bookshelf/BookshelfPage"
import { ReaderPage } from "@/routes/reader/ReaderPage"
import { SettingsPage } from "@/routes/settings/SettingsPage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<BookshelfPage />} />
          <Route path="read/:bookId" element={<ReaderPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<section><h1 className="font-heading text-3xl font-semibold">Page not found</h1><Link to="/" className="mt-4 inline-block text-sm underline">Return to bookshelf</Link></section>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
