import fs from "node:fs";
import path from "node:path";
import {
  type Article,
  type KindId,
  matchesKind,
  slugify,
} from "./types";

export type { Article, Block, Review } from "./types";
export { KINDS, matchesKind, slugify } from "./types";
export type { KindId } from "./types";
export { fmtDate, relTime } from "./format";

type Store = {
  site: string;
  brand: string;
  generated: string;
  count: number;
  stats: Record<string, number>;
  tags: { tag: string; count: number }[];
  articles: Article[];
};

let cache: Store | null = null;

export function store(): Store {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data", "content.json");
  cache = JSON.parse(fs.readFileSync(file, "utf8")) as Store;
  return cache;
}

export const brand = () => store().brand;
export const stats = () => store().stats;
export const generatedAt = () => store().generated;
export const topTags = (n = 14) => store().tags.slice(0, n);

// ------------------------------------------------------------------ feeds
export function feed(kind: KindId = "all", page = 1, perPage = 24) {
  const items = store().articles.filter((a) => matchesKind(a, kind));
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    page,
    pages: Math.max(1, Math.ceil(items.length / perPage)),
  };
}

export type FeedKey = {
  kind?: KindId;
  tag?: string;
  game?: string;
  collection?: "gta6";
};

/** GTA VI detector — matches the slug, the title, tags and linked games */
const GTA6 = /(gta-?6|gta-?vi|grand[- ]theft[- ]auto[- ]?(6|vi))/i;
const GTA_ANY = /(gta|grand[- ]theft[- ]auto)/i;

export function isGta6(a: Article): boolean {
  if (GTA6.test(a.slug) || GTA6.test(a.title) || GTA6.test(a.dek ?? "")) return true;
  if (a.tags.some((t) => GTA6.test(t))) return true;
  if (a.games.some((g) => GTA6.test(g))) return true;
  return false;
}

export function isGta(a: Article): boolean {
  return isGta6(a) || GTA_ANY.test(a.slug) || a.tags.some((t) => GTA_ANY.test(t)) ||
    a.games.some((g) => GTA_ANY.test(g));
}

export function gta6Feed(n = 12) {
  return store().articles.filter(isGta6).slice(0, n);
}

export function gta6Stats() {
  const items = store().articles.filter(isGta6);
  const guides = items.filter((a) => a.subtype === "guide");
  const galleries = items.filter((a) => a.kind === "gallery");
  const reviews = items.filter((a) => a.kind === "review");
  return {
    total: items.length,
    guides: guides.length,
    galleries: galleries.length,
    reviews: reviews.length,
    latest: items[0]?.published_at ?? null,
    oldest: items[items.length - 1]?.published_at ?? null,
    items,
  };
}

function pool({ kind, tag, game, collection }: FeedKey): Article[] {
  const arts = store().articles;
  if (collection === "gta6") return arts.filter(isGta6);
  if (tag) {
    const tagName = tagBySlug(tag)?.tag;
    if (!tagName) return [];
    return arts.filter((a) => a.tags.includes(tagName));
  }
  if (game) {
    const g = gameBySlug(game);
    if (!g) return [];
    return g.articles;
  }
  return arts.filter((a) => matchesKind(a, (kind ?? "all") as KindId));
}

/** offset/limit slice — used by both SSR and /api/feed */
export function feedSlice(key: FeedKey, offset = 0, limit = 12) {
  const all = pool(key);
  const items = all.slice(offset, offset + limit);
  const nextOffset = offset + items.length < all.length ? offset + items.length : null;
  return { items, total: all.length, nextOffset };
}

export function trending(n = 6) {
  return store().articles.filter((a) => a.trending).slice(0, n);
}

export function bySlug(slug: string): Article | undefined {
  return store().articles.find((a) => a.slug === slug);
}

export function byTag(tag: string, limit = 60) {
  return store().articles.filter((a) => a.tags.includes(tag)).slice(0, limit);
}

export function related(a: Article, n = 6) {
  const scored = store()
    .articles.filter((x) => x.slug !== a.slug)
    .map((x) => {
      let s = 0;
      for (const t of a.tags) if (x.tags.includes(t)) s += 3;
      if (x.section && x.section === a.section) s += 1;
      if (x.kind === a.kind) s += 1;
      return { x, s };
    })
    .filter((r) => r.s > 0)
    .sort((p, q) => q.s - p.s);
  return scored.slice(0, n).map((r) => r.x);
}

// ------------------------------------------------------------------ tags
export type TagEntry = { tag: string; slug: string; count: number };

let tagMap: Map<string, TagEntry> | null = null;

export function tagIndex(): Map<string, TagEntry> {
  if (tagMap) return tagMap;
  const counts = new Map<string, number>();
  for (const a of store().articles) for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);

  // slug -> most frequent display form (handles "PC"/"Pc" style duplicates)
  const bySlug = new Map<string, TagEntry>();
  for (const [tag, count] of [...counts.entries()].sort((p, q) => q[1] - p[1])) {
    const slug = slugify(tag);
    if (!slug) continue;
    const prev = bySlug.get(slug);
    if (prev) prev.count += count;
    else bySlug.set(slug, { tag, slug, count });
  }
  tagMap = bySlug;
  return bySlug;
}

export function tagBySlug(slug: string): TagEntry | undefined {
  return tagIndex().get(slug);
}

