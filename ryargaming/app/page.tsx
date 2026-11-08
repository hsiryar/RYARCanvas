import Link from "next/link";
import Card from "@/components/Card";
import { relTime } from "@/lib/format";
import InfiniteFeed from "@/components/InfiniteFeed";
import { KINDS, feed, feedSlice, gta6Feed, gta6Stats, slugify, stats, topGames, topTags, trending } from "@/lib/data";

export default function HomePage() {
  const s = stats();
  const hot = trending(6);
  const latest = feedSlice({ kind: "all" }, 0, 12);
  const guides = feed("guide", 1, 4).items;
  const galleries = feed("gallery", 1, 4).items;
  const reviews = feed("review", 1, 8).items.filter((r) => r.review?.rating != null);
  const games = topGames(8);
  const tags = topTags(12);
  const gta = gta6Feed(6);
  const gtaS = gta6Stats();

  return (
    <div className="wrap">
      <section className="hero">
        <h1>Gaming, explained</h1>
        <form className="searchbig" action="/search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="#9aa0a6" strokeWidth="1.8" />
            <path d="M16 16l5 5" stroke="#9aa0a6" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input name="q" placeholder="Search news, guides, reviews…" aria-label="Search" />
          <button className="go" type="submit">
            Search
          </button>
        </form>
        <div className="quick">
          <Link href="/gta6">GTA VI</Link>
          {tags.slice(0, 7).map((t) => (
            <Link key={t.tag} href={`/t/${slugify(t.tag)}`}>
              {t.tag}
            </Link>
          ))}
        </div>
      </section>

      <div className="chips">
        {KINDS.map((k) => (
          <Link
            key={k.id}
            href={k.id === "all" ? "/" : `/c/${k.id}`}
            className={`chip${k.id === "all" ? " on" : ""}`}
          >
            {k.label}
          </Link>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <h2>
            <span className="dot" />
            Trending right now
          </h2>
          <Link className="more" href="/c/trending">
            See all
          </Link>
        </div>
        <div className="rail">
          {hot.map((a) => (
            <Card key={a.slug} a={a} />
          ))}
        </div>
      </section>

      <section className="section gta-band">
        <div className="section-head">
          <h2>
            <span className="dot" style={{ background: "var(--blue)" }} />
            GTA VI watch
          </h2>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {gtaS.total} stories · updated {gtaS.latest ? relTime(gtaS.latest) : "—"}
          </span>
          <Link className="more" href="/gta6">
            All GTA VI coverage
          </Link>
        </div>
        <div className="rail">
          {gta.map((a) => (
            <Card key={a.slug} a={a} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Latest</h2>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {s.words.toLocaleString()} words across {s.articles + s.reviews + s.galleries} stories
          </span>
          <Link className="more" href="/c/news">
            More news
          </Link>
        </div>
        <InfiniteFeed initial={latest.items} total={latest.total} kind="all" perPage={12} />
      </section>

      {reviews.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Reviews</h2>
            <Link className="more" href="/c/review">
              All reviews
            </Link>
          </div>
          <div className="grid tight">
            {reviews.slice(0, 4).map((a) => (
              <Card key={a.slug} a={a} tight />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Popular games</h2>
          <Link className="more" href="/games">
            All games
          </Link>
        </div>
        <div className="grid games">
          {games.map((g) => (
            <Link key={g.slug} className="gamecard" href={`/g/${g.slug}`}>
              <span className="gname">{g.name}</span>
              <span className="gmeta">
                {g.count} {g.count === 1 ? "story" : "stories"}
                {g.reviews.length > 0 && <> · {g.reviews.length} review{g.reviews.length > 1 ? "s" : ""}</>}
              </span>
              <span className={`gscore${g.avg == null ? " none" : ""}`}>
                {g.avg == null ? "unscored" : `${g.avg}/10`}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Guides &amp; how-tos</h2>
          <Link className="more" href="/c/guide">
            All guides
          </Link>
        </div>
        <div className="grid tight">
          {guides.map((a) => (
            <Card key={a.slug} a={a} tight />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>In pictures</h2>
          <Link className="more" href="/c/gallery">
            All galleries
          </Link>
        </div>
        <div className="grid tight">
          {galleries.map((a) => (
            <Card key={a.slug} a={a} tight />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Browse by topic</h2>
          <Link className="more" href="/topics">
            All topics
          </Link>
        </div>
        <div className="tagrow" style={{ borderTop: 0, margin: 0, paddingTop: 0 }}>
          {tags.map((t) => (
            <Link key={t.tag} className="tag" href={`/t/${slugify(t.tag)}`}>
              {t.tag} <span style={{ color: "var(--muted)" }}>{t.count}</span>
            </Link>
          ))}
        </div>
      </section>

      <p className="footnote">
        {s.trending} stories flagged trending · {s.images.toLocaleString()} hero images ·{" "}
        {s.authors} writers · {s.tags} topics. Scroll the Latest feed — it loads more as you go.
      </p>
    </div>
  );
}
