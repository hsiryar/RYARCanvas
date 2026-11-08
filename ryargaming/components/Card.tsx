import type { FeedCard } from "@/lib/types";
import { relTime } from "@/lib/format";
import { sitePath } from "@/lib/site";

const KIND_LABEL: Record<string, string> = {
  article: "news",
  review: "review",
  gallery: "gallery",
};

function Badges({ a }: { a: FeedCard }) {
  const cls = a.subtype === "deals" ? "deals" : a.subtype === "guide" ? "guide" : KIND_LABEL[a.kind];
  const label = a.subtype === "deals" ? "deal" : a.subtype === "guide" ? "guide" : KIND_LABEL[a.kind];
  return (
    <div className="kicker">
      <span className={`badge ${cls}`}>{label}</span>
      {a.trending && <span className="badge hot">Trending</span>}
    </div>
  );
}

export default function Card({ a, tight = false }: { a: FeedCard; tight?: boolean }) {
  const path = a.path.endsWith("/") ? a.path : `${a.path}/`;
  const href = sitePath(path);

  return (
    <a href={href} className="card" style={tight ? { borderRadius: 12 } : undefined}>
      <div className="thumb">
        {a.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sitePath(a.image)} alt={a.title} loading="lazy" decoding="async" />
        ) : null}
        {a.review?.rating != null && (
          <span className="score">
            {a.review.rating}
            <small>/10</small>
          </span>
        )}
        {a.kind === "gallery" && a.image_count > 1 && (
          <span className="imgcount">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 6h16v12H4z" opacity=".0" />
              <path d="M20 4H8a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zm0 12H8V6h12v10z" />
              <path d="M16 20H4V8H2v12a2 2 0 002 2h12v-2z" />
            </svg>
            {a.image_count}
          </span>
        )}
      </div>
      <div className="body">
        <Badges a={a} />
        <h3>{a.title}</h3>
        {a.dek && <p className="dek">{a.dek}</p>}
        <div className="meta">
          <span>{relTime(a.published_at)}</span>
          <span className="sep">·</span>
          <span>{a.reading_minutes} min read</span>
        </div>
      </div>
    </a>
  );
}
