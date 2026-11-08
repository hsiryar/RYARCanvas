"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fmtDate } from "@/lib/format";
import { KINDS, matchesKind, type FeedArticle, type KindId } from "@/lib/types";
import { loadStaticFeed } from "@/lib/static-feed";
import { sitePath } from "@/lib/site";

function highlight(text: string, query: string) {
  const terms = query.trim().split(/\s+/).filter((term) => term.length > 1);
  if (!terms.length) return text;
  const parts: ReactNode[] = [];
  const lower = text.toLowerCase();
  let cursor = 0;
  let key = 0;

  while (cursor < text.length) {
    const matches = terms
      .map((term) => ({ term, index: lower.indexOf(term.toLowerCase(), cursor) }))
      .filter((match) => match.index >= 0)
      .sort((left, right) => left.index - right.index);
    const match = matches[0];
    if (!match) break;
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(<mark key={key++}>{text.slice(match.index, match.index + match.term.length)}</mark>);
    cursor = match.index + match.term.length;
    if (parts.length > 100) break;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const kind = (searchParams.get("kind") ?? "all") as KindId;
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

  const { hits, total } = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return { hits: [], total: 0 };

    const scored: { article: FeedArticle; score: number }[] = [];
    for (const article of articles) {
      if (!matchesKind(article, kind)) continue;
      const title = article.title.toLowerCase();
      const dek = (article.dek ?? "").toLowerCase();
      const tags = [...article.tags, ...article.games].join(" ").toLowerCase();
      const excerpt = (article.excerpt ?? "").toLowerCase();
      let score = 0;
      let allTermsMatch = true;

      for (const term of terms) {
        let termScore = 0;
        if (title.includes(term)) termScore += 12;
        if (tags.includes(term)) termScore += 6;
        if (dek.includes(term)) termScore += 4;
        if (excerpt.includes(term)) termScore += 2;
        if (!termScore) {
          allTermsMatch = false;
          break;
        }
        score += termScore;
      }

      if (allTermsMatch && score > 0) {
        if (article.trending) score += 2;
        scored.push({ article, score });
      }
    }

    scored.sort((left, right) => right.score - left.score || right.article.published_at.localeCompare(left.article.published_at));
    return { hits: scored.slice(0, 40).map(({ article }) => article), total: scored.length };
  }, [articles, kind, query]);

  return (
    <div className="wrap">
      <section className="hero" style={{ paddingBottom: 0 }}>
        <form className="searchbig" action={sitePath("/search")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="#9aa0a6" strokeWidth="1.8" />
            <path d="M16 16l5 5" stroke="#9aa0a6" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input name="q" defaultValue={query} placeholder="Search news, guides, reviews…" aria-label="Search the archive" />
          {kind !== "all" && <input type="hidden" name="kind" value={kind} />}
          <button className="go" type="submit">Search</button>
        </form>
      </section>

      <div className="chips" style={{ justifyContent: "center" }}>
        {KINDS.map((entry) => {
          const params = new URLSearchParams();
          if (query) params.set("q", query);
          if (entry.id !== "all") params.set("kind", entry.id);
          return (
            <Link
              key={entry.id}
              href={`/search${params.toString() ? `?${params.toString()}` : ""}`}
              className={`chip${entry.id === kind ? " on" : ""}`}
            >
              {entry.label}
            </Link>
          );
        })}
      </div>

      <div className="results" aria-live="polite">
        {loading ? (
          <p className="result-count">Loading the gaming archive…</p>
        ) : error ? (
          <p className="result-count">Could not load the archive: {error}</p>
        ) : query ? (
          <p className="result-count">
            {total.toLocaleString()} result{total === 1 ? "" : "s"} for “{query}”
            {total > hits.length ? ` · showing top ${hits.length}` : ""}
          </p>
        ) : (
          <p className="result-count">Search the archive — try “GTA 6”, “Fortnite” or “review”.</p>
        )}

        {hits.map((article) => (
          <article className="result" key={article.slug}>
            <Link href={article.path}>
              <div className="crumb">
                <span className="fav">r</span>
                <span>ryarcanvas.online</span>
                <span style={{ opacity: 0.5 }}>›</span>
                <span>{article.kind}</span>
                <span style={{ opacity: 0.5 }}>›</span>
                <span>{article.slug.slice(0, 34)}</span>
              </div>
              <h3>{highlight(article.title, query)}</h3>
              <p>
                {article.review?.rating != null && <strong style={{ color: "#137333" }}>{article.review.rating}/10 — </strong>}
                {highlight(article.dek || article.excerpt.slice(0, 280), query)}
              </p>
              <div className="sub">
                {article.authors[0]?.name ?? "Ryar Staff"} · {fmtDate(article.published_at)} · {article.reading_minutes} min read
                {article.tags.length ? ` · ${article.tags.slice(0, 3).join(", ")}` : ""}
              </div>
            </Link>
          </article>
        ))}

        {!loading && query && hits.length === 0 && !error && (
          <p style={{ padding: "30px 0", color: "#5f6368" }}>No results for “{query}”. Try a different spelling or a broader term.</p>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="wrap results"><p className="result-count">Loading search…</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
