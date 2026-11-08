import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import InfiniteFeed from "@/components/InfiniteFeed";
import { allGames, feedSlice, gameBySlug, slugify } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return allGames().map((entry) => ({ slug: entry.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const g = gameBySlug(slug);
  if (!g) return { title: "Game — RYAR Gaming" };
  return {
    title: `${g.name} — news, guides & reviews — RYAR Gaming`,
    description: `${g.count} stories about ${g.name}${g.avg != null ? `, average review score ${g.avg}/10` : ""}.`,
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const g = gameBySlug(slug);
  if (!g) notFound();

  const { items, total } = feedSlice({ game: g.slug }, 0, 12);
  const rated = g.reviews.filter((r) => r.review?.rating != null);
  const best = [...rated].sort((a, b) => (b.review!.rating ?? 0) - (a.review!.rating ?? 0))[0];
  const tags = [...new Set(g.articles.flatMap((a) => a.tags))].slice(0, 12);

  return (
    <div className="wrap">
      <nav className="crumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/games">Games</Link>
        <span>/</span>
        <span>{g.name}</span>
      </nav>

      <header className="page-head">
        <div className="eyebrow">Game hub</div>
        <h1>{g.name}</h1>
        <p>Everything RYAR Gaming has published about {g.name}.</p>

        <div className="headline-stats">
          <div>
            <b>{g.count}</b>
            {g.count === 1 ? "story" : "stories"}
          </div>
          <div>
            <b>{g.reviews.length}</b>
            {g.reviews.length === 1 ? "review" : "reviews"}
          </div>
          <div>
            <b>{g.avg != null ? `${g.avg}/10` : "—"}</b>average score
          </div>
          {best?.review?.rating != null && (
            <div>
              <b>{best.review.rating}/10</b>best ({best.review.verdict ?? "review"})
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className="tagrow" style={{ borderTop: 0, margin: "18px 0 0", paddingTop: 0 }}>
            {tags.map((t) => (
              <Link key={t} className="tag" href={`/t/${slugify(t)}`}>
                {t}
              </Link>
            ))}
          </div>
        )}
      </header>

      {rated.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Reviews</h2>
          </div>
          <div className="grid tight">
            {rated.slice(0, 4).map((r) => (
              <Card key={r.slug} a={r} tight />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>All coverage</h2>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{total} stories</span>
        </div>
        <InfiniteFeed initial={items} total={total} game={g.slug} perPage={12} />
      </section>
    </div>
  );
}