export function allTags(): TagEntry[] {
  return [...tagIndex().values()].sort((a, b) => b.count - a.count);
}

/** tags that co-occur most with the given one */
export function relatedTags(tag: string, n = 10): TagEntry[] {
  const co = new Map<string, number>();
  for (const a of store().articles) {
    if (!a.tags.includes(tag)) continue;
    for (const t of a.tags) if (t !== tag) co.set(t, (co.get(t) ?? 0) + 1);
  }
  return [...co.entries()]
    .sort((p, q) => q[1] - p[1])
    .slice(0, n)
    .map(([t]) => tagIndex().get(slugify(t)) ?? { tag: t, slug: slugify(t), count: 0 });
}

// ------------------------------------------------------------------ games
export type GameEntry = {
  slug: string;
  name: string;
  count: number;
  reviews: Article[];
  avg: number | null;
  articles: Article[];
};

const JUNK_GAME = /^(view game hub|game hub|games|n\/a)$/i;
let gameMap: Map<string, GameEntry> | null = null;

export function gameIndex(): Map<string, GameEntry> {
  if (gameMap) return gameMap;
  const bySlug = new Map<string, GameEntry>();
  const names = new Map<string, Map<string, number>>();

  const touch = (raw: string, a: Article, isReview: boolean) => {
    const name = raw.trim();
    if (!name || JUNK_GAME.test(name)) return;
    const slug = slugify(name);
    if (!slug) return;
    let e = bySlug.get(slug);
    if (!e) {
      e = { slug, name, count: 0, reviews: [], avg: null, articles: [] };
      bySlug.set(slug, e);
      names.set(slug, new Map());
    }
    const nv = names.get(slug)!;
    nv.set(name, (nv.get(name) ?? 0) + 1);
    if (!e.articles.some((x) => x.slug === a.slug)) {
      e.articles.push(a);
      e.count++;
    }
    if (isReview && !e.reviews.some((x) => x.slug === a.slug)) e.reviews.push(a);
  };

  for (const a of store().articles) {
    for (const g of a.games) touch(g, a, false);
    if (a.review?.game) touch(a.review.game, a, true);
  }

  for (const [slug, e] of bySlug) {
    // pick the most common display spelling
    const nv = [...(names.get(slug) ?? new Map()).entries()].sort((p, q) => q[1] - p[1]);
    if (nv[0]) e.name = nv[0][0];
    e.articles.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    const rated = e.reviews.filter((r) => r.review?.rating != null);
    e.avg = rated.length
      ? Math.round((rated.reduce((s, r) => s + (r.review!.rating ?? 0), 0) / rated.length) * 10) / 10
      : null;
  }
  gameMap = bySlug;
  return bySlug;
}

export function gameBySlug(slug: string): GameEntry | undefined {
  return gameIndex().get(slug);
}

export function topGames(n = 24): GameEntry[] {
  return [...gameIndex().values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, n);
}

export function allGames(): GameEntry[] {
  return [...gameIndex().values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function gamesByLetter(letter: string): GameEntry[] {
  const L = letter.toUpperCase();
  return allGames().filter((g) => {
    const ch = g.name.replace(/^the\s+/i, "").charAt(0).toUpperCase();
    return L === "#" ? !/[A-Z]/.test(ch) : ch === L;
  });
}

// ------------------------------------------------------------------ search
type Indexed = { a: Article; hay: string; hayTitle: string; hayTags: string };
let ix: Indexed[] | null = null;

function index(): Indexed[] {
  if (ix) return ix;
  ix = store().articles.map((a) => ({
    a,
    hayTitle: a.title.toLowerCase(),
    hayTags: a.tags.join(" ").toLowerCase() + " " + a.games.join(" ").toLowerCase(),
    hay: (
      a.title +
      " " +
      a.dek +
      " " +
      a.body_text +
      " " +
      a.authors.map((x) => x.name).join(" ")
    ).toLowerCase(),
  }));
  return ix;
}

export function search(q: string, kind: KindId = "all", limit = 40) {
  const query = q.trim().toLowerCase();
  if (!query) return { hits: [], total: 0, q };
  const terms = query.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const row of index()) {
    if (!matchesKind(row.a, kind)) continue;
    let score = 0;
    let all = true;
    for (const t of terms) {
      let s = 0;
      if (row.hayTitle.includes(t)) s += 12;
      if (row.hayTags.includes(t)) s += 6;
      if (row.a.dek.toLowerCase().includes(t)) s += 4;
      if (row.hay.includes(t)) s += 2;
      if (s === 0) {
        all = false;
        break;
      }
      score += s;
    }
    if (!all || score === 0) continue;
    if (row.a.trending) score += 2;
    score += Math.max(0, 4 - (2026 - Number(row.a.published_at.slice(0, 4))) * 2);
    scored.push({ a: row.a, score });
  }
  scored.sort((p, q2) => q2.score - p.score);
  return { hits: scored.slice(0, limit).map((s) => s.a), total: scored.length, q };
}

export function snippet(a: Article, q: string, radius = 150) {
  const text = a.body_text || a.dek || "";
  const idx = text.toLowerCase().indexOf(q.trim().toLowerCase().split(/\s+/)[0] || "");
  if (idx < 0) return text.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  return (start > 0 ? "…" : "") + text.slice(start, idx + radius).trim() + "…";
}
