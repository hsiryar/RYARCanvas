// Shared types + constants. Safe to import from client components.

export type Block = { t: string; x: string };

export type Review = {
  rating: number;
  verdict: string | null;
  game: string | null;
  pros: string[];
  cons: string[];
};

export type Article = {
  slug: string;
  url: string;
  source_url: string;
  path: string;
  kind: "article" | "review" | "gallery";
  subtype: string | null;
  trending: boolean;
  title: string;
  dek: string;
  excerpt: string;
  section: string | null;
  tags: string[];
  authors: { name: string }[];
  published_at: string;
  day: string;
  month: string;
  word_count: number;
  reading_minutes: number;
  review: Review | null;
  image: string | null;
  image_count: number;
  has_video: boolean;
  games: string[];
  blocks: Block[];
  body_text: string;
};

export type FeedCard = Omit<
  Pick<
    Article,
    | "slug"
    | "path"
    | "kind"
    | "subtype"
    | "trending"
    | "title"
    | "dek"
    | "tags"
    | "published_at"
    | "reading_minutes"
    | "review"
    | "image"
    | "image_count"
    | "games"
  >,
  "review"
> & { review: Pick<Review, "rating" | "game"> | null };

export type FeedArticle = FeedCard & { excerpt: string };

export const KINDS = [
  { id: "all", label: "All" },
  { id: "news", label: "News" },
  { id: "guide", label: "Guides" },
  { id: "review", label: "Reviews" },
  { id: "gallery", label: "Galleries" },
  { id: "deals", label: "Deals" },
  { id: "trending", label: "Trending" },
] as const;

export type KindId = (typeof KINDS)[number]["id"];

export function matchesKind(a: Pick<Article, "kind" | "subtype" | "trending">, kind: KindId): boolean {
  switch (kind) {
    case "news":
      return a.kind === "article" && a.subtype !== "guide" && a.subtype !== "deals";
    case "guide":
      return a.subtype === "guide";
    case "review":
      return a.kind === "review";
    case "gallery":
      return a.kind === "gallery";
    case "deals":
      return a.subtype === "deals";
    case "trending":
      return a.trending;
    default:
      return true;
  }
}

/** "PlayStation 5" -> "playstation-5"; strips accents/punctuation */
export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
