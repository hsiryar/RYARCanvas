# RYAR Gaming

The gaming archive integrated into the RYAR Canvas site. This is a Next.js 15 application exported as static files and mounted at `/gaming/`.

## Build

```bash
npm ci
npm run build
```

`npm run build` regenerates `public/data/feed.json` and `public/data/featured.json` from `data/content.json`, then writes the static export to `out/`. From the repository root, run `node scripts/assemble-site.mjs` to combine that export with the RYAR Canvas homepage into `site/`.

The app uses static article, category, game and topic pages. Search reads the generated feed index; infinite feeds request small, build-generated card chunks as needed, so no API server is needed. The app is configured with the `/gaming` base path for deployment alongside the agency site.

## Archive content and provenance

The site owner confirms the archive is RYAR Gaming property and approves publication under RYAR Canvas. Original author and source URL fields remain in `data/content.json` for internal provenance but are omitted from the public story UI.
