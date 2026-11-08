import Link from "next/link";
import { notFound } from "next/navigation";
import InfiniteFeed from "@/components/InfiniteFeed";
import { allTags, feedSlice, relatedTags, tagBySlug } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return allTags().map((entry) => ({ tag: entry.slug }));
}

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  const entry = tagBySlug(tag);
  return {
    title: entry ? `${entry.tag} — RYAR Gaming` : "Topic — RYAR Gaming",
    description: entry ? `${entry.count} stories tagged ${entry.tag}.` : undefined,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const entry = tagBySlug(tag);
  if (!entry) notFound();

  const { items, total } = feedSlice({ tag: entry.slug }, 0, 12);
  const related = relatedTags(entry.tag, 12);

  return (
    <div className="wrap">
      <nav className="crumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/topics">Topics</Link>
        <span>/</span>
        <span>{entry.tag}</span>
      </nav>

      <header className="page-head">
        <div className="eyebrow">Topic</div>
        <h1>{entry.tag}</h1>
        <p>
          {entry.count.toLocaleString()} {entry.count === 1 ? "story" : "stories"} tagged “{entry.tag}”.
        </p>
        {related.length > 0 && (
          <div className="tagrow" style={{ borderTop: 0, margin: "18px 0 0", paddingTop: 0 }}>
            {related.map((r) => (
              <Link key={r.slug} className="tag" href={`/t/${r.slug}`}>
                {r.tag}
                {r.count ? <span style={{ color: "var(--muted)" }}> {r.count}</span> : null}
              </Link>
            ))}
          </div>
        )}
      </header>

      <section className="section" style={{ marginTop: 22 }}>
        <InfiniteFeed initial={items} total={total} tag={entry.slug} perPage={12} />
      </section>
    </div>
  );
}
