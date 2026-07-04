# GitHub Pages setup

The public documentation site is the [`docs/`](../docs/) folder on `main`.

## Enable Pages

1. Open the repository on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose branch **main** and folder **/docs**.
4. Save. The site URL will be `https://atinagnihotri.github.io/journeys/` for this
   repo.

## How it works

- **`docs/index.html`** is the styled landing page (no build pipeline).
- **`docs/.nojekyll`** disables Jekyll so GitHub serves static HTML/CSS/JS as-is.
- Doc cards link to Markdown on the `main` branch, e.g.
  `https://github.com/AtinAgnihotri/journeys/blob/main/docs/01-architecture.md`.
- Internal maintainer docs live in [`internal/`](../internal/) and are not published
  to Pages.

## Local preview

Open `docs/index.html` in a browser, or serve the folder:

```bash
cd docs && python3 -m http.server 8080
```

Then visit `http://localhost:8080/`.
