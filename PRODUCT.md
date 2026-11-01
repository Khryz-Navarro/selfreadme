# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students, bootcamp graduates and junior developers setting up their first GitHub profile README, usually so their profile looks credible to recruiters and peers. Many are new to markdown, shields.io and GitHub's special profile repository, and have never written HTML.

## Product Purpose

Selfreadme turns a form into a finished GitHub profile `README.md`. The user fills in an introduction, tech stack, projects, optional work experience, certificates and social links; Selfreadme produces the markdown, badges and layout, previews it, and hands it over by copy or download. Success is a first-timer going from nothing to a polished profile README committed to their `<username>/<username>` repository without writing or editing a line of markdown.

## Positioning

- **Zero code, zero markdown.** Everything is forms, toggles and clicks. The generated markdown is available to inspect, never required.
- **Private, no sign-in.** Runs entirely in the browser; no account, and no profile data is sent to a Selfreadme server. Edits persist only in the user's own browser storage.
- **Faithful GitHub preview.** The preview should match what GitHub renders, so what the user approves is what visitors see.
- **Deep customisation.** Sections can be toggled, renamed and reordered; badge style and alignment are adjustable; badges and entries are fully editable.

## Operating Context

Typical session: open the site, replace the example profile with their own details, pick tech badges, check the preview, then download `README.md` or copy the markdown. The user then creates (or opens) a public repository named exactly like their GitHub username and commits the file there. Sessions are often one sitting, with return visits to update projects or skills.

Badges are images served by shields.io with Simple Icons logos; the preview and the final GitHub page both load them from shields.io at view time.

## Capabilities and Constraints

- Sections: Introduction, Tech stack badges, Projects, Work experience (optional), Certificates, Social links.
- Output is GitHub-flavoured markdown plus the small HTML subset GitHub allows (`<p align>`, `<img>`, `<a>`, `<h1 align>`).
- Badge logos are limited to icons shields.io bundles; LinkedIn is embedded as a data-URI logo because shields.io no longer ships it.
- Client-only static web app (React, Vite, Tailwind CSS, shadcn/ui). No backend.
- Shipping as a public website; hosting provider not yet chosen.
- Undecided: GitHub stats cards, JSON import/export of a profile, starting from a blank profile instead of the example.

## Brand Commitments

- Name: **Selfreadme**.

## Evidence on Hand

- The working app in `src/` with an example profile in `src/lib/readme.ts`.
- No users, testimonials, usage numbers, logo or brand assets exist yet; do not fabricate them.

## Product Principles

1. **Never require markdown.** Any feature that would make the user type syntax gets a form control instead.
2. **The preview is the promise.** If GitHub would render it differently, it is a bug.
3. **Their data stays theirs.** No accounts, no server storage, no tracking of profile content.
4. **Guide first-timers to done.** The path from empty to a committed README, including the special repository step, must be obvious to someone doing it for the first time.
5. **Customise without clutter.** Power options exist but stay out of the way of the default path.
