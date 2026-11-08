"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Card from "./Card";
import type { Article, FeedArticle, KindId } from "@/lib/types";
import { matchesKind, slugify } from "@/lib/types";
import { loadStaticFeed } from "@/lib/static-feed";

type Props = {
  initial: Article[];
  total: number;
  kind?: string;
  tag?: string;
  game?: string;
  collection?: string;
  perPage?: number;
};
type FeedScope = Pick<Props, "kind" | "tag" | "game" | "collection">;

function isGta6(article: FeedArticle): boolean {
  const gta6 = /(gta-?6|gta-?vi|grand[- ]theft[- ]auto[- ]?(6|vi))/i;
  return (
    gta6.test(article.slug) ||
    gta6.test(article.title) ||
    gta6.test(article.dek ?? "") ||
    article.tags.some((tag) => gta6.test(tag)) ||
    article.games.some((game) => gta6.test(game))
  );
}

function matchesScope(article: FeedArticle, scope: FeedScope): boolean {
  if (scope.collection === "gta6" && !isGta6(article)) return false;
  if (scope.tag && !article.tags.some((tag) => slugify(tag) === scope.tag)) return false;
  if (
    scope.game &&
    ![...article.games, ...(article.review?.game ? [article.review.game] : [])].some(
      (game) => slugify(game) === scope.game
    )
  ) {
    return false;
  }
  return !scope.kind || matchesKind(article, scope.kind as KindId);
}

export default function InfiniteFeed({
  initial,
  total,
  kind,
  tag,
  game,
  collection,
  perPage = 12,
}: Props) {
  const [items, setItems] = useState<FeedArticle[]>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length >= total);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const busy = useRef(false);
  const scope: FeedScope = { kind, tag, game, collection };

  const load = useCallback(async () => {
    if (busy.current || done) return;
    busy.current = true;
    setLoading(true);
    setError(null);

    try {
      const archive = await loadStaticFeed();
      const scoped = archive.articles.filter((article) => matchesScope(article, scope));
      const nextItems = scoped.slice(items.length, items.length + perPage);
      const nextLength = items.length + nextItems.length;

      setItems((previous) => {
        const seen = new Set(previous.map((item) => item.slug));
        return [...previous, ...nextItems.filter((item) => !seen.has(item.slug))];
      });
      setDone(nextLength >= scoped.length);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load more stories");
    } finally {
      setLoading(false);
      busy.current = false;
    }
  }, [done, items.length, perPage, kind, tag, game, collection]);

  useEffect(() => {
    const element = sentinel.current;
    if (!element || done) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void load();
      },
      { rootMargin: "700px 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [load, done]);

  return (
    <>
      <div className="grid">
        {items.map((article) => (
          <Card key={article.slug} a={article} />
        ))}
      </div>

      <div ref={sentinel} className="feed-foot" aria-live="polite">
        {loading && (
          <span className="spinner-row">
            <span className="spinner" aria-hidden="true" /> Loading more stories…
          </span>
        )}
        {error && (
          <button className="chip" onClick={() => void load()}>
            Retry ({error})
          </button>
        )}
        {!loading && !error && done && items.length > 0 && (
          <span>You&apos;re all caught up — {items.length} stories shown.</span>
        )}
        {!loading && !error && !done && (
          <button className="chip" onClick={() => void load()}>
            Load more
          </button>
        )}
      </div>
    </>
  );
}
