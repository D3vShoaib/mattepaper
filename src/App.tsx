import { createBrowserRouter, Link, RouterProvider } from "react-router"
import { AppLayout } from "@/app/AppLayout"
import { BookshelfPage } from "@/routes/bookshelf/BookshelfPage"
import { ReaderPage } from "@/routes/reader/ReaderPage"
import { SettingsPage } from "@/routes/settings/SettingsPage"

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <BookshelfPage /> },
      { path: "read/:bookId", element: <ReaderPage /> },
      { path: "settings", element: <SettingsPage /> },
      {
        path: "*",
        element: (
          <section>
            <h1 className="font-heading text-3xl font-semibold">
              Page not found
            </h1>
            <Link to="/" className="mt-4 inline-block text-sm underline">
              Return to bookshelf
            </Link>
          </section>
        ),
      },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}

export default App
