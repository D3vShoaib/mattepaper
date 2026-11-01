# Mattepaper — Complete V1 Product & Technical Plan

V1 scope

React 19

Vite 8

Offline-first PWA

Mattepaper should be a beautiful, customizable, local-first EPUB reader with a polished bookshelf, responsive reading experience, reliable progress restoration, and full control over typography.

You already have a good foundation with React, Vite, Tailwind CSS 4, shadcn, Base UI, and Hugeicons. I would keep your current stack and avoid adding a backend for V1.

Your feature list covers most of the reading experience. The main things missing are file validation, duplicate detection, selected-text interactions, per-book settings, import/export integrity, keyboard controls, accessibility, and storage failure handling.

## 1. Final V1 scope

I would organize V1 into six modules rather than develop every setting as an independent feature.

01 — Reader Engine

EPUB loading, pagination, scroll mode, page-turn effects, chapters, links, text selection, navigation, reading progress.

02 — Typography & Appearance

Fonts, spacing, margins, themes, colors, background images, alignment, hyphenation, book-level overrides.

03 — Reading Interactions

Four customizable touch zones, long-press actions, selected-text toolbar, keyboard shortcuts, navigation chrome.

04 — Bookshelf & Library

Import, search, sort, filter, cover grids, progress overlays, pinning, book details, cover changes, removal.

05 — Reading Data

Bookmarks, table of contents, in-book search, reading history, automatic position restoration, optional highlights.

06 — Offline & PWA

IndexedDB storage, installable app, offline launches, backup and restore, storage warnings, data migrations.

## 2. Technology stack — what to use for each

| Area                 | Technology                            | Reason                                 |
| -------------------- | ------------------------------------- | -------------------------------------- |
| UI framework         | React 19 + TypeScript                 | Already installed                      |
| Build                | Vite 8                                | Already installed                      |
| UI primitives        | shadcn + Base UI                      | Already installed                      |
| Styling              | Tailwind CSS 4                        | Already installed                      |
| Icons                | Hugeicons                             | Already installed                      |
| EPUB engine          | Readest's Foliate.js fork             | Parsing, rendering, navigation         |
| Local database       | `dexie`                               | Typed IndexedDB access                 |
| Database React hooks | `dexie-react-hooks`                   | Reactive bookshelf queries             |
| App state            | `zustand`                             | Reader UI and temporary settings state |
| Routing              | `react-router`                        | Bookshelf, reader, settings routes     |
| PWA                  | `vite-plugin-pwa`                     | Manifest and service worker            |
| Backup               | `fflate`                              | Compressed portable backups            |
| Schema validation    | `zod`                                 | Validating saved and imported data     |
| Virtual bookshelf    | `@tanstack/react-virtual`             | Efficient rendering of large libraries |
| Testing              | `vitest`, Testing Library, Playwright | Logic, UI, browser behavior            |

You don't need Redux, Next.js, Supabase, a server-side EPUB parser, or a separate pagination engine.

Foliate.js has modular rendering, parsing, searching, progress tracking, and annotation overlays. Its Readest fork has also added advanced page-turn handling and improvements for very large chapters. [Engine source](https://github.com/readest/foliate-js?utm_source=chatgpt.com)

The PWA layer can use `vite-plugin-pwa`, while Dexie provides a convenient API over IndexedDB for storing books as binary objects and maintaining metadata.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com&sz=32)

GitHub+1

## 3. Reader settings — complete specification

These are settings for the actual EPUB content, not your shadcn application UI.

### 3.1 Typography

