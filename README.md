# YalThundersWebsite

Static site for the Yal Thunders community with English and Turkish pages, academy content, and admin tooling.

## Local development
- Install dependencies: `npm ci`
- Run the Eleventy dev server: `npm run start`
- Build the static output: `npm run build` (outputs to `_site`)

## Deploying to GitHub Pages
- Push to the `main` branch to trigger `.github/workflows/deploy.yml`.
- The workflow installs dependencies, builds the Eleventy site, and publishes the `_site` folder to GitHub Pages via the official Pages actions.
- In repository settings, set **Pages** to use GitHub Actions as the source.
- If Contentful data is required, add `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` as repository secrets so the build step can fetch remote content.
