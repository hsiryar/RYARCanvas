import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "data", "content.json");
const publicPath = path.join(root, "public");
const feedPath = path.join(publicPath, "data", "feed.json");
const feedChunkDir = path.join(publicPath, "data", "feed-chunks");
const feedManifestPath = path.join(publicPath, "data", "feed-manifest.json");
const feedChunkSize = 100;
const featuredPath = path.join(publicPath, "data", "featured.json");
const sitemapPath = path.join(publicPath, "sitemap.xml");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

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

function countPerArticle(map, values) {
  const unique = new Set(values.map((value) => slugify(String(value ?? "").trim())).filter(Boolean));
  for (const slug of unique) map.set(slug, (map.get(slug) ?? 0) + 1);
}

const articles = source.articles.map((article) => {
  if (article.image) {
    const imagePath = String(article.image);
    if (!imagePath.startsWith("/images/")) {
      throw new Error(`Article image must be stored under public/images: ${article.slug} (${imagePath})`);
    }
    const localImage = path.join(publicPath, imagePath.slice(1));
    if (!fs.existsSync(localImage)) {
      throw new Error(`Missing public image for ${article.slug}: ${localImage}`);
    }
  }

  return {
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
    review: article.review ? { rating: article.review.rating, game: article.review.game } : null,
    published_at: article.published_at,
    reading_minutes: article.reading_minutes,
    // A short search excerpt keeps the shared browser feed light while preserving useful snippets.
    excerpt: String(article.body_text || article.dek || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 480),
  };
});

const featured = [
  ...articles.filter((article) => article.trending).slice(0, 1),
  ...articles.filter((article) => !article.trending).slice(0, 2),
];

fs.mkdirSync(path.dirname(feedPath), { recursive: true });
fs.writeFileSync(feedPath, JSON.stringify({ generated: source.generated, total: articles.length, articles }));
fs.writeFileSync(featuredPath, JSON.stringify({ generated: source.generated, articles: featured }));

// Infinite feeds use small card-only chunks so a scroll never has to download the full search index.
fs.rmSync(feedChunkDir, { recursive: true, force: true });
fs.mkdirSync(feedChunkDir, { recursive: true });
const feedCards = articles.map(({ excerpt, ...card }) => card);
const feedChunkCount = Math.ceil(feedCards.length / feedChunkSize);
for (let chunkIndex = 0; chunkIndex < feedChunkCount; chunkIndex++) {
  const start = chunkIndex * feedChunkSize;
  const filename = `${String(chunkIndex).padStart(3, "0")}.json`;
  fs.writeFileSync(
    path.join(feedChunkDir, filename),
    JSON.stringify({ start, articles: feedCards.slice(start, start + feedChunkSize) }),
  );
}
fs.writeFileSync(
  feedManifestPath,
  JSON.stringify({ total: feedCards.length, chunkSize: feedChunkSize, chunkCount: feedChunkCount }),
);

const paths = new Map();
const fallbackDate = String(source.generated ?? "").slice(0, 10);
const addPath = (pathname, lastmod = "") => {
  const prefixed = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const normalized = prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
  paths.set(normalized, /^\d{4}-\d{2}-\d{2}$/.test(lastmod) ? lastmod : fallbackDate);
};

// Search and duplicate "all" feeds are intentionally omitted; search is noindex and the homepage covers all stories.
for (const pathname of [
  "/",
  "/gta6",
  "/games",
  "/topics",
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
const tagCounts = new Map();
const gameCounts = new Map();
for (const article of source.articles) {
  const published = String(article.published_at ?? "").slice(0, 10);
  addPath(article.path, published);
  countPerArticle(tagCounts, article.tags ?? []);
  countPerArticle(
    gameCounts,
    [...(article.games ?? []), ...(article.review?.game ? [article.review.game] : [])]
      .filter((name) => !ignoredGames.has(String(name).trim().toLowerCase())),
  );
}

// Keep only useful topic/game hubs in the sitemap; thin one-story hubs remain accessible but are noindex.
for (const [slug, count] of tagCounts) if (count >= 2) addPath(`/t/${slug}`);
for (const [slug, count] of gameCounts) if (count >= 2) addPath(`/g/${slug}`);

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const newline = String.fromCharCode(10);
const sitemapEntries = [...paths.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([pathname, lastmod]) => {
    const loc = xmlEscape(`https://ryarcanvas.online/gaming${pathname}`);
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
  })
  .join(newline);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  sitemapEntries,
  '</urlset>',
  '',
].join(newline);
fs.writeFileSync(sitemapPath, sitemap);
console.log(
  `Wrote ${articles.length} feed records in ${feedChunkCount} card chunks, ${featured.length} homepage highlights, ${paths.size} sitemap URLs, and validated ${source.articles.filter((article) => article.image).length} public images.`,
);
