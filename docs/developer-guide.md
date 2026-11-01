# Developer guide

Selfreadme is a client-only single-page app: one HTML page, no backend, no accounts. This guide covers how to run it, how the code is organised, and how to change it safely.

- [Requirements](#requirements)
- [Scripts](#scripts)
- [Stack](#stack)
- [Project structure](#project-structure)
- [How the page fits together](#how-the-page-fits-together)
- [The markdown generator](#the-markdown-generator)
- [Saving and migrating profiles](#saving-and-migrating-profiles)
- [The README preview](#the-readme-preview)
- [Styling](#styling)
- [Adding a new section](#adding-a-new-section)
- [Testing and linting](#testing-and-linting)
- [Deployment](#deployment)

## Requirements

- [Node.js](https://nodejs.org) **22.18 or newer**. The tests run TypeScript files directly with Node's built-in type stripping, which is on by default from 22.18. (Vite alone would accept 20.19+.) CI uses Node 24.
- npm, which comes with Node.

## Scripts

```bash
npm install       # install dependencies
npm run dev       # start the dev server, usually at http://localhost:5173/
npm test          # run the generator tests
npm run lint      # lint src/ and tests/ with oxlint
npm run build     # type-check (tsc -b) and build to dist/
npm run preview   # serve the production build locally
```

`npm run build` fails on type errors, so it doubles as the type-check.

## Stack

| Concern | Tool |
| --- | --- |
| UI | [React](https://react.dev) 19 |
| Build and dev server | [Vite](https://vite.dev) 8 |
| Language | [TypeScript](https://www.typescriptlang.org) 7 |
| Styling | [Tailwind CSS](https://tailwindcss.com) 4 (editor), plain CSS (landing page) |
| Components | [shadcn/ui](https://ui.shadcn.com) on [Radix UI](https://www.radix-ui.com), icons from [Lucide](https://lucide.dev) |
| Markdown to HTML (preview only) | [marked](https://marked.js.org) |
| Preview styles | [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) |
| Tests | Node's built-in test runner (`node:test`) |
| Lint | [oxlint](https://oxc.rs) |

## Project structure

```text
index.html                  The only page; loads src/landing/main.tsx
vite.config.ts              Vite config: React, Tailwind, the @ alias, and a relative base for GitHub Pages
src/
  landing/
    main.tsx                Entry point: imports styles, sets the "js" and "dark" classes, renders <Landing />
    Landing.tsx             The whole page: hero, editor section, features, steps, FAQ, call to action, footer
    landing.css             Landing page styles, plus the editor's theme tokens
    img/                    Screenshots of the editor used on the page
  App.tsx                   The editor: <Editor /> and the shared useProfile() hook
  components/
    fields.tsx              Form building blocks: TextField, SelectField, ListEditor, MoveButtons
    ui/                     shadcn/ui components (accordion, alert-dialog, button, select, tabs, ...)
  lib/
    readme.ts               Profile types, defaults, presets and the markdown generator (no React)
    utils.ts                shadcn's cn() helper
  index.css                 Tailwind and shadcn theme
tests/
  readme.test.ts            Tests for src/lib/readme.ts
.github/workflows/
  deploy.yml                Test, build and publish to GitHub Pages on every push to master
PRODUCT.md                  Product context: users, purpose, principles
.agents/, .claude/          Design skills used while building the site (not part of the app)
```

## How the page fits together

`index.html` loads `src/landing/main.tsx`, which renders `Landing`. `Landing` owns the profile state through `useProfile()` and passes it to both the hero's live card and the `Editor`:

```tsx
const [p, setP] = useProfile()
// hero inputs call setP(...), and the editor gets the same state:
<Editor p={p} setP={setP} />
```

So typing a name in the hero updates the editor, and the other way round. Links like **Build my README** are anchors to `#editor`; there's no router.

`Editor` (in `src/App.tsx`) is the form plus the preview. It holds no profile state of its own: every change goes through `setP`, and the generated markdown is derived with `useMemo`.

## The markdown generator

`src/lib/readme.ts` is plain TypeScript with no React, so it can be tested directly with Node. Everything the README contains comes from here.

### The profile

```ts
interface Profile {
  settings: {
    badgeStyle: BadgeStyle          // 'for-the-badge' | 'flat' | 'flat-square' | 'plastic' | 'social'
    align: 'center' | 'left'
    order: SectionKey[]             // section order
    enabled: Record<SectionKey, boolean>
    titles: Record<SectionKey, string>  // section headings (and the views badge label)
  }
  intro: { name, title, avatar, about, location, working, learning, askMe, funFact }
  skills: Skill[]                   // { name, logo, color }
  projects: Project[]               // { name, url, description, tech }
  experience: Job[]                 // { role, company, start, end, description }
  certificates: Certificate[]       // { name, issuer, date, url }
  socials: Social[]                 // { type, url }, type is a key of SOCIALS
  snake: { username: string }       // GitHub username for the snake and the views counter
}
```

Sections are `intro`, `views`, `skills`, `projects`, `experience`, `certificates`, `socials` and `snake` (`SECTION_KEYS`).

### Main exports

| Export | What it does |
| --- | --- |
| `generateReadme(profile)` | Returns the README as a string: the enabled sections, in order, joined by blank lines |
| `defaultProfile()` | The example profile a new visitor starts with |
| `badgeUrl(label, logo, color, style)` | Builds a shields.io static badge URL |
| `githubUser(profile)` | The username for the snake and counter: the typed one, or the one in the GitHub social link |
| `mergeProfile(saved)` | Fills a saved profile with sections and settings added since it was stored |
| `applyVisitor(profile, name, user)` | Sets the name, and the username plus GitHub link, from the hero inputs |
| `SNAKE_WORKFLOW` | The GitHub Actions workflow users copy for the snake |
| `PRESETS`, `SOCIALS` | The 43 badge presets and 15 social platforms: label, Simple Icons slug, brand colour |
| `STORAGE_KEY`, `LEGACY_STORAGE_KEY` | Browser storage keys (see below) |

### Rules the generator follows

- **Each section is a function** in `SECTIONS`, taking the profile and the section's heading and returning markdown, or an empty string to skip the section.
- **Empty content is skipped.** A section with no usable entries returns nothing, and an entry missing its key field (project or certificate name, job role and company) is left out.
- **User text is escaped** wherever it goes into HTML attributes or tags (`esc()`), so a quote in a name can't break the README.
- **Usernames are validated** before they go into a URL: `githubUser()` only returns GitHub-legal names (letters, digits and hyphens, up to 39 characters).
- **Badges** follow shields.io's static-badge rules: `-` and `_` in labels are doubled, colours are reduced to six hex digits (falling back to `555555`), and the logo turns black on light colours so it stays readable.
- **LinkedIn's logo** is embedded as a data URI because shields.io no longer bundles it.
- **Output** is GitHub-flavoured markdown plus the small HTML subset GitHub allows: `<p align>`, `<h1 align>`, `<img>`, `<a>`, `<picture>`.

The views counter uses `https://komarev.com/ghpvc/`; the snake reads `https://raw.githubusercontent.com/<user>/<user>/output/github-contribution-grid-snake(-dark).svg`, which the user's workflow publishes.

## Saving and migrating profiles

`useProfile()` in `src/App.tsx` loads the profile from `localStorage` on start and writes it back after every change.

- The key is `selfreadme`. If it's missing, the app reads the old `gitfolio` key (from before the project was renamed), so existing visitors keep their work; the next save writes it under the new key.
- Saved profiles go through `mergeProfile()`, so a profile saved before a section existed gains that section, switched off and with its default heading, at the end of the order.
- If storage is blocked or the saved data is corrupt, the app starts from `defaultProfile()` instead of failing.

## The README preview

The preview renders inside a sandboxed `<iframe>` (`ReadmePreview` in `src/App.tsx`), the way GitHub isolates rendered content:

- The README's own `<h1>` and headings stay out of the page's heading outline.
- github-markdown-css styles apply without the page's resets leaking in.
- `sandbox="allow-same-origin allow-popups"` blocks any script in user-supplied HTML, while still letting the app update the frame and links open in new tabs.

The iframe is created once; on each change the app replaces its `<body>` contents, which keeps the scroll position while you type.

## Styling

Two style layers share one page:

- **`src/index.css`** is Tailwind plus the shadcn theme. The editor and its components use it.
- **`src/landing/landing.css`** styles the landing page with plain CSS and its own tokens (`--bg`, `--surface`, `--s0` to `--s4` for the plum-to-pink shades, `--pink`, five type steps).

Two details keep them from fighting:

1. The landing page's element resets (`button`, `a`, `h1`, ...) sit in Tailwind's `base` layer, so Tailwind utilities still win inside the editor.
2. The page is always dark: `main.tsx` adds the `dark` class to `<html>`, and `landing.css` maps shadcn's dark tokens (`--background`, `--primary`, ...) onto the plum palette. Dialogs and dropdowns render outside the editor, so this applies page-wide.

To add a shadcn component, run `npx shadcn@latest add <name>`. Components land in `src/components/ui/` and pick up the theme automatically.

## Adding a new section

Say you're adding a "Hobbies" section:

1. **`src/lib/readme.ts`**
   - Add `'hobbies'` to `SectionKey` and to `SECTION_KEYS` (its position there is its default order).
   - Add its data to `Profile` and to `defaultProfile()`.
   - Add defaults to `settings.enabled` and `settings.titles` in `defaultProfile()`.
   - Add a `hobbies(p, title)` function to `SECTIONS` that returns markdown, or `''` when there's nothing to show.
2. **`src/App.tsx`**
   - Add a name to `SECTION_NAMES` (used in **Layout & style**).
   - Add an `AccordionItem` with the fields, using `TextField`, `SelectField` or `ListEditor` from `src/components/fields.tsx`.
3. **`tests/readme.test.ts`:** add a test for the new output, including the empty case.

`mergeProfile()` gives existing saved profiles the new section automatically.

## Testing and linting

```bash
npm test
npm run lint
npm run build
```

The tests cover the generator: badge escaping and logo colour, section order and skipping, HTML escaping, username validation for the snake, migrating older saved profiles, the hero-to-editor carry-over, and the views counter.

Lint is scoped to `src/` and `tests/` because the design skills in `.agents/` and `.claude/` bring their own scripts.

UI behaviour (the editor, preview and dialogs) has no automated tests; check it in the browser with `npm run dev`.

## Deployment

The site is published to **<https://khryz-navarro.github.io/selfreadme/>** by `.github/workflows/deploy.yml`:

1. On every push to `master` (or a manual run from the **Actions** tab), the `build` job runs `npm ci`, `npm test` and `npm run build`.
2. If they pass, the `dist/` folder is uploaded and the `deploy` job publishes it to GitHub Pages.

A failing test or type error stops the deploy, so the live site keeps the last good version.

`vite.config.ts` sets `base: './'`, so asset paths are relative and the build works under GitHub Pages' `/selfreadme/` sub-path. Keep it if you move the site; it works on any host or path.

To check a production build locally:

```bash
npm run build
npm run preview
```
