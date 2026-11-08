# RYAR Gaming

The gaming archive integrated into the RYAR Canvas site. This is a Next.js 15 application exported as static files and mounted at `/gaming/`.

## Build

```bash
npm ci
npm run build
```

`npm run build` regenerates `public/data/feed.json` and `public/data/featured.json` from `data/content.json`, then writes the static export to `out/`. From the repository root, run `node scripts/assemble-site.mjs` to combine that export with the RYAR Canvas homepage into `site/`.

The app uses static article, category, game and topic pages. Search and feed pagination read the generated feed index in the browser, so no API server is needed. The app is configured with the `/gaming` base path for deployment alongside the agency site.

## Content and attribution

The archive was supplied from the RYAR Gaming export. Each story includes a link to its original GameSpot URL; GameSpot/Fandom and the listed authors retain attribution and rights to their content and imagery. Publication permission was confirmed by the site owner for this integration. Keep any applicable permission records with the project.