| Setting                | Implementation                         | V1      |
| ---------------------- | -------------------------------------- | ------- |
| Font family            | CSS `font-family`, local bundled fonts |         |
| Font size              | CSS `font-size`                        |         |
| Font scale             | Multiplier over base size              |         |
| Font color             | CSS `color`                            |         |
| Font weight / bold     | CSS `font-weight`                      |         |
| Italic                 | CSS `font-style`                       |         |
| Underline              | CSS `text-decoration`                  |         |
| Text shadow            | CSS `text-shadow`                      |         |
| Antialiasing           | Browser/font-rendering properties      | Limited |
| Letter spacing         | CSS `letter-spacing`                   |         |
| Word spacing           | CSS `word-spacing`                     |         |
| Line spacing           | CSS `line-height`                      |         |
| Paragraph spacing      | CSS paragraph margins                  |         |
| First-line indentation | CSS `text-indent`                      |         |
| Alignment              | Left, right, center, justify           |         |
| Hyphenation            | CSS `hyphens: auto`                    |         |
| Reset to defaults      | React settings layer                   |         |

Important technical decisions:

Font smoothing cannot be reliably switched across all browsers. `-webkit-font-smoothing` is nonstandard and mainly useful on macOS, so make it an experimental advanced setting or leave it to the browser.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.mozilla.org&sz=32)

MDN

Hyphenation depends on the book language and the browser's available dictionaries. Use the EPUB language metadata where possible and ensure the rendered document has a correct `lang` attribute.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.mozilla.org&sz=32)

MDN

For bold, italic, and underline, don't blindly transform every text element. That can destroy semantic emphasis, links, headings, and other book formatting. Have a Respect publisher formatting toggle, then allow stronger overrides in an advanced section.

### 3.2 Layout and pages

| Setting                     | V1 behavior                          |
| --------------------------- | ------------------------------------ |
| Left margin                 | Independent slider                   |
| Right margin                | Independent slider                   |
| Top margin                  | Independent slider                   |
| Bottom margin               | Independent slider                   |
| Link margins                | Optional convenience toggle          |
| Maximum reading width       | Prevent extra-long lines on desktop  |
| Single / double page        | Automatic or manual                  |
| Column gap                  | Space between pages in two-page mode |
| Reading direction           | Auto, LTR, RTL                       |
| Reading mode                | Paginated or continuous scroll       |
| Page animation              | None, slide, curl where supported    |
| Preserve position on resize | Restore current text anchor          |
| Show/hide header and footer | Independent toggles                  |

For the first release, support reflowable EPUBs well and handle fixed-layout books without forcing typography overrides that cannot apply.

### 3.3 Color and background

Paper

Night

Sage

Include built-in presets such as Paper, White, Sepia, Night, and Sage, plus a custom theme editor.

Custom options should include text color, background color, background image, image opacity, image sizing, image position, and optional texture.

For the background image, use a CSS layer behind the reading content. Store the uploaded texture locally. Avoid applying global CSS filters that recolor illustrations or book covers.

Separate two theme systems:

- App theme: Your shadcn style, neutral/blue accents, sidebar, dialogs, buttons.
- Reader theme: The book's font, colors, background, margins, and reading chrome.

Your screenshot's Mira style, IBM Plex Sans, Space Grotesk, Hugeicons, and small radius are good choices for the app UI. They should not automatically become the font or styling of every imported EPUB.

### 3.4 Settings inheritance

A crucial V1 feature is global defaults with per-book overrides, similar to Readest.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.readest.com&sz=32)

Readest Docs

Global reader defaults

Theme, typography, layout, gestures

Per-book overrides

Only values specifically changed for that book

Effective reading settings

Applied to Foliate.js

Use a persisted settings schema like this:

```

type ReaderSettings = {
  fontFamily: string;
  fontSize: number;
  fontScale: number;
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  fontColor: string;
  textShadow: string;
  letterSpacing: number;
  wordSpacing: number;
  lineHeight: number;
  paragraphSpacing: number;
  textIndent: number;
  alignment: "start" | "center" | "end" | "justify";
  hyphenation: boolean;

  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  maxContentWidth: number;
  columns: 1 | 2 | "auto";
  columnGap: number;
  mode: "paginated" | "scrolled";
  pageAnimation: "none" | "slide" | "curl";

  backgroundColor: string;
  backgroundImageId: string | null;
  backgroundOpacity: number;
  respectPublisherStyles: boolean;
};

// Global defaults are complete.
// Book overrides contain only changed properties.
type BookSettings = Partial<ReaderSettings>;

```

