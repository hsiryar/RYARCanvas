"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Card from "./Card";
import type { Article, FeedCard, KindId } from "@/lib/types";
import { matchesKind, slugify } from "@/lib/types";
import { loadFeedManifest, loadStaticFeedChunk } from "@/lib/static-feed";

type Props = {
  initial: Article[];
  total: number;
  cursor?: number;
  kind?: string;
  tag?: string;
  game?: string;
  collection?: string;
  perPage?: number;
};
type FeedScope = Pick<Props, "kind" | "tag" | "game" | "collection">;

function isGta6(article: FeedCard): boolean {
  const gta6 = /(gta-?6|gta-?vi|grand[- ]theft[- ]auto[- ]?(6|vi))/i;
  return (
    gta6.test(article.slug) ||
    gta6.test(article.title) ||
    gta6.test(article.dek ?? "") ||
    article.tags.some((tag) => gta6.test(tag)) ||
    article.games.some((game) => gta6.test(game))
  );
}

function matchesScope(article: FeedCard, scope: FeedScope): boolean {
  if (scope.collection === "gta6" && !isGta6(article)) return false;
  if (scope.tag && !article.tags.some((tag) => slugify(tag) === scope.tag)) return false;
  if (
    scope.game &&
    ![...article.games, ...(article.review?.game ? [article.review.game] : [])].some(
      (game) => slugify(game) === scope.game,
    )
  ) {
    return false;
  }
  return !scope.kind || matchesKind(article, scope.kind as KindId);
}

export default function InfiniteFeed({
  initial,
  total,
  cursor = 0,
  kind,
  tag,
  game,
  collection,
  perPage = 12,
}: Props) {
  const [items, setItems] = useState<FeedCard[]>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length >= total);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const busy = useRef(false);
  const cursorRef = useRef(cursor);
  const scope: FeedScope = { kind, tag, game, collection };

  const load = useCallback(async (retry = false) => {
    if (busy.current || done || (error && !retry)) return;
    busy.current = true;
    setLoading(true);
    setError(null);

    try {
      const manifest = await loadFeedManifest();
      let nextCursor = cursorRef.current;
      const nextItems: FeedCard[] = [];

      while (nextCursor < manifest.total && nextItems.length < perPage) {
        const chunkIndex = Math.floor(nextCursor / manifest.chunkSize);
        const chunk = await loadStaticFeedChunk(chunkIndex);
        const offset = nextCursor - chunk.start;
        if (offset < 0 || offset >= chunk.articles.length) {
          throw new Error(`Feed chunk ${chunkIndex} has an invalid range.`);
        }

        let advanced = false;
        for (let index = offset; index < chunk.articles.length; index++) {
          const article = chunk.articles[index];
          nextCursor = chunk.start + index + 1;
          advanced = true;
          if (matchesScope(article, scope)) nextItems.push(article);
          if (nextItems.length >= perPage) break;
        }
        if (!advanced) break;
      }

      cursorRef.current = nextCursor;
      setItems((previous) => {
        const seen = new Set(previous.map((item) => item.slug));
        return [...previous, ...nextItems.filter((item) => !seen.has(item.slug))];
      });
      setDone(nextCursor >= manifest.total || items.length + nextItems.length >= total || nextItems.length === 0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load more stories.");
    } finally {
      setLoading(false);
      busy.current = false;
    }
  }, [done, error, items.length, perPage, total, kind, tag, game, collection]);

  useEffect(() => {
    const element = sentinel.current;
    if (!element || done || error) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void load();
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [load, done, error]);

  return (
    <>
      <div className="grid">
        {items.map((article) => (
          <Card key={article.slug} a={article} />
        ))}
      </div>

      <div ref={sentinel} className="feed-foot" aria-live="polite" aria-busy={loading}>
        {loading && (
          <span className="spinner-row">
            <span className="spinner" aria-hidden="true" /> Loading more stories…
          </span>
        )}
        {error && (
          <div className="feed-error" role="alert">
            <span>Could not load more stories: {error}</span>
            <button className="chip" onClick={() => void load(true)}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && done && items.length > 0 && (
          <span>You&apos;re all caught up — {items.length} stories shown.</span>
        )}
        {!loading && !error && !done && (
          <button className="chip" onClick={() => void load()}>
            Load more stories
          </button>
        )}
      </div>
    </>
  );
}
