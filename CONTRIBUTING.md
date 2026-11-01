# Contributing to Selfreadme

Thanks for helping! Bug reports, ideas and pull requests are all welcome.

## Reporting a bug

[Open an issue](https://github.com/Khryz-Navarro/selfreadme/issues/new) and include:

- what you did, what you expected, and what happened instead
- your browser and device
- for wrong README output: the markdown from the editor's **Markdown** tab, or the part that's wrong

Please don't paste personal details you wouldn't want public; issues are visible to everyone.

## Suggesting a feature

Open an issue describing the problem it solves for someone making their first profile. Check the [roadmap](docs/roadmap.md) first, as it may already be planned.

## Making a change

### 1. Set up

You need Node.js 22.18 or newer.

```bash
git clone https://github.com/<your-username>/selfreadme.git   # your fork
cd selfreadme
npm install
npm run dev
```

The [developer guide](docs/developer-guide.md) explains how the code is organised.

### 2. Work on a branch

```bash
git checkout -b fix-badge-colours
```

Keep a pull request to one change. For anything large, such as a new section or a redesign, open an issue first so we can agree on the approach.

### 3. Follow the project's conventions

- **README output lives in `src/lib/readme.ts`** and stays free of React, so it can be tested directly.
- **Every change to README output gets a test** in `tests/readme.test.ts`, including what happens when fields are empty.
- **Escape user text** that goes into HTML (`esc()`), and validate anything that goes into a URL.
- **Reuse what's there:** form fields from `src/components/fields.tsx`, and shadcn/ui components from `src/components/ui/`. Add new ones with `npx shadcn@latest add <name>`.
- **Don't add a dependency** for something a few lines of code can do.
- **Keep the product principles** in [PRODUCT.md](PRODUCT.md): never require markdown, the preview must match GitHub, profile data never leaves the browser.
- **Accessibility:** controls need a visible label or an `aria-label`, and everything must work with the keyboard.

### 4. Check before you push

All three must pass. They're the same checks the deploy runs.

```bash
npm test
npm run lint
npm run build
```

Then try your change in the browser (`npm run dev`), at desktop and phone widths.

### 5. Open a pull request

- Describe what changed and why, and link the issue it fixes.
- Add a screenshot for anything visible.
- Write commit messages in the imperative mood ("Add hobbies section", not "Added hobbies section").

Once a pull request is merged into `master`, GitHub Actions deploys it to the live site automatically.

## Licence

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