Treat this as a starting shape. For production, merge nested properties such as `margins` field by field rather than replacing the entire object.

Foliate's role: It renders the EPUB and manages layout. Your role: generate the correct styles and renderer configuration, apply them, and persist the preferences.

## 4. Reading interactions — touch zones

Your 2×2 touch-zone idea is worth including in V1.

Touch-zone editor — live example

2 × 2

Top left

TapPrevious page

Long holdOpen TOC

Top right

TapNext page

Long holdAdd bookmark

Bottom left

TapToggle toolbar

Long holdOpen settings

Bottom right

TapNext page

Long holdAdd bookmark

&#x20;Copy example zone configurationThis is an interactive configuration example, not yet connected to your app.

I would additionally support horizontal swipes, arrow keys, Space/Shift+Space, mouse-wheel scrolling in scroll mode, and Escape to close panels.

For long holds, use Pointer Events with a configurable delay around 450–600 ms and movement cancellation.

Important: Do not put an invisible overlay over the entire EPUB and intercept all pointer events. That can break text selection and links inside Foliate's content documents. Instead, use an interaction coordinator that respects text selection, clickable links, scrolling, and the current reader mode.

## 5. Reader header and footer

These should be user-configurable, not hardcoded.

13:44

Chapter 4 — The Journey

The room was quiet, and the afternoon light fell softly across the pages.\
\
&#x20; Every story has a beginning, but not every beginning feels like the start of something.

Chapter 42%

Book 37%

Conceptual reader preview. The time, percentages, and book content are illustrative.

Configure individual header/footer slots to display:

| Data                  | Source                                    |
| --------------------- | ----------------------------------------- |
| Time                  | JavaScript `Date` / `Intl.DateTimeFormat` |
| Battery level         | Battery Status API when available         |
| Book title            | EPUB metadata                             |
| Current chapter       | Foliate TOC/progress                      |
| Chapter progress      | Foliate section/TOC progress              |
| Overall book progress | Foliate progress                          |
| Current page          | Renderer state, when paginated            |
| Reading percentage    | Stored progress model                     |

Battery is only best-effort. `navigator.getBattery()` has limited browser availability and may be blocked. The UI should hide the battery indicator when unsupported, not display a fake value.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.mozilla.org&sz=32)

MDN

Also, book percentages may be approximate. For reflowable books, physical page numbers change when fonts, margins, and viewport dimensions change.

Use EPUB CFI for location restoration, not a visual page number.

## 6. Bookshelf — complete V1 specification

The bookshelf should work like a personal library, not just a list of uploaded files.

## My Library

All

Reading

Finished

Pinned

