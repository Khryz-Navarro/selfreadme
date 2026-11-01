# Selfreadme

Build a GitHub profile `README.md` without writing markdown: fill in a form, watch the live preview, then copy or download the file.

Includes an introduction, tech-stack badges ([shields.io](https://shields.io) + [Simple Icons](https://simpleicons.org) logos), projects, optional work experience, certificates, and social links. Sections can be toggled, renamed and reordered; badge style and alignment are configurable. Your edits are saved in the browser.

## Run

```bash
npm install
npm run dev
```

`npm test` checks the markdown generator, `npm run build` makes a static build in `dist/`.

## Use the output

Create a public repository named exactly like your GitHub username and put the downloaded `README.md` in it.

Built with React, Vite, Tailwind CSS and shadcn/ui.
