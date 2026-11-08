import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "data", "content.json");
const feedPath = path.join(root, "public", "data", "feed.json");
const featuredPath = path.join(root, "public", "data", "featured.json");
const sitemapPath = path.join(root, "public", "sitemap.xml");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const articles = source.articles.map((article) => ({
  slug: article.slug,
  path: article.path,
  kind: article.kind,
  subtype: article.subtype,
  trending: article.trending,
  title: article.title,
  dek: article.dek,
  tags: article.tags,
  games: article.games,
  image: article.image,
  image_count: article.image_count,
  review: article.review,
  published_at: article.published_at,
  authors: article.authors,
  reading_minutes: article.reading_minutes,
  excerpt: String(article.body_text || article.dek || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1800),
}));

const featured = [
  ...articles.filter((article) => article.trending).slice(0, 1),
  ...articles.filter((article) => !article.trending).slice(0, 2),
];

fs.mkdirSync(path.dirname(feedPath), { recursive: true });
fs.writeFileSync(feedPath, JSON.stringify({ generated: source.generated, total: articles.length, articles }));
fs.writeFileSync(featuredPath, JSON.stringify({ generated: source.generated, articles: featured }));

function slugify(value) {
  const withoutMarks = [...value.normalize("NFKD")]
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint < 0x0300 || codePoint > 0x036f;
    })
    .join("");
  return withoutMarks
    .toLowerCase()
    .replaceAll("'", "")
    .replaceAll("’", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const paths = new Map();
const addPath = (pathname, lastmod = "") => {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  paths.set(normalized, lastmod || source.generated.slice(0, 10));
};

for (const pathname of [
  "/",
  "/gta6",
  "/games",
  "/topics",
  "/search",
  "/c/all",
  "/c/news",
  "/c/guide",
  "/c/review",
  "/c/gallery",
  "/c/deals",
  "/c/trending",
]) {
  addPath(pathname);
}

const ignoredGames = new Set(["view game hub", "game hub", "games", "n/a"]);
for (const article of source.articles) {
  addPath(article.path, article.published_at?.slice(0, 10));
  for (const tag of article.tags ?? []) {
    const slug = slugify(tag);
    if (slug) addPath(`/t/${slug}`);
  }
  for (const name of [...(article.games ?? []), ...(article.review?.game ? [article.review.game] : [])]) {
    if (!name || ignoredGames.has(name.trim().toLowerCase())) continue;
    const slug = slugify(name);
    if (slug) addPath(`/g/${slug}`);
  }
}

const newline = String.fromCharCode(10);
const sitemapEntries = [...paths.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([pathname, lastmod]) => `  <url><loc>https://ryarcanvas.online/gaming${pathname}</loc><lastmod>${lastmod}</lastmod></url>`)
  .join(newline);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  sitemapEntries,
  '</urlset>',
  '',
].join(newline);
fs.writeFileSync(sitemapPath, sitemap);
console.log(`Wrote ${articles.length} feed records, ${featured.length} homepage highlights and ${paths.size} sitemap URLs.`);
