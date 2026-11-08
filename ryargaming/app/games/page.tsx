"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FeedArticle } from "@/lib/types";
import { slugify } from "@/lib/types";
import { loadStaticFeed } from "@/lib/static-feed";

type GameEntry = { slug: string; name: string; count: number; reviews: number; average: number | null };
const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

function summarizeGames(articles: FeedArticle[]): GameEntry[] {
  const entries = new Map<string, GameEntry & { ratings: number[]; stories: Set<string> }>();
  const touch = (rawName: string, article: FeedArticle, isReview: boolean) => {
    const name = rawName.trim();
    if (!name || /^(view game hub|game hub|games|n\/a)$/i.test(name)) return;
    const slug = slugify(name);
    if (!slug) return;
    let entry = entries.get(slug);
    if (!entry) {
      entry = { slug, name, count: 0, reviews: 0, average: null, ratings: [], stories: new Set() };
      entries.set(slug, entry);
    }
    if (!entry.stories.has(article.slug)) {
      entry.stories.add(article.slug);
      entry.count += 1;
    }
    if (isReview && !entry.stories.has(`${article.slug}:review`)) {
      entry.stories.add(`${article.slug}:review`);
      entry.reviews += 1;
      if (article.review?.rating != null) entry.ratings.push(article.review.rating);
    }
  };

  for (const article of articles) {
    for (const game of article.games) touch(game, article, false);
    if (article.review?.game) touch(article.review.game, article, true);
  }

  return [...entries.values()]
    .map(({ ratings, stories, ...entry }) => ({
      ...entry,
      average: ratings.length ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10 : null,
    }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

function GamesContent() {
  const searchParams = useSearchParams();
  const letter = searchParams.get("letter")?.toUpperCase() ?? "";
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadStaticFeed()
      .then((feed) => {
        if (active) setArticles(feed.articles);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : "The archive could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const allGames = useMemo(() => summarizeGames(articles), [articles]);
  const visibleGames = useMemo(() => {
    if (!letter) return allGames.slice(0, 36);
    return allGames
      .filter((game) => {
        const first = game.name.replace(/^the\s+/i, "").charAt(0).toUpperCase();
        return letter === "#" ? !/[A-Z]/.test(first) : first === letter;
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [allGames, letter]);

  return (
    <div className="wrap">
      <nav className="crumbs">
        <Link href="/">Home</Link><span>/</span><span>Games</span>
      </nav>
      <header className="page-head">
        <div className="eyebrow">Index</div>
        <h1>Games</h1>
        <p>{allGames.length.toLocaleString()} titles covered — jump to a game to see every story and score.</p>
      </header>

      <div className="letterbar" aria-label="Filter games by first letter">
        <Link href="/games" className={!letter ? "on" : undefined}>Top</Link>
        {LETTERS.map((character) => (
          <Link
            key={character}
            href={`/games?letter=${encodeURIComponent(character)}`}
            className={letter === character ? "on" : undefined}
          >
            {character}
          </Link>
        ))}
      </div>

      <section className="section" style={{ marginTop: 12 }}>
        <div className="section-head">
          <h2>{letter ? `Games starting with ${letter}` : "Most covered games"}</h2>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {loading ? "Loading…" : `${visibleGames.length} shown`}
          </span>
        </div>

        {error ? (
          <p style={{ color: "var(--muted)" }}>Could not load the games index: {error}</p>
        ) : !loading && visibleGames.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No games under {letter}.</p>
        ) : (
          <div className="grid games">
            {visibleGames.map((entry) => (
              <Link key={entry.slug} className="gamecard" href={`/g/${entry.slug}`}>
                <span className="gname">{entry.name}</span>
                <span className="gmeta">
                  {entry.count} {entry.count === 1 ? "story" : "stories"}
                  {entry.reviews > 0 && <> · {entry.reviews} review{entry.reviews > 1 ? "s" : ""}</>}
                </span>
                <span className={`gscore${entry.average == null ? " none" : ""}`}>
                  {entry.average == null ? "unscored" : `${entry.average}/10`}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="wrap page-head"><h1>Loading games…</h1></div>}>
      <GamesContent />
    </Suspense>
  );
}
