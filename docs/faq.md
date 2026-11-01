# FAQ

## Using Selfreadme

### What is a GitHub profile README?

A file called `README.md` in a public repository named exactly like your username, for example `github.com/octocat/octocat`. GitHub shows it at the top of your profile, above your pinned repositories.

### Do I need to know markdown or HTML?

No. You fill in fields and tap badges; Selfreadme writes the markdown and the small bits of HTML GitHub allows for centring and badges. The **Markdown** tab shows the code if you're curious, but you never have to edit it.

### Is it free? Do I need an account?

It's free, and there's no account or sign-up. Open [the site](https://khryz-navarro.github.io/selfreadme/) and start typing.

### Where is my information stored?

Only in your own browser (its local storage). Nothing you type is sent to a Selfreadme server; there isn't one.

The preview does load images from other services, the same ones your finished profile uses:

- badges from **shields.io**
- the views counter from **komarev.com**, if you turn it on
- the snake from **raw.githubusercontent.com**, if you turn it on

### Can I use it on another device?

Not with your saved work yet: the profile lives in one browser and isn't synced. Your downloaded `README.md` works anywhere. Moving a profile between devices is on the [roadmap](roadmap.md).

### I cleared my browser data and my profile is gone.

Clearing site data, or using a private window, removes the saved profile, and it can't be recovered. If you published your README, it's still safe on GitHub. Keep a downloaded copy as a backup.

### How do I update my profile later?

Come back in the same browser, change what you need, download again, and replace `README.md` in your profile repository.

### What does Reset do?

It replaces everything you've entered with the example profile, after asking you to confirm. It can't be undone.

## Badges and add-ons

### A badge shows no logo.

The logo slug must match an icon that shields.io knows. Search [simpleicons.org](https://simpleicons.org) for the technology and use the lowercase slug from its page, such as `nodedotjs` for Node.js. Very new icons may not have reached shields.io yet.

### Why does the LinkedIn badge work when shields.io dropped its logo?

Selfreadme embeds the LinkedIn logo in the badge itself, so it still shows.

### My contribution snake doesn't show.

- The workflow must be committed to the profile repository (the one named like your username) at `.github/workflows/snake.yml`.
- It runs when you push to the `main` branch, every day, or by hand. If your default branch is called something else, open **Actions → Generate snake animation → Run workflow** once.
- Check the **Actions** tab for a failed run. The snake appears after the first successful run saves it to the `output` branch.
- Your GitHub username in Selfreadme must be right. The snake image is read from your own repository.

### The views counter says 1 (or a small number).

It starts at zero the first time it's loaded and counts every page load from then on, including your own visits and Selfreadme's preview. It isn't a count of unique visitors.

### Will the preview look exactly like GitHub?

Very close: it uses GitHub's markdown styles and only the HTML GitHub accepts. Small differences in fonts or spacing can come from your browser, and GitHub follows your light or dark theme.

## Known limits

- **One browser only.** Profiles aren't synced between devices or browsers.
- **No undo** for Reset.
- **JavaScript is required.** Without it, the page is blank.
- **Badge logos** are limited to the icons shields.io bundles.
- **Counter and snake colours** are fixed for now; colour options are on the [roadmap](roadmap.md).

Something else? [Open an issue](https://github.com/Khryz-Navarro/selfreadme/issues).
