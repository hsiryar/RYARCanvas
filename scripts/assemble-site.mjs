import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "site");
const gamingExport = path.join(root, "ryargaming", "out");

await fs.access(path.join(gamingExport, "index.html")).catch(() => {
  throw new Error("Gaming export not found. Run `npm run build` in ryargaming first.");
});

await fs.rm(site, { recursive: true, force: true });
await fs.mkdir(path.join(site, "gaming"), { recursive: true });

for (const file of ["index.html", "sitemap.xml", "robots.txt", "CNAME", ".nojekyll"]) {
  await fs.copyFile(path.join(root, file), path.join(site, file));
}

// The Canvas landing page and Gaming archive share self-hosted Inter and image assets.
await fs.cp(path.join(root, "fonts"), path.join(site, "fonts"), { recursive: true });
await fs.cp(path.join(root, "assets"), path.join(site, "assets"), { recursive: true });
await fs.cp(gamingExport, path.join(site, "gaming"), { recursive: true });
console.log(`Assembled the combined static site at ${path.relative(root, site)}/`);
