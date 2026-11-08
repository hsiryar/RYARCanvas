# RYARCanvas

Official website for RYAR Canvas Digital Agency, with the RYAR Gaming archive integrated into the homepage and published as a full static reader at `/gaming/`.

## Structure

- `index.html` — RYAR Canvas homepage, including a live three-story gaming feature.
- `ryargaming/` — Next.js source for the RYAR Gaming archive, its generated feed index, and the original publisher images.
- `scripts/assemble-site.mjs` — combines the existing agency homepage, root sitemap/robots file, and static gaming export into `site/`.
- `.github/workflows/pages.yml` — builds the static archive and deploys the combined site to GitHub Pages on pushes to `main`.

The gaming app is exported as static files under `/gaming/`, so it works with the repository's existing static-site setup. Infinite feeds, the games index, and search use a generated browser-side feed index rather than a server API.

## Analytics and privacy

Google Analytics 4 (`G-7D13KEC3K9`) is shared by the Canvas SPA and `/gaming/`. The tag loads only after a visitor accepts analytics; rejection keeps it disabled. Consent is stored in browser local storage and can be changed from the Privacy Policy or the Gaming footer. The Canvas SPA sends hash-route page views and selected, non-form-content interactions; Gaming sends client-side route page views. If the measurement ID changes, update it in `index.html` and `ryargaming/components/AnalyticsConsent.tsx`, and keep the privacy notice in `index.html` accurate.

## Local preview

```bash
cd ryargaming
npm ci
npm run build
cd ..
node scripts/assemble-site.mjs
python3 -m http.server 4173 --bind 0.0.0.0 --directory site
```

Then open `http://localhost:4173/`. To deploy with GitHub Pages, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

## Content attribution

RYAR Gaming includes the imported GameSpot/Fandom archive. The user has confirmed publication permission for this integration; original publishers and authors retain attribution and rights, and article pages link back to their source. Keep any applicable license or permission records with the site.
