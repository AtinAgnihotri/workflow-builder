# GitHub Pages setup

The public documentation site is the [`docs/`](../docs/) folder on `main`.

## Enable Pages

1. Open the repository on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose branch **main** and folder **/docs**.
4. Save. The site URL will be `https://<username>.github.io/journeys/` for this
   repo.

## Notes

- `docs/_config.yml` sets GitHub-flavored Markdown rendering.
- Internal maintainer docs live in [`internal/`](../internal/) and are not published
  to Pages.
- After enabling, link the hosted URL from the root README.