[Lot 584 - Austen (Jane). Pride and Prejudice, 1st](https://images.openai.com/static-rsc-4/oDmAU4NADr7swAKCt78HB4xjzea4b78BrZY-pc7Dy04zdYEZP8M-vywib1XUWMtbD3UHPIfHlNzdR0ToKcHWy7FX6vbgRBVN7IEZi86pP3QMboS3Q1l78oC-eE4kp_2hXAsmv15JtIrVziUYhbw1qQ-Yuw-ayGCLxgl03nY_cBA?purpose=inline)

Pride and Prejudice

Jane Austen

62%

[Frankenstein 1886 – Moons Rare Books](https://images.openai.com/static-rsc-4/I6jvPS7uX6R0pKZg2VmgqTLj12yHeujHs2Qdd38NvYrer8-W9gok4f3TZt7E1JFpHNdVi09q6hwDxjo2WdeME2UFzygLPQTJFJ-FW8q8BI0Hp4_JvbT4CotqEsK13zasDUQ3dIouBZLMZywozUUzqWopABrTHx7uEmPysjya7XQ?purpose=inline)

Frankenstein

Mary Shelley

18%

[Fitzgerald w Connecticut - wydawnictwoproby](https://images.openai.com/static-rsc-4/tIcxk1T5EIr0F_pHg2zFXjWdaeaxLuw1xl1oRdoTEhrIKzRnh6wR80DeTNk1AXpM43XqjLX5nfZl9S5oy7SoGIwe1Qxg1MCeB9DbSwSEwV1VlzdZ5itnc3w-kKsOQW6cP0Y8ZEhGBg8DRaGCCLMMMiAY3ag69AkcZ0vSL6gapgI?purpose=inline)

The Great Gatsby

F. Scott Fitzgerald

Finished

Visual direction for a responsive bookshelf, using illustrative books and progress values.

### Library functionality

| Feature              | What V1 should do                                      |
| -------------------- | ------------------------------------------------------ |
| Import               | One or multiple EPUB files                             |
| Drag and drop        | Import from desktop                                    |
| Import validation    | Detect unsupported, corrupted, or unreadable files     |
| Duplicate detection  | Warn or skip when a book is already imported           |
| Extract metadata     | Title, author, language, publisher, cover, description |
| Book search          | Search titles and authors                              |
| Sort                 | Title, author, imported date, last read                |
| Filter by status     | All, unread, reading, finished                         |
| Filter pinned        | Show pinned books                                      |
| Bookshelf layout     | Responsive cover grid                                  |
| Grid density         | Small, medium, large covers                            |
| Cover progress       | A thin progress bar                                    |
| Cover status         | New, Reading, Finished                                 |
| Continue reading     | Recently opened book section                           |
| Update cover         | Upload replacement cover image                         |
| Edit details         | Title, author and optional metadata overrides          |
| Pin/unpin            | Pin books to the top                                   |
| Mark finished/unread | Manual status overrides                                |
| Remove               | Confirmation dialog                                    |
| Book details         | Metadata, file size, date imported, last read          |
| Storage usage        | Total locally stored book data                         |
| Empty state          | A well-designed first-import experience                |

Your idea of `x × y` bookshelves should use a responsive CSS grid. The user can choose the density, while the number of columns adapts to screen width.

I would also add a Recently Reading row at the top, because this is one of the most useful shortcuts in an ebook reader.

### Cover overlay behavior

Keep reading statuses separate from progress.

- Unread: 0% or manually marked unread.
- Reading: Opened, not marked finished.
- Finished: Automatically suggested near the end, or manually selected.

Avoid assuming that reaching 98% always means the reader has finished. Some books contain large appendices, indexes, or endnotes. Let users override the status.

## 7. Navigation, search, and bookmarks

These need to be distinct modules.

| Feature                 | Foliate provides               | Your implementation                 |
| ----------------------- | ------------------------------ | ----------------------------------- |
| Table of contents       | TOC tree and destinations      | Sidebar tree UI                     |
| Go to chapter           | Navigation resolver            | Chapter click handling              |
| In-book search          | Search engine and results      | Search bar, result list, navigation |
| Position restoration    | Current CFI and navigation     | Save/load persisted CFI             |
| Bookmarks               | Position references            | Create, list, rename, remove        |
| Reading progress        | Section/book progress data     | Footer and bookshelf indicators     |
| Highlights              | Overlay and CFI infrastructure | Selection UI and persistence        |
| Notes                   | Text anchoring infrastructure  | Notes editor and persistence        |
| Back/forward navigation | Reader navigation history      | Toolbar controls                    |
| External links          | Link detection                 | Safe external navigation behavior   |

I recommend including basic highlights in V1 even though you didn't explicitly list them in your latest request. You're already supporting text selection for long-press actions, and highlight anchors fit naturally into the same CFI-based data model as bookmarks.

However, a full notebook, text annotation editor, and highlights export can be V1.1.

### Bookmark data

```
interface Bookmark {
  id: string;
  bookId: string;
  cfi: string;
  chapterTitle: string;
  label?: string;
  createdAt: number;
}
```

### Reading-position data

```
interface ReadingPosition {
  bookId: string;
  cfi: string;
  chapterIndex: number;
  chapterProgress: number;
  bookProgress: number;
  lastReadAt: number;
  completed: boolean;
}
```

Store both the CFI and the percentages.

The CFI is for returning to the exact passage. The percentages are useful for the bookshelf and for showing progress immediately before the engine has finished loading.

Save progress:

- On page change or chapter change.
- Debounced while continuously scrolling.
- On `visibilitychange` when the app becomes hidden.
- When closing the reader or switching books.

Do not depend on `beforeunload` alone; mobile browsers may terminate background pages without firing it.

## 8. Offline storage and backup

This is a foundational part of Mattepaper. I recommend treating it as a V1 requirement, not a later enhancement.

Import EPUB

Validate file, parse metadata, detect duplicate

IndexedDB via Dexie

Original EPUB Blob + metadata + cover + progress

Foliate.js

Open stored EPUB Blob without a network request

Reading UI

Offline reading, bookmarks, settings and progress

### Database design

I would use these Dexie tables:

| Table            | Stores                                         |
| ---------------- | ---------------------------------------------- |
| `books`          | ID, metadata, status, timestamps, pinned state |
| `bookFiles`      | Original EPUB `Blob`                           |
| `covers`         | Extracted or user-provided cover `Blob`        |
| `positions`      | Last CFI, chapter and progress                 |
| `bookmarks`      | CFI, label, chapter                            |
| `highlights`     | CFI range, selected text, color                |
| `readerSettings` | Global and book-level overrides                |
| `appSettings`    | Theme, grid density, gestures                  |
| `assets`         | Background textures and custom fonts           |
| `sessions`       | Optional reading history                       |

Keep the original EPUB file intact. Don't permanently rewrite the EPUB just because a user changes the cover, metadata, or reading font.

Use a stable internal `bookId` as the primary key. A content fingerprint can help detect duplicate imports, while the original file remains the source of truth.

### Offline PWA strategy

Use:

- Service worker: Cache the app shell, JavaScript, CSS, icons, and bundled fonts.
- IndexedDB: Store EPUBs and persistent application data.
- Browser storage APIs: Monitor estimated storage usage and request persistence.
- Install manifest: App name, standalone mode, icons, theme color, start URL.

A service worker alone doesn't make imported EPUBs persistent. Those files still need to be saved locally.

Browsers may evict locally stored data under storage pressure. `navigator.storage.persist()` can reduce that risk where permission is granted, but users must still be able to export backups.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.mozilla.org&sz=32)

MDN+1

### Backup and restore

Use a portable file format such as:

```
mattepaper-backup.zip
├── manifest.json
├── library.json
├── settings.json
├── positions.json
├── bookmarks.json
├── highlights.json
├── books/
│   ├── book-001.epub
│   └── book-002.epub
├── covers/
│   └── book-001.webp
└── assets/
    └── texture-001.webp
```

Backup should support full export and full restore, including books, covers, settings, bookmarks, highlights, and reading progress.

For V1, make restore validate the archive version and file integrity before changing the database. Implement transactional or staged import so a malformed backup doesn't leave a half-restored library.

Support merge and replace existing library as explicit choices.

For large libraries, make backup creation streaming or memory-conscious. A naive approach that loads all EPUBs and the entire compressed archive into RAM could crash a mobile browser.

## 9. Project structure

Keep Foliate isolated from the rest of your React application. This makes future engine updates much easier.

Yes. We should organize Mattepaper primarily by routes, with reusable features and services shared between them.

```
src/
├── app/
│   ├── router.tsx
│   └── App.tsx
│
├── routes/
│   ├── bookshelf/
│   │   ├── BookshelfPage.tsx
│   │   └── components/
│   ├── reader/
│   │   ├── ReaderPage.tsx
│   │   └── components/
│   └── settings/
│       ├── SettingsPage.tsx
│       └── components/
│
├── features/
│   ├── epub/         # Foliate adapter
│   ├── library/      # Import, books, metadata
│   ├── reading/      # Progress, bookmarks
│   └── backup/       # Export/restore
│
├── components/
│   └── ui/           # Shared shadcn components
├── db/               # Dexie
├── stores/           # Zustand
└── lib/
```

### Routes

| URL             | Purpose                         |
| --------------- | ------------------------------- |
| `/`             | Bookshelf                       |
| `/read/:bookId` | Reader                          |
| `/settings`     | Global app and reading defaults |

Reader-specific settings (fonts, margins, themes) should also open as a drawer inside `/read/:bookId`, without navigating away.

Rule: `routes/` owns pages and layouts; `features/` owns reusable business logic; `components/ui/` owns shared UI.

This is the structure for V1.

### The most important architectural rule

Do not spread Foliate.js APIs throughout your React components.

Build a `foliate-adapter.ts` that is the only place responsible for opening books, rendering, navigating, collecting current positions, applying styles, and handling engine events.

React should communicate with this adapter, not directly manipulate Foliate internals from dozens of components.

React + shadcn

Library, controls, appearance, bookmarks

Reader Controller / Foliate Adapter

Typed commands, events, lifecycle, style application

Foliate.js

Parsing, pagination, scroll, chapter navigation

This separation will also help with TypeScript because Foliate's interfaces are less stable and not as thoroughly typed as a typical React library.

## 10. Additional packages and initial setup

Your existing dependencies are sufficient for the UI. Start by adding only the core missing libraries.

```

# Core app dependencies
npm install dexie dexie-react-hooks zustand react-router zod fflate

# PWA support
npm install -D vite-plugin-pwa

# Foliate engine (source submodule)
git submodule add https://github.com/readest/foliate-js.git packages/foliate-js

# Testing
npm install -D vitest @testing-library/react @testing-library/user-event jsdom @playwright/test

```

Verify the latest `vite-plugin-pwa` compatibility with your Vite 8 installation before locking dependencies.

Add `@tanstack/react-virtual` when the bookshelf actually needs virtualization. It isn't necessary to display the first few dozen books.

You don't need to install a second ZIP-reading dependency for EPUB parsing: the Readest Foliate fork already contains its own ZIP handling.

## 11. Development roadmap

This is the order I'd build Mattepaper. Each phase should produce a working application rather than just a collection of isolated components.

Phase 1 — Foundation

Set up routes, layouts, Dexie schema, Foliate submodule, reader adapter, app and reader themes, and the PWA shell.

Exit condition: the empty bookshelf loads offline, and the reader can open a test EPUB.

Phase 2 — Core reading

Build the viewer, next/previous navigation, pagination, scroll mode, TOC, chapter display, progress computation, and position restoration.

Exit condition: importing, reading, refreshing, and reopening a book preserves its exact position.

Phase 3 — Typography and appearance

Implement font controls, alignment, hyphenation, spacing, margins, background customization, global and per-book settings, and reset behavior.

Exit condition: changing layout does not lose the current passage, including after reopening the book.

Phase 4 — Reading controls

Add 2×2 touch zones, long holds, keyboard shortcuts, page animations, hide/show chrome, battery/time indicators, and selected-text controls.

Exit condition: gestures, text selection, and embedded book links coexist without conflicts.

Phase 5 — Complete bookshelf

Build batch import, duplicate detection, search, filters, sorting, cover status overlays, pinning, book details, and editable metadata.

Exit condition: the user can manage a sizable offline library without losing previously saved book state.

Phase 6 — Bookmarks and search

Implement persistent bookmarks, in-book search results, search highlighting, and optional basic saved highlights.

Exit condition: a bookmark remains usable after changing fonts, margins, or screen orientation.

Phase 7 — Offline and backup

Finish PWA installation, offline file restoration, storage persistence checks, versioned backup/restore, import validation, and database migrations.

Exit condition: a complete library can be exported, restored to a fresh installation, and read offline.

Phase 8 — Release hardening

Test large EPUBs, malformed books, unsupported embedded content, storage limits, touch conflicts, screen readers, and browser compatibility.

Exit condition: the reader is reliable across your supported desktop and mobile browsers.

## 12. Essential V1 requirements you hadn't listed

These are the less visible features that make the difference between a demo and a reader people can actually rely on.

| Requirement                       | Why it matters                                                    |
| --------------------------------- | ----------------------------------------------------------------- |
| EPUB error handling               | Books can contain broken markup or unsupported content            |
| Duplicate detection               | Prevents unnecessary storage use                                  |
| Preserve semantic book formatting | Prevents user typography settings from breaking links or headings |
| Reflow position anchoring         | Font-size changes must not jump to another passage                |
| Custom-selection protection       | Touch gestures must not interfere with selectable text            |
| Safe external links               | Avoid uncontrolled navigation from an ebook                       |
| CSP for imported content          | EPUB documents may contain untrusted content                      |
| Object URL cleanup                | Prevents memory leaks during book changes                         |
| Storage quota handling            | Browser storage can fail or be cleared                            |
| Versioned migrations              | Future releases must preserve existing libraries                  |
| Keyboard accessibility            | Essential for desktop, keyboard and assistive use                 |
| Reduced-motion support            | Disable animation when preferred                                  |
| Mobile safe-area handling         | Prevent controls from overlapping notches and home indicators     |
| Error recovery                    | A failed book should not crash the entire app                     |

Foliate's own README specifically warns about scripting and untrusted EPUB content. Include a restrictive Content Security Policy and test content isolation rather than assuming the rendering engine makes every EPUB safe.

## 13. What I would deliberately exclude from V1

To keep this manageable, I would not include cloud synchronization, accounts, collaborative annotations, AI chat, dictionary integrations, TTS, PDF/MOBI/CBZ importing, OPDS catalogs, advanced notebook tools, or reading statistics dashboards yet.

The fork can help with several of these later, but supporting more file formats adds significant testing and interface complexity.

Start with DRM-free EPUB as the single supported format.

## 14. V1 acceptance checklist

Release readiness

0/15

Import one or multiple valid EPUBs and detect duplicates

Read downloaded books completely offline

Restore the exact reading position after refresh and app restart

Switch between paginated and scrolling modes

Apply and persist all V1 typography, layout, and theme settings

Keep global defaults separate from book overrides

Configure and use all four tap and long-hold zones

Display chapter/book progress and optional time/battery indicators

Search within a book and navigate via the table of contents

Create, navigate to, and remove bookmarks

Search, filter, sort, pin, edit, and remove bookshelf entries

Preserve cover and progress status on the bookshelf

Export a complete backup and restore it in a fresh browser profile

Handle broken books, storage failures, and unsupported browser APIs gracefully

Pass desktop and mobile interaction and accessibility tests

&#x20;Copy release checklist

## Final architecture recommendation

Keep Mattepaper simple at the architectural level, even though it has many customization options.

Mattepaper V1

Application

Vite + React + shadcn

Book engine

Readest Foliate.js fork

Storage

Dexie + IndexedDB

App state

Zustand

Offline app

Vite PWA

Server

None required

The first implementation milestone should be deliberately narrow: a bookshelf with an Import EPUB button, a working Foliate reader, a basic typography panel, and reliable position restoration using Dexie.

Once that works correctly, every other feature in this plan builds on a stable foundation. The hardest parts won't be the shadcn components — they'll be the interaction between pagination, dynamically changing typography, text selection, and persistent reading positions.
